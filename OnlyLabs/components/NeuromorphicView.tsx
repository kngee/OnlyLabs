import React from 'react';
import { StyleSheet, View, ViewProps, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colours';

interface NeumorphicViewProps extends ViewProps {
  children?: React.ReactNode;
  level?: 'concave' | 'convex'; // Concave can be for inputs
}

export function NeumorphicView({ children, style, level = 'convex', ...otherProps }: NeumorphicViewProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  // Base style for convex (extruding) Neumorphic effect
  const neumorphicStyle = StyleSheet.create({
    shadows: {
      backgroundColor: theme.neumorphicBg,
      // Convex effect: shadows create the soft pop-out
      shadowColor: theme.shadowDark,
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 5, // Android fallback
    },
    innerShadows: {
        // Inner lighting effect for the protrusion
        shadowColor: theme.shadowLight,
        shadowOffset: { width: -6, height: -6 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 0,
    }
  });

  return (
    <View style={[neumorphicStyle.shadows, style]} {...otherProps}>
        <View style={[neumorphicStyle.innerShadows, style, {marginTop: 0, marginLeft: 0}]}>
          {children}
        </View>
    </View>
  );
}