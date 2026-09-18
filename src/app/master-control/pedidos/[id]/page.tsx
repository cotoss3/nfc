'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dbLocal, Order, supabase } from '@/lib/db';
import Link from 'next/link';
import { 
  ArrowLeft, Package, User, MapPin, Truck, CheckCircle2, 
  CreditCard, Printer, ShieldCheck, Mail, Phone, ChevronRight
} from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminView, setIsAdminView] = useState(true); // Toggle between Admin/Worker view

  // Order actions
  const [trackingNumber, setTrackingNumber] = useState('');
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (id) {
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('orders')
              .select('*')
              .eq('id', id)
              .single();
            if (!error && data) {
              setOrder(data as Order);
              setTrackingNumber(data.tracking_number || '');
              setLoading(false);
              return;
            }
          } catch (e) {}
        }
        const data = dbLocal.getOrderById(id);
        if (data) {
          setOrder(data);
          setTrackingNumber(data.tracking_number || '');
        }
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando detalles...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Pedido no encontrado.</div>;

  const handleUpdateStatus = (newStatus: Order['status']) => {
    dbLocal.updateOrderDetails(order.id, { status: newStatus });
    setOrder({ ...order, status: newStatus });
  };

  const handleUpdateTracking = () => {
    dbLocal.updateOrderDetails(order.id, { tracking_number: trackingNumber, status: 'shipped' });
    setOrder({ ...order, tracking_number: trackingNumber, status: 'shipped' });
    alert('Guía actualizada y orden marcada como enviada.');
  };

  const handlePrintSlip = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return alert('Por favor habilita las ventanas emergentes.');

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">[ &nbsp; ]</td>
        <td style="padding:10px; border-bottom:1px solid #eee;">
          <strong>${item.product_name}</strong>
          ${item.selected_color ? `<br><small style="color:#666;">Color: ${item.selected_color}</small>` : ''}
          ${item.business_name ? `<br><small style="color:#666;">Ficha: ${item.business_name}</small>` : ''}
        </td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:center; font-weight:bold;">${item.quantity}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Remisión de Empaque - #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 25px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #111; padding-bottom: 15px; margin-bottom: 20px; }
          .brand { font-size: 22px; font-weight: 900; }
          .box { background: #f9f9f9; padding: 12px; border-radius: 8px; border: 1px solid #eee; margin-bottom:20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #111; color: #fff; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">starTAP Panamá 🇵🇦</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:16px; font-weight:bold;">COMPROBANTE DE EMPAQUE</div>
            <div>Orden #${order.id}</div>
          </div>
        </div>
        <div class="box">
          <strong>Entregar a:</strong> ${order.customer_name}<br>
          <strong>Teléfono:</strong> ${order.customer_phone}<br>
          <strong>Dirección:</strong> ${order.shipping_address}, ${order.shipping_district}, ${order.shipping_province}
        </div>
        <table>
          <thead>
            <tr>
              <th width="50">Check</th>
              <th>Producto</th>
              <th width="50">Cant.</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* HEADER BREADCRUMB & VIEW TOGGLE */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/master-control/pedidos" className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pedido #{order.id}</h1>
              {order.payment_status === 'completed' && (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Pagado
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-0.5">
              {new Date(order.created_at).toLocaleString('es-PA')}
            </p>
          </div>
        </div>

        <div className="flex bg-slate-200 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setIsAdminView(true)}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${isAdminView ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
            Vista Admin
          </button>
          <button 
            onClick={() => setIsAdminView(false)}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${!isAdminView ? 'bg-amber-400 shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
            Vista Bodega
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA PRINCIPAL (IZQUIERDA) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PRODUCTOS */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-400" /> Artículos
              </h2>
              <button 
                onClick={handlePrintSlip}
                className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1.5 hover:bg-amber-100 transition"
              >
                <Printer className="w-3.5 h-3.5" /> Packing Slip
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-5 flex gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{item.product_name}</h3>
                    <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                      {item.selected_color && <div><span className="font-semibold text-slate-700">Variante:</span> {item.selected_color}</div>}
                      {item.business_name && <div><span className="font-semibold text-slate-700">Ficha:</span> {item.business_name}</div>}
                      {item.has_custom_logo && <div><span className="font-semibold text-slate-700">Extra:</span> Logo Personalizado</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900">{isAdminView ? `$${(item.price * item.quantity).toFixed(2)}` : 'x' + item.quantity}</div>
                    {isAdminView && <div className="text-xs text-slate-500">{item.quantity} x ${item.price.toFixed(2)}</div>}
                  </div>
                </div>
              ))}
            </div>
            
            {/* FINANZAS (SOLO ADMIN) */}
            {isAdminView && (
              <div className="p-5 bg-slate-50 border-t border-slate-100 text-sm">
                <div className="flex justify-between py-1 text-slate-500">
                  <span>Subtotal</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-500">
                  <span>Envío</span>
                  <span>Calculado en checkout</span>
                </div>
                <div className="flex justify-between py-2 font-black text-slate-900 text-lg border-t border-slate-200 mt-2">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)} USD</span>
                </div>
              </div>
            )}
          </div>

          {/* CHECKLIST / FLUJO BODEGA */}
          {!isAdminView && (
             <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Flujo de Bodega (Kanban)</h2>
                </div>
                <div className="p-5 space-y-4">
                  <button 
                    onClick={() => handleUpdateStatus('processing')}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-colors ${order.status === 'processing' ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500' : 'bg-white hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                        {['processing', 'shipped', 'delivered'].includes(order.status) && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <span className="font-bold text-slate-900">En Preparación (Pick & Pack)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button 
                    onClick={() => handleUpdateStatus('shipped')}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-colors ${order.status === 'shipped' ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-500' : 'bg-white hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${['shipped', 'delivered'].includes(order.status) ? 'bg-purple-500 border-purple-500' : 'border-slate-300'}`}>
                        {['shipped', 'delivered'].includes(order.status) && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <span className="font-bold text-slate-900">Despachado / Enviado</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button 
                    onClick={() => handleUpdateStatus('delivered')}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-colors ${order.status === 'delivered' ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500' : 'bg-white hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${order.status === 'delivered' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                        {order.status === 'delivered' && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <span className="font-bold text-slate-900">Entregado al Cliente (Completado)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
             </div>
          )}

        </div>

        {/* COLUMNA LATERAL (DERECHA) */}
        <div className="space-y-6">
          
          {/* CLIENTE */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-slate-400" /> Cliente
            </h2>
            <div className="space-y-3 text-sm">
              <div className="font-bold text-slate-900">{order.customer_name}</div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href={`mailto:${order.customer_email}`} className="hover:text-amber-600 hover:underline">{order.customer_email}</a>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <a href={`https://wa.me/${order.customer_phone?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="hover:text-amber-600 hover:underline">{order.customer_phone}</a>
              </div>
            </div>
          </div>

          {/* DIRECCION Y ENVIO */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-slate-400" /> Entrega
            </h2>
            <div className="text-sm text-slate-700 space-y-1">
              <div>{order.shipping_address}</div>
              <div>{order.shipping_district}</div>
              <div className="font-bold">{order.shipping_province}</div>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Número de Guía / Tracking</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  placeholder="Ej. UNO-12345"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
                />
                <button 
                  onClick={handleUpdateTracking}
                  className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-800"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>

          {/* PAGO (SOLO ADMIN) */}
          {isAdminView && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-slate-400" /> Información de Pago
              </h2>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-bold uppercase">{order.payment_method}</span>
                </div>
                {order.payment_status === 'completed' 
                  ? <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">Pagado</span>
                  : <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-200 text-slate-700">Pendiente</span>
                }
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <button 
                  onClick={() => {
                    const newStatus = order.payment_status === 'completed' ? 'pending' : 'completed';
                    dbLocal.updateOrderDetails(order.id, { payment_status: newStatus });
                    setOrder({ ...order, payment_status: newStatus });
                  }}
                  className="w-full text-center text-sm font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg py-2 hover:bg-slate-50"
                >
                  Marcar como {order.payment_status === 'completed' ? 'No Pagado' : 'Pagado'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
