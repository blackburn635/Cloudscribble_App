// components/ui/CloudScribbleButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, getButtonColor } from '../../constants/Colors';

/**
 * CloudScribble Branded Button Component
 * Consistent button styling across the app with built-in color management
 */
const CloudScribbleButton = ({
  title,
  onPress,
  type = 'primary', // 'primary', 'secondary', 'success', 'premium'
  size = 'medium', // 'small', 'medium', 'large'
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  ...props
}) => {
  // Get colors based on button type and state
  const buttonColor = getButtonColor(type, disabled ? 'disabled' : 'normal');
  const pressedColor = getButtonColor(type, 'pressed');
  
  // Determine text color based on button type
  const getTextColor = () => {
    switch (type) {
      case 'primary':
      case 'success':
        return Colors.cream;
      case 'secondary':
      case 'premium':
        return Colors.navy;
      default:
        return Colors.cream;
    }
  };

  // Size configurations
  const sizeConfig = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: 14,
      minHeight: 36,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      fontSize: 16,
      minHeight: 44,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      fontSize: 18,
      minHeight: 52,
    },
  };

  const currentSize = sizeConfig[size];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: buttonColor,
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          minHeight: currentSize.minHeight,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      onPress={disabled || loading ? null : onPress}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getTextColor()} 
        />
      ) : (
        <>
          {icon && icon}
          <Text
            style={[
              styles.buttonText,
              {
                color: getTextColor(),
                fontSize: currentSize.fontSize,
                marginLeft: icon ? 8 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.navy,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CloudScribbleButton;