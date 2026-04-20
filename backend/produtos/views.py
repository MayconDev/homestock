from rest_framework import viewsets, permissions
from .models import Produto
from .serializers import ProdutoSerializer


class ProdutoViewSet(viewsets.ModelViewSet):
    serializer_class = ProdutoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Produto.objects.filter(usuario=self.request.user).select_related('categoria')

        nome = self.request.query_params.get('nome')
        categoria = self.request.query_params.get('categoria')

        if nome:
            queryset = queryset.filter(nome__icontains=nome)

        if categoria:
            queryset = queryset.filter(categoria_id=categoria)

        return queryset

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)