// utils/PlannerTemplateDefinition.js

class PlannerTemplateDefinition {
    constructor(imageWidth, imageHeight) {
      this.imageWidth = imageWidth;
      this.imageHeight = imageHeight;
      
      // Define grid dimensions
      this.grid = {
        columns: 4,
        rows: 3,
        headerHeight: 10, // 10% of total height
      };
  
      // Calculate single cell dimensions
      const cellWidth = 100 / this.grid.columns;  // percentage of total width
      const cellHeight = (100 - this.grid.headerHeight) / this.grid.rows; // percentage of remaining height
  
      // Define layout structure
      this.layout = {
        header: {
          top: 0,
          left: 0,
          width: 50, // Only 50% of image width
          height: this.grid.headerHeight,
          type: 'header',
          expectedContent: ['month', 'date range', 'year']
        },
  
        // Define day regions with specific grid positions
        days: {
          monday: {
            name: 'Monday',
            column: 1,
            row: 1,
            width: cellWidth,
            height: cellHeight,
            type: 'day'
          },
          tuesday: {
            name: 'Tuesday',
            column: 1,
            row: 2,
            width: cellWidth,
            height: cellHeight,
            type: 'day'
          },
          wednesday: {
            name: 'Wednesday',
            column: 1,
            row: 3,
            width: cellWidth,
            height: cellHeight,
            type: 'day'
          },
          thursday: {
            name: 'Thursday',
            column: 3,
            row: 1,
            width: cellWidth,
            height: cellHeight,
            type: 'day'
          },
          friday: {
            name: 'Friday',
            column: 3,
            row: 2,
            width: cellWidth,
            height: cellHeight,
            type: 'day'
          },
          saturday: {
            name: 'Saturday',
            column: 3,
            row: 3,
            width: cellWidth,
            height: cellHeight,
            type: 'day'
          },
          sunday: {
            name: 'Sunday',
            column: 4,
            row: 3,
            width: cellWidth,
            height: cellHeight,
            type: 'day'
          }
        },
  
        // Define "Things to do" regions for each day
        todoLists: {
          monday: {
            name: 'Monday Todo',
            column: 2,
            row: 1,
            width: cellWidth,
            height: cellHeight,
            type: 'todo'
          },
          tuesday: {
            name: 'Tuesday Todo',
            column: 2,
            row: 2,
            width: cellWidth,
            height: cellHeight,
            type: 'todo'
          },
          wednesday: {
            name: 'Wednesday Todo',
            column: 2,
            row: 3,
            width: cellWidth,
            height: cellHeight,
            type: 'todo'
          },
          thursday: {
            name: 'Thursday Todo',
            column: 4,
            row: 1,
            width: cellWidth,
            height: cellHeight,
            type: 'todo'
          },
          friday: {
            name: 'Friday Todo',
            column: 4,
            row: 2,
            width: cellWidth,
            height: cellHeight,
            type: 'todo'
          }
        }
      };
  
      // Pre-compile regular expressions
      this.patterns = {
        month: /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
        dateRange: /\b\d{1,2}(?:\s*-\s*\d{1,2})?\b/,
        year: /\b20\d{2}\b/,
        time: /\b\d{1,2}[:\.]\d{2}\s*(?:am|pm)?\b/i,
        todoHeader: /\bthings\s+to\s+do\b/i
      };
    }
  
    getRegionForCoordinates(x, y) {
      // Convert absolute coordinates to percentages
      const percentX = (x / this.imageWidth) * 100;
      const percentY = (y / this.imageHeight) * 100;
  
      // Check header region first
      if (this.isInRegion(percentX, percentY, this.getAbsoluteRegion(this.layout.header))) {
        return { type: 'header' };
      }
  
      // Check day regions
      for (const [day, region] of Object.entries(this.layout.days)) {
        const absoluteRegion = this.getAbsoluteRegion(region);
        if (this.isInRegion(percentX, percentY, absoluteRegion)) {
          return { 
            type: 'day',
            day: day,
            name: region.name 
          };
        }
      }
  
      // Check todo list regions
      for (const [day, region] of Object.entries(this.layout.todoLists)) {
        const absoluteRegion = this.getAbsoluteRegion(region);
        if (this.isInRegion(percentX, percentY, absoluteRegion)) {
          return { 
            type: 'todo',
            day: day,
            name: region.name 
          };
        }
      }
  
      return null;
    }
  
    getAbsoluteRegion(region) {
      // Convert grid positions to absolute percentages
      const top = region.row 
        ? this.grid.headerHeight + ((region.row - 1) * (100 - this.grid.headerHeight) / this.grid.rows)
        : region.top;
        
      const left = region.column 
        ? ((region.column - 1) * (100 / this.grid.columns))
        : region.left;
  
      return {
        top,
        left,
        width: region.width,
        height: region.height
      };
    }
  
    isInRegion(x, y, region) {
      return (
        x >= region.left && 
        x < (region.left + region.width) &&
        y >= region.top && 
        y < (region.top + region.height)
      );
    }
  
    validateContent(region, text) {
      if (!text) return { valid: false, confidence: 0 };
  
      switch (region.type) {
        case 'header':
          return this.validateHeaderContent(text);
        case 'day':
          return this.validateDayContent(text, region.name);
        case 'todo':
          return this.validateTodoContent(text);
        default:
          return { valid: false, confidence: 0 };
      }
    }
  
    validateHeaderContent(text) {
      const hasMonth = this.patterns.month.test(text);
      const hasDateRange = this.patterns.dateRange.test(text);
      const hasYear = this.patterns.year.test(text);
      
      return {
        valid: hasMonth || hasDateRange || hasYear,
        confidence: ((hasMonth ? 0.4 : 0) + 
                    (hasDateRange ? 0.4 : 0) + 
                    (hasYear ? 0.2 : 0))
      };
    }
  
    validateDayContent(text, expectedDay) {
      const hasTime = this.patterns.time.test(text);
      const hasDay = new RegExp('\\b' + expectedDay + '\\b', 'i').test(text);
      const hasContent = text.length > 0;
      
      return {
        valid: hasContent && (hasTime || hasDay),
        confidence: ((hasTime ? 0.4 : 0) + 
                    (hasDay ? 0.4 : 0) + 
                    (hasContent ? 0.2 : 0))
      };
    }
  
    validateTodoContent(text) {
      const hasHeader = this.patterns.todoHeader.test(text);
      const hasContent = text.replace(this.patterns.todoHeader, '').trim().length > 0;
      
      return {
        valid: hasHeader || hasContent,
        confidence: hasHeader ? 0.8 : (hasContent ? 0.6 : 0)
      };
    }
  }
  
  export default PlannerTemplateDefinition;