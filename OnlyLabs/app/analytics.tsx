import React from 'react';
import { StyleSheet, useColorScheme, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NeumorphicView } from '@/components/NeuromorphicView';
import { Colors } from '@/constants/Colours';
import { Ionicons } from '@expo/vector-icons';

const weeklyData = [
  { day: 'M', hours: 4.5, active: true },
  { day: 'T', hours: 3.2, active: true },
  { day: 'W', hours: 5.0, active: true },
  { day: 'T', hours: 0, active: false },
  { day: 'F', hours: 2.1, active: true },
  { day: 'S', hours: 6.5, active: true },
  { day: 'S', hours: 0, active: false },
];

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const maxHours = Math.max(...weeklyData.map(d => d.hours), 1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <ThemedText type="title" style={{ color: theme.text }}>Activity Logs</ThemedText>
          <ThemedText style={{ color: theme.greyText, marginTop: 4 }}>This Week</ThemedText>
        </View>

        {/* Weekly Summary Widget */}
        <NeumorphicView style={styles.summaryCard} level="convex">
          <View style={styles.summaryHeader}>
            <View>
              <ThemedText style={styles.summaryTitle}>Total Focus Time</ThemedText>
              <ThemedText style={[styles.summaryTime, { color: theme.text }]}>21h 18m</ThemedText>
            </View>
            <View style={[styles.iconContainer, { backgroundColor: theme.accent + '20' }]}>
              <Ionicons name="flame" size={24} color={theme.accent} />
            </View>
          </View>

          {/* Bar Chart */}
          <View style={styles.chartContainer}>
            {weeklyData.map((data, index) => {
              const barHeight = data.active ? (data.hours / maxHours) * 100 : 0;
              return (
                <View key={index} style={styles.barWrapper}>
                  <View style={styles.barBackground}>
                    {data.active && (
                      <View 
                        style={[
                          styles.barFill, 
                          { height: `${barHeight}%`, backgroundColor: index === 5 ? theme.accent : theme.greyText }
                        ]} 
                      />
                    )}
                  </View>
                  <ThemedText style={[styles.dayLabel, { color: index === 5 ? theme.accent : theme.greyText }]}>
                    {data.day}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </NeumorphicView>

        {/* Action / Monthly Calendar View Placeholder */}
        <View style={styles.sectionHeader}>
          <ThemedText type="defaultSemiBold" style={{ color: theme.text, fontSize: 18 }}>Monthly Trends</ThemedText>
          <Ionicons name="chevron-forward" size={20} color={theme.greyText} />
        </View>

        <NeumorphicView style={styles.calendarCard} level="convex">
          <View style={styles.calendarHeader}>
            <ThemedText style={styles.monthText}>April 2026</ThemedText>
            <View style={styles.calendarControls}>
              <Ionicons name="chevron-back" size={20} color={theme.text} style={{ marginRight: 15 }} />
              <Ionicons name="chevron-forward" size={20} color={theme.text} />
            </View>
          </View>
          
          <View style={styles.daysRow}>
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, i) => (
              <ThemedText key={i} style={[styles.calendarDayText, { color: theme.greyText }]}>{day}</ThemedText>
            ))}
          </View>

          {/* Dummy Calendar Grid */}
          <View style={styles.gridRow}>
             {[29, 30, 31, 1, 2, 3, 4].map((num, i) => (
               <View key={i} style={[styles.gridCell, num === 4 && { backgroundColor: theme.accent, borderRadius: 10 }]}>
                 <ThemedText style={[
                   styles.cellText, 
                   num > 28 ? { color: theme.greyText } : { color: theme.text },
                   num === 4 && { color: '#FFF', fontWeight: 'bold' }
                 ]}>{num}</ThemedText>
                 {num < 5 && num !== 4 && <View style={[styles.dot, { backgroundColor: theme.accent }]} />}
               </View>
             ))}
          </View>
          <View style={styles.gridRow}>
             {[5, 6, 7, 8, 9, 10, 11].map((num, i) => (
               <View key={i} style={styles.gridCell}>
                 <ThemedText style={[styles.cellText, { color: theme.text }]}>{num}</ThemedText>
               </View>
             ))}
          </View>
        </NeumorphicView>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  headerContainer: { 
    marginBottom: 30,
  },
  summaryCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryTime: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
  },
  barWrapper: {
    alignItems: 'center',
    width: 32,
  },
  barBackground: {
    width: 12,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  dayLabel: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  calendarCard: {
    borderRadius: 24,
    padding: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
  },
  calendarControls: {
    flexDirection: 'row',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  calendarDayText: {
    width: 30,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridCell: {
    width: 32,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 15,
    fontWeight: '500',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 2,
  }
});