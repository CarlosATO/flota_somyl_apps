import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config.js'; // <-- ¡CICLO ROTO!
/**
 * Wrapper de Fetch para la App Móvil.
 * 1. Obtiene el token de AsyncStorage.
 * 2. Añade el header 'Authorization' (Bearer token).
 * 3. Añade el 'Content-Type: application/json' por defecto.
 * 4. Maneja la URL base de la API.
 */
export async function apiFetch(path, options = {}) {
  const token = await AsyncStorage.getItem('token');
  
  const opts = { ...options };
  opts.headers = opts.headers ? { ...opts.headers } : {};
  
  // Añadir Content-Type si no existe y hay body
  if (!opts.headers['Content-Type'] && opts.body) {
    opts.headers['Content-Type'] = 'application/json';
  }
  
  // Añadir Token de Autorización si existe
  if (token) {
    opts.headers['Authorization'] = `Bearer ${token}`;
  }

  // Stringify el body si es un objeto JSON
  if (opts.body && opts.headers['Content-Type'] === 'application/json' && typeof opts.body === 'object') {
    opts.body = JSON.stringify(opts.body);
  }

  // Construir la URL completa
  // Asegurarnos de que no haya doble '//' si el path ya empieza con /
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  const url = `${API_BASE_URL}${cleanPath}`;

  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    
    try {
      // Intentar parsear JSON
      const data = text ? JSON.parse(text) : null;
      return { status: res.status, data };
    } catch (e) {
      // Si falla el parseo, devolver el texto (útil para errores de HTML)
      console.warn('Respuesta no fue JSON, devolviendo texto:', text);
      return { status: res.status, data: { message: text } };
    }

  } catch (err) {
    console.error(`Error de red en apiFetch hacia ${url}:`, err);
    // Devolver un error de conexión
    return { status: 503, data: { message: 'Error de conexión con el servidor.' } };
  }
}
