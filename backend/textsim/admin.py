from django.contrib import admin

from .models import Analysis, AnalysisSettings, Comparison, Document, MatchingPassage


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['name', 'file_extension', 'size_bytes', 'word_count', 'status', 'uploaded_at', 'uploaded_by']
    list_filter = ['file_extension', 'status', 'uploaded_at']
    search_fields = ['name']


class ComparisonInline(admin.TabularInline):
    model = Comparison
    extra = 0


@admin.register(Analysis)
class AnalysisAdmin(admin.ModelAdmin):
    list_display = ['reference', 'user', 'ngram_size', 'alert_threshold', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    filter_horizontal = ['documents']


@admin.register(Comparison)
class ComparisonAdmin(admin.ModelAdmin):
    list_display = ['document1', 'document2', 'similarity', 'matches', 'status', 'created_at']
    list_filter = ['status']


@admin.register(MatchingPassage)
class MatchingPassageAdmin(admin.ModelAdmin):
    list_display = ['comparison', 'order', 'similarity']


@admin.register(AnalysisSettings)
class AnalysisSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'ngram_size', 'normalisation', 'alert_threshold']