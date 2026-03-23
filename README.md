# 🎓 CELPIP Ace — Comprehensive English Language Proficiency Test Practice Platform

A modern, full-stack practice app for the **CELPIP (Canadian English Language Proficiency Index)** test, built with **React 19** + **Vite** + **Supabase**.

---

## 🚀 Quick Links

- **Live App**: (deploy to production)
- **Question Setup**: `/docs/QUICK_START.md` (5 minutes to add questions)
- **Full Setup Guide**: `/docs/QUESTION_BANK_SETUP.md` (detailed instructions)
- **Automation Checklist**: `/docs/SETUP_CHECKLIST.md` (step-by-step)
- **Integration Guide**: `/docs/INTEGRATION_GUIDE.md` (how it all works)

---

## ✨ Features

### ✅ Complete
- **Reading Section** (R1–R4): 38 official questions with passages, MCQ + fill-blank formats
- **3-Column Layout**: PrepCelpeep-style (question nav | passage | single question view)
- **Deep Linking**: Navbar items (L1, R3, S2) → direct navigation to practice sets
- **CRS Score Calculator**: Predict your Express Entry score
- **Question Types**: gist, detail, inference, vocab_context, tone_purpose, speaker_view, mcq, paragraph_match, etc.

### 🔄 Question Bank Automation
- **Google Sheets** → single source of truth
- **Google Apps Script** → one-click sync to Supabase
- **Backend Validation** → automatic error checking
- **Zero Manual SQL** → content creators can add/update questions without coding

### ⏳ In Progress
- Listening section (L1–L2)
- Writing section (W1–W2) with model answers
- Speaking section (S1–S2)
- AI writing feedback (GPT-4 integration)

---

## 📁 Project Structure

```
celpip-ace/
├── src/
│   ├── pages/
│   │   ├── PracticeSetPage.jsx       # 3-column layout (nav | passage | question)
│   │   ├── SectionPage.jsx            # Section homepage (R, L, W, S)
│   │   ├── CRSCalculatorPage.jsx       # CRS score calculator
│   │   └── ...
│   ├── components/
│   │   ├── Navbar.jsx                 # Deep-link navbar with submenu
│   │   ├── SingleQuestionPanel.jsx     # Question display + options
│   │   ├── QuestionNavDots.jsx        # Q1 Q2 Q3... navigation
│   │   ├── PassagePanel.jsx           # Passage/diagram viewer
│   │   └── ...
│   ├── hooks/
│   │   ├── usePracticeSet.js          # Fetch questions from Supabase
│   │   ├── useActivePart.js           # Track selected section/part
│   │   └── ...
│   ├── api/
│   │   ├── questionSync.js            # Backend: question validation + DB update
│   │   └── routes.js                  # Express route handler
│   ├── lib/
│   │   ├── supabaseClient.js          # Supabase SDK init
│   │   └── constants.js               # Mock data, question types, etc.
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── docs/
│   ├── QUICK_START.md                 # 5-step setup (start here!)
│   ├── QUESTION_BANK_SETUP.md         # Full automation guide
│   ├── SETUP_CHECKLIST.md             # Checkbox checklist
│   ├── INTEGRATION_GUIDE.md           # How automation integrates with React
│   ├── GoogleAppsScript.js            # Paste into Google Sheets
│   ├── question-bank-template.csv     # Sample data
│   └── schema_v4.sql                  # Database schema
├── supabase/
│   └── schema_v4.sql                  # Practice sets + questions tables
├── vite.config.js
├── package.json
└── README.md
```

---

## 🛠 Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| **Frontend** | React 19.2.4, Vite 8.0.0 | SPA with HMR, instant dev reload |
| **Database** | Supabase (PostgreSQL) | `practice_sets` + `questions` tables |
| **Auth** (future) | Supabase Auth | Google/email login for tracking progress |
| **Backend** | Supabase Edge Functions OR Express.js | Webhook to sync questions from Google Sheets |
| **Content** | Google Sheets + Google Apps Script | Non-technical question management |
| **Deployment** | Vercel (recommended) | Fast, built-in preview deployments |

---

## 🎯 Question Bank System

### Traditional Approach ❌
```
Code (hardcoded questions)
  ↓
  Manual SQL edits
  ↓
  Deploy
  (Error-prone, non-scalable)
```

### CELPIP Ace Automation ✅
```
Google Sheet (edit questions)
  ↓
  Google Apps Script (validate)
  ↓
  Webhook (sync automatically)
  ↓
  Supabase (store centrally)
  ↓
  React App (fetch + display)
  (Non-technical, scalable, fast)
```

### Setup (TL;DR)
1. Create Google Sheet with questions
2. Paste Google Apps Script
3. Click "Sync to Celpip"
4. Done! Questions auto-update in app

See `/docs/QUICK_START.md` for detailed steps.

---

## 🚀 Getting Started

### Prerequisites
```bash
- Node.js 18+
- npm or yarn
- Supabase project (free tier OK)
- Google account (for Google Sheets)
```

### Installation

1. **Clone repo**
   ```bash
   git clone https://github.com/clintviegas/celpipace.git
   cd celpipace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Add your Supabase URL + anon key
   ```

4. **Run Supabase schema** (one-time)
   - Go to Supabase Dashboard → SQL Editor
   - Copy content from `supabase/schema_v4.sql`
   - Paste and run

5. **Start dev server**
   ```bash
   npm run dev
   # Navigate to http://localhost:5173
   ```

### First Questions
Follow `/docs/QUICK_START.md` to add your first questions via Google Sheets.

---

## 📊 Reading Section — Complete

| Part | Title | Questions | Status |
|------|-------|-----------|--------|
| **R1** | Email — Fitness Centre | 11 | ✅ Done |
| **R2** | Community Centre Schedule | 8 | ✅ Done |
| **R3** | Digital Literacy in Schools | 9 | ✅ Done |
| **R4** | AI Regulation Debate | 10 | ✅ Done |
| **Total** | | **38** | ✅ Complete |

---

## 📚 Documentation

| Doc | Purpose | Time |
|-----|---------|------|
| **QUICK_START.md** | 5-step setup + column reference | 5 min |
| **QUESTION_BANK_SETUP.md** | Detailed guide + troubleshooting | 15 min |
| **SETUP_CHECKLIST.md** | Checkbox checklist for setup | 60 min |
| **INTEGRATION_GUIDE.md** | How automation integrates with React | 10 min |

Start with **QUICK_START.md**.

---

## 🤖 Future Roadmap

### Next (This Month)
- ✅ Reading R1–R4 (38 questions)
- ✅ Google Sheets question automation
- ⏳ Listening section (L1–L2)
- ⏳ Writing section (W1–W2)
- ⏳ Speaking section (S1–S2)

### Later (Next Month)
- AI writing feedback (GPT-4 integration)
- User progress tracking (Supabase Auth)
- Mock test mode (timer + scoring)
- SEO + blog content
- Admin dashboard

### Differentiation vs. PrepCelpeep
- ✨ **CRS Calculator** (unique value)
- ✨ **AI Writing Feedback** (coming soon)
- ✨ **Cleaner UX** (PrepCelpeep → cluttered)
- ✨ **Open-source** (community contributions)

---

## 🔗 API Reference

### Question Sync Endpoint

**POST** `/api/question-sync`

```json
{
  "section": "Reading",
  "part": "R1",
  "title": "Email — Fitness Centre",
  "passage": "...",
  "questions": [
    {
      "id": 1,
      "text": "What is the gist?",
      "questionType": "gist",
      "options": ["A", "B", "C", "D"],
      "answer": 0,
      "explanation": "...",
      "difficulty": "easy"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Synced Reading R1",
  "practiceSetId": "550e8400...",
  "questionsCount": 11
}
```

---

## 🐛 Troubleshooting

### App won't load
- Check Supabase URL + key in `.env.local`
- Run schema_v4.sql in Supabase Dashboard

### Questions don't appear
- Verify Google Sheet synced to Supabase (check SQL Editor)
- Check browser DevTools → Network tab for errors
- See `/docs/QUESTION_BANK_SETUP.md` troubleshooting section

### Google Apps Script sync fails
- Verify webhook URL in script (no trailing slash)
- Check API key Bearer token is correct
- See `/docs/SETUP_CHECKLIST.md` Phase 4

---

## 📝 License

MIT — Use freely for learning/commercial projects

---

## 🙋 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m "feat: add my feature"`)
4. Push to branch (`git push origin feature/my-feature`)
5. Open Pull Request

---

## 👤 Author

**Clint Viegas**  
GitHub: [@clintviegas](https://github.com/clintviegas)  
Email: clint@celpipace.com

---

## 🙏 Acknowledgments

- [CELPIP](https://www.celpip.ca/) for official test format
- [Supabase](https://supabase.com/) for database + auth
- [Vite](https://vitejs.dev/) for lightning-fast dev experience
- [React](https://react.dev/) for component framework
