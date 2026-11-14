/// Reglas de navegación de la aplicación; el backend conserva la autorización.
const rolesPredeterminados = <String>{
  'administrador', 'guardia', 'propietario', 'inquilino',
};
const rolesConocidos = <String>{...rolesPredeterminados, 'personalizado'};

const rutasPorRol = <String, Set<String>>{
  '/perfil': rolesConocidos,
  '/editar-perfil': rolesPredeterminados,
  '/cambiar-password': rolesPredeterminados,
  '/dashboard': {'administrador'},
  '/alertas-seguridad': {'administrador', 'guardia'},
  '/avisos-residente': {'propietario', 'inquilino'},
  '/reconocimiento-facial': {'administrador', 'guardia'},
  '/expensas': {'administrador', 'propietario'},
  '/objetos-perdidos': {'administrador', 'propietario', 'inquilino'},
  '/areas-comunes': {'administrador', 'propietario', 'inquilino'},
  '/mis-reservas': {'administrador', 'propietario', 'inquilino'},
};

bool puedeAcceder(String? rol, String ruta, [List<dynamic>? capacidades]) {
  if (rol == 'personalizado' && ruta == '/visitas-operativas') {
    return capacidades?.contains('visitas.consultar_operativas') == true;
  }
  return rol != null && (rutasPorRol[ruta]?.contains(rol) ?? false);
}

bool puedeRegistrarNotificaciones(Map<String, dynamic>? user) =>
    user != null && rolesPredeterminados.contains(user['role']);

String nombreRol(String? rol) => switch (rol) {
  'administrador' => 'Administrador',
  'guardia' => 'Guardia de seguridad',
  'propietario' => 'Propietario',
  'inquilino' => 'Inquilino',
  'personalizado' => 'Rol personalizado',
  _ => 'Sin rol autorizado',
};

Map<String, dynamic>? validarUsuarioActual(dynamic data) {
  if (data is! Map<String, dynamic> ||
      data['id'] is! int ||
      data['username'] is! String ||
      (data['username'] as String).trim().isEmpty ||
      data['role'] is! String ||
      !rolesConocidos.contains(data['role'])) {
    return null;
  }
  if (data['role'] == 'personalizado' &&
      (data['rol_nombre'] is! String ||
       (data['rol_nombre'] as String).trim().isEmpty ||
       data['capacidades'] is! List ||
       (data['capacidades'] as List).any((value) => value is! String))) {
    return null;
  }
  return data;
}
