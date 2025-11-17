// File: flota_app/screens/LoginScreen.js

import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Para el fondo
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Iconos
import { theme } from '../lib/theme'; // Nuestro sistema de diseño

const LoginScreen = ({ onLogin, apiBaseUrl }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Por favor, ingrese usuario y contraseña.');
      return;
    }

    setLoading(true);
    
    try {
      const url = `${apiBaseUrl}auth/login`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email.toLowerCase().trim(), password }),
      });
      
      const data = await response.json();

      if (response.ok && data.token && data.user) {
        const cargo = data.user.cargo ? data.user.cargo.toLowerCase() : '';
        if (cargo !== 'conductor') {
           Alert.alert('Acceso Denegado', 'Esta app es exclusiva para conductores.');
           setLoading(false);
           return;
        }
        onLogin(data.user, data.token);
      } else {
        Alert.alert('Error de Acceso', data.message || 'Credenciales inválidas.');
      }
    } catch (err) {
      Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Fondo con Degradado */}
      <LinearGradient
        colors={[theme.colors.primary, '#2563eb']} // De azul oscuro a azul medio
        style={styles.background}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        {/* --- LOGO Y CABECERA --- */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="truck-fast" size={60} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Flota Somyl</Text>
          <Text style={styles.subtitle}>Portal de Conductores</Text>
        </View>

        {/* --- FORMULARIO --- */}
        <View style={styles.formCard}>
          <Text style={styles.welcomeText}>Iniciar Sesión</Text>
          
          {/* Input Correo */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={24} color={theme.colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Correo Electrónico"
              placeholderTextColor={theme.colors.textSecondary}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
            />
          </View>

          {/* Input Contraseña */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock-outline" size={24} color={theme.colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry
              onChangeText={setPassword}
              value={password}
            />
          </View>

          {/* Botón Ingresar */}
          <TouchableOpacity 
            style={styles.loginBtn} 
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.btnContent}>
                <Text style={styles.loginText}>INGRESAR</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>v1.0.0 | Datix</Text>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.l,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    ...theme.shadows.modal, // Sombra fuerte
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff', // Azul muy claro
    marginTop: 5,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.xl,
    width: '100%',
    ...theme.shadows.card, // Sombra suave
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: theme.borderRadius.m,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 56,
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: theme.colors.text,
  },
  loginBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.m,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    ...theme.shadows.card,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loginText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 12,
  },
});

export default LoginScreen;