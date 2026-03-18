import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#FAFAF7",
  card: "#FFFFFF",
  accent: "#C8102E",
  accentDark: "#9B0D23",
  navy: "#1B2A4A",
  navyLight: "#2D4470",
  gold: "#D4A843",
  goldLight: "#F5E6C4",
  text: "#1B2A4A",
  textMuted: "#6B7A94",
  border: "#E8E6E1",
  success: "#2D8A56",
  successBg: "#E8F5E9",
  lockBg: "#F0EDE8",
  white: "#FFFFFF",
};

const FONTS = {
  display: "'Playfair Display', Georgia, serif",
  body: "'DM Sans', 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

// ── Data ──────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "listening", label: "Listening", icon: "🎧", color: "#4A90D9", questions: 8, freeQuestions: 3, duration: "47–55 min", celpipParts: 6 },
  { id: "reading", label: "Reading", icon: "📖", color: "#2D8A56", questions: 8, freeQuestions: 3, duration: "55–60 min", celpipParts: 4 },
  { id: "writing", label: "Writing", icon: "✍️", color: "#D4A843", questions: 4, freeQuestions: 1, duration: "53–60 min", celpipParts: 2 },
  { id: "speaking", label: "Speaking", icon: "🎤", color: "#C8102E", questions: 8, freeQuestions: 2, duration: "15–20 min", celpipParts: 8 },
];

const TIPS = {
  listening: [
    { title: "Note-taking Strategy", content: "Focus on keywords, names, numbers, and transition words. Don't try to write everything — jot abbreviations.", free: true },
    { title: "Prediction Technique", content: "Before each audio plays, read the questions first. Predict what type of info you need (date, name, reason, etc.).", free: true },
    { title: "Distractor Awareness", content: "CELPIP often includes 'near-miss' answers. The speaker may mention something then correct themselves — listen for the FINAL answer.", free: false },
    { title: "Tone & Attitude Cues", content: "Pay attention to intonation. Rising tone = question/uncertainty. Stress on a word = emphasis/importance. Sarcasm is rare but does appear.", free: false },
  ],
  reading: [
    { title: "Skim → Scan → Read", content: "First skim the passage (30 sec), then scan questions to know what to look for, then read carefully for answers.", free: true },
    { title: "Correspondence Questions", content: "For email/letter tasks, focus on the PURPOSE of each message and how the tone shifts between replies.", free: true },
    { title: "Viewpoint Questions", content: "When asked about the author's opinion, look for qualifying words: 'however', 'despite', 'although' — these signal the real viewpoint.", free: false },
    { title: "Vocabulary in Context", content: "Don't pick the dictionary definition. Ask: which meaning fits THIS sentence? Substitute each option and see which sounds natural.", free: false },
  ],
  writing: [
    { title: "Email Structure (Task 1)", content: "Use a clear format: greeting → reason for writing → 3 key points → polite closing. Match the tone to who you're writing to.", free: true },
    { title: "Survey Response (Task 2)", content: "Pick ONE clear position. Use: opinion → reason 1 + example → reason 2 + example → restate opinion. Aim for 200+ words.", free: false },
    { title: "Vocabulary Range", content: "Replace basic words: good→beneficial, bad→detrimental, important→crucial. Use 2-3 complex sentences with subordinate clauses.", free: false },
    { title: "Time Management", content: "Task 1: 25 min (150+ words). Task 2: 30 min (200+ words). Leave 3 min to proofread each. Spelling errors hurt your score.", free: false },
  ],
  speaking: [
    { title: "Preparation Time", content: "You get 20-30 seconds of prep time. Use it to note 2-3 key points. Don't write full sentences — just trigger words.", free: true },
    { title: "Fluency Over Accuracy", content: "Keep talking! Pauses hurt more than minor grammar mistakes. If you lose your train of thought, rephrase and continue.", free: true },
    { title: "Describe a Scene", content: "Use spatial language: 'In the foreground... In the background... On the left side...' This shows vocabulary range.", free: false },
    { title: "Opinion Tasks", content: "Structure: state opinion → give reason → provide personal example → conclude. Use phrases like 'From my perspective...' and 'Based on my experience...'", free: false },
  ],
};

const MOCK_QUESTIONS = {
  listening: [
    { id: 1, free: true, type: "Part 1 – Practice", scenario: "Listening to Problem Solving", prompt: "You will hear a conversation between two coworkers discussing a scheduling conflict. Listen carefully and answer the question.", question: "What does Sarah suggest as a solution to the scheduling conflict?", options: ["Moving the meeting to Thursday", "Having the meeting online instead", "Splitting the team into two groups", "Cancelling the meeting entirely"], correct: 1, explanation: "Sarah explicitly suggests switching to an online format, saying 'Why don't we just do it virtually? That way everyone can attend regardless of location.'" },
    { id: 2, free: true, type: "Part 2 – Practice", scenario: "Listening to a Daily Life Conversation", prompt: "You will hear a conversation at a community centre about signing up for programs.", question: "Why can't the man register for the swimming class today?", options: ["The class is already full", "Registration hasn't opened yet", "He needs to bring photo ID", "The class was cancelled this semester"], correct: 2, explanation: "The receptionist says registration for winter programs opens next Monday, so he cannot register today." },
    { id: 3, free: true, type: "Part 3 – Practice", scenario: "Listening for Information", prompt: "You will hear a news report about changes to public transit routes in a Canadian city.", question: "According to the report, when will the new bus routes take effect?", options: ["Immediately", "Next Monday", "In two weeks", "Next month"], correct: 2, explanation: "The reporter states the changes will be implemented 'starting next Monday morning.'" },
    { id: 4, free: false, type: "Part 3 – Full", scenario: "Listening for Information", prompt: "Listen to an announcement about a workplace policy change.", question: "What is the main reason given for the new remote work policy?", options: ["To reduce office costs", "To improve employee satisfaction", "To comply with new regulations", "To increase productivity"], correct: 1 },
    { id: 5, free: false, type: "Part 4", scenario: "Listening to a News Item", prompt: "Listen to a radio segment about environmental initiatives.", question: "What action did the city council approve?", options: ["A ban on single-use plastics", "A new recycling facility", "Tax incentives for green businesses", "Mandatory composting for residents"], correct: 2 },
    { id: 6, free: false, type: "Part 5", scenario: "Listening to a Discussion", prompt: "Listen to a panel discussion about housing affordability.", question: "Which expert disagrees with the proposed government intervention?", options: ["Dr. Chen", "Professor Williams", "Ms. Rodriguez", "Mr. Thompson"], correct: 3 },
    { id: 7, free: false, type: "Part 6", scenario: "Listening for Viewpoints", prompt: "Listen to a debate about education funding priorities.", question: "What is Speaker B's main argument against the proposal?", options: ["It costs too much", "It won't help rural areas", "It ignores teacher shortages", "It was tried before and failed"], correct: 2 },
    { id: 8, free: false, type: "Part 6", scenario: "Listening for Viewpoints", prompt: "Continue with the education debate.", question: "How does the moderator summarize the key disagreement?", options: ["Funding vs. training", "Urban vs. rural priorities", "Short-term vs. long-term goals", "Federal vs. provincial responsibility"], correct: 2 },
  ],
  reading: [
    { id: 1, free: true, type: "Part 1 – Practice", scenario: "Reading Correspondence", prompt: "Read the following email exchange between a tenant and a property manager about a maintenance request.", passage: "From: David Kim\nTo: Greenfield Property Management\nSubject: Urgent – Heating Issue in Unit 4B\n\nDear Property Management Team,\n\nI am writing to report that the heating system in my apartment has stopped working as of yesterday evening. The temperature inside has dropped significantly, and given that it is currently -15°C outside, this is an urgent matter that needs immediate attention.\n\nI have already checked the thermostat and replaced the batteries, but the system still does not respond. Could you please send a technician as soon as possible?\n\nThank you,\nDavid Kim", question: "What has David already done to try to fix the problem?", options: ["Called the heating company directly", "Checked and replaced thermostat batteries", "Turned the system off and back on", "Asked a neighbour for help"], correct: 1, explanation: "David states he has 'checked the thermostat and replaced the batteries' — this matches option B." },
    { id: 2, free: true, type: "Part 2 – Practice", scenario: "Reading for Charts & Graphs", prompt: "A bar chart shows monthly visitor numbers to a national park:\nJan: 2,000 | Feb: 2,500 | Mar: 4,000 | Apr: 7,500 | May: 12,000 | Jun: 18,000\nJul: 22,000 | Aug: 20,000 | Sep: 14,000 | Oct: 8,000 | Nov: 3,500 | Dec: 2,200", question: "During which period did visitor numbers increase the most rapidly?", options: ["January to March", "March to May", "May to July", "September to November"], correct: 1, explanation: "March to May shows the steepest increase: from 4,000 to 12,000 (an increase of 8,000 — tripling the count)." },
    { id: 3, free: true, type: "Part 3 – Practice", scenario: "Reading for Information", prompt: "Read the following article about a new Canadian immigration policy.", passage: "The Government of Canada announced changes to the Express Entry system that will take effect in the coming months. Under the new category-based selection system, candidates with specific work experience in healthcare, STEM fields, trades, transport, and agriculture may receive targeted invitations to apply for permanent residence.\n\nWhile the traditional Comprehensive Ranking System (CRS) score will still play a role, the Minister of Immigration will now have the authority to establish categories based on economic priorities. Critics argue this gives too much discretionary power to the minister, while supporters say it better aligns immigration with labour market needs.", question: "What is a key criticism of the new system?", options: ["It ignores CRS scores entirely", "It gives the minister too much power", "It only benefits healthcare workers", "It makes PR applications slower"], correct: 1, explanation: "The passage states critics argue the system 'gives too much discretionary power to the minister.'" },
    { id: 4, free: false, type: "Part 3 – Full", scenario: "Reading for Information", question: "According to the passage, which fields are specifically targeted?", options: ["Technology and finance", "Healthcare, STEM, trades, transport, agriculture", "Education and government", "Arts and hospitality"], correct: 1 },
    { id: 5, free: false, type: "Part 4", scenario: "Reading for Viewpoints", question: "What is the author's overall tone toward urban expansion?", options: ["Strongly supportive", "Cautiously critical", "Neutral and factual", "Aggressively opposed"], correct: 1 },
    { id: 6, free: false, type: "Part 4", scenario: "Reading for Viewpoints", question: "Which word best describes Dr. Patel's position on remote work?", options: ["Dismissive", "Enthusiastic", "Pragmatic", "Indifferent"], correct: 2 },
    { id: 7, free: false, type: "Part 4", scenario: "Reading for Viewpoints", question: "The editorial argues that public transit funding should be...", options: ["Eliminated", "Maintained at current levels", "Significantly increased", "Privatized"], correct: 2 },
    { id: 8, free: false, type: "Part 4", scenario: "Reading for Viewpoints", question: "How does the author counter the opposing viewpoint?", options: ["By citing research data", "By using emotional appeal", "By referencing legal precedent", "By dismissing it entirely"], correct: 0 },
  ],
  writing: [
    { id: 1, free: true, type: "Task 1 – Practice", scenario: "Writing an Email", prompt: "You received a notice that your local community centre will be closing the children's after-school program due to budget cuts. Write an email to the community centre manager. In your email:\n\n• Express your concern about the closure\n• Explain why the program is important to your family\n• Suggest an alternative solution", wordLimit: "150–200 words", timeLimit: "27 minutes" },
    { id: 2, free: false, type: "Task 1 – Full", scenario: "Writing an Email", prompt: "Your neighbour has been renovating their home, causing excessive noise during evenings and weekends. Write an email to your building's strata council.", wordLimit: "150–200 words", timeLimit: "27 minutes" },
    { id: 3, free: false, type: "Task 2 – Practice", scenario: "Responding to Survey Questions", prompt: "A local newspaper is conducting a survey:\n\n'Should the government invest more in public transportation or road infrastructure?'\n\nChoose ONE option and support your choice with reasons and examples.", wordLimit: "200–300 words", timeLimit: "30 minutes" },
    { id: 4, free: false, type: "Task 2 – Full", scenario: "Responding to Survey Questions", prompt: "An online forum asks:\n\n'Is working from home better for employees than working in an office?'\n\nProvide your opinion with supporting arguments.", wordLimit: "200–300 words", timeLimit: "30 minutes" },
  ],
  speaking: [
    { id: 1, free: true, type: "Task 1", scenario: "Giving Advice", prompt: "A friend is thinking about moving to a new city for a job opportunity but is worried about leaving family behind. Give your friend advice about what they should do.", prepTime: "30 seconds", speakTime: "90 seconds" },
    { id: 2, free: true, type: "Task 2", scenario: "Talking About a Personal Experience", prompt: "Talk about a time when you had to learn a new skill quickly. What was the skill? How did you learn it? What was the result?", prepTime: "30 seconds", speakTime: "60 seconds" },
    { id: 3, free: false, type: "Task 3", scenario: "Describing a Scene", prompt: "Look at the image of a busy farmer's market on a Saturday morning. Describe what you see in as much detail as possible.", prepTime: "30 seconds", speakTime: "60 seconds" },
    { id: 4, free: false, type: "Task 4", scenario: "Making Predictions", prompt: "Based on the scene you just described, predict what might happen next and explain why.", prepTime: "30 seconds", speakTime: "60 seconds" },
    { id: 5, free: false, type: "Task 5", scenario: "Comparing and Persuading", prompt: "A community has two options for a new public space: a playground for children OR a dog park. You prefer the playground. Persuade the community council to choose your option.", prepTime: "60 seconds", speakTime: "60 seconds" },
    { id: 6, free: false, type: "Task 6", scenario: "Dealing with a Difficult Situation", prompt: "You ordered a product online and it arrived damaged. Call the company's customer service and explain the problem, ask for a solution, and express your dissatisfaction politely.", prepTime: "60 seconds", speakTime: "60 seconds" },
    { id: 7, free: false, type: "Task 7", scenario: "Expressing Opinions", prompt: "Do you think social media has a positive or negative effect on society? State and support your opinion.", prepTime: "30 seconds", speakTime: "90 seconds" },
    { id: 8, free: false, type: "Task 8", scenario: "Describing an Unusual Situation", prompt: "Imagine you arrive at work and find that your office has been completely rearranged overnight with no explanation. Describe the situation and explain how you would handle it.", prepTime: "30 seconds", speakTime: "60 seconds" },
  ],
};

const SCORE_LEVELS = [
  { level: "M", label: "M (0)", desc: "Minimal proficiency", clb: "-" },
  { level: "1", label: "Level 1", desc: "Beginner", clb: "1" },
  { level: "2", label: "Level 2", desc: "Elementary", clb: "2" },
  { level: "3", label: "Level 3–4", desc: "Low Intermediate", clb: "3–4" },
  { level: "5", label: "Level 5", desc: "Intermediate", clb: "5" },
  { level: "6", label: "Level 6", desc: "Upper Intermediate", clb: "6" },
  { level: "7", label: "Level 7", desc: "High Intermediate", clb: "7", highlight: true, note: "Min. for most PR programs" },
  { level: "8", label: "Level 8", desc: "Functional Proficiency", clb: "8" },
  { level: "9", label: "Level 9", desc: "Upper Proficiency", clb: "9", highlight: true, note: "Best CRS points" },
  { level: "10–12", label: "Level 10–12", desc: "Advanced/Native-like", clb: "10–12" },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["3 practice questions per section", "Basic tips & strategies", "Score level reference guide", "CLB equivalency chart"],
    locked: ["Full mock tests (all parts)", "Detailed explanations", "Premium strategy guides", "Writing templates & samples", "Speaking model answers", "Progress tracking", "Unlimited practice tests"],
    cta: "Current Plan",
    active: true,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    features: ["Everything in Free", "Full mock tests with all questions", "Detailed answer explanations", "All premium tips & strategies", "Writing templates & sample answers", "Speaking model responses", "Progress tracking dashboard"],
    locked: [],
    cta: "Start 7-Day Free Trial",
    popular: true,
  },
  {
    name: "Premium",
    price: "$49",
    period: "one-time",
    features: ["Everything in Pro", "Lifetime access", "6 full-length mock tests", "AI-powered writing feedback", "AI-powered speaking assessment", "Personalized study plan", "Priority email support"],
    locked: [],
    cta: "Get Lifetime Access",
  },
];

// ── Components ────────────────────────────────────────────────────

function MapleLeaf({ size = 16, color = COLORS.accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2L9.5 8.5L3 7L6 12L2 17H8L9 22H11L12 18L13 22H15L16 17H22L18 12L21 7L14.5 8.5Z" />
    </svg>
  );
}

function LockIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={COLORS.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CheckIcon({ color = COLORS.success }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
  );
}

// ── Nav ───────────────────────────────────────────────────────────
function Nav({ currentPage, setPage }) {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(27,42,74,0.97)", backdropFilter: "blur(12px)",
      borderBottom: `1px solid rgba(255,255,255,0.08)`,
      padding: "0 24px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage("home")}>
          <MapleLeaf size={28} color={COLORS.accent} />
          <span style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 700, color: COLORS.white, letterSpacing: "-0.02em" }}>CELPIP</span>
          <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.gold, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginLeft: 2 }}>for PR</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "home", label: "Home" },
            { id: "practice", label: "Practice" },
            { id: "tips", label: "Tips" },
            { id: "scores", label: "Scores" },
            { id: "pricing", label: "Pricing" },
          ].map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              background: currentPage === item.id ? "rgba(200,16,46,0.15)" : "transparent",
              color: currentPage === item.id ? COLORS.white : "rgba(255,255,255,0.65)",
              border: "none", borderRadius: 8, padding: "8px 16px",
              fontFamily: FONTS.body, fontSize: 14, fontWeight: 500, cursor: "pointer",
              transition: "all 0.2s",
            }}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ── Home ──────────────────────────────────────────────────────────
function HomePage({ setPage, setActiveSection }) {
  return (
    <div>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyLight} 50%, #3D5A99 100%)`,
        padding: "80px 24px 100px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -80, right: -80, width: 400, height: 400,
          borderRadius: "50%", background: "rgba(200,16,46,0.08)",
        }} />
        <div style={{
          position: "absolute", bottom: -120, left: -60, width: 300, height: 300,
          borderRadius: "50%", background: "rgba(212,168,67,0.06)",
        }} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(200,16,46,0.15)", border: "1px solid rgba(200,16,46,0.25)",
            borderRadius: 24, padding: "6px 18px", marginBottom: 28,
          }}>
            <MapleLeaf size={14} />
            <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.white, fontWeight: 500, letterSpacing: "0.04em" }}>
              YOUR PATH TO CANADIAN PR
            </span>
          </div>
          <h1 style={{
            fontFamily: FONTS.display, fontSize: 52, fontWeight: 700,
            color: COLORS.white, lineHeight: 1.15, margin: "0 0 20px",
            letterSpacing: "-0.02em",
          }}>
            Master CELPIP.<br />
            <span style={{ color: COLORS.gold }}>Land Your PR.</span>
          </h1>
          <p style={{
            fontFamily: FONTS.body, fontSize: 18, color: "rgba(255,255,255,0.7)",
            lineHeight: 1.7, maxWidth: 560, margin: "0 auto 40px",
          }}>
            Free mock tests, expert strategies, and targeted practice for every CELPIP section. Built specifically for Canadian immigration applicants.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setPage("practice")} style={{
              background: COLORS.accent, color: COLORS.white,
              border: "none", borderRadius: 12, padding: "16px 36px",
              fontFamily: FONTS.body, fontSize: 16, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s",
              boxShadow: "0 4px 20px rgba(200,16,46,0.4)",
            }}>
              Start Free Practice →
            </button>
            <button onClick={() => setPage("scores")} style={{
              background: "rgba(255,255,255,0.1)", color: COLORS.white,
              border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12,
              padding: "16px 36px", fontFamily: FONTS.body, fontSize: 16,
              fontWeight: 500, cursor: "pointer",
            }}>
              Check Score Requirements
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`,
        padding: "28px 24px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 20 }}>
          {[
            { num: "28", label: "Practice Questions" },
            { num: "4", label: "Test Sections" },
            { num: "16+", label: "Expert Tips" },
            { num: "CLB 7+", label: "Target Score" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: FONTS.display, fontSize: 28, fontWeight: 700, color: COLORS.accent }}>{s.num}</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Cards */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px" }}>
        <h2 style={{ fontFamily: FONTS.display, fontSize: 32, color: COLORS.navy, textAlign: "center", marginBottom: 12 }}>
          Practice Every Section
        </h2>
        <p style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.textMuted, textAlign: "center", marginBottom: 48, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
          CELPIP tests four core skills. Practice each one with real-format questions.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220, 1fr))", gap: 20 }}>
          {SECTIONS.map(sec => (
            <div key={sec.id} onClick={() => { setActiveSection(sec.id); setPage("practice"); }}
              style={{
                background: COLORS.white, borderRadius: 16, padding: 28,
                border: `1px solid ${COLORS.border}`, cursor: "pointer",
                transition: "all 0.25s", position: "relative", overflow: "hidden",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 4,
                background: sec.color,
              }} />
              <div style={{ fontSize: 36, marginBottom: 16 }}>{sec.icon}</div>
              <div style={{ fontFamily: FONTS.display, fontSize: 20, fontWeight: 700, color: COLORS.navy, marginBottom: 6 }}>
                {sec.label}
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>
                {sec.duration} · {sec.celpipParts} parts
              </div>
              <div style={{
                fontFamily: FONTS.body, fontSize: 13, color: sec.color, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {sec.freeQuestions} free questions →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.goldLight} 0%, #FFF8EE 100%)`,
        padding: "60px 24px", textAlign: "center",
        borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ fontFamily: FONTS.display, fontSize: 28, fontWeight: 700, color: COLORS.navy, marginBottom: 12 }}>
          Need CLB 7+ for Express Entry?
        </div>
        <p style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.textMuted, maxWidth: 480, margin: "0 auto 28px" }}>
          Most Canadian PR programs require CELPIP Level 7 (CLB 7) or higher. Our Pro plan gives you unlimited practice to get there.
        </p>
        <button onClick={() => setPage("pricing")} style={{
          background: COLORS.navy, color: COLORS.white,
          border: "none", borderRadius: 12, padding: "14px 32px",
          fontFamily: FONTS.body, fontSize: 15, fontWeight: 600,
          cursor: "pointer",
        }}>
          View Plans & Pricing
        </button>
      </div>
    </div>
  );
}

// ── Practice Page ─────────────────────────────────────────────────
function PracticePage({ activeSection, setActiveSection }) {
  const [activeQ, setActiveQ] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [writingText, setWritingText] = useState("");

  const section = SECTIONS.find(s => s.id === activeSection);
  const questions = MOCK_QUESTIONS[activeSection] || [];

  const handleQuestionClick = (q) => {
    if (!q.free) { setShowUpgrade(true); return; }
    setActiveQ(q);
    setSelectedAnswer(null);
    setShowResult(false);
    setWritingText("");
  };

  const handleAnswer = (idx) => {
    if (showResult) return;
    setSelectedAnswer(idx);
    setShowResult(true);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      {/* Section Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 36, flexWrap: "wrap" }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => { setActiveSection(s.id); setActiveQ(null); setShowUpgrade(false); }}
            style={{
              background: activeSection === s.id ? s.color : COLORS.white,
              color: activeSection === s.id ? COLORS.white : COLORS.text,
              border: `1px solid ${activeSection === s.id ? s.color : COLORS.border}`,
              borderRadius: 10, padding: "10px 20px",
              fontFamily: FONTS.body, fontSize: 14, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Question List */}
        <div style={{ flex: "0 0 280px", minWidth: 260 }}>
          <div style={{
            fontFamily: FONTS.display, fontSize: 22, fontWeight: 700,
            color: COLORS.navy, marginBottom: 6,
          }}>
            {section?.icon} {section?.label}
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>
            {section?.duration} · {section?.celpipParts} parts in full test
          </div>

          {questions.map((q, i) => (
            <div key={q.id} onClick={() => handleQuestionClick(q)}
              style={{
                background: activeQ?.id === q.id ? `${section?.color}10` : q.free ? COLORS.white : COLORS.lockBg,
                border: `1px solid ${activeQ?.id === q.id ? section?.color : COLORS.border}`,
                borderRadius: 10, padding: "12px 16px", marginBottom: 8,
                cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.navy }}>
                  Q{i + 1}: {q.type}
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted }}>
                  {q.scenario}
                </div>
              </div>
              {!q.free && <LockIcon size={16} />}
              {q.free && <span style={{ fontSize: 11, color: section?.color, fontWeight: 600, fontFamily: FONTS.body }}>FREE</span>}
            </div>
          ))}
        </div>

        {/* Question Content */}
        <div style={{ flex: 1, minWidth: 300 }}>
          {showUpgrade && (
            <div style={{
              background: `linear-gradient(135deg, ${COLORS.goldLight}, #FFF)`,
              borderRadius: 16, padding: 40, textAlign: "center",
              border: `1px solid ${COLORS.gold}`,
            }}>
              <LockIcon size={40} />
              <h3 style={{ fontFamily: FONTS.display, fontSize: 24, color: COLORS.navy, margin: "16px 0 8px" }}>
                Unlock All Questions
              </h3>
              <p style={{ fontFamily: FONTS.body, fontSize: 15, color: COLORS.textMuted, maxWidth: 400, margin: "0 auto 24px" }}>
                Upgrade to Pro to access all {section?.questions} questions across every CELPIP part, with detailed explanations.
              </p>
              <button style={{
                background: COLORS.accent, color: COLORS.white,
                border: "none", borderRadius: 10, padding: "12px 28px",
                fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, cursor: "pointer",
              }}>
                Upgrade to Pro — $19/mo
              </button>
            </div>
          )}

          {!activeQ && !showUpgrade && (
            <div style={{
              background: COLORS.white, borderRadius: 16, padding: 60,
              border: `1px solid ${COLORS.border}`, textAlign: "center",
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{section?.icon}</div>
              <p style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.textMuted }}>
                Select a question from the list to begin practicing
              </p>
            </div>
          )}

          {activeQ && !showUpgrade && (
            <div style={{
              background: COLORS.white, borderRadius: 16, padding: 32,
              border: `1px solid ${COLORS.border}`,
            }}>
              <div style={{
                display: "inline-block", background: `${section?.color}15`,
                color: section?.color, fontFamily: FONTS.body, fontSize: 12, fontWeight: 600,
                padding: "4px 12px", borderRadius: 6, marginBottom: 16,
              }}>
                {activeQ.type}
              </div>

              {activeQ.prompt && (
                <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
                  {activeQ.prompt}
                </p>
              )}

              {activeQ.passage && (
                <div style={{
                  background: "#F8F7F4", borderRadius: 10, padding: 20,
                  marginBottom: 20, borderLeft: `3px solid ${section?.color}`,
                  fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, lineHeight: 1.8,
                  whiteSpace: "pre-line",
                }}>
                  {activeQ.passage}
                </div>
              )}

              {/* MC questions */}
              {activeQ.options && (
                <>
                  <h3 style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.navy, marginBottom: 20, lineHeight: 1.5 }}>
                    {activeQ.question}
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {activeQ.options.map((opt, idx) => {
                      const isCorrect = idx === activeQ.correct;
                      const isSelected = selectedAnswer === idx;
                      let bg = COLORS.white;
                      let borderColor = COLORS.border;
                      if (showResult && isCorrect) { bg = COLORS.successBg; borderColor = COLORS.success; }
                      else if (showResult && isSelected && !isCorrect) { bg = "#FDE8E8"; borderColor = "#E53E3E"; }

                      return (
                        <button key={idx} onClick={() => handleAnswer(idx)} style={{
                          background: bg, border: `2px solid ${borderColor}`,
                          borderRadius: 10, padding: "14px 18px", cursor: showResult ? "default" : "pointer",
                          fontFamily: FONTS.body, fontSize: 15, color: COLORS.text,
                          textAlign: "left", transition: "all 0.15s",
                          display: "flex", alignItems: "center", gap: 12,
                        }}>
                          <span style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: isSelected ? section?.color : "#F0EDE8",
                            color: isSelected ? COLORS.white : COLORS.textMuted,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 700, flexShrink: 0,
                          }}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {showResult && activeQ.explanation && (
                    <div style={{
                      marginTop: 20, background: "#F0FAF4", borderRadius: 10,
                      padding: 20, borderLeft: `3px solid ${COLORS.success}`,
                    }}>
                      <div style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 700, color: COLORS.success, marginBottom: 6 }}>
                        ✓ Explanation
                      </div>
                      <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, lineHeight: 1.7, margin: 0 }}>
                        {activeQ.explanation}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Writing prompts */}
              {activeQ.wordLimit && (
                <div>
                  <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.textMuted }}>⏱ {activeQ.timeLimit}</span>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.textMuted }}>📝 {activeQ.wordLimit}</span>
                  </div>
                  <textarea
                    value={writingText}
                    onChange={e => setWritingText(e.target.value)}
                    placeholder="Start writing your response here..."
                    style={{
                      width: "100%", minHeight: 200, border: `1px solid ${COLORS.border}`,
                      borderRadius: 10, padding: 16, fontFamily: FONTS.body, fontSize: 15,
                      lineHeight: 1.8, color: COLORS.text, resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.textMuted, marginTop: 8 }}>
                    Word count: {writingText.trim() ? writingText.trim().split(/\s+/).length : 0}
                  </div>
                </div>
              )}

              {/* Speaking prompts */}
              {activeQ.prepTime && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 12, background: "#FFF3CD", padding: "4px 10px", borderRadius: 6 }}>
                      Prep: {activeQ.prepTime}
                    </span>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 12, background: "#D1ECF1", padding: "4px 10px", borderRadius: 6 }}>
                      Speak: {activeQ.speakTime}
                    </span>
                  </div>
                  <div style={{
                    background: "#F8F7F4", borderRadius: 10, padding: 20,
                    fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted, lineHeight: 1.7,
                  }}>
                    💡 <strong>Tip:</strong> Practice speaking your answer out loud. Record yourself if possible and listen back for fluency, pronunciation, and whether you addressed all parts of the prompt.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tips Page ─────────────────────────────────────────────────────
function TipsPage() {
  const [activeTab, setActiveTab] = useState("listening");
  const tips = TIPS[activeTab] || [];
  const section = SECTIONS.find(s => s.id === activeTab);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
      <h2 style={{ fontFamily: FONTS.display, fontSize: 32, color: COLORS.navy, marginBottom: 8 }}>
        Strategy & Tips
      </h2>
      <p style={{ fontFamily: FONTS.body, fontSize: 15, color: COLORS.textMuted, marginBottom: 32 }}>
        Expert pointers for each CELPIP section. Free tips marked with ✓.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveTab(s.id)} style={{
            background: activeTab === s.id ? s.color : COLORS.white,
            color: activeTab === s.id ? COLORS.white : COLORS.text,
            border: `1px solid ${activeTab === s.id ? s.color : COLORS.border}`,
            borderRadius: 10, padding: "10px 20px",
            fontFamily: FONTS.body, fontSize: 14, fontWeight: 600,
            cursor: "pointer",
          }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {tips.map((tip, i) => (
          <div key={i} style={{
            background: tip.free ? COLORS.white : COLORS.lockBg,
            borderRadius: 14, padding: 24,
            border: `1px solid ${tip.free ? COLORS.border : "rgba(212,168,67,0.3)"}`,
            position: "relative",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              {tip.free ? <CheckIcon color={section?.color} /> : <LockIcon size={16} />}
              <h3 style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.navy, margin: 0 }}>
                {tip.title}
              </h3>
              {!tip.free && (
                <span style={{
                  fontFamily: FONTS.body, fontSize: 11, fontWeight: 700,
                  color: COLORS.gold, background: "rgba(212,168,67,0.15)",
                  padding: "2px 8px", borderRadius: 4, letterSpacing: "0.04em",
                }}>PRO</span>
              )}
            </div>
            {tip.free ? (
              <p style={{ fontFamily: FONTS.body, fontSize: 15, color: COLORS.text, lineHeight: 1.7, margin: 0 }}>
                {tip.content}
              </p>
            ) : (
              <p style={{ fontFamily: FONTS.body, fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, margin: 0, filter: "blur(4px)", userSelect: "none" }}>
                {tip.content}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Scores Page ───────────────────────────────────────────────────
function ScoresPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
      <h2 style={{ fontFamily: FONTS.display, fontSize: 32, color: COLORS.navy, marginBottom: 8 }}>
        CELPIP Score Levels & CLB
      </h2>
      <p style={{ fontFamily: FONTS.body, fontSize: 15, color: COLORS.textMuted, marginBottom: 32 }}>
        Understand how CELPIP scores map to Canadian Language Benchmarks for your PR application.
      </p>

      <div style={{
        background: COLORS.white, borderRadius: 16, overflow: "hidden",
        border: `1px solid ${COLORS.border}`,
      }}>
        {SCORE_LEVELS.map((lvl, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "90px 1fr 80px",
            padding: "14px 24px", alignItems: "center",
            background: lvl.highlight ? "rgba(200,16,46,0.04)" : "transparent",
            borderBottom: i < SCORE_LEVELS.length - 1 ? `1px solid ${COLORS.border}` : "none",
          }}>
            <div style={{
              fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700,
              color: lvl.highlight ? COLORS.accent : COLORS.navy,
            }}>
              {lvl.label}
            </div>
            <div>
              <span style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.text }}>{lvl.desc}</span>
              {lvl.note && (
                <span style={{
                  fontFamily: FONTS.body, fontSize: 11, color: COLORS.accent,
                  background: "rgba(200,16,46,0.08)", padding: "2px 8px",
                  borderRadius: 4, marginLeft: 10, fontWeight: 600,
                }}>{lvl.note}</span>
              )}
            </div>
            <div style={{
              fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, textAlign: "right",
            }}>
              CLB {lvl.clb}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 32, background: `linear-gradient(135deg, ${COLORS.goldLight}, #FFF)`,
        borderRadius: 14, padding: 28, border: `1px solid rgba(212,168,67,0.3)`,
      }}>
        <h3 style={{ fontFamily: FONTS.display, fontSize: 20, color: COLORS.navy, marginBottom: 12 }}>
          🍁 PR Score Requirements
        </h3>
        <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, lineHeight: 1.8 }}>
          <strong>Express Entry (Federal Skilled Worker):</strong> Minimum CLB 7 in all four abilities<br />
          <strong>Canadian Experience Class:</strong> CLB 7 (NOC 0/A) or CLB 5 (NOC B)<br />
          <strong>Provincial Nominee Programs:</strong> Varies — typically CLB 5 to CLB 7<br />
          <strong>Maximum CRS Points:</strong> CLB 9 or above in all four abilities = 136 points (with spouse) or 124 points (without)
        </div>
      </div>
    </div>
  );
}

// ── Pricing Page ──────────────────────────────────────────────────
function PricingPage() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <h2 style={{ fontFamily: FONTS.display, fontSize: 32, color: COLORS.navy, textAlign: "center", marginBottom: 8 }}>
        Choose Your Plan
      </h2>
      <p style={{ fontFamily: FONTS.body, fontSize: 15, color: COLORS.textMuted, textAlign: "center", marginBottom: 48, maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
        Start free. Upgrade when you're serious about hitting your target score.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260, 1fr))", gap: 20 }}>
        {PRICING.map((plan, i) => (
          <div key={i} style={{
            background: COLORS.white, borderRadius: 16,
            border: plan.popular ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`,
            padding: 32, position: "relative",
            boxShadow: plan.popular ? "0 8px 40px rgba(200,16,46,0.12)" : "none",
          }}>
            {plan.popular && (
              <div style={{
                position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                background: COLORS.accent, color: COLORS.white,
                fontFamily: FONTS.body, fontSize: 11, fontWeight: 700,
                padding: "4px 16px", borderRadius: 12, letterSpacing: "0.06em",
              }}>MOST POPULAR</div>
            )}
            <div style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 700, color: COLORS.navy, marginBottom: 4 }}>
              {plan.name}
            </div>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontFamily: FONTS.display, fontSize: 40, fontWeight: 700, color: COLORS.accent }}>{plan.price}</span>
              <span style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted }}> {plan.period}</span>
            </div>

            <div style={{ marginBottom: 24 }}>
              {plan.features.map((f, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <CheckIcon color={COLORS.success} />
                  <span style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.text }}>{f}</span>
                </div>
              ))}
              {plan.locked?.map((f, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, opacity: 0.4 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  <span style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted }}>{f}</span>
                </div>
              ))}
            </div>

            <button style={{
              width: "100%",
              background: plan.popular ? COLORS.accent : plan.active ? COLORS.lockBg : COLORS.navy,
              color: plan.active ? COLORS.textMuted : COLORS.white,
              border: "none", borderRadius: 10, padding: "14px 0",
              fontFamily: FONTS.body, fontSize: 15, fontWeight: 600,
              cursor: plan.active ? "default" : "pointer",
            }}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [activeSection, setActiveSection] = useState("listening");

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: FONTS.body }}>
      <Nav currentPage={page} setPage={setPage} />
      {page === "home" && <HomePage setPage={setPage} setActiveSection={setActiveSection} />}
      {page === "practice" && <PracticePage activeSection={activeSection} setActiveSection={setActiveSection} />}
      {page === "tips" && <TipsPage />}
      {page === "scores" && <ScoresPage />}
      {page === "pricing" && <PricingPage />}
      {/* Footer */}
      <footer style={{
        background: COLORS.navy, padding: "40px 24px", marginTop: 40,
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MapleLeaf size={20} />
            <span style={{ fontFamily: FONTS.display, fontSize: 16, color: COLORS.white }}>CELPIP for PR</span>
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            Not affiliated with Paragon Testing Enterprises. CELPIP is a registered trademark of Paragon Testing Enterprises.
          </div>
        </div>
      </footer>
    </div>
  );
}
