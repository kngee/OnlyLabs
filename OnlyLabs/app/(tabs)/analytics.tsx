import { View, Text, StyleSheet } from 'react-native';

export default function Analytics() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>History & Goals</Text>
      {/* TODO: Partner 2 can work on this view.
        - Fetch historical sessions from Supabase
        - Build monthly UI (like Samsung Health)
        - Display deadlines
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});