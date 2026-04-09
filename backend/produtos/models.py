from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from categorias.models import Categoria


class Produto(models.Model):
    UNIDADES_MEDIDA = [
        ('un', 'Unidade'),
        ('kg', 'Quilograma'),
        ('g', 'Grama'),
        ('l', 'Litro'),
        ('ml', 'Mililitro'),
        ('cx', 'Caixa'),
        ('pct', 'Pacote'),
        ('fd', 'Fardo'),
    ]

    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='produtos'
    )
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        related_name='produtos'
    )
    nome = models.CharField(max_length=150)
    descricao = models.TextField(blank=True, null=True)
    marca = models.CharField(max_length=100, blank=True, null=True)
    quantidade = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unidade_medida = models.CharField(max_length=10, choices=UNIDADES_MEDIDA, default='un')
    data_validade = models.DateField(blank=True, null=True)
    estoque_minimo = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    local_armazenamento = models.CharField(max_length=100, blank=True, null=True)
    observacao = models.TextField(blank=True, null=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Produto'
        verbose_name_plural = 'Produtos'
        ordering = ['nome']

    def __str__(self):
        return self.nome

    @property
    def esta_vencido(self):
        if self.data_validade:
            return self.data_validade < timezone.localdate()
        return False

    @property
    def vence_em_breve(self):
        if self.data_validade:
            hoje = timezone.localdate()
            diferenca = (self.data_validade - hoje).days
            return 0 <= diferenca <= 7
        return False

    @property
    def estoque_baixo(self):
        return self.quantidade <= self.estoque_minimo