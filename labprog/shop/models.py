from django.db import models

class Produto(models.Model):
    nome = models.CharField(max_length=255, verbose_name="Nome do Produto")
    descricao = models.TextField(blank=True, null=True, verbose_name="Descrição do Produto")
    estoque = models.PositiveIntegerField(default=0, verbose_name="Quantidade em Estoque")
    preco = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Preço Unitário")
    data_adicao = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.nome
    
    class Meta:
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"