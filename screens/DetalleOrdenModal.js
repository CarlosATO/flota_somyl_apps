// File: flota_app/screens/DetalleOrdenModal.js
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../lib/theme';

const DetalleOrdenModal = ({ visible, orden, onClose }) => {
  if (!orden) return null;

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Detalles Orden #{orden.id}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.label}>Ruta</Text>
              <Text style={styles.valueBig}>{orden.origen} ➔ {orden.destino}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Vehículo Asignado</Text>
              <View style={styles.row}>
                <MaterialCommunityIcons name="truck" size={20} color={theme.colors.primary} />
                <Text style={styles.value}> {orden.vehiculo?.placa} • {orden.vehiculo?.modelo}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Descripción / Instrucciones</Text>
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>{orden.descripcion || "Sin descripción."}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Estado Actual</Text>
              <View style={[styles.badge, orden.estado === 'en_curso' ? styles.badgeActive : styles.badgePending]}>
                <Text style={styles.badgeText}>{orden.estado.toUpperCase().replace('_', ' ')}</Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>CERRAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: 'white', borderRadius: 16, maxHeight: '80%', overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  content: { padding: 20 },
  section: { marginBottom: 20 },
  label: { fontSize: 12, color: theme.colors.textSecondary, textTransform: 'uppercase', marginBottom: 5 },
  valueBig: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  value: { fontSize: 16, color: theme.colors.text },
  row: { flexDirection: 'row', alignItems: 'center' },
  descriptionBox: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  descriptionText: { fontSize: 15, color: theme.colors.text, lineHeight: 22 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
  badgePending: { backgroundColor: '#e0f2fe' },
  badgeActive: { backgroundColor: '#fee2e2' },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  closeButton: { backgroundColor: '#f1f5f9', padding: 15, alignItems: 'center' },
  closeButtonText: { color: theme.colors.textSecondary, fontWeight: 'bold' }
});

export default DetalleOrdenModal;