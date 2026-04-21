from django.urls import path
from .views import RegisterCandidateView, LoginCandidateView

urlpatterns = [
    path('register/', RegisterCandidateView.as_view(), name='register'),
    path('login/', LoginCandidateView.as_view(), name='login'),
]
