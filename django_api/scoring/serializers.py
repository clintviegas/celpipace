from rest_framework import serializers
from .models import Question, ScoreSubmission


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'section', 'task_type', 'created_at']


class ScoreRequestSerializer(serializers.Serializer):
    # mirrors req.body shape in your api/score.js
    section = serializers.ChoiceField(choices=['writing', 'speaking'])
    question_id = serializers.IntegerField()
    response = serializers.CharField()


class ScoreSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScoreSubmission
        fields = '__all__'
