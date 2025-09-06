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
