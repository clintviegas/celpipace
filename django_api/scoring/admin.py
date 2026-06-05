from django.contrib import admin
from .models import Question, ScoreSubmission


# Visit /admin after running the server — instant CRUD UI, no extra code needed
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'section', 'task_type', 'text', 'created_at']
    list_filter = ['section', 'task_type']
    search_fields = ['text']


@admin.register(ScoreSubmission)
class ScoreSubmissionAdmin(admin.ModelAdmin):
    list_display = ['id', 'section', 'overall', 'task_fulfillment', 'coherence', 'vocabulary', 'readability', 'created_at']
    list_filter = ['section']
    readonly_fields = ['user_response', 'feedback', 'created_at']
