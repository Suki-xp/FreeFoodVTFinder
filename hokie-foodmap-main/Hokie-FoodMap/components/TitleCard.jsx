import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TitleCard = ({ titleLines }) => {
  return (
    <View style={styles.card}>
      {titleLines.map((line, idx) => (
        <Text key={idx} style={styles.titleText}>
          {line}
        </Text>
      ))}
    </View>
  );
};

export default TitleCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#800000',
    padding: 40,
    borderRadius: 5,
    boxShadow: '4px 4px rgba(0, 0, 0, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    top: -100
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 40,
    color: 'white',
    textAlign: 'center',
  },
});
