// File: flota_app/screens/FinalizarViajeModal.js

import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';

// Helper para obtener la fecha/hora actual en formato YYYY-MM-DDTHH:MM
const getLocalDateTimeString = () => {
  const date = new Date();
  // Ajustar por la zona horaria local
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  // Formato YYYY-MM-DDTHH:MM
  return date.toISOString().slice(0, 16);
};

const FinalizarViajeModal = ({ visible, orden, onConfirmar, onCancelar, submitting }) => {
  // Estados para los 3 campos del formulario
  const [kmFin, setKmFin] = useState('');
  // Autocompletamos la fecha de fin con la hora actual
  const [fechaFin, setFechaFin] = useState(getLocalDateTimeString());
  const [observaciones, setObservaciones] = useState('');

  // Limpiamos el formulario cada vez que se muestra una nueva orden
  useEffect(() => {
    if (visible) {
      setKmFin('');
      setObservaciones('');
      setFechaFin(getLocalDateTimeString());
    }
  }, [visible, orden]);

  const handleConfirmar = () => {
    // Validación de campos
    const kmFinNum = parseInt(kmFin, 10);
    if (isNaN(kmFinNum) || kmFinNum <= 0) {
      Alert.alert('Error', 'El Kilometraje Final es obligatorio y debe ser un número positivo.');
      return;
    }
    if (!fechaFin.includes('T') || fechaFin.length < 16) {
        Alert.alert('Error', 'El formato de Fecha de Fin no es válido. Debe ser YYYY-MM-DDTHH:MM.');
        return;
    }

    // Devolvemos los 3 datos al componente padre (MainDriverApp)
    onConfirmar({
      kilometraje_fin: kmFinNum,
      fecha_fin_real: fechaFin,
      observaciones: observaciones,
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancelar}
    >
      {/* Usamos KeyboardAvoidingView para que el teclado no tape los inputs */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            
            <Text style={styles.modalTitle}>Finalizar Orden #{orden?.id}</Text>
            <Text style={styles.modalSubtitle}>{orden?.origen} ➔ {orden?.destino}</Text>

            {/* --- Campo 1: Kilometraje Fin --- */}
            <Text style={styles.label}>Kilometraje Final (Odómetro) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 150000"
              keyboardType="numeric"
              value={kmFin}
              onChangeText={setKmFin}
            />
            <Text style={styles.hintText}>
              KM Inicial registrado: {orden?.kilometraje_inicio || 'No registrado'}
            </Text>

            {/* --- Campo 2: Fecha Fin Real --- */}
            <Text style={styles.label}>Fecha y Hora Fin Real *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DDTHH:MM"
              value={fechaFin}
              onChangeText={setFechaFin}
            />
            <Text style={styles.hintText}>Formato: Año-Mes-DíaTHora:Minuto (ej: 2025-11-14T15:30)</Text>

            {/* --- Campo 3: Observaciones --- */}
            <Text style={styles.label}>Observaciones de Cierre</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Novedades del viaje, estado del vehículo, etc."
              multiline
              numberOfLines={4}
              value={observaciones}
              onChangeText={setObservaciones}
            />

            {/* --- Botones --- */}
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={onCancelar}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.confirmButton]} 
                onPress={handleConfirmar}
                disabled={submitting}
              >
                <Text style={styles.confirmButtonText}>
                  {submitting ? 'Finalizando...' : 'Confirmar y Finalizar'}
                </Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  scrollViewContent: {
    padding: 22,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#212529',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top', // Para Android
  },
  hintText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#dc3545', // Rojo
    marginLeft: 10,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FinalizarViajeModal;