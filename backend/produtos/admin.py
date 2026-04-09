from django.contrib import admin
from .models import Produto


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'nome',
        'categoria',
        'usuario',
        'quantidade',
        'unidade_medida',
        'data_validade',
        'estoque_minimo',
        'local_armazenamento',
        'mostrar_esta_vencido',
        'mostrar_vence_em_breve',
        'mostrar_estoque_baixo',
    )
    search_fields = ('nome', 'marca', 'descricao', 'usuario__username', 'categoria__nome')
    list_filter = ('categoria', 'unidade_medida', 'data_validade', 'criado_em')

    @admin.display(boolean=True, description='Vencido')
    def mostrar_esta_vencido(self, obj):
        return obj.esta_vencido

    @admin.display(boolean=True, description='Vence em breve')
    def mostrar_vence_em_breve(self, obj):
        return obj.vence_em_breve

    @admin.display(boolean=True, description='Estoque baixo')
    def mostrar_estoque_baixo(self, obj):
        return obj.estoque_baixo