from django.shortcuts import get_object_or_404, render
from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.db import transaction
import requests
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated

from .models import (
    ChatParticipante, Publicacion, CalificacionChat,
    Mensaje, Reporte, Perfil, Notificacion, Chat, Consentimiento
)
from .serializers import (
    ModerarReporteSerializer, PerfilCompletoSerializer,
    PublicacionSerializer, ChatSerializer, MensajeSerializer,
    NotificacionSerializer, ReporteSerializer, CalificacionChatSerializer, crear_notificacion
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

    
@api_view(['POST'])
@permission_classes([])
def test_reset_flow(request):
    """
    Endpoint para probar el flujo completo de reseteo
    """
    email = request.data.get('email')
    
    # Paso 1: Solicitar reset
    try:
        response = requests.post(
            'http://127.0.0.1:8000/api/auth/users/reset_password/',
            json={'email': email},
            headers={'Content-Type': 'application/json'}
        )
        return Response({
            "step": "request_reset",
            "status": response.status_code,
            "data": response.json() if response.status_code == 204 else response.text
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    
    
    
from rest_framework import generics, permissions




# ----------- PUBLICACIONES VIEWS  -----------

class MisPublicacionesView(generics.ListAPIView):
    serializer_class = PublicacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Publicacion.objects.filter(estudiante=self.request.user)

class PublicacionListCreateView(generics.ListCreateAPIView):
    queryset = Publicacion.objects.filter(estado=True)
    serializer_class = PublicacionSerializer
    permission_classes = [permissions.AllowAny]  # ← acceso público

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
    
class PublicacionDetailView(generics.RetrieveAPIView):
    queryset = Publicacion.objects.filter(estado=True)
    serializer_class = PublicacionSerializer
    permission_classes = [permissions.AllowAny]

class PublicacionUpdateView(generics.UpdateAPIView):
    queryset = Publicacion.objects.all()
    serializer_class = PublicacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        publicacion = self.get_object()
        if publicacion.estudiante != self.request.user:
            raise PermissionDenied(
                {"publicacion": ["No puedes editar publicaciones de otro usuario."]}
            )
        serializer.save()

class PublicacionDeleteView(generics.DestroyAPIView):
    queryset = Publicacion.objects.all()
    serializer_class = PublicacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        if instance.estudiante != self.request.user:
            raise PermissionDenied(
                {"publicacion": ["No puedes eliminar publicaciones de otro usuario."]}
            )
        instance.delete()

# ----------- CHAT Y MENSAJES -----------

class MisChatsView(generics.ListAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(participantes__estudiante=user).distinct().order_by("-fecha_inicio")
    
class ChatListCreateView(generics.ListCreateAPIView):
    queryset = Chat.objects.all().order_by('-fecha_inicio')
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        receptor = request.user
        publicacion_id = request.data.get('publicacion')
        if not publicacion_id:
            raise serializers.ValidationError(
                {"publicacion": ["Este campo es requerido."]}
            )

        publicacion = get_object_or_404(Publicacion, pk=publicacion_id)
        autor = publicacion.estudiante

        if autor == receptor:
            raise serializers.ValidationError(
                {"publicacion": ["No puedes iniciar un chat contigo mismo."]}
            )

        chat = Chat.objects.create(publicacion=publicacion)
        ChatParticipante.objects.get_or_create(chat=chat, estudiante=autor, defaults={'rol': 'autor'})
        ChatParticipante.objects.get_or_create(chat=chat, estudiante=receptor, defaults={'rol': 'receptor'})

        crear_notificacion(
        usuario=autor,
        tipo='nuevo_chat',
        chat=chat,
        publicacion=publicacion
)

        return Response(ChatSerializer(chat).data, status=201)


class ChatDetailView(generics.RetrieveAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        chat = self.get_object()
        if not ChatParticipante.objects.filter(chat=chat, estudiante=request.user).exists():
            return Response({'detalle': 'No autorizado.'}, status=403)
        return Response(ChatSerializer(chat).data, status=200)


class CompletarIntercambioView(generics.UpdateAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def patch(self, request, *args, **kwargs):
        estudiante = request.user
        chat = self.get_object()

        es_autor = ChatParticipante.objects.filter(
            chat=chat, estudiante=estudiante, rol='autor'
        ).exists()
        if not es_autor:
            raise PermissionDenied(
                {"chat": ["Solo el autor puede completar el intercambio."]}
            )

        chat.estado_intercambio = True
        chat.save()

        receptores = ChatParticipante.objects.filter(chat=chat).exclude(estudiante=estudiante)
        for receptor in receptores:
            crear_notificacion(
            usuario=otro.estudiante,
            tipo='calificacion_chat',
            chat=chat,
            calificacion=calificacion
)


        return Response(ChatSerializer(chat).data, status=200)



# -----------------------MENSAJES -----------------------

class MensajeListCreateView(generics.ListCreateAPIView):
    serializer_class = MensajeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        chat_id = self.request.query_params.get("chat")
        qs = Mensaje.objects.all().order_by("fecha")
        if chat_id:
            qs = qs.filter(chat_id=chat_id)
        return qs

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        remitente = request.user
        chat_id = request.data.get("chat")
        if not chat_id:
            raise serializers.ValidationError({"chat": ["Este campo es requerido."]})

        chat = get_object_or_404(Chat, pk=chat_id)
        if not ChatParticipante.objects.filter(chat=chat, estudiante=remitente).exists():
            raise PermissionDenied({"chat": ["No eres participante de este chat."]})

        texto = request.data.get("texto")
        if not texto:
            raise serializers.ValidationError({"texto": ["Este campo es requerido."]})

        mensaje = Mensaje.objects.create(chat=chat, estudiante=remitente, texto=texto)

        # Notificar a los otros participantes
        for otro in ChatParticipante.objects.filter(chat=chat).exclude(estudiante=remitente):
            crear_notificacion(
            usuario=otro.estudiante,
            tipo='nuevo_mensaje',
            chat=chat
)


        return Response(MensajeSerializer(mensaje).data, status=201)



# ----------------------- CALIFICACIONES DE CHAT -----------------------

class CalificacionChatCreateView(generics.CreateAPIView):
    queryset = CalificacionChat.objects.all()
    serializer_class = CalificacionChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        evaluador = request.user
        chat_id = request.data.get('chat')
        if not chat_id:
            raise serializers.ValidationError(
                {"chat": ["Este campo es requerido."]}
            )

        chat = get_object_or_404(Chat, pk=chat_id)
        if not ChatParticipante.objects.filter(chat=chat, estudiante=evaluador).exists():
            raise PermissionDenied(
                {"chat": ["No eres participante de este chat."]}
            )

        if CalificacionChat.objects.filter(chat=chat, evaluador=evaluador).exists():
            raise serializers.ValidationError(
                {"chat": ["Ya has calificado este chat."]}
            )

        puntaje = request.data.get('puntaje')
        comentario = request.data.get('comentario', '')

        calificacion = CalificacionChat.objects.create(
            chat=chat,
            evaluador=evaluador,
            puntaje=puntaje,
            comentario=comentario
        )

        for otro in ChatParticipante.objects.filter(chat=chat).exclude(estudiante=evaluador):
         crear_notificacion(
    usuario=otro.estudiante,
    tipo='calificacion_chat',
    chat=chat,
    calificacion=calificacion
)


        return Response(CalificacionChatSerializer(calificacion).data, status=201)
    
    User = get_user_model()

class CalificacionesRecibidasView(generics.ListAPIView):
    serializer_class = CalificacionChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        usuario_id = self.kwargs.get("pk")
        usuario = User.objects.get(pk=usuario_id)

        # Buscar chats donde el usuario fue receptor
        chats_donde_participa = ChatParticipante.objects.filter(estudiante=usuario).values_list("chat_id", flat=True)

        # Buscar calificaciones hechas por otros en esos chats
        return CalificacionChat.objects.filter(chat_id__in=chats_donde_participa).exclude(evaluador=usuario)



# ----------------------- NOTIFICACIONES -----------------------

class NotificacionListView(generics.ListAPIView):
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notificacion.objects.filter(estudiante=self.request.user).order_by('-fecha')


class MarcarNotificacionLeidaView(generics.UpdateAPIView):
    serializer_class = NotificacionSerializer
    queryset = Notificacion.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk=None):
        notif = get_object_or_404(Notificacion, pk=pk, estudiante=request.user)
        notif.leida = True
        notif.save(update_fields=['leida'])
        return Response(NotificacionSerializer(notif).data, status=200)


class MarcarTodasNotificacionesLeidasView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        actualizadas = Notificacion.objects.filter(
            estudiante=request.user, leida=False
        ).update(leida=True)

        return Response(
            {"detalle": f"{actualizadas} notificaciones marcadas como leídas."},
            status=200
        )


# ----------------------- PERFIL -----------------------

User = get_user_model()

class CrearPerfilView(generics.CreateAPIView):
    serializer_class = PerfilCompletoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if Perfil.objects.filter(estudiante=self.request.user).exists():
            # Usamos non_field_errors porque no es un campo específico
            raise ValidationError(
                {"non_field_errors": ["El perfil ya existe."]}
            )
        serializer.save(estudiante=self.request.user)


class PerfilDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = PerfilCompletoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        perfil, _ = Perfil.objects.get_or_create(estudiante=self.request.user)
        return perfil

class PerfilPublicoPorUsuarioView(generics.RetrieveAPIView):
    serializer_class = PerfilCompletoSerializer
    permission_classes = [permissions.AllowAny] 

    def get_object(self):
        usuario_id = self.kwargs.get("usuario_id")
        return Perfil.objects.get(estudiante__id=usuario_id)

class EliminarMiCuenta(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        user = request.user
        password = request.data.get("password")

        if not password:
            raise serializers.ValidationError(
                {"password": ["Debes ingresar tu contraseña para confirmar."]}
            )

        if not user.check_password(password):
            raise serializers.ValidationError(
                {"password": ["La contraseña es incorrecta."]}
            )

        user.delete()
        return Response(
            {"detalle": "Tu cuenta ha sido eliminada correctamente."},
            status=status.HTTP_200_OK
        )

# ----------------------- REPORTES Y MODERACIÓN -----------------------

class CrearReporteView(generics.CreateAPIView):
    serializer_class = ReporteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(estudiante=self.request.user)


class ListarReportesView(generics.ListAPIView):
    queryset = Reporte.objects.all()
    serializer_class = ReporteSerializer
    permission_classes = [permissions.IsAdminUser]


class ModerarReporteView(generics.UpdateAPIView):
    serializer_class = ModerarReporteSerializer
    queryset = Reporte.objects.all()
    permission_classes = [permissions.IsAdminUser]
    

#------------CONSENTIMIENTO
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def verificar_consentimiento(request):
    user = request.user
    existe = Consentimiento.objects.filter(estudiante=user, aceptado=True).exists()
    return Response({ "consentimiento_aceptado": existe })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def registrar_consentimiento(request):
    user = request.user
    Consentimiento.objects.update_or_create(
        estudiante=user,
        defaults={ "aceptado": True }
    )
    return Response({ "status": "registrado" })