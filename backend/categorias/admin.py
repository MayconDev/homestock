from django.contrib import admin
from .models import Categoria


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome', 'usuario', 'criado_em', 'atualizado_em')
    search_fields = ('nome', 'descricao', 'usuario__username')
    list_filter = ('criado_em', 'atualizado_em')