'use client';

import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { CreditCard, Lock, Loader2 } from 'lucide-react';

/**
 * Formulario de tarjeta del SDK V2 de Tilopay.
 *
 * Los ids tlpy_* son un contrato: el SDK busca los inputs por id y toma
 * control de ellos. Los datos de la tarjeta viajan del navegador directo
 * a Tilopay, no pasan por nuestro servidor. El div #responseTilopay va
 * FUERA del formulario: ahi el SDK monta el 3DS.
 *
 * Al terminar, el SDK navega a la URL de `redirect` que le pasamos en
 * Init(). Esa URL es /api/tilopay/callback, que confirma el pago contra
 * /consult antes de dar el pedido por bueno.
 */

const SDK_SRC = 'https://app.tilopay.com/sdk/v2/sdk_tpay.min.js';

/** Segundo segmento del id de metodo (A:B:C). 18 es Yappy. */
const SEGMENTO_YAPPY = '18';

type MetodoPago = { id: string; name: string; type?: string };

declare global {
  interface Window {
    Tilopay?: {
      Init: (opts: Record<string, unknown>) => Promise<any>;
      startPayment: () => Promise<any>;
      getCardType?: (n: string) => unknown;
      updateOptions?: (opts: Record<string, unknown>) => Promise<any>;
    };
  }
}

export interface DatosCliente {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  pais: string;
}

export interface TilopaySesion {
  token: string;
  amount: number;
  orderNumber: string;
  redirect: string;
}

export interface TilopayCardFormHandle {
  /** Inicia la compra y dispara el pago. Lanza Error con el mensaje de Tilopay. */
  pagar: (sesion: TilopaySesion, cliente: DatosCliente) => Promise<void>;
}

function cargarSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Sin navegador'));
    if (window.Tilopay) return resolve();

    const existente = document.querySelector<HTMLScriptElement>(`script[src="${SDK_SRC}"]`);
    if (existente) {
      existente.addEventListener('load', () => resolve());
      existente.addEventListener('error', () => reject(new Error('No se pudo cargar el SDK de Tilopay.')));
      return;
    }

    const s = document.createElement('script');
    s.src = SDK_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('No se pudo cargar el SDK de Tilopay.'));
    document.body.appendChild(s);
  });
}

const TilopayCardForm = forwardRef<TilopayCardFormHandle, { visible: boolean }>(
  function TilopayCardForm({ visible }, ref) {
    const [sdkListo, setSdkListo] = useState(false);
    const [metodos, setMetodos] = useState<MetodoPago[]>([]);
    const [modoPrueba, setModoPrueba] = useState<number | null>(null);
    const [cargando, setCargando] = useState(false);
    const selectMetodo = useRef<HTMLSelectElement>(null);

    useEffect(() => {
      let vivo = true;
      cargarSdk()
        .then(() => vivo && setSdkListo(true))
        .catch((e) => console.error('[TILOPAY_SDK]', e));
      return () => {
        vivo = false;
      };
    }, []);

    useImperativeHandle(ref, () => ({
      async pagar(sesion, cliente) {
        setCargando(true);
        try {
          await cargarSdk();
          if (!window.Tilopay) throw new Error('El SDK de Tilopay no está disponible.');

          const init = await window.Tilopay.Init({
            token: sesion.token,
            currency: 'USD',
            language: 'es',
            amount: sesion.amount,
            orderNumber: sesion.orderNumber,
            capture: 1,
            subscription: 0,
            redirect: sesion.redirect,
            billToEmail: cliente.email,
            billToFirstName: cliente.nombre,
            billToLastName: cliente.apellidos,
            billToAddress: cliente.direccion,
            billToCity: cliente.ciudad,
            billToState: cliente.provincia,
            billToCountry: cliente.pais,
            billToTelephone: cliente.telefono,
            hashVersion: 'V2',
          });

          if (init?.message && init.message !== 'Success') {
            throw new Error(init.message);
          }

          const disponibles: MetodoPago[] = Array.isArray(init?.methods) ? init.methods : [];
          setMetodos(disponibles);
          if (typeof init?.test === 'number') setModoPrueba(init.test);

          // Pruebas y produccion comparten host: la unica senal del modo es
          // este campo. Si estamos en local y Tilopay dice produccion, paramos.
          if (init?.test === 0 && process.env.NODE_ENV !== 'production') {
            throw new Error(
              'Tilopay está en modo PRODUCCIÓN y esto no es el sitio publicado. Cambia la cuenta a pruebas antes de seguir.'
            );
          }

          // El SDK lee el metodo desde el select. Si el cliente no eligio,
          // tomamos la primera tarjeta disponible (no Yappy).
          const sel = selectMetodo.current;
          if (sel && !sel.value) {
            const tarjeta = disponibles.find((m) => m.id.split(':')[1] !== SEGMENTO_YAPPY);
            if (tarjeta) sel.value = tarjeta.id;
          }

          const res = await window.Tilopay.startPayment();
          // Si llega aqui con mensaje, el pago no arranco. Cuando arranca,
          // el SDK se encarga del 3DS y navega solo a la URL de redirect.
          if (res?.message) throw new Error(res.message);
        } finally {
          setCargando(false);
        }
      },
    }));

    return (
      <div className={visible ? 'mt-5' : 'hidden'} aria-hidden={!visible}>
        <div className="payFormTilopay rounded-2xl border border-brand-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4 text-sm font-bold text-brand-950">
            <CreditCard className="w-4 h-4" aria-hidden="true" />
            Datos de tu tarjeta
          </div>

          {/* El SDK lee el metodo de pago y la tarjeta guardada de estos selects. */}
          <select
            id="tlpy_payment_method"
            name="tlpy_payment_method"
            ref={selectMetodo}
            aria-label="Método de pago"
            className={metodos.length > 1 ? 'w-full mb-3 rounded-xl border border-brand-200 px-4 py-3 text-sm' : 'hidden'}
          >
            {metodos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <select id="tlpy_saved_cards" name="tlpy_saved_cards" className="hidden" aria-hidden="true" />

          <label htmlFor="tlpy_cc_number" className="block text-xs font-bold text-brand-600 mb-1">
            Número de tarjeta
          </label>
          <input
            type="text"
            id="tlpy_cc_number"
            name="tlpy_cc_number"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            className="w-full mb-3 rounded-xl border border-brand-200 px-4 py-3 text-sm focus:border-accent-500 focus:outline-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tlpy_cc_expiration_date" className="block text-xs font-bold text-brand-600 mb-1">
                Vence (MM/AA)
              </label>
              <input
                type="text"
                id="tlpy_cc_expiration_date"
                name="tlpy_cc_expiration_date"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="01/28"
                className="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm focus:border-accent-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="tlpy_cvv" className="block text-xs font-bold text-brand-600 mb-1">
                CVV
              </label>
              <input
                type="text"
                id="tlpy_cvv"
                name="tlpy_cvv"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="123"
                className="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm focus:border-accent-500 focus:outline-none"
              />
            </div>
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-brand-400">
            <Lock className="w-3 h-3" aria-hidden="true" />
            Tus datos van cifrados directo a Tilopay. No tocan nuestros servidores.
          </p>

          {modoPrueba === 1 && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">
              Tilopay está en modo PRUEBAS. Ningún cobro es real.
            </p>
          )}

          {!sdkListo && (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-brand-400">
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
              Cargando pasarela segura...
            </p>
          )}
          {cargando && (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-brand-500">
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
              Autorizando el pago...
            </p>
          )}
        </div>

        {/* Requerido por el SDK y FUERA del formulario: aqui monta el 3DS. */}
        <div id="responseTilopay" />
      </div>
    );
  }
);

export default TilopayCardForm;
