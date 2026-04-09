import { StyleSheet, View, TouchableOpacity, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NeumorphicView } from '@/components/NeuromorphicView';
import { Colors } from '@/constants/Colours';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <ThemedText type="title" style={{ color: theme.text }}>Focus Session</ThemedText>
          <ThemedText style={{ color: theme.greyText, marginTop: 8 }}>Ready to lock in?</ThemedText>
        </View>
        
        {/* PROGRESS AREA: Neumorphic Circular Visual */}
        <View style={styles.progressContainer}>
          <NeumorphicView style={styles.progressCircleOut} level="convex">
            <View style={styles.progressCircleInner}>
               <Ionicons name="flash" size={64} color={theme.accent} />
            </View>
          </NeumorphicView>
        </View>

        {/* TIMER CONTROL: Session details and action button */}
        <View style={styles.timerWrapper}>
          <View style={styles.timeGroup}>
            <ThemedText style={[styles.timerText, { color: theme.text }]}>25:00</ThemedText>
            <ThemedText style={[styles.sessionStatus, { color: theme.greyText }]}>Pomodoro • 1/4</ThemedText>
          </View>
          
          <TouchableOpacity activeOpacity={0.8} style={styles.buttonSpacing}>
            <View style={[styles.primaryButton, { backgroundColor: theme.accent }]}>
              <Ionicons name="play" size={24} color="#FFF" />
              <ThemedText style={styles.buttonText}>START FOCUS</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 24,
    justifyContent: 'space-evenly',
    paddingVertical: 10,
  },
  headerContainer: { 
    alignItems: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleOut: {
    width: 260,
    height: 260,
    borderRadius: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleInner: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 107, 0.1)', // Subtle accent tint
  },
  timerWrapper: { 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, // Keep it from touching absolute bottom
  },
  timeGroup: {
    alignItems: 'center',
    marginBottom: 30, // Forces space before the button pushes up
  },
  timerText: {
    fontSize: 76,
    lineHeight: 85, // Enforces boundary so it doesn't overlap text below
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  sessionStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: -4, // Pulled slightly closer to the top numbers
    textTransform: 'uppercase',
    letterSpacing: 2,
    lineHeight: 22,
  },
  buttonSpacing: {
    width: '85%', // Slightly wider to hold weight
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    letterSpacing: 1.5,
  }
});