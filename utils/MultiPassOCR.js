// utils/MultiPassOCR.js
import * as ImageManipulator from 'expo-image-manipulator';
import MlkitOcr from 'react-native-mlkit-ocr';

class TextNormalizer {
  constructor() {
    this.corrections = {
      // Month corrections
      'jaraarg': 'january',
      'janary': 'january',
      'uaraary': 'january',
      'jaruary': 'january',
      
      // Day corrections
      'moeday': 'monday',
      'moedey': 'monday',
      'tusday': 'tuesday',
      'wodesly': 'wednesday',
      'tharsday': 'thursday',
      'frday': 'friday',
      'satarday': 'saturday',
      'sarday': 'sunday',
      
      // Time corrections
      'soo': '5:00',
      'jo:0': '10:00',
      'jo:00': '10:00',
      
      // Common word corrections
      'stets': 'starts',
      'sekool': 'school',
      'shasl': 'school',
      'octor': 'doctor',
      'eetin': 'meeting',
      'pradke': 'practice',
      'prake': 'practice',
      'dache': 'practice',
      'rane': 'rain',
      'goll': 'golf',
      'luh': 'lunch',
      'ypt': 'appt',
      'aot': 'appt'
    };
  }

  normalizeText(text) {
    if (!text) return '';
    
    // First strip out the repeating 1:00 pattern
    let normalized = text.replace(/\s*1:00\s*/g, ' ');
    
    // Initial cleaning
    normalized = normalized.toLowerCase()
      .replace(/[^\w\s\-:\.]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Fix common OCR mistakes in times
    normalized = normalized
      // Fix time separator issues
      .replace(/(\d+)[:\.](\d+)/g, '$1:$2')
      // Fix missing colons in times
      .replace(/(\d{1,2})(\d{2})(am|pm)/gi, '$1:$2$3')
      // Add minutes to bare hours with meridian
      .replace(/(\d{1,2})([ap]m)/gi, '$1:00$2')
      // Fix common number mistakes
      .replace(/\|/g, '1')
      .replace(/l(?=\d)/g, '1')
      .replace(/i(?=\d)/g, '1')
      .replace(/o(?=\d)/g, '0')
      .replace(/O(?=\d)/g, '0')
      // Fix meridian indicators
      .replace(/([ap])n/gi, '$1m')
      .replace(/(\d+)p\b/gi, '$1pm')
      .replace(/(\d+)a\b/gi, '$1am');

    // Join split times back together
    normalized = normalized.replace(/(\d{1,2})\s*:\s*(\d{2})\s*(am|pm)?/gi, '$1:$2$3');

    // Apply word corrections
    Object.entries(this.corrections).forEach(([incorrect, correct]) => {
      const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
      normalized = normalized.replace(regex, correct);
    });

    return normalized;
  }
}

class MultiPassOCR {
  constructor() {
    this.normalizer = new TextNormalizer();
    this.preprocessingPasses = [
      {
        name: 'original',
        operations: [
          { resize: { width: 2048 } }
        ]
      },
      {
        name: 'rotated-slight-right',
        operations: [
          { resize: { width: 2048 } },
          { rotate: 0.5 }
        ]
      },
      {
        name: 'rotated-slight-left',
        operations: [
          { resize: { width: 2048 } },
          { rotate: -0.5 }
        ]
      }
    ];
  }

  async processImage(imageUri) {
    try {
      console.log('Starting multi-pass OCR processing...');
      
      // Run OCR on different versions of the image
      const results = await Promise.all(
        this.preprocessingPasses.map(pass => 
          this.runOCRPass(imageUri, pass)
        )
      );

      // Filter out empty results and merge
      const validResults = results.filter(result => result && result.length > 0);
      
      if (validResults.length === 0) {
        throw new Error('No valid OCR results obtained');
      }

      // Merge and normalize results
      const mergedResults = this.mergeResults(validResults);

      // Debug output
      console.log('Normalized blocks:');
      mergedResults.forEach(block => {
        console.log(`Original: "${block.originalText}"`);
        console.log(`Normalized: "${block.text}"`);
      });
      
      return {
        success: true,
        data: mergedResults
      };
    } catch (error) {
      console.error('Multi-pass OCR failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async runOCRPass(imageUri, pass) {
    try {
      console.log(`Running OCR pass: ${pass.name}`);
      
      const preparedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        pass.operations,
        { format: 'png', compress: 0.9 }
      );

      const ocrResult = await MlkitOcr.detectFromUri(preparedImage.uri);

      const normalizedBlocks = ocrResult.map(block => ({
        ...block,
        originalText: block.text,
        text: this.normalizer.normalizeText(block.text),
        passName: pass.name,
        confidence: this.calculateConfidence(block.text)
      }));

      return normalizedBlocks;
    } catch (error) {
      console.error(`OCR pass ${pass.name} failed:`, error);
      return null;
    }
  }

  // ... (rest of the class methods remain the same)


  calculateConfidence(text) {
    let confidence = 0.5;
    
    // Increase confidence for well-formed text
    if (text.length > 3) confidence += 0.1;
    if (/^[a-z0-9\s]+$/i.test(text)) confidence += 0.1;
    if (/\d{1,2}:\d{2}/.test(text)) confidence += 0.2;
    if (/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(text)) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }

  mergeResults(results) {
    const allBlocks = results.flat();
    const groupedBlocks = this.groupSimilarBlocks(allBlocks);
    return groupedBlocks.map(group => this.selectBestBlock(group));
  }

  groupSimilarBlocks(blocks) {
    const groups = [];
    
    blocks.forEach(block => {
      const similarGroup = groups.find(group =>
        this.areBlocksSimilar(block, group[0])
      );
      
      if (similarGroup) {
        similarGroup.push(block);
      } else {
        groups.push([block]);
      }
    });

    return groups;
  }

  areBlocksSimilar(block1, block2) {
    const positionThreshold = 20;
    const positionSimilar = Math.abs(block1.bounding.top - block2.bounding.top) < positionThreshold &&
                           Math.abs(block1.bounding.left - block2.bounding.left) < positionThreshold;

    const similarityThreshold = 0.7;
    const textSimilarity = this.calculateTextSimilarity(block1.text, block2.text);

    return positionSimilar && textSimilarity > similarityThreshold;
  }

  calculateTextSimilarity(text1, text2) {
    const maxLen = Math.max(text1.length, text2.length);
    if (maxLen === 0) return 1.0;
    
    const distance = this.levenshteinDistance(text1, text2);
    return 1 - (distance / maxLen);
  }

  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill().map(() => 
      Array(str1.length + 1).fill(0)
    );
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i-1] === str2[j-1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j-1][i] + 1,
          matrix[j][i-1] + 1,
          matrix[j-1][i-1] + cost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  selectBestBlock(group) {
    const sorted = [...group].sort((a, b) => {
      // Prioritize results with better confidence
      if (Math.abs(b.confidence - a.confidence) > 0.1) {
        return b.confidence - a.confidence;
      }
      
      // If confidence is similar, prefer original over rotated
      if (a.passName !== b.passName) {
        if (a.passName === 'original') return -1;
        if (b.passName === 'original') return 1;
      }
      
      // If still tied, prefer the one with more text
      return b.text.length - a.text.length;
    });

    return sorted[0];
  }

  // utils/MultiPassOCR.js
// ... (previous imports and class definitions)

normalizeText(text) {
    if (!text) return '';
    
    // First remove the duplicated 1:00 pattern that's appearing everywhere
    let normalized = text.replace(/1:00/g, ' ');
    
    // Initial cleaning
    normalized = normalized.toLowerCase()
      .replace(/[^\w\s\-:\.]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Handle common time formats first
    normalized = normalized
      .replace(/(\d)[:\.]\s*(\d{2})\s*(am|pm)?/gi, '$1:$2$3')  // Normalize standard times
      .replace(/(\d{1,2})(\d{2})(am|pm)/gi, '$1:$2$3')         // Fix joined times like 800am
      .replace(/(\d)([ap])m/gi, '$1:00$2m')                     // Add minutes to bare hours
      .replace(/(\d{1,2})(\d{2})/g, (_, h, m) => {             // Handle military time
        const hour = parseInt(h);
        if (hour >= 0 && hour <= 23) {
          return `${hour}:${m}`;
        }
        return `${h}${m}`;
      });

    // Fix common OCR mistakes
    normalized = normalized
      .replace(/\|/g, '1')                 // Fix vertical bar as '1'
      .replace(/l(?=\d)/g, '1')           // Fix 'l' as '1' when before numbers
      .replace(/O(?=\d)/g, '0')           // Fix 'O' as '0' when before numbers
      .replace(/(?<=\d)O/g, '0')          // Fix 'O' as '0' when after numbers
      .replace(/o(?=\d)/g, '0')           // Fix 'o' as '0' when before numbers
      .replace(/(?<=\d)o/g, '0')          // Fix 'o' as '0' when after numbers
      .replace(/i(?=\d)/g, '1')           // Fix 'i' as '1' when before numbers
      .replace(/si/g, '5')                // Fix 'si' as '5'
      .replace(/jo/g, '10')               // Fix 'jo' as '10'
      .replace(/pn/g, 'pm')               // Fix 'pn' as 'pm'
      .replace(/an/g, 'am');              // Fix 'an' as 'am'

    // Apply word corrections from the corrections map
    Object.entries(this.corrections).forEach(([incorrect, correct]) => {
      const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
      normalized = normalized.replace(regex, correct);
    });

    return normalized;
  }
}


export default MultiPassOCR;