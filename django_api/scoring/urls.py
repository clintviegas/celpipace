from django.urls import path
from .views import ScoreView, QuestionListView

urlpatterns = [
    # POST /api/score/   — mirrors POST /api/score in your Vercel functions
    path('score/', ScoreView.as_view(), name='score'),
    # GET  /api/questions/?section=writing
    path('questions/', QuestionListView.as_view(), name='questions'),
]
