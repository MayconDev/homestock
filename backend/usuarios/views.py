from rest_framework import generics, permissions
from .serializers import UsuarioCadastroSerializer


class UsuarioCadastroView(generics.CreateAPIView):
    serializer_class = UsuarioCadastroSerializer
    permission_classes = [permissions.AllowAny]