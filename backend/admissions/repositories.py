from django.core.exceptions import ObjectDoesNotExist
from .models import Application, AdmissionResult

class ApplicationRepository:
    @staticmethod
    def get_applications_by_profile(profile_id):
        return Application.objects.filter(profile_id=profile_id).order_by('priority_order')

    @staticmethod
    def create_application(profile, major, method, combination, priority_order):
        return Application.objects.create(
            profile=profile,
            major=major,
            method=method,
            combination=combination,
            priority_order=priority_order,
            status='PENDING'
        )

# Có thể cấu trúc tương tự cho ScoreRepository, DocumentRepository...
