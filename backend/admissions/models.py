import uuid
from django.db import models
from accounts.models import User, Profile

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='documents')
    type = models.CharField(max_length=50) # ACADEMIC_RECORD, IELTS, CCCD
    file_url = models.TextField()
    status = models.CharField(max_length=20, default='PENDING')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'documents'
        


class Major(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    quota = models.IntegerField()
    description = models.TextField(null=True, blank=True)
    allowed_methods = models.ManyToManyField('AdmissionMethod', blank=True, related_name='majors')

    class Meta:
        db_table = 'majors'
        


class SubjectCombination(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=10) # A00, A01
    subject1 = models.CharField(max_length=50)
    subject2 = models.CharField(max_length=50)
    subject3 = models.CharField(max_length=50)

    class Meta:
        db_table = 'subject_combinations'
        


class AdmissionMethod(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'admission_methods'
        


class ScoreFormula(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    method = models.ForeignKey(AdmissionMethod, on_delete=models.CASCADE, related_name='formulas')
    formula = models.TextField() # ví dụ: s1 + s2 + s3 + bonus

    class Meta:
        db_table = 'score_formulas'
        


class Score(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='scores')
    subject = models.CharField(max_length=50)
    score = models.FloatField()

    class Meta:
        db_table = 'scores'
        


class AdmissionSeason(models.Model):
    STATUS_CHOICES = [
        ('PLANNING', 'Đang lên kế hoạch'),
        ('OPEN', 'Đang mở đăng ký'),
        ('CLOSED', 'Đã đóng đăng ký'),
        ('PROCESSING', 'Đang xét tuyển'),
        ('COMPLETED', 'Hoàn thành'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    year = models.IntegerField()
    round_number = models.IntegerField(default=1)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNING')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'admission_seasons'
        ordering = ['-year', '-round_number']
        unique_together = ['year', 'round_number']

    def __str__(self):
        return f"{self.name} ({self.year} - Đợt {self.round_number})"


class Application(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='applications')
    major = models.ForeignKey(Major, on_delete=models.DO_NOTHING)
    method = models.ForeignKey(AdmissionMethod, on_delete=models.DO_NOTHING)
    combination = models.ForeignKey(SubjectCombination, on_delete=models.DO_NOTHING, null=True, blank=True)
    season = models.ForeignKey(AdmissionSeason, on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')
    priority_order = models.IntegerField()
    status = models.CharField(max_length=20, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'applications'
        


class AdmissionResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='result')
    total_score = models.FloatField(null=True, blank=True)
    is_passed = models.BooleanField(null=True, blank=True)
    ranked_position = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'admission_results'
        


class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='payments')
    order_id = models.CharField(max_length=100, unique=True)
    request_id = models.CharField(max_length=100, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=20, default='VNPAY')
    status = models.CharField(max_length=20, default='INIT') # INIT / PENDING / SUCCESS / FAILED
    transaction_code = models.CharField(max_length=100, null=True, blank=True)
    pay_url = models.TextField(null=True, blank=True)
    extra_data = models.TextField(null=True, blank=True)
    response_data = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'
        


class MajorBenchmark(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    major = models.ForeignKey(Major, on_delete=models.CASCADE, related_name='benchmarks')
    method = models.ForeignKey(AdmissionMethod, on_delete=models.CASCADE, related_name='benchmarks')
    year = models.IntegerField()
    score = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'major_benchmarks'
        

    def __str__(self):
        return f"{self.major.name} ({self.year}): {self.score}"


class ProfileWorkflowLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='workflow_logs')
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='profile_workflow_actions')
    from_status = models.CharField(max_length=30, null=True, blank=True)
    to_status = models.CharField(max_length=30)
    action = models.CharField(max_length=100)
    note = models.TextField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'profile_workflow_logs'


class DocumentVerificationLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='verification_logs')
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='document_verification_actions')
    from_status = models.CharField(max_length=30, null=True, blank=True)
    to_status = models.CharField(max_length=30)
    reason = models.TextField(null=True, blank=True)
    action = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'document_verification_logs'
