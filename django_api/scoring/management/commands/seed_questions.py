from django.core.management.base import BaseCommand
from scoring.models import Question

# mirrors: scripts/seed-blog-posts.mjs — run with: python manage.py seed_questions
SAMPLE_QUESTIONS = [
    {
        'section': 'writing',
        'task_type': 'task1',
        'text': 'Your neighbour has been playing loud music late at night. Write an email to your building manager describing the problem and asking for help.',
    },
    {
        'section': 'writing',
        'task_type': 'task2',
        'text': 'Some people think that cities should ban cars from their centres. Do you agree or disagree? Give reasons for your opinion.',
    },
    {
        'section': 'speaking',
        'task_type': 'personal_experience',
        'text': 'Describe a time when you had to learn something new quickly. What did you learn and how did you do it?',
    },
    {
        'section': 'speaking',
        'task_type': 'opinion',
        'text': 'Some people prefer to live in a big city while others prefer a small town. Which do you prefer and why?',
    },
]


class Command(BaseCommand):
    help = 'Seed the database with sample CELPIP questions'

    def handle(self, *args, **options):
        created = 0
        for q in SAMPLE_QUESTIONS:
            _, was_created = Question.objects.get_or_create(
                section=q['section'],
                task_type=q['task_type'],
                text=q['text'],
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'Seeded {created} new questions ({len(SAMPLE_QUESTIONS) - created} already existed)'))
