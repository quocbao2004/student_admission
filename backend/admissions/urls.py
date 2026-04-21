from django.urls import path
from .views import MyProfileView, DocumentListUploadView, DocumentDeleteView

urlpatterns = [
    path('profile/me/', MyProfileView.as_view(), name='my-profile'),
    path('documents/', DocumentListUploadView.as_view(), name='documents-list-upload'),
    path('documents/<uuid:doc_id>/', DocumentDeleteView.as_view(), name='document-delete'),
]
