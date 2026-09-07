import { supabase } from './db';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
}

export const authService = {
  // Iniciar sesión con Google OAuth
  async signInWithGoogle() {
    if (!supabase) {
      throw new Error('Supabase no está configurado');
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://startap.com.pa/dashboard'
      }
    });
    if (error) throw error;
    return data;
  },

  // Registrar nuevo usuario con correo y contraseña
  async signUpWithEmail(email: string, password: string, name: string) {
    if (!supabase) {
      return { success: true, user: { id: 'local-id', email, name } };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });
    if (error) throw error;
    return { success: true, user: data.user };
  },

  // Iniciar sesión con correo y contraseña
  async signInWithEmail(email: string, password: string) {
    if (!supabase) {
      return { success: true, email };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return { success: true, user: data.user, session: data.session };
  },

  // Solicitar recuperación de contraseña por correo
  async resetPassword(email: string) {
    if (!supabase) {
      return { success: true };
    }
    const isLocal = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
    const origin = isLocal ? window.location.origin : 'https://startap.com.pa';
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/dashboard/reset-password`
    });
    if (error) throw error;
    return { success: true, data };
  },

  // Actualizar contraseña del usuario autenticado
  async updatePassword(newPassword: string) {
    if (!supabase) {
      return { success: true };
    }
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return { success: true, data };
  },

  // Obtener sesión activa de Supabase
  async getSession() {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // Cerrar sesión activa
  async signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
  }
};
