// utils/AzureVisionClient.js
import * as ImageManipulator from 'expo-image-manipulator';

export class AzureVisionClient {
  constructor() {
    // FIXED: Removed trailing slash
    this.endpoint = "https://cloudscribble.cognitiveservices.azure.com";
    this.apiKey = process.env.EXPO_PUBLIC_AZURE_VISION_API_KEY;
  }

  async recognizeText(imageUri) {
    try {
      console.log('Starting Azure Vision processing for:', imageUri);

      // Convert file:// URI to blob
      console.log('Converting image to blob...');
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log('Image blob size:', blob.size);

      // FIXED: Try v3.2 first (more compatible), then v4.0 if that fails
      let apiUrl = `${this.endpoint}/vision/v3.2/read/analyze`;
      
      console.log('Making initial Azure API call to:', apiUrl);
      const result = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Ocp-Apim-Subscription-Key': this.apiKey
        },
        body: blob
      });

      console.log('Initial API Response status:', result.status);
      console.log('Initial API Response headers:', Object.fromEntries(result.headers.entries()));
      
      // If v3.2 gives 404, try v4.0
      if (result.status === 404) {
        console.log('v3.2 not found, trying v4.0...');
        apiUrl = `${this.endpoint}/vision/v4.0/read/analyze`;
        
        const v4Result = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': this.apiKey
          },
          body: blob
        });
        
        if (!v4Result.ok) {
          const errorText = await v4Result.text();
          console.error('Azure API Error Response:', errorText);
          throw new Error(`Azure Vision API error: ${v4Result.status} - ${v4Result.statusText} - ${errorText}`);
        }
        
        // Use v4 result for polling
        result = v4Result;
      } else if (!result.ok) {
        const errorText = await result.text();
        console.error('Azure API Error Response:', errorText);
        throw new Error(`Azure Vision API error: ${result.status} - ${result.statusText} - ${errorText}`);
      }

      // Get operation location
      const operationLocation = result.headers.get('Operation-Location');
      if (!operationLocation) {
        throw new Error('No Operation-Location header received from Azure');
      }
      console.log('Operation Location:', operationLocation);

      // Poll for results
      const maxRetries = 10;
      let retries = 0;
      while (retries < maxRetries) {
        console.log(`Polling attempt ${retries + 1} of ${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const resultResponse = await fetch(operationLocation, {
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKey
          }
        });
        
        if (!resultResponse.ok) {
          const errorText = await resultResponse.text();
          console.error('Polling Error Response:', errorText);
          throw new Error(`Polling error: ${resultResponse.status} - ${resultResponse.statusText}`);
        }

        const resultData = await resultResponse.json();
        console.log('Poll response status:', resultData.status);
        
        if (resultData.status === 'succeeded') {
          console.log('Text recognition succeeded');
          
          // Handle both v3.2 and v4.0 response formats
          const readResults = resultData.analyzeResult.readResults || resultData.analyzeResult.blocks;
          if (!readResults || !readResults[0] || !readResults[0].lines) {
            throw new Error('No text lines found in Azure response');
          }
          
          console.log('Azure raw results:', JSON.stringify(readResults[0], null, 2));
          
          // Map the Azure results to our expected format
          const lines = readResults[0].lines.map(line => ({
            text: line.text,
            confidence: line.confidence || 0.8,
            bounding: {
              top: line.boundingBox[1],    // y coordinate of top-left point
              left: line.boundingBox[0],   // x coordinate of top-left point
              width: line.boundingBox[2] - line.boundingBox[0],  // width
              height: line.boundingBox[7] - line.boundingBox[1]  // height
            }
          }));
          
          console.log('Mapped results:', JSON.stringify(lines, null, 2));
          
          return {
            success: true,
            data: lines
          };
        }
        
        if (resultData.status === 'failed') {
          throw new Error('Azure Vision processing failed');
        }
        
        retries++;
      }

      throw new Error('Timeout waiting for Azure Vision results');

    } catch (error) {
      console.error('Detailed Azure Vision error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default AzureVisionClient;