'use client';

import React, { useEffect, useState } from 'react';
import { Briefcase, Building, Mail, Phone, Calendar, Clock, CheckCircle2, XCircle, Search, RefreshCw, FileText } from 'lucide-react';

interface Solicitud {
  id: string;
  created_at: string;
  nombre_contacto: string;
  nombre_empresa: string;
  ruc_dv?: string;
  email: string;
  telefono: string;
  provincia?: string;
  tipo_negocio?: string;
  unidades_estimadas?: number;
  mensaje?: string;
  estado: 'nueva' | 'contactada' | 'aprobada' | 'rechazada';
  notas_internas?: string;
}

export default function DistribuidoresAdminPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/distribuidores');
      if (res.ok) {
        const data = await res.json();
        setSolicitudes(data || []);
      } else {
        console.error('Error al obtener solicitudes');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const handleCambiarEstado = async (id: string, nuevoEstado: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/distribuidores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: nuevoEstado }),
      });
      if (res.ok) {
        setSolicitudes(prev =>
          prev.map(s => (s.id === id ? { ...s, estado: nuevoEstado as Solicitud['estado'] } : s))
        );
      } else {
        alert('Error al actualizar el estado de la solicitud');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión al actualizar');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtradas = solicitudes.filter(s => {
    const coincideFiltro = filtroEstado === 'todos' || s.estado === filtroEstado;
    const term = searchTerm.toLowerCase();
    const coincideTexto =
      s.nombre_empresa?.toLowerCase().includes(term) ||
      s.nombre_contacto?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.telefono?.includes(term);
    return coincideFiltro && coincideTexto;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Solicitudes de Distribuidores</h1>
              <p className="text-sm text-slate-500">Gestión de prospectos B2B para reventa de dispositivos NFC</p>
            </div>
          </div>
        </div>
        <button
          onClick={cargarSolicitudes}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por empresa, contacto, correo o teléfono..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="todos">Todos los estados</option>
          <option value="nueva">Nuevas</option>
          <option value="contactada">Contactadas</option>
          <option value="aprobada">Aprobadas</option>
          <option value="rechazada">Rechazadas</option>
        </select>
      </div>

      {/* Lista / Cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Cargando solicitudes...</div>
      ) : filtradas.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          No se encontraron solicitudes registradas con los criterios seleccionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtradas.map(s => (
            <div
              key={s.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-900 text-lg">{s.nombre_empresa}</span>
                    {s.ruc_dv && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                        RUC: {s.ruc_dv}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">Contacto: {s.nombre_contacto}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      s.estado === 'nueva'
                        ? 'bg-amber-100 text-amber-800'
                        : s.estado === 'contactada'
                        ? 'bg-blue-100 text-blue-800'
                        : s.estado === 'aprobada'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {s.estado}
                  </span>

                  <select
                    disabled={updatingId === s.id}
                    value={s.estado}
                    onChange={e => handleCambiarEstado(s.id, e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700"
                  >
                    <option value="nueva">Nueva</option>
                    <option value="contactada">Contactada</option>
                    <option value="aprobada">Aprobada</option>
                    <option value="rechazada">Rechazada</option>
                  </select>
                </div>
              </div>

              {/* Detalles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`mailto:${s.email}`} className="text-blue-600 hover:underline truncate">
                    {s.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={`https://wa.me/${s.telefono.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {s.telefono}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{new Date(s.created_at).toLocaleDateString('es-PA', { dateStyle: 'medium' })}</span>
                </div>
              </div>

              {/* Metadatos adicionales */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                {s.provincia && <div><strong>Provincia:</strong> {s.provincia}</div>}
                {s.tipo_negocio && <div><strong>Tipo de negocio:</strong> {s.tipo_negocio}</div>}
                {s.unidades_estimadas !== undefined && s.unidades_estimadas !== null && (
                  <div><strong>Volumen mensual estimado:</strong> {s.unidades_estimadas} uds.</div>
                )}
              </div>

              {/* Mensaje de la solicitud */}
              {s.mensaje && (
                <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-700 border border-slate-100">
                  <div className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Mensaje / Notas del solicitante:
                  </div>
                  <p className="whitespace-pre-line">{s.mensaje}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
