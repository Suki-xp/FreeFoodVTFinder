import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useUser } from '../../UserContext';
import Spacer from '../../../components/Spacer';

export default function EventDetail() {
  const { userEmail } = useUser();
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [message, setMessage] = useState('');
  const BACKEND_URL = 'http://172.29.202.125:5001';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://172.29.202.125:5001/events');
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

  useEffect(() => {
    const loadFavorites = async () => {
      if (!userEmail) return;
      const res = await fetch(`http://172.29.202.125:5002/favorites?email=${userEmail}`);
      const data = await res.json();
      setFavorites(data);
    };
    loadFavorites();
  }, [userEmail]);

  const isSaved = event && favorites.some(fav => fav.url === event.url);

  const saveEvent = async (event) => {
    try {
      const res = await fetch("http://172.29.202.125:5002/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, event }),
      });
      const data = await res.json();

      setMessage(data.status === 'success' ? 'Successfully saved event!' : 'Error saving event, please try again.');

      // Always refresh favorites after toggling
      const favRes = await fetch(`http://172.29.202.125:5002/favorites?email=${userEmail}`);
      const favData = await favRes.json();
      setFavorites(favData);
    } catch (err) {
      console.error("Error saving event:", err);
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

  const staticMapUri = event?.geocoding?.staticMap
    ? `${BACKEND_URL}/${event.geocoding.staticMap}`
    : "https://as2.ftcdn.net/jpg/03/08/79/37/1000_F_308793715_1DyuYRQMc0BndndPiPajiKkNSGqM8L50.jpg";
  console.log('Event static map URL:', `${staticMapUri}`);

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

        <View>
          <img
            src={staticMapUri}
            alt="Static map"
            style={{ width: "100%", height: 250, borderRadius: 10, objectFit: "cover" }}
          />
        </View>

        <Spacer height={50} />

        <TouchableOpacity style={styles.saveButton} onPress={() => saveEvent(event)}>
          <Text
            style={{
              fontSize: 25,
              color: isSaved ? '#fffdbf' : '#e3e3e3',
              fontWeight: 'bold',
            }}
          >
            {isSaved ? "Saved" : "Save"}
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
    padding: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#636363',
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
