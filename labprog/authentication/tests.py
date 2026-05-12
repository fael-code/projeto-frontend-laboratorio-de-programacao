from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class AutenticacaoTestes(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        self.usuario_teste = User.objects.create_user(
            username='admin',
            email='admin@teste.com',
            password='teste_de_senha'
        )
        
        self.url_login = '/api/auth/login/' 

    def test_acesso_autorizado_com_credenciais_validas(self):
        carga_de_dados = {
            'email': 'admin@teste.com',
            'password': 'teste_de_senha'
        }
        
        resposta = self.client.post(self.url_login, carga_de_dados, format='json')
        self.assertEqual(resposta.status_code, status.HTTP_200_OK)

    def test_acesso_negado_com_senha_incorreta(self):
        carga_invasor = {
            'email': 'admin@teste.com',
            'password': 'senha_incorreta_qualquer'
        }
        
        resposta = self.client.post(self.url_login, carga_invasor, format='json')
        self.assertTrue(resposta.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_400_BAD_REQUEST])