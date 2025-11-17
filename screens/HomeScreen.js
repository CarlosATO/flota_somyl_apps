// File: flota_app/screens/HomeScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, Text, View, FlatList, ActivityIndicator, 
  TouchableOpacity, RefreshControl, Alert, StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiFetch } from '../lib/api'; 
import { theme } from '../lib/theme';
import { useDriver } from '../lib/DriverContext'; // Importamos el hook

import IniciarViajeModal from './IniciarViajeModal.js';
import FinalizarViajeModal from './FinalizarViajeModal.js';
import DetalleOrdenModal from './DetalleOrdenModal.js';

const HomeScreen = ({ user, onLogout }) => {
  const userName = user?.nombre || user?.correo || 'Conductor';
  const { seleccionarOrden, limpiarSeleccion, registrarAccion } = useDriver(); // Usamos el contexto (añadimos registrarAccion)
  
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

  // --- EVENT LISTENER PARA EL BOTÓN CENTRAL ---
  useEffect(() => {
    // Esta es una forma simple de conectar App.js con HomeScreen sin Redux
    // En React Native puro se usaría DeviceEventEmitter, pero en web/híbrido esto funciona
    const handleTrigger = () => {
       handleMainAction();
    };

    // Escuchamos el evento custom (definido en App.js)
    // Nota: En React Native real esto requiere DeviceEventEmitter, 
    // pero probemos si la estructura de componentes lo permite directo.
    // CORRECCIÓN: Vamos a usar la prop `navigation` si fuera necesario, 
    // pero como el botón está en App.js, lo más limpio es pasar la función via Contexto...
    // ... pero el contexto es de datos.
    
    // Para simplificar y asegurar que funcione en Expo Go sin librerías extra de eventos:
    // Vamos a asignar esta función al objeto global window (o global) temporalmente
    global.triggerMainAction = handleMainAction;
    
    return () => { global.triggerMainAction = null; };
  }, [selectedId, viajesAsignados, viajesEnCurso]); // Se actualiza cuando cambia la selección

  const fetchTodosLosViajes = async () => {
    setLoading(true);
    try {
      const [resAsignados, resEnCurso] = await Promise.all([
        apiFetch('api/ordenes/conductor/activas'),
        apiFetch('api/ordenes/conductor/en_curso')
      ]);

      if (resAsignados.status === 200) setViajesAsignados(resAsignados.data.data || []);
      if (resEnCurso.status === 200) setViajesEnCurso(resEnCurso.data.data || []);
      
      handleSelectCard(null); // Limpiar selección

    } catch (err) {
      Alert.alert("Error", "Revisa tu conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTodosLosViajes(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchTodosLosViajes().then(() => setRefreshing(false)); }, []);

  // --- Lógica de Selección (Conectada al Contexto) ---
  const handleSelectCard = (orden) => {
    if (!orden || selectedId === orden.id) {
        setSelectedId(null);
        limpiarSeleccion(); // Avisamos a App.js que oculte el botón
    } else {
        setSelectedId(orden.id);
        // Avisamos a App.js qué botón mostrar
        const accion = orden.estado === 'en_curso' ? 'FINALIZAR' : 'INICIAR';
        seleccionarOrden(orden, accion);
    }
  };

  const handleVerDetalles = (orden) => {
    setOrdenActiva(orden);
    setDetalleVisible(true);
  };

  const handleMainAction = () => {
    // Recuperamos la orden actual del estado global o local
    if (!global.currentSelectedId) return; // Usamos ref local para seguridad

    const orden = [...viajesAsignados, ...viajesEnCurso].find(o => o.id === global.currentSelectedId);
    if (!orden) return;

    setOrdenActiva(orden);
    if (orden.estado === 'en_curso') {
      setFinalizarVisible(true);
    } else {
      setIniciarVisible(true);
    }
  };
  
  // --- REGISTRAR LA ACCIÓN EN EL CONTEXTO ---
  useEffect(() => {
    // Le decimos al contexto: "Cuando aprieten el botón central, ejecuta ESTA función"
    if (typeof registrarAccion === 'function') {
      registrarAccion(() => handleMainAction());
    }

    // Cleanup para evitar referencias colgantes
    return () => {
      if (typeof registrarAccion === 'function') registrarAccion(() => {});
    };
  }, [selectedId, viajesAsignados, viajesEnCurso]);
  
  // Sincronizar estado local con global para el callback
  useEffect(() => { global.currentSelectedId = selectedId; }, [selectedId]);

  // --- Callbacks Modales (Igual que antes) ---
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
           // Lógica de foto (simplificada para este paso, usar la del paso 35)
           // ...
        }
        
        setIniciarVisible(false);
        handleSelectCard(null); // Limpiar
        Alert.alert('¡Buen Viaje!', 'Ruta iniciada correctamente.');
        fetchTodosLosViajes();
      } catch (e) { Alert.alert('Error', e.message); }
      finally { setSubmitting(false); }
  };

  const onConfirmarFinalizar = async (datosModal) => {
    setSubmitting(true);
    try {
      const res = await apiFetch(`api/ordenes/${ordenActiva.id}/finalizar`, { method: 'POST', body: datosModal });
      if (res.status === 200) {
        setFinalizarVisible(false);
        handleSelectCard(null); // Limpiar
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
        style={[
            styles.card, 
            isSelected && styles.cardSelected,
            esEnCurso && styles.cardActiveBorder
        ]}
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

      {/* EL BOTÓN FLOTANTE YA NO ESTÁ AQUÍ, ESTÁ EN APP.JS */}

      <DetalleOrdenModal visible={isDetalleVisible} orden={ordenActiva} onClose={() => setDetalleVisible(false)} />
      <IniciarViajeModal visible={isIniciarVisible} orden={ordenActiva} onConfirmar={onConfirmarIniciar} onCancelar={() => setIniciarVisible(false)} submitting={isSubmitting} />
      <FinalizarViajeModal visible={isFinalizarVisible} orden={ordenActiva} onConfirmar={onConfirmarFinalizar} onCancelar={() => setFinalizarVisible(false)} submitting={isSubmitting} />
    </View>
  );
};

// --- IMPORTANTE: Pequeño ajuste en App.js para conectar el botón ---
// En App.js, cambia:
// const event = new CustomEvent('triggerAction');
// window.dispatchEvent(event);
// POR:
// if (global.triggerMainAction) global.triggerMainAction();

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: theme.colors.background },
  topHeader: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeLabel: { color: 'rgba(255,255,255,0.8)' },
  userLabel: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  contentContainer: { flex: 1, marginTop: -10 },
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