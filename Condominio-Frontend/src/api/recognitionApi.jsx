import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Convertir archivo a base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      console.log('Base64 generado:', result.substring(0, 50) + '...');
      console.log('Tamaño del archivo:', file.size, 'bytes');
      console.log('Tipo de archivo:', file.type);
      resolve(result);
    };
    reader.onerror = error => {
      console.error('Error al leer archivo:', error);
      reject(error);
    };
  });
};

// Enviar imagen para reconocimiento de placas
export const scanPlate = async (imageFile, cameraId = '') => {
  try {
    // Validar que sea un archivo de imagen
    if (!imageFile || !imageFile.type.startsWith('image/')) {
      throw new Error('El archivo seleccionado no es una imagen válida.');
    }

    // Validar tamaño del archivo (máximo 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('La imagen es demasiado grande. Máximo 10MB.');
    }

    console.log('Procesando imagen:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type
    });

    // Crear FormData para enviar archivo real
    const form = new FormData();
    form.append('upload', imageFile, imageFile.name); // <-- clave esperada por el backend
    form.append('camera_id', cameraId);
    form.append('regions', 'bo'); // Bolivia

    console.log('Enviando archivo como FormData...');
    const response = await apiClient.post('alpr/', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error en scanPlate:', error);
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error al procesar la imagen para reconocimiento de placas.');
  }
};

// Enviar URL de imagen para reconocimiento de placas
export const scanPlateFromUrl = async (imageUrl, cameraId = '') => {
  try {
    const payload = {
      image_url: imageUrl,
      camera_id: cameraId,
      regions: 'bo' // Bolivia, ajusta según tu región
    };

    const response = await apiClient.post('alpr/', payload);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error al procesar la URL de imagen para reconocimiento de placas.');
  }
};

// Obtener historial de lecturas de placas
export const fetchLecturasPlacas = async () => {
  try {
    const response = await apiClient.get('lecturas-placas/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener el historial de lecturas de placas.');
  }
};

// ===== FUNCIONES PARA RECONOCIMIENTO FACIAL =====

// Enviar imagen para reconocimiento facial
export const recognizeFace = async (imageFile, threshold = 0.80) => {
  try {
    // Validar que sea un archivo de imagen
    if (!imageFile || !imageFile.type.startsWith('image/')) {
      throw new Error('El archivo seleccionado no es una imagen válida.');
    }

    // Validar tamaño del archivo (máximo 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('La imagen es demasiado grande. Máximo 10MB.');
    }

    console.log('Procesando imagen para reconocimiento facial:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type,
      threshold: threshold
    });

    // Crear FormData para enviar archivo
    const form = new FormData();
    form.append('image_file', imageFile, imageFile.name);
    form.append('umbral', threshold.toString());

    console.log('Enviando archivo como FormData para reconocimiento facial...');
    const response = await apiClient.post('reconocimiento/', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error en recognizeFace:', error);
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error al procesar la imagen para reconocimiento facial.');
  }
};

// Enviar URL de imagen para reconocimiento facial
export const recognizeFaceFromUrl = async (imageUrl, threshold = 0.80) => {
  try {
    const payload = {
      image_url: imageUrl,
      umbral: threshold
    };

    const response = await apiClient.post('reconocimiento/', payload);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error al procesar la URL de imagen para reconocimiento facial.');
  }
};

// Enrolar persona en el sistema de reconocimiento facial
export const enrollPerson = async (personId, employeeId, imageFile) => {
  try {
    // Validar que sea un archivo de imagen
    if (!imageFile || !imageFile.type.startsWith('image/')) {
      throw new Error('El archivo seleccionado no es una imagen válida.');
    }

    // Validar tamaño del archivo (máximo 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('La imagen es demasiado grande. Máximo 10MB.');
    }

    if (!personId && !employeeId) {
      throw new Error('Debe proporcionar el ID de una persona o empleado.');
    }

    console.log('Enrolando persona:', {
      personId,
      employeeId,
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type
    });

    // Crear FormData para enviar archivo
    const form = new FormData();
    form.append('image_file', imageFile, imageFile.name);
    
    if (personId) {
      form.append('persona_id', personId.toString());
    }
    if (employeeId) {
      form.append('empleado_id', employeeId.toString());
    }

    console.log('Enviando archivo para enrolamiento...');
    const response = await apiClient.post('enrolar/', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error en enrollPerson:', error);
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error al enrolar la persona en el sistema de reconocimiento facial.');
  }
};

// ===== FUNCIONES PARA VERIFICAR ENROLAMIENTO =====

// Verificar estado de enrolamiento de personas y empleados
export const verificarEnrolamiento = async () => {
  try {
    const response = await apiClient.get('verificar-enrolamiento/');
    return response.data;
  } catch (error) {
    console.error('Error en verificarEnrolamiento:', error);
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error al verificar el estado de enrolamiento.');
  }
};

// Verificar estado de la API de Luxand
export const verificarLuxandAPI = async () => {
  try {
    const response = await apiClient.get('verificar-luxand/');
    return response.data;
  } catch (error) {
    console.error('Error en verificarLuxandAPI:', error);
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error al verificar el estado de Luxand API.');
  }
};

// Probar Luxand API directamente
export const probarLuxand = async (imageFile) => {
  try {
    // Validar que sea un archivo de imagen
    if (!imageFile || !imageFile.type.startsWith('image/')) {
      throw new Error('El archivo seleccionado no es una imagen válida.');
    }

    // Validar tamaño del archivo (máximo 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('La imagen es demasiado grande. Máximo 10MB.');
    }

    console.log('Probando Luxand API directamente:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type
    });

    // Crear FormData para enviar archivo
    const form = new FormData();
    form.append('image_file', imageFile, imageFile.name);

    console.log('Enviando archivo a Luxand API...');
    const response = await apiClient.post('probar-luxand/', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error en probarLuxand:', error);
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error al probar Luxand API.');
  }
};

// ===== FUNCIONES PARA AGREGAR FOTOS EXTRAS =====

// Agregar foto extra a una persona (para mejorar precisión del reconocimiento)
export const addExtraPhotoToPerson = async (personId, imageFile) => {
  try {
    // Validar que sea un archivo de imagen
    if (!imageFile || !imageFile.type.startsWith('image/')) {
      throw new Error('El archivo seleccionado no es una imagen válida.');
    }

    // Validar tamaño del archivo (máximo 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('La imagen es demasiado grande. Máximo 10MB.');
    }

    if (!personId) {
      throw new Error('Debe proporcionar el ID de la persona.');
    }

    console.log('Agregando foto extra a persona:', {
      personId,
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type
    });

    // Primero subir imagen a ImgBB
    const imgbbForm = new FormData();
    imgbbForm.append('image', imageFile);
    imgbbForm.append('key', import.meta.env.VITE_IMGBB_API_KEY || '');

    const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbForm
    });

    if (!imgbbResponse.ok) {
      throw new Error('Error al subir imagen a ImgBB');
    }

    const imgbbData = await imgbbResponse.json();
    const imageUrl = imgbbData.data.url;

    // Ahora enviar URL a Luxand para agregar foto extra
    const payload = {
      image_url: imageUrl
    };

    console.log('Enviando URL a Luxand para foto extra...');
    const response = await apiClient.post(`personas/${personId}/agregar_foto/`, payload);
    return response.data;
  } catch (error) {
    console.error('Error en addExtraPhotoToPerson:', error);
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error al agregar foto extra a la persona.');
  }
};

// Agregar foto extra a un empleado (para mejorar precisión del reconocimiento)
export const addExtraPhotoToEmployee = async (employeeId, imageFile) => {
  try {
    // Validar que sea un archivo de imagen
    if (!imageFile || !imageFile.type.startsWith('image/')) {
      throw new Error('El archivo seleccionado no es una imagen válida.');
    }

    // Validar tamaño del archivo (máximo 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('La imagen es demasiado grande. Máximo 10MB.');
    }

    if (!employeeId) {
      throw new Error('Debe proporcionar el ID del empleado.');
    }

    console.log('Agregando foto extra a empleado:', {
      employeeId,
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type
    });

    // Primero subir imagen a ImgBB
    const imgbbForm = new FormData();
    imgbbForm.append('image', imageFile);
    imgbbForm.append('key', import.meta.env.VITE_IMGBB_API_KEY || '');

    const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbForm
    });

    if (!imgbbResponse.ok) {
      throw new Error('Error al subir imagen a ImgBB');
    }

    const imgbbData = await imgbbResponse.json();
    const imageUrl = imgbbData.data.url;

    // Ahora enviar URL a Luxand para agregar foto extra
    const payload = {
      image_url: imageUrl
    };

    console.log('Enviando URL a Luxand para foto extra...');
    const response = await apiClient.post(`empleados/${employeeId}/agregar_foto/`, payload);
    return response.data;
  } catch (error) {
    console.error('Error en addExtraPhotoToEmployee:', error);
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error al agregar foto extra al empleado.');
  }
};