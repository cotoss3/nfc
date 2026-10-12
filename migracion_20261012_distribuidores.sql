-- ============================================================================
-- MIGRACIÓN: Programa de Distribuidores starTAP Panamá (12/10/2026)
-- Archivo: migracion_20261012_distribuidores.sql
-- ============================================================================

-- Tabla para almacenar las postulaciones de distribuidores B2B / mayoristas
create table if not exists public.distribuidores_solicitudes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  empresa text not null,
  ruc text,
  contacto text not null,
  whatsapp text not null,
  correo text not null,
  giro text,
  clientes_aprox int,
  unidades_mes int,
  acepta_contacto boolean not null default false,
  estado text not null default 'nueva' check (estado in ('nueva','aprobada','rechazada'))
);

-- Habilitar RLS: Sin políticas para anon/authenticated (solo escribe y lee la API con service_role)
alter table public.distribuidores_solicitudes enable row level security;

-- Índice para ordenar rápido por fecha de llegada
create index if not exists idx_distribuidores_created_at 
  on public.distribuidores_solicitudes (created_at desc);

-- Índice para filtrar por estado
create index if not exists idx_distribuidores_estado 
  on public.distribuidores_solicitudes (estado);
