from rest_framework import serializers
from accounts.models import Profile
from .models import Major, AdmissionMethod, SubjectCombination, Application, MajorBenchmark, AdmissionSeason

ALLOWED_DOCUMENT_TYPES = [
    'ACADEMIC_RECORD', 'IELTS', 'CCCD', 'ACHIEVEMENT',
    'PRIORITY_DOC', 'OTHER', 'GRADUATION_CERT',
    'HSA_CERT', 'SAT_CERT',  # Chứng chỉ ĐGNL và SAT
]
ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']
MAX_UPLOAD_SIZE_MB = 5

class ProfileUpdateDTO(serializers.Serializer):
    dob = serializers.DateField(required=False, allow_null=True)
    gender = serializers.ChoiceField(choices=['MALE', 'FEMALE', 'OTHER'], required=False, allow_null=True)
    address = serializers.CharField(max_length=500, required=False, allow_null=True, allow_blank=True)
    priority_area = serializers.CharField(max_length=10, required=False, allow_null=True, allow_blank=True)
    priority_object = serializers.CharField(max_length=10, required=False, allow_null=True, allow_blank=True)

class ProfileResponseDTO(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.CharField(source='user.full_name', read_only=True)
    user_cccd = serializers.CharField(source='user.cccd', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'user_email', 'user_full_name', 'user_cccd', 'user_phone',
                  'dob', 'gender', 'address', 'priority_area', 'priority_object', 'status', 'created_at']

class DocumentUploadDTO(serializers.Serializer):
    doc_type = serializers.ChoiceField(choices=ALLOWED_DOCUMENT_TYPES)
    file = serializers.FileField()

    def validate_file(self, value):
        # Kiểm tra dung lượng
        if value.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            raise serializers.ValidationError(f"Dung lượng file tối đa là {MAX_UPLOAD_SIZE_MB}MB.")
        # Kiểm tra định dạng
        ext = value.name.split('.')[-1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(f"Chỉ chấp nhận định dạng: {', '.join(ALLOWED_EXTENSIONS)}.")
        return value

class DocumentBulkUploadDTO(serializers.Serializer):
    doc_type = serializers.ChoiceField(choices=ALLOWED_DOCUMENT_TYPES)
    files = serializers.ListField(
        child=serializers.FileField(),
        max_length=10,
        required=True
    )

    def validate_files(self, value):
        for file in value:
            # Kiểm tra dung lượng
            if file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
                raise serializers.ValidationError(f"File {file.name} vượt quá {MAX_UPLOAD_SIZE_MB}MB.")
            # Kiểm tra định dạng
            ext = file.name.split('.')[-1].lower()
            if ext not in ALLOWED_EXTENSIONS:
                raise serializers.ValidationError(f"File {file.name} có định dạng không hợp lệ.")
        return value

class DocumentResponseDTO(serializers.Serializer):
    id = serializers.UUIDField()
    type = serializers.CharField()
    file_url = serializers.CharField()
    status = serializers.CharField()
    uploaded_at = serializers.DateTimeField()

class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        from .models import Score
        model = Score
        fields = ['id', 'subject', 'score']

# Catalog Serializers
class MajorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Major
        fields = '__all__'

class AdmissionMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdmissionMethod
        fields = '__all__'

class SubjectCombinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectCombination
        fields = '__all__'

# Application (Aspirations) Serializers
class ApplicationCreateDTO(serializers.Serializer):
    major_id = serializers.UUIDField()
    method_id = serializers.UUIDField()
    combination_id = serializers.UUIDField(required=False, allow_null=True)
    priority_order = serializers.IntegerField(required=False)

class ApplicationResponseDTO(serializers.ModelSerializer):
    major_name = serializers.CharField(source='major.name', read_only=True)
    major_code = serializers.CharField(source='major.code', read_only=True)
    method_name = serializers.CharField(source='method.name', read_only=True)
    combination_code = serializers.CharField(source='combination.code', read_only=True, allow_null=True)
    admission_result = serializers.SerializerMethodField()
    calculated_score = serializers.SerializerMethodField()

    season_name = serializers.CharField(source='season.name', read_only=True, allow_null=True, default=None)

    class Meta:
        model = Application
        fields = ['id', 'major', 'major_name', 'major_code', 'method', 'method_name', 
                  'combination', 'combination_code', 'season', 'season_name',
                  'priority_order', 'status', 
                  'admission_result', 'calculated_score', 'created_at']

    def get_admission_result(self, obj):
        result = obj.result.first() # Using related_name='result'
        if not result:
            return None
        return {
            "total_score": result.total_score,
            "is_passed": result.is_passed,
            "ranked_position": result.ranked_position,
            "published": obj.profile.status == 'RESULT_PUBLISHED'
        }

    def get_calculated_score(self, obj):
        from .models import Score, ScoreFormula
        formula_obj = ScoreFormula.objects.filter(method=obj.method).first()
        if not formula_obj:
            return None
            
        profile_scores = Score.objects.filter(profile=obj.profile)
        context = {}
        
        if obj.combination:
            comb = obj.combination
            s1 = profile_scores.filter(subject=comb.subject1).first()
            s2 = profile_scores.filter(subject=comb.subject2).first()
            s3 = profile_scores.filter(subject=comb.subject3).first()
            context['s1'] = s1.score if s1 else 0
            context['s2'] = s2.score if s2 else 0
            context['s3'] = s3.score if s3 else 0
        else:
            context['s1'] = 0
            context['s2'] = 0
            context['s3'] = 0
            # Inject all scores as variables to support custom formulas
            for ps in profile_scores:
                var_name = ps.subject.replace(' ', '').replace('-', '')
                context[var_name] = ps.score

        area = obj.profile.priority_area or ''
        bonus_area = 0.75 if area == 'KV1' else 0.5 if area == 'KV2-NT' else 0.25 if area == 'KV2' else 0
        
        target = obj.profile.priority_object or ''
        bonus_target = 0
        if any(x in target for x in ['1', '2', '3', '4']):
            bonus_target = 2.0
        elif any(x in target for x in ['5', '6', '7']):
            bonus_target = 1.0
            
        context['bonus'] = bonus_area + bonus_target
        try:
            expr = formula_obj.formula.replace(' ', '')
            context['avg'] = (context['s1'] + context['s2'] + context['s3']) / 3
            score = eval(expr, {"__builtins__": None}, context)
            return round(score, 2)
        except Exception:
            return None

# Benchmark & Stats Serializers
class MajorBenchmarkSerializer(serializers.ModelSerializer):
    method = serializers.ReadOnlyField(source='method.id')
    method_name = serializers.CharField(source='method.name', read_only=True)
    class Meta:
        model = MajorBenchmark
        fields = ['year', 'method', 'method_name', 'score']

class MajorStatsResponseDTO(serializers.ModelSerializer):
    application_count = serializers.IntegerField(read_only=True)
    match_rate = serializers.FloatField(read_only=True)
    benchmarks = MajorBenchmarkSerializer(source='benchmarks_list', many=True, read_only=True)

    class Meta:
        model = Major
        fields = ['id', 'code', 'name', 'quota', 'description', 
                  'application_count', 'match_rate', 'benchmarks']

class AdminMajorBenchmarkCRUDSerializer(serializers.ModelSerializer):
    major_name = serializers.CharField(source='major.name', read_only=True)
    method_name = serializers.CharField(source='method.name', read_only=True)

    class Meta:
        model = MajorBenchmark
        fields = '__all__'


class AdmissionSeasonSerializer(serializers.ModelSerializer):
    application_count = serializers.SerializerMethodField()

    class Meta:
        model = AdmissionSeason
        fields = ['id', 'year', 'round_number', 'name', 'status',
                  'start_date', 'end_date', 'is_active',
                  'application_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_application_count(self, obj):
        return obj.applications.count()
