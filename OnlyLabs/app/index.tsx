import { View, Text, StyleSheet, Button } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lab Timer & Progress</Text>
      {/* TODO: Partner 1 can build out the Timer component here.
        - Add toggle button for lab session
        - Add weekly/daily hours tracking UI
        - Add Pomodoro settings
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});