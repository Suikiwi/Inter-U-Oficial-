from django.core.exceptions import ValidationError

class PoliticaContrasenaValidator:
    def __init__(self, min_length=8, requiere_mayuscula=True, requiere_numero=True):
        self.min_length = min_length
        self.requiere_mayuscula = requiere_mayuscula
        self.requiere_numero = requiere_numero

    def validate(self, password, user=None):
        if len(password) < self.min_length:
            raise ValidationError("La contraseña es demasiado corta")
        if self.requiere_mayuscula and not any(c.isupper() for c in password):
            raise ValidationError("Debe contener al menos una mayúscula")
        if self.requiere_numero and not any(c.isdigit() for c in password):
            raise ValidationError("Debe contener al menos un número")

    def get_help_text(self):
        return (
            f"La contraseña debe tener al menos {self.min_length} caracteres, "
            f"{'una mayúscula' if self.requiere_mayuscula else ''} "
            f"{'y un número' if self.requiere_numero else ''}."
        )
