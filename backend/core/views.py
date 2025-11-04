from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed, ValidationError, NotFound
from django.db import transaction
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .models import (
    ChatParticipante, Publicacion, CalificacionChat,
    Mensaje, Reporte, Perfil, Notificacion, Chat
)
from .serializers import (
    ModerarReporteSerializer, PerfilCompletoSerializer,
    PublicacionSerializer, ChatSerializer, MensajeSerializer,
    NotificacionSerializer, ReporteSerializer, CalificacionChatSerializer
)



# ----------- PUBLICACIONES -----------
class PublicacionListCreateView(generics.ListCreateAPIView):
    queryset = Publicacion.objects.all()
    serializer_class = PublicacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(estudiante=self.request.user)


class PublicacionDetailView(generics.RetrieveAPIView):
    queryset = Publicacion.objects.all()
    serializer_class = PublicacionSerializer
    permission_classes = [permissions.AllowAny]


class PublicacionUpdateView(generics.UpdateAPIView):
    queryset = Publicacion.objects.all()
    serializer_class = PublicacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        publicacion = self.get_object()
        if publicacion.estudiante != self.request.user:
            raise AuthenticationFailed("No puedes editar publicaciones de otro usuario")
        serializer.save()


class PublicacionDeleteView(generics.DestroyAPIView):
    queryset = Publicacion.objects.all()
    serializer_class = PublicacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        if instance.estudiante != self.request.user:
            raise AuthenticationFailed("No puedes eliminar publicaciones de otro usuario")
        instance.delete()


class MisPublicacionesView(generics.ListAPIView):
    serializer_class = PublicacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Publicacion.objects.filter(estudiante=self.request.user)



# ----------- CHAT Y MENSAJES -----------

def crear_notificacion(usuario, tipo, mensaje, chat=None, publicacion=None, calificacion=None):
    Notificacion.objects.create(
        estudiante=usuario,
        tipo=tipo,
        mensaje=mensaje,
        chat=chat,
        publicacion=publicacion,
        calificacion=calificacion
    )


class ChatListCreateView(generics.ListCreateAPIView):
    queryset = Chat.objects.all().order_by('-fecha_inicio')
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        receptor = request.user
        publicacion_id = request.data.get('publicacion')
        if not publicacion_id:
            return Response({'detail': 'publicacion es requerida.'}, status=400)

        publicacion = get_object_or_404(Publicacion, pk=publicacion_id)
        autor = publicacion.estudiante

        if autor == receptor:
            return Response({'detail': 'No puedes iniciar un chat contigo mismo.'}, status=400)

        chat = Chat.objects.create(publicacion=publicacion)
        ChatParticipante.objects.get_or_create(chat=chat, estudiante=autor, defaults={'rol': 'autor'})
        ChatParticipante.objects.get_or_create(chat=chat, estudiante=receptor, defaults={'rol': 'receptor'})

        crear_notificacion(autor, 'nuevo_chat', f'Nuevo chat sobre tu publicación {publicacion_id}', chat, publicacion)
        return Response(ChatSerializer(chat).data, status=201)


class ChatDetailView(generics.RetrieveAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        chat = self.get_object()
        if not ChatParticipante.objects.filter(chat=chat, estudiante=request.user).exists():
            return Response({'detail': 'No autorizado.'}, status=403)
        return Response(ChatSerializer(chat).data, status=200)


class CompletarIntercambioView(generics.UpdateAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def patch(self, request, *args, **kwargs):
        estudiante = request.user
        chat = self.get_object()

        es_autor = ChatParticipante.objects.filter(chat=chat, estudiante=estudiante, rol='autor').exists()
        if not es_autor:
            return Response({'detail': 'Solo el autor puede completar el intercambio.'}, status=403)

        chat.estado_intercambio = True
        chat.save()

        receptores = ChatParticipante.objects.filter(chat=chat).exclude(estudiante=estudiante)
        for receptor in receptores:
            crear_notificacion(
                receptor.estudiante,
                'intercambio_completado',
                f'El autor ha marcado el chat {chat.pk} como completado.',
                chat
            )

        return Response(ChatSerializer(chat).data, status=200)



# MENSAJES

class MensajeListCreateView(generics.ListCreateAPIView):
    queryset = Mensaje.objects.all().order_by('fecha')
    serializer_class = MensajeSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        remitente = request.user
        chat_id = request.data.get('chat')
        if not chat_id:
            return Response({'detail': 'chat es requerido.'}, status=400)

        chat = get_object_or_404(Chat, pk=chat_id)
        if not ChatParticipante.objects.filter(chat=chat, estudiante=remitente).exists():
            return Response({'detail': 'No eres participante de este chat.'}, status=403)

        texto = request.data.get('texto')
        if not texto:
            return Response({'detail': 'texto es requerido.'}, status=400)

        mensaje = Mensaje.objects.create(chat=chat, estudiante=remitente, texto=texto)

        for otro in ChatParticipante.objects.filter(chat=chat).exclude(estudiante=remitente):
            crear_notificacion(otro.estudiante, 'nuevo_mensaje', f'Nuevo mensaje en el chat {chat.id_chat}', chat)

        return Response(MensajeSerializer(mensaje).data, status=201)



# CALIFICACIONES DE CHAT

class CalificacionChatCreateView(generics.CreateAPIView):
    queryset = CalificacionChat.objects.all()
    serializer_class = CalificacionChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        evaluador = request.user
        chat_id = request.data.get('chat')
        if not chat_id:
            return Response({'detail': 'chat es requerido.'}, status=400)

        chat = get_object_or_404(Chat, pk=chat_id)
        if not ChatParticipante.objects.filter(chat=chat, estudiante=evaluador).exists():
            return Response({'detail': 'No eres participante de este chat.'}, status=403)

        if CalificacionChat.objects.filter(chat=chat, evaluador=evaluador).exists():
            return Response({'detail': 'Ya has calificado este chat.'}, status=400)

        puntaje = request.data.get('puntaje')
        comentario = request.data.get('comentario', '')

        calificacion = CalificacionChat.objects.create(chat=chat, evaluador=evaluador, puntaje=puntaje, comentario=comentario)

        for otro in ChatParticipante.objects.filter(chat=chat).exclude(estudiante=evaluador):
            crear_notificacion(otro.estudiante, 'calificacion_chat', f'El usuario {evaluador.pk} calificó el chat {chat.pk}.', chat)

        return Response(CalificacionChatSerializer(calificacion).data, status=201)



# NOTIFICACIONES

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
        Notificacion.objects.filter(estudiante=request.user, leida=False).update(leida=True)
        return Response({'detail': 'Todas las notificaciones marcadas como leídas.'}, status=200)



# ----------- PERFIL Y NOTIFICACIONES -----------
User = get_user_model()

class CrearPerfilView(generics.CreateAPIView):
    serializer_class = PerfilCompletoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if Perfil.objects.filter(estudiante=self.request.user).exists():
            raise ValidationError({"detalle": "El perfil ya existe"})
        serializer.save(estudiante=self.request.user)

class PerfilDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = PerfilCompletoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        perfil, _ = Perfil.objects.get_or_create(estudiante=self.request.user)
        return perfil

class EliminarMiCuenta(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ----------- REPORTES Y MODERACIÓN -----------

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
