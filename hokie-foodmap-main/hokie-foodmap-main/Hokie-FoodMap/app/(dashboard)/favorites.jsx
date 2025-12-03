import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUser } from '../UserContext';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { userEmail } = useUser();

  useFocusEffect(
    useCallback(() => {
      let isActive = true; // prevent state updates if page is unmounted
      const fetchData = async () => {
        setLoading(true);
        try {
          // fetch all events
          const resEvents = await fetch('http://172.29.202.125:5001/events');
          const eventsData = await resEvents.json();
          if (!isActive) return;
          setEvents(eventsData);

          // fetch favorites
          const resFavs = await fetch(`http://172.29.202.125:5002/favorites?email=${userEmail}`);
          const favData = await resFavs.json();
          if (!isActive) return;
          setFavorites(favData);
        } catch (err) {
          console.error("Failed to load favorites:", err);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      if (userEmail) fetchData();

      return () => { isActive = false; }; // cleanup
    }, [userEmail])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E5751F" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Favorited Events</Text>
      {favorites.map((fav) => {
        // find index of favorite in events array
        const index = events.findIndex(ev => ev.url === fav.url);
        if (index === -1) return null; // skip if not found

        return (
          <TouchableOpacity key={fav.url} onPress={() => router.push(`(dashboard)/events/${index}`)}>
            <View style={styles.card}>
              <Text style={styles.event_title}>{fav.title}</Text>
              <Text style={styles.sub}>{fav.date}</Text>
              <Text style={styles.sub}>Location: {fav.location}</Text>
              <Text style={styles.sub}>Hosted by: {fav.hosted_by}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default FavoritesPage;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    backgroundColor: '#861F41',
    paddingLeft: 100,
    paddingRight: 100,
    paddingTop: 10,
    paddingBottom: 10,
    color: 'white'
  },
  card: {
    backgroundColor: '#FFF8E7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
  },
  event_title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#E5751F',
  },
  sub: { 
    fontSize: 14, 
    color: '#333' 
  },
});
