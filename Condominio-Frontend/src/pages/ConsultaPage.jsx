import React, { useEffect, useState } from 'react';
import axios from '../api/client.js';
import PaymentModal from '../components/PaymentModal.jsx';
import { useSession } from '../auth/sessionContext.js';

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL });
client.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${localStorage.getItem('access')}`;
  return config;
});
const definitions = {
  perfil: ['Mi perfil', 'personas/', [['nombre','Nombre'],['apellido','Apellido'],['telefono','Teléfono']]],
  unidades: ['Mi vivienda', 'unidades/', [['codigo','Código'],['numero','Número'],['bloque_nombre','Bloque']]],
  vehiculos: ['Vehículos', 'vehiculos/', [['placa','Placa'],['marca','Marca'],['modelo','Modelo'],['color','Color'],['tipo','Tipo']]],
  contratos: ['Mis contratos', 'contratos/', [['id','Número'],['unidad','Unidad'],['fecha_contrato','Fecha'],['estado','Estado']]],
  expensas: ['Mis expensas', 'expensas/', [['id','Número'],['unidad','Unidad'],['monto','Monto'],['fecha_emision','Emisión'],['fecha_vencimiento','Vencimiento'],['pagada','Pagada']]],
  visitas: ['Mis visitas', 'visitas/', [['visitante_nombre','Visitante'],['estado','Estado'],['fecha_hora_entrada','Entrada'],['fecha_hora_salida','Salida']]],
};
export default function ConsultaPage({ resource }) {
  const { user } = useSession();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [version, setVersion] = useState(0);
  const [title, endpoint, fields] = definitions[resource];
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError('');
    client.get(endpoint).then(({ data }) => { if (!cancelled) setItems(data.results || data); })
      .catch(err => { if (!cancelled) setError(err.response?.status === 403 ? 'No tienes permiso para consultar esta información.' : 'No se pudo cargar la información.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [endpoint, version]);
  return <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    {resource === 'unidades' && user.role === 'inquilino' && <p className="mb-4 text-gray-600">La unidad estará disponible cuando se registre tu ocupación.</p>}
    {resource === 'visitas' && user.role === 'inquilino' && <p className="mb-4 text-gray-600">Las visitas estarán disponibles cuando se pueda verificar tu ocupación.</p>}
    {loading ? <p>Cargando…</p> : error ? <p role="alert" className="text-red-700">{error}</p> : items.length === 0 ? <p>No hay registros disponibles.</p> :
      <div className="overflow-x-auto"><table className="min-w-full text-left"><thead><tr>{fields.map(([key, label]) => <th className="p-2" key={key}>{label}</th>)}{resource === 'expensas' && <th>Pago</th>}</tr></thead>
      <tbody>{items.map(item => <tr key={item.id} className="border-t">{fields.map(([key]) => <td key={key} className="p-2">{typeof item[key] === 'boolean' ? (item[key] ? 'Sí' : 'No') : (item[key] ?? '—')}</td>)}
        {resource === 'expensas' && <td>{!item.pagada && <button className="text-indigo-700" onClick={() => setPayment(item)}>Pagar</button>}</td>}</tr>)}</tbody></table></div>}
    {payment && <PaymentModal isOpen expensa={payment} onClose={() => setPayment(null)} onPaymentSuccess={() => setVersion(v => v + 1)} />}
  </div>;
}
