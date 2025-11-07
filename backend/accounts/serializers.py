from djoser.serializers import UserCreateSerializer, UserSerializer, PasswordResetConfirmSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.core.exceptions import ValidationError
import logging
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode

User = get_user_model()
logger = logging.getLogger(__name__)

# ==================== SERIALIZER PARA REGISTRO ====================
class CustomUserCreateSerializer(UserCreateSerializer):
    acepta_politicas = serializers.BooleanField(write_only=True)

    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ("id", "email", "password", "acepta_politicas")

    def create(self, validated_data):
        # Forzar rol estudiante
        validated_data["is_estudiante"] = True
        validated_data["is_admin_interu"] = False
        validated_data["is_staff"] = False
        validated_data["is_superuser"] = False
        
        return super().create(validated_data)

    def validate_acepta_politicas(self, value):
        if not value:
            raise serializers.ValidationError("Debe aceptar las politicas de uso para registrarse.")
        return value


# ==================== SERIALIZER PARA PERFIL ====================
class CustomUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        model = User
        fields = ("id", "email", "acepta_politicas", "is_estudiante", "is_admin_interu")


# ==================== SERIALIZER PARA RESET DE CONTRASENA (CON LOGGING LIMPIO) ====================
class LoggingPasswordResetConfirmSerializer(PasswordResetConfirmSerializer):
    """
    Serializer profesional que registra TODO el proceso de reseteo
    y valida cada paso con mensajes claros de error
    """
    
    def validate(self, attrs):
        logger.info("="*60)
        logger.info("INICIO VALIDACION RESET DE CONTRASENA")
        logger.info(f"UID recibido: {attrs.get('uid')}")
        logger.info(f"Token recibido: {attrs.get('token')}")
        
        try:
            # Decodificar UID
            uid_decoded = urlsafe_base64_decode(attrs['uid']).decode()
            logger.info(f"UID decodificado correctamente: {uid_decoded}")
            
            # Buscar usuario
            user = User.objects.get(pk=uid_decoded)
            logger.info(f"Usuario encontrado: {user.email} (ID: {user.id})")
            
            # Verificar token
            token_valido = default_token_generator.check_token(user, attrs['token'])
            logger.info(f"Token valido: {token_valido}")
            
            if not token_valido:
                logger.error("TOKEN INVALIDO O EXPIRADO")
                raise serializers.ValidationError({
                    "token": "Token invalido o expirado. Por favor solicita un nuevo reseteo."
                })
            
        except User.DoesNotExist:
            logger.error(f"ERROR: Usuario con ID {uid_decoded} no existe")
            raise serializers.ValidationError({
                "uid": "No se encontro el usuario asociado a este enlace."
            })
        except Exception as e:
            logger.error(f"ERROR DECODIFICANDO UID: {str(e)}")
            raise serializers.ValidationError({
                "uid": "Formato de enlace invalido. Por favor verifica la URL."
            })
        
        # Validacion estandar de djoser
        return super().validate(attrs)
    
    def save(self):
        logger.info("GUARDANDO NUEVA CONTRASENA EN BASE DE DATOS...")
        logger.info(f"Usuario: {self.user.email}")
        
        try:
            super().save()
            logger.info("CONTRASENA GUARDADA EXITOSAMENTE")
        except Exception as e:
            logger.error(f"ERROR GUARDANDO CONTRASENA: {str(e)}")
            logger.error(f"Tipo de error: {type(e).__name__}")
            raise
