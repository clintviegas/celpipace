import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Question, ScoreSubmission
from .serializers import ScoreRequestSerializer, QuestionSerializer


# mirrors: api/score.js → scoreWriting / scoreSpeaking
class ScoreView(APIView):
    def post(self, request):
        serializer = ScoreRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        section = data['section']

        try:
            question = Question.objects.get(pk=data['question_id'], section=section)
        except Question.DoesNotExist:
            return Response({'error': 'Question not found'}, status=status.HTTP_404_NOT_FOUND)

        if not settings.OPENAI_API_KEY:
            return Response({'error': 'Scoring service not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        scores = _call_openai(section, question.text, data['response'])

        submission = ScoreSubmission.objects.create(
            question=question,
            section=section,
            user_response=data['response'],
            **scores,
        )

        return Response({
            'submission_id': submission.id,
            'scores': scores,
        })


# mirrors: api/_lib/score-writing.js + score-speaking.js
def _call_openai(section, question_text, user_response):
    from openai import OpenAI
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    prompt = (
        f"You are a CELPIP {section} examiner. Score this response on four dimensions "
        f"(taskFulfillment, coherence, vocabulary, readability) each out of 12. "
        f"Question: {question_text}\n\nResponse: {user_response}\n\n"
        "Return JSON: {taskFulfillment, coherence, vocabulary, readability, overall, feedback}"
    )

    completion = client.chat.completions.create(
        model='gpt-4o',
        response_format={'type': 'json_object'},
        messages=[{'role': 'user', 'content': prompt}],
        temperature=0.2,
    )

    import json
    result = json.loads(completion.choices[0].message.content)
    return {
        'task_fulfillment': result.get('taskFulfillment'),
        'coherence': result.get('coherence'),
        'vocabulary': result.get('vocabulary'),
        'readability': result.get('readability'),
        'overall': result.get('overall'),
        'feedback': result.get('feedback', ''),
    }


# mirrors: fetching questions in your React pages
class QuestionListView(APIView):
    def get(self, request):
        section = request.query_params.get('section')
        qs = Question.objects.all()
        if section:
            qs = qs.filter(section=section)
        return Response(QuestionSerializer(qs, many=True).data)
