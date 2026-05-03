import uuid

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("admissions", "0002_majorbenchmark"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="ProfileWorkflowLog",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("from_status", models.CharField(blank=True, max_length=30, null=True)),
                ("to_status", models.CharField(max_length=30)),
                ("action", models.CharField(max_length=100)),
                ("note", models.TextField(blank=True, null=True)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "actor",
                    models.ForeignKey(blank=True, null=True, on_delete=models.SET_NULL, related_name="profile_workflow_actions", to=settings.AUTH_USER_MODEL),
                ),
                ("profile", models.ForeignKey(on_delete=models.CASCADE, related_name="workflow_logs", to="accounts.profile")),
            ],
            options={"db_table": "profile_workflow_logs"},
        ),
        migrations.CreateModel(
            name="DocumentVerificationLog",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("from_status", models.CharField(blank=True, max_length=30, null=True)),
                ("to_status", models.CharField(max_length=30)),
                ("reason", models.TextField(blank=True, null=True)),
                ("action", models.CharField(max_length=100)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "actor",
                    models.ForeignKey(blank=True, null=True, on_delete=models.SET_NULL, related_name="document_verification_actions", to=settings.AUTH_USER_MODEL),
                ),
                ("document", models.ForeignKey(on_delete=models.CASCADE, related_name="verification_logs", to="admissions.document")),
            ],
            options={"db_table": "document_verification_logs"},
        ),
    ]
