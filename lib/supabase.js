// File: flota_app/lib/supabase.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Leemos las variables del archivo .env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// --- DEBUG ---
// Esto se mostrará en la terminal de VS Code (Metro)
console.log("--- DEBUG SUPERBASE CLIENT ---");
console.log("Supabase URL cargada:", supabaseUrl ? "SÍ" : "NO");
console.log("Supabase Anon Key cargada:", supabaseAnonKey ? "SÍ" : "NO");
// --- FIN DEBUG ---

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Faltan variables .env de Supabase (EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY)");
  // Lanzamos el error que estabas viendo
  throw new Error("supabaseUrl o supabaseAnonKey son requeridas.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});