from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterCandidateDTO
from .services import AuthService

class RegisterCandidateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterCandidateDTO(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        try:
            AuthService.register_candidate(
                email=data['email'],
                password=data['password'],
                full_name=data['full_name'],
                cccd=data['cccd'],
                phone=data['phone']
            )
            return Response({"message": "Đăng ký thành công"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LoginCandidateView(TokenObtainPairView):
    pass
