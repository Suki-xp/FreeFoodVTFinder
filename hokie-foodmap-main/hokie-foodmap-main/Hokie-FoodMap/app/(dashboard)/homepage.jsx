import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  ActivityIndicator, ScrollView, TextInput, ImageBackground 
} from 'react-native';
import router, { useRouter } from 'expo-router';
import { useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import Spacer from '../../components/Spacer';

const Homepage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const MAX_EVENTS_PREVIEW = 3;
  const previewEvents = events.slice(0, MAX_EVENTS_PREVIEW);

  const router = useRouter();
  const slideUp = useSharedValue(0);
  const backgroundImage = { uri: 'https://students.vt.edu/content/students_vt_edu/en/index/_jcr_content/cta/adaptiveimage.img.jpg/1755686660037.jpg' };

  const handlePress = (target) => {
    slideUp.value = withTiming(-100, { duration: 400 }, (finished) => {
      if (finished) runOnJS(router.push)(target);
    });
  };

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://172.29.202.125:5001/events'); 
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter events on search input
  const handleSearchChange = (text) => {
    setSearch(text);
    if (text.trim() === '') {
      setFilteredEvents([]);
    } else {
      const matches = events.filter(event =>
        event.title.toLowerCase().includes(text.toLowerCase()) ||
        event.description.toLowerCase().includes(text.toLowerCase()) ||
        event.hosted_by.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredEvents(matches);
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
      <ImageBackground source={backgroundImage} style={styles.topBackground}>
        <View style={{ width: 350 }}>
          <TextInput
            style={styles.input}
            placeholder="Search for Event"
            value={search}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
          />
          {filteredEvents.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {filteredEvents.slice(0, 5).map((event, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => router.push(`(dashboard)/events/${events.indexOf(event)}`)}
                  style={styles.suggestionItem}
                >
                  <Text>{event.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <Text style={{ marginLeft: 250, fontWeight: 'bold', backgroundColor: '#E5751F' }}>Filter Options</Text>
        </View>
      </ImageBackground>

      <Spacer height={25} />

      <Text style={styles.title}>Upcoming Free Food Events</Text>
      {previewEvents.map((event, idx) => (
        <TouchableOpacity 
          key={idx}
          onPress={() => router.push(`(dashboard)/events/${idx}`)}
        >
          <View style={styles.card}>
            <Text style={styles.event_title}>{event.title}</Text>
            <Text style={styles.sub}>{event.date}</Text>
            <Text style={styles.sub}>Location: {event.location}</Text>
            <Text style={styles.sub}>Hosted by: {event.hosted_by}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {events.length > MAX_EVENTS_PREVIEW && (
        <TouchableOpacity>
          <Text 
            onPress={() => handlePress('./event_list')} 
            style={{ borderBottomWidth: 2 }}
          >
            See All
          </Text>
        </TouchableOpacity>
      )}

      <Spacer height={50} />

      <View>
        <Text style={styles.title}>Map</Text>
      </View>
    </ScrollView>
  );
};

export default Homepage;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    flex: 1
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 10, 
    marginBottom: 10, 
    borderRadius: 5,
    width: 350,
    backgroundColor: 'white',
  },
  topBackground: {
    width: '100%',
    height: 400,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center'
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 5, // space below TextInput
    maxHeight: 200,
    zIndex: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
