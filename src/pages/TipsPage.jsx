import { useMemo, useState } from 'react'
import { BookOpen, CheckCircle2, Clock, Download, Target } from 'lucide-react'
import { SECTIONS } from '../data/constants'
import SEO from '../components/SEO'

const STRATEGY_GUIDES = {
  listening: [
    {
      title: 'How to Catch the Answer Before the Distractor',
      readTime: '5 min',
      summary: 'CELPIP Listening often gives you one attractive wrong answer before the real answer. Train yourself to wait for the speaker\'s correction, condition, or final decision.',
      bullets: [
        'Circle words that signal a change: actually, but, instead, the only issue is, on second thought.',
        'Treat the final decision as stronger than the first suggestion in problem-solving conversations.',
        'For L5 and L6, write one-word stance notes for each speaker: supports, doubts, warns, rejects.',
      ],
    },
    {
      title: 'A Note-Taking System for L1 to L6',
      readTime: '6 min',
      summary: 'Good notes are short, directional, and tied to question types. You do not need a transcript; you need decision points, numbers, reasons, and attitude shifts.',
      bullets: [
        'Use arrows for cause and result, plus/minus signs for opinions, and initials for speakers.',
        'In news items, capture who, what changed, when it starts, and who is affected.',
        'Stop writing during answer options. Use those seconds to eliminate choices that do not match your notes.',
      ],
    },
    {
      title: 'Canadian English Listening Habits That Build Score',
      readTime: '4 min',
      summary: 'The test rewards comfort with everyday Canadian pace, reduced speech, and indirect politeness. Short daily exposure beats occasional long study sessions.',
      bullets: [
        'Listen to CBC clips, municipal announcements, workplace conversations, and local interviews.',
        'Shadow one 30-second clip daily, matching rhythm rather than trying to sound accent-free.',
        'Replay once to identify reductions like gonna, kinda, sort of, and I was wondering if.',
      ],
    },
  ],
  reading: [
    {
      title: 'The 90-Second Rule for Hard Reading Questions',
      readTime: '5 min',
      summary: 'Reading scores drop when one inference question steals time from five easier ones. Use a strict solve, mark, and return routine.',
      bullets: [
        'Spend the first pass collecting confident marks. Guess-and-mark anything that takes longer than 90 seconds.',
        'For inference, choose the answer that must be true, not the one that merely sounds possible.',
        'Avoid absolute answers unless the passage uses absolute proof.',
      ],
    },
    {
      title: 'R2 Diagrams: Easy Marks If You Read the Labels First',
      readTime: '4 min',
      summary: 'R2 is less about deep reading and more about accurate data handling. The labels, footnotes, and exceptions usually decide the answer.',
      bullets: [
        'Read the title, axis labels, categories, footnotes, and date range before any question.',
        'Watch for conditions like weekdays only, members only, before tax, or after rebate.',
        'Calculate with the visible numbers only. Do not import outside assumptions.',
      ],
    },
    {
      title: 'R4 Viewpoints: Separate Evidence From Opinion',
      readTime: '6 min',
      summary: 'Viewpoint questions test whether you can separate the writer\'s stance from examples, concessions, and opposing claims.',
      bullets: [
        'Label each paragraph as claim, reason, example, concession, or conclusion.',
        'When two writers discuss the same issue, track agreement and disagreement in a tiny two-column note.',
        'The correct answer usually mirrors attitude, not exact wording.',
      ],
    },
  ],
  writing: [
    {
      title: 'The CELPIP Email Template That Still Sounds Natural',
      readTime: '6 min',
      summary: 'High-scoring emails address every bullet clearly while keeping the tone appropriate to the relationship. Structure should guide you, not make your answer robotic.',
      bullets: [
        'Open with purpose: I am writing to ask about, complain about, follow up on, or thank you for.',
        'Give each bullet its own compact paragraph with one clear detail or example.',
        'Close with a specific next step and a sign-off that matches formal or informal tone.',
      ],
    },
    {
      title: 'Survey Responses: How to Build a CLB 9 Argument',
      readTime: '7 min',
      summary: 'The survey task is scored on clarity, development, and language control. A strong answer takes one side and develops two reasons deeply instead of listing five shallow points.',
      bullets: [
        'Use the order: position, reason one, example, reason two, example, conclusion.',
        'Add one concession sentence to sound balanced: Although the other option has benefits, my choice is stronger because...',
        'Proofread for article errors, verb tense consistency, and repeated basic words.',
      ],
    },
    {
      title: 'Vocabulary Upgrades That Do Not Feel Forced',
      readTime: '4 min',
      summary: 'Better vocabulary means precision, not decoration. Replace vague words only when the new word fits the sentence naturally.',
      bullets: [
        'Use beneficial, practical, costly, time-consuming, reliable, accessible, and inconvenient in everyday topics.',
        'Prepare phrase banks for complaints, recommendations, community issues, and workplace decisions.',
        'Keep grammar stable. A simple accurate sentence scores better than a complicated broken one.',
      ],
    },
  ],
  speaking: [
    {
      title: 'Speaking Without Freezing: The 3-Point Prep Window',
      readTime: '5 min',
      summary: 'Your preparation time should produce a route, not a script. Three quick notes are enough to keep you fluent for the full response.',
      bullets: [
        'Write one main answer, two supporting details, and one closing phrase.',
        'Use fillers that sound natural but controlled: Let me think about that, The main point is, Another reason is.',
        'Keep speaking through small grammar mistakes. Stopping hurts fluency more than a minor error.',
      ],
    },
    {
      title: 'S3 and S4 Image Tasks: Describe, Then Predict',
      readTime: '6 min',
      summary: 'Image tasks reward organized observation. Move from the whole scene to details, then make practical predictions based on visible evidence.',
      bullets: [
        'Describe location, people, actions, objects, and mood in that order.',
        'Use position language: in the foreground, behind them, on the left, near the entrance.',
        'For predictions, use likely, might, probably, and because to connect evidence to outcome.',
      ],
    },
    {
      title: 'Opinion Tasks: Sound Confident Without Sounding Memorized',
      readTime: '5 min',
      summary: 'A natural opinion response has a clear stance, everyday examples, and a short conclusion. You do not need perfect ideas; you need easy-to-follow delivery.',
      bullets: [
        'Start directly: I would choose..., I strongly believe..., In this situation, I would...',
        'Use one personal example and one general reason to show range.',
        'End cleanly with a summary sentence instead of trailing off when time runs out.',
      ],
    },
  ],
}

const TRAINING_RESOURCES = [
  { title: 'Speaking Templates', type: 'PDF', file: 'HZad+Speaking+Templates+(2)+(7).pdf' },
  { title: '200 Vocabulary Words', type: 'PDF', file: '200+Vocabulary+Words+(7)+(2).pdf' },
  { title: 'Bonus 400 CELPIP Word List', type: 'PDF', file: 'Bonus+400+CELPIP+Word+List+(5)+(2).pdf' },
  { title: '200 Phrasal Verbs', type: 'PDF', file: '200+Phrasal+Verbs+(9)+(3).pdf' },
  { title: 'Grammar Training Worksheet', type: 'DOCX', file: 'Grammar+Training+Worksheet_+(2)+(6)+(3).docx' },
]

const resourceHref = (file) => `/Training/${encodeURIComponent(file)}`

export default function TipsPage() {
  const [active, setActive] = useState('listening')
  const section = SECTIONS.find(s => s.id === active)
  const guides = useMemo(() => STRATEGY_GUIDES[active] || [], [active])

  return (
    <div className="page-wrap tips-page">
      <SEO
        title="CELPIP Resources — Tips & Strategies"
        description="Free section-by-section CELPIP tips for Listening, Reading, Writing, and Speaking, plus downloadable training resources."
        canonical="/celpip-resources"
      />

      <header className="tips-hero-panel">
        <div>
          <span className="tips-kicker">Free training library</span>
          <h2 className="page-title">CELPIP Strategy & Tips</h2>
          <p className="page-sub tips-sub">Open, practical training for every section, with clear starting points for every skill.</p>
        </div>
        <div className="tips-hero-stat">
          <Target size={22} />
          <strong>CLB 9+</strong>
          <span>strategy focus</span>
        </div>
      </header>

      <div className="section-tabs tips-tabs">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            className={`section-tab${active === s.id ? ' active' : ''}`}
            style={active === s.id ? { background: s.color, borderColor: s.color, color: '#fff' } : {}}
            onClick={() => setActive(s.id)}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <section className="tips-focus-band" style={{ '--tips-accent': section?.color || '#C8102E' }}>
        <div className="tips-focus-icon">{section?.icon}</div>
        <div>
          <span>{section?.label} focus</span>
          <h3>{guides.length} open strategy articles</h3>
          <p>Read the playbook, then practise the exact skill inside the matching CELPIP section.</p>
        </div>
      </section>

      <div className="tips-article-grid">
        {guides.map((guide) => (
          <article key={guide.title} className="tips-article-card">
            <div className="tips-article-meta">
              <span><BookOpen size={15} /> Strategy article</span>
              <span><Clock size={15} /> {guide.readTime}</span>
            </div>
            <h3>{guide.title}</h3>
            <p>{guide.summary}</p>
            <ul>
              {guide.bullets.map((item) => (
                <li key={item}><CheckCircle2 size={16} /> {item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <section className="tips-resource-section">
        <div className="tips-resource-head">
          <span className="tips-kicker">Training downloads</span>
          <h3>Templates, vocabulary, grammar, and phrase banks</h3>
          <p>These files are available directly from your training folder for fast review before practice sessions.</p>
        </div>
        <div className="tips-resource-grid">
          {TRAINING_RESOURCES.map((resource) => (
            <a key={resource.file} className="tips-resource-card" href={resourceHref(resource.file)} target="_blank" rel="noreferrer">
              <span className="tips-resource-type">{resource.type}</span>
              <strong>{resource.title}</strong>
              <span><Download size={15} /> Open resource</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}