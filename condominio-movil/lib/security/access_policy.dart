/// Reglas de navegación de la aplicación; el backend conserva la autorización.
const rolesConocidos = <String>{
  'administrador', 'guardia', 'propietario', 'inquilino',
};

const rutasPorRol = <String, Set<String>>{
  '/perfil': rolesConocidos,
  '/editar-perfil': rolesConocidos,
  '/cambiar-password': rolesConocidos,
  '/dashboard': {'administrador'},
  '/alertas-seguridad': {'administrador', 'guardia'},
  '/reconocimiento-facial': {'administrador', 'guardia'},
  '/expensas': {'administrador', 'propietario'},
  '/objetos-perdidos': {'administrador', 'propietario', 'inquilino'},
  '/areas-comunes': {'administrador', 'propietario', 'inquilino'},
  '/mis-reservas': {'administrador', 'propietario', 'inquilino'},
};

bool puedeAcceder(String? rol, String ruta) =>
    rol != null && (rutasPorRol[ruta]?.contains(rol) ?? false);

String nombreRol(String? rol) => switch (rol) {
  'administrador' => 'Administrador',
  'guardia' => 'Guardia de seguridad',
  'propietario' => 'Propietario',
  'inquilino' => 'Inquilino',
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
  return data;
}
