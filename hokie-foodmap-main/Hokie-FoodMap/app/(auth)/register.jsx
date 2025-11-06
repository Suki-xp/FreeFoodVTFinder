import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, ImageBackground } from 'react-native';
import { withTiming, runOnJS, useSharedValue } from 'react-native-reanimated'
import router, { useRouter } from 'expo-router'
import TitleCard from '../../components/TitleCard';

export default function Register() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter()
  const slideUp = useSharedValue(0)

  const backgroundImage =  { uri : 'https://img.freepik.com/free-vector/food-doodle-frame-beige-background-vector_53876-167977.jpg?semt=ais_hybrid&w=740&q=80' };

  const handleRegister = async () => {
    // Simple VT email validation
    if (!email.includes('@vt.edu')) {
      setMessage('Please enter a valid VT email.');
      return
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }), // Only send the email
      });

      const data = await response.json(); // Safe to log
      console.log('Register response:', data)

      if (data.status == 'success') {
        setMessage('Registration successful!')

        slideUp.value = withTiming(-100, { duration: 400}, (finished) => {
          if (finished) {
            runOnJS(router.push)('../(dashboard)/homepage')
          }
      })

      } else {
        setMessage('Registration failed: ' + data.message)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setMessage('Network error. Try again.')
    }
  }

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
        <TitleCard titleLines={['Register']} />

        <TextInput
          style={styles.input}
          placeholder="Enter VT email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    alignItems: 'center'
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20, 
    textAlign: 'center' 
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
  },
  buttonText: { 
    color: '#fff', 
    textAlign: 'center', 
    fontWeight: 'bold' 
  },
  background: {
        flex: 1,
        alignItems: 'center',
        resizeMode: 'cover',
        justifyContent: 'center'
    },
})
