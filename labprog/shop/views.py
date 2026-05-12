from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Produto
from .serializers import ProdutoSerializer

class ProdutoListCreateView(generics.ListCreateAPIView):
    queryset = Produto.objects.all().order_by('-data_adicao')
    serializer_class = ProdutoSerializer
    # permission_classes = [IsAuthenticated]

class ProdutoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    # permission_classes = [IsAuthenticated]