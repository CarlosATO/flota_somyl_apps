// File: flota_app/screens/HistoryScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, StatusBar, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiFetch } from '../lib/api';
import { theme } from '../lib/theme';
import MapaHistorialModal from './MapaHistorialModal.js'; // Importamos el mapa

const HistoryScreen = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estado para el modal del mapa
  const [mapaVisible, setMapaVisible] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  const fetchHistorial = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('api/ordenes/conductor/historial');
      if (res.status === 200) {
        setHistorial(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistorial(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistorial().then(() => setRefreshing(false));
  }, []);

  // Función para abrir el mapa
  const handleVerMapa = (orden) => {
    setOrdenSeleccionada(orden);
    setMapaVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
        style={styles.card} 
        onPress={() => handleVerMapa(item)} // Al tocar, abre el mapa
        activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.date}>
          {new Date(item.fecha_fin_real || item.created_at).toLocaleDateString('es-CL')}
        </Text>
        <View style={[styles.badge, item.estado === 'completada' ? styles.badgeSuccess : styles.badgeCancel]}>
            <Text style={styles.badgeText}>{item.estado.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <MaterialCommunityIcons name="map-search-outline" size={24} color={theme.colors.primary} style={{marginRight: 10}}/>
            <View style={{flex: 1}}>
                <Text style={styles.ruta}>{item.origen} ➔ {item.destino}</Text>
                <Text style={styles.km}>
                    KM Total: {item.kilometraje_fin ? (item.kilometraje_fin - item.kilometraje_inicio) : '-'}
                </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Viajes</Text>
      </View>
      
      {loading && !refreshing && <ActivityIndicator size="large" color={theme.colors.primary} style={{marginTop: 20}} />}
      
      <FlatList
        data={historial}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No hay historial reciente.</Text> : null}
      />

      {/* Modal del Mapa */}
      <MapaHistorialModal 
        visible={mapaVisible} 
        orden={ordenSeleccionada} 
        onClose={() => setMapaVisible(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
  card: { backgroundColor: 'white', borderRadius: 12, marginBottom: 12, padding: 16, ...theme.shadows.card },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  date: { color: theme.colors.textSecondary, fontSize: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeSuccess: { backgroundColor: '#dcfce7' },
  badgeCancel: { backgroundColor: '#fee2e2' },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  cardBody: { marginTop: 5 },
  ruta: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  km: { marginTop: 4, color: theme.colors.textSecondary, fontSize: 14 },
  empty: { textAlign: 'center', marginTop: 40, color: theme.colors.textSecondary }
});

export default HistoryScreen;