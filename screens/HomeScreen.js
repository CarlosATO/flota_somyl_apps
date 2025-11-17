// File: flota_app/screens/HomeScreen.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StyleSheet, Text, View, FlatList, ActivityIndicator, 
  TouchableOpacity, RefreshControl, Alert, StatusBar, Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

import { apiFetch } from '../lib/api'; 
import { theme } from '../lib/theme';
import { useDriver } from '../lib/DriverContext';
import { supabase } from '../lib/supabase';

import IniciarViajeModal from './IniciarViajeModal.js';
import FinalizarViajeModal from './FinalizarViajeModal.js';
import DetalleOrdenModal from './DetalleOrdenModal.js';

const HomeScreen = ({ user, onLogout }) => {
  const userName = user?.nombre || user?.correo || 'Conductor';
  const { seleccionarOrden, limpiarSeleccion, registrarAccion } = useDriver();
  
  const [viajesAsignados, setViajesAsignados] = useState([]);
  const [viajesEnCurso, setViajesEnCurso] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [selectedId, setSelectedId] = useState(null);

  // Modales
  const [isIniciarVisible, setIniciarVisible] = useState(false);
  const [isFinalizarVisible, setFinalizarVisible] = useState(false);
  const [isDetalleVisible, setDetalleVisible] = useState(false);
  const [ordenActiva, setOrdenActiva] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);

  // --- DEBUG GPS: ESTADO VISUAL ---
  const [gpsStats, setGpsStats] = useState(null); // Para mostrar en pantalla

  // --- GPS REFS ---
  const locationSubscription = useRef(null);
  const routeBuffer = useRef([]);
  const batchTimer = useRef(null);
  const activeOrdenId = useRef(null);

  // --- LÓGICA DE GPS ---

  const flushRouteBuffer = async () => {
    if (routeBuffer.current.length === 0 || !activeOrdenId.current) return;

    const puntosParaEnviar = [...routeBuffer.current];
    routeBuffer.current = []; 

    try {
      console.log(`📡 Enviando ${puntosParaEnviar.length} puntos GPS al servidor...`);
      // Actualizamos el Debug visual
      setGpsStats(prev => ({ ...prev, status: `Enviando ${puntosParaEnviar.length} puntos...`, lastUpload: new Date().toLocaleTimeString() }));
      
      await apiFetch(`api/ordenes/${activeOrdenId.current}/ruta`, {
        method: 'POST',
        body: { puntos: puntosParaEnviar }
      });
      
      setGpsStats(prev => ({ ...prev, status: 'Sincronizado ✅' }));
    } catch (e) {
      console.error("Error enviando ruta:", e);
      setGpsStats(prev => ({ ...prev, status: 'Error de red ❌' }));
    }
  };

  const startTracking = async (ordenId) => {
    if (locationSubscription.current) return;

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'No podemos registrar la ruta sin permiso de ubicación.');
      return;
    }

    activeOrdenId.current = ordenId;
    setGpsStats({ status: 'Iniciando...', count: 0, lat: 0, lng: 0 }); // Reset Stats

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // 5 segundos (para que veas cambios rápido en el debug)
        distanceInterval: 0, // 0 metros (para que registre AUNQUE NO TE MUEVAS)
      },
      (loc) => {
        // Guardar punto en memoria
        routeBuffer.current.push({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          speed: loc.coords.speed,
          timestamp: new Date(loc.timestamp).toISOString()
        });

        // --- DEBUG GPS: ACTUALIZAR PANTALLA ---
        // Esto hará que veas los números cambiar en tu teléfono
        setGpsStats({
            status: 'Rastreando 🛰️',
            lat: loc.coords.latitude.toFixed(5),
            lng: loc.coords.longitude.toFixed(5),
            count: routeBuffer.current.length, // Puntos en memoria (sin enviar)
            total: (routeBuffer.current.length), // Acumulado simple visual
            lastUpdate: new Date().toLocaleTimeString()
        });
      }
    );

    batchTimer.current = setInterval(flushRouteBuffer, 30000); // Envío cada 30s
  };

  const stopTracking = async () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    if (batchTimer.current) {
      clearInterval(batchTimer.current);
      batchTimer.current = null;
    }
    await flushRouteBuffer();
    activeOrdenId.current = null;
    setGpsStats(null); // Limpiar panel de debug
  };

  useEffect(() => {
    if (viajesEnCurso.length > 0 && !locationSubscription.current) {
       startTracking(viajesEnCurso[0].id);
    }
  }, [viajesEnCurso]);


  // --- FETCH DATOS ---
  const fetchTodosLosViajes = async () => {
    setLoading(true);
    try {
      const [resAsignados, resEnCurso] = await Promise.all([
        apiFetch('api/ordenes/conductor/activas'),
        apiFetch('api/ordenes/conductor/en_curso')
      ]);

      if (resAsignados.status === 200) setViajesAsignados(resAsignados.data.data || []);
      if (resEnCurso.status === 200) setViajesEnCurso(resEnCurso.data.data || []);
      
      setSelectedId(null); 

    } catch (err) {
      Alert.alert("Error", "Revisa tu conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTodosLosViajes(); }, []);
  
  const onRefresh = useCallback(() => { 
    setRefreshing(true); 
    fetchTodosLosViajes().then(() => setRefreshing(false)); 
  }, []);

  useEffect(() => {
    registrarAccion(() => handleMainAction());
    return () => registrarAccion(() => {});
  }, [selectedId, viajesAsignados, viajesEnCurso]);

  const handleSelectCard = (orden) => {
    if (!orden || selectedId === orden.id) {
        setSelectedId(null);
        limpiarSeleccion();
    } else {
        setSelectedId(orden.id);
        const accion = orden.estado === 'en_curso' ? 'FINALIZAR' : 'INICIAR';
        seleccionarOrden(orden, accion);
    }
  };

  const handleVerDetalles = (orden) => { setOrdenActiva(orden); setDetalleVisible(true); };

  const handleMainAction = () => {
    if (!global.currentSelectedId) return; 
    const orden = [...viajesAsignados, ...viajesEnCurso].find(o => o.id === global.currentSelectedId);
    if (!orden) return;

    setOrdenActiva(orden);
    if (orden.estado === 'en_curso') {
      setFinalizarVisible(true);
    } else {
      setIniciarVisible(true);
    }
  };
  
  useEffect(() => { global.currentSelectedId = selectedId; }, [selectedId]);

  const onConfirmarIniciar = async (datosModal) => {
      if (!ordenActiva) return;
      setSubmitting(true);
      try {
        const res = await apiFetch(`api/ordenes/${ordenActiva.id}/iniciar`, {
            method: 'POST',
            body: { kilometraje_inicio: datosModal.kilometraje_inicio, observacion_inicio: datosModal.observacion_inicio }
        });
        if (res.status !== 200) throw new Error(res.data.message);

        if (datosModal.foto) {
            const foto = datosModal.foto;
            const fileExt = foto.uri.split('.').pop();
            const fileName = `evidencia_inicio_${new Date().getTime()}.${fileExt}`;
            const filePath = `orden_${ordenActiva.id}/${fileName}`;

            const formData = new FormData();
            formData.append('file', {
                uri: foto.uri, name: fileName, type: foto.mimeType || 'image/jpeg',
            });

            const { error: uploadError } = await supabase.storage
              .from('adjuntos_ordenes')
              .upload(filePath, formData);
            
            if (uploadError) throw new Error("Fallo subida de foto.");

            await apiFetch(`api/ordenes/${ordenActiva.id}/adjuntos`, {
              method: 'POST',
              body: {
                storage_path: filePath,
                nombre_archivo: `Evidencia Inicio - ${fileName}`,
                mime_type: foto.mimeType || 'image/jpeg',
                tipo_adjunto: 'inicio'
              }
            });
        }
        
        startTracking(ordenActiva.id); // Iniciar GPS
        
        setIniciarVisible(false);
        handleSelectCard(null); 
        Alert.alert('¡Buen Viaje!', 'Ruta iniciada y GPS activado.');
        fetchTodosLosViajes();
      } catch (e) { Alert.alert('Error', e.message); }
      finally { setSubmitting(false); }
  };

  const onConfirmarFinalizar = async (datosModal) => {
    setSubmitting(true);
    try {
      await stopTracking(); // Parar GPS primero

      const res = await apiFetch(`api/ordenes/${ordenActiva.id}/finalizar`, { method: 'POST', body: datosModal });
      
      if (res.status === 200) {
        // Optimizamos el orden de cierre para evitar parpadeo
        setFinalizarVisible(false);
        setSelectedId(null); // Limpiamos localmente primero
        limpiarSeleccion();  // Limpiamos el contexto
        
        Alert.alert('Misión Cumplida', 'Viaje finalizado.');
        fetchTodosLosViajes();
      } else {
        Alert.alert('Error', res.data.message);
      }
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSubmitting(false); }
  };

  const renderViaje = ({ item }) => {
    const esEnCurso = item.estado === 'en_curso';
    const isSelected = selectedId === item.id;

    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => handleSelectCard(item)}
        style={[styles.card, isSelected && styles.cardSelected, esEnCurso && styles.cardActiveBorder]}
      >
        {isSelected && (
            <View style={styles.checkIcon}>
                <MaterialCommunityIcons name="check-circle" size={28} color={theme.colors.primary} />
            </View>
        )}
        <View style={[styles.cardHeader, esEnCurso ? styles.headerActive : styles.headerPending]}>
            <Text style={styles.cardIdText}>Orden #{item.id}</Text>
            <Text style={styles.cardDateText}>
                {esEnCurso ? "EN CURSO" : new Date(item.fecha_inicio_programada).toLocaleDateString('es-CL')}
            </Text>
        </View>
        <View style={styles.cardBody}>
            <View style={styles.row}>
                <MaterialCommunityIcons name="map-marker-path" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.routeText}> {item.origen} ➔ {item.destino}</Text>
            </View>
            <Text style={styles.vehicleText}>{item.vehiculo?.placa} • {item.vehiculo?.modelo}</Text>
        </View>
        <TouchableOpacity style={styles.detailsButton} onPress={() => handleVerDetalles(item)}>
            <Text style={styles.detailsText}>VER DETALLES</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.secondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.topHeader}>
        <View style={styles.headerContent}>
            <View>
                <Text style={styles.welcomeLabel}>Hola,</Text>
                <Text style={styles.userLabel}>{userName}</Text>
            </View>
            <TouchableOpacity onPress={onLogout}><MaterialCommunityIcons name="logout" size={24} color="white" /></TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
          {loading && !refreshing && <ActivityIndicator size="large" color={theme.colors.primary} style={{marginTop:20}}/>}
          <FlatList
            data={[...viajesEnCurso, ...viajesAsignados]}
            renderItem={renderViaje}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListHeaderComponent={<Text style={styles.sectionTitle}>Tus Rutas</Text>}
            extraData={selectedId}
          />
      </View>

      <DetalleOrdenModal visible={isDetalleVisible} orden={ordenActiva} onClose={() => setDetalleVisible(false)} />
      <IniciarViajeModal visible={isIniciarVisible} orden={ordenActiva} onConfirmar={onConfirmarIniciar} onCancelar={() => setIniciarVisible(false)} submitting={isSubmitting} />
      <FinalizarViajeModal visible={isFinalizarVisible} orden={ordenActiva} onConfirmar={onConfirmarFinalizar} onCancelar={() => setFinalizarModalVisible(false)} submitting={isSubmitting} />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: theme.colors.background },
  topHeader: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeLabel: { color: 'rgba(255,255,255,0.8)' },
  userLabel: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  
  // ESTILOS DEL PANEL DEBUG
  debugPanel: {
    backgroundColor: '#1e293b',
    margin: 16,
    marginTop: -10, // Para superponerse un poco o ajustar
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  debugTitle: { color: '#4ade80', fontWeight: 'bold', fontSize: 12, marginBottom: 4, textAlign: 'center' },
  debugRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  debugText: { color: '#e2e8f0', fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  contentContainer: { flex: 1, marginTop: 0 },
  sectionTitle: { margin: 16, marginBottom: 8, fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  
  card: { backgroundColor: 'white', borderRadius: 12, marginBottom: 16, ...theme.shadows.card, borderWidth: 2, borderColor: 'transparent' },
  cardSelected: { borderColor: theme.colors.primary, backgroundColor: '#f8fafc' },
  cardActiveBorder: { borderLeftWidth: 5, borderLeftColor: theme.colors.danger },
  checkIcon: { position: 'absolute', top: -10, right: -10, zIndex: 10, backgroundColor: 'white', borderRadius: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  headerPending: {},
  headerActive: { backgroundColor: '#fef2f2' },
  cardIdText: { fontWeight: 'bold', color: theme.colors.text },
  cardDateText: { color: theme.colors.textSecondary },
  cardBody: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  routeText: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  vehicleText: { marginLeft: 24, color: theme.colors.textSecondary },
  detailsButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderColor: '#f1f5f9', backgroundColor: '#fafafa' },
  detailsText: { color: theme.colors.secondary, fontWeight: 'bold', fontSize: 12, marginRight: 4 },
});

export default HomeScreen;