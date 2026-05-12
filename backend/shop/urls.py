from django.urls import path
from .views import ProdutoListCreateView, ProdutoRetrieveUpdateDestroyView

urlpatterns = [
    path('produtos/', ProdutoListCreateView.as_view(), name='produto-list-create'),
    path('produtos/<int:pk>/', ProdutoRetrieveUpdateDestroyView.as_view(), name='produto-detail'),
]