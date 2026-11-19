"""Reglas y exclusión local del monitor Imou; no abre cámaras por sí mismo."""
import math
import socket
from pathlib import Path

# El procesador remoto de visión escucha por defecto en 28767; reservar un
# puerto distinto para la exclusión del monitor evita confundir ambos procesos.
PUERTO_MONITOR = 28769
MARCA_REMOTA = Path(__file__).resolve().parent.parent / 'seguridad_vision' / 'recursos' / 'imou_remota.activa'
VEHICULOS = {'car', 'motorcycle', 'bus', 'truck'}


def adquirir_exclusion():
    """El monitor mantiene el puerto; los registros web lo toman brevemente."""
    if MARCA_REMOTA.exists():
        return None
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    if hasattr(socket, 'SO_EXCLUSIVEADDRUSE'):
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
    try:
        sock.bind(('127.0.0.1', PUERTO_MONITOR))
        return sock
    except OSError:
        sock.close()
        return None


def ocupado():
    sock = adquirir_exclusion()
    if sock is None:
        return True
    sock.close()
    return False


def en_zona(p, zona):
    dentro = False
    for i, b in enumerate(zona):
        a = zona[i - 1]
        cruz = (p[0] - a['x']) * (b['y'] - a['y']) - (p[1] - a['y']) * (b['x'] - a['x'])
        if (abs(cruz) < 1e-9 and min(a['x'], b['x']) <= p[0] <= max(a['x'], b['x'])
                and min(a['y'], b['y']) <= p[1] <= max(a['y'], b['y'])):
            return True
        if ((a['y'] > p[1]) != (b['y'] > p[1]) and
                p[0] < (b['x'] - a['x']) * (p[1] - a['y']) / (b['y'] - a['y']) + a['x']):
            dentro = not dentro
    return dentro


def iou(a, b):
    inter = max(0, min(a[2], b[2]) - max(a[0], b[0])) * max(0, min(a[3], b[3]) - max(a[1], b[1]))
    area = lambda c: (c[2] - c[0]) * (c[3] - c[1])
    return inter / (area(a) + area(b) - inter or 1)


class Seguimiento:
    """Equivalente a la regla de Imou web, con pérdida breve sin sumar tiempo."""
    def __init__(self, zona, segundos, ancho, alto):
        self.zona, self.segundos, self.ancho, self.alto = zona, segundos, ancho, alto
        self.pistas, self.anterior, self.siguiente = [], None, 1

    def procesar(self, detecciones, tiempo):
        if self.anterior is not None and tiempo <= self.anterior:
            self.pistas = []
        elif self.anterior is not None and tiempo - self.anterior > 2:
            self.pistas = [p for p in self.pistas if p['avisado'] and tiempo - p['visto'] <= 10]
            for pista in self.pistas:
                pista['interrumpida'] = True
        self.anterior = tiempo
        vehiculos = []
        for d in detecciones:
            if not isinstance(d, dict) or d.get('clase') not in VEHICULOS:
                continue
            caja = d.get('caja')
            if (not isinstance(caja, list) or len(caja) != 4 or
                    not all(isinstance(n, (int, float)) and not isinstance(n, bool) and math.isfinite(n) for n in caja) or
                    caja[2] <= caja[0] or caja[3] <= caja[1]):
                continue
            vehiculos.append({'clase': d['clase'], 'caja': caja,
                              'punto': ((caja[0] + caja[2]) / (2 * self.ancho), caja[3] / self.alto)})
        candidatos = []
        for pista in self.pistas:
            for indice, d in enumerate(vehiculos):
                if pista['clase'] != d['clase']:
                    continue
                interrumpida = pista.get('interrumpida', False)
                if interrumpida and tiempo - pista['visto'] > (10 if pista['avisado'] else 2):
                    continue
                distancia = math.dist(d['punto'], pista['ultimo'])
                cruce = iou(pista['caja'], d['caja'])
                if distancia <= (.03 if interrumpida else .08) and cruce >= (.5 if interrumpida else .15):
                    candidatos.append((cruce, pista, indice))
        asignados, usados = {}, set()
        for _, pista, indice in sorted(candidatos, key=lambda c: c[0], reverse=True):
            if indice not in asignados and pista['id'] not in usados:
                asignados[indice] = pista
                usados.add(pista['id'])
        nuevas, avisos = [], []
        for indice, d in enumerate(vehiculos):
            pista = asignados.get(indice)
            if pista is None:
                pista = {'id': self.siguiente, 'clase': d['clase'], 'ancla': None, 'acumulado': 0, 'avisado': False}
                self.siguiente += 1
            punto = d['punto']
            if not en_zona(punto, self.zona):
                pista.update(ancla=None, acumulado=0, avisado=False)
            elif pista['ancla'] is None or math.dist(punto, pista['ancla']) > .03:
                pista.update(ancla=punto, acumulado=0)
            elif not pista.get('interrumpida', False):
                pista['acumulado'] += max(0, tiempo - pista['visto'])
            if pista['ancla'] is not None and pista['acumulado'] >= self.segundos and not pista['avisado']:
                avisos.append({'clase': d['clase'], 'duracion': pista['acumulado']})
                pista['avisado'] = True
            pista.update(caja=d['caja'], ultimo=punto, visto=tiempo, interrumpida=False)
            nuevas.append(pista)
        for pista in self.pistas:
            ambigua = any(d['clase'] == pista['clase'] and i not in asignados for i, d in enumerate(vehiculos))
            if (pista['id'] not in usados and not ambigua and pista['ancla'] is not None
                    and tiempo - pista['visto'] <= (10 if pista['avisado'] else 2)):
                pista['interrumpida'] = True
                nuevas.append(pista)
        self.pistas = nuevas
        return avisos
