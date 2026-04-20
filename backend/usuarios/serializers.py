from django.contrib.auth.models import User
from rest_framework import serializers


class UsuarioCadastroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirmar_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "confirmar_password"]

    def validate(self, attrs):
        if attrs["password"] != attrs["confirmar_password"]:
            raise serializers.ValidationError(
                {"confirmar_password": "As senhas não coincidem."}
            )

        if User.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError(
                {"username": "Este nome de usuário já está em uso."}
            )

        email = attrs.get("email")
        if email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                {"email": "Este e-mail já está em uso."}
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("confirmar_password")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user