import { View, Text, StyleSheet } from 'react-native';

export default function Friends() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lab Community</Text>
      {/* TODO: 
        - Show who is currently in the lab
        - Build daily photo / status feed
        - Handle friend requests 
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});