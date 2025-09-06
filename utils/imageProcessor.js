// utils/imageProcessor.js
import * as ImageManipulator from 'expo-image-manipulator';
import PlannerTemplate from './PlannerTemplate';

// Constants for anchor mark detection
const ANCHOR_MARK_SIZE_MM = 3.5;  // 3.5mm circle size
const DPI = 72;  // Base DPI for iOS
const ANCHOR_MARK_SIZE_PX = Math.round((ANCHOR_MARK_SIZE_MM / 25.4) * DPI);
const THRESHOLD_VALUE = 128; // For binary image conversion
const SEARCH_MARGIN = 0.15; // 15% margin for anchor search areas

export async function processImage(imageUri, ocrResults) {
  try {
    // Step 1: Prepare the image for processing
    const preparedImage = await prepareImage(imageUri);
    console.log('Image prepared for processing');
    
    // Step 2: Detect anchor marks
    const anchors = await detectAnchors(preparedImage.uri);
    console.log('Anchor marks detected:', anchors);
    
    if (!validateAnchors(anchors)) {
      throw new Error('Invalid anchor positions detected');
    }
    
    // Step 3: Create template and map OCR results
    const template = new PlannerTemplate(preparedImage.width, preparedImage.height, anchors);
    const mappedContent = template.mapTextToRegions(ocrResults);
    
    // Step 4: Transform and crop the image
    const finalImage = await transformImage(imageUri, anchors);
    console.log('Image transformed and cropped');
    
    return {
      success: true,
      uri: finalImage.uri,
      anchors: anchors,
      content: mappedContent,
      metadata: {
        originalSize: preparedImage.size,
        processedSize: finalImage.size,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Image processing failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}



async function prepareImage(uri) {
  // Enhanced image preparation
  const operations = [
    { resize: { width: 1000 } },
    { contrast: 1.2 },
    { brightness: -0.1 }, // Slightly darken to make black marks more prominent
    { normalize: true }
  ];

  return await ImageManipulator.manipulateAsync(
    uri,
    operations,
    { format: 'png', compress: 0.8 }
  );
}

async function detectAnchors(uri) {
  const image = await loadImageData(uri);
  const { width, height } = image;
  
  // Define search regions for top-left and bottom-right anchors
  const searchRegions = {
    topLeft: {
      x: 0,
      y: 0,
      width: Math.round(width * SEARCH_MARGIN),
      height: Math.round(height * SEARCH_MARGIN)
    },
    bottomRight: {
      x: Math.round(width * (1 - SEARCH_MARGIN)),
      y: Math.round(height * (1 - SEARCH_MARGIN)),
      width: Math.round(width * SEARCH_MARGIN),
      height: Math.round(height * SEARCH_MARGIN)
    }
  };

  // Detect circles in search regions
  const topLeftAnchor = await findAnchorInRegion(image, searchRegions.topLeft);
  const bottomRightAnchor = await findAnchorInRegion(image, searchRegions.bottomRight);

  if (!topLeftAnchor || !bottomRightAnchor) {
    throw new Error('Failed to detect one or both anchor marks');
  }

  return {
    topLeft: topLeftAnchor,
    bottomRight: bottomRightAnchor
  };
}

async function findAnchorInRegion(image, region) {
  // Convert region to grayscale and apply threshold
  const regionData = await extractRegionData(image, region);
  const binaryData = applyThreshold(regionData, THRESHOLD_VALUE);
  
  // Find connected components that could be circles
  const components = findConnectedComponents(binaryData, region.width);
  
  // Filter and validate potential anchor marks
  const candidates = components
    .map(component => validateComponent(component, ANCHOR_MARK_SIZE_PX))
    .filter(Boolean);

  // Return the most likely anchor mark position
  return candidates.length > 0 ? candidates[0] : null;
}

function validateAnchors(anchors) {
  const { topLeft, bottomRight } = anchors;
  
  // Ensure minimum distance between anchors
  const distance = Math.sqrt(
    Math.pow(bottomRight.x - topLeft.x, 2) +
    Math.pow(bottomRight.y - topLeft.y, 2)
  );
  
  const minDistance = ANCHOR_MARK_SIZE_PX * 10; // Minimum expected distance
  
  return distance >= minDistance;
}

function calculateTransformation(anchors) {
  // Calculate rotation angle between anchors
  const rotation = Math.atan2(
    anchors.bottomRight.y - anchors.topLeft.y,
    anchors.bottomRight.x - anchors.topLeft.x
  ) * (180 / Math.PI);
  
  // Calculate crop area with margin
  const margin = ANCHOR_MARK_SIZE_PX * 2;
  
  return {
    rotation,
    crop: {
      originX: anchors.topLeft.x - margin,
      originY: anchors.topLeft.y - margin,
      width: (anchors.bottomRight.x - anchors.topLeft.x) + (margin * 2),
      height: (anchors.bottomRight.y - anchors.topLeft.y) + (margin * 2)
    }
  };
}

async function transformImage(uri, anchors) {
  const transform = calculateTransformation(anchors);
  
  // Apply transformation and crop
  return await ImageManipulator.manipulateAsync(
    uri,
    [
      { rotate: transform.rotation },
      { 
        crop: {
          originX: transform.crop.originX,
          originY: transform.crop.originY,
          width: transform.crop.width,
          height: transform.crop.height
        }
      }
    ],
    { format: 'png', compress: 0.9 }
  );
}

// Helper functions for image processing
async function loadImageData(uri) {
  // Implementation note: In a real app, you would use a native module
  // to load and process image data. This is a placeholder for illustration.
  return new Promise((resolve) => {
    resolve({
      width: 1000,
      height: 1500,
      data: new Uint8Array(1000 * 1500 * 4)
    });
  });
}

function extractRegionData(image, region) {
  // Implementation note: Extract pixel data for the specified region
  return new Uint8Array(region.width * region.height);
}

function applyThreshold(data, threshold) {
  return data.map(value => value > threshold ? 255 : 0);
}

function findConnectedComponents(binaryData, width) {
  // Implementation note: Find connected components in binary image
  // This would use a flood fill or similar algorithm
  return [
    { x: 50, y: 50, size: ANCHOR_MARK_SIZE_PX, circularity: 0.95 }
  ];
}

function validateComponent(component, targetSize) {
  // Check if component matches expected anchor mark properties
  const sizeMatch = Math.abs(component.size - targetSize) < (targetSize * 0.2);
  const isCircular = component.circularity > 0.9;
  
  return sizeMatch && isCircular ? component : null;
}