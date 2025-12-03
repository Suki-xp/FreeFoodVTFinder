import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, 
  ActivityIndicator, ScrollView, TextInput, ImageBackground } from 'react-native';
import router, { useRouter } from 'expo-router'

const event_list = () => {

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://172.29.202.125:5001/events');
        const data = await res.json()
        setEvents(data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

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
            <TouchableOpacity 
              key={idx}
              onPress={() => router.push(`(dashboard)/events/${idx}`)}
            >
              <View key={idx} style={styles.card}>
                <Text style={styles.event_title}>{event.title}</Text>
                <Text style={styles.sub}>{event.date}</Text>
                <Text style={styles.sub}>Location: {event.location}</Text>
                <Text style={styles.sub}>Hosted by: {event.hosted_by}</Text>
              </View>
            </TouchableOpacity>
          ))}
    </ScrollView>
  )
}

export default event_list

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
})