// File: flota_app/App.js

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './screens/LoginScreen'; 
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import { API_BASE_URL } from './config.js'; 
import { theme } from './lib/theme';
import { DriverProvider, useDriver } from './lib/DriverContext'; 

const Tab = createBottomTabNavigator();

// --- BOTÓN CENTRAL PERSONALIZADO (DISEÑO MEJORADO) ---
const CustomTabBarButton = ({ children, onPress }) => {
  const { accionBotón, ordenSeleccionada, onMainAction } = useDriver(); 

  // Si no hay selección, botón desactivado/invisible
  if (!ordenSeleccionada) {
    return (
      <View style={{ top: -22, justifyContent: 'center', alignItems: 'center', width: 70 }}>
         {/* Placeholder invisible para mantener el espacio */}
         <View style={{width: 50, height: 50}} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={{
        top: -22, // Elevado para salir de la barra
        justifyContent: 'center',
        alignItems: 'center',
        ...styles.shadow
      }}
      onPress={() => {
        // ¡CORRECCIÓN DEL ERROR! Llamamos a la función del contexto directamente
        if (onMainAction) onMainAction();
      }}
      activeOpacity={0.9}
    >
      <View style={[
        styles.activeBtn, 
        { backgroundColor: accionBotón === 'FINALIZAR' ? theme.colors.danger : theme.colors.success }
      ]}>
        <MaterialCommunityIcons 
          name={accionBotón === 'FINALIZAR' ? "flag-checkered" : "play"} 
          size={32} 
          color="white" 
        />
      </View>
    </TouchableOpacity>
  );
};

function DriverTabs({ user, handleLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: '#ffffff',
          borderRadius: 20, // Más redondeado
          height: 70,       // Altura ajustada
          paddingBottom: 10, 
          ...styles.shadow
        }
      }}
    >
      <Tab.Screen 
        name="Inicio" 
        options={{
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons name="truck-fast" size={28} color={color} />
          ),
        }}
      >
        {(props) => <HomeScreen {...props} user={user} onLogout={handleLogout} />}
      </Tab.Screen>

      {/* PESTAÑA CENTRAL */}
      <Tab.Screen 
        name="Acción" 
        component={View} 
        options={{
          tabBarLabel: '', // Sin texto para que el botón destaque más
          tabBarButton: (props) => <CustomTabBarButton {...props} />
        }}
        listeners={{ tabPress: (e) => e.preventDefault() }}
      />
      
      <Tab.Screen 
        name="Historial" 
        component={HistoryScreen} 
        options={{
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons name="history" size={28} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        try { setUser(JSON.parse(storedUser)); } catch (e) {}
      }
      setIsLoading(false);
    };
    loadSession();
  }, []);

  const handleLogin = async (userData, userToken) => {
    setToken(userToken); setUser(userData);
    await AsyncStorage.setItem('token', userToken);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    setToken(null); setUser(null);
    await AsyncStorage.removeItem('token'); await AsyncStorage.removeItem('user');
  };

  if (isLoading) return <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator size="large"/></View>;

  return (
    <DriverProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        {token && user ? <DriverTabs user={user} handleLogout={handleLogout} /> : <LoginScreen onLogin={handleLogin} apiBaseUrl={API_BASE_URL} />}
      </NavigationContainer>
    </DriverProvider>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5
  },
  // ESTILO DEL BOTÓN REDONDO MEJORADO
  activeBtn: {
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    borderWidth: 4, 
    borderColor: '#f2f2f2', // Borde blanco/gris para separar visualmente
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra interna del botón
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  }
});