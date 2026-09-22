'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { type Coupon, type CouponType } from '@/config/shipping';
import {
  ArrowLeft,
  Ticket,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  X,
  ShieldCheck,
  Percent,
} from 'lucide-react';

/** Los 3 que vienen con el sistema: se pueden desactivar, pero no borrar. */
const CODIGOS_SISTEMA = ['EVG', 'STARTAP10', 'DESCUENTO5'];

interface Formulario {
  code: string;
  type: CouponType;
  value: string;
  description: string;
  expira_el: string;
  usos_maximos: string;
  is_active: boolean;
}

const FORM_VACIO: Formulario = {
  code: '',
  type: 'percent',
  value: '10',
  description: '',
  expira_el: '',
  usos_maximos: '',
  is_active: true,
};

/** Texto legible del tipo de cupón, para la tabla. */
function tipoLegible(c: Coupon): string {
  if (c.type === 'free_shipping') return 'Envío gratis';
  if (c.type === 'percent') return `${Number(c.value)}% de descuento`;
  return `$${Number(c.value || 0).toFixed(2)} de descuento`;
}

function fechaLegible(iso?: string | null): string {
  if (!iso) return 'No vence';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'No vence';
  return d.toLocaleDateString('es-PA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function estaVencido(c: Coupon): boolean {
  if (!c.expira_el) return false;
  const d = new Date(c.expira_el).getTime();
  return Number.isFinite(d) && d < Date.now();
}

function llegoAlTope(c: Coupon): boolean {
  if (c.usos_maximos === null || c.usos_maximos === undefined) return false;
  return Number(c.usos || 0) >= Number(c.usos_maximos);
}

export default function CuponesPage() {
  const [cupones, setCupones] = useState<Coupon[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [form, setForm] = useState<Formulario>(FORM_VACIO);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [exito, setExito] = useState('');
  const [errorAccion, setErrorAccion] = useState('');

  /** Token de la sesión del admin. Sin token no se escribe nada. */
  const obtenerToken = async (): Promise<string | null> => {
    const session = await authService.getSession();
    return session?.access_token || null;
  };

  const cargar = async () => {
    setCargando(true);
    setErrorCarga('');
    try {
      const res = await fetch('/api/cupones');
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setErrorCarga(data?.error || `No se pudieron cargar los cupones (HTTP ${res.status}).`);
        setCargando(false);
        return;
      }
      setCupones(data.cupones || []);
    } catch (e: any) {
      console.error('[CUPONES_UI]', e);
      setErrorCarga(e?.message || 'Error de red al cargar los cupones.');
    }
    setCargando(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const limpiarForm = () => {
    setForm(FORM_VACIO);
    setEditando(false);
    setErrorForm('');
  };

  const editarCupon = (c: Coupon) => {
    setEditando(true);
    setErrorForm('');
    setExito('');
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value ?? 0),
      description: c.description || '',
      expira_el: c.expira_el ? new Date(c.expira_el).toISOString().slice(0, 10) : '',
      usos_maximos:
        c.usos_maximos === null || c.usos_maximos === undefined ? '' : String(c.usos_maximos),
      is_active: c.is_active !== false,
    });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Guarda (crea o actualiza). Nunca decimos "guardado" si la API falló. */
  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm('');
    setExito('');

    const code = form.code.replace(/\s+/g, '').toUpperCase();
    if (!code) {
      setErrorForm('Escribe un código para el cupón.');
      return;
    }
    if (form.type === 'percent') {
      const v = Number(form.value);
      if (!Number.isFinite(v) || v < 1 || v > 100) {
        setErrorForm('El porcentaje tiene que estar entre 1 y 100.');
        return;
      }
    }
    if (form.type === 'fixed') {
      const v = Number(form.value);
      if (!Number.isFinite(v) || v <= 0) {
        setErrorForm('El monto del descuento tiene que ser mayor a $0.00.');
        return;
      }
    }

    setGuardando(true);
    try {
      const token = await obtenerToken();
      if (!token) {
        setErrorForm('Tu sesión expiró. Vuelve a iniciar sesión.');
        setGuardando(false);
        return;
      }
      const res = await fetch('/api/cupones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          code,
          type: form.type,
          value: form.type === 'free_shipping' ? 0 : Number(form.value),
          description: form.description,
          expira_el: form.expira_el || null,
          usos_maximos: form.usos_maximos.trim() === '' ? null : Number(form.usos_maximos),
          is_active: form.is_active,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setErrorForm(data?.error || `No se pudo guardar el cupón (HTTP ${res.status}).`);
        setGuardando(false);
        return;
      }
      setExito(`Cupón ${code} guardado en el servidor.`);
      limpiarForm();
      await cargar();
    } catch (e: any) {
      console.error('[CUPONES_UI]', e);
      setErrorForm(e?.message || 'Error de red al guardar el cupón.');
    }
    setGuardando(false);
  };

  const alternarActivo = async (c: Coupon) => {
    setErrorAccion('');
    setExito('');
    try {
      const token = await obtenerToken();
      if (!token) {
        setErrorAccion('Tu sesión expiró. Vuelve a iniciar sesión.');
        return;
      }
      const res = await fetch('/api/cupones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          code: c.code,
          type: c.type,
          value: c.value,
          description: c.description,
          expira_el: c.expira_el || null,
          usos_maximos: c.usos_maximos ?? null,
          is_active: !(c.is_active !== false),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setErrorAccion(data?.error || `No se pudo cambiar el estado del cupón (HTTP ${res.status}).`);
        return;
      }
      await cargar();
    } catch (e: any) {
      console.error('[CUPONES_UI]', e);
      setErrorAccion(e?.message || 'Error de red al cambiar el estado del cupón.');
    }
  };

  const borrar = async (c: Coupon) => {
    setErrorAccion('');
    setExito('');
    if (CODIGOS_SISTEMA.includes(c.code)) {
      setErrorAccion('Ese cupón es del sistema: lo puedes desactivar, pero no borrar.');
      return;
    }
    if (!confirm(`¿Seguro que quieres borrar el cupón "${c.code}"? Esto no se puede deshacer.`)) return;

    try {
      const token = await obtenerToken();
      if (!token) {
        setErrorAccion('Tu sesión expiró. Vuelve a iniciar sesión.');
        return;
      }
      const res = await fetch(`/api/cupones?code=${encodeURIComponent(c.code)}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setErrorAccion(data?.error || `No se pudo borrar el cupón (HTTP ${res.status}).`);
        return;
      }
      setExito(`Cupón ${c.code} borrado.`);
      await cargar();
    } catch (e: any) {
      console.error('[CUPONES_UI]', e);
      setErrorAccion(e?.message || 'Error de red al borrar el cupón.');
    }
  };

  const activos = cupones.filter((c) => c.is_active !== false && !estaVencido(c) && !llegoAlTope(c)).length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/master-control"
            className="p-2.5 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Ticket className="w-6 h-6 text-amber-500" />
              Gestión de Cupones
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              {cupones.length} cupones • {activos} usables ahora mismo
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={cargar}
          className="py-3 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition flex items-center justify-center gap-2 shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-amber-500" /> Recargar
        </button>
      </div>

      {/* AVISO */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-900 font-semibold leading-relaxed">
          Los cupones se guardan en el servidor: aplican igual a lo que ve el cliente en el
          checkout y a lo que realmente se le cobra.
        </p>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={guardar} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-amber-500" />
            {editando ? `Editando el cupón ${form.code}` : 'Nuevo cupón'}
          </h2>
          {editando && (
            <button
              type="button"
              onClick={limpiarForm}
              className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Cancelar edición
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Código</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              disabled={editando}
              placeholder="VERANO20"
              maxLength={30}
              className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2.5 text-slate-900 font-black uppercase tracking-wider focus:outline-none focus:border-slate-900 disabled:opacity-60"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}
              className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="percent">Porcentaje de descuento</option>
              <option value="fixed">Monto fijo en dólares</option>
              <option value="free_shipping">Envío gratis</option>
            </select>
          </div>

          {form.type !== 'free_shipping' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {form.type === 'percent' ? 'Porcentaje (%)' : 'Monto ($ USD)'}
              </label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5">
                <span className="text-slate-400 font-bold text-xs">
                  {form.type === 'percent' ? '%' : '$'}
                </span>
                <input
                  type="number"
                  step={form.type === 'percent' ? '1' : '0.01'}
                  min={form.type === 'percent' ? 1 : 0.01}
                  max={form.type === 'percent' ? 100 : undefined}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="w-full bg-transparent outline-none text-xs font-black text-slate-900"
                />
              </div>
            </div>
          )}

          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Descripción</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="20% de descuento por la campaña de verano"
              maxLength={200}
              className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Vence el (opcional)
            </label>
            <input
              type="date"
              value={form.expira_el}
              onChange={(e) => setForm({ ...form, expira_el: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Límite de usos (opcional)
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={form.usos_maximos}
              onChange={(e) => setForm({ ...form, usos_maximos: e.target.value })}
              placeholder="Sin límite"
              className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer py-2.5">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 accent-slate-900"
              />
              Activo
            </label>
          </div>
        </div>

        {errorForm && (
          <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> {errorForm}
          </p>
        )}
        {exito && (
          <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> {exito}
          </p>
        )}

        <button
          type="submit"
          disabled={guardando}
          className="py-3 px-5 bg-slate-950 hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-2 active:scale-[0.98]"
        >
          {guardando ? (
            <><RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> Guardando...</>
          ) : (
            <><Plus className="w-4 h-4 text-amber-400" /> {editando ? 'Guardar cambios' : 'Crear cupón'}</>
          )}
        </button>
      </form>

      {/* ERROR DE ACCION */}
      {errorAccion && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <p className="text-xs text-rose-800 font-bold">{errorAccion}</p>
        </div>
      )}

      {/* TABLA */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Cupones ({cupones.length})
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold">
            Guardados en el servidor
          </span>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
            <p className="font-semibold text-sm">Cargando cupones...</p>
          </div>
        ) : errorCarga ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
            <p className="font-bold text-sm text-rose-700">{errorCarga}</p>
            <button
              type="button"
              onClick={cargar}
              className="text-xs font-bold text-slate-900 underline"
            >
              Reintentar
            </button>
          </div>
        ) : cupones.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Percent className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-slate-400 italic text-sm">
              Todavía no hay cupones. Crea el primero con el formulario de arriba.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="p-4">Código</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Descripción</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-center">Usos</th>
                  <th className="p-4">Vence</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {cupones.map((c) => {
                  const esSistema = CODIGOS_SISTEMA.includes(c.code);
                  const vencido = estaVencido(c);
                  const tope = llegoAlTope(c);
                  const apagado = c.is_active === false;

                  return (
                    <tr key={c.code} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-black text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                          {c.code}
                        </span>
                        {esSistema && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3" /> Del sistema
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-bold text-slate-900">{tipoLegible(c)}</td>

                      <td className="p-4 text-slate-500 max-w-xs truncate">
                        {c.description || '—'}
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            apagado
                              ? 'bg-slate-100 text-slate-600 border-slate-300'
                              : vencido || tope
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {apagado ? 'Desactivado' : vencido ? 'Vencido' : tope ? 'Sin usos' : 'Activo'}
                        </span>
                      </td>

                      <td className="p-4 text-center font-mono font-bold text-slate-900">
                        {Number(c.usos || 0)}
                        {c.usos_maximos !== null && c.usos_maximos !== undefined
                          ? ` / ${c.usos_maximos}`
                          : ' / ∞'}
                      </td>

                      <td className="p-4 text-slate-600 font-semibold">{fechaLegible(c.expira_el)}</td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => alternarActivo(c)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition ${
                              apagado
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                            title={apagado ? 'Activar cupón' : 'Desactivar cupón'}
                          >
                            {apagado ? 'Activar' : 'Desactivar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => editarCupon(c)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="Editar cupón"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => borrar(c)}
                            disabled={esSistema}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
                            title={esSistema ? 'Los cupones del sistema no se pueden borrar' : 'Borrar cupón'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
