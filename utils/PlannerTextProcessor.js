// utils/PlannerTextProcessor.js
import * as ImageManipulator from 'expo-image-manipulator';
import AzureVisionClient from './AzureVisionClient';
import TextNormalizer from './TextNormalizer';

export class PlannerTextProcessor {
  constructor(imageUri) {
    this.imageUri = imageUri;
    this.textNormalizer = new TextNormalizer();
    this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.blocks = [];
    
    // Event keywords that suggest time of day
    this.timeKeywords = {
      morning: ['breakfast', 'morning', 'school starts', 'class starts'],
      afternoon: ['lunch', 'afternoon', 'school ends', 'dismissal'],
      evening: ['dinner', 'evening', 'practice', 'workout', 'training']
    };
    
    this.recognized = {
      year: null,
      sections: [],
      metadata: {
        processedAt: new Date().toISOString(),
        timezone: this.timezone,
        confidence: 0
      }
    };
  }

  async processPage() {
    try {
      console.log('Starting page processing...');
      const preparedImage = await this.prepareImage();
      
      const azureClient = new AzureVisionClient();
      const result = await azureClient.recognizeText(preparedImage.uri);
      
      if (!result.success || !result.data || !Array.isArray(result.data)) {
        console.error('Invalid Azure Vision result:', result);
        throw new Error('Failed to get valid text recognition results');
      }

      this.blocks = result.data;
      console.log('Processing blocks:', this.blocks.length);

      // Find year in header
      const yearBlock = this.blocks.find(block => 
        block.text && /^20\d{2}$/.test(block.text.trim())
      );
      
      if (yearBlock) {
        this.recognized.year = parseInt(yearBlock.text);
      }

      // Sort blocks by vertical position
      const sortedBlocks = [...this.blocks].sort((a, b) => {
        const aTop = a.bounding?.top || 0;
        const bTop = b.bounding?.top || 0;
        return aTop - bTop;
      });

      // Process sections
      for (const block of sortedBlocks) {
        if (!block.text) continue;
        
        const text = block.text.trim();
        const dayHeaderMatch = text.match(/^(Monday|Tuesday|Wednesday),\s*(\d{1,2})\s*(January)/i);
        
        if (dayHeaderMatch) {
          const section = {
            day: dayHeaderMatch[1],
            date: parseInt(dayHeaderMatch[2]),
            month: dayHeaderMatch[3].toLowerCase(),
            events: [],
            bounds: block.bounding || null,
            topPosition: block.bounding?.top || 0
          };
          console.log(`Created section: ${section.day}`, JSON.stringify(section, null, 2));
          this.recognized.sections.push(section);
        }
      }

      // Process events
      for (const block of sortedBlocks) {
        if (!block.text) continue;
        
        const text = block.text.trim();
        if (!text || text.toLowerCase().includes('things to do') || 
            /^20\d{2}$/.test(text) || 
            /^(Monday|Tuesday|Wednesday),/.test(text)) {
          continue;
        }

        const section = this.findSectionForBlock(block);
        if (section) {
          await this.processEventBlock(section, block);
        }
      }

      // Sort and clean events
      for (const section of this.recognized.sections) {
        section.events = section.events
          .filter(event => this.isValidEvent(event))
          .sort((a, b) => this.compareEventTimes(a.startTime || a.time, b.startTime || b.time));
      }

      this.calculateConfidence();
      return { success: true, data: this.recognized };

    } catch (error) {
      console.error('Text processing failed:', error);
      return { success: false, error: error.message };
    }
  }

  async processEventBlock(section, block) {
    try {
      const text = block.text.trim();
      console.log(`Processing event in ${section.day}:`, text);

      const timeRangeMatch = text.match(/^(\d{1,2})(?::(\d{2}))?\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
      const parts = text.split(/\s+/);
      let timeInfo, description;

      if (timeRangeMatch) {
        // Handle time range format
        const timeRangeStr = timeRangeMatch[0];
        description = text.slice(timeRangeStr.length).trim();
        timeInfo = this.normalizeTimeRange(timeRangeStr, description);
      } else {
        // Handle single time format
        const timeStr = parts[0];
        description = parts.slice(1).join(' ');
        const normalizedTime = this.normalizeTime(timeStr, description);
        if (normalizedTime) {
          timeInfo = { time: normalizedTime };
        }
      }

      if (timeInfo) {
        const normalizedDescription = this.textNormalizer.normalizeText(description);
        console.log('Normalized description:', description, '=>', normalizedDescription);

        if (normalizedDescription) {
          const event = {
            title: normalizedDescription,
            bounds: block.bounding,
            confidence: block.confidence || 0.8,
            ...(timeInfo.hasTimeRange 
              ? { 
                  startTime: timeInfo.startTime,
                  endTime: timeInfo.endTime,
                  hasTimeRange: true
                }
              : { time: timeInfo.time })
          };
          section.events.push(event);
          console.log('Added event:', event);
        }
      }
    } catch (error) {
      console.error('Error processing event block:', error);
    }
  }

  normalizeTimeRange(text, context = '') {
    console.log('Normalizing time range:', text, 'with context:', context);
    
    // Clean the input
    text = text.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^\d:apm-]/g, '');

    // Split into start and end times
    const [startStr, endStr] = text.split('-');
    if (!startStr || !endStr) return null;

    // Handle meridian indicator
    const meridianMatch = endStr.match(/(am|pm)$/);
    const meridian = meridianMatch ? meridianMatch[1] : '';

    // Parse start time
    const startTime = this.normalizeTime(startStr, context, meridian);
    if (!startTime) return null;

    // Parse end time, using the same meridian if not specified
    const endTime = this.normalizeTime(endStr, context);
    if (!endTime) return null;

    return {
      startTime,
      endTime,
      hasTimeRange: true
    };
  }

  normalizeTime(text, context = '', inferredMeridian = '') {
    if (!text || typeof text !== 'string') {
      console.log('Invalid time input:', text);
      return null;
    }
  
    try {
      console.log('Normalizing time:', text, 'with context:', context);
      
      // Clean the input
      text = text.toLowerCase()
        .replace(/[^\d:apm]/g, '')  // Remove any non-time characters
        .replace(/^\s+|\s+$/g, ''); // Trim whitespace
  
      // Extract components
      const match = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
      if (!match) {
        console.log('No time match found');
        return null;
      }
  
      let [_, hours, minutes = '00', meridian = ''] = match;
      hours = parseInt(hours);
      minutes = parseInt(minutes);
  
      // Validate components
      if (isNaN(hours) || isNaN(minutes) || hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
        console.log('Invalid time components:', { hours, minutes });
        return null;
      }
  
      // Use provided meridian if available, otherwise infer it
      if (!meridian) {
        meridian = inferredMeridian || this.inferMeridian(hours, context);
      }
  
      // Return as a properly formatted string
      return `${hours}:${minutes.toString().padStart(2, '0')}${meridian}`;
    } catch (error) {
      console.error('Time normalization error:', error);
      return null;
    }
  }

  inferMeridian(hours, context) {
    // First check context keywords
    const contextLower = context.toLowerCase();
    if (this.timeKeywords.morning.some(word => contextLower.includes(word))) {
      return 'am';
    } else if (this.timeKeywords.afternoon.some(word => contextLower.includes(word))) {
      return 'pm';
    } else if (this.timeKeywords.evening.some(word => contextLower.includes(word))) {
      return 'pm';
    }

    // Use business hours pattern if no context clues
    if (hours === 12) {
      return 'pm'; // 12:00 is typically noon during business hours
    } else if (hours >= 1 && hours <= 5) {
      return 'pm'; // 1:00-5:00 are typically PM during business/school hours
    } else if (hours >= 6 && hours <= 7) {
      return 'am'; // 6:00-7:00 morning activities
    } else if (hours >= 8 && hours <= 11) {
      return 'am'; // 8:00-11:00 are typically AM during business/school hours
    }
    
    return 'am'; // Default to AM for edge cases
  }

  findSectionForBlock(block) {
    if (!block.bounding?.top) return null;
  
    // Sort sections by vertical position
    const sortedSections = [...this.recognized.sections]
      .sort((a, b) => a.topPosition - b.topPosition);
  
    // Find the appropriate section based on vertical position
    for (let i = 0; i < sortedSections.length; i++) {
      const currentSection = sortedSections[i];
      const nextSection = sortedSections[i + 1];
      
      if (nextSection) {
        if (block.bounding.top >= currentSection.topPosition && 
            block.bounding.top < nextSection.topPosition) {
          return currentSection;
        }
      } else {
        if (block.bounding.top >= currentSection.topPosition) {
          return currentSection;
        }
      }
    }
    return null;
  }

  isValidEvent(event) {
    return event && 
           ((event.time && !event.hasTimeRange) || (event.startTime && event.endTime)) && 
           event.title && 
           event.title.length > 1 && 
           !/^things to do$/i.test(event.title);
  }

  compareEventTimes(time1, time2) {
    return this.parseTimeString(time1) - this.parseTimeString(time2);
  }

  parseTimeString(timeStr) {
    if (!timeStr) return 0;

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
      
      // First try with moderate compression
      let result = await ImageManipulator.manipulateAsync(
        this.imageUri,
        [{ resize: { width: 1500 } }],
        { format: 'jpeg', compress: 0.5 }
      );
      
      // Get the blob to check size
      const response = await fetch(result.uri);
      let blob = await response.blob();
      let size = blob.size / (1024 * 1024);
      console.log('Initial image size:', size.toFixed(2) + 'MB');
  
      // If still too large, compress more aggressively
      if (size > 3.5) {
        result = await ImageManipulator.manipulateAsync(
          this.imageUri,
          [{ resize: { width: 1200 } }],
          { format: 'jpeg', compress: 0.3 }
        );
        const response2 = await fetch(result.uri);
        blob = await response2.blob();
        size = blob.size / (1024 * 1024);
        console.log('Compressed image size:', size.toFixed(2) + 'MB');
      }
  
      if (size > 4) {
        throw new Error('Unable to compress image below 4MB limit');
      }
  
      return result;
    } catch (error) {
      console.error('Image preparation failed:', error);
      throw error;
    }
  }

  calculateConfidence() {
    const confidenceScores = this.recognized.sections
      .flatMap(section => section.events)
      .map(event => event.confidence)
      .filter(score => typeof score === 'number');

    this.recognized.metadata.confidence = confidenceScores.length > 0
      ? confidenceScores.reduce((a, b) => a + b) / confidenceScores.length
      : 0;
  }
}

export default PlannerTextProcessor;