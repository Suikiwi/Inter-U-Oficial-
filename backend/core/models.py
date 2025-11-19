from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
import uuid
import secrets

# ----------------------- PERFIL ----------------
class Perfil(models.Model):
    id_perfil = models.AutoField(primary_key=True)
    estudiante = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    alias = models.CharField(max_length=15, blank=True, null=True, help_text="Nombre público opcional")
    nombre = models.CharField(max_length=100)  # obligatorio
    apellido = models.CharField(max_length=100)  # obligatorio
    carrera = models.CharField(max_length=100)  # obligatorio, lista en frontend
    area = models.CharField(max_length=100)     # obligatorio, lista en frontend
    biografia = models.TextField(blank=True, null=True)
    foto = models.URLField(blank=True, null=True)
    #Lista JSON
    habilidades_ofrecidas = models.JSONField(default=list, blank=True) 

    def __str__(self):
        return self.alias or f"{self.nombre} {self.apellido or ''}"


# ----------------------- PUBLICACION ----------------

class Publicacion(models.Model):
    id_publicacion = models.AutoField(primary_key=True)
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)

    habilidades_ofrecidas = models.JSONField(default=list, blank=True)  
    habilidades_buscadas = models.JSONField(default=list, blank=True)   

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    estado = models.BooleanField(default=True)
    estudiante = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.titulo

# ----------------------- CHAT ----------------

class Chat(models.Model):
    id_chat = models.AutoField(primary_key=True)
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    estado_intercambio = models.BooleanField(default=False)
    publicacion = models.ForeignKey('core.Publicacion', on_delete=models.CASCADE, related_name='chats')
    titulo = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Chat {self.id_chat}"


class ChatParticipante(models.Model):
    ROL_CHOICES = (('autor', 'Autor'), ('receptor', 'Receptor'))
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='participantes')
    estudiante = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='participaciones')
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default='receptor')
    calificado = models.BooleanField(default=False)

    class Meta:
        unique_together = ('chat', 'estudiante')


class Mensaje(models.Model):
    id_mensaje = models.AutoField(primary_key=True)
    texto = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='mensajes')
    estudiante = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mensajes')
    leido = models.BooleanField(default=False)

# ----------------------- CALIFICACION ----------------

class CalificacionChat(models.Model):
    id_calificacion = models.AutoField(primary_key=True)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='calificaciones')
    evaluador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='calificaciones_dadas')
    puntaje = models.IntegerField()
    comentario = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('chat', 'evaluador')

# ----------------------- NOTIFICACIONES -----------------

class Notificacion(models.Model):
    TIPO_CHOICES = (
        ('nuevo_chat', 'Nuevo chat'),
        ('nuevo_mensaje', 'Nuevo mensaje'),
        ('intercambio_completado', 'Intercambio completado'),
        ('calificacion_chat', 'Calificación de chat'), 
    )
    id_notificacion = models.AutoField(primary_key=True)
    mensaje = models.TextField()
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES, default='nuevo_mensaje')
    fecha = models.DateTimeField(auto_now_add=True)
    leida = models.BooleanField(default=False)

    estudiante = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notificaciones')
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, null=True, blank=True, related_name='notificaciones')
    publicacion = models.ForeignKey('core.Publicacion', on_delete=models.CASCADE, null=True, blank=True, related_name='notificaciones')
    calificacion = models.ForeignKey('core.CalificacionChat', on_delete=models.CASCADE, null=True, blank=True, related_name='notificaciones')


# ----------------------- REPORTES -----------------
class Reporte(models.Model):
    id_reporte = models.AutoField(primary_key=True)
    motivo = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.IntegerField(choices=[(0, 'Pendiente'), (1, 'Aceptado'), (2, 'Rechazado')], default=0)
    administrador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='reportes_moderados')
    estudiante = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reportes')
    publicacion = models.ForeignKey(Publicacion, on_delete=models.CASCADE)

User = get_user_model()

class Consentimiento(models.Model):
    estudiante = models.ForeignKey(User, on_delete=models.CASCADE, related_name="consentimientos")
    aceptado = models.BooleanField(default=False)
    fecha_aceptacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Consentimiento de {self.estudiante.email} - {'Aceptado' if self.aceptado else 'No aceptado'}"