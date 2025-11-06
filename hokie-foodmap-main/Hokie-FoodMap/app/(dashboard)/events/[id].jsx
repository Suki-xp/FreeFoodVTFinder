import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useUser } from '../../UserContext';
import Spacer from '../../../components/Spacer';

export default function EventDetail() {
  const { userEmail } = useUser();
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://172.16.3.143:5001/events');
        const data = await res.json();
        const index = parseInt(id, 10);
        setEvent(data[index]);
      } catch (err) {
        console.error('Failed to fetch event: ', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [id]);

  const saveEvent = async (event) => {
    try {
      const res = await fetch('http://<YOUR_IP>:5000/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, event }),
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

  if (!event) {
    return (
      <View style={styles.center}>
        <Text>No event found.</Text>
      </View>
    );
  }

  return (
    <>
        <Stack.Screen options={{ title: 'Event' }} />
            <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{event.title}</Text>

            <Spacer height={50} />

            <View style={styles.info}>
              <Text style={styles.date}>{event.date}</Text>
              <Text style={styles.location}>Location: {event.location}</Text>
              <Text style={styles.host}>Hosted by: {event.hosted_by}</Text>
            </View>

            <Spacer height={50} />

            <View style={styles.desc}>
              <Text style={{ fontWeight: 'bold' }}>{event.description}</Text>
            </View>

            <Spacer height={50} />

                <TouchableOpacity style={styles.saveButton} onPress={() => saveEvent(event)}>
                    <Text
                    style={{
                        color: favorites.some(
                        (fav) => fav.date === event.date && fav.location === event.location
                        )
                        ? 'gold'
                        : 'gray',
                        fontWeight: 'bold',
                    }}
                    >
                    Save
                    </Text>
                </TouchableOpacity>
            </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'content',
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    marginTop: 5,
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    marginBottom: 4,
  },
  host: {
    fontSize: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    borderBottomWidth: 2,
  },
  info: {
    backgroundColor: '#ffd9d9',
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 15,
    paddingBottom: 15,
  },
  desc: {
    borderWidth: 3,
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 15,
    paddingBottom: 15,
  }
});
