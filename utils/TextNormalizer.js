// utils/TextNormalizer.js

export class TextNormalizer {
  constructor() {
    this.properNames = new Set(['Rane']);
    this.corrections = {
      'dentst': 'dentist',
      'ortho': 'orthodontist',
      'socr': 'soccer',
      'schl': 'school',
      'skool': 'school',
      'scool': 'school',
      'practce': 'practice',
      'prctice': 'practice',
      'appt': 'appointment',
      'apt': 'appointment',
      'lnch': 'lunch',
      'grf': 'golf'
    };
  }

  normalizeText(text) {
    if (!text || typeof text !== 'string') {
      console.log('TextNormalizer received invalid input:', text);
      return '';
    }

    try {
      // Convert to lowercase and clean up spaces
      let normalized = text.toLowerCase().trim();

      // Preserve proper names
      this.properNames.forEach(name => {
        const pattern = new RegExp(name, 'gi');
        normalized = normalized.replace(pattern, name);
      });

      // Apply word corrections
      Object.entries(this.corrections).forEach(([incorrect, correct]) => {
        const pattern = new RegExp(`\\b${incorrect}\\b`, 'gi');
        normalized = normalized.replace(pattern, correct);
      });

      console.log('Normalized text:', normalized);
      return normalized;
    } catch (error) {
      console.error('Text normalization error:', error);
      return text || '';
    }
  }

  addProperName(name) {
    if (name && typeof name === 'string') {
      this.properNames.add(name.trim());
    }
  }
}

export default TextNormalizer;