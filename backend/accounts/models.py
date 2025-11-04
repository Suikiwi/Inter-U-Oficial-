from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError

class User(AbstractUser):
    email = models.EmailField(unique=True)
    acepta_politicas = models.BooleanField(default=False)

    is_estudiante = models.BooleanField(default=True)
    is_admin_interu = models.BooleanField(default=False)

    USERNAME_FIELD = "username"   #  Django Admin sigue usando username
    REQUIRED_FIELDS = ["email"]   #  email obligatorio al crear superuser

    def clean(self):
        super().clean()
        # Solo validar dominio si es estudiante y no es superusuario
        if self.is_estudiante and not self.is_superuser:
            if not self.email.endswith("@inacapmail.cl"):
                raise ValidationError("Debe usar un correo institucional @inacapmail.cl")

    def __str__(self):
        return self.username or self.email

