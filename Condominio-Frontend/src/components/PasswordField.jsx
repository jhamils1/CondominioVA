import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function PasswordField({ id, label, value, onChange, autoComplete = 'new-password', required = false, disabled = false }) {
  const [visible, setVisible] = useState(false);
  const descripcion = label === 'Repetir nueva contraseña' ? 'repetición de contraseña' : label.toLowerCase();
  return <div>
    <label htmlFor={id} className="block text-sm font-medium mb-1">{label}</label>
    <div style={{ position: 'relative' }}>
      <input id={id} name={id} type={visible ? 'text' : 'password'} value={value}
        onChange={onChange} autoComplete={autoComplete} required={required} disabled={disabled}
        maxLength={256} className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        style={{ paddingRight: '3rem' }} />
      <button type="button" disabled={disabled} aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${descripcion}`}
        aria-pressed={visible} onClick={() => setVisible(actual => !actual)}
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '2.75rem', display: 'grid', placeItems: 'center', color: '#9dc5e1', background: 'transparent' }}>
        {visible ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
      </button>
    </div>
  </div>;
}
