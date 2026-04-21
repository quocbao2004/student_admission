from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .serializers import (
    ProfileUpdateDTO,
    ProfileResponseDTO,
    DocumentUploadDTO,
    DocumentResponseDTO,
)
from .services import ProfileService, DocumentService


class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = ProfileService.get_my_profile(request.user)
            data = ProfileResponseDTO(profile).data
            return Response(data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        serializer = ProfileUpdateDTO(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            profile = ProfileService.update_my_profile(request.user, serializer.validated_data)
            data = ProfileResponseDTO(profile).data
            return Response(data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DocumentListUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        docs = DocumentService.get_my_documents(request.user)
        data = DocumentResponseDTO(docs, many=True).data
        return Response(data)

    def post(self, request):
        serializer = DocumentUploadDTO(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            doc = DocumentService.upload_document(
                user=request.user,
                doc_type=serializer.validated_data['doc_type'],
                file_obj=serializer.validated_data['file'],
            )
            return Response(DocumentResponseDTO(doc).data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DocumentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, doc_id):
        try:
            DocumentService.delete_document(request.user, doc_id)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
