// File: flota_app/screens/MapaHistorialModal.js

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { apiFetch } from '../lib/api';

const MapaHistorialModal = ({ visible, orden, onClose }) => {
  const [puntos, setPuntos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar la ruta cuando se abre el modal
  useEffect(() => {
    if (visible && orden) {
      cargarRuta();
    } else {
      setPuntos([]);
    }
  }, [visible, orden]);

  const cargarRuta = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`api/ordenes/${orden.id}/ruta`);
      if (res.status === 200) {
        // Convertir al formato que pide el mapa { latitude, longitude }
        const coords = (res.data.data || []).map(p => ({
          latitude: p.latitud,
          longitude: p.longitud
        }));
        setPuntos(coords);
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo cargar la ruta del servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !orden) return null;

  // Calcular región inicial (centro del mapa)
  const regionInicial = puntos.length > 0 ? {
    latitude: puntos[0].latitude,
    longitude: puntos[0].longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : {
    // Default (Santiago aprox) si no hay puntos aún
    latitude: -33.4489, 
    longitude: -70.6693,
    latitudeDelta: 0.1, 
    longitudeDelta: 0.1
  };

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Encabezado */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Ruta Orden #{orden.id}</Text>
          <View style={{width: 24}} /> 
        </View>

        {/* Mapa */}
        <View style={styles.mapContainer}>
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{marginTop: 10}}>Cargando ruta GPS...</Text>
                </View>
            ) : puntos.length === 0 ? (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="map-marker-off" size={50} color="#ccc" />
                    <Text style={{marginTop: 10, color: '#666'}}>No hay datos de GPS para este viaje.</Text>
                </View>
            ) : (
                <MapView
                    style={styles.map}
                    initialRegion={regionInicial}
                    // provider={PROVIDER_GOOGLE} // Descomentar si usas Google Maps en Android
                >
                    {/* Línea de la ruta */}
                    <Polyline
                        coordinates={puntos}
                        strokeColor={theme.colors.primary}
                        strokeWidth={4}
                    />
                    
                    {/* Marcador Inicio */}
                    <Marker coordinate={puntos[0]} title="Inicio" pinColor="green" />
                    
                    {/* Marcador Fin */}
                    <Marker coordinate={puntos[puntos.length - 1]} title="Fin" pinColor="red" />
                </MapView>
            )}
        </View>
        
        {/* Info Pie de Página */}
        <View style={styles.footer}>
             <Text style={styles.footerText}>{orden.origen} ➔ {orden.destino}</Text>
             <Text style={styles.footerSub}>{puntos.length} puntos registrados</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { 
    height: 90, paddingTop: 40, paddingHorizontal: 20, 
    backgroundColor: theme.colors.primary, flexDirection: 'row', 
    alignItems: 'center', justifyContent: 'space-between' 
  },
  title: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  mapContainer: { flex: 1 },
  map: { width: '100%', height: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee' },
  footerText: { fontWeight: 'bold', fontSize: 16, color: theme.colors.text },
  footerSub: { color: theme.colors.textSecondary, fontSize: 12 }
});

export default MapaHistorialModal;