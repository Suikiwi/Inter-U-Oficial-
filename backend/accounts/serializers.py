from djoser.serializers import UserCreateSerializer, UserSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers
import uuid

User = get_user_model()

#Usuario personalizado, no necesita username (POST)
class CustomUserCreateSerializer(UserCreateSerializer):
    acepta_politicas = serializers.BooleanField(write_only=True)

    class Meta(UserCreateSerializer.Meta):
        model = User
        # aquí NO incluimos username
        fields = ("id", "email", "password", "acepta_politicas")

    def create(self, validated_data):
    # Autogenerar username si no viene
        if "username" not in validated_data:
            validated_data["username"] = f"user_{uuid.uuid4().hex[:8]}"
        return super().create(validated_data)

    def validate_acepta_politicas(self, value):
        if not value:
            raise serializers.ValidationError("Debe aceptar las políticas de uso para registrarse.")
        return value

#Usuario personalizado, no necesita username (GET)
class CustomUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        model = User
        fields = ("id", "email", "acepta_politicas")
