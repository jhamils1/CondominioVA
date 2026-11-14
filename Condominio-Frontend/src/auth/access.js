export const roles = ['administrador', 'guardia', 'propietario', 'inquilino', 'personalizado'];
export const roleLabel = { administrador: 'Administrador', guardia: 'Guardia de seguridad', propietario: 'Propietario', inquilino: 'Inquilino', personalizado: 'Rol personalizado' };
export const adminPaths = ['monitor-camaras','camaras','eventos-seguridad','notificaciones','usuarios','roles','empleados','cargos','propietarios','inquilinos','familiares','visitantes','mascotas','visitas','vehiculos','bloques','unidades','reconocimiento-vehicular','reconocimiento-facial','enrolar-persona','debug-enrolamiento','contratos','incidentes','multas','expensas','objetos-perdidos','areas-comunes','reservas'];
export const securityPaths = ['eventos-seguridad','notificaciones','visitas','vehiculos','incidentes','reconocimiento-vehicular','reconocimiento-facial'];
export function canAccess(role, path, capacidades = []) {
  if (!roles.includes(role)) return false;
  if (path === 'dashboard') return true;
  if (role === 'personalizado') return path === 'visitas' && Array.isArray(capacidades) && capacidades.includes('visitas.consultar_operativas');
  if (path === 'perfil') return ['propietario', 'inquilino'].includes(role);
  if (role === 'administrador') return adminPaths.includes(path);
  if (role === 'guardia') return securityPaths.includes(path);
  return (role === 'propietario' ? ['unidades','vehiculos','contratos','expensas','visitas'] : ['unidades','vehiculos','contratos','visitas']).includes(path);
}
export function roleKey(name) {
  const key = (name || '').trim().toLowerCase();
  return key === 'seguridad' || key === 'guardia de seguridad' ? 'guardia' : key;
}
