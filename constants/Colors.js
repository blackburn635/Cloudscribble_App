// constants/Colors.js
/**
 * CloudScribble Brand Colors for React Native
 * Complete color system for consistent branding across the mobile app
 */

export const Colors = {
  // MARK: - Primary Brand Colors
  navy: '#283593',
  mauve: '#B995A9', 
  cream: '#FDF8F0',
  creamAlt: '#FCF8F1',

  // MARK: - Secondary Brand Colors
  gold: '#C8A943',
  goldAlt: '#D4AF37',
  sage: '#9CAF88',
  dustyRose: '#E8B4BC',
  lavender: '#E6E6FA',

  // MARK: - Accent & Supporting Colors
  softPeach: '#FFDFD3',
  lightBlue: '#78CBF9',
  lightPurple: '#6774c8',
  warmGray: '#4A4B4F',

  // MARK: - Color Variations
  mauveLight: '#C5A7B8',
  roseLight: '#F2C4CB', 
  sageLight: '#B5C7A4',
  goldLight: '#D4BC6C',
  navyLight: '#3949ab',
  navyDark: '#2a3580',

  // MARK: - Functional Colors
  brandBlue: '#03A9F4',
  brandAccent1: '#6774c8',
  brandAccent2: '#5865bf', 
  brandBackground: '#fcfcfc',
  paleGold: '#E6D5AC',

  // MARK: - Admin Interface Colors (if needed)
  adminPrimary: '#3947ac',
  adminSecondary: '#C8A943',
  adminInfo: '#78CBF9',
  adminText: '#2c3e50',
  adminSecondaryText: '#5a6c7d',

  // MARK: - Transparent Overlays (with alpha)
  mauveOverlay: 'rgba(185, 149, 169, 0.15)',
  roseOverlay: 'rgba(232, 180, 188, 0.15)',
  sageOverlay: 'rgba(156, 175, 136, 0.15)', 
  navyOverlay: 'rgba(40, 53, 147, 0.8)',
  darkOverlay: 'rgba(0, 0, 0, 0.5)',

  // MARK: - Standard Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// MARK: - Organized Color Groups
export const NavigationColors = {
  background: Colors.creamAlt,
  primary: Colors.navy,
  active: Colors.mauve,
  text: Colors.navy,
  activeText: Colors.navy,
};

export const ButtonColors = {
  primary: Colors.lightPurple,
  primaryPressed: Colors.brandAccent2,
  secondary: Colors.mauve,
  secondaryPressed: Colors.mauveLight,
  success: Colors.sage,
  premium: Colors.gold,
  disabled: Colors.warmGray,
};

export const BackgroundColors = {
  main: Colors.creamAlt,
  card: Colors.brandBackground,
  section: Colors.lavender,
  overlay: Colors.darkOverlay,
};

export const StatusColors = {
  success: Colors.sage,
  warning: Colors.gold,
  info: Colors.lightBlue,
  error: Colors.dustyRose,
};

export const TextColors = {
  primary: Colors.navy,
  secondary: Colors.warmGray,
  onPrimary: Colors.cream,
  onSecondary: Colors.navy,
  disabled: Colors.warmGray,
  link: Colors.brandBlue,
};

// MARK: - Utility Functions
export const getButtonColor = (type = 'primary', state = 'normal') => {
  const buttonMap = {
    primary: {
      normal: ButtonColors.primary,
      pressed: ButtonColors.primaryPressed,
      disabled: ButtonColors.disabled,
    },
    secondary: {
      normal: ButtonColors.secondary,
      pressed: ButtonColors.secondaryPressed,
      disabled: ButtonColors.disabled,
    },
    success: {
      normal: ButtonColors.success,
      pressed: Colors.sageLight,
      disabled: ButtonColors.disabled,
    },
    premium: {
      normal: ButtonColors.premium,
      pressed: Colors.goldLight,
      disabled: ButtonColors.disabled,
    },
  };

  return buttonMap[type]?.[state] || ButtonColors.primary;
};

export const getStatusColor = (status) => {
  const statusMap = {
    success: StatusColors.success,
    warning: StatusColors.warning,
    info: StatusColors.info,
    error: StatusColors.error,
  };

  return statusMap[status] || StatusColors.info;
};

// MARK: - Theme Configuration
export const LightTheme = {
  colors: {
    primary: Colors.navy,
    background: Colors.creamAlt,
    card: Colors.brandBackground,
    text: Colors.navy,
    border: Colors.mauveLight,
    notification: Colors.mauve,
  },
};

export const DarkTheme = {
  colors: {
    primary: Colors.mauve,
    background: Colors.navy,
    card: Colors.navyLight,
    text: Colors.cream,
    border: Colors.mauveLight,
    notification: Colors.gold,
  },
};

// MARK: - Export Default
export default Colors;