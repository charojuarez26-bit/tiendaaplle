import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ [World Apple] Supabase URL o Anon Key no configurados en las variables de entorno (.env).\n' +
    'Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para conectar con la base de datos real.'
  );
}

// Inicialización del cliente Supabase
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

// Helper tipado para operaciones complejas o bypass de restricciones condicionales de Supabase v2
export const db = supabase as any;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://placeholder.supabase.co'
);
