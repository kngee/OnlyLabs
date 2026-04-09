const neumorphicBackground = '#F6F6F6'; // Base color for everything
const neumorphicDarkShadow = 'rgba(0, 0, 0, 0.1)';
const neumorphicLightShadow = 'rgba(255, 255, 255, 0.8)';
const accentColor = '#FF6B6B'; // Deep Coral/Red for buttons and active states
const textColor = '#333333';
const greyTextColor = '#888888';

export const Colors = {
  light: {
    text: textColor,
    background: neumorphicBackground,
    tint: accentColor,
    tabIconDefault: greyTextColor,
    tabIconSelected: accentColor,
    greyText: greyTextColor,
    // Neumorphic specifics
    neumorphicBg: neumorphicBackground,
    shadowDark: neumorphicDarkShadow,
    shadowLight: neumorphicLightShadow,
    accent: accentColor,
  },
  dark: {
    // You can define a dark neumorphic theme here later, for now we will stick to light for the initial rollout
    text: neumorphicBackground, // Swap for dark mode logic
    background: textColor, // Swap
    tint: accentColor,
    tabIconDefault: '#ccc',
    tabIconSelected: accentColor,
    neumorphicBg: textColor,
    shadowDark: 'rgba(0,0,0,0.5)',
    shadowLight: 'rgba(255,255,255,0.1)',
    accent: accentColor,
  },
};