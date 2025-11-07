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

from djoser.serializers import PasswordResetConfirmSerializer
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from rest_framework import serializers
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

# ==================== SERIALIZER PARA RESET DE CONTRASEÑA CON LOGGING ====================
class LoggingPasswordResetConfirmSerializer(PasswordResetConfirmSerializer):
    def validate(self, attrs):
        logger.info("INICIO VALIDACION RESET DE CONTRASENA")
        uid_decoded = urlsafe_base64_decode(attrs["uid"]).decode()
        user = User.objects.get(pk=uid_decoded)

        if not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError({"token": "Token inválido o expirado."})

        self.user = user  # clave
        return super().validate(attrs)  # valida new_password / re_new_password

    def save(self):
        new_password = self.validated_data.get("new_password")
        if not getattr(self, "user", None):
            raise serializers.ValidationError({"detail": "Usuario no resuelto."})

        logger.info(f"Aplicando nueva contraseña a {self.user.email}")
        self.user.set_password(new_password)
        self.user.save(update_fields=["password"])
        logger.info("Contraseña guardada exitosamente")
        return None