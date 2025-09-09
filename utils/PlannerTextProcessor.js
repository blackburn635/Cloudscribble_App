// utils/PlannerTextProcessor.js
import { AzureVisionClient } from './AzureVisionClient';
import { TextNormalizer } from './TextNormalizer';
import { QRDecoder } from './QRDecoder';
import { Dimensions } from 'react-native';

export class PlannerTextProcessor {
  constructor(imageUri) {
    this.imageUri = imageUri;
    this.azureClient = new AzureVisionClient();
    this.textNormalizer = new TextNormalizer();
    this.qrDecoder = new QRDecoder();
    this.screenWidth = Dimensions.get('window').width;
    this.qrData = null;
    
    this.recognized = {
      sections: [],
      events: [],
      metadata: {
        processingDate: new Date().toISOString(),
        imageUri: imageUri,
        totalConfidence: 0
      }
    };
  }

  /**
   * Main processing method - SINGLE API TRANSACTION
   */
  async processPage() {
    try {
      console.log('Starting page processing with QR support (single transaction)');
      
      // Step 1: Process OCR (single API call)
      const ocrResult = await this.azureClient.recognizeText(this.imageUri);

      //Debugging code
      console.log('OCR Result structure:', JSON.stringify(ocrResult, null, 2));
      console.log('OCR Result keys:', Object.keys(ocrResult || {}));
      console.log('Success:', ocrResult?.success);
      console.log('Data length:', ocrResult?.data?.length);
      console.log('Blocks present:', !!ocrResult?.blocks);

      if (!ocrResult || !ocrResult.success || !ocrResult.data) {
        throw new Error('OCR processing failed or returned no data');
      }

      console.log('OCR processing complete, found', ocrResult.data.length, 'text blocks');

      // Step 2: Extract QR code from existing OCR results (NO ADDITIONAL API CALL)
      this.qrData = this.qrDecoder.processQRFromOCRResults(ocrResult, this.screenWidth);
      
      if (this.qrData) {
        console.log('QR code detected in OCR results:', {
          template: this.qrData.templateCode,
          pageType: this.qrData.isLeftPage ? 'left' : 'right',
          startDate: this.qrData.startDate,
          daysOnPage: this.qrData.daysOnPage
        });
        
        // Add QR metadata
        this.recognized.metadata.qrData = this.qrData;
        this.recognized.metadata.templateCode = this.qrData.templateCode;
        this.recognized.metadata.pageType = this.qrData.pageType;
        this.recognized.metadata.startDate = this.qrData.startDate;
        
        // Use QR-based template processing
        await this.processWithTemplate(ocrResult);
      } else {
        console.log('No QR code found, using fallback processing');
        await this.processFallback(ocrResult);
      }

      this.calculateConfidence();
      return { 
        success: true, 
        data: this.recognized,
        qrData: this.qrData,
        apiTransactions: 1
      };

    } catch (error) {
      console.error('Page processing failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process with QR template information
   */
  async processWithTemplate(ocrResult) {
    const { daysOnPage } = this.qrData;
    const pagedays = this.qrDecoder.getPageDayNames(this.qrData);
    
    console.log('Processing with template for', daysOnPage, 'days:', pagedays.map(d => d.dayName));

    // Create sections based on QR template data
    const pageHeight = ocrResult.data.reduce((max, block) => 
      Math.max(max, block.bounding?.bottom || 0), 0);
    
    // Divide page into equal sections for each day
    const sectionHeight = pageHeight / daysOnPage;
    
    for (let i = 0; i < daysOnPage; i++) {
      const dayInfo = pagedays[i];
      const topPosition = i * sectionHeight;
      const bottomPosition = (i + 1) * sectionHeight;
      
      const section = {
        day: dayInfo.dayName,
        shortDay: dayInfo.shortName,
        date: dayInfo.date,
        events: [],
        topPosition,
        bottomPosition,
        confidence: 0.8
      };
      
      this.recognized.sections.push(section);
    }

    // Process events using template-aware logic
    await this.processEventsWithTemplate(ocrResult.data);
  }

  /**
   * Fallback processing (original method)
   */
  async processFallback(ocrResult) {
    console.log('Using fallback processing (original method)');
    
    const relevantBlocks = ocrResult.data.filter(block => 
      !this.isQRCodeBlock(block)
    );

    const sortedBlocks = relevantBlocks
      .filter(block => block.text && block.bounding)
      .sort((a, b) => a.bounding.top - b.bounding.top);

    // Parse year from any date block
    let currentYear = new Date().getFullYear();
    let currentMonth = null;

    for (const block of sortedBlocks) {
      const parsedDate = this.parseDateFromText(block.text);
      if (parsedDate) {
        currentYear = parsedDate.year;
        if (!currentMonth) currentMonth = parsedDate.monthName;
      }
    }

    // Create sections based on detected day headers
    const dayPattern = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i;
    
    for (const block of sortedBlocks) {
      const dayMatch = block.text.match(dayPattern);
      if (dayMatch) {
        const parsedDate = this.parseDateFromText(block.text);
        
        const section = {
          day: dayMatch[1],
          shortDay: dayMatch[1].substring(0, 3),
          month: parsedDate ? parsedDate.monthName : currentMonth,
          date: parsedDate ? parsedDate.date : null,
          year: currentYear,
          events: [],
          topPosition: block.bounding.top,
          confidence: block.confidence || 0.8
        };
        
        this.recognized.sections.push(section);
      }
    }

    // Add metadata
    this.recognized.year = currentYear;
    this.recognized.metadata.year = currentYear;
    this.recognized.metadata.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Process events using original logic
    await this.processEventsOriginal(sortedBlocks);
  }

  /**
   * Process events with template information
   */
  async processEventsWithTemplate(blocks) {
    const relevantBlocks = blocks.filter(block => 
      block.text && 
      block.bounding &&
      !this.isQRCodeBlock(block) &&
      !this.isHeaderBlock(block.text)
    );

    for (const block of relevantBlocks) {
      const section = this.findSectionForBlock(block);
      if (section) {
        await this.processEventBlock(section, block);
      }
    }

    // Sort events within each section
    for (const section of this.recognized.sections) {
      section.events = section.events
        .filter(event => this.isValidEvent(event))
        .sort((a, b) => this.compareEventTimes(a.startTime || a.time, b.startTime || b.time));
    }
  }

  /**
   * Process events using original method  
   */
  async processEventsOriginal(sortedBlocks) {
    for (const block of sortedBlocks) {
      if (!block.text) continue;
      
      const text = block.text.trim();
      if (!text || 
          text.toLowerCase().includes('things to do') || 
          /^20\d{2}$/.test(text) || 
          /^(Monday|Tuesday|Wednesday),/.test(text) ||
          this.isQRCodeBlock(block)) {
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
  }

  /**
   * Process individual event block
   */
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

      if (timeInfo && description) {
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
          
          // Add date information if available from template
          if (section.date) {
            event.date = section.date;
          }
          
          section.events.push(event);
          console.log('Added event:', event);
        }
      }
    } catch (error) {
      console.error('Error processing event block:', error);
    }
  }

  /**
   * Normalize time range (e.g., "9:00-10:30am")
   */
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

  /**
   * Normalize individual time (e.g., "9:00am")
   */
  normalizeTime(text, context = '', inferredMeridian = '') {
    if (!text || typeof text !== 'string') {
      console.log('Invalid time input:', text);
      return null;
    }
  
    try {
      console.log('Normalizing time:', text, 'with context:', context);
      
      // Clean the input
      text = text.toLowerCase()
        .replace(/[^\d:apm]/g, '')
        .replace(/^\s+|\s+$/g, '');
  
      // Extract components
      const match = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
      if (!match) {
        console.log('No time match found for:', text);
        return null;
      }
  
      let [_, hours, minutes = '00', meridian] = match;
      hours = parseInt(hours);
      minutes = parseInt(minutes);
  
      // Use inferred meridian if not provided
      if (!meridian && inferredMeridian) {
        meridian = inferredMeridian;
      }
  
      // Validate hours
      if (hours < 1 || hours > 12) {
        console.log('Invalid hours:', hours);
        return null;
      }
  
      // Infer meridian if not provided
      if (!meridian) {
        meridian = this.inferMeridian(hours, context);
      }
  
      const normalizedTime = `${hours}:${minutes.toString().padStart(2, '0')}${meridian}`;
      console.log('Normalized time:', text, '=>', normalizedTime);
      return normalizedTime;
  
    } catch (error) {
      console.error('Time normalization error:', error);
      return null;
    }
  }

  /**
   * Infer AM/PM based on context and hour
   */
  inferMeridian(hours, context) {
    const lowerContext = context.toLowerCase();
    
    if (lowerContext.includes('lunch') || lowerContext.includes('dinner')) {
      return 'pm';
    } else if (lowerContext.includes('breakfast') || lowerContext.includes('morning')) {
      return 'am';
    } else if (hours >= 1 && hours <= 7) {
      return 'am'; // Early morning times
    } else if (hours >= 8 && hours <= 11) {
      return 'am'; // Business/school hours
    }
    
    return 'am'; // Default to AM
  }

  /**
   * Parse date from text like "Friday January 10, 2025"
   */
  parseDateFromText(text) {
    const dateMatch = text.match(/(\w+day)\s+(\w+)\s+(\d{1,2}),?\s+(\d{4})/i);
    if (dateMatch) {
      const [_, dayName, monthName, date, year] = dateMatch;
      return {
        dayName: dayName,
        monthName: monthName,
        date: parseInt(date),
        year: parseInt(year)
      };
    }
    return null;
  }

  /**
   * Find which section a text block belongs to
   */
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

  /**
   * Check if block is likely from QR code area
   */
  isQRCodeBlock(block) {
    if (!block.bounding || !block.text) return false;
    
    // Check if text is exactly 11 digits
    const cleanText = block.text.replace(/\s/g, '');
    const isElevenDigits = /^\d{11}$/.test(cleanText);
    
    // Check if in bottom area of image
    const isBottomArea = block.bounding.top > 0.75; // Bottom 25% of image
    
    // Check if in center horizontally
    const blockCenter = (block.bounding.left + block.bounding.right) / 2;
    const imageWidth = Math.max(...this.recognized.sections.map(s => s.topPosition || 0)) || 1000;
    const isCenter = Math.abs(blockCenter - imageWidth / 2) < imageWidth * 0.2; // Within 20% of center
    
    return isElevenDigits && isBottomArea && isCenter;
  }

  /**
   * Check if block is a header (day name, date, etc.)
   */
  isHeaderBlock(text) {
    const headerPatterns = [
      /^20\d{2}$/,
      /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i,
      /things to do/i,
      /^\d{1,2}\/\d{1,2}$/,
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i
    ];
    
    return headerPatterns.some(pattern => pattern.test(text.trim()));
  }

  /**
   * Validate if extracted text is a valid event
   */
  isValidEvent(event) {
    if (!event || 
        !((event.time && !event.hasTimeRange) || (event.startTime && event.endTime)) ||
        !event.title) {
      return false;
    }

    const title = event.title.trim();
    
    // Filter out invalid events
    if (
      // Too short
      title.length <= 1 ||
      
      // Single letters (weekday abbreviations: F, W, T, M, S)
      /^[A-Z]$/.test(title) ||
      
      // Pure numbers or number sequences (calendar dates)
      /^\d+$/.test(title.replace(/\s/g, '')) ||
      /^[\d\s]+$/.test(title) ||
      
      // Single symbols
      /^[^\w\s]$/.test(title) ||
      
      // Common non-event patterns
      /^things to do$/i.test(title) ||
      /^\d{11}$/.test(title.replace(/\s/g, '')) || // QR codes
      
      // Calendar month/date patterns
      /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)$/i.test(title) ||
      /^\d{1,2}\/\d{1,2}$/.test(title) ||
      
      // Time-only patterns (should have description)
      /^\d{1,2}(:\d{2})?\s*(am|pm)?$/i.test(title)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Compare two time strings for sorting
   */
  compareEventTimes(time1, time2) {
    return this.parseTimeString(time1) - this.parseTimeString(time2);
  }

  /**
   * Parse time string to minutes for comparison
   */
  parseTimeString(timeStr) {
    if (!timeStr) return 0;

    const match = timeStr.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
    if (!match) return 0;

    let [_, hours, minutes, meridian] = match;
    hours = parseInt(hours);
    minutes = parseInt(minutes);

    if (meridian.toLowerCase() === 'pm' && hours !== 12) {
      hours += 12;
    } else if (meridian.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  }

  /**
   * Calculate overall processing confidence
   */
  calculateConfidence() {
    if (this.recognized.sections.length === 0) {
      this.recognized.metadata.confidence = 0;
      return;
    }

    const totalEvents = this.recognized.sections.reduce((sum, section) => 
      sum + section.events.length, 0);
    
    if (totalEvents === 0) {
      this.recognized.metadata.totalConfidence = 0.3;
      return;
    }

    const avgEventConfidence = this.recognized.sections.reduce((sum, section) => {
      const sectionConfidence = section.events.reduce((eventSum, event) => 
        eventSum + event.confidence, 0) / (section.events.length || 1);
      return sum + sectionConfidence;
    }, 0) / this.recognized.sections.length;

    // Boost confidence if QR code was successfully processed
    const qrBonus = this.qrData ? 0.1 : 0;
    
    // Boost confidence if template expectations were met
    let templateBonus = 0;
    if (this.qrData && this.recognized.sections.length === this.qrData.daysOnPage) {
      templateBonus = 0.1;
    }
    
    this.recognized.metadata.confidence = Math.min(
      avgEventConfidence + qrBonus + templateBonus, 
      1.0
    );
    
    console.log('Total confidence calculated:', this.recognized.metadata.confidence);
  }
}