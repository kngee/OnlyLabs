import { StyleSheet, FlatList, Image, useColorScheme, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NeumorphicView } from '@/components/NeuromorphicView';
import { Colors } from '@/constants/Colours';
import { Ionicons } from '@expo/vector-icons';

// Dummy data for example
const labFriends = [
    {id: '1', name: 'Alun H.', status: 'In Lab', lastSeen: 'Active now', avatar: 'https://i.pravatar.cc/150?u=alun'},
    {id: '2', name: 'Jenna', status: 'In Lab', lastSeen: 'Active now', avatar: 'https://i.pravatar.cc/150?u=jenna'},
];

const statusFeed = [
    {id: 'a', userId: '1', name: 'Alun H.', project: 'Smart Greenhouse', lastSeen: '1h ago', avatar: 'https://i.pravatar.cc/150?u=alun', updatePath: 'https://source.unsplash.com/featured/?circuitboard'},
    {id: 'b', userId: '2', name: 'Jenna', project: 'Biometrics Hub', lastSeen: '3h ago', avatar: 'https://i.pravatar.cc/150?u=jenna', updatePath: 'https://source.unsplash.com/featured/?coding'},
];

export default function FriendsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  // Render a 'Card' for the community list (In Lab)
  const renderFriendCard = ({ item }: { item: typeof labFriends[0] }) => (
    <NeumorphicView style={styles.friendCard}>
      <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
      <ThemedView style={styles.friendDetails}>
        <ThemedText style={{fontWeight: '700', color: theme.text}}>{item.name}</ThemedText>
        <ThemedText style={{color: theme.accent, fontSize: 12}}>{item.status}</ThemedText>
      </ThemedView>
      <Ionicons name="location" size={18} color={theme.accent} />
    </NeumorphicView>
  );

  // Render a Status Update (Instagram style)
  const renderStatusUpdate = ({ item }: { item: typeof statusFeed[0] }) => (
      <ThemedView style={styles.statusPostContainer}>
        {/* Post Header */}
        <ThemedView style={styles.postHeader}>
          <Image source={{ uri: item.avatar }} style={styles.postAvatar} />
          <ThemedView style={styles.postHeaderText}>
             <ThemedText style={{fontWeight: '700'}}>{item.name}</ThemedText>
             <ThemedText style={{color: 'gray', fontSize: 12}}>Project: {item.project} - {item.lastSeen}</ThemedText>
          </ThemedView>
          <TouchableOpacity><Ionicons name="ellipsis-horizontal" size={20} color="gray"/></TouchableOpacity>
        </ThemedView>

        {/* Post Content */}
        <NeumorphicView style={styles.postImageContainer}>
          <Image source={{ uri: item.updatePath }} style={styles.postImage}/>
        </NeumorphicView>

        {/* Post Footer/Interaction */}
        <ThemedView style={styles.postFooter}>
            <TouchableOpacity><Ionicons name="heart-outline" size={24} color={theme.text}/></TouchableOpacity>
            <TouchableOpacity><Ionicons name="chatbubble-outline" size={24} color={theme.text}/></TouchableOpacity>
        </ThemedView>
      </ThemedView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={{marginTop: 20, marginBottom: 10, color: theme.text}}>Community</ThemedText>
          
          {/* Section 1: Who's in the lab now (Carousel/Horizontal list) */}
          <ThemedView style={styles.communityCarousel}>
            <FlatList
                data={labFriends}
                renderItem={renderFriendCard}
                keyExtractor={item => item.id}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselPadding}
            />
          </ThemedView>

          {/* Section 2: Daily Status Feed (Vertical scroll) */}
          <ThemedView style={[styles.section, { flex: 1 }]}>
            <ThemedText type="subtitle" style={{marginBottom: 20, color: theme.text}}>Daily Status Updates</ThemedText>
            
            <FlatList
                data={statusFeed}
                renderItem={renderStatusUpdate}
                keyExtractor={item => item.id}
                scrollEnabled={false} // Since we are inside a ScrollView
            />
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  section: { marginTop: 30 },
  // Community List Styles
  communityCarousel: { height: 100, marginVertical: 10, paddingLeft: 0, paddingRight: 0 },
  carouselPadding: { paddingHorizontal: 0 },
  friendCard: {
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 12, 
      paddingHorizontal: 15, 
      paddingVertical: 12,
      borderRadius: 20, 
      marginRight: 15,
      width: 170, // Fixed width for carousel
      height: '90%', // Leave space for shadow
  },
  friendAvatar: { width: 40, height: 40, borderRadius: 20 },
  friendDetails: { flex: 1 },
  // Status Feed Styles
  statusPostContainer: { marginBottom: 40 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
  postAvatar: { width: 34, height: 34, borderRadius: 17 },
  postHeaderText: { flex: 1 },
  postImageContainer: {
      width: '100%',
      aspectRatio: 1, // Square image, like Instagram
      borderRadius: 20,
      overflow: 'hidden',
  },
  postImage: { width: '100%', height: '100%' },
  postFooter: { flexDirection: 'row', gap: 18, marginTop: 15, paddingHorizontal: 5 }
});