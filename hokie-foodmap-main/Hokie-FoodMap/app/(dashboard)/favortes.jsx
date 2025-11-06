import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';


const favorites = () => {
    const [favorites, setFavorites] = useState([]);

    const fetchFavorites = async () => {
      try {
        const res = await fetch(`http://<YOUR_IP>:5000/favorites/${userEmail}`);
        const data = await res.json();
        setFavorites(data);
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
      }
    };
}