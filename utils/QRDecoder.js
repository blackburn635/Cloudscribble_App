// utils/QRDecoder.js - Optimized Single-Transaction Version
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Cost-Optimized QR Code Decoder
 * Uses existing OCR data to find QR codes - NO ADDITIONAL API CALLS!
 */
export class QRDecoder {
  constructor() {
    this.templateFormats = {
      '01': {
        name: 'Standard Weekly',
        leftPageDays: 4,  // Monday-Thursday
        rightPageDays: 3, // Friday-Sunday
        sections: ['calendar', 'todos']
      }
    };
  }

  /**
   * Extract QR code from existing OCR results (NO ADDITIONAL API CALL)
   */
  extractQRFromOCRResults(ocrResult, screenWidth) {
    try {
      console.log('Looking for QR code in existing OCR results...');
      
      if (!ocrResult || !ocrResult.blocks) {
        return null;
      }

      // Calculate expected QR position (bottom center)
      const qrBoxSize = screenWidth / 8;
      const expectedQRBottom = 0.92; // 8% from bottom = 92% from top
      const expectedQRTop = expectedQRBottom - (qrBoxSize / screenWidth) * (8.5 / 11); // Adjust for aspect ratio
      const expectedQRLeft = 0.4375; // Center - half box width (1/8 / 2 = 1/16 = 0.0625, so 0.5 - 0.0625)
      const expectedQRRight = 0.5625; // Center + half box width

      console.log('Expected QR position:', {
        top: expectedQRTop,
        bottom: expectedQRBottom,
        left: expectedQRLeft,
        right: expectedQRRight
      });

      // Look for text blocks in the QR area
      const qrCandidates = [];

      for (const block of ocrResult.blocks) {
        if (!block.bounding || !block.text) continue;

        // Normalize bounding box to 0-1 coordinates
        const normalizedBounds = this.normalizeBoundingBox(block.bounding, ocrResult);
        
        // Check if block is in QR area
        if (this.isInQRArea(normalizedBounds, expectedQRTop, expectedQRBottom, expectedQRLeft, expectedQRRight)) {
          console.log('Found text in QR area:', block.text, 'at position:', normalizedBounds);
          qrCandidates.push(block.text);
        }
      }

      // Try to find valid QR code in candidates
      for (const candidate of qrCandidates) {
        if (this.isValidQRFormat(candidate)) {
          console.log('Valid QR code found in OCR results:', candidate);
          return this.parseQRData(candidate);
        }

        // Look for 11-digit pattern within the text
        const digitMatch = candidate.match(/\d{11}/);
        if (digitMatch && this.isValidQRFormat(digitMatch[0])) {
          console.log('QR code pattern found:', digitMatch[0]);
          return this.parseQRData(digitMatch[0]);
        }
      }

      // Fallback: look for 11-digit patterns anywhere in the OCR results
      const allText = ocrResult.blocks.map(b => b.text).join('').replace(/\s/g, '');
      const digitMatch = allText.match(/\d{11}/);
      if (digitMatch && this.isValidQRFormat(digitMatch[0])) {
        console.log('QR code pattern found in full OCR text:', digitMatch[0]);
        return this.parseQRData(digitMatch[0]);
      }

      console.log('No QR code found in OCR results');
      return null;
    } catch (error) {
      console.error('QR extraction from OCR error:', error);
      return null;
    }
  }

  /**
   * Normalize bounding box coordinates to 0-1 scale
   */
  normalizeBoundingBox(bounding, ocrResult) {
    // Find image dimensions from OCR result metadata or use bounding box extremes
    const maxRight = Math.max(...ocrResult.blocks.map(b => b.bounding?.right || 0));
    const maxBottom = Math.max(...ocrResult.blocks.map(b => b.bounding?.bottom || 0));

    return {
      top: bounding.top / maxBottom,
      bottom: bounding.bottom / maxBottom,
      left: bounding.left / maxRight,
      right: bounding.right / maxRight
    };
  }

  /**
   * Check if bounding box is in QR area
   */
  isInQRArea(bounds, expectedTop, expectedBottom, expectedLeft, expectedRight) {
    const tolerance = 0.1; // 10% tolerance

    return (
      bounds.top >= expectedTop - tolerance &&
      bounds.bottom <= expectedBottom + tolerance &&
      bounds.left >= expectedLeft - tolerance &&
      bounds.right <= expectedRight + tolerance
    );
  }

  /**
   * Check if text matches QR format
   */
  isValidQRFormat(text) {
    if (!text || typeof text !== 'string') return false;
    
    const digits = text.replace(/\D/g, '');
    if (digits.length !== 11) return false;
    
    const templateCode = digits.substring(0, 2);
    return this.templateFormats.hasOwnProperty(templateCode);
  }

  /**
   * Parse QR data string into structured format
   */
  parseQRData(qrString) {
    try {
      const cleanString = qrString.replace(/\D/g, '');
      console.log('Parsing QR data:', cleanString);
      
      if (cleanString.length !== 11) {
        throw new Error(`Invalid QR format. Expected 11 digits, got ${cleanString.length}`);
      }

      const templateCode = cleanString.substring(0, 2);
      const pageType = parseInt(cleanString.substring(2, 3));
      const year = parseInt(cleanString.substring(3, 7));
      const month = parseInt(cleanString.substring(7, 9));
      const day = parseInt(cleanString.substring(9, 11));

      if (!this.templateFormats[templateCode]) {
        throw new Error(`Unknown template code: ${templateCode}`);
      }

      if (pageType !== 0 && pageType !== 1) {
        throw new Error(`Invalid page type: ${pageType}`);
      }

      const startDate = new Date(year, month - 1, day);
      if (isNaN(startDate.getTime())) {
        throw new Error(`Invalid date: ${year}-${month}-${day}`);
      }

      const template = this.templateFormats[templateCode];
      const isLeftPage = pageType === 0;

      const result = {
        templateCode,
        template,
        pageType,
        isLeftPage,
        isRightPage: !isLeftPage,
        startDate,
        year,
        month,
        day,
        daysOnPage: isLeftPage ? template.leftPageDays : template.rightPageDays,
        sections: template.sections,
        raw: cleanString
      };

      console.log('QR data parsed successfully:', result);
      return result;
    } catch (error) {
      console.error('QR parsing error:', error);
      throw error;
    }
  }

  /**
   * Main method - uses existing OCR results (NO ADDITIONAL API CALL)
   */
  processQRFromOCRResults(ocrResult, screenWidth) {
    try {
      console.log('Processing QR from existing OCR results...');
      
      const qrData = this.extractQRFromOCRResults(ocrResult, screenWidth);
      
      if (!qrData) {
        console.log('No QR code found in OCR results');
        return null;
      }
      
      const result = {
        ...qrData,
        processingTimestamp: new Date().toISOString(),
        source: 'main_ocr' // Indicates this came from main OCR, not separate call
      };

      console.log('QR processing complete from OCR results:', result);
      return result;
    } catch (error) {
      console.error('QR processing from OCR failed:', error);
      return null;
    }
  }

  /**
   * Get date range for the page
   */
  getPageDateRange(qrData) {
    const { startDate, daysOnPage } = qrData;
    const dates = [];
    
    for (let i = 0; i < daysOnPage; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  }

  /**
   * Get day names for the page
   */
  getPageDayNames(qrData) {
    const dates = this.getPageDateRange(qrData);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return dates.map(date => ({
      date,
      dayName: dayNames[date.getDay()],
      shortName: dayNames[date.getDay()].substring(0, 3)
    }));
  }
}