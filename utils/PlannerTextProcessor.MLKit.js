// utils/PlannerTextProcessor.js
import * as ImageManipulator from 'expo-image-manipulator';
import MlkitOcr from 'react-native-mlkit-ocr';
import TextNormalizer from './TextNormalizer';

export class PlannerTextProcessor {
  constructor(imageUri) {
    this.imageUri = imageUri;
    this.textNormalizer = new TextNormalizer();
    this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.blocks = [];  // Store blocks as class property
    
    this.recognized = {
      year: null,
      sections: [],
      metadata: {
        processedAt: new Date().toISOString(),
        timezone: this.timezone,
        confidence: 0
      }
    };

    // Add known names
    this.textNormalizer.addProperName('Rane');
  }

  async processPage() {
    try {
      console.log('Starting page processing...');
      const preparedImage = await this.prepareImage();
      
      // Store blocks in class property
      this.blocks = await MlkitOcr.detectFromUri(preparedImage.uri);
      console.log('OCR Result:', this.blocks);

      if (!this.blocks || this.blocks.length === 0) {
        throw new Error('No text was recognized');
      }

      // Find year in header
      const yearBlock = this.blocks.find(block => /^20\d{2}$/.test(block.text.trim()));
      if (yearBlock) {
        this.recognized.year = parseInt(yearBlock.text);
      }

      // Sort blocks by vertical position
      const sortedBlocks = [...this.blocks].sort((a, b) => a.bounding.top - b.bounding.top);

      let currentSection = null;

      // First pass: find sections
      sortedBlocks.forEach(block => {
        const text = block.text.trim();
        const dayHeaderMatch = text.match(/^(Monday|Tuesday|Wednesday),\s*(\d{1,2})\s*(January)/i);
        
        if (dayHeaderMatch) {
          currentSection = {
            day: dayHeaderMatch[1],
            date: parseInt(dayHeaderMatch[2]),
            month: dayHeaderMatch[3].toLowerCase(),
            events: [],
            bounds: block.bounding,
            topPosition: block.bounding.top
          };
          console.log(`Created new section: ${currentSection.day} at position ${currentSection.topPosition}`);
          this.recognized.sections.push(currentSection);
        }
      });

      // Second pass: process events
      sortedBlocks.forEach(block => {
        const text = block.text.trim();
        
        // Skip headers and metadata
        if (text.toLowerCase().includes('things to do') || 
            /^20\d{2}$/.test(text) ||
            /^(Monday|Tuesday|Wednesday),/.test(text)) {
          return;
        }

        // Find the appropriate section based on vertical position
        const section = this.findSectionForBlock(block);
        if (section) {
          this.processEventBlock(section, block);
        }
      });

      // Clean up and validate events
      this.recognized.sections.forEach(section => {
        section.events = section.events
          .filter(event => this.isValidEvent(event))
          .sort((a, b) => this.compareEventTimes(a.time, b.time));
        
        // Log events for debugging
        console.log(`Events for ${section.day}:`, section.events);
      });

      this.calculateConfidence();
      console.log('Final recognized data:', JSON.stringify(this.recognized, null, 2));
      return { success: true, data: this.recognized };

    } catch (error) {
      console.error('Text processing failed:', error);
      return { success: false, error: error.message };
    }
  }

  findSectionForBlock(block) {
    // Sort sections by vertical position
    const sortedSections = [...this.recognized.sections].sort((a, b) => a.topPosition - b.topPosition);
    
    // Find the first section where the block appears after the section header
    // but before the next section header
    for (let i = 0; i < sortedSections.length; i++) {
      const currentSection = sortedSections[i];
      const nextSection = sortedSections[i + 1];
      
      if (block.bounding.top >= currentSection.topPosition &&
          (!nextSection || block.bounding.top < nextSection.topPosition)) {
        return currentSection;
      }
    }
    return null;
  }

  processEventBlock(section, block) {
    const text = block.text.trim();
    console.log(`Processing block in ${section.day}:`, text);
    
    // Check for time patterns
    const timePatterns = [
      /^(\d{1,2}):(\d{2})\s*(am|pm)?$/i,    // Standard time
      /^q:(\d{2})\s*(am|pm)?$/i,            // 'q' for 9
      /^ioopm$/i,                           // Common OCR mistake for 1:00pm
      /^(\d{1,2})[\.:]0[mn]\s*(am|pm)?$/i   // Mistakes like 6.0m
    ];

    let time = null;
    let title = null;

    // Try to extract time and title
    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        time = this.normalizeTime(text);
        // Look for title in nearby blocks
        const nearbyBlocks = this.findNearbyBlocks(block);
        if (nearbyBlocks.length > 0) {
          title = this.textNormalizer.normalizeText(nearbyBlocks[0].text);
        }
        break;
      }
    }

    // If no time pattern found, check if it's a title
    if (!time && text.length > 0) {
      title = this.textNormalizer.normalizeText(text);
      // Try to find associated time in nearby blocks
      const nearbyBlocks = this.findNearbyBlocks(block);
      for (const nearbyBlock of nearbyBlocks) {
        const normalizedTime = this.normalizeTime(nearbyBlock.text);
        if (normalizedTime) {
          time = normalizedTime;
          break;
        }
      }
    }

    // If we have both time and title, add the event
    if (time && title) {
      section.events.push({
        time,
        title,
        bounds: block.bounding,
        confidence: block.confidence || 0.8
      });
      console.log(`Added event to ${section.day}:`, { time, title });
    }
  }

  normalizeTime(text) {
    // Common OCR corrections first
    text = text.toLowerCase()
      .replace('q', '9')           // q:00 → 9:00
      .replace('ioopm', '1:00pm')  // Common substitution
      .replace(/(\d)\.0[mn]/, '$1:00') // 6.0m → 6:00
      .replace(/[^\d:apm]/g, '');  // Remove any other non-time characters

    // Extract hours, minutes, and meridian
    const match = text.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm)?$/i);
    if (!match) return null;

    let [_, hours, minutes = '00', meridian = ''] = match;
    hours = parseInt(hours);
    minutes = parseInt(minutes);

    // Validate hours and minutes
    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;

    // Add meridian if missing
    if (!meridian) {
      meridian = hours < 6 || hours === 12 ? 'pm' : 'am';
    }

    return `${hours}:${minutes.toString().padStart(2, '0')}${meridian}`;
  }

  findNearbyBlocks(block, tolerance = 50) {
    // Find blocks that are nearby horizontally and within vertical tolerance
    return this.blocks
      .filter(b => b !== block &&
                  Math.abs(b.bounding.top - block.bounding.top) <= tolerance &&
                  Math.abs(b.bounding.left - block.bounding.left) <= block.bounding.width * 2)
      .sort((a, b) => Math.abs(a.bounding.top - block.bounding.top) - 
                      Math.abs(b.bounding.top - block.bounding.top));
  }

  isValidEvent(event) {
    return event.time && 
           event.title && 
           event.title.length > 1 &&
           !/^things to do$/i.test(event.title);
  }

  compareEventTimes(time1, time2) {
    const t1 = this.parseTimeString(time1);
    const t2 = this.parseTimeString(time2);
    return t1 - t2;
  }

  parseTimeString(timeStr) {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
    if (!match) return 0;

    let [_, hours, minutes, meridian] = match;
    hours = parseInt(hours);
    minutes = parseInt(minutes);

    if (meridian.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (meridian.toLowerCase() === 'am' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  async prepareImage() {
    try {
      console.log('Preparing image...');
      return await ImageManipulator.manipulateAsync(
        this.imageUri,
        [{ resize: { width: 2048 } }],
        { format: 'png', compress: 0.8 }
      );
    } catch (error) {
      console.error('Image preparation failed:', error);
      throw error;
    }
  }

  calculateConfidence() {
    let confidenceScores = [];
    
    this.recognized.sections.forEach(section => {
      section.events.forEach(event => {
        confidenceScores.push(event.confidence);
      });
    });

    this.recognized.metadata.confidence = confidenceScores.length > 0
      ? confidenceScores.reduce((a, b) => a + b) / confidenceScores.length
      : 0;
  }
}

export default PlannerTextProcessor;