from django.urls import path
from .views import UsuarioCadastroView

urlpatterns = [
    path("cadastro/", UsuarioCadastroView.as_view(), name="usuario-cadastro"),
]