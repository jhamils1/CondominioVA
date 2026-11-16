import { useCallback, useRef } from 'react';
import { adjuntarClipEvento } from '../api/notificacionesApi.js';
import { crearBufferFotogramas, registrarClipEnVivo } from './clipIncidencia.js';

export function useClipEvento(registrar, alFallar) {
  const buffer = useRef(null);
  if (!buffer.current) buffer.current = crearBufferFotogramas();
  const registrarConClip = useCallback((datos, opciones = {}) => {
    const { instanteClip, ...configuracion } = opciones;
    const resultado = registrar(datos, configuracion);
    if (Number.isFinite(instanteClip)) {
      registrarClipEnVivo(buffer.current, instanteClip, datos.id, resultado, adjuntarClipEvento,
        () => alFallar('La incidencia se registró, pero no se pudo adjuntar el clip.'));
    }
    return resultado;
  }, [registrar, alFallar]);
  return { buffer, registrarConClip };
}
