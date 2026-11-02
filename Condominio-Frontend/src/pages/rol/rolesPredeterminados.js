import { roleKey } from '../../auth/access.js';

const rolesPredeterminados = [
  { key: 'administrador', name: 'Administrador', group: 'administrador', description: 'Administra el condominio y supervisa los eventos de seguridad.' },
  { key: 'guardia', name: 'Guardia de seguridad', group: 'Seguridad', description: 'Revisa alertas, atiende incidencias y registra visitas.' },
  { key: 'propietario', name: 'Propietario', group: 'propietario', description: 'Consulta sus datos residenciales y financieros autorizados.' },
  { key: 'inquilino', name: 'Inquilino', group: 'inquilino', description: 'Consulta su perfil y sus vehículos; el acceso a la unidad está pendiente.' },
];

export function estadoDeRoles(roles) {
  return rolesPredeterminados.map(role => {
    const matches = roles.filter(item => roleKey(item.name) === role.key);
    return { ...role, status: matches.length === 0 ? 'missing' : matches.length === 1 ? 'ready' : 'duplicate' };
  });
}
