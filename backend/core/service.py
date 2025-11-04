import datetime
from django.utils import timezone

class TemporizadorAutoEliminacion:
    """
    Permite verificar si un objeto está listo para ser eliminado
    según su fecha de creación y un umbral de días.
    """
    def __init__(self, dias=30):
        self.dias = dias

    def esta_listo_para_eliminar(self, fecha_creacion):
        return timezone.now() - fecha_creacion > datetime.timedelta(days=self.dias)


class SoftDeleteService:
    """
    Implementa borrado lógico (soft delete) para entidades como Publicación.
    """
    @staticmethod
    def desactivar(objeto):
        objeto.estado = False
        objeto.save()

    @staticmethod
    def reactivar(objeto):
        objeto.estado = True
        objeto.save()
