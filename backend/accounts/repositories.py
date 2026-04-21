from django.core.exceptions import ObjectDoesNotExist
from .models import User, Profile

class UserRepository:
    @staticmethod
    def get_user_by_email(email):
        try:
            return User.objects.get(email=email)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    def create_user(email, password, full_name=None, cccd=None, phone=None, role='STUDENT'):
        user = User.objects.create_user(
            email=email,
            password=password,
            full_name=full_name,
            cccd=cccd,
            phone=phone,
            role=role
        )
        return user

class ProfileRepository:
    @staticmethod
    def get_profile_by_user_id(user_id):
        try:
            return Profile.objects.get(user_id=user_id)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    def create_profile(user):
        return Profile.objects.create(user=user)
