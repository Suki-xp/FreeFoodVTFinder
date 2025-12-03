import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import router, { useRouter } from 'expo-router';
import TitleCard from '../../components/TitleCard';
import { useUser } from '../UserContext';

export default function Login() {
  const { setUserEmail } = useUser();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const backgroundImage = {
    uri: 'https://img.freepik.com/free-vector/food-doodle-frame-beige-background-vector_53876-167977.jpg?semt=ais_hybrid&w=740&q=80'
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      setMessage('Please enter a valid email.');
      return;
    }

    try {
      const response = await fetch('http://172.29.202.125:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.status === 'success') {
        setUserEmail(email); // save email in context
        setMessage('Login successful!');
        router.push('../(dashboard)/homepage'); // navigate immediately
      } else {
        setMessage('Login failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setMessage('Network error. Try again.');
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
        <TitleCard titleLines={['Login']} />

        <TextInput
          style={styles.input}
          placeholder="Enter your VT email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 10, 
    marginBottom: 10, 
    borderRadius: 5,
    width: 500,
    backgroundColor: 'white',
  },
  message: { 
    color: 'red', 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  button: { 
    backgroundColor: '#007bff', 
    padding: 15, 
    borderRadius: 5, 
    width: 300,
    alignItems: 'center'
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  background: {
    flex: 1,
    alignItems: 'center',
    resizeMode: 'cover',
    justifyContent: 'center'
  },
});
