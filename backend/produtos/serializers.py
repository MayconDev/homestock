from rest_framework import serializers
from .models import Produto


class ProdutoSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.ReadOnlyField(source='categoria.nome')
    esta_vencido = serializers.ReadOnlyField()
    vence_em_breve = serializers.ReadOnlyField()
    estoque_baixo = serializers.ReadOnlyField()

    class Meta:
        model = Produto
        fields = [
            'id',
            'categoria',
            'categoria_nome',
            'nome',
            'descricao',
            'marca',
            'quantidade',
            'unidade_medida',
            'data_validade',
            'estoque_minimo',
            'local_armazenamento',
            'observacao',
            'criado_em',
            'atualizado_em',
            'esta_vencido',
            'vence_em_breve',
            'estoque_baixo',
        ]
        read_only_fields = [
            'id',
            'criado_em',
            'atualizado_em',
            'categoria_nome',
            'esta_vencido',
            'vence_em_breve',
            'estoque_baixo',
        ]