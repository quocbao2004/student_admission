from django.contrib import admin
from django.contrib import messages
from .models import (
    AdmissionSeason,
    MajorBenchmark,
    Major,
    AdmissionMethod,
    SubjectCombination,
    ScoreFormula,
    AdmissionResult,
    Application
)
from .services import StatisticService

@admin.register(AdmissionSeason)
class AdmissionSeasonAdmin(admin.ModelAdmin):
    list_display = ('name', 'year', 'round_number', 'status', 'is_active', 'start_date', 'end_date')
    list_filter = ('status', 'year', 'is_active')
    search_fields = ('name',)
    list_editable = ('status', 'is_active')
    actions = ['close_season', 'open_season']

    @admin.action(description='Khóa chặn nộp hồ sơ (Đóng đăng ký / Chuyển sang Đang xét tuyển)')
    def close_season(self, request, queryset):
        queryset.update(status='PROCESSING', is_active=False)
        self.message_user(request, "Đã khóa chặn nộp hồ sơ cho đợt tuyển sinh đã chọn (chuyển sang trạng thái Đang xét tuyển).")

    @admin.action(description='Mở đợt tuyển sinh')
    def open_season(self, request, queryset):
        # Thông thường chỉ có 1 đợt active tại 1 thời điểm
        AdmissionSeason.objects.filter(is_active=True).update(is_active=False, status='CLOSED')
        queryset.update(status='OPEN', is_active=True)
        self.message_user(request, "Đã mở đăng ký cho đợt tuyển sinh đã chọn.")

@admin.register(MajorBenchmark)
class MajorBenchmarkAdmin(admin.ModelAdmin):
    list_display = ('major', 'method', 'year', 'score', 'is_published', 'created_at')
    list_filter = ('year', 'major', 'method', 'is_published')
    search_fields = ('major__name', 'major__code')
    list_editable = ('is_published',)
    
@admin.register(Major)
class MajorAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'quota')
    search_fields = ('code', 'name')
    filter_horizontal = ('allowed_methods', 'allowed_combinations')
    actions = ['run_virtual_filtering', 'publish_benchmarks', 'publish_results']

    @admin.action(description='1. Chạy Lọc ảo (Xét tuyển) cho các ngành đã chọn')
    def run_virtual_filtering(self, request, queryset):
        for major in queryset:
            try:
                StatisticService.run_major_ranking(major.id)
            except Exception as e:
                self.message_user(request, f"Lỗi chạy lọc ảo cho ngành {major.code}: {str(e)}", level=messages.ERROR)
        self.message_user(request, "Đã chạy Lọc ảo thành công. Hệ thống đã sắp xếp điểm ứng viên.", level=messages.SUCCESS)

    @admin.action(description='2. Chốt & Đăng Điểm Chuẩn cho các ngành đã chọn')
    def publish_benchmarks(self, request, queryset):
        for major in queryset:
            try:
                StatisticService.publish_benchmark(major.id)
            except Exception as e:
                self.message_user(request, f"Lỗi chốt điểm chuẩn cho ngành {major.code}: {str(e)}", level=messages.ERROR)
        self.message_user(request, "Đã chốt và đăng điểm chuẩn thành công lên trang thông tin.", level=messages.SUCCESS)
        
    @admin.action(description='3. Công bố kết quả trúng tuyển cho thí sinh')
    def publish_results(self, request, queryset):
        for major in queryset:
            try:
                StatisticService.publish_major_results(major.id, actor=request.user)
            except Exception as e:
                self.message_user(request, f"Lỗi công bố cho ngành {major.code}: {str(e)}", level=messages.ERROR)
        self.message_user(request, "Đã công bố danh sách trúng tuyển thành công. Thí sinh có thể tra cứu kết quả.", level=messages.SUCCESS)

@admin.register(AdmissionMethod)
class AdmissionMethodAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(SubjectCombination)
class SubjectCombinationAdmin(admin.ModelAdmin):
    list_display = ('code', 'subject1', 'subject2', 'subject3')
    search_fields = ('code',)

@admin.register(ScoreFormula)
class ScoreFormulaAdmin(admin.ModelAdmin):
    list_display = ('method', 'formula')

@admin.register(AdmissionResult)
class AdmissionResultAdmin(admin.ModelAdmin):
    list_display = ('application', 'total_score', 'is_passed', 'ranked_position')
    list_filter = ('is_passed', 'application__major', 'application__method')
    search_fields = ('application__profile__user__full_name',)

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('profile', 'major', 'method', 'combination', 'priority_order', 'status')
    list_filter = ('status', 'major', 'method')
    search_fields = ('profile__user__full_name', 'profile__user__cccd')
