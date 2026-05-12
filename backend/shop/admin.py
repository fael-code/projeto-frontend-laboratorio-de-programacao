from django.contrib import admin
from .models import Produto

@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'estoque', 'preco', 'data_adicao')
    search_fields = ('nome', 'descricao')
    list_filter = ('estoque',)