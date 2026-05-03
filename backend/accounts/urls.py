from django.urls import path
from .views import RegisterCandidateView, LoginCandidateView, MeView

urlpatterns = [
    path('register/', RegisterCandidateView.as_view(), name='register'),
    path('login/', LoginCandidateView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
]
