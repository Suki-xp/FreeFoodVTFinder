import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';

const homepage = () => {
  const userEmail = "student@vt.edu"; // Replace with logged-in user email
  const [events, setEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5001/events'); // Replace with your backend IP
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      try {
        const res = await fetch(`http://<YOUR_IP>:5000/favorites/${userEmail}`);
        const data = await res.json();
        setFavorites(data);
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
      }
    };

    fetchEvents();
    fetchFavorites();
  }, []);

  // Save an event
  const saveEvent = async (event) => {
    try {
      const res = await fetch('http://<YOUR_IP>:5000/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, event })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setFavorites(data.favorites);
      }
    } catch (err) {
      console.error('Error saving event:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E5751F" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upcoming Free Food Events</Text>
      {events.map((event, idx) => (
        <View key={idx} style={styles.card}>
          <Text style={styles.date}>{event.date}</Text>
          <Text style={styles.location}>Location: {event.location}</Text>
          <Text style={styles.host}>Hosted by: {event.hosted_by}</Text>

          <TouchableOpacity style={styles.saveButton} onPress={() => saveEvent(event)}>
            <Text style={{
              color: favorites.some(fav => fav.date === event.date && fav.location === event.location) ? 'gold' : 'gray',
              fontWeight: 'bold'
            }}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

export default homepage;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  card: {
    backgroundColor: '#FFF8E7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
  },
  date: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#E5751F',
  },
  location: { fontSize: 14, color: '#333' },
  host: { fontSize: 14, color: '#555' },
  saveButton: {
    marginTop: 5,
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
