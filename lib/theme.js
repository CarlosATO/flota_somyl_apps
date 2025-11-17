// File: flota_app/lib/theme.js

export const theme = {
  colors: {
    primary: '#1e3a8a',      // Azul Marino Profundo (Corporativo)
    secondary: '#3b82f6',    // Azul Brillante (Acciones principales)
    background: '#f8fafc',   // Gris muy claro (Fondos de pantalla)
    surface: '#ffffff',      // Blanco (Tarjetas y modales)
    text: '#1e293b',         // Gris oscuro (Texto principal)
    textSecondary: '#64748b',// Gris medio (Subtítulos)
    success: '#10b981',      // Verde (Éxito/Iniciar)
    danger: '#ef4444',       // Rojo (Peligro/Finalizar/Logout)
    warning: '#f59e0b',      // Ámbar (Alertas)
    border: '#e2e8f0',       // Bordes sutiles
  },
  spacing: {
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
  borderRadius: {
    s: 8,
    m: 12,
    l: 20, // Bordes muy redondeados (moderno)
  },
  shadows: {
    // Sombra suave para tarjetas
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4, // Android
    },
    // Sombra fuerte para botones flotantes o modales
    modal: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 10, // Android
    }
  }
};
