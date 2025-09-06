// utils/PlannerTemplate.js

class PlannerTemplate {
    constructor(imageWidth, imageHeight, anchors) {
      this.imageWidth = imageWidth;
      this.imageHeight = imageHeight;
      this.anchors = anchors;
      
      // Define standard regions relative to anchor points
      this.regions = this.calculateRegions();
      
      // Define expected content patterns
      this.patterns = {
        date: /(?:week of|week|date:?)\s*([A-Za-z]+\s+\d{1,2}(?:[,-]\s*\d{1,2})?)/i,
        time: /(\d{1,2}[:\.]\d{2}\s*(?:am|pm)?)/i,
        dayHeader: /^(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*\s*\d{1,2}(?:th|st|nd|rd)?$/i
      };
    }
  
    calculateRegions() {
      const { topLeft, bottomRight } = this.anchors;
      
      // Calculate page dimensions based on anchor marks
      const pageWidth = bottomRight.x - topLeft.x;
      const pageHeight = bottomRight.y - topLeft.y;
      
      // Define relative positions of key regions
      return {
        header: {
          top: topLeft.y,
          left: topLeft.x + (pageWidth * 0.1),
          width: pageWidth * 0.8,
          height: pageHeight * 0.1,
          type: 'header'
        },
        dayColumns: Array.from({ length: 7 }, (_, i) => ({
          top: topLeft.y + (pageHeight * 0.15),
          left: topLeft.x + (pageWidth * (i / 7)),
          width: pageWidth / 7,
          height: pageHeight * 0.85,
          type: 'day',
          dayIndex: i
        })),
        hourRows: Array.from({ length: 24 }, (_, i) => ({
          top: topLeft.y + (pageHeight * 0.15) + (pageHeight * 0.85 * (i / 24)),
          left: topLeft.x,
          width: pageWidth,
          height: (pageHeight * 0.85) / 24,
          type: 'hour',
          hour: i
        }))
      };
    }
  
    mapTextToRegions(recognizedBlocks) {
      const mappedContent = {
        header: null,
        days: Array(7).fill().map(() => ({
          dayHeader: null,
          events: []
        }))
      };
  
      recognizedBlocks.forEach(block => {
        const { text, bounding } = block;
        const region = this.findMatchingRegion(bounding);
  
        if (!region) return;
  
        switch (region.type) {
          case 'header':
            const dateMatch = text.match(this.patterns.date);
            if (dateMatch) {
              mappedContent.header = {
                date: dateMatch[1],
                confidence: this.calculateConfidence(text, 'date')
              };
            }
            break;
  
          case 'day':
            if (this.patterns.dayHeader.test(text)) {
              mappedContent.days[region.dayIndex].dayHeader = {
                text: text.trim(),
                confidence: this.calculateConfidence(text, 'day')
              };
            } else {
              const timeMatch = text.match(this.patterns.time);
              if (timeMatch) {
                mappedContent.days[region.dayIndex].events.push({
                  time: timeMatch[1],
                  text: text.replace(timeMatch[0], '').trim(),
                  hour: this.getHourFromBounds(bounding),
                  confidence: this.calculateConfidence(text, 'event')
                });
              }
            }
            break;
        }
      });
  
      return this.validateAndCleanMapping(mappedContent);
    }
  
    findMatchingRegion(bounds) {
      // Find the best matching region for the given text bounds
      const centerX = bounds.left + (bounds.width / 2);
      const centerY = bounds.top + (bounds.height / 2);
  
      // Check header region first
      if (this.isPointInRegion(centerX, centerY, this.regions.header)) {
        return this.regions.header;
      }
  
      // Find matching day column
      const dayColumn = this.regions.dayColumns.find(col => 
        this.isPointInRegion(centerX, centerY, col)
      );
  
      if (dayColumn) {
        return dayColumn;
      }
  
      return null;
    }
  
    isPointInRegion(x, y, region) {
      return (
        x >= region.left &&
        x <= region.left + region.width &&
        y >= region.top &&
        y <= region.top + region.height
      );
    }
  
    getHourFromBounds(bounds) {
      const centerY = bounds.top + (bounds.height / 2);
      
      // Find matching hour row
      const hourRow = this.regions.hourRows.find(row =>
        this.isPointInRegion(bounds.left, centerY, row)
      );
  
      return hourRow ? hourRow.hour : null;
    }
  
    calculateConfidence(text, type) {
      // Basic confidence scoring based on text patterns
      switch (type) {
        case 'date':
          return this.patterns.date.test(text) ? 0.9 : 0.5;
        case 'day':
          return this.patterns.dayHeader.test(text) ? 0.9 : 0.5;
        case 'event':
          return this.patterns.time.test(text) ? 0.8 : 0.6;
        default:
          return 0.5;
      }
    }
  
    validateAndCleanMapping(mappedContent) {
      // Validate and clean the mapped content
      const cleaned = {
        ...mappedContent,
        days: mappedContent.days.map(day => ({
          ...day,
          events: day.events
            .filter(event => event.text && event.time) // Remove empty events
            .sort((a, b) => { // Sort by hour
              const hourA = this.parseHour(a.time);
              const hourB = this.parseHour(b.time);
              return hourA - hourB;
            })
        }))
      };
  
      // Calculate overall confidence
      const confidenceScores = [
        cleaned.header ? cleaned.header.confidence : 0,
        ...cleaned.days
          .flatMap(day => [
            day.dayHeader ? day.dayHeader.confidence : 0,
            ...day.events.map(event => event.confidence)
          ])
      ];
  
      const averageConfidence = confidenceScores.reduce((a, b) => a + b, 0) / 
                               confidenceScores.length;
  
      return {
        ...cleaned,
        metadata: {
          confidence: averageConfidence,
          processedAt: new Date().toISOString()
        }
      };
    }
  
    parseHour(timeStr) {
      const match = timeStr.match(/(\d{1,2})[:\.]\d{2}\s*(am|pm)?/i);
      if (!match) return 0;
  
      let hour = parseInt(match[1]);
      const meridian = match[2]?.toLowerCase();
  
      if (meridian === 'pm' && hour < 12) hour += 12;
      if (meridian === 'am' && hour === 12) hour = 0;
  
      return hour;
    }
  }
  
  export default PlannerTemplate;