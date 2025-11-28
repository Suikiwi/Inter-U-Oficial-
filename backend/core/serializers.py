from rest_framework import serializers
from .models import (
    CalificacionChat, Publicacion, Chat, ChatParticipante,
    Mensaje, Reporte, Perfil, Notificacion
)


def crear_notificacion(usuario, tipo="info", mensaje=None, chat=None, publicacion=None, calificacion=None):
    alias = getattr(usuario.perfil, "alias", None) or usuario.email
    titulo_chat = chat.titulo if chat and hasattr(chat, "titulo") else f"chat {chat.id_chat}" if chat else "un chat"

    # Si no se pasa mensaje, construirlo según el tipo
    if mensaje is None:
        if tipo == "nuevo_mensaje":
            mensaje = f"Nuevo mensaje en el chat '{titulo_chat}'"
        elif tipo == "intercambio_completado":
            mensaje = f"El autor ha marcado el chat '{titulo_chat}' como completado"
        elif tipo == "calificacion_chat":
            mensaje = f"{alias} calificó el chat '{titulo_chat}'"
        elif tipo == "nuevo_chat":
            mensaje = f"Se ha iniciado un nuevo chat: '{titulo_chat}'"
        else:
            mensaje = f"{alias} realizó una acción en el chat '{titulo_chat}'"

    return Notificacion.objects.create(
        estudiante=usuario,
        tipo=tipo,
        mensaje=mensaje,
        chat=chat,
        publicacion=publicacion,
        calificacion=calificacion
    )





# ----------------------- PERFIL SERIALIZERS
class PerfilCompletoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfil
        fields = [
            'id_perfil',
            'alias',
            'nombre',
            'apellido',
            'carrera',
            'area',
            'biografia',
            'foto',
            'habilidades_ofrecidas', # ahora lista
        ]
        read_only_fields = ['id_perfil']


class ConfirmarEliminarCuentaSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)

#----------------------- PUBLICACIONES SERIALIZERS

class PublicacionSerializer(serializers.ModelSerializer):
    autor_alias = serializers.SerializerMethodField()

    class Meta:
        model = Publicacion
        fields = '__all__'

    def get_autor_alias(self, obj):
        perfil = getattr(obj.estudiante, "perfil", None)
        return perfil.alias if perfil else f"Usuario {obj.estudiante.id}"

    def create(self, validated_data):
        user = self.context['request'].user
        perfil = getattr(user, "perfil", None)

        if not perfil:
            raise serializers.ValidationError(
                {"perfil": "Debes completar tu perfil antes de publicar."}
            )
        
        if not perfil.habilidades_ofrecidas or len(perfil.habilidades_ofrecidas) == 0:
            raise serializers.ValidationError(
                {"habilidades_ofrecidas": "Debes indicar al menos una habilidad ofrecida en tu perfil."}
            )

        return Publicacion.objects.create(
            estudiante=user,
            titulo=validated_data['titulo'],
            descripcion=validated_data.get('descripcion', ''),
            habilidades_ofrecidas=perfil.habilidades_ofrecidas,
            habilidades_buscadas=validated_data['habilidades_buscadas'],
        )

class ChatParticipanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatParticipante
        fields = '__all__'


class MensajeSerializer(serializers.ModelSerializer):
    autor_alias = serializers.CharField(source="estudiante.perfil.alias", read_only=True)

    class Meta:
        model = Mensaje
        fields = [
            "id_mensaje",
            "chat",
            "estudiante",
            "texto",
            "fecha",
            "leido",
            "autor_alias", 
        ]
        read_only_fields = ["id_mensaje", "fecha", "leido", "autor_alias"]


class CalificacionChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalificacionChat
        fields = '__all__'
        read_only_fields = ['id_calificacion', 'fecha']

    def validate_puntaje(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("El puntaje debe estar entre 1 y 5.")
        return value


class ChatSerializer(serializers.ModelSerializer):
    participantes = ChatParticipanteSerializer(many=True, read_only=True)
    mensajes = MensajeSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = '__all__'


class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = '__all__'
        read_only_fields = ['id_notificacion', 'fecha']

class PublicacionMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publicacion
        fields = ["id", "titulo"]

class PublicacionMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publicacion
        fields = ["id_publicacion", "titulo"]

class ReporteSerializer(serializers.ModelSerializer):
    publicacion = serializers.PrimaryKeyRelatedField(
        queryset=Publicacion.objects.all()
    )

    class Meta:
        model = Reporte
        fields = "__all__"
        read_only_fields = ["estudiante", "fecha", "estado"]



class ModerarReporteSerializer(serializers.ModelSerializer):
    accion = serializers.ChoiceField(choices=["aprobar", "rechazar", "eliminar"], write_only=True)

    class Meta:
        model = Reporte
        fields = ['id_reporte', 'accion']

    def update(self, instance, validated_data):
        accion = validated_data.pop("accion")
        if accion == "aprobar":
            instance.estado = 1
        elif accion == "rechazar":
            instance.estado = 2
        elif accion == "eliminar":
            instance.publicacion.estado = False
            instance.publicacion.save()
            instance.estado = 1
        instance.save()
        return instance
    
    
    
    

