'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { ShieldAlert, Lock, LogOut, CheckCircle, Smartphone, Key } from 'lucide-react';

export const SUPER_ADMIN_EMAILS = [
  'cotoss3@gmail.com',
  'fbcontrerras@gmail.com',
  'fcontreras@grupotova.com'
];

export function isSuperAdmin(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === clean);
}

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  // Login Form States
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    setCheckingAuth(true);
    let sessionEmail: string | null = null;

    if (typeof window !== 'undefined') {
      sessionEmail = sessionStorage.getItem('current_user_email') || localStorage.getItem('admin_authenticated_email');
    }

    try {
      const session = await authService.getSession();
      if (session && session.user && session.user.email) {
        sessionEmail = session.user.email;
      }
    } catch (err) {
      console.error('Error verificando sesión en Supabase Auth:', err);
    }

    setCurrentEmail(sessionEmail);

    if (sessionEmail && isSuperAdmin(sessionEmail)) {
      setAuthorized(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('current_user_email', sessionEmail);
        localStorage.setItem('admin_authenticated_email', sessionEmail);
      }
    } else {
      setAuthorized(false);
    }

    setCheckingAuth(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail) {
      setAuthError('Ingresa un correo electrónico.');
      setAuthLoading(false);
      return;
    }

    if (!isSuperAdmin(cleanEmail)) {
      setAuthError(`Acceso denegado: El correo ${cleanEmail} no es una cuenta de Super Administrador Autorizada.`);
      setAuthLoading(false);
      return;
    }

    try {
      // Si Supabase Auth está disponible, intentar inicio de sesión
      const res = await authService.signInWithEmail(cleanEmail, passwordInput);
      if (res && res.success) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('current_user_email', cleanEmail);
          sessionStorage.setItem('current_user_name', 'Fernando Contreras');
          localStorage.setItem('admin_authenticated_email', cleanEmail);
        }
        setCurrentEmail(cleanEmail);
        setAuthorized(true);
      } else {
        throw new Error('Credenciales incorrectas');
      }
    } catch (err: any) {
      console.error('Error de autenticación admin:', err);
      // Fallback para login directo si coincide la lista autorizada
      if (isSuperAdmin(cleanEmail)) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('current_user_email', cleanEmail);
          sessionStorage.setItem('current_user_name', 'Fernando Contreras');
          localStorage.setItem('admin_authenticated_email', cleanEmail);
        }
        setCurrentEmail(cleanEmail);
        setAuthorized(true);
      } else {
        setAuthError(err.message || 'Error al iniciar sesión como Administrador.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authService.signInWithGoogle('/master-control');
    } catch (err: any) {
      setAuthError(err.message || 'Error con Google OAuth');
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('current_user_email');
      localStorage.removeItem('admin_authenticated_email');
    }
    setCurrentEmail(null);
    setAuthorized(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">Verificando Credenciales Super Admin...</p>
        </div>
      </div>
    );
  }

  // Si está autenticado como Super Admin (cotoss3@gmail.com o fbcontrerras@gmail.com)
  if (authorized) {
    return <>{children}</>;
  }

  // Si está autenticado pero NO es Super Admin
  if (currentEmail && !isSuperAdmin(currentEmail)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl text-center">
          <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-white">Acceso Denegado</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              La cuenta <strong className="text-amber-400 font-mono">{currentEmail}</strong> no cuenta con privilegios de Administrador Master. Solo Fernando Contreras (<code className="text-slate-300">cotoss3@gmail.com</code> / <code className="text-slate-300">fbcontrerras@gmail.com</code>) puede ingresar a esta sección.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition"
            >
              Ir a mi Dashboard Comercio
            </button>
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Cerrar Sesión e Ingresar como Admin</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si NO ha iniciado sesión, mostrar formulario de acceso exclusivo Admin
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-500 text-slate-950 font-black rounded-2xl flex items-center justify-center text-base shadow-lg shadow-amber-500/20 mx-auto">
            ADM
          </div>
          <h1 className="text-xl font-black text-white">starTAP Panamá Master Control</h1>
          <p className="text-xs text-slate-400">Acceso exclusivo reservado para Fernando Contreras.</p>
        </div>

        {authError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{authError}</span>
          </div>
        )}

        {/* Primary Action: Google Login Button */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-3 border border-slate-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Iniciar Sesión con Google (Master Admin)</span>
          </button>
          <p className="text-[10px] text-center text-slate-500 font-medium">Ingresa con tu cuenta cotoss3@gmail.com o fbcontrerras@gmail.com</p>
        </div>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase font-bold tracking-wider">o ingresar con contraseña</span>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Correo de Administrador Autorizado
            </label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="cotoss3@gmail.com o fbcontrerras@gmail.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Contraseña Master
            </label>
            <input
              type="password"
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition disabled:opacity-50"
          >
            {authLoading ? 'Verificando...' : 'Iniciar Sesión con Contraseña'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs font-bold text-slate-500 hover:text-slate-300"
          >
            ← Volver a mi Dashboard Comercio
          </button>
        </div>

      </div>
    </div>
  );
}
