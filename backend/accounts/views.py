from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.serializers import LoggingPasswordResetConfirmSerializer  # o ForcePasswordResetConfirmSerializer

class PasswordResetConfirmView(APIView):
    permission_classes = []  # pública (como el reset)

    def post(self, request):
        serializer = LoggingPasswordResetConfirmSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()  # aquí se aplica set_password en tu serializer
        return Response(status=status.HTTP_204_NO_CONTENT)