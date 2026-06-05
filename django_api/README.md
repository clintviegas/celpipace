# Django API — Learning Scaffold

This mirrors the patterns in the main CELPIP project but in Django + DRF.

| This file | Mirrors |
|---|---|
| `scoring/models.py` | `supabase/migrations/*.sql` |
| `scoring/views.py` | `api/score.js` |
| `scoring/serializers.py` | `req.body` validation in Node functions |
| `scoring/admin.py` | `api/admin.js` (but free, auto-generated) |
| `scoring/management/commands/seed_questions.py` | `scripts/seed-blog-posts.mjs` |

## Setup

```bash
cd django_api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# copy and fill in your keys
cp .env.example .env

python manage.py migrate
python manage.py seed_questions
python manage.py createsuperuser   # for /admin
python manage.py runserver
```

## Endpoints

| Method | URL | What it does |
|---|---|---|
| `GET` | `/api/questions/?section=writing` | List questions |
| `POST` | `/api/score/` | Score a writing or speaking response |
| `GET` | `/admin/` | Django Admin UI |

## POST /api/score/ body

```json
{
  "section": "writing",
  "question_id": 1,
  "response": "Dear Building Manager, I am writing to..."
}
```
