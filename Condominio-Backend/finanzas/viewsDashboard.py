from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count, Q, F
from django.db.models.functions import TruncMonth
from datetime import datetime, date
from decimal import Decimal

from .models import expensa, contrato
from residencial.modelsVehiculo import Unidad
from administracion.models import Persona


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_resumen_financiero(request):
    """
    Dashboard principal con resumen financiero general
    """
    try:
        # Año actual
        año_actual = datetime.now().year
        
        # Total de expensas pagadas y pendientes
        total_expensas = expensa.objects.all().count()
        expensas_pagadas = expensa.objects.filter(pagada=True).count()
        expensas_pendientes = expensa.objects.filter(pagada=False).count()
        
        # Montos totales
        monto_total_recaudado = expensa.objects.filter(pagada=True).aggregate(
            total=Sum('monto')
        )['total'] or Decimal('0')
        
        monto_pendiente = expensa.objects.filter(pagada=False).aggregate(
            total=Sum('monto')
        )['total'] or Decimal('0')
        
        # Contratos activos
        contratos_activos = contrato.objects.filter(estado='A').count()
        
        # Unidades ocupadas vs disponibles
        unidades_ocupadas = Unidad.objects.filter(estado='O').count()
        unidades_disponibles = Unidad.objects.filter(estado='D').count()
        
        data = {
            'resumen': {
                'total_expensas': total_expensas,
                'expensas_pagadas': expensas_pagadas,
                'expensas_pendientes': expensas_pendientes,
                'porcentaje_pagado': round((expensas_pagadas / total_expensas * 100), 2) if total_expensas > 0 else 0,
                'monto_total_recaudado': float(monto_total_recaudado),
                'monto_pendiente': float(monto_pendiente),
                'contratos_activos': contratos_activos,
                'unidades_ocupadas': unidades_ocupadas,
                'unidades_disponibles': unidades_disponibles,
            }
        }
        
        return Response(data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def grafico_expensas_estado(request):
    """
    GRÁFICO 1: Estado de expensas (Pagadas vs Pendientes)
    Tipo: Gráfico de Dona/Pie
    """
    try:
        # Contar expensas por estado
        expensas_pagadas = expensa.objects.filter(pagada=True).count()
        expensas_pendientes = expensa.objects.filter(pagada=False).count()
        
        # Calcular montos
        monto_pagado = expensa.objects.filter(pagada=True).aggregate(
            total=Sum('monto')
        )['total'] or Decimal('0')
        
        monto_pendiente = expensa.objects.filter(pagada=False).aggregate(
            total=Sum('monto')
        )['total'] or Decimal('0')
        
        data = {
            'titulo': 'Estado de Expensas',
            'tipo': 'donut',
            'labels': ['Pagadas', 'Pendientes'],
            'datasets': [
                {
                    'label': 'Cantidad',
                    'data': [expensas_pagadas, expensas_pendientes],
                    'backgroundColor': ['#10B981', '#EF4444'],
                    'borderColor': ['#059669', '#DC2626'],
                }
            ],
            'montos': {
                'pagado': float(monto_pagado),
                'pendiente': float(monto_pendiente),
                'total': float(monto_pagado + monto_pendiente)
            },
            'porcentajes': {
                'pagado': round((expensas_pagadas / (expensas_pagadas + expensas_pendientes) * 100), 2) if (expensas_pagadas + expensas_pendientes) > 0 else 0,
                'pendiente': round((expensas_pendientes / (expensas_pagadas + expensas_pendientes) * 100), 2) if (expensas_pagadas + expensas_pendientes) > 0 else 0
            }
        }
        
        return Response(data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def grafico_ingresos_mensuales(request):
    """
    GRÁFICO 2: Ingresos mensuales del año actual
    Tipo: Gráfico de Barras/Líneas
    """
    try:
        # Obtener año del parámetro o usar el actual
        año = request.GET.get('año', datetime.now().year)
        año = int(año)
        
        # Obtener ingresos (expensas pagadas) por mes
        ingresos_por_mes = expensa.objects.filter(
            fecha_emision__year=año,
            pagada=True
        ).annotate(
            mes=TruncMonth('fecha_emision')
        ).values('mes').annotate(
            total=Sum('monto'),
            cantidad=Count('id')
        ).order_by('mes')
        
        # Inicializar todos los meses con 0
        meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        datos_mensuales = [0] * 12
        cantidades = [0] * 12
        
        # Llenar con los datos reales
        for ingreso in ingresos_por_mes:
            mes_index = ingreso['mes'].month - 1
            datos_mensuales[mes_index] = float(ingreso['total'])
            cantidades[mes_index] = ingreso['cantidad']
        
        # Total del año
        total_año = sum(datos_mensuales)
        promedio_mensual = total_año / 12 if total_año > 0 else 0
        
        data = {
            'titulo': f'Ingresos Mensuales {año}',
            'tipo': 'bar',
            'labels': meses,
            'datasets': [
                {
                    'label': f'Ingresos {año}',
                    'data': datos_mensuales,
                    'backgroundColor': '#3B82F6',
                    'borderColor': '#2563EB',
                    'borderWidth': 1
                }
            ],
            'estadisticas': {
                'total_año': round(total_año, 2),
                'promedio_mensual': round(promedio_mensual, 2),
                'mes_mayor_ingreso': meses[datos_mensuales.index(max(datos_mensuales))] if max(datos_mensuales) > 0 else 'N/A',
                'monto_mayor': round(max(datos_mensuales), 2)
            },
            'cantidades_por_mes': cantidades
        }
        
        return Response(data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def grafico_morosos_ranking(request):
    """
    GRÁFICO 3: Top 10 Propietarios con más expensas pendientes
    Tipo: Gráfico de Barras Horizontal
    """
    try:
        # Obtener límite del parámetro o usar 10 por defecto
        limite = int(request.GET.get('limite', 10))
        
        # Obtener propietarios con expensas pendientes
        # A través de: Propietario -> Contrato -> Unidad -> Expensas
        propietarios_morosos = []
        
        contratos_activos = contrato.objects.filter(estado='A').select_related('propietario', 'unidad')
        
        for cont in contratos_activos:
            expensas_pendientes = expensa.objects.filter(
                unidad=cont.unidad,
                pagada=False
            ).aggregate(
                total=Sum('monto'),
                cantidad=Count('id')
            )
            
            if expensas_pendientes['cantidad'] and expensas_pendientes['cantidad'] > 0:
                propietarios_morosos.append({
                    'propietario_id': cont.propietario.id,
                    'nombre': f"{cont.propietario.nombre} {cont.propietario.apellido}",
                    'unidad': cont.unidad.codigo,
                    'monto_pendiente': float(expensas_pendientes['total'] or 0),
                    'cantidad_pendiente': expensas_pendientes['cantidad']
                })
        
        # Ordenar por monto pendiente descendente
        propietarios_morosos.sort(key=lambda x: x['monto_pendiente'], reverse=True)
        
        # Tomar solo el top según el límite
        top_morosos = propietarios_morosos[:limite]
        
        # Preparar datos para el gráfico
        nombres = [m['nombre'] for m in top_morosos]
        montos = [m['monto_pendiente'] for m in top_morosos]
        cantidades = [m['cantidad_pendiente'] for m in top_morosos]
        
        data = {
            'titulo': f'Top {len(top_morosos)} Propietarios con Deudas Pendientes',
            'tipo': 'horizontalBar',
            'labels': nombres,
            'datasets': [
                {
                    'label': 'Monto Pendiente (Bs.)',
                    'data': montos,
                    'backgroundColor': '#F59E0B',
                    'borderColor': '#D97706',
                    'borderWidth': 1
                }
            ],
            'detalles': top_morosos,
            'estadisticas': {
                'total_morosos': len(propietarios_morosos),
                'deuda_total': round(sum([m['monto_pendiente'] for m in propietarios_morosos]), 2),
                'promedio_deuda': round(sum([m['monto_pendiente'] for m in propietarios_morosos]) / len(propietarios_morosos), 2) if propietarios_morosos else 0
            }
        }
        
        return Response(data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def grafico_comparativo_anual(request):
    """
    GRÁFICO BONUS: Comparación de ingresos entre años
    Tipo: Gráfico de Líneas
    """
    try:
        # Obtener últimos 4 años
        año_actual = datetime.now().year
        años = [año_actual - 3, año_actual - 2, año_actual - 1, año_actual]
        
        meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        
        datasets = []
        colores = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6']
        
        for i, año in enumerate(años):
            # Obtener ingresos por mes para este año
            ingresos_año = expensa.objects.filter(
                fecha_emision__year=año,
                pagada=True
            ).annotate(
                mes=TruncMonth('fecha_emision')
            ).values('mes').annotate(
                total=Sum('monto')
            ).order_by('mes')
            
            # Inicializar datos del año
            datos_año = [0] * 12
            
            # Llenar con datos reales
            for ingreso in ingresos_año:
                mes_index = ingreso['mes'].month - 1
                datos_año[mes_index] = float(ingreso['total'])
            
            datasets.append({
                'label': str(año),
                'data': datos_año,
                'borderColor': colores[i],
                'backgroundColor': colores[i] + '33',  # 20% opacity
                'fill': False,
                'tension': 0.4
            })
        
        data = {
            'titulo': 'Comparación de Ingresos por Año',
            'tipo': 'line',
            'labels': meses,
            'datasets': datasets
        }
        
        return Response(data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
