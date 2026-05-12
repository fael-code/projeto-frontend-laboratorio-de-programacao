from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegistroSerializer, CustomTokenSerializer

def user_login(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")
        
        print("\n=== INICIANDO PROTOCOLO DE LOGIN ===")
        print(f"1. E-mail recebido do HTML: {email}")
        print(f"2. Senha recebida do HTML: {password}")

        try:
            user_detected = User.objects.get(email=email)
            user = authenticate(request, username=user_detected.username, password=password)
        except:
            user = None

        if user is not None:
            login(request, user)
            return redirect("home")
        else:
            messages.error(request, "Invalid username or password.")
    return render(request, "login.html")


class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer

class RegistroAPIView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegistroSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "mensagem": "Usuário registrado com sucesso.",
                "usuário": {"username": user.username, "email": user.email},
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)