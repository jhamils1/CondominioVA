export default function ModoDetecciones({ value, onChange, tieneZona, disabled = false, tipo = 'vehiculos' }) {
  return <div className="modo-detecciones" role="group" aria-label="Mostrar detecciones">
    <span>Visualización</span>
    <button type="button" disabled={disabled} aria-pressed={value === 'todas'} onClick={() => onChange('todas')}>Todas</button>
    <button type="button" disabled={disabled} aria-pressed={value === 'vehiculos'} onClick={() => onChange('vehiculos')}>{tipo === 'personas' ? 'Solo personas' : tipo === 'mascotas' ? 'Solo mascotas' : 'Solo vehículos'}</button>
    <button type="button" disabled={disabled} aria-pressed={value === 'zona'} onClick={() => onChange('zona')}>{tipo === 'personas' ? 'Personas en zona' : tipo === 'mascotas' ? 'Mascotas en zona' : 'Vehículos en zona'}</button>
    {value === 'zona' && !tieneZona && <span>Configura una zona para ver {tipo === 'personas' ? 'personas' : tipo === 'mascotas' ? 'mascotas' : 'vehículos'} en ella.</span>}
  </div>;
}
