import { ImageBackground, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Spacer from '../components/Spacer'
import { withTiming, runOnJS, useSharedValue } from 'react-native-reanimated'
import router, { useRouter } from 'expo-router'
import TitleCard from '../components/TitleCard'


const Welcome = () => {

    const backgroundImage =  { uri : 'https://img.freepik.com/free-vector/food-doodle-frame-beige-background-vector_53876-167977.jpg?semt=ais_hybrid&w=740&q=80' }
    const router = useRouter()
    const slideUp = useSharedValue(0)
    const handlePress = (target) => {
        slideUp.value = withTiming(-100, { duration: 400}, (finished) => {
        if (finished) {
            runOnJS(router.push)(target)
        }
        })
    }    
    
  return (
    <ImageBackground source = {backgroundImage} style={styles.background}>
        <View style={styles.container}>
            <View>
                <TitleCard titleLines={['Welcome to', 'Hokie Food Map!']} />
            </View>

            <Spacer height={50} />

            <View style={styles.auth}>
                <Text onPress={() => handlePress('(auth)/login')}>
                    Login
                </Text>
            </View>

            <Spacer height={100} />

            <View style={styles.auth}>
                <Text onPress={() => handlePress('(auth)/register')}>
                    Register
                </Text>
            </View>

        </View>
    </ImageBackground>
  )
}

export default Welcome

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    background: {
        flex: 1,
        alignItems: 'center',
        resizeMode: 'cover',
        justifyContent: 'center'
    },
    auth: {
        backgroundColor: '#E5751F',
        padding: 20,
        borderRadius: 5,
    }
    
})
