import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  CRS_AGE_WITH_SPOUSE, CRS_AGE_NO_SPOUSE,
  CRS_EDUCATION_WITH_SPOUSE, CRS_EDUCATION_NO_SPOUSE,
  CRS_CAN_EXP_WITH_SPOUSE, CRS_CAN_EXP_NO_SPOUSE,
  CRS_LANG_POINTS_WITH_SPOUSE, CRS_LANG_POINTS_NO_SPOUSE,
  CRS_LANG2_POINTS,
  CRS_SPOUSE_EDUCATION, CRS_SPOUSE_CAN_EXP,
} from '../data/constants'

/* ── Helpers ──────────────────────────────────────────────────── */
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)) }

function lang1Pts(clb, ws) {
  if (clb < 4) return { listen: 0, read: 0, write: 0, speak: 0 }
  const tbl = ws ? CRS_LANG_POINTS_WITH_SPOUSE : CRS_LANG_POINTS_NO_SPOUSE
  return tbl[clamp(clb, 4, 10)] ?? { listen: 0, read: 0, write: 0, speak: 0 }
}

function lang2Pts(clb) {
  if (!clb || clb < 5) return { listen: 0, read: 0, write: 0, speak: 0 }
  return CRS_LANG2_POINTS[clamp(clb, 5, 10)] ?? { listen: 0, read: 0, write: 0, speak: 0 }
}

// Spouse language per-skill pts from IRCC z[i][10]
const SPOUSE_LANG_PTS = { 0:0, 4:0, 5:0, 6:0, 7:3, 8:3, 9:5, 10:5 }
function spouseLangPts(clb) { return SPOUSE_LANG_PTS[clamp(clb, 0, 10)] ?? 0 }

/**
 * Skill Transferability — exact IRCC logic from crs-tool-udit.js
 */
function calcSkillTransfer({ education, canExp, foreignExp, lang1Min, hasCertQual }) {
  const midEdu  = ['one_year','two_year','bachelors'].includes(education)
  const highEdu = ['two_or_more','masters','doctoral'].includes(education)

  // Education A: Education + Language (max 50)
  let eduA = 0
  if (midEdu)  { eduA = lang1Min >= 9 ? 25 : lang1Min >= 7 ? 13 : 0 }
  if (highEdu) { eduA = lang1Min >= 9 ? 50 : lang1Min >= 7 ? 25 : 0 }

  // Education B: Education + Canadian Exp (max 50)
  let eduB = 0
  if (midEdu)  { eduB = canExp >= 2 ? 25 : canExp >= 1 ? 13 : 0 }
  if (highEdu) { eduB = canExp >= 2 ? 50 : canExp >= 1 ? 25 : 0 }

  const eduTot = Math.min(50, eduA + eduB)

  // Foreign exp A: Foreign + Language (max 50)
  let fp1 = 0
  if (foreignExp >= 3)      { fp1 = lang1Min >= 9 ? 50 : lang1Min >= 7 ? 25 : 0 }
  else if (foreignExp >= 1) { fp1 = lang1Min >= 9 ? 25 : lang1Min >= 7 ? 13 : 0 }

  // Foreign exp B: Foreign + Canadian Exp (max 50)
  let fp2 = 0
  if (foreignExp >= 3)      { fp2 = canExp >= 2 ? 50 : canExp >= 1 ? 25 : 0 }
  else if (foreignExp >= 1) { fp2 = canExp >= 2 ? 25 : canExp >= 1 ? 13 : 0 }

  const foreignTot = Math.min(50, fp1 + fp2)

  // Certificate of qualification + Language (max 50)
  let cert = 0
  if (hasCertQual) { cert = lang1Min >= 7 ? 50 : lang1Min >= 5 ? 25 : 0 }

  const skillTotal = Math.min(100, eduTot + foreignTot + cert)
  return { eduA, eduB, eduTot, fp1, fp2, foreignTot, cert, skillTotal }
}

/* ── CELPIP → CLB mapping ─────────────────────────────────────── */
const CELPIP_OPTIONS = [
  { celpip:'M',   clb:0,  label:'M (no score)'   },
  { celpip:'1',   clb:0,  label:'1'               },
  { celpip:'2',   clb:0,  label:'2'               },
  { celpip:'3',   clb:0,  label:'3'               },
  { celpip:'4',   clb:4,  label:'4 → CLB 4'       },
  { celpip:'4.5', clb:5,  label:'4.5 → CLB 5'     },
  { celpip:'5',   clb:5,  label:'5 → CLB 5'       },
  { celpip:'5.5', clb:6,  label:'5.5 → CLB 6'     },
  { celpip:'6',   clb:6,  label:'6 → CLB 6'       },
  { celpip:'6.5', clb:7,  label:'6.5 → CLB 7'     },
  { celpip:'7',   clb:7,  label:'7 → CLB 7'       },
  { celpip:'7.5', clb:8,  label:'7.5 → CLB 8'     },
  { celpip:'8',   clb:8,  label:'8 → CLB 8'       },
  { celpip:'8.5', clb:9,  label:'8.5 → CLB 9'     },
  { celpip:'9',   clb:9,  label:'9 → CLB 9'       },
  { celpip:'9.5', clb:10, label:'9.5 → CLB 10'    },
  { celpip:'10',  clb:10, label:'10 → CLB 10'     },
  { celpip:'11',  clb:10, label:'11 → CLB 10'     },
  { celpip:'12',  clb:10, label:'12 → CLB 10'     },
]

function getCLB(val) {
  return CELPIP_OPTIONS.find(o => o.celpip === val)?.clb ?? 0
}

const EDU_OPTIONS = [
  { value:'none',        label:'None, or less than secondary (high school)' },
  { value:'secondary',   label:'Secondary diploma (high school graduation)' },
  { value:'one_year',    label:'One-year program at a university, college, trade or technical school' },
  { value:'two_year',    label:'Two-year program at a university, college, trade or technical school' },
  { value:'bachelors',   label:"Bachelor's degree (3 or more year program)" },
  { value:'two_or_more', label:'Two or more certificates/diplomas/degrees (one must be 3+ years)' },
  { value:'masters',     label:"Master's degree, or professional degree needed for a licensed profession" },
  { value:'doctoral',    label:'Doctoral level university degree (PhD)' },
]

/* ── Sub-components ───────────────────────────────────────────── */
function SectionCard({ title, emoji, children }) {
  return (
    <div className="crs-section-card">
      <div className="crs-section-heading"><span>{emoji}</span> {title}</div>
      {children}
    </div>
  )
}
function Question({ num, label, tip, children }) {
  return (
    <div className="crs-question">
      {num && <div className="crs-question-num">Question {num}</div>}
      {label && <label className="crs-field-label">{label}</label>}
      {tip && <p className="crs-field-tip">{tip}</p>}
      {children}
    </div>
  )
}
function Sel({ value, onChange, children, style }) {
  return (
    <select className="crs-select" value={value} onChange={e => onChange(e.target.value)} style={style}>
      {children}
    </select>
  )
}
function CelpipSkillRow({ skill, value, onChange, ws }) {
  const clb = getCLB(value)
  const pts = lang1Pts(clb, ws)[skill.toLowerCase()] ?? 0
  return (
    <div className="clb-select-row">
      <span className="clb-select-skill">{skill}</span>
      <select className="crs-select clb-select" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Select…</option>
        {[...CELPIP_OPTIONS].reverse().map(o => <option key={o.celpip} value={o.celpip}>{o.label}</option>)}
      </select>
      <span className="clb-pts-badge">{pts} pts</span>
    </div>
  )
}
function Lang2SkillRow({ skill, value, onChange }) {
  const clb = getCLB(value)
  const pts = clb >= 5 ? (lang2Pts(clb)[skill.toLowerCase()] ?? 0) : 0
  const opts = CELPIP_OPTIONS.filter(o => o.clb === 0 || o.clb >= 5)
  return (
    <div className="clb-select-row">
      <span className="clb-select-skill">{skill}</span>
      <select className="crs-select clb-select" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Select…</option>
        {[...opts].reverse().map(o => <option key={o.celpip} value={o.celpip}>{o.label}</option>)}
      </select>
      <span className="clb-pts-badge">{pts} pts</span>
    </div>
  )
}
function SpouseLangRow({ skill, value, onChange }) {
  const clb = getCLB(value)
  const pts = spouseLangPts(clb)
  return (
    <div className="clb-select-row">
      <span className="clb-select-skill">{skill}</span>
      <select className="crs-select clb-select" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Select…</option>
        {[...CELPIP_OPTIONS].reverse().map(o => <option key={o.celpip} value={o.celpip}>{o.label}</option>)}
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
        <motion.div className="score-bar-fill" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }} />
      </div>
    </div>
  )
}

/* ── Main Component ───────────────────────────────────────────── */
export default function CRSCalculatorPage() {

  /* ── Marital / Spouse ── */
  const [marital, setMarital]           = useState('single')
  const [spouseIsCitizen, setSpouseCit] = useState('no')
  const [spouseJoining, setSpouseJoin]  = useState('no')

  const withSpouse = (marital === 'married' || marital === 'common_law')
    && spouseIsCitizen === 'no'
    && spouseJoining === 'yes'

  /* ── Age ── */
  const [age, setAge] = useState(28)

  /* ── Education ── */
  const [education, setEdu]       = useState('masters')
  const [hasCanEdu, setCanEdu]    = useState(false)
  const [canEduLevel, setCanEduL] = useState('three_plus')

  /* ── Language 1 ── */
  const [lang1Test, setLang1Test] = useState('celpip')
  const [l1Speak, setL1Speak]     = useState('')
  const [l1Listen, setL1Listen]   = useState('')
  const [l1Read, setL1Read]       = useState('')
  const [l1Write, setL1Write]     = useState('')

  /* ── Language 2 ── */
  const [lang2Test, setLang2Test] = useState('none')
  const [l2Speak, setL2Speak]     = useState('')
  const [l2Listen, setL2Listen]   = useState('')
  const [l2Read, setL2Read]       = useState('')
  const [l2Write, setL2Write]     = useState('')

  /* ── Work exp ── */
  const [canExp, setCanExp]       = useState(0)
  const [foreignExp, setForeign]  = useState(0)

  /* ── Certificate ── */
  const [hasCertQual, setCertQual] = useState(false)

  /* ── Additional ── */
  const [hasNom, setNom]       = useState(false)
  const [hasSibling, setSib]   = useState(false)

  /* ── Spouse factors ── */
  const [spouseEdu, setSpouseEdu]         = useState('none')
  const [spouseCanExp, setSpouseCanExp]   = useState(0)
  const [spouseLangTest]                  = useState('celpip')
  const [sL1Speak, setSL1Speak]           = useState('')
  const [sL1Listen, setSL1Listen]         = useState('')
  const [sL1Read, setSL1Read]             = useState('')
  const [sL1Write, setSL1Write]           = useState('')

  /* ── Derived CLBs ── */
  const clb1 = {
    speak:  getCLB(l1Speak),
    listen: getCLB(l1Listen),
    read:   getCLB(l1Read),
    write:  getCLB(l1Write),
  }
  const clb2 = {
    speak:  getCLB(l2Speak),
    listen: getCLB(l2Listen),
    read:   getCLB(l2Read),
    write:  getCLB(l2Write),
  }
  const sClb = {
    speak:  getCLB(sL1Speak),
    listen: getCLB(sL1Listen),
    read:   getCLB(sL1Read),
    write:  getCLB(sL1Write),
  }

  const hasLang2    = lang2Test !== 'none'
  const lang1IsFr   = lang1Test === 'tef_fr' || lang1Test === 'tcf_fr'
  const lang2IsFr   = lang2Test === 'tef' || lang2Test === 'tcf' || lang2Test === 'delf'

  /* ── CRS Calculation ── */
  const calc = useMemo(() => {
    const ws = withSpouse

    // A. Core
    const ageTable = ws ? CRS_AGE_WITH_SPOUSE : CRS_AGE_NO_SPOUSE
    const agePts   = ageTable[clamp(age, 17, 45)] ?? 0

    const eduTable = ws ? CRS_EDUCATION_WITH_SPOUSE : CRS_EDUCATION_NO_SPOUSE
    const eduPts   = eduTable[education] ?? 0

    const canTable = ws ? CRS_CAN_EXP_WITH_SPOUSE : CRS_CAN_EXP_NO_SPOUSE
    const canPts   = canTable[clamp(canExp, 0, 5)] ?? 0

    // Language 1 — per-skill lookup
    const L  = lang1Pts(clb1.listen, ws).listen
    const R  = lang1Pts(clb1.read,   ws).read
    const W  = lang1Pts(clb1.write,  ws).write
    const S  = lang1Pts(clb1.speak,  ws).speak
    const lang1Total = L + R + W + S

    // Language 2 (cap 22)
    const l2L = lang2Pts(clb2.listen).listen
    const l2R = lang2Pts(clb2.read).read
    const l2W = lang2Pts(clb2.write).write
    const l2S = lang2Pts(clb2.speak).speak
    const lang2Total = hasLang2 ? Math.min(22, l2L + l2R + l2W + l2S) : 0

    const corePts = agePts + eduPts + canPts + lang1Total + lang2Total

    // B. Spouse factors (only if withSpouse)
    let spouseEduPts = 0, spouseCanPts = 0, spouseLangTotal = 0, spouseTotal = 0
    if (ws) {
      spouseEduPts  = CRS_SPOUSE_EDUCATION[spouseEdu] ?? 0
      spouseCanPts  = CRS_SPOUSE_CAN_EXP[clamp(spouseCanExp, 0, 5)] ?? 0
      spouseLangTotal = spouseLangPts(sClb.speak) + spouseLangPts(sClb.listen)
                      + spouseLangPts(sClb.read)  + spouseLangPts(sClb.write)
      spouseTotal = spouseEduPts + spouseCanPts + spouseLangTotal
    }

    // C. Skill transferability
    const lang1Min = Math.min(clb1.listen, clb1.read, clb1.write, clb1.speak)
    const st = calcSkillTransfer({ education, canExp, foreignExp, lang1Min, hasCertQual })

    // D. Additional
    let canEduPts = 0
    if (hasCanEdu) {
      canEduPts = canEduLevel === 'three_plus' ? 30 : canEduLevel === 'one_or_two' ? 15 : 0
    }
    const nomPts     = hasNom ? 600 : 0
    const siblingPts = hasSibling ? 15 : 0

    // French bonus (IRCC logic)
    let frenchPts = 0
    const allCLB7  = (c) => c.speak >= 7 && c.listen >= 7 && c.read >= 7 && c.write >= 7
    const allCLB5  = (c) => c.speak >= 5 && c.listen >= 5 && c.read >= 5 && c.write >= 5
    const lang1CLB6 = clb1.speak >= 6 && clb1.listen >= 6 && clb1.read >= 6 && clb1.write >= 6

    if (!lang1IsFr && lang2IsFr && allCLB7(clb2)) {
      // 2nd lang is French CLB7+ and 1st lang is English
      frenchPts = lang1CLB6 ? 50 : 25
    } else if (lang1IsFr && allCLB7(clb1)) {
      // 1st lang is French CLB7+
      if (hasLang2 && !lang2IsFr && allCLB5(clb2)) {
        frenchPts = 50
      } else {
        frenchPts = 25
      }
    }

    const additionalPts = nomPts + frenchPts + siblingPts + canEduPts
    const totalPts = corePts + spouseTotal + st.skillTotal + additionalPts

    return {
      agePts, eduPts, canPts, lang1Total, lang2Total, corePts,
      spouseEduPts, spouseCanPts, spouseLangTotal, spouseTotal,
      st, canEduPts, nomPts, frenchPts, siblingPts, additionalPts,
      totalPts, lang1Min,
      langSkills: { L, R, W, S },
    }
  }, [
    withSpouse, age, education, hasCanEdu, canEduLevel,
    canExp, foreignExp, hasCertQual,
    clb1.listen, clb1.read, clb1.write, clb1.speak,
    lang2Test, clb2.listen, clb2.read, clb2.write, clb2.speak,
    hasLang2, lang1IsFr, lang2IsFr,
    hasNom, hasSibling,
    spouseEdu, spouseCanExp,
    sClb.speak, sClb.listen, sClb.read, sClb.write,
  ])

  const drawHint = calc.totalPts >= 600
    ? { label:'🏆 Very strong — competitive in almost every draw', color:'#16A34A' }
    : calc.totalPts >= 510
    ? { label:'✅ Competitive — within typical draw cutoff range',  color:'#16A34A' }
    : calc.totalPts >= 470
    ? { label:'⚠️ Getting close — boosting language score helps most', color:'#C8972A' }
    : { label:'❌ Below recent cutoffs — focus on language & experience', color:'#C8102E' }

  const maxAge  = withSpouse ? 100 : 110
  const maxEdu  = withSpouse ? 140 : 150
  const maxLang = withSpouse ? 128 : 136
  const maxCan  = withSpouse ?  70 :  80

  function setAllLang1(s) { setL1Speak(s); setL1Listen(s); setL1Read(s); setL1Write(s) }

  const showSpouseQ    = marital === 'married' || marital === 'common_law'
  const showSpouseQ2ii = showSpouseQ && spouseIsCitizen === 'no'

  return (
    <div className="page-wrap crs-calc-wrap">
      <div className="page-header">
        <h2 className="page-title">🧮 <span className="highlight">CRS Score Calculator</span></h2>
        <p className="page-sub">
          Mirrors the official IRCC Express Entry CRS calculator. Fully supports single and married / common-law applicants.
        </p>
      </div>

      <div className="crs-calc-layout">

        {/* ── LEFT: Inputs ── */}
        <div className="crs-inputs">

          {/* Personal */}
          <SectionCard title="Personal Information" emoji="👤">

            <Question num="1" label="What is your marital status?">
              <Sel value={marital} onChange={setMarital}>
                <option value="single">Never Married / Single</option>
                <option value="married">Married</option>
                <option value="common_law">Common-law partnership</option>
                <option value="separated">Separated (legally married)</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </Sel>
            </Question>

            {showSpouseQ && (
              <Question num="2i"
                label="Is your spouse or common-law partner a Canadian citizen or permanent resident?"
                tip="If yes, you are treated as a single applicant and they are not counted as accompanying.">
                <Sel value={spouseIsCitizen} onChange={setSpouseCit}>
                  <option value="no">No</option>
                  <option value="yes">Yes — they are a citizen or PR</option>
                </Sel>
              </Question>
            )}

            {showSpouseQ2ii && (
              <Question num="2ii"
                label="Will your spouse or common-law partner come with you to Canada?">
                <Sel value={spouseJoining} onChange={setSpouseJoin}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </Sel>
                {withSpouse && (
                  <p className="crs-field-tip" style={{ marginTop:8, color:'#C8972A' }}>
                    ⚠️ Using the <strong>married / partner formula</strong>. Core factor maximums are lower, but
                    up to 40 extra points are available from your spouse's factors below.
                  </p>
                )}
              </Question>
            )}

            <Question num="3"
              label="How old are you?"
              tip="If invited to apply, use your age on the date of invitation.">
              <Sel value={String(age)} onChange={v => setAge(Number(v))}>
                {Array.from({length:28},(_,i)=>i+18).map(a =>
                  <option key={a} value={a}>{a} years of age</option>)}
              </Sel>
            </Question>

          </SectionCard>

          {/* Education */}
          <SectionCard title="Education" emoji="🎓">

            <Question num="4a"
              label="What is your level of education?"
              tip="Highest level for which you have a Canadian credential or an ECA from an approved agency (last 5 years).">
              <Sel value={education} onChange={setEdu}>
                {EDU_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Sel>
            </Question>

            <Question num="4b" label="Have you earned a Canadian degree, diploma or certificate?">
              <Sel value={hasCanEdu ? 'yes' : 'no'} onChange={v => setCanEdu(v === 'yes')}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Sel>
            </Question>

            {hasCanEdu && (
              <Question num="4c" label="Choose the level of your Canadian credential:">
                <Sel value={canEduLevel} onChange={setCanEduL}>
                  <option value="secondary">Secondary school credential — 0 pts</option>
                  <option value="one_or_two">1 or 2-year diploma or certificate — +15 pts</option>
                  <option value="three_plus">3+ year degree, OR Master's / professional / doctoral (≥1 academic year) — +30 pts</option>
                </Sel>
              </Question>
            )}

          </SectionCard>

          {/* Language */}
          <SectionCard title="Official Languages" emoji="🗣️">

            <Question num="5i" label="Which test did you take for your first official language?">
              <Sel value={lang1Test} onChange={setLang1Test} style={{ marginBottom:16 }}>
                <option value="celpip">CELPIP-G (English)</option>
                <option value="ielts">IELTS General Training (English)</option>
                <option value="tef_fr">TEF Canada (French)</option>
                <option value="tcf_fr">TCF Canada (French)</option>
              </Sel>
              <p className="crs-field-tip" style={{ marginBottom:12 }}>
                Select your score for each skill — automatically converted to CLB.
              </p>
              <div className="clb-grid">
                <CelpipSkillRow skill="Speaking"  value={l1Speak}  onChange={setL1Speak}  ws={withSpouse} />
                <CelpipSkillRow skill="Listening" value={l1Listen} onChange={setL1Listen} ws={withSpouse} />
                <CelpipSkillRow skill="Reading"   value={l1Read}   onChange={setL1Read}   ws={withSpouse} />
                <CelpipSkillRow skill="Writing"   value={l1Write}  onChange={setL1Write}  ws={withSpouse} />
              </div>
              <div className="clb-apply-all" style={{ marginTop:12 }}>
                {['12','10','9','8','7'].map(s => (
                  <button key={s} className="btn btn-outline btn-sm" onClick={() => setAllLang1(s)}>All {s}</button>
                ))}
              </div>
              <div className="clb-summary">
                <span>CLB →</span>
                {['speak','listen','read','write'].map(sk => (
                  <span key={sk} className="clb-summary-chip">
                    {sk.charAt(0).toUpperCase()+sk.slice(1)}: <strong>{clb1[sk] || '—'}</strong>
                  </span>
                ))}
              </div>
            </Question>

            <Question num="5ii"
              label="Do you have results for a second official language?"
              tip="Must be less than 2 years old. Up to 22 bonus points for CLB 5+.">
              <Sel value={lang2Test} onChange={setLang2Test} style={{ marginBottom: hasLang2 ? 16 : 0 }}>
                <option value="none">Not applicable</option>
                <option value="celpip2">CELPIP-G (English as 2nd)</option>
                <option value="ielts2">IELTS General (English as 2nd)</option>
                <option value="tef">TEF Canada (French)</option>
                <option value="tcf">TCF Canada (French)</option>
                <option value="delf">DELF / DALF (French)</option>
              </Sel>
              {hasLang2 && (
                <div className="clb-grid" style={{ marginTop:12 }}>
                  <Lang2SkillRow skill="Speaking"  value={l2Speak}  onChange={setL2Speak}  />
                  <Lang2SkillRow skill="Listening" value={l2Listen} onChange={setL2Listen} />
                  <Lang2SkillRow skill="Reading"   value={l2Read}   onChange={setL2Read}   />
                  <Lang2SkillRow skill="Writing"   value={l2Write}  onChange={setL2Write}  />
                </div>
              )}
            </Question>

          </SectionCard>

          {/* Work Experience */}
          <SectionCard title="Work Experience" emoji="💼">

            <Question num="6i"
              label="In the last 10 years, how many years of skilled work experience in Canada do you have?"
              tip="Paid, full-time (or equivalent), NOC TEER 0–3, physically in Canada for a Canadian employer.">
              <Sel value={String(canExp)} onChange={v => setCanExp(Number(v))}>
                <option value="0">None or less than 1 year</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="4">4 years</option>
                <option value="5">5 or more years</option>
              </Sel>
            </Question>

            <Question num="6ii"
              label="In the last 10 years, how many years of foreign skilled work experience do you have?"
              tip="Only affects skill transferability points — NOT counted as direct core points.">
              <Sel value={String(foreignExp)} onChange={v => setForeign(Number(v))}>
                <option value="0">None or less than 1 year</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 or more years</option>
              </Sel>
            </Question>

          </SectionCard>

          {/* Certificate */}
          <SectionCard title="Certificate of Qualification" emoji="📜">
            <Question num="7"
              label="Do you have a certificate of qualification from a Canadian province, territory or federal body?"
              tip="Issued by a province/territory or federal body. NOT the same as a provincial nomination.">
              <Sel value={hasCertQual ? 'yes' : 'no'} onChange={v => setCertQual(v === 'yes')}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Sel>
              {hasCertQual && (
                <p className="crs-field-tip" style={{ marginTop:8, color:'#2D8A56' }}>
                  ✓ CLB 5–6 = +25 pts  |  CLB 7+ = +50 pts (max 50, within skill transferability cap of 100)
                </p>
              )}
            </Question>
          </SectionCard>

          {/* Additional */}
          <SectionCard title="Additional Points" emoji="✨">
            <Question num="9" label="Do you have a nomination certificate from a province or territory?">
              <Sel value={hasNom ? 'yes' : 'no'} onChange={v => setNom(v === 'yes')}>
                <option value="no">No</option>
                <option value="yes">Yes — +600 pts</option>
              </Sel>
            </Question>
            <Question num="10"
              label="Do you (or your spouse/partner) have a brother or sister in Canada who is a citizen or PR?"
              tip="Sibling must be 18+ and related by blood, marriage, or adoption.">
              <Sel value={hasSibling ? 'yes' : 'no'} onChange={v => setSib(v === 'yes')}>
                <option value="no">No</option>
                <option value="yes">Yes — +15 pts</option>
              </Sel>
            </Question>
            <p className="crs-field-tip" style={{ marginTop:4 }}>
              ℹ️ <strong>Job offer points removed by IRCC on March 25, 2025.</strong>
            </p>
          </SectionCard>

          {/* Spouse factors — only shown when withSpouse */}
          {withSpouse && (
            <SectionCard title="Spouse / Common-law Partner Factors" emoji="👫">
              <p className="crs-field-tip" style={{ marginBottom:16 }}>
                These points are <strong>added on top of your own score</strong> when your spouse accompanies you to Canada.
                Maximum: education 10 pts + language 20 pts + Canadian work exp 10 pts = <strong>40 pts total</strong>.
              </p>

              <Question num="10s" label="What is the highest level of education of your spouse or partner?">
                <Sel value={spouseEdu} onChange={setSpouseEdu}>
                  {EDU_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Sel>
                <p className="crs-field-tip" style={{ marginTop:6 }}>
                  Points: {CRS_SPOUSE_EDUCATION[spouseEdu] ?? 0} / 10
                </p>
              </Question>

              <Question num="11s"
                label="How many years of skilled Canadian work experience does your spouse have?"
                tip="Same rules as your own Canadian work experience.">
                <Sel value={String(spouseCanExp)} onChange={v => setSpouseCanExp(Number(v))}>
                  <option value="0">None or less than 1 year — 0 pts</option>
                  <option value="1">1 year — 5 pts</option>
                  <option value="2">2 years — 7 pts</option>
                  <option value="3">3 years — 8 pts</option>
                  <option value="4">4 years — 9 pts</option>
                  <option value="5">5 or more years — 10 pts</option>
                </Sel>
              </Question>

              <Question num="12s"
                label="Spouse language test scores"
                tip="Per skill: CLB 9–10 = 5 pts, CLB 7–8 = 3 pts, CLB 5–6 = 1 pt. Max 20 pts total.">
                <div className="clb-grid">
                  <SpouseLangRow skill="Speaking"  value={sL1Speak}  onChange={setSL1Speak}  />
                  <SpouseLangRow skill="Listening" value={sL1Listen} onChange={setSL1Listen} />
                  <SpouseLangRow skill="Reading"   value={sL1Read}   onChange={setSL1Read}   />
                  <SpouseLangRow skill="Writing"   value={sL1Write}  onChange={setSL1Write}  />
                </div>
              </Question>

            </SectionCard>
          )}

        </div>

        {/* ── RIGHT: Score Panel ── */}
        <div className="crs-score-panel">

          <div className="crs-score-card">
            <div className="crs-total-label">Estimated CRS Score</div>
            <motion.div className="crs-total-score" key={calc.totalPts}
              initial={{ scale:0.85, opacity:0 }} animate={{ scale:1, opacity:1 }}
              transition={{ duration:0.3 }}>
              {calc.totalPts}
            </motion.div>
            <div className="crs-draw-hint" style={{ color:drawHint.color, borderColor:drawHint.color+'40' }}>
              {drawHint.label}
            </div>
            {withSpouse && (
              <div style={{ fontSize:12, color:'var(--gray-400)', marginTop:8, textAlign:'center' }}>
                Using <strong>married / partner formula</strong>
              </div>
            )}
          </div>

          {/* Breakdown */}
          <div className="crs-breakdown">
            <div className="crs-breakdown-title">Score Breakdown</div>

            <div className="crs-breakdown-section-label">A. Core / Human Capital</div>
            <ScoreBar label="Age"                      points={calc.agePts}     max={maxAge}  color="#4A90D9" />
            <ScoreBar label="Education"                points={calc.eduPts}     max={maxEdu}  color="#2D8A56" />
            <ScoreBar label="Language — 1st Official"  points={calc.lang1Total} max={maxLang} color="#C8102E" />
            {calc.lang2Total > 0 && (
              <ScoreBar label="Language — 2nd Official" points={calc.lang2Total} max={22} color="#9B59B6" />
            )}
            <ScoreBar label="Canadian Work Exp."       points={calc.canPts}     max={maxCan}  color="#C8972A" />

            {withSpouse && calc.spouseTotal > 0 && (
              <>
                <div className="crs-breakdown-section-label" style={{ marginTop:12 }}>B. Spouse / Partner Factors</div>
                <ScoreBar label="Spouse Education"      points={calc.spouseEduPts}    max={10} color="#4A90D9" />
                <ScoreBar label="Spouse Language"       points={calc.spouseLangTotal} max={20} color="#C8102E" />
                <ScoreBar label="Spouse Canadian Exp."  points={calc.spouseCanPts}    max={10} color="#C8972A" />
              </>
            )}

            {calc.st.skillTotal > 0 && (
              <>
                <div className="crs-breakdown-section-label" style={{ marginTop:12 }}>C. Skill Transferability</div>
                <ScoreBar label="Skill Transferability" points={calc.st.skillTotal} max={100} color="#0F6B8A" />
              </>
            )}

            {calc.additionalPts > 0 && (
              <>
                <div className="crs-breakdown-section-label" style={{ marginTop:12 }}>D. Additional Points</div>
                {calc.canEduPts   > 0 && <ScoreBar label={`Canadian Education (+${calc.canEduPts})`} points={calc.canEduPts}   max={30}  color="#2D8A56" />}
                {calc.nomPts      > 0 && <ScoreBar label="Provincial Nomination"  points={calc.nomPts}     max={600} color="#8B5E3C" />}
                {calc.frenchPts   > 0 && <ScoreBar label="French Language Bonus"  points={calc.frenchPts}  max={50}  color="#0F6B8A" />}
                {calc.siblingPts  > 0 && <ScoreBar label="Sibling in Canada"      points={calc.siblingPts} max={15}  color="#6B7A94" />}
              </>
            )}
          </div>

          {/* Skill transferability detail */}
          {calc.st.skillTotal > 0 && (
            <div className="crs-breakdown">
              <div className="crs-breakdown-title">Skill Transferability Detail</div>
              {[
                [calc.st.eduA,      'Education + Language (A)'],
                [calc.st.eduB,      'Education + Canadian Exp. (B)'],
                [calc.st.eduTot,    '→ Education subtotal (max 50)', true],
                [calc.st.fp1,       'Foreign Exp. + Language (A)'],
                [calc.st.fp2,       'Foreign Exp. + Canadian Exp. (B)'],
                [calc.st.foreignTot,'→ Foreign exp subtotal (max 50)', true],
                [calc.st.cert,      'Certificate of Qualification + Language'],
              ].filter(([pts]) => pts > 0).map(([pts, lbl, isSub]) => (
                <div key={lbl} className={`st-row${isSub ? ' st-sub' : ''}`}>
                  <span>{lbl}</span>
                  <span className="st-pts">+{pts}</span>
                </div>
              ))}
              <div className="st-row st-total">
                <span>Total (cap 100)</span>
                <span className="st-pts">{calc.st.skillTotal}</span>
              </div>
            </div>
          )}

          {/* CELPIP Impact table */}
          <div className="lang-impact-card">
            <div className="lang-impact-title">🎯 CELPIP Score Impact</div>
            <p className="lang-impact-sub">All 4 skills at the same score — how does CRS change?</p>
            <table className="lang-impact-table">
              <thead>
                <tr><th>CELPIP</th><th>CLB</th><th>Lang pts</th><th>Est. CRS</th><th>Gain</th></tr>
              </thead>
              <tbody>
                {[{s:'7',clb:7},{s:'8',clb:8},{s:'9',clb:9},{s:'10',clb:10}].map(({ s, clb }) => {
                  const lp  = lang1Pts(clb, withSpouse)
                  const lh  = lp.listen + lp.read + lp.write + lp.speak
                  const sth = calcSkillTransfer({ education, canExp, foreignExp, lang1Min:clb, hasCertQual })
                  const nonLang = calc.corePts - calc.lang1Total
                  const est = nonLang + lh + calc.spouseTotal + sth.skillTotal + calc.additionalPts
                  const gain = est - calc.totalPts
                  const isActive = [l1Speak, l1Listen, l1Read, l1Write].every(v => v === s)
                  return (
                    <tr key={s} className={isActive ? 'lang-row-active' : ''}>
                      <td><strong>{s}</strong></td>
                      <td>{clb}</td>
                      <td>{lh}</td>
                      <td><strong>{est}</strong></td>
                      <td style={{ color: gain>0?'#16A34A':gain<0?'#DC2626':'var(--gray-400)', fontWeight:700 }}>
                        {gain>0?`+${gain}`:gain===0?'—':gain}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="crs-disclaimer">
            * Estimation only. Official CRS is determined by IRCC. Foreign work experience only affects skill
            transferability (not core). Skill transferability capped at 100 pts.
            Job offer points removed by IRCC effective March 25, 2025.
          </div>

        </div>
      </div>
    </div>
  )
}
