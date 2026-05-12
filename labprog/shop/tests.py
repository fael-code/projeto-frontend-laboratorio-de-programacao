from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Produto

class ProdutoTestes(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.produto_teste = Produto.objects.create(
            nome="Teste",
            descricao="Descrição de teste",
            estoque=5,
            preco=5000000.00
        )

        self.url_produtos = '/api/shop/produtos/' 

    def test_modelo_produto_criado_com_sucesso(self):
        produto = Produto.objects.get(nome="Teste")
        self.assertEqual(produto.estoque, 5)
        self.assertEqual(produto.descricao, "Descrição de teste")

    def test_api_lista_produtos(self):
        resposta = self.client.get(self.url_produtos)
        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resposta.data), 1) 
        self.assertEqual(resposta.data[0]['nome'], "Teste")