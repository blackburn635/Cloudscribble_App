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
