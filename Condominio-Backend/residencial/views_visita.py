from rest_framework import status, viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Visita
from .serializers.serializersVisita import VisitaSerializer, VisitaListSerializer, VisitaResidenteSerializer
from administracion.models import Persona
from administracion.access import ApplicationRolePermission, effective_role, roles_for


class VisitaSearchFilter(filters.SearchFilter):
    def get_search_fields(self, view, request):
        if effective_role(request.user) in ('propietario', 'inquilino'):
            return ['visitante__nombre', 'visitante__apellido', 'estado']
        return super().get_search_fields(view, request)

class VisitaViewSet(viewsets.ModelViewSet):
    permission_classes = [ApplicationRolePermission]
    role_access = roles_for(read=('administrador', 'guardia', 'propietario', 'inquilino'),
                            write=('administrador', 'guardia'), extra={
                                'destroy': ('administrador',),
                                'visitantes_disponibles': ('administrador', 'guardia'),
                                'personas_disponibles': ('administrador', 'guardia'),
                                'finalizar_visita': ('administrador', 'guardia')})
    """
    ViewSet para CRUD completo de visitas
    """
    queryset = Visita.objects.select_related('visitante', 'recibe_persona').all()
    filter_backends = [VisitaSearchFilter, filters.OrderingFilter]
    search_fields = [
        'visitante__nombre', 'visitante__apellido', 'visitante__CI',
        'recibe_persona__nombre', 'recibe_persona__apellido', 'recibe_persona__CI',
        'estado'
    ]
    ordering_fields = [
        'fecha_hora_entrada', 'fecha_hora_salida', 'estado', 'fecha_registro'
    ]
    ordering = ['-fecha_hora_entrada']
    
    def get_serializer_class(self):
        if effective_role(self.request.user) in ('propietario', 'inquilino'):
            return VisitaResidenteSerializer
        if self.action == 'list':
            return VisitaListSerializer
        return VisitaSerializer
    
    def get_queryset(self):
        """
        Filtrar visitas por diferentes criterios
        """
        queryset = super().get_queryset()
        role = effective_role(self.request.user)
        if role == 'inquilino':
            # Sin relación inquilino-unidad no es posible comprobar la ocupación.
            return queryset.none()
        if role == 'propietario':
            queryset = queryset.filter(recibe_persona__user=self.request.user)
        
        # Filtrar por estado
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado=estado)
        
        # Filtrar por visitante específico
        visitante = self.request.query_params.get('visitante', None)
        if visitante:
            queryset = queryset.filter(visitante_id=visitante)
        
        # Filtrar por persona que recibe
        recibe_persona = self.request.query_params.get('recibe_persona', None)
        if recibe_persona:
            queryset = queryset.filter(recibe_persona_id=recibe_persona)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def visitantes_disponibles(self, request):
        """
        Obtener lista de visitantes disponibles
        """
        visitantes = Persona.objects.filter(tipo='V').values('id', 'nombre', 'apellido', 'CI')
        return Response(visitantes)
    
    @action(detail=False, methods=['get'])
    def personas_disponibles(self, request):
        """
        Obtener lista de propietarios e inquilinos disponibles
        """
        personas = Persona.objects.filter(tipo__in=['P', 'I']).values('id', 'nombre', 'apellido', 'CI', 'tipo')
        return Response(personas)
    
    @action(detail=True, methods=['post'])
    def finalizar_visita(self, request, pk=None):
        """
        Finalizar una visita estableciendo fecha_hora_salida y estado FINALIZADA
        """
        visita = self.get_object()
        visita.estado = 'FINALIZADA'
        visita.fecha_hora_salida = request.data.get('fecha_hora_salida')
        visita.save()
        
        serializer = self.get_serializer(visita)
        return Response(serializer.data)
