import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  CRS_LANG_POINTS,
  CRS_LANG2_POINTS,
  CRS_AGE,
  CRS_EDUCATION,
  CRS_CAN_EXP,
  CRS_FOREIGN_EXP,
} from '../data/constants'

/* ── Helpers ──────────────────────────────────────────────────── */
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)) }

function lang1Pts(clb) {
  if (clb < 4) return { listen: 0, read: 0, write: 0, speak: 0 }
  return CRS_LANG_POINTS[clamp(clb, 4, 10)]
}

function lang2Pts(clb) {
  if (!clb || clb < 5) return { listen: 0, read: 0, write: 0, speak: 0 }
  return CRS_LANG2_POINTS[clamp(clb, 5, 10)]
}

function skillTransfer({ education, canExp, foreignExp, lang1Min }) {
  const hasPostSec = !['none', 'secondary'].includes(education)

  // 1. Education + Language (max 50)
  let eduLang = 0
  if (hasPostSec) {
    if (lang1Min >= 9) eduLang = 25
    else if (lang1Min >= 7) eduLang = 13
  }

  // 2. Education + Canadian Exp (max 50)
  let eduCan = 0
  if (hasPostSec) {
    if (canExp >= 2) eduCan = 25
    else if (canExp >= 1) eduCan = 13
  }

  // 3. Foreign Exp + Language (max 50)
  let foreignLang = 0
  if (foreignExp >= 1) {
    if (lang1Min >= 9)      foreignLang = foreignExp >= 2 ? 50 : 25
    else if (lang1Min >= 7) foreignLang = foreignExp >= 2 ? 25 : 13
  }

  // 4. Foreign Exp + Canadian Exp (max 25)
  let foreignCan = 0
  if (foreignExp >= 2 && canExp >= 2)      foreignCan = 25
  else if (foreignExp >= 1 && canExp >= 1) foreignCan = 13

  // 5. Certificate of qualification + Language (max 50) — handled outside
  const total = Math.min(100, Math.min(50,eduLang) + Math.min(50,eduCan) + Math.min(50,foreignLang) + Math.min(25,foreignCan))
  return { eduLang: Math.min(50,eduLang), eduCan: Math.min(50,eduCan), foreignLang: Math.min(50,foreignLang), foreignCan: Math.min(25,foreignCan), total }
}

/* ── CELPIP score → CLB mapping ───────────────────────────────── */
// Official CELPIP General → CLB equivalency (Paragon Testing)
const CELPIP_OPTIONS = [
  { celpip: 'M',    clb: 0,  label: 'M (no score)' },
  { celpip: '1',    clb: 0,  label: '1' },
  { celpip: '1.5',  clb: 0,  label: '1.5' },
  { celpip: '2',    clb: 0,  label: '2' },
  { celpip: '2.5',  clb: 0,  label: '2.5' },
  { celpip: '3',    clb: 0,  label: '3' },
  { celpip: '3.5',  clb: 4,  label: '3.5 → CLB 4' },
  { celpip: '4',    clb: 4,  label: '4 → CLB 4' },
  { celpip: '4.5',  clb: 5,  label: '4.5 → CLB 5' },
  { celpip: '5',    clb: 5,  label: '5 → CLB 5' },
  { celpip: '5.5',  clb: 6,  label: '5.5 → CLB 6' },
  { celpip: '6',    clb: 6,  label: '6 → CLB 6' },
  { celpip: '6.5',  clb: 7,  label: '6.5 → CLB 7' },
  { celpip: '7',    clb: 7,  label: '7 → CLB 7' },
  { celpip: '7.5',  clb: 8,  label: '7.5 → CLB 8' },
  { celpip: '8',    clb: 8,  label: '8 → CLB 8' },
  { celpip: '8.5',  clb: 9,  label: '8.5 → CLB 9' },
  { celpip: '9',    clb: 9,  label: '9 → CLB 9' },
  { celpip: '9.5',  clb: 10, label: '9.5 → CLB 10' },
  { celpip: '10',   clb: 10, label: '10 → CLB 10' },
  { celpip: '11',   clb: 10, label: '11 → CLB 10' },
  { celpip: '12',   clb: 10, label: '12 → CLB 10' },
]

/* ── Sub-components ───────────────────────────────────────────── */
function Question({ num, children, tip }) {
  return (
    <div className="crs-question">
      <div className="crs-question-num">Question {num}</div>
      {tip && <p className="crs-field-tip" style={{ marginBottom: 10 }}>{tip}</p>}
      {children}
    </div>
  )
}

function FieldLabel({ children }) {
  return <label className="crs-field-label" style={{ marginBottom: 8, display: 'block' }}>{children}</label>
}

function CRSSelect({ value, onChange, children, style }) {
  return (
    <select className="crs-select" value={value} onChange={e => onChange(e.target.value)} style={style}>
      {children}
    </select>
  )
}

function CelpipSelect({ skill, value, onChange }) {
  const clb = CELPIP_OPTIONS.find(o => o.celpip === value)?.clb ?? 0
  const pts = clb >= 4 ? lang1Pts(clb)[skill.toLowerCase()] : 0
  return (
    <div className="clb-select-row">
      <span className="clb-select-skill">{skill}</span>
      <select
        className="crs-select clb-select"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">Select score</option>
        {CELPIP_OPTIONS.slice().reverse().map(o => (
          <option key={o.celpip} value={o.celpip}>{o.label}</option>
        ))}
      </select>
      <span className="clb-pts-badge">{pts} pts</span>
    </div>
  )
}

function CelpipSelect2({ skill, value, onChange }) {
  const options2 = CELPIP_OPTIONS.filter(o => o.clb === 0 || o.clb >= 5)
  const clb = CELPIP_OPTIONS.find(o => o.celpip === value)?.clb ?? 0
  const pts = clb >= 5 ? lang2Pts(clb)[skill.toLowerCase()] : 0
  return (
    <div className="clb-select-row">
      <span className="clb-select-skill">{skill}</span>
      <select
        className="crs-select clb-select"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">Select score</option>
        {options2.slice().reverse().map(o => (
          <option key={o.celpip} value={o.celpip}>{o.label}</option>
        ))}
      </select>
      <span className="clb-pts-badge">{pts} pts</span>
    </div>
  )
}

function ScoreBar({ label, points, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round((points / max) * 100)) : 0
  return (
    <div className="score-bar-row">
      <div className="score-bar-label-row">
        <span className="score-bar-label">{label}</span>
        <span className="score-bar-pts" style={{ color }}>{points} / {max}</span>
      </div>
      <div className="score-bar-track">
        <motion.div
          className="score-bar-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

function SectionCard({ title, emoji, children }) {
  return (
    <div className="crs-section-card">
      <div className="crs-section-heading">
        <span>{emoji}</span> {title}
      </div>
      {children}
    </div>
  )
}

/* ── Main Component ───────────────────────────────────────────── */
export default function CRSCalculatorPage() {

  // Q1 — Marital status
  const [marital, setMarital] = useState('single')

  // Q3 — Age
  const [age, setAge] = useState(28)

  // Q4a/4b/4c — Education
  const [education, setEdu]               = useState('masters')
  const [hasCanadianEdu, setCanEdu]       = useState(true)
  const [canadianEduLevel, setCanEduLvl]  = useState('three_plus')

  // Q5 — First official language (CELPIP)
  const [lang1Test, setLang1Test]     = useState('celpip')
  const [celpipSpeak, setCelpipSpeak] = useState('10')
  const [celpipListen, setCelpipListen] = useState('10')
  const [celpipRead, setCelpipRead]   = useState('10')
  const [celpipWrite, setCelpipWrite] = useState('10')

  // Q5 iii — Second official language
  const [lang2Test, setLang2Test] = useState('none')
  const [cel2Speak, setCel2Speak]   = useState('')
  const [cel2Listen, setCel2Listen] = useState('')
  const [cel2Read, setCel2Read]     = useState('')
  const [cel2Write, setCel2Write]   = useState('')

  // Q6 — Work experience
  const [canExp, setCanExp]     = useState(1)
  const [foreignExp, setForeign] = useState(2)

  // Q7 — Certificate of qualification
  const [hasCertQual, setCertQual] = useState(false)

  // Q9 — Nomination
  const [hasNomination, setNom] = useState(false)

  // Q10 — Sibling
  const [hasSibling, setSib] = useState(false)

  // French bonus (shown only when second lang French selected)
  const hasFrenchBonus = lang2Test === 'tef' || lang2Test === 'tcf' || lang2Test === 'delf'

  /* ── Derive CLB from CELPIP scores ── */
  const clb1 = {
    speak:  CELPIP_OPTIONS.find(o => o.celpip === celpipSpeak)?.clb  ?? 0,
    listen: CELPIP_OPTIONS.find(o => o.celpip === celpipListen)?.clb ?? 0,
    read:   CELPIP_OPTIONS.find(o => o.celpip === celpipRead)?.clb   ?? 0,
    write:  CELPIP_OPTIONS.find(o => o.celpip === celpipWrite)?.clb  ?? 0,
  }

  const clb2 = {
    speak:  CELPIP_OPTIONS.find(o => o.celpip === cel2Speak)?.clb  ?? 0,
    listen: CELPIP_OPTIONS.find(o => o.celpip === cel2Listen)?.clb ?? 0,
    read:   CELPIP_OPTIONS.find(o => o.celpip === cel2Read)?.clb   ?? 0,
    write:  CELPIP_OPTIONS.find(o => o.celpip === cel2Write)?.clb  ?? 0,
  }

  /* ── CRS Calculation ── */
  const breakdown = useMemo(() => {
    // Core
    const agePts     = CRS_AGE[clamp(age, 17, 47)] ?? 0
    const eduPts     = CRS_EDUCATION[education] ?? 0
    const canPts     = CRS_CAN_EXP[clamp(canExp, 0, 5)] ?? 0
    const foreignPts = CRS_FOREIGN_EXP[clamp(foreignExp, 0, 3)] ?? 0

    // Language 1
    const l1 = lang1Pts(clb1.listen)
    const r1 = lang1Pts(clb1.read)
    const w1 = lang1Pts(clb1.write)
    const s1 = lang1Pts(clb1.speak)
    const lang1Total = l1.listen + r1.read + w1.write + s1.speak

    // Language 2 (max 22 per IRCC)
    const hasLang2 = lang2Test !== 'none' && lang2Test !== ''
    const l2 = lang2Pts(clb2.listen)
    const r2 = lang2Pts(clb2.read)
    const w2 = lang2Pts(clb2.write)
    const s2 = lang2Pts(clb2.speak)
    const lang2Total = hasLang2 ? Math.min(22, l2.listen + r2.read + w2.write + s2.speak) : 0

    // Canadian education bonus (+15 for 1-2yr credential, +30 for 3yr+ / master's / doctoral)
    let canEduPts = 0
    if (hasCanadianEdu) {
      if (canadianEduLevel === 'three_plus')   canEduPts = 30
      else if (canadianEduLevel === 'one_or_two') canEduPts = 15
      // 'secondary' = 0 pts
    }

    // Skill transferability
    const lang1Min = Math.min(clb1.listen, clb1.read, clb1.write, clb1.speak)
    const st = skillTransfer({ education, canExp, foreignExp, lang1Min })

    // Certificate of qualification + language bonus (max 50)
    let certLangPts = 0
    if (hasCertQual) {
      if (lang1Min >= 9) certLangPts = Math.min(50, certLangPts + 50)
      else if (lang1Min >= 7) certLangPts = Math.min(50, certLangPts + 25)
    }
    const skillTotal = Math.min(100, st.total + certLangPts)

    // Additional points (Section D: nomination, French, Canadian education, sibling)
    const nomPts     = hasNomination ? 600 : 0
    // French bonus: +25 base; +50 if all 4 French skills CLB 7+
    const frenchPts  = hasFrenchBonus
      ? (clb2.speak >= 7 && clb2.listen >= 7 && clb2.read >= 7 && clb2.write >= 7 ? 50 : 25)
      : 0
    const siblingPts    = hasSibling ? 15 : 0
    const additionalPts = nomPts + frenchPts + siblingPts + canEduPts

    // Core = A factors only (age + edu + lang1 + lang2 + canExp + foreignExp)
    const corePts  = agePts + eduPts + canPts + foreignPts + lang1Total + lang2Total
    const totalPts = corePts + skillTotal + additionalPts

    return {
      agePts, eduPts, canPts, foreignPts,
      lang1Total, lang2Total, canEduPts,
      skillTotal, st, certLangPts,
      nomPts, frenchPts, siblingPts, additionalPts,
      corePts, totalPts,
      lang1Min,
    }
  }, [
    age, education, hasCanadianEdu, canadianEduLevel,
    canExp, foreignExp, hasCertQual,
    clb1.listen, clb1.read, clb1.write, clb1.speak,
    lang2Test, clb2.listen, clb2.read, clb2.write, clb2.speak,
    hasNomination, hasSibling, hasFrenchBonus,
  ])

  const drawHint = breakdown.totalPts >= 600
    ? { label: '🏆 Very strong — competitive in almost every draw', color: '#16A34A' }
    : breakdown.totalPts >= 510
    ? { label: '✅ Competitive — within typical draw cutoff range',  color: '#16A34A' }
    : breakdown.totalPts >= 470
    ? { label: '⚠️ Getting close — boosting language score helps most', color: '#C8972A' }
    : { label: '❌ Below recent cutoffs — focus on language & experience', color: '#C8102E' }

  const ageOpts = Array.from({ length: 30 }, (_, i) => i + 18)

  // Quick-fill helpers
  function setAllCelpip(score) {
    setCelpipSpeak(score); setCelpipListen(score); setCelpipRead(score); setCelpipWrite(score)
  }

  return (
    <div className="page-wrap crs-calc-wrap">
      <div className="page-header">
        <h2 className="page-title">🧮 <span className="highlight">CRS Score Calculator</span></h2>
        <p className="page-sub">
          This tool mirrors the official IRCC Express Entry CRS calculator — enter your details below
          to get an accurate estimate of your Comprehensive Ranking System score.
        </p>
      </div>

      <div className="crs-calc-layout">

        {/* ── LEFT: All input questions ── */}
        <div className="crs-inputs">

          {/* ─── SECTION A ─── */}
          <SectionCard title="Personal Information" emoji="👤">

            {/* Q1 — Marital Status */}
            <Question num="1" tip="Your marital status may affect which spouse/partner factors apply.">
              <FieldLabel>What is your marital status?</FieldLabel>
              <CRSSelect value={marital} onChange={setMarital}>
                <option value="single">Never Married / Single</option>
                <option value="married">Married</option>
                <option value="common_law">Common-law partnership</option>
                <option value="separated">Separated (legally married)</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </CRSSelect>
              {(marital === 'married' || marital === 'common_law') && (
                <p className="crs-field-tip" style={{ marginTop: 8, color: '#C8972A' }}>
                  ⚠️ Spouse/partner factors apply — this calculator uses the <strong>single-applicant</strong> formula.
                  If your spouse is coming to Canada, your scores may differ slightly.
                </p>
              )}
            </Question>

            {/* Q3 — Age */}
            <Question num="3">
              <FieldLabel>How old are you?</FieldLabel>
              <p className="crs-field-tip" style={{ marginBottom: 8 }}>
                If you've been invited to apply, enter your age on the date you were invited.
                Otherwise, enter your current age.
              </p>
              <CRSSelect value={String(age)} onChange={v => setAge(Number(v))}>
                {ageOpts.map(a => <option key={a} value={a}>{a} years of age</option>)}
              </CRSSelect>
            </Question>

          </SectionCard>

          {/* ─── SECTION B: Education ─── */}
          <SectionCard title="Education" emoji="🎓">

            {/* Q4a */}
            <Question num="4">
              <FieldLabel>What is your level of education?</FieldLabel>
              <p className="crs-field-tip" style={{ marginBottom: 8 }}>
                Enter the highest level for which you earned a Canadian credential or had an ECA (Educational Credential Assessment) from an approved agency in the last 5 years.
              </p>
              <CRSSelect value={education} onChange={setEdu}>
                <option value="none">Less than secondary school</option>
                <option value="secondary">Secondary school diploma (high school)</option>
                <option value="one_year">1-year post-secondary certificate or diploma</option>
                <option value="two_year">2-year post-secondary certificate or diploma</option>
                <option value="bachelors">Bachelor's degree — 3 or more years</option>
                <option value="two_or_more">Two or more certificates/diplomas/degrees (one ≥ 3 years)</option>
                <option value="masters">Master's degree, or professional degree needed for a licensed profession</option>
                <option value="doctoral">Doctoral level university degree (PhD)</option>
              </CRSSelect>
            </Question>

            {/* Q4b */}
            <Question num="4b">
              <FieldLabel>Have you earned a Canadian degree, diploma or certificate?</FieldLabel>
              <p className="crs-field-tip" style={{ marginBottom: 10 }}>
                To answer Yes: English or French as a Second Language must not have made up more than half your study,
                you were physically in Canada for at least 8 months, and you studied at a Canadian institution (foreign campuses don't count).
              </p>
              <CRSSelect value={hasCanadianEdu ? 'yes' : 'no'} onChange={v => setCanEdu(v === 'yes')}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </CRSSelect>
            </Question>

            {/* Q4c — only when 4b = Yes */}
            {hasCanadianEdu && (
              <Question num="4c">
                <FieldLabel>Choose the best answer to describe this level of education.</FieldLabel>
                <CRSSelect value={canadianEduLevel} onChange={setCanEduLvl}>
                  <option value="secondary">A secondary school (high school) credential — no bonus pts</option>
                  <option value="one_or_two">A 1 or 2-year diploma or certificate (+15 pts)</option>
                  <option value="three_plus">A degree, diploma or certificate of 3 years or longer OR a Master's, professional or doctoral degree of at least 1 academic year (+30 pts)</option>
                </CRSSelect>
                <p className="crs-field-tip" style={{ marginTop: 8 }}>
                  +15 pts for a 1–2 year Canadian credential; +30 pts for 3-year or longer / Master's / doctoral.
                </p>
              </Question>
            )}

          </SectionCard>

          {/* ─── SECTION C: Language ─── */}
          <SectionCard title="Official Languages" emoji="🗣️">

            {/* Q5 i */}
            <Question num="5i">
              <FieldLabel>Are your language test results less than two years old?</FieldLabel>
              <CRSSelect value="yes" onChange={() => {}}>
                <option value="yes">Yes</option>
                <option value="no">No — you must retake the test to submit a profile</option>
              </CRSSelect>
            </Question>

            {/* Q5 ii — Test selection + scores */}
            <Question num="5ii">
              <FieldLabel>Which language test did you take for your first official language?</FieldLabel>
              <CRSSelect value={lang1Test} onChange={setLang1Test} style={{ marginBottom: 16 }}>
                <option value="celpip">CELPIP-G (English)</option>
                <option value="ielts">IELTS General (English)</option>
                <option value="tef_fr">TEF Canada (French)</option>
                <option value="tcf_fr">TCF Canada (French)</option>
              </CRSSelect>

              <FieldLabel>
                {lang1Test === 'celpip' ? 'Enter your CELPIP-G scores:' : 'Enter your scores (as CLB equivalent):'}
              </FieldLabel>
              <p className="crs-field-tip" style={{ marginBottom: 12 }}>
                {lang1Test === 'celpip'
                  ? 'Select your actual CELPIP score for each skill. Scores are automatically converted to CLB.'
                  : 'Select the CLB level equivalent for each skill from your test result.'}
              </p>
              <div className="clb-grid">
                <CelpipSelect skill="Speaking" value={celpipSpeak}   onChange={setCelpipSpeak}   />
                <CelpipSelect skill="Listening" value={celpipListen} onChange={setCelpipListen}  />
                <CelpipSelect skill="Reading"  value={celpipRead}    onChange={setCelpipRead}    />
                <CelpipSelect skill="Writing"  value={celpipWrite}   onChange={setCelpipWrite}   />
              </div>
              <div className="clb-apply-all" style={{ marginTop: 12 }}>
                <button className="btn btn-outline btn-sm" onClick={() => setAllCelpip('10')}>Set all 10</button>
                <button className="btn btn-outline btn-sm" onClick={() => setAllCelpip('9')}>Set all 9</button>
                <button className="btn btn-outline btn-sm" onClick={() => setAllCelpip('8')}>Set all 8</button>
                <button className="btn btn-outline btn-sm" onClick={() => setAllCelpip('7')}>Set all 7</button>
              </div>

              {/* CLB summary row */}
              <div className="clb-summary">
                <span>CLB levels →</span>
                {['speak','listen','read','write'].map(sk => (
                  <span key={sk} className="clb-summary-chip">
                    {sk.charAt(0).toUpperCase()+sk.slice(1)}: <strong>CLB {clb1[sk] || '—'}</strong>
                  </span>
                ))}
              </div>
            </Question>

            {/* Q5 iii — Second language */}
            <Question num="5iii">
              <FieldLabel>Do you have other language results? (Second official language)</FieldLabel>
              <p className="crs-field-tip" style={{ marginBottom: 10 }}>
                Test results must be less than two years old. You can earn up to 22 additional points for CLB 5+.
              </p>
              <CRSSelect value={lang2Test} onChange={setLang2Test} style={{ marginBottom: lang2Test !== 'none' ? 16 : 0 }}>
                <option value="none">Not applicable</option>
                <option value="celpip2">CELPIP-G (English as second language)</option>
                <option value="ielts2">IELTS General (English as second language)</option>
                <option value="tef">TEF Canada (French)</option>
                <option value="tcf">TCF Canada (French)</option>
                <option value="delf">DELF / DALF (French)</option>
              </CRSSelect>

              {lang2Test !== 'none' && (
                <>
                  <FieldLabel>Enter your second language scores:</FieldLabel>
                  <div className="clb-grid">
                    <CelpipSelect2 skill="Speaking"  value={cel2Speak}  onChange={setCel2Speak}  />
                    <CelpipSelect2 skill="Listening" value={cel2Listen} onChange={setCel2Listen} />
                    <CelpipSelect2 skill="Reading"   value={cel2Read}   onChange={setCel2Read}   />
                    <CelpipSelect2 skill="Writing"   value={cel2Write}  onChange={setCel2Write}  />
                  </div>
                </>
              )}
            </Question>

          </SectionCard>

          {/* ─── SECTION D: Work Experience ─── */}
          <SectionCard title="Work Experience" emoji="💼">

            {/* Q6i */}
            <Question num="6i" tip="Must be paid, full-time (or equivalent part-time), in a NOC TEER 0, 1, 2 or 3 job. You must have been physically in Canada and working for a Canadian employer.">
              <FieldLabel>In the last 10 years, how many years of skilled work experience in Canada do you have?</FieldLabel>
              <CRSSelect value={String(canExp)} onChange={v => setCanExp(Number(v))}>
                <option value="0">None</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="4">4 years</option>
                <option value="5">5 or more years</option>
              </CRSSelect>
            </Question>

            {/* Q6ii */}
            <Question num="6ii" tip="Must be paid, full-time (or equivalent), in only one NOC TEER 0, 1, 2 or 3 occupation.">
              <FieldLabel>In the last 10 years, how many total years of foreign skilled work experience do you have?</FieldLabel>
              <CRSSelect value={String(foreignExp)} onChange={v => setForeign(Number(v))}>
                <option value="0">None</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 or more years</option>
              </CRSSelect>
            </Question>

          </SectionCard>

          {/* ─── SECTION E: Certificate of Qualification ─── */}
          <SectionCard title="Certificate of Qualification" emoji="📜">
            <Question num="7" tip="A certificate of qualification allows work in skilled trades in Canada. Only provinces, territories, or a federal body can issue these. This is NOT the same as a provincial nomination.">
              <FieldLabel>Do you have a certificate of qualification from a Canadian province, territory or federal body?</FieldLabel>
              <CRSSelect value={hasCertQual ? 'yes' : 'no'} onChange={v => setCertQual(v === 'yes')}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </CRSSelect>
              {hasCertQual && (
                <p className="crs-field-tip" style={{ marginTop: 8, color: '#2D8A56' }}>
                  ✓ Certificate + CLB 7–8 language = +25 pts to skill transferability; CLB 9+ = +50 pts.
                </p>
              )}
            </Question>
          </SectionCard>

          {/* ─── SECTION F: Additional Points ─── */}
          <SectionCard title="Additional Points" emoji="✨">

            {/* Q9 — Nomination */}
            <Question num="9">
              <FieldLabel>Do you have a nomination certificate from a province or territory?</FieldLabel>
              <CRSSelect value={hasNomination ? 'yes' : 'no'} onChange={v => setNom(v === 'yes')}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </CRSSelect>
              {hasNomination && (
                <p className="crs-field-tip" style={{ marginTop: 8, color: '#2D8A56' }}>✓ +600 points</p>
              )}
            </Question>

            {/* Q10 — Sibling */}
            <Question num="10" tip="The brother or sister must be 18 or older, related to you or your partner by blood/marriage/adoption, and must have a parent in common with you or your partner.">
              <FieldLabel>Do you or your spouse/partner have a brother or sister living in Canada who is a citizen or permanent resident?</FieldLabel>
              <CRSSelect value={hasSibling ? 'yes' : 'no'} onChange={v => setSib(v === 'yes')}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </CRSSelect>
              {hasSibling && (
                <p className="crs-field-tip" style={{ marginTop: 8, color: '#2D8A56' }}>✓ +15 points</p>
              )}
            </Question>

            <p className="crs-field-tip">
              ℹ️ <strong>Job offer points were removed by IRCC on March 25, 2025</strong> and no longer affect CRS scores.
            </p>

          </SectionCard>

        </div>

        {/* ── RIGHT: Score Panel ── */}
        <div className="crs-score-panel">

          <div className="crs-score-card">
            <div className="crs-total-label">Estimated CRS Score</div>
            <motion.div
              className="crs-total-score"
              key={breakdown.totalPts}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {breakdown.totalPts}
            </motion.div>
            <div className="crs-draw-hint" style={{ color: drawHint.color, borderColor: drawHint.color + '40' }}>
              {drawHint.label}
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="crs-breakdown">
            <div className="crs-breakdown-title">Score Breakdown</div>
            <ScoreBar label="Age"                        points={breakdown.agePts}      max={110}  color="#4A90D9" />
            <ScoreBar label="Education"                  points={breakdown.eduPts}      max={150}  color="#2D8A56" />
            {breakdown.canEduPts > 0 && (
              <ScoreBar label={`Canadian Education (+${breakdown.canEduPts})`} points={breakdown.canEduPts}   max={30}   color="#2D8A56" />
            )}
            <ScoreBar label="Language — 1st Official"   points={breakdown.lang1Total}  max={136}  color="#C8102E" />
            {breakdown.lang2Total > 0 && (
              <ScoreBar label="Language — 2nd Official"  points={breakdown.lang2Total}  max={22}   color="#9B59B6" />
            )}
            <ScoreBar label="Canadian Work Exp."         points={breakdown.canPts}      max={80}   color="#C8972A" />
            {breakdown.foreignPts > 0 && (
              <ScoreBar label="Foreign Work Exp."        points={breakdown.foreignPts}  max={25}   color="#6B7A94" />
            )}
            {breakdown.skillTotal > 0 && (
              <ScoreBar label="Skill Transferability"    points={breakdown.skillTotal}  max={100}  color="#0F6B8A" />
            )}
            {breakdown.additionalPts > 0 && (
              <ScoreBar label="Additional Points"        points={breakdown.additionalPts} max={695} color="#8B5E3C" />
            )}
          </div>

          {/* Skill transferability detail */}
          {breakdown.skillTotal > 0 && (
            <div className="crs-breakdown">
              <div className="crs-breakdown-title">Skill Transferability Detail</div>
              {[
                [breakdown.st.eduLang,     'Education + Language'],
                [breakdown.st.eduCan,      'Education + Canadian Exp.'],
                [breakdown.st.foreignLang, 'Foreign Exp. + Language'],
                [breakdown.st.foreignCan,  'Foreign Exp. + Canadian Exp.'],
                [breakdown.certLangPts,    'Certificate of Qualification + Language'],
              ].filter(([pts]) => pts > 0).map(([pts, lbl]) => (
                <div key={lbl} className="st-row">
                  <span>{lbl}</span>
                  <span className="st-pts">+{pts}</span>
                </div>
              ))}
              <div className="st-row st-total">
                <span>Total (cap 100)</span>
                <span className="st-pts">{breakdown.skillTotal}</span>
              </div>
            </div>
          )}

          {/* Language impact table */}
          <div className="lang-impact-card">
            <div className="lang-impact-title">🎯 CELPIP Score Impact</div>
            <p className="lang-impact-sub">
              If all 4 skills improved to the same score — how does your CRS change?
            </p>
            <table className="lang-impact-table">
              <thead>
                <tr>
                  <th>CELPIP</th>
                  <th>CLB</th>
                  <th>Lang pts</th>
                  <th>Est. CRS</th>
                  <th>Gain</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { score: '7', clb: 7 },
                  { score: '8', clb: 8 },
                  { score: '9', clb: 9 },
                  { score: '10', clb: 10 },
                ].map(({ score, clb }) => {
                  const l = lang1Pts(clb)
                  const total4 = l.listen + l.read + l.write + l.speak
                  // nonLang = core without lang1 (age + edu + canExp + foreignExp + lang2)
                  const nonLang = breakdown.corePts - breakdown.lang1Total
                  const newSt = skillTransfer({ education, canExp, foreignExp, lang1Min: clb })
                  const est = nonLang + total4 + newSt.total + breakdown.additionalPts
                  const gain = est - breakdown.totalPts
                  const isActive = score === celpipListen && score === celpipRead && score === celpipWrite && score === celpipSpeak
                  return (
                    <tr key={score} className={isActive ? 'lang-row-active' : ''}>
                      <td><strong>{score}</strong></td>
                      <td>{clb}</td>
                      <td>{total4}</td>
                      <td><strong>{est}</strong></td>
                      <td style={{ color: gain > 0 ? '#16A34A' : gain < 0 ? '#DC2626' : 'var(--gray-400)', fontWeight: 700 }}>
                        {gain > 0 ? `+${gain}` : gain === 0 ? '—' : gain}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="crs-disclaimer">
            * For estimation only. Official CRS is determined by IRCC. Uses the <strong>single-applicant formula</strong>.
            Skill transferability capped at 100 pts per IRCC rules.
            Job offer points removed by IRCC effective March 25, 2025.
          </div>

        </div>
      </div>
    </div>
  )
}
