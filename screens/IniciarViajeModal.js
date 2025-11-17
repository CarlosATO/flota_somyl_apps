// File: flota_app/screens/IniciarViajeModal.js

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../lib/theme';

const IniciarViajeModal = ({ visible, orden, onConfirmar, onCancelar, submitting }) => {
  const [kmInicio, setKmInicio] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [foto, setFoto] = useState(null);

  useEffect(() => {
    if (visible) {
      setKmInicio('');
      setObservaciones('');
      setFoto(null);
    }
  }, [visible, orden]);

  const handleTomarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso', 'Se necesita acceso a la cámara.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({ quality: 0.5, allowEditing: false });
    if (!result.canceled) setFoto(result.assets[0]);
  };

  const handleConfirmar = () => {
    const kmVal = parseInt(kmInicio, 10);
    if (isNaN(kmVal) || kmVal <= 0) {
      Alert.alert('Falta Información', 'Ingresa el Kilometraje actual.');
      return;
    }
    onConfirmar({ kilometraje_inicio: kmVal, observacion_inicio: observaciones, foto: foto });
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onCancelar}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={styles.container}>
          
          {/* Encabezado */}
          <View style={styles.header}>
            <Text style={styles.title}>Iniciar Ruta</Text>
            <Text style={styles.subtitle}>Orden #{orden?.id}</Text>
          </View>

          {/* Contenido */}
          <View style={styles.content}>
            <Text style={styles.label}>KILOMETRAJE ACTUAL *</Text>
            <TextInput 
              style={styles.inputBig} 
              placeholder="000000" 
              keyboardType="numeric" 
              value={kmInicio} 
              onChangeText={setKmInicio} 
              autoFocus={true}
            />

            <Text style={styles.label}>OBSERVACIONES (Opcional)</Text>
            <TextInput 
              style={styles.inputNotes} 
              placeholder="¿Alguna novedad con el vehículo?" 
              multiline 
              value={observaciones} 
              onChangeText={setObservaciones} 
            />

            {/* Vista previa de foto si existe */}
            {foto && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: foto.uri }} style={styles.previewImage} />
                <TouchableOpacity onPress={() => setFoto(null)} style={styles.deletePhotoBtn}>
                  <MaterialCommunityIcons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
                <Text style={styles.photoText}>Evidencia lista</Text>
              </View>
            )}
            
            {!foto && <Text style={styles.hint}>Presiona la cámara abajo para adjuntar evidencia</Text>}
          </View>

          {/* --- BARRA INFERIOR PERSONALIZADA --- */}
          <View style={styles.bottomBar}>
            {/* Botón Cancelar (Izquierda) */}
            <TouchableOpacity style={styles.sideButton} onPress={onCancelar} disabled={submitting}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            {/* Botón CÁMARA (Centro Gigante) */}
            <View style={styles.cameraContainer}>
              <TouchableOpacity style={styles.cameraButton} onPress={handleTomarFoto} disabled={submitting}>
                <MaterialCommunityIcons name={foto ? "camera-check" : "camera"} size={32} color="white" />
              </TouchableOpacity>
            </View>

            {/* Botón Guardar (Derecha) */}
            <TouchableOpacity style={styles.sideButton} onPress={handleConfirmar} disabled={submitting}>
              <Text style={styles.confirmText}>{submitting ? '...' : 'Iniciar'}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#f8fafc', borderTopLeftRadius: 24, borderTopRightRadius: 24, minHeight: 450 },
  header: { alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#e2e8f0', backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  title: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary },
  content: { padding: 24 },
  label: { fontSize: 12, fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: 8 },
  inputBig: { backgroundColor: 'white', fontSize: 24, fontWeight: 'bold', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 20, textAlign: 'center', color: theme.colors.primary },
  inputNotes: { backgroundColor: 'white', fontSize: 16, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', height: 80, textAlignVertical: 'top' },
  hint: { textAlign: 'center', marginTop: 20, color: '#94a3b8', fontStyle: 'italic' },
  
  previewContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15, backgroundColor: '#dcfce7', padding: 10, borderRadius: 8 },
  previewImage: { width: 40, height: 40, borderRadius: 4, marginRight: 10 },
  photoText: { color: '#166534', fontWeight: '600' },
  deletePhotoBtn: { position: 'absolute', top: -10, right: -10, backgroundColor: 'white', borderRadius: 12 },

  // Barra Inferior Especial
  bottomBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 30, 
    paddingBottom: 40, // Espacio para iPhone X+
    paddingTop: 10,
    backgroundColor: 'white', 
    borderTopWidth: 1, 
    borderColor: '#f1f5f9' 
  },
  sideButton: { flex: 1, alignItems: 'center', paddingVertical: 15 },
  cancelText: { color: theme.colors.textSecondary, fontWeight: '600', fontSize: 16 },
  confirmText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 16 },
  
  // Botón Flotante Central
  cameraContainer: { top: -25 }, // Lo hace flotar hacia arriba
  cameraButton: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
    borderWidth: 4, borderColor: '#f8fafc' // Borde para separarlo del fondo
  }
});

export default IniciarViajeModal;