# React Native Color Implementation Guide

## 📱 CloudScribble Mobile App Colors (React Native + Expo)

This guide shows you how to implement CloudScribble's brand colors in your React Native + Expo mobile app.

## 🚀 Quick Setup

### 1. File Structure
```
cloudscribble-app/
├── constants/
│   ├── Colors.js          ← JavaScript color definitions
│   └── Colors.ts          ← TypeScript color definitions (recommended)
├── components/
│   └── ui/
│       └── CloudScribbleButton.js ← Example branded component
├── assets/
│   └── icons/
│       ├── Full_Icon_no_background.png ← App icon
│       └── icon1.png                   ← Logo symbol
└── docs/
    └── react-native-color-implementation-guide.md
```

### 2. Installation
Place the color files in your existing `constants/` directory:
```bash
# Copy Colors.ts (recommended) OR Colors.js to:
cp Colors.ts constants/
```

## 🎨 Basic Usage Examples

### Import Colors
```javascript
// JavaScript
import { Colors, NavigationColors, ButtonColors } from '../constants/Colors';

// TypeScript
import { Colors, NavigationColors, ButtonColors } from '../constants/Colors';
import type { ButtonType, StatusType } from '../constants/Colors';
```

### Basic Color Usage
```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BackgroundColors, TextColors } from '../constants/Colors';

const ExampleComponent = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to CloudScribble</Text>
      <Text style={styles.body}>Your planner, digitally connected</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BackgroundColors.main, // Cream background
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TextColors.primary, // Navy text
    marginBottom: 10,
  },
  body: {
    fontSize: 16,
    color: TextColors.secondary, // Warm gray text
    lineHeight: 24,
  },
});
```

### Button Implementation
```javascript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, getButtonColor } from '../constants/Colors';

const CustomButton = ({ title, type = 'primary', onPress, disabled }) => {
  const buttonColor = getButtonColor(type, disabled ? 'disabled' : 'normal');
  const textColor = type === 'primary' ? Colors.cream : Colors.navy;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: buttonColor }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, { color: textColor }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Navigation Styling
```javascript
// For React Navigation
import { Colors, NavigationColors } from '../constants/Colors';

const navigationTheme = {
  colors: {
    primary: NavigationColors.primary,
    background: NavigationColors.background,
    card: Colors.brandBackground,
    text: NavigationColors.text,
    border: Colors.mauveLight,
    notification: Colors.mauve,
  },
};

// In your App.js
<NavigationContainer theme={navigationTheme}>
  {/* Your navigation stack */}
</NavigationContainer>
```

### Status Indicators
```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStatusColor } from '../constants/Colors';

const StatusMessage = ({ type, message }) => {
  const statusColor = getStatusColor(type);

  return (
    <View style={[styles.statusContainer, { borderLeftColor: statusColor }]}>
      <Text style={[styles.statusText, { color: statusColor }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

// Usage:
// <StatusMessage type="success" message="Profile updated successfully!" />
// <StatusMessage type="error" message="Failed to save changes" />
```

## 🔧 Advanced Implementation

### Themed Components with Context
```javascript
// Create a theme context
import React, { createContext, useContext } from 'react';
import { LightTheme, DarkTheme } from '../constants/Colors';

const ThemeContext = createContext(LightTheme);

export const ThemeProvider = ({ children, isDark = false }) => {
  const theme = isDark ? DarkTheme : LightTheme;
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// Use in components
const ThemedComponent = () => {
  const theme = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>Themed content</Text>
    </View>
  );
};
```

### Custom Hook for Colors
```javascript
// hooks/useColors.js
import { useMemo } from 'react';
import { Colors, ButtonColors, TextColors, BackgroundColors } from '../constants/Colors';

export const useColors = () => {
  return useMemo(() => ({
    ...Colors,
    button: ButtonColors,
    text: TextColors,
    background: BackgroundColors,
  }), []);
};

// Usage in components
const MyComponent = () => {
  const colors = useColors();
  
  return (
    <View style={{ backgroundColor: colors.background.main }}>
      <Text style={{ color: colors.text.primary }}>Hello World</Text>
    </View>
  );
};
```

### Styled Component Integration (if using styled-components)
```javascript
import styled from 'styled-components/native';
import { Colors } from '../constants/Colors';

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.creamAlt};
  padding: 20px;
`;

const Heading = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${Colors.navy};
  margin-bottom: 10px;
`;

const PrimaryButton = styled.TouchableOpacity`
  background-color: ${Colors.lightPurple};
  padding: 12px 24px;
  border-radius: 8px;
  align-items: center;
`;

const ButtonText = styled.Text`
  color: ${Colors.cream};
  font-size: 16px;
  font-weight: 600;
`;
```

## 📱 Platform-Specific Colors

### iOS Status Bar
```javascript
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/Colors';

// In your main App component
<StatusBar 
  style="dark" 
  backgroundColor={Colors.creamAlt}
/>
```

### Android Navigation Bar
```javascript
// In app.json for Expo
{
  "expo": {
    "android": {
      "navigationBarBackgroundColor": "#FCF8F1",
      "statusBarBackgroundColor": "#FCF8F1"
    }
  }
}
```

## 🎯 Component Library Examples

### Card Component
```javascript
const CloudScribbleCard = ({ children, type = 'default' }) => {
  const getCardStyle = () => {
    switch (type) {
      case 'premium':
        return {
          backgroundColor: Colors.brandBackground,
          borderColor: Colors.gold,
          borderWidth: 1,
        };
      case 'success':
        return {
          backgroundColor: Colors.sageOverlay,
          borderColor: Colors.sage,
          borderWidth: 1,
        };
      default:
        return {
          backgroundColor: Colors.brandBackground,
          borderColor: Colors.mauveLight,
          borderWidth: 1,
        };
    }
  };

  return (
    <View style={[styles.card, getCardStyle()]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

### Input Component
```javascript
const CloudScribbleInput = ({ placeholder, value, onChangeText, error }) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null
        ]}
        placeholder={placeholder}
        placeholderTextColor={Colors.warmGray}
        value={value}
        onChangeText={onChangeText}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.mauveLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.brandBackground,
    color: Colors.navy,
  },
  inputError: {
    borderColor: Colors.dustyRose,
  },
  errorText: {
    color: Colors.dustyRose,
    fontSize: 12,
    marginTop: 4,
  },
});
```

## 🔄 Migration from Existing Colors

### Find and Replace Common Colors
```bash
# If you have existing colors, replace them:
# Old → New
#FFFFFF → Colors.white
#000000 → Colors.black
# Any blue → Colors.lightBlue or Colors.brandBlue
# Any purple → Colors.lightPurple or Colors.mauve
```

### Gradual Migration Strategy
1. **Start with new components** - Use CloudScribble colors in all new components
2. **Update main screens** - Replace colors in key user-facing screens
3. **Refactor existing components** - Update existing components one by one
4. **Remove old color constants** - Delete old color files once migration is complete

## ✅ Implementation Checklist

### Setup Phase
- [ ] Add `Colors.ts` or `Colors.js` to `constants/` directory
- [ ] Create example button component using brand colors
- [ ] Test colors in both light and dark themes
- [ ] Configure status bar and navigation colors

### Component Development
- [ ] Build branded button library
- [ ] Create branded input components
- [ ] Design card/container components
- [ ] Implement status message components

### Integration Phase
- [ ] Apply colors to navigation theme
- [ ] Update app.json for platform-specific colors
- [ ] Test accessibility compliance
- [ ] Document component usage for team

### Quality Assurance
- [ ] Test on iOS device/simulator
- [ ] Test on Android device/emulator
- [ ] Verify color consistency across screens
- [ ] Check accessibility contrast ratios

## 🎨 Design System Best Practices

### Color Usage Guidelines
- **Primary Actions**: Use `Colors.lightPurple` for main CTAs
- **Secondary Actions**: Use `Colors.mauve` for secondary buttons
- **Success States**: Use `Colors.sage` for positive feedback
- **Premium Features**: Use `Colors.gold` for premium/paid features
- **Text Hierarchy**: `Colors.navy` for headings, `Colors.warmGray` for body text

### Accessibility Notes
- **High Contrast**: Navy on Cream provides excellent readability
- **Status Colors**: Always pair colors with icons or text labels
- **Touch Targets**: Ensure minimum 44pt touch targets for buttons

### Performance Tips
- **Memoize Colors**: Use `useMemo` for computed color objects
- **Avoid Inline Styles**: Use StyleSheet.create for better performance
- **Platform Optimization**: Use platform-specific colors when needed

---

**🚀 Ready to implement?** Start by adding the color constants, then build your first branded component! Your CloudScribble mobile app will have consistent, professional branding across all platforms.