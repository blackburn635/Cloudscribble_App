#!/bin/bash

# update-docs.sh
# Script to create and update documentation files for planner-scanner app
# Usage: ./scripts/update-docs.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$PROJECT_ROOT/docs"
SCRIPTS_DIR="$PROJECT_ROOT/scripts"

echo -e "${BLUE}Planner Scanner Documentation Updater${NC}"
echo "========================================"

# Create directories if they don't exist
if [ ! -d "$DOCS_DIR" ]; then
    echo -e "${YELLOW}Creating docs directory...${NC}"
    mkdir -p "$DOCS_DIR"
fi

if [ ! -d "$SCRIPTS_DIR" ]; then
    echo -e "${YELLOW}Creating scripts directory...${NC}"
    mkdir -p "$SCRIPTS_DIR"
fi

# Function to check if file exists and ask for overwrite
check_overwrite() {
    local file="$1"
    if [ -f "$file" ]; then
        echo -e "${YELLOW}Warning: $file already exists.${NC}"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}Skipping $file${NC}"
            return 1
        fi
    fi
    return 0
}

# Create/update development-log.md
DEV_LOG="$DOCS_DIR/development-log.md"
if check_overwrite "$DEV_LOG"; then
    echo -e "${GREEN}Updating development-log.md...${NC}"
    cat > "$DEV_LOG" << 'EOF'
# Development Log - Planner Scanner

## Project Overview
A React Native Expo application that converts physical planner pages into digital calendar events using computer vision and OCR technology.

## Development Timeline

### Phase 1: Project Initialization (Initial Setup)
**Objective:** Set up basic project structure and camera functionality

**Key Achievements:**
- Created Expo React Native project structure
- Configured development environment for iOS
- Implemented basic camera functionality using expo-camera
- Created PlannerCamera component with visual alignment guides
- Added proper aspect ratio handling (17:11 for landscape planner pages)
- Implemented visual guides for 3.5mm anchor marks

**Technical Details:**
- Used expo-camera version 16.0.14
- Forced landscape orientation for planner capture
- Created circular guides for anchor mark alignment
- Added page boundary rectangle guide

**Files Created:**
- `App.js` - Main application entry point
- `PlannerCamera.js` - Camera component with alignment system
- `app.json` - Expo configuration

### Phase 2: Development Build Migration (Build System Enhancement)
**Objective:** Convert from Expo Go to development build for advanced features

**Key Achievements:**
- Successfully migrated from Expo Go to development build
- Resolved iOS build configuration issues
- Added react-native-mlkit-ocr dependency
- Fixed architecture compatibility issues
- Configured Xcode build settings

**Technical Challenges Resolved:**
- iOS deployment target version errors
- ExpoModulesCore architecture compatibility
- Script execution failures in Xcode
- Build configuration conflicts

**Build Configuration Changes:**
- Updated iOS deploymentTarget to 15.1
- Added "arm64" to Excluded Architectures for iOS Simulator
- Modified build scripts and configurations
- Updated Pods and dependencies

### Phase 3: Photo Capture Implementation (Core Functionality)
**Objective:** Implement working photo capture with proper error handling

**Key Achievements:**
- Successfully debugged and fixed camera capture functionality
- Implemented proper photo capture using CameraView native methods
- Added step-based app flow (capture → display → process)
- Created robust error handling and logging system
- Separated photo capture from text processing concerns

**Technical Implementation:**
- Used `_cameraRef.current.takePicture()` for reliable capture
- Added detailed logging for camera state debugging
- Implemented button press handling with loading states
- Created clean UI flow from capture to processing

**Architecture Improvements:**
- Separated concerns between App.js and PlannerCamera.js
- App.js manages overall flow and photo display
- PlannerCamera.js handles camera view and capture
- Added proper state management for capture process

### Phase 4: OCR Implementation with MLKit (First OCR Attempt)
**Objective:** Implement text recognition from captured planner images

**Key Achievements:**
- Attempted implementation with react-native-mlkit-ocr
- Created basic text processing pipeline
- Developed initial event extraction logic
- Built confidence scoring system

**Technical Challenges:**
- MLKit compatibility issues with Expo development build
- Native module integration problems
- Text processing accuracy limitations

**Files Created:**
- `utils/PlannerTextProcessor.js` - Text processing logic
- Initial text recognition pipeline

### Phase 5: Migration to Azure Computer Vision (OCR Enhancement)
**Objective:** Improve OCR accuracy and reliability using cloud services

**Key Achievements:**
- Successfully migrated from MLKit to Azure Computer Vision API
- Implemented robust image processing pipeline
- Created comprehensive text recognition system
- Added image compression to meet Azure's 20MB limit
- Built sophisticated event extraction and organization

**Technical Implementation:**
- Created `AzureVisionClient.js` for API communication
- Implemented progressive image compression
- Added polling mechanism for async Azure operations
- Built comprehensive error handling and retry logic

**Text Processing Enhancements:**
- Enhanced time pattern recognition (9:00am, 12:00pm, etc.)
- Improved AM/PM handling and inference
- Better event title extraction
- Section-based organization by day
- Confidence scoring implementation

**Files Created/Modified:**
- `utils/AzureVisionClient.js` - Azure API client
- `utils/PlannerTextProcessor.js` - Major overhaul
- `utils/TextNormalizer.js` - Text correction utilities
- Updated App.js for event display

### Phase 6: Text Processing Refinement (Accuracy Improvements)
**Objective:** Enhance text recognition accuracy and event extraction

**Key Achievements:**
- Implemented comprehensive OCR error correction system
- Added timezone-aware date/time processing
- Created sophisticated text normalization pipeline
- Improved event validation and organization
- Added proper name preservation (e.g., "Rane")

**Technical Enhancements:**
- Device local timezone detection
- Enhanced header date range detection
- Improved time format handling (various AM/PM styles)
- Better handling of common OCR mistakes
- Section-based text processing

**Text Correction Features:**
- Common word corrections (dentist, school, practice)
- Time format normalization (9:00 vs 9:0 vs 9.00)
- Month/day name corrections
- Proper name preservation
- Event confidence scoring

### Phase 7: Architecture Refinement (Code Organization)
**Objective:** Improve code structure and processing accuracy

**Key Achievements:**
- Modified camera aspect ratio from 17:11 to 8.5:11 for single page
- Created section-based processing system
- Enhanced visual guides for two-column layout
- Improved event detection and validation
- Added comprehensive text normalization

**Structural Changes:**
- Updated overlay guides for header, events, and todos columns
- Implemented day-based section processing
- Added event sorting by time within sections
- Enhanced validation for time formats
- Improved proper name handling

**Current Architecture:**
- `App.js` - Main app flow and UI
- `PlannerCamera.js` - Camera with visual guides
- `utils/AzureVisionClient.js` - Azure API integration
- `utils/PlannerTextProcessor.js` - Event extraction
- `utils/TextNormalizer.js` - Text correction

## Current Status

### Working Features
✅ Camera capture with visual alignment guides
✅ Photo capture and display
✅ Azure Computer Vision OCR integration
✅ Text recognition and processing
✅ Event extraction and organization
✅ Time/date parsing with timezone support
✅ Text normalization and error correction
✅ Section-based organization (by day)
✅ Event sorting and confidence scoring

### Technical Specifications
- **Platform:** React Native with Expo
- **Camera:** expo-camera v16.0.14 with CameraView
- **OCR:** Azure Computer Vision API v2023-10-01
- **Image Processing:** expo-image-manipulator
- **Build:** Development build (not Expo Go)
- **Target:** iOS (iPad and iPhone support)

### File Structure
```
planner-scanner/
├── App.js                           # Main application
├── PlannerCamera.js                 # Camera component
├── utils/
│   ├── AzureVisionClient.js         # Azure API client
│   ├── PlannerTextProcessor.js      # Text processing
│   └── TextNormalizer.js            # Text correction
├── app.json                         # Expo configuration
└── package.json                     # Dependencies
```

## Next Steps for Production

### Immediate Priorities
1. **Calendar Integration** - Connect to iOS Calendar API
2. **User Interface Polish** - Improve UX for capture and review
3. **Event Management** - Edit, delete, and manage extracted events
4. **Error Handling** - Robust error handling for edge cases
5. **Performance Optimization** - Image processing and API calls

### Future Enhancements
1. **Multiple Page Support** - Handle various planner layouts
2. **Template Recognition** - Auto-detect planner formats
3. **Offline Mode** - Cache events when network unavailable
4. **Settings Management** - User preferences and configurations
5. **Export Options** - Multiple calendar format support

### Production Readiness Tasks
1. **API Key Management** - Secure credential storage
2. **Privacy Implementation** - Handle camera and calendar permissions
3. **Testing Suite** - Comprehensive testing framework
4. **App Store Preparation** - Icons, screenshots, descriptions
5. **Analytics Integration** - Usage tracking and crash reporting

## Development Notes

### Key Learnings
- Expo development builds required for advanced OCR features
- Azure Computer Vision provides superior handwriting recognition
- Section-based processing improves event extraction accuracy
- Visual guides significantly improve user capture experience
- Text normalization crucial for OCR accuracy

### Common Issues and Solutions
- **Camera permissions:** Properly configured in app.json
- **Image size limits:** Auto-compression before Azure API calls
- **OCR accuracy:** Comprehensive text normalization pipeline
- **Time parsing:** Multiple format support with AM/PM inference
- **Build issues:** Development build required for native modules

### Development Environment
- **IDE:** VS Code with React Native extensions
- **Testing:** iOS Simulator and physical device
- **Debugging:** Metro bundler with detailed logging
- **Version Control:** Git with feature branch workflow
- **API Testing:** Azure portal for Computer Vision monitoring
EOF
    echo -e "${GREEN}✓ development-log.md created${NC}"
fi

# Create/update architecture.md
ARCH_DOC="$DOCS_DIR/architecture.md"
if check_overwrite "$ARCH_DOC"; then
    echo -e "${GREEN}Updating architecture.md...${NC}"
    cat > "$ARCH_DOC" << 'EOF'
# Architecture Documentation - Planner Scanner

## System Overview

The Planner Scanner is a React Native Expo application that captures physical planner pages and converts them into digital calendar events using computer vision and OCR technology.

## High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   Mobile App    │────│   Azure CV API   │    │   iOS Calendar  │
│  (React Native) │    │                  │    │      (Future)   │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│                 │    │                  │
│  Device Camera  │    │  Text Processing │
│                 │    │     Pipeline     │
│                 │    │                  │
└─────────────────┘    └──────────────────┘
```

## Component Architecture

### 1. Application Layer (`App.js`)
**Responsibilities:**
- Main application state management
- Photo capture workflow coordination
- UI rendering for captured images
- Event display and organization
- Error handling and user feedback

**Key Features:**
- Photo capture and display
- Processing state management
- Event list rendering with day-based organization
- Error message display

**State Management:**
```javascript
{
  capturedPhoto: null,      // URI of captured photo
  isProcessing: false,      // Processing state flag
  events: [],               // Extracted events array
  error: null              // Error message
}
```

### 2. Camera Layer (`PlannerCamera.js`)
**Responsibilities:**
- Camera view management
- Visual alignment guides
- Photo capture functionality
- Permission handling

**Key Features:**
- Landscape orientation enforcement
- Visual guides for 8.5" x 11" planner pages
- Anchor mark alignment circles
- Two-column layout guides (events/todos)
- Capture button with loading states

**Visual Guide System:**
- Header section guide (top 10%)
- Events column guide (left 50%)
- Todos column guide (right 50%)
- Page boundary rectangle
- Aspect ratio maintenance (8.5:11)

### 3. OCR Integration Layer (`AzureVisionClient.js`)
**Responsibilities:**
- Azure Computer Vision API communication
- Image preprocessing and compression
- Asynchronous operation handling
- Response formatting and error management

**API Integration:**
```javascript
Endpoint: https://plannerscannerapp.cognitiveservices.azure.com/
API Version: 2023-10-01
Features: Text recognition (Read API)
Image Limits: 20MB maximum size
```

**Processing Pipeline:**
1. Image URI to blob conversion
2. Size validation and compression
3. API request initiation
4. Polling for completion
5. Result formatting and validation

### 4. Text Processing Layer (`PlannerTextProcessor.js`)
**Responsibilities:**
- OCR result interpretation
- Event extraction and organization
- Date/time parsing and validation
- Section-based content organization
- Confidence scoring

**Processing Algorithm:**
1. **Image Preparation:** Resize and compress for Azure API
2. **Text Recognition:** Call Azure CV and poll for results
3. **Content Organization:** Sort text blocks by position
4. **Section Detection:** Identify day headers and boundaries
5. **Event Extraction:** Parse time/event pairs within sections
6. **Validation:** Verify time formats and event structures
7. **Output Generation:** Create structured event data

**Section Structure:**
```javascript
{
  year: 2025,
  sections: [
    {
      day: "Monday",
      date: 6,
      month: "january",
      events: [
        {
          time: "9:00",
          period: "am",
          title: "Dentist Appointment",
          confidence: 0.85,
          fullDateTime: "2025-01-06T09:00:00-06:00"
        }
      ]
    }
  ]
}
```

### 5. Text Normalization Layer (`TextNormalizer.js`)
**Responsibilities:**
- OCR error correction
- Text standardization
- Proper name preservation
- Time format normalization

**Correction Categories:**
- **Time Corrections:** "l0:00" → "10:00", "9.00" → "9:00"
- **Word Corrections:** "dentst" → "dentist", "schl" → "school"
- **Proper Names:** Preserve names like "Rane"
- **Common Phrases:** Handle recurring OCR mistakes

## Data Flow

### 1. Capture Flow
```
User Taps Capture → Camera Takes Photo → Photo Stored Locally → UI Updates
```

### 2. Processing Flow
```
User Taps Process → Image Preparation → Azure API Call → 
Text Recognition → Event Extraction → UI Display
```

### 3. Error Handling Flow
```
Error Occurs → Error Logged → User Notified → Retry Option Available
```

## Technology Stack

### Core Framework
- **React Native:** Mobile application framework
- **Expo:** Development platform and build system
- **Expo Development Build:** Required for native modules

### Camera and Image Processing
- **expo-camera:** Camera functionality with CameraView
- **expo-image-manipulator:** Image resizing and compression
- **React Native Reanimated:** Animation support

### OCR and AI Services
- **Azure Computer Vision API:** Cloud-based OCR service
- **Handwriting Recognition:** Specialized model for planner text

### Development Tools
- **Metro Bundler:** JavaScript bundler
- **Xcode:** iOS development and building
- **VS Code:** Primary development environment

## Configuration Management

### Expo Configuration (`app.json`)
```json
{
  "expo": {
    "name": "planner-scanner",
    "slug": "planner-scanner",
    "version": "1.0.0",
    "orientation": "portrait",
    "jsEngine": "hermes",
    "plugins": [
      "expo-router",
      "expo-splash-screen",
      "expo-build-properties",
      "expo-camera"
    ]
  }
}
```

### Build Properties
- **iOS Deployment Target:** 15.1
- **Android Compile SDK:** 33
- **JavaScript Engine:** Hermes
- **Framework Type:** Static (iOS)

## Security Considerations

### API Key Management
- Azure Computer Vision API key embedded in client
- **Production Note:** Move to secure backend or environment variables

### Permissions
- **Camera Permission:** Required for photo capture
- **Future:** Calendar permission for event creation

### Data Privacy
- Images processed temporarily and not stored permanently
- OCR processing happens in Azure cloud
- **Consideration:** Add option for local processing

## Performance Characteristics

### Image Processing
- **Capture Resolution:** Determined by device camera
- **Processing Resolution:** Optimized for Azure API (20MB limit)
- **Compression:** Progressive JPEG compression as needed

### API Performance
- **Azure Response Time:** 2-5 seconds typical
- **Retry Logic:** Built-in polling with timeout
- **Error Recovery:** Graceful degradation on failures

### Memory Usage
- **Image Storage:** Temporary local storage only
- **Processing:** Streaming approach for large images
- **UI Updates:** Efficient re-rendering with React Native

## Scalability Considerations

### Current Limitations
- Single page processing only
- One planner format supported
- Cloud dependency for OCR

### Future Scaling Opportunities
- **Multiple Formats:** Template-based recognition
- **Batch Processing:** Multiple pages at once
- **Offline Mode:** Local OCR capabilities
- **Caching:** Event and image caching system

## Error Handling Strategy

### Error Categories
1. **Camera Errors:** Permission, hardware issues
2. **Network Errors:** API connectivity problems
3. **Processing Errors:** OCR failures, parsing issues
4. **Validation Errors:** Invalid time formats, missing data

### Recovery Mechanisms
- **Automatic Retry:** API call failures
- **User Retry:** Manual retry buttons
- **Graceful Degradation:** Partial results display
- **Error Reporting:** Detailed logging for debugging

## Testing Strategy

### Current Testing
- **Manual Testing:** Physical device testing
- **Development Environment:** iOS Simulator support
- **API Testing:** Azure portal monitoring

### Future Testing Plans
- **Unit Tests:** Component and utility testing
- **Integration Tests:** API and processing pipeline
- **E2E Tests:** Full capture and processing workflow
- **Performance Tests:** Large image and batch processing

## Deployment Architecture

### Current Deployment
- **Development Build:** Expo development client
- **Distribution:** Manual installation via Xcode
- **Updates:** Manual rebuild and reinstall

### Production Deployment Plan
- **App Store Distribution:** Standard iOS app store process
- **Code Push:** Expo Updates for JavaScript updates
- **Backend Services:** Azure infrastructure
- **Monitoring:** Crash reporting and analytics

## Maintenance and Monitoring

### Logging Strategy
- **Console Logging:** Development debugging
- **Error Tracking:** Future crash reporting integration
- **API Monitoring:** Azure portal metrics

### Update Strategy
- **Feature Updates:** Major version releases
- **Bug Fixes:** Patch releases
- **API Updates:** Azure service version management
- **Dependencies:** Regular dependency updates

This architecture provides a solid foundation for the current application while allowing for future enhancements and production scaling.
EOF
    echo -e "${GREEN}✓ architecture.md created${NC}"
fi

# Create/update backlog.md
BACKLOG_DOC="$DOCS_DIR/backlog.md"
if check_overwrite "$BACKLOG_DOC"; then
    echo -e "${GREEN}Updating backlog.md...${NC}"
    cat > "$BACKLOG_DOC" << 'EOF'
# Product Backlog - Planner Scanner

## Current Sprint (Production Preparation)

### High Priority - Production Ready Features

#### 1. Calendar Integration 🗓️
**Epic:** Connect extracted events to iOS Calendar
- [ ] **US-001:** Integrate with EventKit framework
- [ ] **US-002:** Request calendar permissions
- [ ] **US-003:** Create calendar events from extracted data
- [ ] **US-004:** Handle timezone conversion properly
- [ ] **US-005:** Allow user to select target calendar
- [ ] **US-006:** Batch event creation with user confirmation

**Acceptance Criteria:**
- Events successfully created in iOS Calendar app
- User can choose which calendar to add events to
- Proper date/time formatting with timezone
- Batch operations with user review before creation

#### 2. Security and API Management 🔐
**Epic:** Secure API credentials and improve app security
- [ ] **US-007:** Move Azure API key to secure backend service
- [ ] **US-008:** Implement API key rotation mechanism
- [ ] **US-009:** Add request rate limiting and error handling
- [ ] **US-010:** Implement secure storage for user preferences
- [ ] **US-011:** Add privacy policy and data handling notices

**Acceptance Criteria:**
- API keys not exposed in client code
- Secure backend service handles OCR requests
- User data privacy properly handled

#### 3. User Experience Polish 💫
**Epic:** Improve UI/UX for production quality
- [ ] **US-012:** Design and implement app icon and splash screen
- [ ] **US-013:** Add loading states with progress indicators
- [ ] **US-014:** Implement proper error messaging with recovery options
- [ ] **US-015:** Add confirmation dialogs for important actions
- [ ] **US-016:** Improve photo preview and editing capabilities
- [ ] **US-017:** Add help/tutorial screens for first-time users

**Acceptance Criteria:**
- Professional app appearance and branding
- Clear user feedback for all operations
- Intuitive first-time user experience

## Next Sprint - Enhanced Functionality

### Medium Priority - Core Feature Expansion

#### 4. Event Management System 📝
**Epic:** Allow users to review and manage extracted events
- [ ] **US-018:** Add event editing interface
- [ ] **US-019:** Implement event deletion functionality
- [ ] **US-020:** Allow manual event creation
- [ ] **US-021:** Add event validation and duplicate detection
- [ ] **US-022:** Implement event history and tracking
- [ ] **US-023:** Add export options (CSV, JSON)

**Acceptance Criteria:**
- Users can edit events before adding to calendar
- Duplicate detection prevents redundant events
- Export functionality works for backup purposes

#### 5. Multiple Planner Format Support 📅
**Epic:** Support different planner layouts and formats
- [ ] **US-024:** Create template recognition system
- [ ] **US-025:** Add support for weekly vs daily planners
- [ ] **US-026:** Implement different aspect ratio handling
- [ ] **US-027:** Add custom template creation tools
- [ ] **US-028:** Support vertical and horizontal orientations

**Acceptance Criteria:**
- App recognizes different planner formats automatically
- Visual guides adapt to different layouts
- Custom templates can be saved and reused

#### 6. Offline Mode and Performance 🚀
**Epic:** Improve app performance and add offline capabilities
- [ ] **US-029:** Implement local image processing pipeline
- [ ] **US-030:** Add offline event storage and sync
- [ ] **US-031:** Optimize image compression algorithms
- [ ] **US-032:** Implement background processing
- [ ] **US-033:** Add progress tracking for long operations

**Acceptance Criteria:**
- App works without internet connection
- Fast processing and responsive UI
- Background sync when connectivity restored

## Future Sprints - Advanced Features

### Lower Priority - Advanced Functionality

#### 7. Multi-Page Processing 📖
**Epic:** Handle multiple planner pages in batch
- [ ] **US-034:** Implement batch photo capture
- [ ] **US-035:** Add page relationship detection
- [ ] **US-036:** Create multi-page event organization
- [ ] **US-037:** Add page navigation and management
- [ ] **US-038:** Implement progress tracking for batches

**Acceptance Criteria:**
- Users can capture and process multiple pages
- Events organized across time periods
- Efficient batch processing workflow

#### 8. Smart Features and AI Enhancement 🤖
**Epic:** Add intelligent features and improved recognition
- [ ] **US-039:** Implement recurring event detection
- [ ] **US-040:** Add smart event categorization
- [ ] **US-041:** Create location extraction from events
- [ ] **US-042:** Add reminder time suggestions
- [ ] **US-043:** Implement handwriting learning adaptation

**Acceptance Criteria:**
- App learns from user patterns
- Automatic categorization and organization
- Smart suggestions improve over time

#### 9. Collaboration and Sharing 👥
**Epic:** Enable sharing and collaborative features
- [ ] **US-044:** Add family calendar sharing
- [ ] **US-045:** Implement event sharing via messages/email
- [ ] **US-046:** Create collaborative planner processing
- [ ] **US-047:** Add team calendar integration
- [ ] **US-048:** Implement shared template library

**Acceptance Criteria:**
- Multiple users can collaborate on events
- Shared calendars properly synchronized
- Team features work across devices

## Technical Debt and Improvements

### Code Quality and Maintenance 🔧

#### 10. Testing and Quality Assurance ✅
- [ ] **TECH-001:** Implement unit testing suite with Jest
- [ ] **TECH-002:** Add integration tests for OCR pipeline
- [ ] **TECH-003:** Create E2E testing with Detox
- [ ] **TECH-004:** Add performance testing framework
- [ ] **TECH-005:** Implement automated accessibility testing
- [ ] **TECH-006:** Create continuous integration pipeline

#### 11. Code Refactoring and Architecture 🏗️
- [ ] **TECH-007:** Refactor state management to use Redux or Zustand
- [ ] **TECH-008:** Implement proper error boundary components
- [ ] **TECH-009:** Add TypeScript for better type safety
- [ ] **TECH-010:** Create modular component library
- [ ] **TECH-011:** Implement proper logging and monitoring
- [ ] **TECH-012:** Add configuration management system

#### 12. Performance Optimization ⚡
- [ ] **TECH-013:** Optimize image processing algorithms
- [ ] **TECH-014:** Implement lazy loading for large data sets
- [ ] **TECH-015:** Add memory usage monitoring and optimization
- [ ] **TECH-016:** Optimize bundle size and startup time
- [ ] **TECH-017:** Implement efficient caching strategies
- [ ] **TECH-018:** Add performance metrics and monitoring

## Infrastructure and DevOps

### Deployment and Operations 🚀

#### 13. Production Infrastructure
- [ ] **INFRA-001:** Set up Azure backend services
- [ ] **INFRA-002:** Implement CI/CD pipeline with GitHub Actions
- [ ] **INFRA-003:** Add crash reporting with Sentry or Bugsnag
- [ ] **INFRA-004:** Set up analytics with Firebase or Amplitude
- [ ] **INFRA-005:** Implement feature flags system
- [ ] **INFRA-006:** Add performance monitoring and alerting

#### 14. App Store and Distribution
- [ ] **DIST-001:** Prepare App Store listing and screenshots
- [ ] **DIST-002:** Implement TestFlight beta testing program
- [ ] **DIST-003:** Create app marketing materials
- [ ] **DIST-004:** Set up customer support system
- [ ] **DIST-005:** Implement app review and rating system
- [ ] **DIST-006:** Add in-app purchase framework (if needed)

## Bug Fixes and Technical Issues

### Known Issues to Address 🐛

#### High Priority Bugs
- [ ] **BUG-001:** Fix occasional camera freeze on older iOS devices
- [ ] **BUG-002:** Resolve Azure API timeout handling edge cases
- [ ] **BUG-003:** Fix memory leak in image processing pipeline
- [ ] **BUG-004:** Address text recognition accuracy for certain handwriting styles

#### Medium Priority Bugs
- [ ] **BUG-005:** Improve handling of rotated or skewed images
- [ ] **BUG-006:** Fix edge case crashes in text normalization
- [ ] **BUG-007:** Resolve UI layout issues on different screen sizes
- [ ] **BUG-008:** Fix date parsing edge cases around month boundaries

#### Low Priority Bugs
- [ ] **BUG-009:** Improve visual guide alignment on iPad
- [ ] **BUG-010:** Fix minor UI inconsistencies in dark mode
- [ ] **BUG-011:** Address accessibility issues with screen readers
- [ ] **BUG-012:** Fix occasional text overlapping in event display

## Research and Exploration

### Investigation Items 🔍

#### Technology Research
- [ ] **RESEARCH-001:** Evaluate on-device ML models for OCR (Core ML)
- [ ] **RESEARCH-002:** Investigate Apple's Vision framework capabilities
- [ ] **RESEARCH-003:** Research competitive apps and feature comparison
- [ ] **RESEARCH-004:** Evaluate cloud alternatives to Azure (Google Cloud Vision, AWS Textract)

#### User Experience Research
- [ ] **RESEARCH-005:** Conduct user testing sessions with target audience
- [ ] **RESEARCH-006:** Analyze common planner formats and layouts
- [ ] **RESEARCH-007:** Study user workflows and pain points
- [ ] **RESEARCH-008:** Research accessibility requirements and best practices

## Success Metrics and KPIs

### Key Performance Indicators 📊

#### User Engagement Metrics
- Daily/Monthly Active Users
- Session duration and frequency
- Feature adoption rates
- User retention (1-day, 7-day, 30-day)

#### Technical Performance Metrics
- OCR accuracy rate (target: >90%)
- Processing time per image (target: <10 seconds)
- App crash rate (target: <0.1%)
- API success rate (target: >99%)

#### Business Metrics
- App Store rating (target: >4.5 stars)
- User acquisition cost
- Customer support ticket volume
- Feature usage analytics

## Prioritization Framework

### Priority Levels
1. **P0 (Blocker):** Must be completed before production release
2. **P1 (High):** Important for user experience and adoption
3. **P2 (Medium):** Valuable features that can be deferred
4. **P3 (Low):** Nice-to-have features for future consideration

### Estimation Scale
- **XS:** 1-2 hours
- **S:** 1-2 days  
- **M:** 3-5 days
- **L:** 1-2 weeks
- **XL:** 2+ weeks

This backlog serves as a living document that will be updated based on user feedback, technical discoveries, and business priorities as the app moves toward production and beyond.
EOF
    echo -e "${GREEN}✓ backlog.md created${NC}"
fi

# Create/update readme.md
README_DOC="$DOCS_DIR/README.md"
if check_overwrite "$README_DOC"; then
    echo -e "${GREEN}Updating README.md...${NC}"
    cat > "$README_DOC" << 'EOF'
# Planner Scanner - Developer Guide

## Overview

Planner Scanner is a React Native Expo application that converts physical planner pages into digital calendar events using computer vision and optical character recognition (OCR). The app captures images of planner pages, processes them using Azure Computer Vision API, and extracts event information for digital calendar integration.

## Table of Contents
- [How It Works](#how-it-works)
- [System Requirements](#system-requirements)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Development Workflow](#development-workflow)
- [Core Components](#core-components)
- [API Integration](#api-integration)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## How It Works

### User Journey
1. **Capture:** User opens the camera and aligns their planner page with visual guides
2. **Process:** App sends captured image to Azure Computer Vision API for text recognition
3. **Extract:** Text processing pipeline identifies events, times, and dates
4. **Review:** User reviews extracted events before adding to calendar (future feature)
5. **Save:** Events are added to device calendar (future feature)

### Technical Process
1. **Image Capture:** Camera component captures planner image with proper alignment
2. **Image Preparation:** Image is compressed and formatted for API submission
3. **OCR Processing:** Azure Computer Vision API extracts text with bounding boxes
4. **Text Analysis:** Custom processing pipeline organizes text into sections and events
5. **Event Extraction:** Time patterns and event titles are identified and validated
6. **Data Structuring:** Events are organized by date with confidence scores

## System Requirements

### Development Environment
- **Node.js:** 18.x or higher
- **npm/yarn:** Latest stable version
- **Expo CLI:** 6.x or higher
- **Xcode:** 14.x or higher (for iOS development)
- **iOS Simulator:** iOS 15.1+
- **Physical Device:** iOS 15.1+ (recommended for camera testing)

### Dependencies
- **React Native:** 0.72.x
- **Expo:** ~49.0.0
- **expo-camera:** ~16.0.14
- **expo-image-manipulator:** Latest
- **react-native-reanimated:** Latest

### External Services
- **Azure Computer Vision API:** Active subscription required
- **iOS Calendar:** For event integration (future)

## Project Structure

```
planner-scanner/
├── App.js                           # Main application entry point
├── PlannerCamera.js                 # Camera component with visual guides
├── utils/                           # Utility modules
│   ├── AzureVisionClient.js         # Azure API client
│   ├── PlannerTextProcessor.js      # Text processing pipeline
│   └── TextNormalizer.js            # OCR error correction
├── docs/                            # Documentation
│   ├── README.md                    # This file
│   ├── architecture.md              # System architecture
│   ├── development-log.md           # Development history
│   └── backlog.md                   # Feature backlog
├── scripts/                         # Utility scripts
│   └── update-docs.sh               # Documentation updater
├── assets/                          # Static assets
│   └── images/                      # App icons and images
├── app.json                         # Expo configuration
├── package.json                     # Node dependencies
└── babel.config.js                  # Babel configuration
```

## Setup and Installation

### 1. Clone and Install
```bash
git clone <repository-url>
cd planner-scanner
npm install
```

### 2. Configure Azure Computer Vision
1. Create Azure Computer Vision resource in Azure portal
2. Copy API key and endpoint URL
3. Update `AzureVisionClient.js` with your credentials:
```javascript
this.endpoint = "https://your-resource.cognitiveservices.azure.com/";
this.apiKey = "your-api-key-here";
```

### 3. Development Build Setup
**Important:** This app requires Expo Development Build (not Expo Go) due to native dependencies.

```bash
# Generate native code
npx expo prebuild

# iOS Development
npx expo run:ios

# Or build development client
eas build --platform ios --profile development
```

### 4. Physical Device Setup (Recommended)
1. Install development build on iOS device
2. Connect to same network as development server
3. Use camera functionality (not available in simulator)

## Development Workflow

### Starting Development
```bash
# Start Metro bundler
npx expo start

# For development build
npx expo start --dev-client

# Clear cache if needed
npx expo start --clear
```

### Code Organization
- **App.js:** Main state management and UI coordination
- **PlannerCamera.js:** Camera interface and photo capture
- **utils/:** Business logic and external integrations
- **docs/:** Keep documentation updated with changes

### Best Practices
- Test camera functionality on physical device
- Monitor Azure API usage and costs
- Keep API keys secure (move to backend for production)
- Update documentation with significant changes
- Use TypeScript for type safety (future enhancement)

## Core Components

### App.js
**Purpose:** Main application coordinator
**Responsibilities:**
- Overall state management
- Photo capture workflow
- Event display and organization
- Error handling and user feedback

**Key State:**
```javascript
{
  capturedPhoto: null,    // Currently captured image URI
  isProcessing: false,    // Processing status flag
  events: [],             // Extracted events array
  error: null            // Current error message
}
```

### PlannerCamera.js
**Purpose:** Camera interface with visual alignment system
**Features:**
- Landscape orientation enforcement
- Visual guides for planner alignment
- 8.5" x 11" aspect ratio maintenance
- Two-column layout guides (events/todos)
- Photo capture with loading states

**Visual Guide System:**
```javascript
// Guide positioning
headerGuide: { height: '10%' },        // Top section for dates
eventsColumn: { flex: 1 },             // Left column for events
todosColumn: { flex: 1 },              // Right column for todos
pageGuide: { borderWidth: 1 }          // Overall page boundary
```

### AzureVisionClient.js
**Purpose:** Azure Computer Vision API integration
**Features:**
- Image preprocessing and compression
- Asynchronous API communication
- Response polling and formatting
- Error handling and retry logic

**API Workflow:**
```javascript
1. Convert image URI to blob
2. Validate/compress image size (20MB limit)
3. Submit to Azure Read API
4. Poll operation status until complete
5. Format and return text results
```

### PlannerTextProcessor.js
**Purpose:** Text analysis and event extraction
**Process:**
1. **Section Detection:** Identify day headers (e.g., "Monday, 6 January")
2. **Event Parsing:** Extract time/event pairs within sections
3. **Validation:** Verify time formats and event structures
4. **Organization:** Sort and structure events by day and time
5. **Scoring:** Assign confidence scores based on pattern matching

**Output Format:**
```javascript
{
  year: 2025,
  sections: [
    {
      day: "Monday",
      date: 6,
      month: "january",
      events: [
        {
          time: "9:00",
          period: "am",
          title: "Dentist Appointment",
          confidence: 0.85,
          fullDateTime: "2025-01-06T09:00:00-06:00"
        }
      ]
    }
  ],
  metadata: {
    processedAt: "2025-01-06T...",
    timezone: "America/Chicago",
    confidence: 0.82
  }
}
```

### TextNormalizer.js
**Purpose:** OCR error correction and text standardization
**Features:**
- Common OCR mistake correction
- Time format normalization
- Proper name preservation
- Word substitution patterns

**Correction Examples:**
```javascript
// Time corrections
"l0:00" → "10:00"
"9.00" → "9:00"
"6O" → "6:00"

// Word corrections
"dentst" → "dentist"
"schl" → "school"
"practce" → "practice"

// Preserve proper names
"rane" → "Rane" (maintained as proper noun)
```

## API Integration

### Azure Computer Vision Setup
1. **Create Resource:** Azure portal → Computer Vision → Create
2. **Get Credentials:** Keys and Endpoint section
3. **Configure Pricing:** Standard S1 recommended for development
4. **Monitor Usage:** Track API calls and costs

### API Usage Patterns
```javascript
// Typical API call flow
const result = await azureClient.recognizeText(imageUri);

if (result.success) {
  const processor = new PlannerTextProcessor();
  const events = await processor.processText(result.data);
  // Handle extracted events
} else {
  // Handle API error
  console.error('OCR failed:', result.error);
}
```

### Cost Management
- **Free Tier:** 5,000 transactions/month
- **Paid Tier:** $1.50 per 1,000 transactions
- **Optimization:** Compress images to reduce processing costs
- **Monitoring:** Set up billing alerts in Azure portal

## Configuration

### Expo Configuration (app.json)
```json
{
  "expo": {
    "name": "planner-scanner",
    "slug": "planner-scanner",
    "version": "1.0.0",
    "orientation": "portrait",
    "jsEngine": "hermes",
    "plugins": [
      "expo-router",
      "expo-splash-screen", 
      "expo-build-properties",
      ["expo-camera", {
        "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera."
      }]
    ]
  }
}
```

### Key Configuration Points
- **JavaScript Engine:** Hermes for performance
- **Camera Permissions:** Required for core functionality
- **Build Properties:** iOS 15.1+ deployment target
- **Development Build:** Required for native dependencies

### Environment Variables (Future)
For production deployment, consider:
```javascript
// Move to environment configuration
AZURE_CV_ENDPOINT=process.env.AZURE_CV_ENDPOINT
AZURE_CV_KEY=process.env.AZURE_CV_KEY
```

## Testing

### Current Testing Approach
- **Manual Testing:** Primary testing method
- **Device Testing:** Physical iOS device recommended
- **API Testing:** Monitor Azure portal for API health
- **Error Testing:** Intentionally trigger error conditions

### Testing Scenarios
1. **Camera Permissions:** Denied/granted states
2. **Image Quality:** Various lighting and angles  
3. **OCR Accuracy:** Different handwriting styles
4. **Network Issues:** Offline/poor connectivity
5. **Large Images:** Size limit testing
6. **Edge Cases:** Empty pages, rotated images

### Future Testing Framework
- **Unit Tests:** Jest for utility functions
- **Integration Tests:** API and processing pipeline
- **E2E Tests:** Detox for full user workflows
- **Performance Tests:** Image processing benchmarks

## Deployment

### Development Build
Current deployment method for testing:
```bash
# Build for iOS
eas build --platform ios --profile development

# Install on device
# Download and install .ipa file
```

### Production Deployment (Planned)
1. **App Store Build:**
```bash
eas build --platform ios --profile production
```

2. **Code Signing:** Configure in Expo Application Services
3. **App Store Connect:** Upload build and configure metadata
4. **TestFlight:** Beta testing before release
5. **App Store Review:** Submit for approval

### Backend Services (Future)
For production, move API keys to secure backend:
- **Azure Functions:** Serverless OCR proxy
- **Authentication:** Secure API access
- **Rate Limiting:** Control usage and costs
- **Monitoring:** Track usage and performance

## Troubleshooting

### Common Issues

#### Camera Not Working
**Symptoms:** Black screen, no camera preview
**Solutions:**
- Check camera permissions in device settings
- Verify app.json camera configuration
- Test on physical device (simulator has limitations)
- Restart Metro bundler and rebuild

#### API Errors
**Symptoms:** "Azure API Error" messages
**Solutions:**
- Verify Azure credentials in AzureVisionClient.js
- Check Azure resource status in portal
- Confirm API key has correct permissions
- Monitor API usage limits

#### Build Failures
**Symptoms:** Expo build or prebuild errors
**Solutions:**
- Clean node_modules: `rm -rf node_modules && npm install`
- Clear Expo cache: `npx expo start --clear`
- Rebuild development client: `npx expo prebuild --clean`
- Update dependencies: `npm update`

#### Poor OCR Accuracy
**Symptoms:** Events not detected or incorrect text
**Solutions:**
- Improve lighting and image quality
- Ensure proper planner alignment with guides
- Check handwriting clarity and contrast
- Update TextNormalizer patterns for specific errors

#### Memory Issues
**Symptoms:** App crashes or slowdown with large images
**Solutions:**
- Reduce image resolution in prepareImage()
- Implement proper image cleanup
- Monitor memory usage during processing
- Add progress indicators for long operations

### Debug Logging
Enable detailed logging for troubleshooting:
```javascript
// In components, add:
console.log('Debug info:', variableToInspect);

// Monitor in development:
npx expo start --dev-client
# Check Metro logs and device logs
```

### Performance Monitoring
- **Metro Performance:** Bundle size and load time
- **Azure Portal:** API response times and errors
- **Device Performance:** Memory and CPU usage during processing
- **User Experience:** App responsiveness and feedback

## Contributing

### Code Style
- Use consistent indentation (2 spaces)
- Add comments for complex logic
- Follow React Native best practices
- Update documentation with changes

### Pull Request Process
1. Create feature branch from main
2. Implement changes with appropriate testing
3. Update relevant documentation
4. Submit PR with clear description
5. Address review feedback

### Documentation Updates
Use the provided script to maintain documentation:
```bash
./scripts/update-docs.sh
```

This will update all documentation files with the latest information.

---

## Getting Help

- **Expo Documentation:** https://docs.expo.dev/
- **React Native Docs:** https://reactnative.dev/docs/getting-started
- **Azure Computer Vision:** https://docs.microsoft.com/en-us/azure/cognitive-services/computer-vision/
- **Project Issues:** Use repository issue tracker for bugs and feature requests

For questions about this specific implementation, refer to the development log and architecture documentation in the `/docs` folder.
EOF
    echo -e "${GREEN}✓ README.md created${NC}"
fi

echo ""
echo -e "${GREEN}Documentation Update Complete! ✨${NC}"
echo ""
echo -e "${BLUE}Generated Files:${NC}"
echo "  📁 $DOCS_DIR/"
echo "    📄 development-log.md    - Complete development history"
echo "    📄 architecture.md       - System architecture details"
echo "    📄 backlog.md           - Feature backlog and roadmap"  
echo "    📄 README.md            - Developer guide"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Review generated documentation for accuracy"
echo "  2. Update any project-specific details"
echo "  3. Commit documentation to version control"
echo "  4. Use this script to keep docs updated as development continues"
echo ""
echo -e "${BLUE}Usage:${NC}"
echo "  ./scripts/update-docs.sh    # Update all documentation"
echo ""
echo -e "${GREEN}Ready to move forward with production development! 🚀${NC}"