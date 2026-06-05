from django.db import models


class Question(models.Model):
    # mirrors your Supabase `questions` table shape
    SECTION_CHOICES = [
        ('writing', 'Writing'),
        ('speaking', 'Speaking'),
        ('reading', 'Reading'),
        ('listening', 'Listening'),
    ]

    text = models.TextField()
    section = models.CharField(max_length=20, choices=SECTION_CHOICES)
    task_type = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'[{self.section}] {self.text[:60]}'


class ScoreSubmission(models.Model):
    # mirrors your `scored_essays` Supabase table
    question = models.ForeignKey(Question, on_delete=models.SET_NULL, null=True)
    section = models.CharField(max_length=20)
    user_response = models.TextField()
    task_fulfillment = models.FloatField(null=True)
    coherence = models.FloatField(null=True)
    vocabulary = models.FloatField(null=True)
    readability = models.FloatField(null=True)
    overall = models.FloatField(null=True)
    feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.section} submission — overall {self.overall}'
