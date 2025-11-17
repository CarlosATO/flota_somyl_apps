// File: flota_app/screens/HistoryScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiFetch } from '../lib/api';
import { theme } from '../lib/theme';

const HistoryScreen = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>
          {new Date(item.fecha_fin_real || item.created_at).toLocaleDateString('es-CL')}
        </Text>
        <View style={[styles.badge, item.estado === 'completada' ? styles.badgeSuccess : styles.badgeCancel]}>
            <Text style={styles.badgeText}>{item.estado.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.ruta}>{item.origen} ➔ {item.destino}</Text>
        <Text style={styles.km}>KM Total: {item.kilometraje_fin ? (item.kilometraje_fin - item.kilometraje_inicio) : '-'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Viajes</Text>
      </View>
      {loading && !refreshing && <ActivityIndicator size="large" color={theme.colors.primary} />}
      <FlatList
        data={historial}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No hay historial reciente.</Text> : null}
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
  date: { color: theme.colors.textSecondary },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeSuccess: { backgroundColor: '#dcfce7' },
  badgeCancel: { backgroundColor: '#fee2e2' },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  ruta: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  km: { marginTop: 4, color: theme.colors.textSecondary },
  empty: { textAlign: 'center', marginTop: 40, color: theme.colors.textSecondary }
});

export default HistoryScreen;