# CloudScribble Brand Guidelines - Mobile App

## 📱 Brand Colors for Mobile Development

### Primary Brand Colors
These are your core brand identity colors - use these for primary elements, navigation, and key components.

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Navy** | `#283593` | `rgb(40, 53, 147)` | Primary brand color, navbar, headers, primary buttons |
| **Mauve** | `#B995A9` | `rgb(185, 149, 169)` | Primary accent, feature highlights, secondary buttons |
| **Cream** | `#FDF8F0` | `rgb(253, 248, 240)` | Main background color |
| **Cream Alt** | `#FCF8F1` | `rgb(252, 248, 241)` | Alternative background (exact homepage match) |

### Secondary Brand Colors
Perfect for feature cards, accents, and creating visual variety.

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Gold** | `#C8A943` | `rgb(200, 169, 67)` | Premium features, call-to-action elements |
| **Gold Alt** | `#D4AF37` | `rgb(212, 175, 55)` | Alternative gold for variety |
| **Sage** | `#9CAF88` | `rgb(156, 175, 136)` | Nature-inspired accent, success states |
| **Dusty Rose** | `#E8B4BC` | `rgb(232, 180, 188)` | Soft accent, gentle highlights |
| **Lavender** | `#E6E6FA` | `rgb(230, 230, 250)` | Gentle accent, secondary backgrounds |

### Accent & Supporting Colors
Great for borders, subtle backgrounds, and secondary elements.

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Soft Peach** | `#FFDFD3` | `rgb(255, 223, 211)` | Warm accent, notification backgrounds |
| **Light Blue** | `#78CBF9` | `rgb(120, 203, 249)` | Tech/digital elements, links |
| **Light Purple** | `#6774c8` | `rgb(103, 116, 200)` | Interactive elements, buttons |
| **Warm Gray** | `#4A4B4F` | `rgb(74, 75, 79)` | Body text, secondary content |

### Color Variations
Use these for hover states, pressed states, and visual hierarchy.

| Base Color | Light Variation | Dark Variation | Usage |
|------------|----------------|----------------|-------|
| **Mauve** | `#C5A7B8` `rgb(197, 167, 184)` | `#B995A9` | Hover/pressed states |
| **Rose** | `#F2C4CB` `rgb(242, 196, 203)` | `#E8B4BC` | Subtle backgrounds |
| **Sage** | `#B5C7A4` `rgb(181, 199, 164)` | `#9CAF88` | Success states |
| **Gold** | `#D4BC6C` `rgb(212, 188, 108)` | `#C8A943` | Premium highlights |
| **Navy** | `#3949ab` `rgb(57, 73, 171)` | `#2a3580` `rgb(42, 53, 128)` | Button states |

### Functional Colors
Ready-to-use colors for specific UI functions.

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Brand Blue** | `#03A9F4` | `rgb(3, 169, 244)` | Links, hover states |
| **Brand Accent1** | `#6774c8` | `rgb(103, 116, 200)` | Interactive elements |
| **Brand Accent2** | `#5865bf` | `rgb(88, 101, 191)` | Secondary interactive |
| **Brand Background** | `#fcfcfc` | `rgb(252, 252, 252)` | Alternative white background |
| **Pale Gold** | `#E6D5AC` | `rgb(230, 213, 172)` | Subtle accents |

### Admin Interface Colors
Use these if building admin features within the mobile app.

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Admin Primary** | `#3947ac` | `rgb(57, 71, 172)` | Admin interface primary |
| **Admin Secondary** | `#C8A943` | `rgb(200, 169, 67)` | Admin gold accent |
| **Admin Info** | `#78CBF9` | `rgb(120, 203, 249)` | Information elements |
| **Admin Text** | `#2c3e50` | `rgb(44, 62, 80)` | Admin text color |
| **Admin Secondary Text** | `#5a6c7d` | `rgb(90, 108, 125)` | Admin secondary text |

### Transparent Overlays
Perfect for modal backgrounds, loading states, and overlays.

| Color Name | RGBA Value | Opacity | Usage |
|------------|------------|---------|-------|
| **Mauve Overlay** | `rgba(185, 149, 169, 0.15)` | 15% | Background overlays |
| **Rose Overlay** | `rgba(232, 180, 188, 0.15)` | 15% | Background overlays |
| **Sage Overlay** | `rgba(156, 175, 136, 0.15)` | 15% | Background overlays |
| **Navy Overlay** | `rgba(40, 53, 147, 0.8)` | 80% | Modal backgrounds |
| **Dark Overlay** | `rgba(0, 0, 0, 0.5)` | 50% | General overlays |

## 🎨 Mobile App Color Usage Guidelines

### Primary Color Combinations
**Best practices for color pairing:**

- **Navy + Cream**: Classic brand combination for headers and content
- **Mauve + Sage**: Perfect for feature highlights and cards
- **Gold + Navy**: Premium features and call-to-actions
- **Dusty Rose + Lavender**: Gentle, calming sections

### Accessibility Notes
- **High Contrast**: Navy on Cream provides excellent readability
- **Color Blind Safe**: Navy, Gold, and Sage work well for color blind users
- **Text Contrast**: Use Navy (`#283593`) or Warm Gray (`#4A4B4F`) for body text

### Mobile App Specific Recommendations

#### Navigation
- **Primary**: Navy (`#283593`)
- **Background**: Cream (`#FCF8F1`)
- **Active States**: Mauve (`#B995A9`)

#### Buttons
- **Primary**: Light Purple (`#6774c8`)
- **Secondary**: Mauve (`#B995A9`)
- **Success**: Sage (`#9CAF88`)
- **Premium**: Gold (`#C8A943`)

#### Backgrounds
- **Main**: Cream (`#FCF8F1`)
- **Cards**: White (`#fcfcfc`)
- **Sections**: Light variations of accent colors

#### Status Colors
- **Success**: Sage (`#9CAF88`)
- **Warning**: Gold (`#C8A943`)
- **Info**: Light Blue (`#78CBF9`)
- **Error**: Dusty Rose (`#E8B4BC`)

## 💡 Implementation Tips

### CSS Custom Properties
```css
:root {
  /* Primary Brand */
  --navy: #283593;
  --mauve: #B995A9;
  --cream: #FCF8F1;
  
  /* Secondary Brand */
  --gold: #C8A943;
  --sage: #9CAF88;
  --dusty-rose: #E8B4BC;
  --lavender: #E6E6FA;
  
  /* Functional */
  --brand-blue: #03A9F4;
  --warm-gray: #4A4B4F;
}
```

### React Native StyleSheet
```javascript
export const Colors = {
  // Primary Brand
  navy: '#283593',
  mauve: '#B995A9',
  cream: '#FCF8F1',
  
  // Secondary Brand
  gold: '#C8A943',
  sage: '#9CAF88',
  dustyRose: '#E8B4BC',
  lavender: '#E6E6FA',
  
  // Functional
  brandBlue: '#03A9F4',
  warmGray: '#4A4B4F',
};
```

### Swift/iOS Colors
```swift
extension UIColor {
    static let navy = UIColor(red: 40/255, green: 53/255, blue: 147/255, alpha: 1.0)
    static let mauve = UIColor(red: 185/255, green: 149/255, blue: 169/255, alpha: 1.0)
    static let cream = UIColor(red: 252/255, green: 248/255, blue: 241/255, alpha: 1.0)
    // ... add other colors as needed
}
```

### Android Colors.xml
```xml
<resources>
    <!-- Primary Brand Colors -->
    <color name="navy">#283593</color>
    <color name="mauve">#B995A9</color>
    <color name="cream">#FCF8F1</color>
    
    <!-- Secondary Brand Colors -->
    <color name="gold">#C8A943</color>
    <color name="sage">#9CAF88</color>
    <color name="dusty_rose">#E8B4BC</color>
    <!-- ... add other colors as needed -->
</resources>
```

---

**Total Colors**: 25+ distinct colors with variations  
**Color System**: Comprehensive palette for consistent brand experience  
**Mobile Ready**: All colors tested for mobile app development  
**Last Updated**: September 2025