"""Controla el ensayo aislado: enviar en segundo plano y finalizar tras revisión."""
import argparse
import json
import os
import re
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path


BASE = 'http://127.0.0.1:18082/api/'
PACKAGE = 'com.condominiun.smart.pushprueba'
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def request(path, *, body=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    req = urllib.request.Request(BASE + path, headers=headers,
        data=json.dumps(body).encode() if body is not None else None,
        method='POST' if body is not None else 'GET')
    try:
        response = opener.open(req, timeout=15)
    except urllib.error.HTTPError as exc:
        response = exc
    with response:
        # No imprimir cuerpos o tokens de autenticación.
        if response.status != 200:
            raise RuntimeError(f'{path}: estado {response.status}')
        return json.loads(response.read())


def top_activity(adb, serial):
    result = subprocess.run([str(adb), '-s', serial, 'shell', 'dumpsys', 'activity', 'activities'],
        capture_output=True, timeout=15, check=True)
    lines = result.stdout.decode('utf-8', 'replace').splitlines()
    focused = [line for line in lines if re.search(r'\b(?:mResumedActivity|topResumedActivity)\b', line)]
    if not focused:
        raise RuntimeError('Android no informó la actividad en primer plano.')
    return any(PACKAGE in line for line in focused)


def test_process_running(adb, serial):
    result = subprocess.run([str(adb), '-s', serial, 'shell', 'pidof', PACKAGE],
                            capture_output=True, timeout=10)
    pids = result.stdout.decode('ascii', 'replace').strip()
    if result.returncode == 1 and not pids and not result.stderr.strip():
        return False
    if result.returncode == 0 and re.fullmatch(r'\d+(?:\s+\d+)*', pids):
        return True
    raise RuntimeError('No se pudo comprobar el proceso de la app de prueba.')


def close_background_process(adb, serial):
    # am kill elimina solo procesos en segundo plano; no usar force-stop,
    # que bloquea la recepción FCM hasta que el usuario reabra la aplicación.
    if top_activity(adb, serial):
        raise RuntimeError('La app de prueba debe estar fuera del primer plano.')
    subprocess.run([str(adb), '-s', serial, 'shell', 'am', 'kill', PACKAGE],
                   capture_output=True, timeout=10, check=True)
    for _ in range(10):
        if not test_process_running(adb, serial):
            print('Proceso de la app de prueba ausente.', flush=True)
            return
        time.sleep(0.5)
    raise RuntimeError('El proceso de prueba sigue activo; ensayo de app cerrada detenido.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('accion', choices=('enviar', 'enviar-cerrada', 'finalizar'))
    parser.add_argument('--dispositivo', required=True)
    args = parser.parse_args()
    if request('prueba-aislada/') != {'entorno': 'push-aislado', 'proyecto': 'condominio-seguridad'}:
        raise RuntimeError('El servidor no es el de prueba aislado.')
    access = request('login/', body={'username': 'guardia_ficticio',
                                    'password': 'PruebaTemporal2026'})['access']
    if args.accion == 'finalizar':
        result = request('prueba-finalizar/', body={}, token=access)
        if result != {'finalizar': True}:
            raise RuntimeError('No se confirmó la finalización de la prueba.')
        print('Prueba temporal liberada para finalizar.')
        return

    if request('prueba-enviar/', token=access) != {'dispositivo_listo': True}:
        raise RuntimeError('El dispositivo ficticio aún no está registrado.')
    adb = Path(os.environ['LOCALAPPDATA']) / 'Android' / 'Sdk' / 'platform-tools' / 'adb.exe'
    if not top_activity(adb, args.dispositivo):
        raise RuntimeError('La app de prueba no está inicialmente en primer plano.')
    subprocess.run([str(adb), '-s', args.dispositivo, 'shell', 'input', 'keyevent', 'KEYCODE_HOME'],
                   capture_output=True, timeout=10, check=True)
    for _ in range(10):
        time.sleep(0.5)
        if not top_activity(adb, args.dispositivo):
            break
    else:
        raise RuntimeError('No se pudo confirmar que la app pasó a segundo plano; no se envió.')
    print('App de prueba confirmada fuera del primer plano.', flush=True)
    if args.accion == 'enviar-cerrada':
        close_background_process(adb, args.dispositivo)
    if request('prueba-enviar/', body={}, token=access) != {'estado': 'ENVIADA'}:
        raise RuntimeError('Firebase no confirmó la aceptación del mensaje.')
    print('Firebase aceptó la alerta ficticia; verificar visualización en el teléfono.', flush=True)


if __name__ == '__main__':
    main()
