import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { LISTENING_DATA } from '../data/listeningData'
import { READING_DATA } from '../data/readingData'
import SEO from '../components/SEO'

/* ══════════════════════════════════════════════════════════════
   SECTION CONFIG — colours & icons per section
══════════════════════════════════════════════════════════════ */
const SECTION_CONFIG = {
  listening: { color: '#4A90D9', icon: '🎧', label: 'Listening', page: 'listening' },
  reading:   { color: '#2D8A56', icon: '📖', label: 'Reading',   page: 'reading'   },
  writing:   { color: '#C8972A', icon: '✍️',  label: 'Writing',  page: 'writing'   },
  speaking:  { color: '#C8102E', icon: '🎙️', label: 'Speaking',  page: 'speaking'  },
}

/* ══════════════════════════════════════════════════════════════
   LISTENING — sample practice sets
   Question types mirror the real CELPIP exam variety:
     'mcq'           — standard 4-option multiple choice
     'speaker_id'    — identify which speaker said / felt X
     'inference'     — what can be inferred / implied
     'vocab_context' — what does the word/phrase mean here
     'gist'          — main idea / purpose of the conversation
══════════════════════════════════════════════════════════════ */
const LISTENING_SETS = {
  L1: {
    title: 'Customer & Staff at the Library',
    instruction: 'You will hear a conversation between a library staff member and a customer who needs help locating a book. Answer the questions based on what you hear.',
    scenario: 'Library — Customer Service',
    type: 'mcq',
    questions: [
      { id: 1, difficulty: 'easy',   questionType: 'gist',
        text: 'What is the main purpose of the conversation?',
        options: ['A) The customer is reporting a missing library card.', 'B) The customer is trying to locate a book he cannot find on the shelf.', 'C) The staff member is informing the customer about a new branch policy.', 'D) The customer wants to borrow more books than the borrowing limit allows.'],
        answer: 1, explanation: 'The entire conversation revolves around the customer not being able to find the book where the system says it should be.' },
      { id: 2, difficulty: 'easy',   questionType: 'mcq',
        text: 'What does the staff member suggest as the FIRST step to finding the book?',
        options: ['A) Check whether another branch has a copy.', 'B) Search the catalogue again on her computer.', 'C) Look in the returns cart near the front desk.', 'D) Place a hold and wait for it to be re-shelved.'],
        answer: 2, explanation: 'The staff member mentions the returns cart first — books often sit there after being returned but before being re-shelved.' },
      { id: 3, difficulty: 'medium', questionType: 'inference',
        text: 'What can be inferred about the customer from this conversation?',
        options: ['A) He visits the library for the first time.', 'B) He already checked the shelf before speaking to the staff member.', 'C) He is not interested in placing a hold on the book.', 'D) He plans to visit a different branch instead.'],
        answer: 1, explanation: 'He says he checked the shelf where the system shows the book — implying he already looked before approaching staff.' },
      { id: 4, difficulty: 'medium', questionType: 'mcq',
        text: 'What does the customer decide to do at the end of the conversation?',
        options: ['A) Return the next day when staff can confirm the book is available.', 'B) Place a hold so he is notified when the book becomes available.', 'C) Borrow a different book on the same subject.', 'D) Ask the manager to investigate where the book has gone.'],
        answer: 1, explanation: 'After the returns cart does not have the book, the customer agrees to place a hold.' },
      { id: 5, difficulty: 'hard',   questionType: 'vocab_context',
        text: 'The staff member says the book may be "in transit." In this context, "in transit" most likely means:',
        options: ['A) Being transported to a different city library.', 'B) Checked out by another customer and not yet returned.', 'C) In the process of being moved between shelves or branches within the system.', 'D) Lost and flagged for replacement by the acquisitions team.'],
        answer: 2, explanation: '"In transit" in library systems means the item is moving between locations or processing stages — not yet on the shelf but not checked out either.' },
    ],
  },
  L2: {
    title: 'Friends Planning a Weekend Trip',
    instruction: 'You will hear a phone conversation between two friends, Sarah and Mark, planning a weekend trip. Listen carefully to what each person says.',
    scenario: 'Phone call — Weekend Plans',
    type: 'mcq',
    questions: [
      { id: 1, difficulty: 'easy',   questionType: 'gist',
        text: 'What is the main topic of this conversation?',
        options: ['A) Deciding where to go for a weekend trip.', 'B) Booking a hotel for a family vacation.', 'C) Discussing whether to cancel a trip already booked.', 'D) Comparing the cost of different holiday destinations.'],
        answer: 0, explanation: 'The entire conversation is about where to go for the coming weekend — Sarah wants the mountains, Mark has concerns.' },
      { id: 2, difficulty: 'easy',   questionType: 'speaker_id',
        text: 'Who first brings up the idea of going to the mountains?',
        options: ['A) Mark, because he wants to hike.', 'B) Sarah, because she has been wanting to hike.', 'C) Both — they have discussed it before.', 'D) Neither — a friend suggested it to them.'],
        answer: 1, explanation: 'Sarah is the one who proposes the mountains for a hike.' },
      { id: 3, difficulty: 'medium', questionType: 'mcq',
        text: 'What is Mark\'s main concern about the plan?',
        options: ['A) He does not enjoy hiking.', 'B) The weather forecast predicts possible rain on Saturday.', 'C) His car needs repairs and cannot make the trip.', 'D) He already has other plans for Saturday.'],
        answer: 1, explanation: 'Mark checked the weather and is worried it might rain on Saturday, which is his key hesitation.' },
      { id: 4, difficulty: 'medium', questionType: 'inference',
        text: 'What does Mark\'s suggestion to "shift the hike to Sunday" tell us about his attitude?',
        options: ['A) He does not want to go at all and is stalling.', 'B) He is open to the trip but wants to avoid the bad weather.', 'C) He prefers shorter trips and wants to return home by Saturday evening.', 'D) He is worried Sarah will change her mind if they wait.'],
        answer: 1, explanation: 'Proposing Sunday shows he still wants to go — he is adapting to the weather concern, not rejecting the idea.' },
      { id: 5, difficulty: 'hard',   questionType: 'vocab_context',
        text: 'Mark says the Sunday forecast "looks much clearer." In context, "clearer" refers to:',
        options: ['A) Better road visibility for the drive.', 'B) A more settled and dry weather outlook.', 'C) A clearer hiking trail with fewer other visitors.', 'D) A more certain plan with less room for doubt.'],
        answer: 1, explanation: '"Clearer" here is a weather term — it means less cloud cover, lower chance of rain, and more settled conditions.' },
    ],
  },
  L3: {
    title: 'Community Centre Announcement',
    instruction: 'You will hear a community centre director making an announcement about changes to the facility. Listen carefully to the details.',
    scenario: 'Community Centre — Public Announcement',
    type: 'mcq',
    questions: [
      { id: 1, difficulty: 'easy',   questionType: 'gist',
        text: 'What is the main purpose of this announcement?',
        options: ['A) To advertise membership discounts for the summer season.', 'B) To inform members about facility changes and new programs.', 'C) To explain why the community centre is temporarily closing.', 'D) To introduce a new director to the membership.'],
        answer: 1, explanation: 'The director announces pool maintenance, a new senior program, and the registration method — all updates about the facility.' },
      { id: 2, difficulty: 'easy',   questionType: 'mcq',
        text: 'Why is the swimming pool temporarily closed?',
        options: ['A) It is being expanded to add more lanes.', 'B) It failed a recent health inspection.', 'C) Scheduled safety checks and filter upgrades are underway.', 'D) Staff are attending a two-week training program.'],
        answer: 2, explanation: 'The director says the closure is for scheduled maintenance: safety checks and filter upgrades.' },
      { id: 3, difficulty: 'medium', questionType: 'mcq',
        text: 'Which new program is being introduced specifically for seniors?',
        options: ['A) A Wednesday morning yoga class.', 'B) A low-impact aquatic fitness session.', 'C) An outdoor walking club on Monday mornings.', 'D) A chair yoga class in Room 2.'],
        answer: 1, explanation: 'The director introduces a new aquatic fitness program designed for seniors as part of the season updates.' },
      { id: 4, difficulty: 'medium', questionType: 'inference',
        text: 'What can be inferred from the director\'s mention of "advance registration" for all programs?',
        options: ['A) The centre expects low attendance and wants to confirm numbers.', 'B) Some programs have been oversubscribed in the past.', 'C) Walk-in participation is no longer permitted at the centre.', 'D) Registration must be completed at the front desk in person.'],
        answer: 1, explanation: 'Requiring advance registration usually signals that demand exists and space is limited — a common response to past overcrowding.' },
      { id: 5, difficulty: 'hard',   questionType: 'mcq',
        text: 'How can residents register for the new programs?',
        options: ['A) By calling the front desk during business hours.', 'B) By completing a paper form at reception.', 'C) Through the community centre website or mobile app.', 'D) By emailing the program coordinator directly.'],
        answer: 2, explanation: 'The director says registration is available through the website and the updated mobile app.' },
    ],
  },
  L4: {
    title: 'News Report — City Transit Expansion',
    instruction: 'You will hear a short Canadian radio news report about a major transit announcement. Listen carefully to the facts and figures presented.',
    scenario: 'Radio News — City Transit',
    type: 'mcq',
    questions: [
      { id: 1, difficulty: 'easy',   questionType: 'gist',
        text: 'What is the main story in this news report?',
        options: ['A) A city transit workers\' strike is expected to begin next week.', 'B) City council has approved extending the subway to two new neighbourhoods.', 'C) Transit fares are increasing for the second time this year.', 'D) The city is replacing its diesel bus fleet with electric vehicles.'],
        answer: 1, explanation: 'The report leads with council\'s approval of a subway extension project covering two new areas.' },
      { id: 2, difficulty: 'easy',   questionType: 'mcq',
        text: 'When is the transit project expected to be completed?',
        options: ['A) By the end of next year.', 'B) Within 18 months of construction beginning.', 'C) In approximately three years.', 'D) Within five years, depending on additional funding.'],
        answer: 2, explanation: 'The transit authority spokesperson states a three-year timeline from the start of construction.' },
      { id: 3, difficulty: 'medium', questionType: 'inference',
        text: 'The reporter says the project has been "years in the making." What does this suggest?',
        options: ['A) Construction has already been underway for several years.', 'B) The project was proposed and debated for a long time before approval.', 'C) The city has been building similar projects over many years.', 'D) The project is unusually large compared to other transit plans.'],
        answer: 1, explanation: '"Years in the making" implies a long planning and approval process — not that construction started years ago.' },
      { id: 4, difficulty: 'hard',   questionType: 'vocab_context',
        text: 'The report describes the extension as serving "underserved communities." In context, "underserved" most likely means:',
        options: ['A) Communities that pay lower property taxes.', 'B) Areas where transit options are currently limited or inadequate.', 'C) Neighbourhoods where fewer residents use public transit.', 'D) Districts that have requested transit improvements but been denied.'],
        answer: 1, explanation: '"Underserved" in urban planning refers to areas lacking adequate public services — here, areas with limited or no subway access.' },
    ],
  },
  L5: {
    title: 'Panel Discussion — Remote Work Policy',
    instruction: 'You will hear three speakers — a manager, an employee, and a consultant — discussing a new remote work policy. Listen carefully to each person\'s argument.',
    scenario: 'Panel — Workplace Policy',
    type: 'mcq',
    questions: [
      { id: 1, difficulty: 'easy',   questionType: 'speaker_id',
        text: 'Which speaker argues that the policy mainly benefits employee retention?',
        options: ['A) The manager.', 'B) The employee.', 'C) The consultant.', 'D) All three speakers agree on this point.'],
        answer: 0, explanation: 'The manager says the policy was introduced because exit surveys showed flexibility was a major reason employees were leaving — retention is her key argument.' },
      { id: 2, difficulty: 'easy',   questionType: 'mcq',
        text: 'What concern does the employee raise about remote work?',
        options: ['A) The internet connection at home is unreliable.', 'B) Remote work makes it harder to separate work time from personal time.', 'C) Team collaboration suffers when people are not in the same office.', 'D) Remote workers are passed over for promotion.'],
        answer: 1, explanation: 'The employee mentions that working from home has blurred boundaries between personal and work life.' },
      { id: 3, difficulty: 'medium', questionType: 'speaker_id',
        text: 'Which point do the manager and the consultant BOTH make independently?',
        options: ['A) All employees should have the option to work from home full time.', 'B) In-person meetings should be held at least once a month.', 'C) Clear communication guidelines are essential for remote teams to succeed.', 'D) The policy should be reviewed and updated after six months.'],
        answer: 2, explanation: 'Both the manager and consultant independently stress that clear communication protocols are what make remote work effective.' },
      { id: 4, difficulty: 'medium', questionType: 'inference',
        text: 'What can be inferred about the consultant\'s overall position on remote work?',
        options: ['A) He is strongly opposed and believes it should be reversed.', 'B) He is cautiously supportive but emphasises that structure is critical.', 'C) He is neutral and does not express a clear opinion.', 'D) He supports remote work only for managers, not junior staff.'],
        answer: 1, explanation: 'The consultant agrees remote work can work but consistently emphasises communication guidelines — a conditional, structured endorsement.' },
      { id: 5, difficulty: 'hard',   questionType: 'vocab_context',
        text: 'The manager says the policy was driven by "exit survey data." In context, "exit surveys" most likely refers to:',
        options: ['A) Surveys given to clients when they leave the company\'s services.', 'B) Surveys completed by employees when they resign from the company.', 'C) A government survey of businesses exiting the market.', 'D) Surveys of employees when they physically leave the office each day.'],
        answer: 1, explanation: 'Exit surveys (or exit interviews) are conducted with departing employees to understand why they are leaving — a common HR tool.' },
    ],
  },
  L6: {
    title: 'Debate — Should Cities Ban Single-Use Plastics?',
    instruction: 'You will hear two speakers debating whether cities should ban single-use plastics. Speaker A supports the ban; Speaker B opposes it. Listen to each argument carefully.',
    scenario: 'Debate Format — Environmental Policy',
    type: 'mcq',
    questions: [
      { id: 1, difficulty: 'easy',   questionType: 'speaker_id',
        text: 'Which speaker argues that the current recycling system has largely failed in practice?',
        options: ['A) Speaker A.', 'B) Speaker B.', 'C) Both speakers make this argument.', 'D) Neither — both believe recycling works if done correctly.'],
        answer: 0, explanation: 'Speaker A\'s key argument is that most single-use plastics are labelled recyclable but end up in landfill — the recycling system fails in practice.' },
      { id: 2, difficulty: 'easy',   questionType: 'mcq',
        text: 'What is Speaker B\'s main concern about banning single-use plastics?',
        options: ['A) Reusable bags are unhygienic in food service settings.', 'B) The ban would place an unfair financial burden on low-income consumers.', 'C) Plastic alternatives are more expensive to manufacture.', 'D) The government does not have authority to regulate packaging.'],
        answer: 1, explanation: 'Speaker B argues that low-income households rely on cheap single-use products and a ban disproportionately affects them.' },
      { id: 3, difficulty: 'medium', questionType: 'inference',
        text: 'When Speaker B says a ban is a "blunt instrument," what does this suggest about his view?',
        options: ['A) He believes bans are ineffective because they are difficult to enforce.', 'B) He thinks the ban is too broad and does not target the actual problem precisely.', 'C) He feels the ban would hurt businesses more than consumers.', 'D) He is suggesting that physical force may be required to implement it.'],
        answer: 1, explanation: 'A "blunt instrument" is a policy metaphor meaning a solution that lacks precision — it affects too many things indiscriminately rather than targeting the actual problem.' },
      { id: 4, difficulty: 'medium', questionType: 'speaker_id',
        text: 'What do BOTH speakers agree on?',
        options: ['A) An outright ban is the most effective solution to the plastic problem.', 'B) Consumer education alone is insufficient to solve the plastic crisis.', 'C) Businesses should voluntarily reduce plastic packaging without regulation.', 'D) The issue requires more scientific research before any action is taken.'],
        answer: 1, explanation: 'Both acknowledge that relying on consumers alone — without structural change — is not enough to address the problem, even though they disagree on the solution.' },
      { id: 5, difficulty: 'hard',   questionType: 'vocab_context',
        text: 'Speaker A says the recycling label has become "more symbol than system." This phrase means:',
        options: ['A) The recycling logo is too small to be seen on most packaging.', 'B) The recycling process works well but is poorly communicated to consumers.', 'C) The recycling label suggests action but the actual system is not functioning effectively.', 'D) Companies use recycling symbols as a marketing tool with no legal obligation.'],
        answer: 2, explanation: 'The phrase means the label has become performative — it gives the impression of environmental responsibility without the actual result of recycling occurring.' },
    ],
  },
}

/* ══════════════════════════════════════════════════════════════
   READING — sample practice sets
══════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════
   READING — static fallback sets  (DB sets are primary)
   These mirror 4 real CELPIP Reading sub-task styles:
     R1 — Correspondence (email/letter)
     R2 — Diagram/Apply Information (schedule, chart)
     R3 — Information (expository passage — paragraph matching)
     R4 — Viewpoints (two opinion texts)
   Question types used:
     'tone_purpose'   — What is the tone / purpose of the text?
     'mcq'            — Standard comprehension
     'inference'      — What does this imply / suggest?
     'vocab_context'  — What does this word/phrase mean here?
     'fill_blank'     — Choose the word that fits the blank
     'paragraph_match'— Which paragraph (A–D / Not Given) contains this?
     'speaker_id'     — What is Speaker A's / B's position?
══════════════════════════════════════════════════════════════ */
const READING_SETS = {
  R1: {
    title: 'Email — Fitness Centre Membership Request',
    instruction: 'Read the email exchange below, then answer the questions that follow.',
    scenario: 'Customer Service — Membership Correspondence',
    type: 'mcq',
    passage: `From: Sarah Chen <sarah.chen@email.com>
To: memberships@fitnesselite.ca
Date: March 15, 2025
Subject: Student Membership Inquiry

Hello,

I am a full-time student at Westlake University and am interested in joining your fitness centre. I noticed your website mentions a student discount for annual memberships. Could you please provide information about the following:

1. What is the current price for a student annual membership?
2. What documents are required to verify my student status?
3. Are there any waiting periods or setup fees?
4. Does the membership include access to all classes and facilities, or are some services additional?

I am particularly interested in the yoga and strength training programs. I am flexible with my schedule and can train early mornings or evenings.

Thank you for your prompt response.

Best regards,
Sarah Chen
Phone: 604-555-0123

---

From: memberships@fitnesselite.ca
To: Sarah Chen <sarah.chen@email.com>
Date: March 16, 2025
Subject: RE: Student Membership Inquiry

Hi Sarah,

Thank you for reaching out! We are delighted that you are interested in joining Fitness Elite.

Here are the answers to your questions:

1. Our student annual membership is **CA$199** (regular annual is CA$349). This includes unlimited access to all facilities and group classes.
2. We accept a valid student ID or a dated letter from your registrar's office as proof of enrolment.
3. There is a **one-time CA$30 registration fee**, but no waiting period — you can start immediately upon completion of your membership agreement.
4. Yes, all classes and facilities are included — yoga, strength training, cycling, swimming, and personal training consultations are all covered.

Our yoga program runs Monday, Wednesday, and Friday mornings at 9:00 AM, and also Tuesday and Thursday evenings at 6:30 PM. Strength training is available daily at various times — our front desk staff can show you the full schedule when you visit.

We also offer a free fitness assessment and one complimentary personal training session to all new members.

If you have any further questions or would like to visit our facility before committing, please let us know. We look forward to welcoming you to Fitness Elite.

Best regards,
Marcus Webb
Membership Director
Fitness Elite
membership@fitnesselite.ca | 604-555-0199`,
    questions: [
      { id: 1, difficulty: 'easy',   questionType: 'gist',
        text: 'What is the main purpose of Sarah\'s email?',
        options: ['A) To complain about the high cost of the membership.', 'B) To request information about the student discount and membership details.', 'C) To cancel her fitness centre membership.', 'D) To schedule a personal training session.'],
        answer: 1, explanation: 'Sarah explicitly states she is interested in joining and asks for specific information about pricing, verification documents, fees, and what is included.' },
      { id: 2, difficulty: 'easy',   questionType: 'detail',
        text: 'How much does the annual student membership cost at Fitness Elite?',
        options: ['A) CA$30', 'B) CA$149', 'C) CA$199', 'D) CA$349'],
        answer: 2, explanation: 'Marcus clearly states in his response: "Our student annual membership is CA$199 (regular annual is CA$349)."' },
      { id: 3, difficulty: 'easy',   questionType: 'mcq',
        text: 'What documents can Sarah use to verify her student status?',
        options: ['A) Only a valid student ID card.', 'B) Only a letter from her university registrar.', 'C) Either a student ID or a dated letter from the registrar\'s office.', 'D) A bank statement or proof of address.'],
        answer: 2, explanation: 'Marcus states: "We accept a valid student ID or a dated letter from your registrar\'s office as proof of enrolment."' },
      { id: 4, difficulty: 'medium', questionType: 'inference',
        text: 'Sarah is "flexible with her schedule and can train early mornings or evenings." Based on the yoga schedule provided, when could Sarah attend?',
        options: ['A) Only on Monday, Wednesday, or Friday mornings.', 'B) Only on Tuesday or Thursday evenings.', 'C) Either Monday/Wednesday/Friday mornings or Tuesday/Thursday evenings.', 'D) Any time during the week since yoga is offered daily.'],
        answer: 2, explanation: 'The email specifies yoga runs "Monday, Wednesday, and Friday mornings at 9:00 AM, and also Tuesday and Thursday evenings at 6:30 PM." Sarah can fit either schedule.' },
      { id: 5, difficulty: 'medium', questionType: 'detail',
        text: 'According to the reply, what is the total cost for Sarah to begin her membership immediately?',
        options: ['A) CA$199', 'B) CA$229', 'C) CA$349', 'D) CA$379'],
        answer: 1, explanation: 'The student membership is CA$199, plus a one-time CA$30 registration fee, totalling CA$229. However, the question asks for the membership cost itself, which is CA$199. (Or CA$229 total — context matters; answer key: CA$199 for just membership, but if asking total cost to start, CA$229.)' },
      { id: 6, difficulty: 'hard',   questionType: 'vocab_context',
        text: 'Marcus says the fitness centre is "delighted that you are interested." In this context, why would the centre use this word choice?',
        options: ['A) To express concern that Sarah may be unhappy.', 'B) To show genuine enthusiasm and make the customer feel welcomed.', 'C) To indicate that most students do not join.', 'D) To suggest Sarah should hurry before the offer expires.'],
        answer: 1, explanation: '"Delighted" conveys warmth and genuine pleasure at her interest — it is a tone-of-voice strategy to make her feel valued as a potential member.' },
      { id: 7, difficulty: 'medium', questionType: 'inference',
        text: 'What does Marcus mean when he says, "If you have any further questions or would like to visit our facility before committing, please let us know"?',
        options: ['A) He is suggesting Sarah should not join without visiting first.', 'B) He is inviting Sarah to experience the facility to help her make an informed decision.', 'C) He is discouraging her from joining online.', 'D) He is implying the facility may not meet her expectations.'],
        answer: 1, explanation: 'The offer to visit "before committing" is a customer-friendly gesture allowing Sarah to see the facility in person and feel confident in her decision.' },
      { id: 8, difficulty: 'medium', questionType: 'detail',
        text: 'Which of the following is NOT mentioned as included in Sarah\'s membership?',
        options: ['A) Unlimited yoga classes.', 'B) Access to the swimming pool.', 'C) Strength training.', 'D) Sauna and massage therapy services.'],
        answer: 3, explanation: 'Marcus lists yoga, strength training, cycling, swimming, and personal training consultations as included. Sauna and massage are never mentioned.' },
      { id: 9, difficulty: 'hard',   questionType: 'inference',
        text: 'Why might Fitness Elite offer new members "a free fitness assessment and one complimentary personal training session"?',
        options: ['A) To increase their revenue by charging for additional sessions.', 'B) To help new members start safely and feel supported in their fitness journey.', 'C) To demonstrate that their facilities are overcrowded with trainers.', 'D) To replace the need for a gym orientation.'],
        answer: 1, explanation: 'These complimentary services help new members get started on the right foot — personalised guidance builds confidence and increases retention.' },
      { id: 10, difficulty: 'hard', questionType: 'tone_purpose',
        text: 'What is Marcus\'s overall tone in his response to Sarah?',
        options: ['A) Dismissive and unhelpful.', 'B) Professional yet overly formal and cold.', 'C) Warm, helpful, and customer-focused.', 'D) Skeptical and cautious.'],
        answer: 2, explanation: 'Words like "delighted," thorough answers to all her questions, additional offerings, and an invitation to visit all signal a warm, customer-focused tone.' },
      { id: 11, difficulty: 'hard', questionType: 'detail',
        text: 'Based on the email exchange, what can we infer Sarah is expected to do NEXT?',
        options: ['A) Pay the CA$199 membership fee immediately online.', 'B) Provide her student ID or a letter from her registrar\'s office and then visit the facility to complete the registration process.', 'C) Contact Marcus to schedule a specific personal training session.', 'D) Attend a mandatory orientation class before using the facilities.'],
        answer: 1, explanation: 'Sarah would need to verify her student status (with the documents Marcus listed) and then visit the facility to complete the membership agreement and pay the fees.' },
    ],
  },
  R2: {
    title: 'Community Centre — Spring Fitness Schedule',
    instruction: 'Read the passage and the schedule table below. Then answer the questions by choosing the option that BEST matches the information provided.',
    scenario: 'Community Centre — Applying Diagram Information',
    type: 'mcq',
    passage: `The Riverside Community Centre has updated its weekly fitness schedule for the spring season. Yoga classes run on Monday and Wednesday mornings from 9:00 AM to 10:00 AM. The aquatic fitness class for seniors is offered Tuesday and Thursday afternoons from 2:00 PM to 3:00 PM. Indoor cycling is available Monday through Friday at 6:00 PM. All classes require advance registration, which can be completed online or at the front desk.

Note: The pool will be closed for maintenance on Thursday, April 10th. The aquatic fitness class on that date will be replaced by a chair yoga session in Room 2.

SCHEDULE — Week of April 7–11:
┌──────────────┬──────────────────────────────────────────────────────┐
│ Mon Apr 7    │ Yoga (9 AM)  ·  Indoor Cycling (6 PM)               │
│ Tue Apr 8    │ Aquatic Fitness – Pool (2 PM)  ·  Indoor Cycling (6 PM) │
│ Wed Apr 9    │ Yoga (9 AM)  ·  Indoor Cycling (6 PM)               │
│ Thu Apr 10   │ Chair Yoga – Room 2 (2 PM)  ·  Indoor Cycling (6 PM) │
│ Fri Apr 11   │ Indoor Cycling (6 PM)                               │
└──────────────┴──────────────────────────────────────────────────────┘`,
    questions: [
      { id: 1, difficulty: 'easy',   questionType: 'mcq',
        text: 'A senior resident wants to attend an aquatic fitness class this week. Which day should she register for?',
        options: ['A) Monday, April 7', 'B) Tuesday, April 8', 'C) Thursday, April 10', 'D) Friday, April 11'],
        answer: 1, explanation: 'Aquatic Fitness runs Tuesdays and Thursdays. On Thursday April 10 the pool is closed and the session is replaced by Chair Yoga — so Tuesday April 8 is the only aquatic fitness option that week.' },
      { id: 2, difficulty: 'easy',   questionType: 'mcq',
        text: 'How many different classes are offered on Wednesday, April 9?',
        options: ['A) One', 'B) Two', 'C) Three', 'D) Four'],
        answer: 1, explanation: 'Wednesday lists Yoga at 9 AM and Indoor Cycling at 6 PM — exactly two classes.' },
      { id: 3, difficulty: 'easy',   questionType: 'mcq',
        text: 'Why is the aquatic fitness class replaced on Thursday, April 10?',
        options: ['A) The instructor is unavailable that day.', 'B) The pool is closed for maintenance.', 'C) Enrolment was too low to justify the class.', 'D) A special event is taking place in the pool area.'],
        answer: 1, explanation: 'The notice explicitly states the pool will be closed for maintenance on April 10, which is why the aquatic class is replaced.' },
      { id: 4, difficulty: 'medium', questionType: 'fill_blank',
        text: 'According to the passage, all classes require advance ___ which can be completed ___ or at the front desk.',
        options: ['A) registration … online', 'B) payment … in person', 'C) confirmation … by phone', 'D) booking … by email'],
        answer: 0, explanation: 'The passage states: "All classes require advance registration, which can be completed online or at the front desk."' },
      { id: 5, difficulty: 'hard',   questionType: 'inference',
        text: 'A resident signs up for the Thursday 2 PM class on April 10 and arrives expecting a pool workout. What is most likely to happen?',
        options: ['A) He will find the pool class running as normal.', 'B) He will find a Chair Yoga session in Room 2 instead.', 'C) He will be told all Thursday classes are cancelled.', 'D) He will be redirected to Tuesday\'s aquatic fitness class.'],
        answer: 1, explanation: 'The schedule replaces the Thursday aquatic session with Chair Yoga in Room 2 for that specific week due to pool maintenance.' },
    ],
  },
  R3: {
    title: 'Digital Literacy in Canadian Schools — A Growing Priority',
    instruction: 'Read the passage carefully. Answer the questions by selecting the option that BEST answers the question based on the information provided.',
    scenario: 'Informational Passage — Education & Technology',
    type: 'mcq',
    passage: `[A] Digital literacy — the ability to find, evaluate, and communicate information using digital technology — has become a core expectation in Canadian schools. Yet despite widespread access to computers and internet in Canadian classrooms, many students graduate without mastering foundational digital skills. A 2024 study by the Canadian Education Association found that only 68% of secondary school students could reliably evaluate the credibility of online sources, and fewer than half could identify sponsored or biased content in their social media feeds.

[B] The challenge lies partly in curriculum design. Most provincial education ministries have integrated digital literacy into existing subjects rather than establishing it as a standalone discipline. While this approach avoids creating yet another course, it often results in spotty, inconsistent coverage. A student might learn to use spreadsheets in math class but never learn basic password hygiene or how to recognize phishing attempts — critical skills in an increasingly connected world.

[C] Teachers themselves often lack formal training in digital literacy pedagogy. Many educators grew up in analog environments and, despite using technology in the classroom, may not understand how to teach the critical thinking skills required to navigate an online landscape. Professional development programs exist, but they are often poorly funded and reach only a fraction of the teaching workforce.

[D] Some provinces have begun to address this gap. British Columbia introduced a dedicated Digital Literacy requirement in its 2023 curriculum overhaul, while Ontario has incorporated media literacy across multiple grade levels. These efforts represent a shift toward more intentional, systematic instruction — but without consistent national standards, students in provinces that have not prioritized digital literacy remain at a disadvantage.

[E] The long-term stakes are significant. Students who graduate without digital literacy skills will struggle in post-secondary education and the modern workforce, where digital competence is assumed rather than taught. Investment in teacher training, curriculum development, and consistent standards is not optional — it is a critical responsibility of the education system.`,
    questions: [
      { id: 1, difficulty: 'easy',   questionType: 'gist',
        text: 'What is the main purpose of this passage?',
        options: ['A) To argue that computers should not be used in schools.', 'B) To identify the problem of insufficient digital literacy instruction and discuss efforts to address it.', 'C) To praise British Columbia\'s education system.', 'D) To explain why teachers reject professional development training.'],
        answer: 1, explanation: 'The passage identifies digital literacy gaps (A, B, C), describes why they exist, and highlights provincial efforts to address the problem (D, E) — B captures this overall purpose.' },
      { id: 2, difficulty: 'easy',   questionType: 'detail',
        text: 'According to the 2024 Canadian Education Association study mentioned in paragraph A, what percentage of secondary school students CANNOT reliably evaluate online source credibility?',
        options: ['A) 32%', 'B) 50%', 'C) 68%', 'D) Over 75%'],
        answer: 0, explanation: 'The passage states "only 68% of secondary school students could reliably evaluate the credibility of online sources" — meaning 32% cannot.' },
      { id: 3, difficulty: 'easy',   questionType: 'mcq',
        text: 'According to paragraph B, why is inconsistent digital literacy instruction a problem?',
        options: ['A) It increases the cost of education per student.', 'B) It creates gaps where students may learn some skills but miss critical others.', 'C) Teachers are not willing to integrate digital literacy.', 'D) Technology companies refuse to provide resources to schools.'],
        answer: 1, explanation: 'The passage notes that by integrating digital literacy into existing subjects rather than as standalone instruction, students get spotty coverage — a spreadsheet user might not learn password safety.' },
      { id: 4, difficulty: 'medium', questionType: 'vocab_context',
        text: 'In paragraph C, the word "spotty" means most nearly the same as:',
        options: ['A) Visible', 'B) Irregular or incomplete', 'C) Contaminated', 'D) Covered with patterns'],
        targetWord: 'spotty',
        answer: 1, explanation: '"Spotty" in this context means coverage that is scattered and incomplete — "inconsistent and uneven across different locations" — not "contaminated".' },
      { id: 5, difficulty: 'medium', questionType: 'inference',
        text: 'Why does the author mention that teachers "grew up in analog environments"?',
        options: ['A) To suggest that older teachers should retire immediately.', 'B) To imply that teachers are resistant to change.', 'C) To explain why teachers may lack the instinctive understanding of digital literacy that younger people have.', 'D) To criticize teachers for not investing in their own education.'],
        answer: 2, explanation: 'The author is explaining that because teachers learned in pre-digital eras, they may not intuitively understand digital culture — hence their need for formal training in digital pedagogy.' },
      { id: 6, difficulty: 'medium', questionType: 'detail',
        text: 'Which TWO provinces are mentioned as having taken concrete action on digital literacy curriculum?',
        options: ['A) Ontario and Quebec', 'B) British Columbia and Ontario', 'C) British Columbia and Alberta', 'D) Alberta and Saskatchewan'],
        answer: 1, explanation: 'Paragraph D specifically names BC (introduced dedicated Digital Literacy in 2023) and Ontario (incorporated media literacy across grade levels). The other provinces are not mentioned.' },
      { id: 7, difficulty: 'hard',   questionType: 'inference',
        text: 'What does the author mean by saying digital competence in post-secondary and the workforce is "assumed rather than taught"?',
        options: ['A) Nobody needs to learn digital skills in university or at work.', 'B) Universities and employers expect students and employees to already possess digital skills, rather than providing training.', 'C) Teachers in universities are better at teaching digital skills than high school teachers.', 'D) Digital skills are less important in university than in K–12 education.'],
        answer: 1, explanation: '"Assumed" means taken for granted as already present. The author is saying universities and employers expect digital literacy as a prerequisite, not something they will teach.' },
      { id: 8, difficulty: 'hard',   questionType: 'tone_purpose',
        text: 'What is the author\'s tone regarding Canada\'s current state of digital literacy education?',
        options: ['A) Enthusiastically optimistic about recent progress.', 'B) Dismissive of efforts by teachers and school boards.', 'C) Concerned about gaps but hopeful about emerging solutions.', 'D) Angry and accusatory toward provincial governments.'],
        answer: 2, explanation: 'The author identifies serious problems (gaps, inconsistency, teacher training issues) but also notes provincial progress (BC, Ontario). The tone is urgent but not hostile — concerned and solution-oriented.' },
      { id: 9, difficulty: 'hard',   questionType: 'inference',
        text: 'The author\'s statement in paragraph E that "investment in teacher training, curriculum development, and consistent standards is not optional" most likely means:',
        options: ['A) Schools can choose to invest in these areas or not, depending on budget.', 'B) Investment should be voluntary and left to individual teachers.', 'C) These investments are essential and necessary if schools want to serve their students well.', 'D) The government should restrict schools from spending on digital literacy.'],
        answer: 2, explanation: '"Not optional" means essential, non-negotiable, mandatory — the author is arguing this investment is a moral and practical necessity, not a nice-to-have.' },
    ],
  },
  R4: {
    title: 'Should AI-Generated Content Be Regulated in Schools? — Two Viewpoints',
    instruction: 'Two speakers have different opinions on this topic. Answer questions by identifying which speaker(s) support the given statement, or by selecting the BEST answer based on the passage.',
    scenario: 'Two Viewpoints — Education & AI Ethics',
    type: 'mcq',
    passage: `SPEAKER A — Dr. Catherine Liu, Education Policy Researcher

I strongly support regulatory frameworks for AI-generated content in schools. We're at a critical juncture: tools like ChatGPT and Claude are becoming ubiquitous, and without clear guidelines, we're essentially conducting an uncontrolled experiment on young minds. First, there's the plagiarism and academic integrity issue. If students can download a five-paragraph essay in thirty seconds, how do teachers assess learning? But the integrity problem pales next to the deeper issue of critical thinking. When AI systems can instantly generate plausible-sounding answers to complex questions, students lose the struggle that generates learning. Struggle is uncomfortable, but it's where learning lives.

Second, AI systems contain significant biases embedded in their training data. They reflect historical inequities and can reinforce stereotypes. For instance, an AI trained on English-language internet content disproportionately represents Western perspectives and marginalizes non-Western voices. Should we be deploying systems that subtly train students to accept a narrow, culturally biased worldview? Third, AI companies profit immensely from user data and content. When students use free AI tools in school, they're generating training data that makes these companies richer. That's an ethical problem we should address.

Regulation doesn't mean banning AI. It means establishing clear standards: transparent disclosure of AI use, guardrails on what content is permitted, mandatory labelling of AI-generated materials, and audits to ensure tools used in schools meet equity and bias standards. We regulate pharmaceuticals, aviation, and automobiles because the stakes are high. Education deserves the same level of scrutiny.

SPEAKER B — James Chen, Technology Integration Specialist

I understand Dr. Liu's concerns, but regulation at this stage would be counterproductive and frankly impossible to enforce. Let me address the issues in order. First, on plagiarism: that's a teaching and assessment problem, not a technology problem. For decades, students could copy from Wikipedia, and good teachers adapted by requiring process documentation, in-class writing, and other methods that prove learning. Smart educators are already doing the same with AI — asking students to use ChatGPT as a brainstorming partner, then produce original analysis. The tool itself isn't the enemy; it's a catalyst for rethinking assessment.

On bias: yes, AI systems have biases, but so do human teachers, textbooks, and curricula. The solution isn't regulation; it's transparency and critical evaluation. When students use AI, they can be taught to interrogate the system's assumptions and compare its outputs against diverse sources. That's actually a valuable exercise in critical thinking — learning to work alongside an imperfect tool. Regulatory frameworks, by contrast, create the illusion of safety without addressing the underlying problem.

Third, regarding data privacy: I agree it's important, but it's separate from education. We should have strong data protection laws (and I support GDPR-style regulation), but restricting educational use because of corporate data harvesting is like banning electricity in schools because power companies collect billing data. The solution is data regulation, not AI restriction in education.

Here's the deeper issue: the world students will enter is AI-saturated. Banning or heavily restricting AI in schools is training them for a world that won't exist. We should be teaching them to use AI safely, critically, and ethically — and that requires exposure, not restriction. Some schools are doing this brilliantly: creating AI literacy curricula, having students audit AI systems for bias, using AI to personalize learning for students with different needs. These schools are preparing students for reality.

Regulation will slow innovation and hand competitive advantage to wealthy schools that can navigate bureaucracy. Poorer schools will be locked out. The path forward is transparency, teacher training, and ethical frameworks — not regulatory gatekeeping.`,
    questions: [
      { id: 1, difficulty: 'easy',   questionType: 'speaker_view',
        text: 'Which speaker advocates for REGULATION of AI-generated content in schools?',
        options: ['A) Dr. Catherine Liu', 'B) James Chen', 'C) Both speakers agree on this point', 'D) Neither speaker addresses this issue'],
        answer: 0, explanation: 'Dr. Liu explicitly states: "I strongly support regulatory frameworks for AI-generated content in schools." James Chen argues regulation would be "counterproductive."' },
      { id: 2, difficulty: 'easy',   questionType: 'speaker_view',
        text: 'What is James Chen\'s main position on the plagiarism problem with AI?',
        options: ['A) It is impossible to solve', 'B) It is a teaching and assessment problem, not a technology problem', 'C) Schools should ban AI to prevent plagiarism', 'D) Teachers cannot adapt to AI tools'],
        answer: 1, explanation: 'Chen states: "that\'s a teaching and assessment problem, not a technology problem" and notes that good educators are "adapting by requiring process documentation, in-class writing."' },
      { id: 3, difficulty: 'easy',   questionType: 'detail',
        text: 'According to Dr. Liu, what is one reason AI systems in schools pose an ethical problem?',
        options: ['A) Students cannot use them correctly', 'B) Teachers cannot supervise their use', 'C) AI companies profit from user data and content generated by students', 'D) AI is too expensive for schools'],
        answer: 2, explanation: 'Dr. Liu states: "When students use free AI tools in school, they\'re generating training data that makes these companies richer. That\'s an ethical problem we should address."' },
      { id: 4, difficulty: 'easy',   questionType: 'detail',
        text: 'What does James Chen suggest as an example of a subject where students have always had access to copyable information?',
        options: ['A) Mathematics textbooks', 'B) Wikipedia', 'C) Scientific journals', 'D) Government policy documents'],
        answer: 1, explanation: 'Chen states: "For decades, students could copy from Wikipedia, and good teachers adapted by requiring process documentation, in-class writing, and other methods."' },
      { id: 5, difficulty: 'medium', questionType: 'vocab_context',
        text: 'In her opening paragraph, Dr. Liu uses the word "scrutiny" to mean:',
        options: ['A) Marketing or promotion', 'B) Close and careful examination', 'C) Restriction or limitation', 'D) Investment or funding'],
        targetWord: 'scrutiny',
        answer: 1, explanation: '"We regulate pharmaceuticals, aviation, and automobiles because the stakes are high. Education deserves the same level of scrutiny" — here, scrutiny means careful, rigorous oversight and evaluation.' },
      { id: 6, difficulty: 'medium', questionType: 'mcq',
        text: 'On the issue of bias in AI systems, how do Dr. Liu and James Chen DIFFER?',
        options: ['A) Dr. Liu acknowledges bias exists; Chen denies it', 'B) Dr. Liu wants regulation to address bias; Chen suggests teaching students to critically evaluate AI output', 'C) Chen believes bias is solved through transparency; Dr. Liu does not', 'D) Chen supports all AI use; Dr. Liu opposes all AI use'],
        answer: 1, explanation: 'Dr. Liu: regulate systems and audit for bias standards. Chen: teach students to interrogate assumptions and compare against diverse sources. Both acknowledge bias, but differ on the solution.' },
      { id: 7, difficulty: 'medium', questionType: 'inference',
        text: 'Why does James Chen compare AI regulation to "banning electricity in schools because power companies collect billing data"?',
        options: ['A) To suggest that all technology should be banned', 'B) To argue that data privacy is not important', 'C) To show that the problem (data harvesting) is separate from the solution (education)',  'D) To prove that electricity is more important than AI'],
        answer: 2, explanation: 'Chen is drawing an analogy: just as we don\'t ban electricity because of data privacy concerns (the issue is data regulation, not electricity), we shouldn\'t ban AI in schools. The real problem is data protection law, not AI restriction.' },
      { id: 8, difficulty: 'hard',   questionType: 'tone_purpose',
        text: 'What is the tone of Dr. Liu\'s statement: "Struggle is uncomfortable, but it\'s where learning lives"?',
        options: ['A) Pessimistic and defeatist', 'B) Reflective and philosophical', 'C) Angry and accusatory', 'D) Sarcastic and dismissive'],
        answer: 1, explanation: 'The statement is thoughtful and poetic — Dr. Liu is offering a philosophical insight about the nature of learning, acknowledging difficulty but affirming its value. The tone is measured and wise, not emotional.' },
      { id: 9, difficulty: 'hard',   questionType: 'inference',
        text: 'Which of the following is an implied criticism in James Chen\'s argument?',
        options: ['A) AI systems are not accurate enough for education', 'B) Dr. Liu\'s regulatory approach could create inequity by disadvantaging poorer schools', 'C) Teachers are unwilling to adapt their teaching methods', 'D) Technology companies should have more power in schools'],
        answer: 1, explanation: 'Chen states: "Regulation will slow innovation and hand competitive advantage to wealthy schools that can navigate bureaucracy. Poorer schools will be locked out." This is an implied critique of Dr. Liu\'s regulatory approach.' },
      { id: 10, difficulty: 'hard',   questionType: 'inference',
        text: 'If Dr. Liu\'s recommendations were implemented, what kind of schools would be BEST POSITIONED to comply?',
        options: ['A) Rural schools with limited budgets', 'B) Well-funded schools with compliance and IT resources', 'C) Schools with the least AI usage', 'D) All schools equally, regardless of size or funding'],
        answer: 1, explanation: 'Regulations require infrastructure, auditing, documentation, and expertise. Well-funded schools can hire consultants and implement compliance systems more easily than underfunded schools — consistent with why Chen views regulation as problematic for equity.' },
    ],
  },
}

/* ══════════════════════════════════════════════════════════════
   WRITING — 20 W1 (email) + 20 W2 (survey) questions
   W1 sorted easy → hard (Q1 easiest, Q20 hardest)
   W2 difficulty is randomised (random order, same pool)
══════════════════════════════════════════════════════════════ */

const W1_QUESTIONS = [
  // ── 1 (easy) ──────────────────────────────────────────────────────────
  {
    id: 'w1_1', num: 1, section: 'W1', difficulty: 'easy',
    title: 'Lost Package – Neighbour',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Informal Email — Neighbourly Request',
    prompt: `You recently ordered an important package online. The tracking system shows it was delivered to your neighbour's address by mistake three days ago. You have not been able to reach the neighbour by knocking on the door.

Write an email to your neighbour. In your email:`,
    bulletPoints: [
      'Explain what happened with the package',
      'Describe the package so they can identify it',
      'Ask them to contact you and say how they can reach you',
    ],
    tone: 'Informal — writing to a neighbour you do not know well',
    criteria: ['Address all 3 bullet points', 'Polite, informal tone', 'Natural vocabulary', 'Clear structure'],
    modelAnswer: `Hi,

I hope this message finds you well. My name is Alex Chen and I live next door at number 42. I am writing because I believe a package of mine may have been delivered to your address by mistake.

I ordered a pair of running shoes last week and the tracking information shows the parcel was delivered three days ago — but I never received it. The package is a medium-sized brown cardboard box with a blue shipping label from SportZone Canada.

I would really appreciate it if you could let me know whether you received a box like this. You can reach me by phone at 416-555-0182 or simply knock on my door anytime after 5:00 PM on weekdays.

Thank you so much for your help!

Best regards,
Alex`,
  },

  // ── 2 (easy) ──────────────────────────────────────────────────────────
  {
    id: 'w1_2', num: 2, section: 'W1', difficulty: 'easy',
    title: 'Thank You – Farewell Gift',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Informal Email — Thank You',
    prompt: `Your coworkers organised a farewell party for you and gave you a gift before your last day at work. You want to thank one close coworker in particular who you know organised most of it.

Write an email to your coworker. In your email:`,
    bulletPoints: [
      'Thank them for organising the party and the gift',
      'Share one specific memory from the party you enjoyed',
      'Say you hope to stay in touch and suggest how',
    ],
    tone: 'Informal — writing to a close friend at work',
    criteria: ['Address all 3 bullet points', 'Warm, friendly tone', 'Genuine and personal', 'Clear flow'],
    modelAnswer: `Hi Priya,

I just wanted to reach out and say a huge thank you for organising yesterday's farewell party. I had absolutely no idea you had been planning it, and I was genuinely touched by everyone's effort.

The speech you gave was my favourite part — it made me laugh and nearly cry at the same time. I will definitely hold onto that memory for a long time.

The photo book you all put together is something I will treasure. Every time I look at it, I'll think of the amazing team I had the privilege to work with.

I really hope we can stay in touch. I'd love to grab coffee sometime — I'll message you on WhatsApp to set something up once I've settled into the new role.

Thank you again for everything. You made my last day truly special.

Take care,
Alex`,
  },

  // ── 3 (easy) ──────────────────────────────────────────────────────────
  {
    id: 'w1_3', num: 3, section: 'W1', difficulty: 'easy',
    title: 'Invite Friend to Community Event',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Informal Email — Invitation',
    prompt: `A friend of yours is visiting your city next weekend. You are helping to organise a neighbourhood barbecue on Saturday afternoon and want to invite your friend.

Write an email to your friend. In your email:`,
    bulletPoints: [
      'Tell them about the barbecue and when and where it is happening',
      'Explain why you think they will enjoy it',
      'Ask them to confirm whether they can attend',
    ],
    tone: 'Informal — writing to a close friend',
    criteria: ['All 3 points addressed', 'Enthusiastic, friendly tone', 'Clear details provided', 'Natural English'],
    modelAnswer: `Hey Marcus!

It's so great that you're coming to visit next weekend — I've been looking forward to it. I wanted to tell you about something happening while you're here: our neighbourhood is having a big barbecue on Saturday afternoon from 2 PM to 7 PM at Riverside Park, just a short walk from my place.

I think you're going to love it. There's going to be live music, homemade food from all the different families in the neighbourhood, and lawn games. It's always a really relaxed and fun afternoon — the kind of thing you can't really find elsewhere.

A few of my friends you've met before will also be there, so it should be a great chance to catch up with everyone.

Let me know if you're in! I'll plan the rest of our weekend around it. Just reply to this email or shoot me a text.

Can't wait to see you!

Sam`,
  },

  // ── 4 (easy) ──────────────────────────────────────────────────────────
  {
    id: 'w1_4', num: 4, section: 'W1', difficulty: 'easy',
    title: 'Noise Complaint – Neighbour',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Polite Complaint — Neighbour',
    prompt: `Your neighbour plays loud music late at night on weeknights, which affects your sleep and your ability to work the next morning. You want to resolve this politely without involving the building management yet.

Write an email to your neighbour. In your email:`,
    bulletPoints: [
      'Explain the problem clearly and when it occurs',
      'Describe how it is affecting you',
      'Ask them to make a change and suggest a reasonable compromise',
    ],
    tone: 'Polite and diplomatic — writing to a neighbour you do not know well',
    criteria: ['3 bullet points addressed', 'Polite without being passive', 'Specific details', 'Ends with a solution'],
    modelAnswer: `Dear Neighbour,

I hope you are well. I am writing because I wanted to speak with you about something that has been affecting me lately, and I hope we can work it out between us.

Over the past few weeks, I have been hearing loud music coming from your apartment on weeknights, typically between 11 PM and 1 AM. I completely understand that everyone has different routines, and I do not want to come across as unreasonable.

The issue is that I start work at 7 AM and the disrupted sleep has been making it really difficult to focus and stay alert. It has also been affecting my overall health.

Would it be possible for you to keep the music at a lower volume after 10 PM on weeknights? I would be more than happy to discuss what works for both of us — weekends are perfectly fine, of course.

Thank you so much for considering this. I appreciate your understanding.

Kind regards,
Unit 304`,
  },

  // ── 5 (easy) ──────────────────────────────────────────────────────────
  {
    id: 'w1_5', num: 5, section: 'W1', difficulty: 'easy',
    title: 'Restaurant Feedback – Positive',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Semi-formal — Positive Customer Feedback',
    prompt: `You recently had a very enjoyable meal at a local restaurant and want to share your positive experience with the restaurant manager.

Write an email to the restaurant manager. In your email:`,
    bulletPoints: [
      'Describe specific things you enjoyed about your experience',
      'Mention one small suggestion for improvement',
      'Say that you plan to return and will recommend the restaurant',
    ],
    tone: 'Semi-formal — positive, polite customer feedback',
    criteria: ['All 3 points addressed', 'Balanced (praise + 1 suggestion)', 'Specific details', 'Professional yet warm'],
    modelAnswer: `Dear Manager,

I am writing to share some feedback from my visit to The Maple Leaf Bistro last Saturday evening. I wanted to take a moment to express how much I enjoyed the experience.

The food was exceptional — particularly the wild mushroom risotto, which was perfectly seasoned and beautifully presented. Our server, James, was attentive without being intrusive, and he made excellent wine recommendations throughout the meal. The warm and inviting atmosphere made it feel like a genuinely special occasion.

My one small suggestion would be to consider adding a vegetarian dessert option to the menu. My dining companion follows a plant-based diet and found the dessert selection a little limited.

Overall, the evening was a wonderful experience and I will absolutely be returning. I have already told several friends about the restaurant and will be recommending it without hesitation.

Thank you for creating such a lovely dining environment. Please pass on my compliments to your kitchen team.

Sincerely,
Sarah Thompson`,
  },

  // ── 6 (easy–intermediate) ─────────────────────────────────────────────
  {
    id: 'w1_6', num: 6, section: 'W1', difficulty: 'easy',
    title: 'School Enrolment Inquiry',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Formal Inquiry — School',
    prompt: `You are moving to a new city in two months and want to enrol your child (currently in Grade 3) in a local elementary school. You have not yet chosen a school.

Write an email to a local school. In your email:`,
    bulletPoints: [
      'Introduce yourself and explain your situation',
      'Ask about the enrolment process and required documents',
      'Ask whether Grade 3 spaces are available and when you should apply',
    ],
    tone: 'Formal — professional inquiry to a school administration',
    criteria: ['All 3 points addressed', 'Formal and professional tone', 'Polite and clear request', 'Logical structure'],
    modelAnswer: `Dear Admissions Team,

My name is James Okafor and I am planning to relocate to Vancouver in approximately two months with my family. I am writing to inquire about enrolling my daughter, Emma, who is currently completing Grade 3, at your school for the upcoming September school year.

I would be grateful if you could provide information about your enrolment process and any documents we will need to prepare. I understand this may include proof of address and immunisation records, but I want to make sure we do not miss any important requirements.

I would also like to know whether Grade 3 spaces are currently available and whether there is a deadline or waiting period I should be aware of. Given our upcoming move, I want to start the process as early as possible to avoid any delays.

Thank you for your time. I look forward to hearing from you and hope we can arrange a call or visit to learn more about your school community.

Best regards,
James Okafor`,
  },

  // ── 7 (intermediate) ──────────────────────────────────────────────────
  {
    id: 'w1_7', num: 7, section: 'W1', difficulty: 'intermediate',
    title: 'Schedule Change Request – Manager',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Formal Email — Workplace Request',
    prompt: `You currently work Monday to Friday, 9 AM to 5 PM. Due to a new family commitment, you need to request a temporary change to your schedule for the next two months.

Write an email to your manager, Ms. Jennifer Watts. In your email:`,
    bulletPoints: [
      'Explain why you need the schedule change and what change you are requesting',
      'Describe how you will ensure your work responsibilities are still met',
      'Thank her and offer to discuss the request further',
    ],
    tone: 'Formal — writing to your direct manager',
    criteria: ['All 3 points addressed', 'Professional and respectful tone', 'Solution-focused', 'Well-structured'],
    modelAnswer: `Dear Ms. Watts,

I am writing to request a temporary adjustment to my work schedule for the next two months, from July 1 to August 31. I recently became my mother's primary caregiver following her surgery, and I need to take her to weekly medical appointments on Wednesday mornings.

I would like to request permission to shift my Wednesday hours to 11 AM – 7 PM rather than my usual 9 AM – 5 PM. All other days would remain unchanged. I have already spoken with my colleague David, who has agreed to cover any client calls during Wednesday mornings, and I will ensure that all my project deliverables are completed ahead of schedule during this period.

I understand this is an unusual request and I am happy to discuss alternative arrangements if you prefer. I am confident I can continue meeting all performance expectations throughout this period.

Thank you for your understanding, Ms. Watts. I would be glad to speak further at a time convenient for you.

Best regards,
Sarah Chen`,
  },

  // ── 8 (intermediate) ──────────────────────────────────────────────────
  {
    id: 'w1_8', num: 8, section: 'W1', difficulty: 'intermediate',
    title: 'Apology to Colleague',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Semi-formal — Professional Apology',
    prompt: `You missed an important project deadline last week because of a personal emergency. Your colleague Alex had to take on extra work to cover for you, which caused them significant stress.

Write an email to your colleague Alex. In your email:`,
    bulletPoints: [
      'Apologise sincerely and briefly explain what happened',
      'Acknowledge the extra work Alex had to do because of you',
      'Offer to help Alex with a future task as a gesture of appreciation',
    ],
    tone: 'Semi-formal — writing to a colleague you know reasonably well',
    criteria: ['All 3 points covered', 'Genuine apology (not excuses)', 'Acknowledges impact on Alex', 'Offers concrete help'],
    modelAnswer: `Hi Alex,

I wanted to write to you directly to apologise for what happened last week. A family emergency meant I had to leave unexpectedly and was unable to complete the quarterly report before the deadline — and I know that put a serious burden on you.

I am truly sorry. You should not have had to pick up my work at such short notice, especially during what I know was already a busy period for your own projects. I can only imagine how stressful it must have been, and I am genuinely grateful that you stepped in the way you did.

I would really like to make it up to you. If there is anything on your current workload that I can help with — whether it is the Henderson proposal or anything coming up next quarter — please just say the word. I am happy to take on extra work to give you some breathing room.

Again, I am really sorry. Thank you for handling the situation with such professionalism.

Best,
Sam`,
  },

  // ── 9 (intermediate) ──────────────────────────────────────────────────
  {
    id: 'w1_9', num: 9, section: 'W1', difficulty: 'intermediate',
    title: 'Follow-Up After Job Interview',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Professional Email — Post-Interview Follow-Up',
    prompt: `You recently completed an interview for a Marketing Coordinator position at a company you are very interested in. You want to follow up with the hiring manager, Mr. Thomas Yuen.

Write an email to Mr. Yuen. In your email:`,
    bulletPoints: [
      'Thank him for his time and the opportunity to interview',
      'Reference one specific thing discussed in the interview that excited you',
      'Reaffirm your interest and offer to provide any additional information',
    ],
    tone: 'Professional and warm — following up after a job interview',
    criteria: ['All 3 points addressed', 'Professional but not stiff', 'Specific reference to the interview', 'Confident and genuine'],
    modelAnswer: `Dear Mr. Yuen,

Thank you very much for taking the time to meet with me yesterday afternoon. It was a pleasure learning more about the Marketing Coordinator role at Novex Solutions, and I left the conversation feeling genuinely excited about the opportunity.

In particular, I was energised by our discussion about the upcoming product launch campaign and the company's focus on data-driven storytelling. The approach aligns very closely with the kind of work I have been doing over the past three years, and I believe I could contribute meaningfully to that initiative from day one.

I remain very interested in the position and would welcome the opportunity to join the Novex team. Please do not hesitate to contact me if you need any additional information, references, or work samples to support your decision.

Thank you again for your time and consideration. I look forward to hearing from you.

Best regards,
Michelle Park
416-555-0247 | mpark@email.com`,
  },

  // ── 10 (intermediate) ─────────────────────────────────────────────────
  {
    id: 'w1_10', num: 10, section: 'W1', difficulty: 'intermediate',
    title: 'Gym Membership Cancellation',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Semi-formal — Contract Cancellation Request',
    prompt: `You joined a gym three months ago on a one-year contract. Due to a recent job loss you are experiencing financial hardship and need to cancel your membership. The contract includes a cancellation fee.

Write an email to the gym manager, Mr. Sam Patel. In your email:`,
    bulletPoints: [
      'Explain your situation and why you need to cancel',
      'Reference the contract terms and ask if a fee waiver is possible',
      'Ask for a response within a specific number of days',
    ],
    tone: 'Semi-formal — polite request with personal context',
    criteria: ['All 3 points addressed', 'Respectful, not confrontational', 'Explains circumstances clearly', 'Specific deadline requested'],
    modelAnswer: `Dear Mr. Patel,

I am writing regarding my FitCore membership, account number FC-21847. I am reaching out to request a cancellation of my membership due to a significant change in my financial circumstances.

I recently lost my job and, despite my best efforts, I have not yet been able to secure new employment. As a result, I am no longer able to maintain the monthly fees. I understand my contract includes a cancellation fee, and I am writing to ask whether FitCore would be willing to waive this fee given my current situation. I have been a committed member since January and have always paid on time.

I would be very grateful for your consideration and would be happy to provide documentation of my employment status if required.

Could you please provide a response by Friday, July 18th, so I can plan my finances accordingly?

Thank you for your understanding and for the excellent service I have received during my time as a member.

Sincerely,
Rachel Wong`,
  },

  // ── 11 (intermediate) ─────────────────────────────────────────────────
  {
    id: 'w1_11', num: 11, section: 'W1', difficulty: 'intermediate',
    title: 'Condo Board – Outdoor Area Improvements',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Formal Email — Resident to Condo Board',
    prompt: `You represent a group of 15 residents in your condominium building. The outdoor common area — including benches, lighting, and the children's play area — has been neglected and needs improvements.

Write an email to the condo board president, Ms. Sandra Lee. In your email:`,
    bulletPoints: [
      'Describe the current problems with the outdoor common area',
      'Explain why these improvements matter to residents',
      'Propose two specific improvements and request a meeting to discuss',
    ],
    tone: 'Formal — representing a group of residents to a governance body',
    criteria: ['All 3 points addressed', 'Professional and constructive', 'Specific proposals', 'Clear ask for next steps'],
    modelAnswer: `Dear Ms. Lee,

I am writing on behalf of fifteen residents in our building to raise a concern about the state of our outdoor common area, which has been deteriorating over recent months.

Specifically, three of the four benches have broken armrests, the pathway lighting near the north entrance has not been functioning since March, and several play structures in the children's area have sharp edges and rusted joints that pose a safety risk. We have documented these issues with photographs, which we would be happy to share.

The outdoor space is particularly important to families with young children and to older residents who rely on it for daily walks. A well-maintained space also enhances property values for all unit owners.

We would like to propose two immediate improvements: the repair of all pathway lighting as a safety priority, and the replacement of the damaged play structures. We would be grateful for the opportunity to discuss a timeline and budget at your earliest convenience.

Would it be possible to arrange a meeting in the coming weeks?

Thank you for your attention to this matter.

Respectfully,
Daniel Torres
Unit 217 (on behalf of 15 residents)`,
  },

  // ── 12 (intermediate) ─────────────────────────────────────────────────
  {
    id: 'w1_12', num: 12, section: 'W1', difficulty: 'intermediate',
    title: 'Damaged Delivery – Online Retailer Complaint',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Formal Complaint — Online Retailer',
    prompt: `You purchased an item from an online retailer (HomeStyle Direct, order #HS-99217) that arrived damaged. You contacted customer service 10 days ago and have received no response.

Write an email to the customer service manager. In your email:`,
    bulletPoints: [
      'Describe the product and the damage you found when it arrived',
      'Explain your attempts to contact customer service and the lack of response',
      'State clearly what resolution you expect and by what date',
    ],
    tone: 'Formal and assertive — consumer complaint to a business',
    criteria: ['All 3 points addressed', 'Firm but professional tone', 'Specific details and order number', 'Clear resolution demand'],
    modelAnswer: `Dear Customer Service Manager,

I am writing regarding order #HS-99217, placed on June 3rd, for a HomeStyle 6-person dining table (Item Code: HSD-DT-6OAK). When the item was delivered on June 8th, I discovered that the tabletop had a deep crack running across its surface, making it completely unusable.

I contacted HomeStyle Direct's customer service team by phone and through your online portal on June 9th. Despite submitting photographs of the damage and a detailed account of the problem, I have received no response of any kind in the ten days since. This level of service is entirely unacceptable for a purchase of this value.

I am requesting either a full replacement of the item or a complete refund to my original payment method. I ask that this matter be resolved by Friday, June 28th. If I do not receive a satisfactory response by that date, I will escalate this complaint to the Better Business Bureau and my credit card provider.

I expect to hear from you promptly.

Sincerely,
Christine Osei
416-555-0322`,
  },

  // ── 13 (intermediate–advanced) ────────────────────────────────────────
  {
    id: 'w1_13', num: 13, section: 'W1', difficulty: 'intermediate',
    title: 'Thank You to a Mentor',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Warm Professional Email — Gratitude to Mentor',
    prompt: `You are leaving your current company for a new opportunity. Over the past two years, your workplace mentor, Ms. Patricia Lam, has invested significant time helping you develop professionally.

Write an email to Ms. Lam. In your email:`,
    bulletPoints: [
      'Thank her for specific ways she helped you develop',
      'Mention one thing you learned from her that made a real difference to your career',
      'Say you hope to stay in touch and wish her well',
    ],
    tone: 'Warm and personal — sincere professional gratitude',
    criteria: ['All 3 points addressed', 'Personal and genuine (not generic)', 'Specific example or lesson mentioned', 'Graceful closing'],
    modelAnswer: `Dear Ms. Lam,

As I prepare to begin the next chapter of my career, I wanted to take a moment to express my sincere gratitude for everything you have done for me over the past two years.

Your guidance has shaped my professional development in ways I am only beginning to fully appreciate. When I first joined the team, I struggled to communicate complex data clearly to non-technical stakeholders — something you identified early on and patiently helped me address. The advice you gave me about structuring presentations around the audience's needs, not the analyst's knowledge, has stayed with me and genuinely transformed how I approach my work.

Beyond skills, you modelled what it means to lead with both confidence and humility, and I hope to carry that with me into my new role.

I would love to stay connected. If you are ever in the area, I would be glad to meet for coffee. I will also make sure to reach out once I have settled in at the new company.

Thank you for believing in me.

With gratitude and warm regards,
Mei Lin`,
  },

  // ── 14 (intermediate–advanced) ────────────────────────────────────────
  {
    id: 'w1_14', num: 14, section: 'W1', difficulty: 'intermediate',
    title: 'Building Policy – Rooftop Terrace Review',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Formal — Tenant to Property Manager (Advocacy)',
    prompt: `Your building management recently issued a notice banning all personal gatherings on the rooftop terrace. You and several other residents feel this is overly restrictive. You want to request a policy review.

Write an email to the building manager, Mr. Kevin Marsh. In your email:`,
    bulletPoints: [
      "Acknowledge the building management's concern and show understanding",
      'Explain why the rooftop terrace is valued and give examples of responsible use',
      'Propose a reasonable compromise and request a policy review',
    ],
    tone: 'Respectful and constructive — tenant-management dialogue',
    criteria: ['All 3 points addressed', 'Respectful, not confrontational', 'Empathises before advocating', 'Concrete compromise proposed'],
    modelAnswer: `Dear Mr. Marsh,

Thank you for the recent notice regarding rooftop terrace usage. I understand that management has legitimate reasons for wanting to minimise disruption and ensure the space is used appropriately, and I appreciate the effort to maintain a safe and comfortable environment for all residents.

Speaking on behalf of several neighbours, I would like to respectfully ask that the complete ban be reconsidered. The rooftop terrace has been a valued part of our building's community. Most gatherings that take place there are small, quiet, and end well before 9 PM — residents typically use it for family dinners, birthday celebrations with close friends, or simply to enjoy the view.

We understand the concerns and would welcome the introduction of reasonable guidelines rather than an outright ban. For example, a booking system with a maximum guest limit of eight people, a noise curfew of 9:30 PM, and a cleaning responsibility policy might address all of management's concerns while preserving residents' enjoyment.

Could we arrange a brief meeting to discuss this? We are committed to finding a solution that works for everyone.

With respect,
Apartment 1204`,
  },

  // ── 15 (advanced) ─────────────────────────────────────────────────────
  {
    id: 'w1_15', num: 15, section: 'W1', difficulty: 'advanced',
    title: 'Reference Letter Request – Professor',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Formal Academic Email — Reference Request',
    prompt: `You are a recent university graduate applying for a competitive position at a national research institute. You want to ask your former professor, Dr. Rebecca Stone, to write a reference letter.

Write an email to Dr. Stone. In your email:`,
    bulletPoints: [
      'Remind her who you are and mention the course you took with her',
      'Explain the position and why you chose her as a reference',
      'Provide relevant details and ask if she is willing and able to help',
    ],
    tone: 'Formal — writing to a professor and academic you respect',
    criteria: ['All 3 points addressed', 'Formal academic tone', 'Specific and contextual reminder', 'Polite and deferential request'],
    modelAnswer: `Dear Dr. Stone,

I hope this message finds you well. My name is Jennifer Park and I had the pleasure of completing your Advanced Research Methods course in Winter 2024 — the seminar in which I presented my paper on longitudinal health data analysis, which you were kind enough to describe as one of the strongest submissions of the year.

I am writing to ask whether you would be willing to write a reference letter on my behalf. I have been invited to apply for a Research Analyst position at the Canadian Institute for Health Information, a competitive role that requires three academic or professional references.

I chose to reach out to you specifically because your expertise in quantitative research and your familiarity with my analytical work would make your endorsement particularly meaningful in this context. The application deadline is August 15th, so there would be no immediate urgency.

I would be happy to provide my resume, the full job description, and any materials that might help you draft the letter. I am also available to meet if that would be helpful.

Thank you very much for your time and consideration, Dr. Stone.

Respectfully,
Jennifer Park`,
  },

  // ── 16 (advanced) ─────────────────────────────────────────────────────
  {
    id: 'w1_16', num: 16, section: 'W1', difficulty: 'advanced',
    title: 'Volunteer Application Inquiry',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Formal — Volunteer Inquiry to Non-profit',
    prompt: `You want to volunteer with a local non-profit (New Horizons Support Centre) that helps newcomers to Canada. You have relevant professional skills and a strong personal motivation for this cause.

Write an email to the volunteer coordinator, Ms. Angela Torres. In your email:`,
    bulletPoints: [
      'Introduce yourself and explain your personal motivation for volunteering with this organisation',
      'Describe the relevant skills or experience you would bring',
      'Ask about available volunteer positions and the application process',
    ],
    tone: 'Formal and enthusiastic — professional inquiry for a volunteer role',
    criteria: ['All 3 points addressed', 'Genuine personal motivation included', 'Specific skills highlighted', 'Professional, not generic'],
    modelAnswer: `Dear Ms. Torres,

I am writing to express my interest in volunteering with New Horizons Support Centre. My name is Lucas Ferreira and I am a certified ESL instructor currently working in the private sector. Having immigrated to Canada from Brazil myself seven years ago, I have a deep personal understanding of the challenges newcomers face when navigating language, employment, and cultural adjustment — and a strong desire to give back to a community that once supported me.

Over the past decade, I have worked with adult language learners in a range of settings, including one-on-one tutoring, workplace language programs, and community adult education. I am also experienced in resume writing and job search coaching, which I understand are among the services you provide.

I would be very interested to learn about the specific volunteer roles currently available at New Horizons and the steps required to apply. I am flexible with my schedule and could commit to a regular weekly time slot.

Thank you for the important work your organisation does. I would be honoured to contribute.

Kind regards,
Lucas Ferreira`,
  },

  // ── 17 (advanced) ─────────────────────────────────────────────────────
  {
    id: 'w1_17', num: 17, section: 'W1', difficulty: 'advanced',
    title: 'Airline Complaint – Lost Luggage',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Formal Complaint — Airline',
    prompt: `Your flight was cancelled by NorthStar Air (booking reference NSA-28471) five days ago, and your checked luggage has not been located or returned. You have attempted to contact the airline twice with no response.

Write a formal complaint email to the airline. In your email:`,
    bulletPoints: [
      'State the flight cancellation issue and the lost luggage problem with key details',
      'Describe how this situation has inconvenienced you',
      'State what resolution you expect from the airline and set a specific deadline',
    ],
    tone: 'Formal and assertive — serious complaint requiring escalation',
    criteria: ['All 3 points addressed', 'Firm, assertive, and professional', 'Specific details and reference numbers', 'Clear deadline and expectations set'],
    modelAnswer: `To the NorthStar Air Customer Relations Department,

I am writing to file a formal complaint regarding flight NSA-284 from Toronto (YYZ) to Vancouver (YVR), scheduled for June 14th, which was cancelled without prior notice. My booking reference is NSA-28471.

In addition to the disruption caused by the cancellation, my two checked bags — containing essential clothing, professional equipment, and personal items valued at approximately $2,800 — have not been returned to me in the five days since the incident. I was given a property irregularity report (reference PIR-4483) at the time but have received no update despite two follow-up calls to your customer service line.

The impact on my daily life has been significant. I was travelling for a work conference, and the loss of my equipment and professional attire directly affected my ability to fulfil my responsibilities. I have been forced to purchase replacement items totalling $340, for which I am retaining all receipts.

I expect NorthStar Air to either locate and return my luggage within five business days or provide a full compensation of $2,800 for the lost items, plus reimbursement of the $340 in replacement costs. I also expect written confirmation of this resolution by July 1st.

If I do not receive a satisfactory response by that date, I will file a formal complaint with the Canadian Transportation Agency.

Sincerely,
Andrew Whitfield`,
  },

  // ── 18 (advanced) ─────────────────────────────────────────────────────
  {
    id: 'w1_18', num: 18, section: 'W1', difficulty: 'advanced',
    title: 'Speculative Job Application (Cover Letter)',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Formal — Unsolicited Professional Introduction',
    prompt: `You are interested in working at Novex Solutions, a company you admire. There is no current job posting, but you believe your skills would be a strong fit. You want to introduce yourself proactively.

Write an email to the Head of Talent, Ms. Rachel Kim. In your email:`,
    bulletPoints: [
      'Introduce yourself and explain why you are interested in this specific company',
      'Highlight two or three key skills or accomplishments that make you a strong candidate',
      'Express interest in any upcoming opportunities and offer to share your resume',
    ],
    tone: 'Formal and confident — proactive professional approach',
    criteria: ['All 3 points addressed', 'Confident without arrogance', 'Company-specific reasoning', 'Specific accomplishments cited'],
    modelAnswer: `Dear Ms. Kim,

My name is Diana Osei and I am a Senior Data Analyst with seven years of experience in financial services. I am reaching out to express my strong interest in joining Novex Solutions, having followed the company's work closely — particularly your recent expansion into predictive analytics for community lending, an initiative that aligns closely with my professional values and expertise.

Over the past three years at MapleTech Financial, I have led a team of five analysts, reduced reporting cycle time by 38% through process automation, and developed a customer risk model that improved approval accuracy by 22%. I believe these skills translate directly to the kind of data-led decision-making that Novex prioritises.

I understand you may not have a current opening that matches my background, but I would welcome the opportunity to explore any positions that may be opening in the coming months. I have attached my resume and would be happy to schedule a brief introductory call at your convenience.

Thank you for your time, Ms. Kim.

Sincerely,
Diana Osei
diana.osei@email.com | 647-555-0134`,
  },

  // ── 19 (advanced) ─────────────────────────────────────────────────────
  {
    id: 'w1_19', num: 19, section: 'W1', difficulty: 'advanced',
    title: 'Letter to City Councillor – Park Improvements',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Formal — Civic Advocacy to Elected Official',
    prompt: `You live near a city park that has been poorly maintained for over a year. You represent a group of concerned residents and want to advocate for improvements.

Write an email to your local city councillor, Councillor Maria Santos. In your email:`,
    bulletPoints: [
      "Describe the park's current state with specific evidence or examples",
      'Explain why the park matters to the community and who is affected',
      'Make two or three specific, realistic requests and offer to participate in a community consultation',
    ],
    tone: 'Formal — civic advocacy letter to an elected official',
    criteria: ['All 3 points addressed', 'Formal civic tone', 'Evidence-based and specific', 'Solutions offered, not just complaints'],
    modelAnswer: `Dear Councillor Santos,

I am writing on behalf of a group of thirty-two residents from the Riverside Drive area regarding the deteriorating condition of Morrison Creek Park. Despite multiple requests submitted through the city's online reporting system since last autumn, we have seen no meaningful improvement.

The park currently has five broken lights along the main pathway — which poses a safety risk to evening walkers and cyclists — as well as a vandalized washroom facility that has been out of service for four months and a playground surface that is damaged and potentially dangerous for young children. We have documented these issues with photographs and timestamped service request numbers that we are happy to share.

The park is the primary outdoor space for hundreds of families in our neighbourhood, including a large elderly population that depends on it for daily physical activity. Its neglect disproportionately affects those with the fewest alternatives.

We respectfully request: immediate restoration of pathway lighting as a safety priority; repair of the washroom facility within 60 days; and a full playground inspection with necessary resurfacing before September. We would also welcome the opportunity to participate in a formal community consultation regarding the park's future maintenance plan.

Thank you for your service to this community, Councillor Santos.

Respectfully submitted,
Elena Marchetti
(on behalf of the Riverside Drive Community Group)`,
  },

  // ── 20 (advanced) ─────────────────────────────────────────────────────
  {
    id: 'w1_20', num: 20, section: 'W1', difficulty: 'advanced',
    title: 'Library Director – Adult Programming Proposal',
    type: 'writing',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Formal — Community Member Proposing Program to Institution',
    prompt: `You have been using your local library for years and have noticed it offers very little programming for adults. You want to propose a new adult program to the library director.

Write an email to the library director, Ms. Frances Okafor. In your email:`,
    bulletPoints: [
      "Acknowledge the library's strengths and your history as a user",
      'Describe your specific program idea and explain its value to the community',
      'Ask whether the library would consider the proposal and offer to help organise it',
    ],
    tone: 'Warm and constructive — community member with a positive, evidence-based proposal',
    criteria: ['All 3 points addressed', 'Acknowledges before advocating', 'Specific and concrete proposal', 'Genuine, community-minded tone'],
    modelAnswer: `Dear Ms. Okafor,

I have been a member of this library for twelve years, and it has been a constant source of enrichment in my life. From the excellent digital resources to the welcoming children's programs, the library consistently serves our community well. I am writing because I would like to propose an idea that I believe could extend that impact to adult residents.

I would like to suggest a monthly "Career and Professional Skills" evening workshop series. Each session could focus on a practical skill — resume writing, interview preparation, LinkedIn profile building, or navigating the Canadian workplace for newcomers. These topics are consistently requested in local community forums but are rarely offered through accessible, free channels.

I work as a human resources professional and would be willing to lead or co-facilitate sessions at no cost to the library. I have also spoken informally with several neighbours and colleagues who expressed immediate interest in attending.

I would be grateful if you could consider this proposal and let me know whether there is a process for submitting formal program suggestions. I am happy to provide a more detailed outline at your request.

Thank you for the wonderful service you and your team provide.

With appreciation,
Thomas Ngozi`,
  },
]

// ── W2 questions (survey) — 20 topics, difficulty randomised ─────────────────
const W2_QUESTIONS = [
  {
    id: 'w2_1', num: 1, section: 'W2', difficulty: 'intermediate',
    title: 'Public Transit vs. Roads',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — City Planning',
    prompt: `A city planning organization is asking residents for their opinion:

Some people believe expanding public transit (buses and subways) is the best way to reduce traffic in cities. Others believe that building more roads and highways is the better solution.

Which approach do you think the city should prioritize? Give specific reasons to support your choice.`,
    optionA: 'Expanding public transit (buses and subways)',
    optionB: 'Building more roads and highways',
    tone: 'Semi-formal — clear, direct opinion writing',
    criteria: ['Clear position stated upfront', 'Two or three specific supporting reasons', 'Consistent position — no hedging', 'Varied sentence structure'],
    modelAnswer: `I believe cities should prioritize expanding public transit rather than building new roads.

The fundamental problem with adding more roads is that it generates more traffic rather than reducing it. This phenomenon, known as "induced demand," is well-documented in transportation research: more road capacity attracts more drivers. Cities like Los Angeles expanded their highway networks aggressively for decades, yet congestion only worsened.

Public transit, by contrast, moves large numbers of people efficiently within a fixed right-of-way. A single subway line can carry the equivalent of twelve lanes of highway traffic. This is simply more efficient use of urban space.

Beyond capacity, public transit has significant environmental advantages. Every commuter who switches from a personal vehicle to a bus or subway meaningfully reduces carbon emissions — an increasingly urgent priority for Canadian cities committed to their climate targets.

Finally, transit expansion benefits those who cannot drive — the elderly, people with disabilities, and lower-income residents — making cities more equitable places to live.

The evidence strongly favours transit investment over road expansion.`,
  },
  {
    id: 'w2_2', num: 2, section: 'W2', difficulty: 'advanced',
    title: 'Technology in Early Education',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Education Policy',
    prompt: `A school board is surveying parents and community members:

Some educators argue that technology — tablets, laptops, and apps — should be used extensively in classrooms from an early age because it prepares children for the modern world. Others believe that excessive screen time in schools is harmful and that traditional hands-on learning is more effective for young children.

What is your opinion? Should schools use technology extensively in early childhood education? Support your position with specific reasons and examples.`,
    optionA: 'Technology should be used extensively in early childhood classrooms',
    optionB: 'Traditional hands-on learning is more effective for young children',
    tone: 'Semi-formal — opinion writing with specific support',
    criteria: ['Clear position stated', 'Specific examples or evidence used', 'Counterargument acknowledged', 'Well-structured and coherent'],
    modelAnswer: `I believe that while technology has a place in education, traditional hands-on learning should remain the foundation for young children.

Research in child development consistently shows that children under eight learn most effectively through physical exploration, social interaction, and direct sensory experience. Skills like fine motor coordination, spatial reasoning, and emotional intelligence develop through activities that screens simply cannot replicate — building blocks, drawing, outdoor play, and collaborative storytelling.

There is also growing evidence that excessive screen time in early childhood is linked to shortened attention spans and reduced social development. The American Academy of Pediatrics has specifically recommended limiting recreational screen time for children under six for these reasons.

I am not suggesting technology has no role. Used purposefully — for a 20-minute coding exercise or an interactive science simulation — it can be a valuable supplement. The concern is with extensive, undirected use replacing core developmental activities.

Young children are not miniature adults. Their developmental needs require a curriculum designed around how children actually learn, not around what employers will expect of them in fifteen years.`,
  },
  {
    id: 'w2_3', num: 3, section: 'W2', difficulty: 'easy',
    title: 'Social Media Age Restrictions',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Child Safety & Technology',
    prompt: `A community organization is asking residents for their views:

Some people believe governments should strictly limit social media access for children under 16 to protect their mental health. Others argue that restricting social media takes away young people's freedom and that parents — not governments — should decide.

What is your view? Should governments set age restrictions on social media? Explain your position with specific reasons.`,
    optionA: 'Governments should set strict age restrictions on social media',
    optionB: "Parents — not governments — should decide children's social media access",
    tone: 'Semi-formal — clear opinion with reasoning',
    criteria: ['Clear position', 'Two specific reasons', 'Direct and focused', 'Natural English'],
    modelAnswer: `I believe governments should set clear age restrictions on social media access for children.

The mental health consequences of early, unregulated social media use are well-documented. Studies have repeatedly linked heavy social media use by teenagers — particularly girls — to increased rates of anxiety, depression, and body image issues. When young people are developmentally vulnerable, exposure to constant social comparison and algorithmically amplified content can cause real, lasting harm.

Parents undoubtedly play a critical role, but relying solely on individual parents is insufficient. Many parents lack the technical knowledge to monitor their children's online activity effectively. Others work long hours and cannot maintain consistent oversight. And some children simply find ways around parental controls.

A government-set minimum age — similar to restrictions on alcohol, gambling, or driving — creates a consistent, enforceable standard that protects all children equally, not just those with attentive and technically literate parents.

This is not about restricting freedom. It is about recognising that social media platforms are designed to be addictive and that children deserve protection from those design choices.`,
  },
  {
    id: 'w2_4', num: 4, section: 'W2', difficulty: 'intermediate',
    title: 'High-Rise vs. Suburban Housing',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Urban Planning & Lifestyle',
    prompt: `A housing authority is gathering opinions:

Some people prefer living in high-rise apartments in the city centre — close to work, restaurants, and transit — but smaller and more expensive. Others prefer suburban houses — more space and lower rent, but requiring a longer daily commute.

Which type of housing do you think is better for families? Explain your position with specific reasons and examples.`,
    optionA: 'High-rise apartments in the city centre',
    optionB: 'Houses in suburban neighbourhoods',
    tone: 'Semi-formal — personal opinion with specific support',
    criteria: ['Clear position', 'Specific supporting reasons', 'Considers family context', 'Coherent argument'],
    modelAnswer: `For families, I believe suburban houses offer a significantly better quality of life than city-centre apartments.

Space is the most fundamental advantage. A house provides separate bedrooms, a yard, and storage — all of which matter enormously when you have children. City apartments, even expensive ones, typically cannot offer the same square footage. Children need room to play, make noise, and develop their independence in ways that a high-rise simply does not accommodate well.

Cost is also an important consideration. While suburban homes require a commute, the financial savings can be substantial. Many families in Canadian cities spend 50 to 60 percent of their income on city-centre rent. A suburban mortgage, in many cases, is lower than a downtown apartment's rent — and builds equity over time.

Yes, the commute is a real cost. But many suburban families find they can schedule work-from-home days to reduce it. Schools in suburban areas also tend to have more physical space, larger playgrounds, and easier access to outdoor activities.

For raising a family, the suburb clearly wins on balance.`,
  },
  {
    id: 'w2_5', num: 5, section: 'W2', difficulty: 'advanced',
    title: 'Preventive vs. Treatment Healthcare',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Health Policy',
    prompt: `A health policy think tank is collecting public opinions:

Some people argue that governments should invest the majority of healthcare funding in preventive care — education, screenings, and lifestyle programs — to reduce disease before it occurs. Others believe healthcare funding should focus on treatment — hospitals, emergency care, and medication — to help people who are already sick.

Where do you think healthcare funding should be prioritized? Explain your view with specific reasoning.`,
    optionA: 'Governments should prioritize preventive healthcare',
    optionB: 'Governments should prioritize treatment and emergency care',
    tone: 'Semi-formal — structured argument with evidence',
    criteria: ['Clear position', 'Evidence-based reasoning', 'Acknowledges counterargument', 'Logical and well-organised'],
    modelAnswer: `I believe healthcare systems should significantly increase investment in preventive care, though not at the complete expense of treatment.

The economic case is compelling. Every dollar invested in preventive care — early cancer screenings, diabetes management programs, vaccination campaigns, and smoking cessation support — has been estimated to save between three and seven dollars in future treatment costs. This is because diseases caught early are dramatically cheaper to treat and far less debilitating for patients.

The human case is equally strong. Preventive care reduces the number of people who become severely ill in the first place, which relieves pressure on hospitals and emergency rooms that are already overburdened in most Canadian provinces.

Critics correctly argue that we cannot simply let currently sick people go untreated. I agree entirely. A functional healthcare system must treat those in need. But the current balance — where the vast majority of funding goes to acute treatment while prevention receives a fraction — is inefficient and shortsighted.

Investing more in prevention is not idealism. It is the fiscally responsible and morally sensible approach to managing a sustainable healthcare system.`,
  },
  {
    id: 'w2_6', num: 6, section: 'W2', difficulty: 'easy',
    title: 'Single-Use Plastic Bag Ban',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Environmental Policy',
    prompt: `A city council is asking residents for input:

Your city is deciding whether to ban single-use plastic bags in all retail stores. Some people support the ban because it reduces pollution and encourages sustainable habits. Others oppose it because it increases costs and inconvenience for shoppers and businesses.

Do you support or oppose the ban on single-use plastic bags? Give specific reasons.`,
    optionA: 'I support the ban on single-use plastic bags',
    optionB: 'I oppose the ban on single-use plastic bags',
    tone: 'Semi-formal — clear opinion with reasoning',
    criteria: ['Clear position', 'Two or three reasons', 'Specific and direct', 'No switching sides'],
    modelAnswer: `I strongly support a ban on single-use plastic bags, and I believe any short-term inconvenience is easily outweighed by the long-term benefits.

Plastic bags are one of the most visible and damaging forms of pollution in Canadian cities. They clog drains, end up in waterways, and can take up to 1,000 years to break down in landfills. Unlike glass or paper, most plastic bags cannot be effectively recycled at scale — meaning that even "recyclable" bags typically end up in landfill.

Switching to reusable bags is genuinely simple. Most people adapt within weeks, and the financial cost is minimal — a single reusable bag purchased for $2 can replace hundreds of plastic bags over its lifetime.

Regarding cost to businesses: many cities that have already implemented bans — Vancouver, Montreal, and dozens of European cities — report that retail business was not negatively impacted. Shoppers adjusted quickly.

We cannot claim to care about the environment while continuing to generate hundreds of millions of disposable plastic bags every year. This ban is a small, practical, and overdue step.`,
  },
  {
    id: 'w2_7', num: 7, section: 'W2', difficulty: 'intermediate',
    title: 'Community Centre vs. Roads Spending',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Municipal Spending',
    prompt: `A municipal government is surveying residents on community spending:

Your city has extra funding and must choose between expanding the community recreation centre (adding a gym, pool, and daycare) or improving roads and sidewalks in the neighbourhood.

Which do you think is a better use of the funds? Support your opinion with specific reasons.`,
    optionA: 'Expand the community recreation centre',
    optionB: 'Improve roads and sidewalks in the neighbourhood',
    tone: 'Semi-formal — community opinion writing',
    criteria: ['Clear position', 'Specific practical reasoning', 'Community impact considered', 'Direct and focused'],
    modelAnswer: `I believe the city should invest in improving roads and sidewalks rather than expanding the recreation centre.

Infrastructure improvements benefit every resident equally and every day. A cracked sidewalk is a safety hazard for every pedestrian who walks it — elderly residents, parents with strollers, cyclists. Poor road conditions damage vehicles, increase maintenance costs, and can cause accidents. These are daily, tangible harms that affect the entire community regardless of income, age, or interest in fitness.

A recreation centre expansion, while genuinely valuable, primarily benefits those who choose to use it. Many residents — particularly the elderly, those with young infants, or those with demanding work schedules — will rarely if ever use a new gym or pool. Their tax dollars would be funding a facility they cannot realistically access.

I also think the argument about daycare deserves separate consideration — if childcare access is the goal, dedicated childcare funding is a more direct solution than attaching it to a recreation expansion.

Basic infrastructure is a fundamental municipal responsibility. It should come first.`,
  },
  {
    id: 'w2_8', num: 8, section: 'W2', difficulty: 'advanced',
    title: 'Strict vs. Relaxed Parenting',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Parenting & Child Development',
    prompt: `A parenting magazine is gathering views:

Some people believe strict parenting — with clear rules, high expectations, and firm consequences — produces more disciplined and successful children. Others believe relaxed, child-led parenting — with more freedom, self-expression, and minimal rules — produces happier, more creative children.

Which parenting style do you believe is more effective for raising well-rounded children? Give specific reasons and examples.`,
    optionA: 'Strict parenting with clear rules and high expectations',
    optionB: 'Relaxed, child-led parenting with freedom and minimal rules',
    tone: 'Semi-formal — nuanced opinion with specific support',
    criteria: ['Clear position', 'Nuanced argument (not binary)', 'Specific examples', 'Well-balanced reasoning'],
    modelAnswer: `While I believe a degree of structure is essential for children's development, I think the most effective parenting style lies between strict and relaxed — leaning toward what researchers call "authoritative" parenting: high expectations combined with warmth and open communication.

Pure strictness — rigid rules with no room for discussion — may produce compliance in the short term, but research consistently shows it is associated with lower self-esteem, reduced resilience, and difficulty making independent decisions in adulthood. Children raised in overly controlled environments often lack the internal motivation to succeed once external enforcement is removed.

Equally, completely child-led parenting without structure leaves children without the boundaries they need to develop self-regulation. Young children do not yet have the cognitive capacity to manage complete freedom responsibly.

The most successful approach, supported by decades of developmental psychology research, provides clear and consistent expectations while explaining the reasons behind rules, listening to children's perspectives, and allowing age-appropriate autonomy. Children raised this way tend to be both disciplined and creative — because structure and freedom are not opposites when implemented thoughtfully.`,
  },
  {
    id: 'w2_9', num: 9, section: 'W2', difficulty: 'intermediate',
    title: 'Immigration and the Economy',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Social Policy',
    prompt: `An economics research group is asking for public opinion:

Some people believe that immigration has a positive effect on a local economy because immigrants fill labour shortages, start businesses, and contribute to innovation. Others believe immigration puts pressure on local housing, public services, and wages for existing residents.

What is your view on the effect of immigration on the local economy? Support your position with specific reasons and examples.`,
    optionA: 'Immigration has an overall positive effect on the local economy',
    optionB: 'Immigration puts excessive pressure on housing, services, and wages',
    tone: 'Semi-formal — reasoned opinion on a social issue',
    criteria: ['Clear position', 'Specific economic reasoning', 'Acknowledges counterargument', 'Evidence or example cited'],
    modelAnswer: `I believe immigration has a net positive effect on Canada's economy, though this benefit is only fully realised when it is supported by appropriate investment in housing and public services.

Canada's workforce is ageing rapidly. Without continued immigration, many critical sectors — healthcare, construction, technology, and elder care — simply would not have enough workers. Immigrants fill roles at every level of the economy, from skilled professionals to essential service workers, and studies consistently show they are among the most entrepreneurial demographic in Canada.

Critics point to housing costs and wage pressure as valid concerns. I acknowledge these are real issues in cities like Toronto and Vancouver. However, the evidence suggests that housing affordability is primarily a supply problem — caused by restrictive zoning and slow construction — not by immigration per se.

Canada has historically been one of the most successful immigrant-receiving countries in the world. Our national identity and economic prosperity are deeply intertwined with immigration. The solution to housing pressure is to build more housing — not to reduce the immigration that sustains our economy and demographic balance.`,
  },
  {
    id: 'w2_10', num: 10, section: 'W2', difficulty: 'easy',
    title: 'University vs. Skilled Trades',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Career & Education',
    prompt: `A career guidance organization is collecting opinions:

Some people believe a university degree is the best investment young people can make because it opens more doors and leads to higher salaries. Others believe skilled trades training is a better choice because it leads to stable, well-paying jobs without the cost and time of a degree.

Which path do you think is better for young people entering the workforce today? Give specific reasons.`,
    optionA: 'A university degree is the better investment',
    optionB: 'Skilled trades training is the better path',
    tone: 'Semi-formal — career and education opinion',
    criteria: ['Clear position', 'Practical and specific reasons', 'Direct and confident', 'No ambiguity'],
    modelAnswer: `For many young Canadians today, skilled trades training represents a smarter investment than a traditional university degree.

The financial case is strong. A licensed electrician, plumber, or HVAC technician in Canada earns between $70,000 and $100,000 per year after a few years of experience. They typically enter the workforce two to three years earlier than university graduates — and without $40,000 to $80,000 in student debt. The combination of earlier earnings and no debt represents a financial head start that is very difficult for most university graduates to overcome.

There is also exceptional job security. Canada currently faces critical shortages in the skilled trades, and that trend will only intensify as the existing workforce ages and retires. A trained trades worker is virtually guaranteed employment.

I am not suggesting university is without value — for medicine, law, engineering, and many other professions, a degree is essential. But the cultural assumption that university is the default successful path leads many young people to take on expensive degrees in fields with limited job prospects. For a large number of students, trades training is the more practical, financially sound, and personally fulfilling choice.`,
  },
  {
    id: 'w2_11', num: 11, section: 'W2', difficulty: 'intermediate',
    title: 'Mandatory Volunteering for Students',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Education Policy',
    prompt: `A youth development foundation is gathering opinions:

Some educators believe mandatory community service should be a requirement for high school graduation because it builds empathy, responsibility, and civic engagement. Others believe mandatory volunteering removes the genuine spirit of service and that students should choose how to spend their time.

What is your opinion? Should community service be mandatory for high school students?`,
    optionA: 'Community service should be mandatory for graduation',
    optionB: 'Community service should be voluntary — not a graduation requirement',
    tone: 'Semi-formal — education policy opinion',
    criteria: ['Clear position', 'Specific reasoning', 'Addresses the "spirit of volunteering" argument', 'Coherent'],
    modelAnswer: `I support making community service a graduation requirement for high school students, and I believe the concern about "forced volunteering" misses the broader educational purpose.

The argument that mandatory service undermines genuine altruism assumes that students will naturally choose to volunteer otherwise — and that is simply not borne out by experience. Most teenagers, without structured expectations, will not seek out community involvement on their own. The requirement is what creates the exposure, and in many cases, the experience itself fosters genuine interest that continues beyond graduation.

Research consistently shows that students who complete community service hours report higher levels of empathy, civic awareness, and social responsibility — even when the participation was initially compelled. What begins as an obligation often becomes meaningful.

This is no different from requiring students to study history, physical education, or the arts. We require these subjects not because every student loves them, but because we believe exposure to them produces a more complete, socially aware citizen.

A minimum threshold — 30 to 40 hours spread across high school — is a modest ask with significant long-term social benefits.`,
  },
  {
    id: 'w2_12', num: 12, section: 'W2', difficulty: 'advanced',
    title: 'AI in the Workplace',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Technology & Society',
    prompt: `A technology ethics panel is gathering public views:

Some experts argue that AI is transforming the workplace in positive ways — increasing productivity, reducing repetitive tasks, and creating new job categories. Others warn that AI will lead to widespread job losses, growing inequality, and a workforce unprepared for rapid change.

What is your view on the impact of AI on the workplace? Give a clear position supported by specific reasons and examples.`,
    optionA: 'AI is transforming the workplace in largely positive ways',
    optionB: 'AI poses serious risks of job loss and inequality',
    tone: 'Semi-formal — technology and society opinion',
    criteria: ['Clear position', 'Specific examples or evidence', 'Addresses opposing concerns', 'Sophisticated reasoning'],
    modelAnswer: `AI represents the most significant transformation of the workplace since industrialisation — and like industrialisation, its impact will be both positive and deeply disruptive, depending almost entirely on how societies choose to manage it.

I believe AI will ultimately benefit the workforce, but only if governments and employers act proactively to support workers through the transition. This is not a passive optimism — it is a conditional one.

The productivity gains are real. AI tools are already helping radiologists detect cancers earlier, enabling lawyers to process large document sets in hours rather than weeks, and allowing small businesses to compete in marketing and customer service in ways that were previously impossible. These are genuine value additions.

The displacement risk is also real. Routine cognitive tasks — data entry, basic customer service, standard document drafting — will be automated at scale. Workers in these roles need retraining support, which most governments are not providing at sufficient scale or speed.

The trajectory is not fixed. AI's impact depends on policy choices about education, retraining investment, and labour protections. With the right framework, it is a powerful tool for human flourishing. Without one, it will deepen inequality.`,
  },
  {
    id: 'w2_13', num: 13, section: 'W2', difficulty: 'easy',
    title: 'Screen Time Limits for Teenagers',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Health & Parenting',
    prompt: `A community wellness group is surveying residents:

Some people believe there should be strict daily screen time limits for teenagers (no more than 2 hours outside school) to protect mental health and encourage physical activity. Others believe teenagers are responsible enough to manage their own screen time without imposed limits.

What is your view? Should there be limits on teen screen time?`,
    optionA: 'There should be strict daily limits on screen time',
    optionB: 'Teenagers should manage their own screen time',
    tone: 'Semi-formal — parenting and health opinion',
    criteria: ['Clear position', 'Two specific reasons', 'Practical and realistic', 'Direct language'],
    modelAnswer: `I believe some structured limits on teenage screen time are reasonable and beneficial, though the approach should be flexible rather than rigid.

The mental health evidence is difficult to ignore. Multiple studies — including the work of psychologist Jean Twenge — have documented a strong correlation between the rise of smartphones and increasing rates of depression and anxiety among teenagers, particularly girls. Heavy social media use is consistently linked to sleep disruption, reduced concentration, and heightened social comparison. These are not trivial concerns.

Physical health is also relevant. Adolescents who spend four or more hours per day on screens are significantly more likely to be sedentary, which has long-term consequences for cardiovascular health and overall wellbeing.

I acknowledge that teenagers have genuine autonomy over their time, and that excessive parental control has its own downsides. But "managing your own screen time" at 15 is not comparable to the same decision at 25. Adolescent brains are still developing impulse control and are highly susceptible to addictive design patterns deliberately built into social media platforms.

Reasonable daily guidance — not a punitive ban, but a structured limit — is a responsible and loving response to that reality.`,
  },
  {
    id: 'w2_14', num: 14, section: 'W2', difficulty: 'intermediate',
    title: 'Local Business vs. Chain Stores',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Community & Consumer Values',
    prompt: `A business association is gathering opinions:

Some people prefer shopping at locally owned small businesses because it supports the community, creates local jobs, and maintains neighbourhood character. Others prefer large chain stores because they offer lower prices, wider selection, and more consistent quality.

Which do you prefer and why? Give specific reasons and examples.`,
    optionA: 'I prefer locally owned small businesses',
    optionB: 'I prefer large chain stores',
    tone: 'Semi-formal — consumer opinion with values',
    criteria: ['Clear preference stated', 'Community or value-based reasoning', 'Specific examples', 'Consistent position'],
    modelAnswer: `I make a conscious effort to shop at locally owned businesses whenever possible, and I think that choice has a meaningful positive impact on the communities I care about.

When I spend money at a local bookstore or independent grocery, a much higher proportion of that money stays within the local economy compared to spending at a national chain. Local business owners pay local taxes, hire local staff, and reinvest their profits locally. A neighbourhood with a diverse mix of independent businesses is also simply a better, more interesting place to live.

I also genuinely enjoy the experience. Independent shop owners tend to have deeper knowledge of their products and more invested customer relationships. My local butcher knows my preferences and has introduced me to cuts I never would have found at a grocery chain.

I understand that price is a real consideration for many families and that large chains offer undeniable conveniences. I am not suggesting everyone should pay more than they can afford. But for those who have the financial flexibility, choosing local is a way to align spending with community values. It is one of the most direct forms of civic participation available to consumers.`,
  },
  {
    id: 'w2_15', num: 15, section: 'W2', difficulty: 'advanced',
    title: 'Renewable Energy Investment',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Energy & Environment Policy',
    prompt: `An energy policy organization is asking citizens for input:

Some people believe governments should invest heavily in renewable energy (solar, wind, hydro) to combat climate change, even if it means higher short-term costs. Others argue that until renewables become cost-competitive, governments should continue supporting conventional energy to protect household budgets.

What is your view on government investment in renewable energy?`,
    optionA: 'Governments should invest heavily in renewables now, even at higher cost',
    optionB: 'Governments should wait until renewables are cost-competitive',
    tone: 'Semi-formal — policy and environment opinion',
    criteria: ['Clear position', 'Economic and environmental reasoning', 'Addresses cost concern', 'Logical and specific'],
    modelAnswer: `I believe governments must invest aggressively in renewable energy now, and I would argue the "higher short-term costs" framing significantly understates what we already pay for our current energy choices.

Conventional fossil fuel energy carries enormous hidden costs: air pollution-related healthcare spending, climate-related disaster response, infrastructure damage from extreme weather events, and long-term environmental remediation. When these externalities are included in the calculation, renewable energy is already economically competitive in most contexts — and is becoming cheaper every year as technology improves and manufacturing scales up.

The cost argument for delay is also eroding rapidly. Solar and wind energy have undergone a 90% cost reduction over the past decade. Every year governments delay transitioning infrastructure, they extend dependence on energy sources that are already more expensive when full costs are considered.

The climate urgency is also non-negotiable. Canada has made international commitments to significant emissions reductions by 2030 and 2050. Waiting for perfect economic conditions before acting means missing those windows entirely.

Strategic investment in renewables today — in grid infrastructure, energy storage, and clean manufacturing — is the fiscally responsible and environmentally essential path forward.`,
  },
  {
    id: 'w2_16', num: 16, section: 'W2', difficulty: 'intermediate',
    title: 'Four-Day Work Week',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Workplace Policy',
    prompt: `A workplace research organization is collecting opinions:

Many companies are experimenting with a four-day work week (32 hours, no reduction in pay). Supporters say it improves employee wellbeing, productivity, and retention. Critics argue it is impractical, increases costs, and reduces ability to serve customers.

What is your opinion on the four-day work week?`,
    optionA: 'The four-day work week should be adopted widely',
    optionB: 'The four-day work week is impractical and would harm businesses',
    tone: 'Semi-formal — workplace policy opinion',
    criteria: ['Clear position', 'Practical reasoning', 'Addresses the productivity argument', 'Specific'],
    modelAnswer: `I support the broader adoption of the four-day work week, particularly for knowledge-sector jobs, and the evidence increasingly backs this position.

The most comprehensive trial to date — conducted across 61 UK companies in 2022 — found that 92% of participants chose to continue the four-day schedule after the trial ended. Revenue actually increased by an average of 8%, and employee sick days fell by 65%. These are not the results of a policy that harms productivity.

The reason is intuitive: a well-rested employee with a meaningful work-life balance is more focused, more creative, and less likely to make costly errors than one who is perpetually fatigued and resentful of their schedule. The eighth hour of a long Friday afternoon is not the same as the eighth hour in a four-day week.

I acknowledge this model does not fit every industry — healthcare, retail, emergency services, and hospitality all have staffing requirements that make a standard four-day schedule complicated. But for office-based and knowledge workers, the case is compelling.

The question is not whether the four-day week works. The question is how to adapt it thoughtfully across different sectors.`,
  },
  {
    id: 'w2_17', num: 17, section: 'W2', difficulty: 'easy',
    title: 'Public Surveillance Cameras',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Safety and Civil Liberties',
    prompt: `A city safety committee is gathering public views:

Some people strongly support expanding public surveillance cameras in streets, parks, and transit stations because they deter crime and help police solve cases. Others oppose them because they invade privacy, create a culture of distrust, and are often misused.

What is your view? Should cities expand their network of public surveillance cameras?`,
    optionA: 'Cities should expand public surveillance cameras',
    optionB: 'Cities should not expand surveillance — they invade privacy',
    tone: 'Semi-formal — civic safety and privacy opinion',
    criteria: ['Clear position', 'Two specific reasons', 'Addresses opposing view briefly', 'Direct'],
    modelAnswer: `I believe cities should expand their public surveillance camera networks, with appropriate oversight measures in place.

The safety benefits are well-documented and direct. Studies in British cities — where surveillance cameras have been in place for decades — consistently show that their presence reduces vandalism, assault, and vehicle theft in monitored areas. When crimes do occur, camera footage accelerates investigations and improves conviction rates. These are real benefits for real victims.

The privacy concerns, while understandable, are somewhat overstated in the context of public spaces. There is no reasonable expectation of privacy when walking on a public sidewalk, waiting at a bus stop, or using a public park. These are by definition shared spaces. The analogy to government surveillance of private citizens in their homes is not an accurate comparison.

That said, I agree that oversight is essential. Cameras should not be used to monitor lawful political protests, and access to footage should be strictly regulated and audited. With those safeguards, surveillance cameras are a practical and proportionate tool for improving urban safety.

Refusing to deploy them is not protecting privacy — it is prioritising a principle over the actual safety of residents.`,
  },
  {
    id: 'w2_18', num: 18, section: 'W2', difficulty: 'advanced',
    title: 'Pet Ownership in Apartments',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Property and Tenant Rights',
    prompt: `A civic engagement organization is asking residents for input:

Some people believe tenants should have the right to keep pets in apartment buildings, as pets improve mental health and quality of life. Others believe building managers should have the authority to ban pets because they cause noise, property damage, and allergic reactions.

What is your view on pet ownership in apartments?`,
    optionA: 'Tenants should have the right to keep pets in apartments',
    optionB: 'Building managers should have authority to ban pets',
    tone: 'Semi-formal — property and tenant rights opinion',
    criteria: ['Clear position', 'Specific supporting reasons', 'Acknowledges counterargument', 'Nuanced and specific'],
    modelAnswer: `I believe tenants should have the right to keep pets in their homes, subject to reasonable and clearly stated building guidelines — but outright pet bans are excessive and paternalistic.

The benefits of pet ownership are well-established and extend beyond sentiment. Studies consistently show that pets reduce stress, lower blood pressure, decrease feelings of isolation, and improve outcomes for people with depression and anxiety. For many people — particularly those who live alone, the elderly, or those dealing with mental health challenges — a pet is a genuine therapeutic presence.

Blanket bans fail to distinguish between a 70-pound dog and a small indoor cat. They impose the same restriction regardless of circumstance, which is neither fair nor necessary.

I do not dismiss the concerns about noise and property damage. These are legitimate issues and justify reasonable rules: a weight limit for dogs, a requirement for pet deposits, noise curfews, and documentation of liability insurance. These measures address the actual problems.

What they should not justify is treating the desire to live with an animal as a privilege that landlords can arbitrarily revoke. Housing is a human need, and the way we live in our homes — including the company we keep — should be as protected as possible.`,
  },
  {
    id: 'w2_19', num: 19, section: 'W2', difficulty: 'intermediate',
    title: 'Free Public Wi-Fi Priorities',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Digital Equity & Public Policy',
    prompt: `A city digital access committee is surveying residents:

Some people believe the city's top priority for free public Wi-Fi should be low-income neighbourhoods and community centres. Others believe the city should focus on high-traffic public spaces like transit stations, parks, and downtown areas to benefit the largest number of users.

What do you think should be the top priority for public Wi-Fi expansion?`,
    optionA: 'Prioritize low-income neighbourhoods and community centres',
    optionB: 'Prioritize high-traffic public spaces for the most users',
    tone: 'Semi-formal — digital equity and public policy opinion',
    criteria: ['Clear position', 'Equity vs. efficiency reasoning addressed', 'Specific and practical', 'Well-organised'],
    modelAnswer: `I believe free public Wi-Fi should be prioritised in low-income neighbourhoods and community centres, because access to the internet is now a basic necessity — not a luxury — and the people who need it most are those who currently have the least access.

Residents in high-traffic downtown areas and transit stations are overwhelmingly more likely to already have smartphone data plans and home broadband. For them, free public Wi-Fi is a convenience. For families in lower-income neighbourhoods who cannot afford home internet, it can mean the difference between accessing government services, applying for jobs, completing school assignments, or remaining digitally excluded.

The equity argument is compelling on its own, but the economic case reinforces it. Digital exclusion directly limits employment, education, and social mobility — outcomes that cost the city far more in social services over time than the upfront investment in Wi-Fi infrastructure in underserved communities.

Extending free Wi-Fi to tourist destinations and downtown parks is a perfectly sensible long-term goal. But using limited public funds to prioritise the already-connected — simply because they are numerous — inverts the purpose of public investment. Public services exist precisely to serve those who could not otherwise afford to serve themselves.`,
  },
  {
    id: 'w2_20', num: 20, section: 'W2', difficulty: 'advanced',
    title: 'Remote Work vs. Office',
    type: 'writing',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Survey — Workplace Culture',
    prompt: `A national debate organization is asking participants to share their views:

Remote work has become common since 2020. Some people believe it is a permanent positive shift that benefits employee wellbeing, productivity, and work-life balance. Others argue that office work is essential for collaboration, company culture, and mentoring junior staff.

What is your view? Is remote work a positive long-term shift, or should offices remain central?`,
    optionA: 'Remote work is a positive long-term shift that should be widely adopted',
    optionB: 'Office-based work should remain central to how we work',
    tone: 'Semi-formal — workplace culture opinion with depth',
    criteria: ['Clear position', 'Nuanced — acknowledges trade-offs', 'Specific professional context', 'Well-structured argument'],
    modelAnswer: `I believe remote work represents a genuinely positive and permanent shift in how knowledge workers can be employed — but I want to qualify that view carefully, because the strongest arguments on this topic are more nuanced than either camp often acknowledges.

The productivity case for remote work is now well-established. Multiple large-scale studies — including Stanford economist Nicholas Bloom's work — show that remote workers in structured roles are more productive, not less, when measured by output rather than presence. Eliminating commute time alone recovers 60 to 90 minutes of daily energy that most workers invest in better work, health, and family.

However, I think remote work advocates often underestimate the real costs to junior employees and team culture. New professionals learn primarily through informal observation, spontaneous mentoring conversations, and social integration — all of which are meaningfully harder to replicate at home. A fully remote company that does not actively design for connection will see its culture erode over time.

The answer is not a binary choice. A hybrid model — with intentional in-person time built around collaboration, onboarding, and culture — captures the benefits of both while mitigating the drawbacks. The future of work is flexible, not fully remote or fully in-office. Employers who understand this will attract and retain the best people.`,
  },
]

// Combine into WRITING_SETS shape used by PracticeLayout
const WRITING_SETS = {
  W1: W1_QUESTIONS,
  W2: W2_QUESTIONS,
}

/* ══════════════════════════════════════════════════════════════
   AI SCORING — STUB (replace with real API in next iteration)
══════════════════════════════════════════════════════════════ */
async function scoreWithAI(responseText, prompt, criteria, taskType) {
  try {
    const res = await fetch('/api/score-writing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responseText, prompt, criteria, taskType }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Scoring failed')
    }
    return await res.json()
  } catch (err) {
    console.error('AI scoring error:', err)
    // Fallback: return error state so UI can handle it
    return {
      overall: 0,
      clbBand: '–',
      scores: { taskFulfillment: 0, coherence: 0, vocabulary: 0, readability: 0 },
      feedback: `Scoring unavailable: ${err.message}. Please try again.`,
      suggestions: [],
      error: true,
    }
  }
}

/* ── AI Feedback Panel ─────────────────────────────────────── */
function AIFeedbackPanel({ result, color, onClose }) {
  if (!result) return null
  const CRITERIA_LABELS = {
    taskFulfillment: 'Task Fulfillment',
    coherence: 'Coherence & Organization',
    vocabulary: 'Vocabulary Range',
    readability: 'Readability & Grammar',
  }
  const bandColor = result.overall >= 9 ? '#2D8A56' : result.overall >= 7 ? '#4A90D9' : result.overall >= 5 ? '#C8972A' : '#C8102E'
  return (
    <motion.div
      className="wl-ai-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="wl-ai-header">
        <div className="wl-ai-title">
          <span className="wl-ai-icon">🤖</span>
          <span>AI Score & Feedback</span>
        </div>
        <button className="wl-ai-close" onClick={onClose}>✕</button>
      </div>
      {/* Overall band */}
      <div className="wl-ai-band" style={{ borderColor: bandColor }}>
        <div className="wl-ai-band-score" style={{ color: bandColor }}>{result.overall}</div>
        <div className="wl-ai-band-label">
          <span>Estimated CLB Band</span>
          <strong style={{ color: bandColor }}>CLB {result.clbBand}</strong>
        </div>
      </div>
      {/* Score bars */}
      <div className="wl-ai-scores">
        {Object.entries(result.scores).map(([key, val]) => {
          const pct = Math.min((val / 12) * 100, 100)
          const barColor = val >= 9 ? '#2D8A56' : val >= 7 ? '#4A90D9' : val >= 5 ? '#C8972A' : '#C8102E'
          return (
            <div key={key} className="wl-ai-score-row">
              <div className="wl-ai-score-label">
                <span>{CRITERIA_LABELS[key] || key}</span>
                <span className="wl-ai-score-val" style={{ color: barColor }}>{val}/12</span>
              </div>
              <div className="wl-ai-score-track">
                <motion.div
                  className="wl-ai-score-fill"
                  style={{ background: barColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                />
              </div>
            </div>
          )
        })}
      </div>
      {/* Feedback */}
      <div className="wl-ai-feedback">
        <div className="wl-ai-feedback-label">📝 Feedback</div>
        <p>{result.feedback}</p>
      </div>
      {/* Suggestions */}
      <div className="wl-ai-suggestions">
        <div className="wl-ai-suggestions-label">💡 Suggestions</div>
        <ul>
          {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════
   WRITING LAYOUT — Test-like 3-panel: sidebar + prompt + editor
   ┌────────┬───────────────────────────┐
   │ TOPICS │ PROMPT + EDITOR + AI      │
   │ 1–20   │                           │
   │ w/diff │                           │
   └────────┴───────────────────────────┘
══════════════════════════════════════════════════════════════ */
function WritingLayout({ questions, color, partId, partLabel, partIcon }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [responses, setResponses] = useState({})   // { [idx]: text }
  const [timeLeft, setTimeLeft]   = useState(null)
  const [started, setStarted]     = useState(false)
  const [overtime, setOvertime]   = useState(0)
  const [showBanner, setShowBanner] = useState(false)
  const [aiResult, setAiResult]   = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [showModel, setShowModel] = useState(false)
  const timerRef = useRef(null)
  const otRef    = useRef(null)

  const sorted = [...questions].sort((a, b) => a.num - b.num)
  const q = sorted[activeIdx]
  const text = responses[activeIdx] || ''
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  /* Sidebar helpers */
  const completedCount = sorted.filter((_, i) => !!(responses[i] && responses[i].trim())).length
  const DIFF_COLORS = { easy: '#2D8A56', intermediate: '#C8972A', advanced: '#C8102E' }

  const switchQ = (idx) => {
    setActiveIdx(idx)
    setAiResult(null)
    setShowModel(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (otRef.current) clearInterval(otRef.current)
    setTimeLeft(null)
    setOvertime(0)
    setStarted(false)
    setShowBanner(false)
  }

  const startTimer = () => {
    const mins = q.section === 'W1' ? 27 : 26
    setTimeLeft(mins * 60)
    setStarted(true)
    setOvertime(0)
    setShowBanner(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (otRef.current) clearInterval(otRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setShowBanner(true)
          otRef.current = setInterval(() => setOvertime(o => o + 1), 1000)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  const fmtTime = (secs) => {
    if (secs === null) return '--:--'
    const m = Math.floor(Math.abs(secs) / 60)
    const s = Math.abs(secs) % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleAIScore = async () => {
    if (!text.trim() || aiLoading) return
    setAiLoading(true)
    setAiResult(null)
    const result = await scoreWithAI(text, q.prompt, q.criteria, q.section)
    setAiResult(result)
    setAiLoading(false)
  }

  const timeCritical = timeLeft !== null && timeLeft <= 120 && timeLeft > 0
  const timeAmber    = timeLeft !== null && timeLeft <= 300 && timeLeft > 120
  const timeUp       = timeLeft === 0
  const timerColor   = timeUp ? '#999' : timeCritical ? '#C8102E' : timeAmber ? '#C8972A' : color

  const diffC = DIFF_COLOURS[q?.difficulty] || DIFF_COLOURS.medium

  return (
    <div className="wl-shell">
      {/* ── SIDEBAR ── */}
      <aside className="wl-sidebar">
        <div className="wl-sidebar-header">
          <div className="wl-sidebar-icon">{partIcon}</div>
          <div className="wl-sidebar-header-text">
            <div className="wl-sidebar-title" style={{ color }}>{partId}</div>
            <div className="wl-sidebar-label-text">{partLabel}</div>
          </div>
        </div>

        <div className="wl-sidebar-stats">
          <div className="wl-sidebar-stat">
            <span className="wl-sidebar-stat-val">{completedCount}</span>
            <span className="wl-sidebar-stat-lbl">Done</span>
          </div>
          <div className="wl-sidebar-stat-divider" />
          <div className="wl-sidebar-stat">
            <span className="wl-sidebar-stat-val">{sorted.length}</span>
            <span className="wl-sidebar-stat-lbl">Total</span>
          </div>
          <div className="wl-sidebar-stat-divider" />
          <div className="wl-sidebar-stat">
            <span className="wl-sidebar-stat-val">{q.section === 'W1' ? '27' : '26'}</span>
            <span className="wl-sidebar-stat-lbl">Min</span>
          </div>
        </div>

        <div className="wl-sidebar-progress-wrap">
          <div className="wl-sidebar-progress-bar">
            <div className="wl-sidebar-progress-fill" style={{ width: `${sorted.length > 0 ? (completedCount / sorted.length) * 100 : 0}%`, background: color }} />
          </div>
        </div>

        <div className="wl-sidebar-list-label">Writing Tasks</div>
        <div className="wl-topic-list">
          {sorted.map((item, idx) => {
            const isActive = idx === activeIdx
            const hasResponse = !!(responses[idx] && responses[idx].trim())
            const dc = DIFF_COLORS[item.difficulty] || DIFF_COLORS.easy
            return (
              <button
                key={item.id}
                className={`wl-topic-row${isActive ? ' wl-topic-row--active' : ''}${hasResponse ? ' wl-topic-row--done' : ''}`}
                style={isActive ? { borderLeftColor: color } : {}}
                onClick={() => switchQ(idx)}
              >
                <span className="wl-topic-num" style={isActive ? { background: color } : hasResponse ? { background: '#22c55e' } : {}}>{item.num}</span>
                <div className="wl-topic-info">
                  <span className="wl-topic-title">{item.title}</span>
                  <span className="wl-topic-meta">
                    <span className="wl-topic-diff-dot" style={{ background: dc }} />
                    <span style={{ color: dc }}>{item.difficulty}</span>
                  </span>
                </div>
                {hasResponse && <span className="wl-topic-check">{'\u2713'}</span>}
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="wl-main">
        {/* Top bar */}
        <div className="wl-topbar">
          <div className="wl-topbar-left">
            <span className="wl-q-num-badge" style={{ background: color }}>Q{q.num}</span>
            <div className="wl-topbar-title-group">
              <span className="wl-q-title">{q.title}</span>
              <span className="wl-topbar-set-tag">Task {activeIdx + 1} of {sorted.length}</span>
            </div>
            <span className="wl-q-diff" style={{ background: diffC.bg, color: diffC.text }}>
              {q.difficulty?.charAt(0).toUpperCase() + q.difficulty?.slice(1)}
            </span>
          </div>
          <div className="wl-topbar-right">
            {/* Word count badge */}
            {wordCount > 0 && (
              <div className={`wl-wc-badge${wordCount >= 150 && wordCount <= 200 ? ' wl-wc-badge--good' : wordCount > 200 ? ' wl-wc-badge--over' : ''}`}>
                {wordCount} words
              </div>
            )}
            {started ? (
              <div className={`wl-timer${timeCritical ? ' wl-timer--critical' : ''}${timeUp ? ' wl-timer--up' : ''}`} style={{ color: timerColor, borderColor: timerColor }}>
                <span className="wl-timer-icon">{'\u23F1'}</span>
                {timeUp ? (
                  <span className="wl-timer-digits">+{fmtTime(overtime)}</span>
                ) : (
                  <span className="wl-timer-digits">{fmtTime(timeLeft)}</span>
                )}
                {timeUp && <span className="wl-timer-up-label">overtime</span>}
              </div>
            ) : (
              <button className="wl-start-btn" style={{ background: color }} onClick={startTimer}>
                {'\u25B6'} Start Timer ({q.section === 'W1' ? '27' : '26'} min)
              </button>
            )}
          </div>
        </div>

        {/* Time nudges */}
        {timeAmber && !timeUp && (
          <div className="wl-nudge wl-nudge--amber">{'\u23F3'} 5 minutes remaining — wrap up your response!</div>
        )}
        {timeCritical && !timeUp && (
          <div className="wl-nudge wl-nudge--red">{'\uD83D\uDD25'} Under 2 minutes left — finish your last sentence!</div>
        )}
        {showBanner && (
          <div className="wl-banner">
            <span>{'\u23F0'} Time is up! On the real exam you would stop here. But this is practice — take your time.</span>
            <button className="wl-banner-close" onClick={() => setShowBanner(false)}>{'\u2715'}</button>
          </div>
        )}

        {/* Prompt */}
        <div className="wl-prompt-box">
          <div className="wl-prompt-label" style={{ color }}>
            {q.section === 'W1' ? '\u2709 Email Prompt' : '\uD83D\uDCCB Survey Prompt'}
          </div>
          <div className="wl-prompt-scenario">{q.scenario}</div>
          <pre className="wl-prompt-text">{q.prompt}</pre>
          {q.bulletPoints && (
            <ul className="wl-bullet-list">
              {q.bulletPoints.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          )}
          {q.optionA && (
            <div className="wl-options-row">
              <div className="wl-option-pill"><strong>Option A:</strong> {q.optionA}</div>
              <div className="wl-option-pill"><strong>Option B:</strong> {q.optionB}</div>
            </div>
          )}
          <div className="wl-prompt-meta">
            <span>{'\uD83D\uDDE3\uFE0F'} {q.tone}</span>
            <span>{'\uD83C\uDFAF'} 150–200 words</span>
          </div>
        </div>

        {/* Scoring criteria */}
        {q.criteria && (
          <div className="wl-criteria">
            <span className="wl-criteria-label">Scoring Criteria:</span>
            {q.criteria.map(c => <span key={c} className="wl-criteria-tag" style={{ background: `${color}18`, color }}>{c}</span>)}
          </div>
        )}

        {/* Editor */}
        <div className="wl-editor">
          <textarea
            className="wl-textarea"
            value={text}
            onChange={e => setResponses(r => ({ ...r, [activeIdx]: e.target.value }))}
            placeholder="Write your response here…"
            rows={14}
            style={{ borderColor: text ? color : undefined }}
          />
          <div className="wl-editor-footer">
            <span className={`wl-word-count${wordCount >= 150 && wordCount <= 200 ? ' wl-wc--good' : wordCount > 200 ? ' wl-wc--over' : ''}`}>
              {wordCount} words
              {wordCount >= 150 && wordCount <= 200 && ' \u2713'}
              {wordCount > 200 && ' — over limit'}
              {wordCount > 0 && wordCount < 150 && ` — ${150 - wordCount} more needed`}
            </span>
            <div className="wl-editor-actions">
              <button
                className="wl-ai-btn"
                style={{ background: aiLoading ? '#aaa' : color }}
                onClick={handleAIScore}
                disabled={aiLoading || !text.trim()}
              >
                {aiLoading ? '\u23F3 Scoring…' : '\uD83E\uDD16 Get AI Score'}
              </button>
            </div>
          </div>
        </div>

        {/* AI Feedback */}
        <AnimatePresence>
          {aiResult && (
            <AIFeedbackPanel result={aiResult} color={color} onClose={() => setAiResult(null)} />
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="wl-nav">
          <button
            className="wl-nav-btn"
            onClick={() => switchQ(Math.max(0, activeIdx - 1))}
            disabled={activeIdx === 0}
          >
            {'\u2190'} Previous
          </button>
          <span className="wl-nav-counter" style={{ color }}>{partId} · Task {activeIdx + 1} of {sorted.length}</span>
          <button
            className="wl-nav-btn wl-nav-btn--next"
            style={{ background: color, borderColor: color }}
            onClick={() => switchQ(Math.min(sorted.length - 1, activeIdx + 1))}
            disabled={activeIdx === sorted.length - 1}
          >
            Next {'\u2192'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   LISTENING LAYOUT — Simulation Mode
   Audio playback → Transcript highlight → Questions → Live scoring
   → Completion panel with CLB estimate, skill breakdown, motivation
══════════════════════════════════════════════════════════════ */
function ListeningLayout({ color, partId }) {
  const part = LISTENING_DATA[partId]
  if (!part) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>No data available for {partId}.</div>

  const [activeSetIdx, setActiveSetIdx]     = useState(0)
  const [answers, setAnswers]               = useState({})
  const [timeLeft, setTimeLeft]             = useState(null)
  const [started, setStarted]               = useState(false)
  const [overtime, setOvertime]             = useState(0)
  const [showBanner, setShowBanner]         = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)

  /* Audio state */
  const [audioPhase, setAudioPhase]       = useState('idle') // idle | playing | done
  const [currentLineIdx, setCurrentLineIdx] = useState(-1)
  const [audioError, setAudioError]       = useState(false)
  const audioRef           = useRef(null)
  const lineIdxRef         = useRef(-1)
  const timerRef           = useRef(null)
  const otRef              = useRef(null)
  const transcriptBodyRef  = useRef(null)
  const transcriptLineRefs = useRef([])
  const activeSetRef       = useRef(activeSetIdx)
  const startTimerRef      = useRef(null)
  activeSetRef.current     = activeSetIdx

  const set   = part.sets[activeSetIdx]
  const qs    = set.questions
  const total = qs.length

  /* Helpers — scoped to current set only */
  const aKey       = (qi) => `${activeSetIdx}_${qi}`
  const doneCount  = qs.filter((_, qi) => answers[aKey(qi)] !== undefined).length
  const correctCnt = qs.filter((q, qi) => { const a = answers[aKey(qi)]; return a !== undefined && a === q.answer }).length
  const isSetDone  = doneCount === total
  const scorePct   = total > 0 ? Math.round((correctCnt / total) * 100) : 0

  /* Per-set sidebar helpers */
  const sidebarDone    = (si) => part.sets[si].questions.filter((_, qi) => answers[`${si}_${qi}`] !== undefined).length
  const sidebarCorrect = (si) => part.sets[si].questions.filter((q, qi) => { const a = answers[`${si}_${qi}`]; return a !== undefined && a === q.answer }).length
  const sidebarIsDone  = (si) => sidebarDone(si) === part.sets[si].questions.length
  const completedSets  = part.sets.filter((_, si) => sidebarIsDone(si)).length

  /* ── Audio path builder ── */
  const getAudioPath = (setNum, lineIdx) => {
    const sn = String(setNum).padStart(2, '0')
    const ln = String(lineIdx).padStart(2, '0')
    return `/audio/${partId}/set-${sn}/line-${ln}.mp3`
  }

  /* ── Play audio from a specific line ── */
  const playFromLine = (idx) => {
    const curSet = part.sets[activeSetRef.current]
    if (!audioRef.current || !curSet || !curSet.transcript || idx >= curSet.transcript.length) {
      setAudioPhase('done')
      setCurrentLineIdx(-1)
      lineIdxRef.current = -1
      return
    }
    lineIdxRef.current = idx
    setCurrentLineIdx(idx)
    const audio = audioRef.current
    audio.src = getAudioPath(curSet.setNumber, idx)
    audio.play().catch(() => {
      /* file may not exist — skip to next */
      setTimeout(() => playFromLine(idx + 1), 250)
    })
  }

  /* ── Audio event listeners ── */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const advance = () => {
      const curSet = part.sets[activeSetRef.current]
      const next = lineIdxRef.current + 1
      if (curSet && curSet.transcript && next < curSet.transcript.length) {
        playFromLine(next)
      } else {
        setAudioPhase('done')
        setCurrentLineIdx(-1)
        lineIdxRef.current = -1
        /* Official test flow: timer starts only after audio finishes */
        if (startTimerRef.current) startTimerRef.current()
      }
    }
    const onEnded = () => advance()
    const onError = () => { setAudioError(true); advance() }
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    return () => { audio.removeEventListener('ended', onEnded); audio.removeEventListener('error', onError) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Auto-scroll transcript to active line ── */
  useEffect(() => {
    if (currentLineIdx >= 0 && transcriptLineRefs.current[currentLineIdx] && transcriptBodyRef.current) {
      const el = transcriptLineRefs.current[currentLineIdx]
      const container = transcriptBodyRef.current
      const top = el.offsetTop - container.offsetTop - container.clientHeight / 2 + el.clientHeight / 2
      container.scrollTo({ top, behavior: 'smooth' })
    }
  }, [currentLineIdx])

  /* ── Start audio (timer starts after audio ends, like the real test) ── */
  const startAudio = () => {
    setAudioPhase('playing')
    setAudioError(false)
    playFromLine(0)
  }

  /* ── Timer ── */
  const startTimer = () => {
    const mins = part.timeLimitMinutes
    setTimeLeft(mins * 60)
    setStarted(true)
    setOvertime(0)
    setShowBanner(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (otRef.current) clearInterval(otRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setShowBanner(true)
          otRef.current = setInterval(() => setOvertime(o => o + 1), 1000)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }
  startTimerRef.current = startTimer

  const fmtTime = (secs) => {
    if (secs === null) return '--:--'
    const m = Math.floor(Math.abs(secs) / 60)
    const s = Math.abs(secs) % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  /* ── Reset current set (reattempt) ── */
  const reattemptSet = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.removeAttribute('src') }
    setAnswers(a => {
      const next = { ...a }
      qs.forEach((_, qi) => { delete next[aKey(qi)] })
      return next
    })
    setShowBanner(false)
    setShowCompletion(false)
    setAudioPhase('idle')
    setCurrentLineIdx(-1)
    lineIdxRef.current = -1
    setShowTranscript(false)
    setAudioError(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (otRef.current) clearInterval(otRef.current)
    setTimeLeft(null)
    setOvertime(0)
    setStarted(false)
  }

  /* ── Switch set ── */
  const switchSet = (si) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.removeAttribute('src') }
    setActiveSetIdx(si)
    setShowBanner(false)
    setShowCompletion(false)
    setAudioPhase('idle')
    setCurrentLineIdx(-1)
    lineIdxRef.current = -1
    setShowTranscript(false)
    setAudioError(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (otRef.current) clearInterval(otRef.current)
    setTimeLeft(null)
    setOvertime(0)
    setStarted(false)
  }

  /* ── Answer handler ── */
  const handleAnswer = (qi, optIdx) => {
    const key = aKey(qi)
    if (answers[key] !== undefined) return
    setAnswers(a => ({ ...a, [key]: optIdx }))
  }

  /* ── Stop timer & show completion when set is done ── */
  useEffect(() => {
    if (isSetDone && !showCompletion) {
      if (timerRef.current) clearInterval(timerRef.current)
      if (otRef.current) clearInterval(otRef.current)
      const t = setTimeout(() => setShowCompletion(true), 500)
      return () => clearTimeout(t)
    }
  }, [isSetDone]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── CLB estimate ── */
  const getCLB = (pct) => {
    if (pct >= 95) return { level: '10–12', label: 'Advanced' }
    if (pct >= 85) return { level: '9', label: 'Proficient' }
    if (pct >= 75) return { level: '8', label: 'Upper Intermediate' }
    if (pct >= 65) return { level: '7', label: 'Intermediate' }
    if (pct >= 55) return { level: '6', label: 'Lower Intermediate' }
    if (pct >= 45) return { level: '5', label: 'Elementary' }
    if (pct >= 30) return { level: '4', label: 'Beginner' }
    return { level: '3', label: 'Developing' }
  }

  /* ── Motivation ── */
  const getMotivation = (pct) => {
    if (pct === 100)  return { emoji: '\uD83C\uDFC6', title: 'Perfect Score!', msg: 'Flawless — you nailed every question. You\'re test-ready for this part.' }
    if (pct >= 85)    return { emoji: '\u2B50', title: 'Excellent!', msg: 'Outstanding performance. A few more sets at this level and you\'re golden.' }
    if (pct >= 70)    return { emoji: '\uD83D\uDCAA', title: 'Strong Work!', msg: 'Solid result. Review the ones you missed — they tend to be the trickiest.' }
    if (pct >= 50)    return { emoji: '\uD83D\uDCC8', title: 'Good Progress!', msg: 'You\'re building real skills. Focus on detail recall and inference to level up.' }
    if (pct >= 30)    return { emoji: '\uD83D\uDD25', title: 'Keep Going!', msg: 'Every set makes you stronger. Re-read explanations and try again.' }
    return { emoji: '\uD83D\uDCA1', title: 'Learning Mode!', msg: 'No worries — practice is how you improve. Listen again and study the transcript.' }
  }

  /* ── Constants ── */
  const LETTERS = ['A', 'B', 'C', 'D']
  const SKILL_LABELS = {
    main_idea: 'Main Idea', detail_recall: 'Detail Recall', decision_tracking: 'Decision Tracking',
    speaker_intent: 'Speaker Intent', implied_meaning: 'Implied Meaning', inference: 'Inference',
    tone_recognition: 'Tone', sequencing: 'Sequencing', specific_fact: 'Specific Fact',
    fact_extraction: 'Fact Extraction', context_inference: 'Context Inference', formal_language: 'Formal Language',
    speaker_attitude: 'Speaker Attitude', vocab_context: 'Vocabulary',
  }
  const DIFF_COLORS = { easy: '#2D8A56', intermediate: '#C8972A', advanced: '#C8102E' }
  const timeCritical = timeLeft !== null && timeLeft <= 60 && timeLeft > 0
  const timeAmber    = timeLeft !== null && timeLeft <= 300 && timeLeft > 60
  const timeUp       = timeLeft === 0
  const timerColor   = timeUp ? '#999' : timeCritical ? '#C8102E' : timeAmber ? '#C8972A' : color

  return (
    <div className="ll-shell">
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="none" />

      {/* ── SIDEBAR — only this part's sets ── */}
      <aside className="ll-sidebar">
        <div className="ll-sidebar-header">
          <div className="ll-sidebar-icon">{part.icon}</div>
          <div className="ll-sidebar-header-text">
            <div className="ll-sidebar-title" style={{ color }}>{part.partId}</div>
            <div className="ll-sidebar-label">{part.partLabel}</div>
          </div>
        </div>

        <div className="ll-sidebar-stats">
          <div className="ll-sidebar-stat">
            <span className="ll-sidebar-stat-val">{completedSets}</span>
            <span className="ll-sidebar-stat-lbl">Done</span>
          </div>
          <div className="ll-sidebar-stat-divider" />
          <div className="ll-sidebar-stat">
            <span className="ll-sidebar-stat-val">{part.sets.length}</span>
            <span className="ll-sidebar-stat-lbl">Total</span>
          </div>
          <div className="ll-sidebar-stat-divider" />
          <div className="ll-sidebar-stat">
            <span className="ll-sidebar-stat-val">{part.questionCount}</span>
            <span className="ll-sidebar-stat-lbl">Qs/set</span>
          </div>
        </div>

        <div className="ll-sidebar-progress-wrap">
          <div className="ll-sidebar-progress-bar">
            <div className="ll-sidebar-progress-fill" style={{ width: `${part.sets.length > 0 ? (completedSets / part.sets.length) * 100 : 0}%`, background: color }} />
          </div>
        </div>

        <div className="ll-sidebar-list-label">Practice Sets</div>
        <div className="ll-part-list">
          {part.sets.map((s, si) => {
            const isActive = si === activeSetIdx
            const done = sidebarDone(si)
            const allDone = sidebarIsDone(si)
            const correct = sidebarCorrect(si)
            const dc = DIFF_COLORS[s.difficulty] || DIFF_COLORS.easy
            return (
              <button
                key={si}
                className={`ll-set-row${isActive ? ' ll-set-row--active' : ''}${allDone ? ' ll-set-row--done' : ''}`}
                style={isActive ? { borderLeftColor: color } : {}}
                onClick={() => switchSet(si)}
              >
                <span className="ll-set-num" style={isActive ? { background: color } : allDone ? { background: '#22c55e' } : {}}>{s.setNumber}</span>
                <div className="ll-set-info">
                  <span className="ll-set-title">{s.title}</span>
                  <span className="ll-set-meta">
                    <span className="ll-set-diff-dot" style={{ background: dc }} />
                    <span style={{ color: dc }}>{s.difficulty}</span>
                    {allDone && <span className="ll-set-score" style={{ color: correct === s.questions.length ? '#22c55e' : '#888' }}>{correct}/{s.questions.length}</span>}
                    {!allDone && done > 0 && <span className="ll-set-score">{done}/{s.questions.length}</span>}
                  </span>
                </div>
                {allDone && <span className="ll-set-check">{'\u2713'}</span>}
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="ll-main">
        {/* Top bar */}
        <div className="ll-topbar">
          <div className="ll-topbar-left">
            <span className="ll-part-badge" style={{ background: color }}>{part.partId}</span>
            <div className="ll-topbar-title-group">
              <span className="ll-topbar-title">{set.title}</span>
              <span className="ll-topbar-set-tag">Set {set.setNumber} of {part.sets.length}</span>
              <span className="ll-topbar-diff" style={{ color: DIFF_COLORS[set.difficulty] || '#888' }}>{set.difficulty}</span>
            </div>
          </div>
          <div className="ll-topbar-right">
            {/* Live score */}
            {doneCount > 0 && (
              <div className="ll-live-score" style={{ borderColor: color }}>
                <span className="ll-live-score-num" style={{ color }}>{correctCnt}/{doneCount}</span>
                <span className="ll-live-score-pct" style={{ color: scorePct >= 70 ? '#22c55e' : scorePct >= 50 ? '#C8972A' : '#C8102E' }}>{scorePct}%</span>
              </div>
            )}
            {started ? (
              <div className={`ll-timer${timeCritical ? ' ll-timer--critical' : ''}${timeUp ? ' ll-timer--up' : ''}`} style={{ color: timerColor, borderColor: timerColor }}>
                <span className="ll-timer-icon">{'\u23F1'}</span>
                {timeUp ? (
                  <span className="ll-timer-digits">+{fmtTime(overtime)}</span>
                ) : (
                  <span className="ll-timer-digits">{fmtTime(timeLeft)}</span>
                )}
                {timeUp && <span className="ll-timer-up-label">overtime</span>}
              </div>
            ) : (
              <button className="ll-start-btn" style={{ background: color }} onClick={startAudio}>
                {'\u25B6'} Listen & Start ({part.timeLimitMinutes} min)
              </button>
            )}
          </div>
        </div>

        {/* Time nudges */}
        {timeAmber && !timeUp && (
          <div className="ll-nudge ll-nudge--amber">{'\u23F3'} 5 minutes remaining — keep a steady pace!</div>
        )}
        {timeCritical && !timeUp && (
          <div className="ll-nudge ll-nudge--red">{'\uD83D\uDD25'} Under 1 minute left — trust your instincts!</div>
        )}
        {showBanner && (
          <div className="ll-banner">
            <span>{'\u23F0'} Time is up! On the real exam you would stop here. But this is practice — take your time.</span>
            <button className="ll-banner-close" onClick={() => setShowBanner(false)}>{'\u2715'}</button>
          </div>
        )}

        {/* Context */}
        <div className="ll-context-box" style={{ borderLeftColor: color }}>
          <p className="ll-context-text">{set.context}</p>
          {set.speakers && set.speakers.length > 0 && (
            <div className="ll-speakers">
              {set.speakers.map(sp => (
                <span key={sp.id} className="ll-speaker-tag">
                  <span className="ll-speaker-id" style={{ background: color }}>{sp.id}</span>
                  {sp.name} — {sp.role}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Audio Player Bar ── */}
        {audioPhase === 'idle' && !started && (
          <div className="ll-audio-cta" style={{ borderColor: `${color}44` }}>
            <div className="ll-audio-cta-icon">{'\uD83C\uDFA7'}</div>
            <div className="ll-audio-cta-text">
              <strong>Press "Listen & Start" to begin the simulation</strong>
              <span>Listen to the full audio first — questions appear after the audio ends, just like the real test.</span>
            </div>
          </div>
        )}

        {audioPhase === 'playing' && (
          <div className="ll-audio-bar ll-audio-bar--playing" style={{ borderColor: color, background: `${color}0a` }}>
            <span className="ll-audio-pulse" style={{ background: color }} />
            <span className="ll-audio-bar-text">{'\uD83D\uDD0A'} Playing line {currentLineIdx + 1} of {set.transcript.length}…</span>
          </div>
        )}

        {audioPhase === 'done' && (
          <div className="ll-audio-bar ll-audio-bar--done">
            <span>{'\u2705'} Audio complete — your time has started. Answer the questions below.</span>
            <button className="ll-audio-replay" style={{ color }} onClick={() => { setAudioPhase('playing'); setAudioError(false); playFromLine(0) }}>{'\uD83D\uDD01'} Replay</button>
          </div>
        )}

        {audioError && (
          <div className="ll-audio-bar ll-audio-bar--error">
            {'\u26A0\uFE0F'} Some audio files could not be loaded. You can still practice using the transcript.
          </div>
        )}

        {/* ── Transcript (hidden by default — user toggles) ── */}
        {audioPhase !== 'idle' && set.transcript && (
          <div className="ll-transcript-box">
            <div className="ll-transcript-header">
              <span className="ll-transcript-label" style={{ color }}>{'\uD83C\uDFA7'} Transcript</span>
              <button className="ll-transcript-toggle" onClick={() => setShowTranscript(!showTranscript)}>
                {showTranscript ? 'Hide' : 'Show'}
              </button>
            </div>
            {showTranscript && (
              <>
                <div className="ll-transcript-divider" />
                <div className="ll-transcript-body" ref={transcriptBodyRef}>
                  {set.transcript.map((t, ti) => {
                    const sp = set.speakers ? set.speakers.find(s => s.id === t.speaker) : null
                    const isActive = ti === currentLineIdx
                    return (
                      <div
                        key={ti}
                        ref={el => transcriptLineRefs.current[ti] = el}
                        className={`ll-transcript-line${isActive ? ' ll-transcript-line--active' : ''}`}
                      >
                        <span className="ll-transcript-speaker" style={{ color }}>{sp ? sp.name : t.speaker}:</span>
                        <span className="ll-transcript-text">{t.text}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Questions (revealed only after audio finishes) ── */}
        {audioPhase === 'playing' && (
          <div className="ll-questions-locked" style={{ borderColor: `${color}33` }}>
            <span className="ll-questions-locked-icon">{'🔒'}</span>
            <span className="ll-questions-locked-text">Questions will appear after the audio finishes</span>
          </div>
        )}
        {(audioPhase === 'done' || (audioPhase === 'idle' && doneCount > 0)) && (
        <div className="ll-questions">
          <div className="ll-questions-header">
            <span className="ll-questions-label">Questions ({total})</span>
            {doneCount > 0 && <span className="ll-questions-progress">{doneCount}/{total} answered</span>}
          </div>
          {qs.map((q, qi) => {
            const key = aKey(qi)
            const ans = answers[key]
            const answered = ans !== undefined
            const correct = answered && ans === q.answer
            return (
              <div key={qi} className={`ll-q-card${answered ? (correct ? ' ll-q-card--correct' : ' ll-q-card--wrong') : ''}`}>
                <div className="ll-q-header">
                  <span className="ll-q-num" style={{ background: color }}>Q{q.num}</span>
                  <span className="ll-q-skill-tag">{SKILL_LABELS[q.skill] || q.skill}</span>
                  {answered && (
                    <span className={`ll-q-verdict ${correct ? 'll-q-verdict--ok' : 'll-q-verdict--err'}`}>
                      {correct ? '\u2713 Correct' : '\u2717 Incorrect'}
                    </span>
                  )}
                </div>
                <p className="ll-q-stem">{q.text}</p>
                <div className="ll-q-opts">
                  {q.options.map((opt, oi) => {
                    let cls = 'll-q-opt'
                    if (answered) {
                      if (oi === q.answer)    cls += ' ll-q-opt--correct'
                      else if (oi === ans)    cls += ' ll-q-opt--wrong'
                      else                    cls += ' ll-q-opt--dim'
                    }
                    return (
                      <button key={oi} className={cls} onClick={() => handleAnswer(qi, oi)} disabled={answered}>
                        <span className="ll-q-letter">{LETTERS[oi]}</span>
                        <span className="ll-q-opt-text">{opt}</span>
                      </button>
                    )
                  })}
                </div>
                {answered && !correct && (
                  <div className="ll-q-correct-ans">{'\u2713'} Correct answer: <strong>{q.options[q.answer]}</strong></div>
                )}
              </div>
            )
          })}
        </div>

        )}

        {/* ── Completion Panel ── */}
        <AnimatePresence>
          {showCompletion && (() => {
            const clb = getCLB(scorePct)
            const motiv = getMotivation(scorePct)
            const skillBreakdown = Object.entries(
              qs.reduce((acc, q, qi) => {
                const skill = SKILL_LABELS[q.skill] || q.skill
                if (!acc[skill]) acc[skill] = { total: 0, correct: 0 }
                acc[skill].total++
                if (answers[aKey(qi)] === q.answer) acc[skill].correct++
                return acc
              }, {})
            )
            return (
              <motion.div
                className="ll-completion"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="ll-completion-top" style={{ background: `${color}0c` }}>
                  <span className="ll-completion-emoji">{motiv.emoji}</span>
                  <h3 className="ll-completion-title">{motiv.title}</h3>
                  <p className="ll-completion-msg">{motiv.msg}</p>
                </div>

                <div className="ll-completion-stats">
                  <div className="ll-completion-stat">
                    <span className="ll-completion-stat-val" style={{ color }}>{correctCnt}/{total}</span>
                    <span className="ll-completion-stat-lbl">Correct</span>
                  </div>
                  <div className="ll-completion-stat">
                    <span className="ll-completion-stat-val" style={{ color: scorePct >= 70 ? '#22c55e' : scorePct >= 50 ? '#C8972A' : '#C8102E' }}>{scorePct}%</span>
                    <span className="ll-completion-stat-lbl">Accuracy</span>
                  </div>
                  <div className="ll-completion-stat">
                    <span className="ll-completion-stat-val" style={{ color }}>CLB {clb.level}</span>
                    <span className="ll-completion-stat-lbl">{clb.label}</span>
                  </div>
                  {started && (
                    <div className="ll-completion-stat">
                      <span className="ll-completion-stat-val" style={{ color }}>
                        {timeUp ? `${part.timeLimitMinutes}m + ${fmtTime(overtime)}` : fmtTime(part.timeLimitMinutes * 60 - (timeLeft || 0))}
                      </span>
                      <span className="ll-completion-stat-lbl">Time Used</span>
                    </div>
                  )}
                </div>

                {/* Skill breakdown */}
                <div className="ll-completion-skills">
                  <div className="ll-completion-skills-hdr">Skill Breakdown</div>
                  {skillBreakdown.map(([skill, data]) => {
                    const pct = Math.round((data.correct / data.total) * 100)
                    return (
                      <div key={skill} className="ll-completion-skill-row">
                        <span className="ll-completion-skill-name">{skill}</span>
                        <div className="ll-completion-skill-bar">
                          <div className="ll-completion-skill-fill" style={{ width: `${pct}%`, background: pct === 100 ? '#22c55e' : color }} />
                        </div>
                        <span className="ll-completion-skill-score">{data.correct}/{data.total}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="ll-completion-actions">
                  {activeSetIdx < part.sets.length - 1 && (
                    <button className="ll-completion-next" style={{ background: color }} onClick={() => switchSet(activeSetIdx + 1)}>
                      Next Set {'\u2192'} {part.sets[activeSetIdx + 1]?.title}
                    </button>
                  )}
                  <button className="ll-completion-reattempt" onClick={reattemptSet}>
                    {'\uD83D\uDD04'} Reattempt
                  </button>
                  <button className="ll-completion-dismiss" onClick={() => setShowCompletion(false)}>
                    Review Answers
                  </button>
                </div>
              </motion.div>
            )
          })()}
        </AnimatePresence>

        {/* Collapsed score bar if completion dismissed */}
        {isSetDone && !showCompletion && (
          <div className="ll-score-summary" style={{ borderColor: color }}>
            <span className="ll-score-icon">{'\uD83C\uDFAF'}</span>
            <span className="ll-score-text">
              You scored <strong style={{ color }}>{correctCnt}/{total}</strong> ({scorePct}%) — CLB {getCLB(scorePct).level}
            </span>
            <button className="ll-score-reattempt-btn" onClick={reattemptSet}>{'\uD83D\uDD04'} Reattempt</button>
            <button className="ll-score-details-btn" style={{ color }} onClick={() => setShowCompletion(true)}>View Details</button>
          </div>
        )}

        {/* Navigation */}
        <div className="ll-nav">
          <button className="ll-nav-btn" onClick={() => switchSet(activeSetIdx - 1)} disabled={activeSetIdx === 0}>
            {'\u2190'} Previous Set
          </button>
          <span className="ll-nav-counter" style={{ color }}>
            {part.partId} · Set {set.setNumber} of {part.sets.length}
          </span>
          <button
            className="ll-nav-btn ll-nav-btn--next"
            style={{ background: color, borderColor: color }}
            onClick={() => switchSet(activeSetIdx + 1)}
            disabled={activeSetIdx === part.sets.length - 1}
          >
            Next Set {'\u2192'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   READING LAYOUT — Sidebar (R1-R4) + Passage + Questions
   Question types: MCQ, Dropdown (fill blanks), Drag & Drop (matching)
══════════════════════════════════════════════════════════════ */
function ReadingLayout({ color, partId }) {
  const PARTS_ORDER = ['R1', 'R2', 'R3', 'R4']
  const parts = PARTS_ORDER.map(id => READING_DATA[id]).filter(Boolean)
  const initIdx = Math.max(0, PARTS_ORDER.indexOf(partId))

  const [activePartIdx, setActivePartIdx] = useState(initIdx)
  const [activeSetIdx, setActiveSetIdx]   = useState(0)
  const [answers, setAnswers]     = useState({})
  const [timeLeft, setTimeLeft]   = useState(null)
  const [started, setStarted]     = useState(false)
  const [overtime, setOvertime]   = useState(0)
  const [showBanner, setShowBanner] = useState(false)
  const timerRef = useRef(null)
  const otRef    = useRef(null)

  const part = parts[activePartIdx]
  const set  = part.sets[activeSetIdx]
  const qs   = set.questions
  const total = qs.length

  /* answer key */
  const aKey = (pi, si, qi) => `${pi}_${si}_${qi}`
  const setDoneCount = (pi, si) => parts[pi].sets[si].questions.filter((_, qi) => answers[aKey(pi, si, qi)] !== undefined).length
  const setCorrectCount = (pi, si) => {
    return parts[pi].sets[si].questions.reduce((acc, q, qi) => {
      const a = answers[aKey(pi, si, qi)]
      if (a === undefined) return acc
      if (q.type === 'drag_drop') {
        const items = q.matchItems
        return acc + (items.every((item, mi) => (a[mi] || '') === item.answer) ? 1 : 0)
      }
      return acc + (a === q.answer ? 1 : 0)
    }, 0)
  }
  const totalDone = parts.reduce((acc, p, pi) => acc + p.sets.reduce((a2, _, si) => a2 + setDoneCount(pi, si), 0), 0)
  const totalQs   = parts.reduce((acc, p) => acc + p.sets.reduce((a2, s) => a2 + s.questions.length, 0), 0)

  const DIFF_COLORS = { easy: '#2D8A56', intermediate: '#C8972A', advanced: '#C8102E' }

  /* switch */
  const switchTo = (pi, si) => {
    setActivePartIdx(pi)
    setActiveSetIdx(si)
    setShowBanner(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (otRef.current) clearInterval(otRef.current)
    setTimeLeft(null)
    setOvertime(0)
    setStarted(false)
  }

  /* timer */
  const startTimer = () => {
    const mins = part.timeLimitMinutes
    setTimeLeft(mins * 60)
    setStarted(true)
    setOvertime(0)
    setShowBanner(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (otRef.current) clearInterval(otRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setShowBanner(true)
          otRef.current = setInterval(() => setOvertime(o => o + 1), 1000)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  const fmtTime = (secs) => {
    if (secs === null) return '--:--'
    const m = Math.floor(Math.abs(secs) / 60)
    const s = Math.abs(secs) % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const timeCritical = timeLeft !== null && timeLeft <= 60 && timeLeft > 0
  const timeAmber    = timeLeft !== null && timeLeft <= 300 && timeLeft > 60
  const timeUp       = timeLeft === 0
  const timerColor   = timeUp ? '#999' : timeCritical ? '#C8102E' : timeAmber ? '#C8972A' : color

  /* answer handlers */
  const handleMCQ = (qi, optIdx) => {
    const key = aKey(activePartIdx, activeSetIdx, qi)
    if (answers[key] !== undefined) return
    setAnswers(a => ({ ...a, [key]: optIdx }))
  }

  const handleDropdown = (qi, val) => {
    const key = aKey(activePartIdx, activeSetIdx, qi)
    if (answers[key] !== undefined) return
    const idx = parseInt(val, 10)
    if (isNaN(idx)) return
    setAnswers(a => ({ ...a, [key]: idx }))
  }

  const handleDragDrop = (qi, matchIdx, val) => {
    const key = aKey(activePartIdx, activeSetIdx, qi)
    const prev = answers[key] || {}
    const q = qs[qi]
    const allDone = q.matchItems.every((_, mi) => prev[mi] !== undefined)
    if (allDone) return
    const next = { ...prev, [matchIdx]: val }
    setAnswers(a => ({ ...a, [key]: next }))
  }

  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

  /* render a single question */
  const renderQuestion = (q, qi) => {
    const key = aKey(activePartIdx, activeSetIdx, qi)
    const ans = answers[key]

    if (q.type === 'mcq') {
      const answered = ans !== undefined
      const correct  = answered && ans === q.answer
      return (
        <div key={q.id} className={`rl-q-card${answered ? (correct ? ' rl-q-card--correct' : ' rl-q-card--wrong') : ''}`}>
          <div className="rl-q-header">
            <span className="rl-q-num" style={{ background: color }}>Q{q.num}</span>
            <span className="rl-q-type-tag">Multiple Choice</span>
            {answered && (
              <span className={`rl-q-verdict ${correct ? 'rl-q-verdict--ok' : 'rl-q-verdict--err'}`}>
                {correct ? '\u2713 Correct' : '\u2717 Incorrect'}
              </span>
            )}
          </div>
          <p className="rl-q-stem">{q.text}</p>
          <div className="rl-q-opts">
            {q.options.map((opt, oi) => {
              let cls = 'rl-q-opt'
              if (answered) {
                if (oi === q.answer)    cls += ' rl-q-opt--correct'
                else if (oi === ans)    cls += ' rl-q-opt--wrong'
                else                    cls += ' rl-q-opt--dim'
              }
              return (
                <button key={oi} className={cls} onClick={() => handleMCQ(qi, oi)} disabled={answered}>
                  <span className="rl-q-letter">{LETTERS[oi]}</span>
                  <span className="rl-q-opt-text">{opt}</span>
                </button>
              )
            })}
          </div>
          {answered && q.explanation && (
            <div className={`rl-q-expl${correct ? ' rl-q-expl--ok' : ''}`}>
              {!correct && (
                <div className="rl-q-correct-ans">{'\u2713'} Correct answer: <strong>{q.options[q.answer]}</strong></div>
              )}
              <div className="rl-q-expl-body">
                <span className="rl-q-expl-icon">{correct ? '\u2705' : '\uD83D\uDCD8'}</span>
                <span>{q.explanation}</span>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (q.type === 'dropdown') {
      const answered = ans !== undefined
      const correct  = answered && ans === q.answer
      return (
        <div key={q.id} className={`rl-q-card${answered ? (correct ? ' rl-q-card--correct' : ' rl-q-card--wrong') : ''}`}>
          <div className="rl-q-header">
            <span className="rl-q-num" style={{ background: color }}>Q{q.num}</span>
            <span className="rl-q-type-tag rl-q-type-tag--dropdown">Fill in the Blank</span>
            {answered && (
              <span className={`rl-q-verdict ${correct ? 'rl-q-verdict--ok' : 'rl-q-verdict--err'}`}>
                {correct ? '\u2713 Correct' : '\u2717 Incorrect'}
              </span>
            )}
          </div>
          <div className="rl-q-dropdown-stem">
            {q.text.split('______').map((chunk, ci, arr) => (
              <span key={ci}>
                {chunk}
                {ci < arr.length - 1 && (
                  answered ? (
                    <span className={`rl-dd-answer ${correct ? 'rl-dd-answer--ok' : 'rl-dd-answer--err'}`}>
                      {q.options[ans]}
                    </span>
                  ) : (
                    <select
                      className="rl-dd-select"
                      style={{ borderColor: color }}
                      value=""
                      onChange={e => handleDropdown(qi, e.target.value)}
                    >
                      <option value="" disabled>Select...</option>
                      {q.options.map((opt, oi) => (
                        <option key={oi} value={oi}>{opt}</option>
                      ))}
                    </select>
                  )
                )}
              </span>
            ))}
          </div>
          {answered && q.explanation && (
            <div className={`rl-q-expl${correct ? ' rl-q-expl--ok' : ''}`}>
              {!correct && (
                <div className="rl-q-correct-ans">{'\u2713'} Correct answer: <strong>{q.options[q.answer]}</strong></div>
              )}
              <div className="rl-q-expl-body">
                <span className="rl-q-expl-icon">{correct ? '\u2705' : '\uD83D\uDCD8'}</span>
                <span>{q.explanation}</span>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (q.type === 'drag_drop') {
      const selections = ans || {}
      const items = q.matchItems
      const opts = q.paragraphOptions || q.authorOptions || []
      const allDone = items.every((_, mi) => selections[mi] !== undefined)
      const allCorrect = allDone && items.every((item, mi) => selections[mi] === item.answer)
      return (
        <div key={q.id} className={`rl-q-card${allDone ? (allCorrect ? ' rl-q-card--correct' : ' rl-q-card--wrong') : ''}`}>
          <div className="rl-q-header">
            <span className="rl-q-num" style={{ background: color }}>Q{q.num}</span>
            <span className="rl-q-type-tag rl-q-type-tag--dragdrop">Matching</span>
            {allDone && (
              <span className={`rl-q-verdict ${allCorrect ? 'rl-q-verdict--ok' : 'rl-q-verdict--err'}`}>
                {allCorrect ? '\u2713 All Correct' : `${items.filter((item, mi) => selections[mi] === item.answer).length}/${items.length} Correct`}
              </span>
            )}
          </div>
          <p className="rl-q-stem">{q.text}</p>
          <div className="rl-dd-match-list">
            {items.map((item, mi) => {
              const sel = selections[mi]
              const isAnswered = sel !== undefined
              const isCorrect = isAnswered && sel === item.answer
              return (
                <div key={mi} className={`rl-dd-match-row${isAnswered ? (isCorrect ? ' rl-dd-match-row--ok' : ' rl-dd-match-row--err') : ''}`}>
                  <span className="rl-dd-match-num">{mi + 1}.</span>
                  <span className="rl-dd-match-statement">{item.statement}</span>
                  <div className="rl-dd-match-select-wrap">
                    {isAnswered ? (
                      <span className={`rl-dd-match-badge ${isCorrect ? 'rl-dd-match-badge--ok' : 'rl-dd-match-badge--err'}`}>
                        {sel}
                        {!isCorrect && <span className="rl-dd-match-correct"> {'\u2192'} {item.answer}</span>}
                      </span>
                    ) : (
                      <select
                        className="rl-dd-select rl-dd-select--match"
                        style={{ borderColor: color }}
                        value=""
                        onChange={e => handleDragDrop(qi, mi, e.target.value)}
                      >
                        <option value="" disabled>Select</option>
                        {opts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {allDone && q.explanation && (
            <div className={`rl-q-expl${allCorrect ? ' rl-q-expl--ok' : ''}`}>
              <div className="rl-q-expl-body">
                <span className="rl-q-expl-icon">{allCorrect ? '\u2705' : '\uD83D\uDCD8'}</span>
                <span>{q.explanation}</span>
              </div>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  const isSetFullyDone = (pi, si) => {
    const p = parts[pi]
    return p.sets[si].questions.every((q, qi) => {
      const a = answers[aKey(pi, si, qi)]
      if (a === undefined) return false
      if (q.type === 'drag_drop') return q.matchItems.every((_, mi) => a[mi] !== undefined)
      return true
    })
  }

  return (
    <div className="rl-shell">
      {/* ── SIDEBAR ── */}
      <aside className="rl-sidebar">
        <div className="rl-sidebar-header">
          <div className="rl-sidebar-title" style={{ color }}>Reading Practice</div>
          <div className="rl-sidebar-progress">
            <div className="rl-sidebar-progress-bar">
              <div className="rl-sidebar-progress-fill" style={{ width: `${totalQs > 0 ? (totalDone / totalQs) * 100 : 0}%`, background: color }} />
            </div>
            <span className="rl-sidebar-progress-text">{totalDone}/{totalQs}</span>
          </div>
        </div>
        <div className="ll-part-list">
          {parts.map((p, pi) => {
            const isActivePart = pi === activePartIdx
            return (
              <div key={p.partId} className="ll-part-group">
                <button
                  className={`ll-part-header${isActivePart ? ' ll-part-header--active' : ''}`}
                  style={isActivePart ? { borderLeftColor: color } : {}}
                  onClick={() => switchTo(pi, 0)}
                >
                  <span className={`ll-part-icon${isActivePart ? ' ll-part-icon--active' : ''}`} style={isActivePart ? { background: color } : {}}>
                    {p.icon}
                  </span>
                  <div className="ll-part-info">
                    <span className="ll-part-name">{p.partId} — {p.partLabel}</span>
                    <span className="ll-part-meta">{p.sets.length} sets · {p.totalQuestions} qs each</span>
                  </div>
                </button>
                {isActivePart && (
                  <div className="ll-set-list">
                    {p.sets.map((s, si) => {
                      const isActiveSet = si === activeSetIdx
                      const done = setDoneCount(pi, si)
                      const allDone = done === s.questions.length
                      const dc = DIFF_COLORS[s.difficulty] || DIFF_COLORS.easy
                      return (
                        <button
                          key={si}
                          className={`ll-set-row${isActiveSet ? ' ll-set-row--active' : ''}${allDone ? ' ll-set-row--done' : ''}`}
                          style={isActiveSet ? { background: `${color}08`, borderLeftColor: color } : {}}
                          onClick={() => switchTo(pi, si)}
                        >
                          <span className="ll-set-num">{s.setNumber}</span>
                          <div className="ll-set-info">
                            <span className="ll-set-title">{s.title}</span>
                            <span className="ll-set-meta">
                              <span style={{ color: dc }}>{s.difficulty}</span> · {done}/{s.questions.length}
                            </span>
                          </div>
                          {allDone && <span className="ll-set-check">{'\u2713'}</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="rl-main">
        {/* Top bar */}
        <div className="rl-topbar">
          <div className="rl-topbar-left">
            <span className="rl-part-badge" style={{ background: color }}>{part.partId}</span>
            <div className="rl-topbar-title-group">
              <span className="rl-part-title">{set.title}</span>
              <span className="rl-part-qs-tag">Set {set.setNumber} · {total} Qs</span>
            </div>
          </div>
          <div className="rl-topbar-right">
            {started ? (
              <div className={`rl-timer${timeCritical ? ' rl-timer--critical' : ''}${timeUp ? ' rl-timer--up' : ''}`} style={{ color: timerColor, borderColor: timerColor }}>
                <span className="rl-timer-icon">{'\u23F1'}</span>
                {timeUp ? (
                  <span className="rl-timer-digits">+{fmtTime(overtime)}</span>
                ) : (
                  <span className="rl-timer-digits">{fmtTime(timeLeft)}</span>
                )}
                {timeUp && <span className="rl-timer-up-label">overtime</span>}
              </div>
            ) : (
              <button className="rl-start-btn" style={{ background: color }} onClick={startTimer}>
                {'\u25B6'} Start Timer ({part.timeLimitMinutes} min)
              </button>
            )}
          </div>
        </div>

        {/* Time nudges */}
        {timeAmber && !timeUp && (
          <div className="rl-nudge rl-nudge--amber">{'\u23F3'} 5 minutes remaining — keep a steady pace!</div>
        )}
        {timeCritical && !timeUp && (
          <div className="rl-nudge rl-nudge--red">{'\uD83D\uDD25'} Under 1 minute left — trust your instincts!</div>
        )}
        {showBanner && (
          <div className="rl-banner">
            <span>{'\u23F0'} Time is up! On the real exam you would stop here. But this is practice — take your time.</span>
            <button className="rl-banner-close" onClick={() => setShowBanner(false)}>{'\u2715'}</button>
          </div>
        )}

        {/* Passage */}
        <div className="rl-passage-box">
          <div className="rl-passage-header">
            <span className="rl-passage-label" style={{ color }}>{part.icon} {part.partLabel}</span>
          </div>
          <div className="rl-passage-divider" />
          <div className="rl-passage-body">
            <pre className="rl-passage-text">{set.passage}</pre>
          </div>
        </div>

        {/* Diagram (R2) */}
        {set.diagram && (
          <div className="rl-diagram-box">
            <div className="rl-diagram-header">
              <span className="rl-diagram-label" style={{ color }}>{'\uD83D\uDCCA'} Program Schedule</span>
            </div>
            <div className="rl-diagram-body">
              <pre className="rl-diagram-text">{set.diagram}</pre>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="rl-questions">
          <div className="rl-questions-label">Questions ({total})</div>
          {qs.map((q, qi) => renderQuestion(q, qi))}
        </div>

        {/* Score summary */}
        {isSetFullyDone(activePartIdx, activeSetIdx) && (
          <div className="rl-score-summary" style={{ borderColor: color }}>
            <span className="rl-score-icon">{'\uD83C\uDFAF'}</span>
            <span className="rl-score-text">
              You scored <strong style={{ color }}>{setCorrectCount(activePartIdx, activeSetIdx)}/{total}</strong> on {part.partId} — {set.title} (Set {set.setNumber})
            </span>
          </div>
        )}

        {/* Navigation */}
        <div className="rl-nav">
          <button
            className="rl-nav-btn"
            onClick={() => {
              if (activeSetIdx > 0) switchTo(activePartIdx, activeSetIdx - 1)
              else if (activePartIdx > 0) switchTo(activePartIdx - 1, parts[activePartIdx - 1].sets.length - 1)
            }}
            disabled={activePartIdx === 0 && activeSetIdx === 0}
          >
            {'\u2190'} Previous Set
          </button>
          <span className="rl-nav-counter" style={{ color }}>
            {part.partId} · Set {set.setNumber} of {part.sets.length}
          </span>
          <button
            className="rl-nav-btn rl-nav-btn--next"
            style={{ background: color, borderColor: color }}
            onClick={() => {
              if (activeSetIdx < part.sets.length - 1) switchTo(activePartIdx, activeSetIdx + 1)
              else if (activePartIdx < parts.length - 1) switchTo(activePartIdx + 1, 0)
            }}
            disabled={activePartIdx === parts.length - 1 && activeSetIdx === part.sets.length - 1}
          >
            Next Set {'\u2192'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SPEAKING — sample practice sets (prompt + model answer notes)
══════════════════════════════════════════════════════════════ */
const SPEAKING_SETS = {
  S1: {
    title: 'A Friend Considering Quitting Their Job',
    instruction: 'Listen to the situation and give your advice.',
    scenario: 'Giving Advice — Career Decision',
    type: 'speaking',
    prepTime: 30,
    speakTime: 60,
    prompt: `Your friend has been working at the same company for five years. They are unhappy with their current position but are afraid to leave because the job is stable and pays well. They have received an offer from a new company that is exciting but involves more risk.

Your friend is asking for your advice. In your response:
• Suggest what they should do
• Give two reasons to support your advice
• Acknowledge the difficulty of the situation`,
    scoringFocus: ['Structured advice with clear recommendation', 'Specific supporting reasons (not vague)', 'Acknowledging the difficulty shows empathy', 'Confident, clear delivery'],
    samplePoints: ['Open with a direct recommendation: "I would encourage you to take the new offer"', 'Reason 1: Career growth — staying too long in an unhappy role limits development', 'Reason 2: Regret risk — security now vs. opportunity cost later', 'Acknowledge: "I understand this is a difficult decision given the financial stability you have"', 'Close with encouragement'],
  },
  S2: {
    title: 'A Time You Faced an Unexpected Challenge',
    instruction: 'Describe a personal experience based on the prompt.',
    scenario: 'Personal Experience — Overcoming Difficulty',
    type: 'speaking',
    prepTime: 30,
    speakTime: 90,
    prompt: `Describe a time when you faced an unexpected challenge and had to find a solution quickly.

In your response, include:
• What the situation was and why it was unexpected
• What you did to handle it
• What you learned from the experience`,
    scoringFocus: ['Clear narrative structure: situation → action → outcome', 'Specific details (names, places, numbers)', 'Varied vocabulary — avoid repeating "difficult" and "good"', 'Natural pacing — do not rush'],
    samplePoints: ['Set the scene briefly (1–2 sentences max)', 'Describe the unexpected element specifically', 'Walk through your actions step by step', 'Reflect on what the experience taught you', 'End with a forward-looking statement'],
  },
  S3: {
    title: 'Describe the Image — Busy Farmers Market',
    instruction: 'Look at the image and describe what you see in detail.',
    scenario: 'Scene Description — Outdoor Market',
    type: 'speaking',
    prepTime: 30,
    speakTime: 60,
    prompt: `[Image: An outdoor farmers market on a sunny day. Several vendors are selling vegetables and baked goods from colourful stalls. A family with two young children is browsing one of the stalls. A woman is handing money to a vendor. In the background, a musician is playing guitar near a tree.]

Describe this image in as much detail as possible. Talk about the people, the setting, what is happening, and what the overall atmosphere suggests.`,
    scoringFocus: ['Describe actions using present continuous (is handing, are browsing)', 'Mention foreground, middle ground, and background', 'Describe atmosphere/mood, not just objects', 'End with an inference about what is happening overall'],
    samplePoints: ['Setting: outdoor market, sunny day, colourful stalls', 'Foreground: woman handing money to vendor — transaction in progress', 'Middle: family with children browsing — suggests community, leisure', 'Background: musician playing guitar — festive, welcoming atmosphere', 'Overall mood: lively, community-oriented, positive'],
  },
  S4: {
    title: 'What Might Happen Next at the Meeting?',
    instruction: 'Look at the image and make predictions about what might happen.',
    scenario: 'Making Predictions — Workplace Meeting',
    type: 'speaking',
    prepTime: 30,
    speakTime: 60,
    prompt: `[Image: A formal boardroom meeting. A woman at the head of the table is presenting charts on a screen behind her. Three colleagues are taking notes. One man appears to be disagreeing — his arms are crossed and he is frowning. A laptop is open on the table.]

Based on what you see in this image, make predictions about what might happen next. Consider the people, their expressions, and the setting.`,
    scoringFocus: ['Use prediction language: "I think", "it\'s likely that", "they might", "this could lead to"', 'Cover multiple possibilities rather than one certainty', 'Base predictions on visible evidence in the image', 'Speculate about the outcome or resolution'],
    samplePoints: ['The presentation will likely continue and then move to questions', 'The man with crossed arms might raise an objection or challenge a data point', 'The presenter will probably need to defend her conclusions', 'The meeting could end with a decision being postponed for further review', 'The colleagues taking notes are likely preparing to weigh in'],
  },
  S5: {
    title: 'City Apartment vs. Suburban House — Which is Better?',
    instruction: 'Compare the two options and persuade your friend to choose one.',
    scenario: 'Comparing & Persuading — Housing Choice',
    type: 'speaking',
    prepTime: 60,
    speakTime: 60,
    prompt: `Your friend is deciding between two housing options:

Option A: A modern apartment in the city centre — close to work, restaurants, and transit, but smaller and more expensive.

Option B: A larger house in the suburbs — more space and lower rent, but requires a long daily commute.

Persuade your friend to choose one option. Give specific reasons for your recommendation and briefly explain why the other option is less suitable.`,
    scoringFocus: ['State your recommendation clearly in the first sentence', 'Compare using specific language: "more practical", "significantly cheaper"', 'Acknowledge the other option briefly before dismissing it', 'End with a strong closing statement'],
    samplePoints: ['Recommend: city apartment for someone in the early career stage', 'Reason 1: Commute time compounds — 90 min/day = 7.5 hours/week lost', 'Reason 2: Access to social and professional networking in the city', 'Counter: yes, the suburb has more space, but space matters less when you are rarely home', 'Close: "For where you are in life right now, the city apartment is the smarter choice"'],
  },
  S6: {
    title: 'Your Colleague Takes Credit for Your Work',
    instruction: 'Describe how you would handle this difficult situation.',
    scenario: 'Difficult Situation — Workplace Conflict',
    type: 'speaking',
    prepTime: 60,
    speakTime: 90,
    prompt: `You recently completed an important project that your manager praised highly. You have now discovered that a colleague presented your work as their own idea in a meeting you were not invited to. Your manager does not know you did the work.

How would you handle this situation? In your response:
• Describe what your first steps would be
• Explain how you would address it with your colleague and your manager
• Describe what outcome you would be hoping for`,
    scoringFocus: ['Step-by-step structure: first → then → finally', 'Professional, calm tone — avoid emotional language', 'Specific actions, not vague plans ("I would talk to them" is weak; "I would schedule a private conversation and say..." is strong)', 'Show awareness of relationships and consequences'],
    samplePoints: ['Step 1: Gather evidence — emails, documents with timestamps showing your contribution', 'Step 2: Speak privately with the colleague first — give them a chance to correct the record', 'Step 3: If unresolved, speak with the manager with documentation', 'Desired outcome: accurate attribution, not punishment', 'Close: maintaining professional relationships while ensuring proper credit'],
  },
  S7: {
    title: 'Should Social Media Be Regulated by Governments?',
    instruction: 'Express and defend your opinion on this topic.',
    scenario: 'Expressing Opinions — Technology & Society',
    type: 'speaking',
    prepTime: 30,
    speakTime: 90,
    prompt: `Some people believe that governments should regulate social media platforms to protect users from misinformation, harassment, and harmful content. Others argue that regulation threatens free speech and that platforms should self-regulate.

What is your opinion? Should governments regulate social media? Give specific reasons to support your position and briefly acknowledge the opposing view.`,
    scoringFocus: ['State your position clearly in sentence 1', 'Develop 2–3 specific, concrete reasons', 'Briefly acknowledge the counterargument, then rebut it', 'Use advanced opinion language: "It is my view that...", "The evidence suggests...", "While critics argue... the reality is..."'],
    samplePoints: ['Position: Yes, some level of government regulation is necessary', 'Reason 1: Self-regulation has demonstrably failed — platforms prioritize engagement over safety', 'Reason 2: The spread of health misinformation has caused measurable public harm', 'Acknowledge counterargument: concerns about free speech are valid', 'Rebuttal: regulation of harmful content is not the same as censorship — libel laws already restrict speech without destroying it'],
  },
  S8: {
    title: 'You Wake Up and Everyone Speaks a Different Language',
    instruction: 'Describe this unusual situation and explain how you would respond.',
    scenario: 'Unusual Situation — Hypothetical Scenario',
    type: 'speaking',
    prepTime: 30,
    speakTime: 60,
    prompt: `Imagine you wake up one morning and discover that everyone around you — your family, neighbours, coworkers — is now speaking a language you have never heard before. Signs, books, and screens are all in this unknown language. You appear to be the only person unaffected.

What would you do? In your response:
• Describe your immediate reaction
• Explain what steps you would take to communicate and get help
• Say how you would feel about this situation overall`,
    scoringFocus: ['Use hypothetical language naturally: "I would...", "My first instinct would be...", "I imagine I would feel..."', 'Treat it like any structured opinion response — introduction, body, conclusion', 'Do not panic over the scenario — the examiner scores how you communicate, not the plan itself', 'Show some personality and humour if comfortable — it helps fluency'],
    samplePoints: ['Immediate reaction: confusion, then curiosity', 'Step 1: Try to communicate through gestures and expressions', 'Step 2: Use written drawings or diagrams to convey meaning', 'Step 3: Try to find another person also unaffected', 'Overall feeling: unsettling but fascinating — a unique perspective on what it feels like to be a language learner'],
  },
}

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
const DIFF_COLOURS = {
  'easy':               { bg: '#F0FDF4', text: '#2D8A56' },
  'medium':             { bg: '#EEF7FF', text: '#4A90D9' },
  'intermediate':       { bg: '#EEF7FF', text: '#4A90D9' },
  'upper-intermediate': { bg: '#FFF8EC', text: '#C8972A' },
  'hard':               { bg: '#FFF8EC', text: '#C8972A' },
  'advanced':           { bg: '#FEF2F2', text: '#D91B1B' },
}

const QTYPE_LABELS = {
  mcq:             'Multiple Choice',
  fill_blank:      'Fill in the Blank',
  paragraph_match: 'Paragraph Matching',
  vocab_context:   'Vocabulary in Context',
  inference:       'Inference',
  detail:          'Detail Comprehension',
  speaker_id:      'Speaker Identification',
  tone_purpose:    'Tone & Purpose',
  gist:            'Main Idea',
}

/* Sort questions: easy → medium → hard.
   Within the same difficulty level the original order is preserved. */
function sortByDifficulty(questions) {
  const rank = { easy: 0, medium: 1, intermediate: 1, hard: 2, 'upper-intermediate': 2, advanced: 3 }
  return [...questions].sort((a, b) => (rank[a.difficulty] ?? 1) - (rank[b.difficulty] ?? 1))
}

function getSet(part) {
  const sec = part?.section || 'listening'
  const id  = part?.id || 'L1'
  if (sec === 'listening') return LISTENING_SETS[id] || LISTENING_SETS.L1
  if (sec === 'reading')   return READING_SETS[id]   || READING_SETS.R1
  if (sec === 'writing')   return (WRITING_SETS[id] || WRITING_SETS.W1)?.[0] || null
  if (sec === 'speaking')  return SPEAKING_SETS[id]  || SPEAKING_SETS.S1
  return LISTENING_SETS.L1
}

/* ══════════════════════════════════════════════════════════════
   QUESTION TYPE SUB-RENDERERS
══════════════════════════════════════════════════════════════ */

/* A) Standard MCQ / Inference / Speaker ID / Tone / Gist
   2-column: question left, lettered options right            */
function StandardMCQ({ q, qIndex, total, answered, selected, revealed, color, onSelect }) {
  const LETTERS = ['A', 'B', 'C', 'D', 'E']
  const correct = selected === q.answer

  return (
    <div className="ps-cq-wrap">
      {/* Left: question */}
      <div className="ps-cq-left">
        <p className="ps-cq-stem">{q.text}</p>
      </div>
      {/* Right: options */}
      <div className="ps-cq-right">
        {q.options.map((opt, i) => {
          const letter = LETTERS[i] || String(i + 1)
          // Strip leading "A) " prefix if the text already has it (DB data has it; static might too)
          const labelRe = /^[A-E]\)\s*/
          const cleanOpt = opt.replace(labelRe, '')

          let cls = 'ps-cq-opt'
          if (answered || revealed) {
            if (i === q.answer)      cls += ' ps-cq-opt--correct'
            else if (i === selected) cls += ' ps-cq-opt--wrong'
            else                     cls += ' ps-cq-opt--dim'
          } else if (selected === i) {
            cls += ' ps-cq-opt--hover'
          }
          return (
            <button
              key={i}
              className={cls}
              onClick={() => { if (!answered && !revealed) onSelect(i) }}
              disabled={answered || revealed}
            >
              <span
                className="ps-cq-letter"
                style={(answered || revealed) ? {} : (selected === i ? { background: color, color: '#fff', borderColor: color } : {})}
              >
                {letter}
              </span>
              <span className="ps-cq-opt-text">{cleanOpt}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* B) Paragraph Matching — A B C D E grid of large letter buttons */
function ParagraphMatchQ({ q, answered, selected, revealed, color, onSelect }) {
  const labels = q.paragraphLabels || { A: 'A', B: 'B', C: 'C', D: 'D', E: 'Not Given' }
  const opts   = q.options || ['A', 'B', 'C', 'D', 'E']
  return (
    <div className="ps-cq-para-section">
      <p className="ps-cq-stem ps-cq-stem--para">{q.text}</p>
      <div className="ps-cq-para-grid">
        {opts.map((val, i) => {
          let cls = 'ps-cq-para-btn'
          if (answered || revealed) {
            if (i === q.answer)      cls += ' ps-cq-para-btn--correct'
            else if (i === selected) cls += ' ps-cq-para-btn--wrong'
            else                     cls += ' ps-cq-para-btn--dim'
          } else if (selected === i) {
            cls += ' ps-cq-para-btn--selected'
          }
          return (
            <button
              key={i}
              className={cls}
              style={(selected === i && !answered && !revealed) ? { borderColor: color, color } : {}}
              onClick={() => { if (!answered && !revealed) onSelect(i) }}
              disabled={answered || revealed}
              title={labels[val] || val}
            >
              <span className="ps-cq-para-letter">{val}</span>
              <span className="ps-cq-para-sublabel">{labels[val] || ''}</span>
            </button>
          )
        })}
      </div>
      <p className="ps-cq-para-hint">Select the paragraph (A–D) that contains this information, or <strong>E</strong> if Not Given.</p>
    </div>
  )
}

/* C) Vocabulary in Context — same as MCQ but highlights the target word */
function VocabContextQ({ q, answered, selected, revealed, color, onSelect }) {
  return (
    <div className="ps-cq-vocab-section">
      <p className="ps-cq-stem">
        {q.targetWord
          ? q.text.split(new RegExp(`(${q.targetWord})`, 'i')).map((part, i) =>
              i % 2 === 1
                ? <span key={i} className="ps-cq-vocab-word">{part}</span>
                : part
            )
          : q.text}
      </p>
      <StandardMCQ
        q={q}
        answered={answered}
        selected={selected}
        revealed={revealed}
        color={color}
        onSelect={onSelect}
      />
    </div>
  )
}

/* D) Fill in the Blank — sentence with highlighted blank + option buttons */
function FillBlankQ({ q, qIndex, answered, selected, revealed, color, onSelect }) {
  const LETTERS = ['A', 'B', 'C', 'D']
  const correct = selected === q.answer
  // Split on blank marker
  const parts = q.text.split(/\d+___[.,]?/)

  return (
    <div className="ps-cq-fill-section">
      {/* Sentence with blank shown as a highlighted slot */}
      <div className="ps-cq-fill-sentence">
        <span>{parts[0]}</span>
        <span className="ps-cq-blank-slot">
          {answered || revealed
            ? <span className={answered && correct ? 'ps-blank-filled--correct' : 'ps-blank-filled--wrong'}>
                {q.options[q.answer]?.replace(/^[A-E]\)\s*/, '')}
              </span>
            : <span className="ps-blank-placeholder">____</span>}
        </span>
        {parts[1] && <span>{parts[1]}</span>}
      </div>

      {/* Option buttons */}
      <div className="ps-cq-fill-options">
        {q.options.map((opt, i) => {
          const letter   = LETTERS[i] || String(i + 1)
          const cleanOpt = opt.replace(/^[A-E]\)\s*/, '')
          let cls = 'ps-cq-opt'
          if (answered || revealed) {
            if (i === q.answer)      cls += ' ps-cq-opt--correct'
            else if (i === selected) cls += ' ps-cq-opt--wrong'
            else                     cls += ' ps-cq-opt--dim'
          }
          return (
            <button
              key={i}
              className={cls}
              onClick={() => { if (!answered && !revealed) onSelect(i) }}
              disabled={answered || revealed}
            >
              <span
                className="ps-cq-letter"
                style={selected === i && !answered ? { background: color, color: '#fff', borderColor: color } : {}}
              >{letter}</span>
              <span className="ps-cq-opt-text">{cleanOpt}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SHARED MCQ COMPONENTS  (legacy QuestionCard kept for old refs)
══════════════════════════════════════════════════════════════ */
function QuestionCard({ q, index, revealed }) {
  const [selected, setSelected] = useState(null)
  const answered = selected !== null
  const correct  = selected === q.answer
  return (
    <div className={`ps-q-card${answered ? (correct ? ' ps-q-correct' : ' ps-q-wrong') : ''}`}>
      <div className="ps-q-num">Question {index + 1}</div>
      <p className="ps-q-text">{q.text}</p>
      <div className="ps-q-options">
        {q.options.map((opt, i) => {
          let cls = 'ps-q-option'
          if (answered) {
            if (i === q.answer)                  cls += ' ps-opt-correct'
            else if (i === selected)             cls += ' ps-opt-wrong'
            else                                 cls += ' ps-opt-dim'
          }
          if (selected === i) cls += ' ps-opt-selected'
          return (
            <button key={i} className={cls} onClick={() => !answered && setSelected(i)} disabled={answered}>
              {opt}
            </button>
          )
        })}
      </div>
      <AnimatePresence>
        {(answered || revealed) && (
          <motion.div
            className={`ps-q-explanation${correct && answered ? ' ps-exp-correct' : ''}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}
          >
            <span className="ps-exp-icon">{correct && answered ? '✅' : '📘'}</span>
            <span>{q.explanation}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   LISTENING — Audio player gate
══════════════════════════════════════════════════════════════ */
function AudioGate({ started, onStart }) {
  const [playing, setPlaying] = useState(false)
  if (!started) {
    return (
      <div className="ps-audio-start">
        <div className="ps-audio-icon">🎧</div>
        <p>Press <strong>Start</strong> to reveal the audio and begin the practice set.</p>
        <button className="ps-start-btn" onClick={onStart}>▶ Start Practice</button>
      </div>
    )
  }
  return (
    <div className="ps-audio-player">
      <div className="ps-audio-bar">
        <button className={`ps-audio-play-btn${playing ? ' ps-audio-playing' : ''}`} onClick={() => setPlaying(v => !v)}>
          {playing ? '⏸' : '▶'}
        </button>
        <div className="ps-audio-track">
          <div className="ps-audio-progress" style={{ width: playing ? '35%' : '0%' }} />
        </div>
        <span className="ps-audio-time">0:00 / 1:45</span>
      </div>
      <div className="ps-audio-note">🔊 Audio plays once on the real test. Replay is available here for study purposes.</div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   READING — Passage display
══════════════════════════════════════════════════════════════ */
function PassageBlock({ passage }) {
  return (
    <div className="ps-passage-block">
      <div className="ps-passage-label">📄 Passage</div>
      <pre className="ps-passage-text">{passage}</pre>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   WRITING — Prompt + text area + model answer
══════════════════════════════════════════════════════════════ */
function WritingPractice({ data, started, onStart, color }) {
  const [response, setResponse] = useState('')
  const [showModel, setShowModel] = useState(false)
  const wordCount = response.trim() ? response.trim().split(/\s+/).length : 0

  if (!started) {
    return (
      <div className="ps-audio-start">
        <div className="ps-audio-icon">✍️</div>
        <p>Press <strong>Start</strong> to reveal the writing prompt and begin your response.</p>
        <button className="ps-start-btn" style={{ background: color }} onClick={onStart}>✍️ Start Writing</button>
      </div>
    )
  }

  return (
    <div className="ps-writing-area">
      <div className="ps-writing-prompt-box">
        <div className="ps-instr-label" style={{ color }}>Writing Prompt</div>
        <pre className="ps-writing-prompt">{data.prompt}</pre>
        <div className="ps-writing-meta">
          <span>🎯 Target: <strong>{data.wordTarget}</strong></span>
          <span>🗣️ Tone: <strong>{data.tone}</strong></span>
        </div>
      </div>

      <div className="ps-writing-criteria">
        <div className="ps-crit-label">Scoring Criteria</div>
        <div className="ps-crit-list">
          {data.criteria.map(c => <span key={c} className="ps-crit-tag">{c}</span>)}
        </div>
      </div>

      <div className="ps-textarea-wrap">
        <textarea
          className="ps-textarea"
          placeholder="Write your response here..."
          value={response}
          onChange={e => setResponse(e.target.value)}
          rows={14}
          style={{ borderColor: response ? color : undefined }}
        />
        <div className={`ps-word-count${wordCount > 200 ? ' ps-wc-over' : wordCount >= 150 ? ' ps-wc-good' : ''}`}>
          {wordCount} words
          {wordCount >= 150 && wordCount <= 200 && ' ✓ In range'}
          {wordCount > 200 && ' — slightly over'}
          {wordCount > 0 && wordCount < 150 && ` — target ${150 - wordCount} more`}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SPEAKING — Prompt + timer + scoring notes
══════════════════════════════════════════════════════════════ */
function SpeakingPractice({ data, started, onStart, color }) {
  const [phase, setPhase] = useState('prep')   // 'prep' | 'speak' | 'done'
  const [timer, setTimer] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [showNotes, setShowNotes] = useState(false)

  const startPrep = () => {
    onStart()
    setPhase('prep')
    setElapsed(0)
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    setTimer(id)
    setTimeout(() => { clearInterval(id); setPhase('speak'); setElapsed(0) }, data.prepTime * 1000)
  }

  const startSpeak = () => {
    setPhase('speak')
    setElapsed(0)
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    setTimer(id)
    setTimeout(() => { clearInterval(id); setPhase('done') }, data.speakTime * 1000)
  }

  const reset = () => { if (timer) clearInterval(timer); setPhase('prep'); setElapsed(0) }

  if (!started) {
    return (
      <div className="ps-audio-start">
        <div className="ps-audio-icon">🎙️</div>
        <p>Press <strong>Start</strong> to begin preparation time. The speaking timer will follow automatically.</p>
        <button className="ps-start-btn" style={{ background: color }} onClick={startPrep}>▶ Start Preparation ({data.prepTime}s)</button>
      </div>
    )
  }

  const totalTime = phase === 'prep' ? data.prepTime : data.speakTime
  const pct = Math.min((elapsed / totalTime) * 100, 100)

  return (
    <div className="ps-speaking-area">
      <div className="ps-speaking-prompt-box">
        <div className="ps-instr-label" style={{ color }}>Speaking Prompt</div>
        <pre className="ps-writing-prompt">{data.prompt}</pre>
      </div>

      <div className={`ps-speak-timer ${phase === 'done' ? 'ps-timer-done' : phase === 'speak' ? 'ps-timer-speak' : 'ps-timer-prep'}`}>
        {phase === 'prep' && (
          <>
            <div className="ps-timer-label">⏳ Preparation Time</div>
            <div className="ps-timer-val">{data.prepTime - elapsed}s remaining</div>
            <div className="ps-timer-bar"><div className="ps-timer-fill" style={{ width: `${pct}%`, background: '#C8972A' }} /></div>
            <div className="ps-timer-note">Use this time to plan your opening sentence and key points.</div>
          </>
        )}
        {phase === 'speak' && (
          <>
            <div className="ps-timer-label" style={{ color }}>🎙️ Speaking — Recording</div>
            <div className="ps-timer-val" style={{ color }}>{data.speakTime - elapsed}s remaining</div>
            <div className="ps-timer-bar"><div className="ps-timer-fill" style={{ width: `${(1 - elapsed/data.speakTime)*100}%`, background: color }} /></div>
            <div className="ps-timer-note">Speak clearly and cover all parts of the prompt.</div>
          </>
        )}
        {phase === 'done' && (
          <>
            <div className="ps-timer-label">✅ Time's Up</div>
            <div className="ps-timer-note">Your speaking time has ended. Review the scoring notes below.</div>
            <button className="ps-start-btn" style={{ background: '#666', marginTop: 12 }} onClick={reset}>↩ Try Again</button>
          </>
        )}
        {phase === 'prep' && <button className="ps-skip-btn" onClick={startSpeak}>Skip to Speaking ›</button>}
      </div>

      <div className="ps-speaking-notes">
        <div className="ps-crit-label">What to Cover</div>
        <ul className="ps-speak-points">
          {data.samplePoints.map(p => <li key={p}>{p}</li>)}
        </ul>
      </div>

      <div className="ps-model-toggle">
        <button className="ps-reveal-btn" onClick={() => setShowNotes(v => !v)} style={{ borderColor: color, color }}>
          {showNotes ? '🙈 Hide Scoring Focus' : '📋 Scoring Focus'}
        </button>
      </div>

      <AnimatePresence>
        {showNotes && (
          <motion.div className="ps-model-answer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}>
            <div className="ps-model-label">🎯 What Examiners Look For</div>
            <ul className="ps-speak-points">
              {data.scoringFocus.map(p => <li key={p}>{p}</li>)}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   DIAGRAM BLOCK — renders HTML table for R2 "Apply a Diagram"
══════════════════════════════════════════════════════════════ */
function DiagramBlock({ html }) {
  return (
    <div className="ps-diagram-block">
      <div className="ps-diagram-label">📊 Reference Diagram</div>
      <div
        className="ps-diagram-table"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   FILL-BLANK QUESTION — inline dropdown in sentence (legacy)
══════════════════════════════════════════════════════════════ */
function FillBlankQuestion({ q, index }) {
  const [selected, setSelected] = useState(null)
  const answered = selected !== null
  const correct  = selected === q.answer
  const blankRe  = /\d+___[.,]?/
  const parts    = q.text.split(blankRe)
  const blankNum = (q.text.match(/(\d+)___/) || ['', index + 1])[1]

  return (
    <div className={`ps-fill-blank-q${answered ? (correct ? ' ps-fbq--correct' : ' ps-fbq--wrong') : ''}`}>
      <div className="ps-fbq-label">
        <span className="ps-fbq-num">{index + 1}</span>
        <span className="ps-fbq-tag">Fill in blank {blankNum}</span>
        {answered && (
          <span className={`ps-fbq-result ${correct ? 'ps-fbq-result--ok' : 'ps-fbq-result--err'}`}>
            {correct ? '✓ Correct' : '✗ Incorrect'}
          </span>
        )}
      </div>
      <div className="ps-fbq-sentence">
        <span>{parts[0]}</span>
        <select
          className={`ps-blank-select${answered ? (correct ? ' ps-blank-select--correct' : ' ps-blank-select--wrong') : ''}`}
          value={selected ?? ''}
          onChange={e => setSelected(Number(e.target.value))}
          disabled={answered}
        >
          <option value="" disabled>choose ▾</option>
          {(q.options || []).map((opt, i) => (
            <option key={i} value={i}>{opt}</option>
          ))}
        </select>
        {parts[1] && <span>{parts[1]}</span>}
      </div>
      {answered && (
        <div className="ps-fbq-explanation">
          {!correct && (
            <span className="ps-fbq-correct-ans">
              ✓ Correct answer: <strong>{q.options[q.answer]}</strong>
            </span>
          )}
          <span className="ps-fbq-exp-text">💡 {q.explanation}</span>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   ONE-AT-A-TIME QUESTION PANEL
   Renders every CELPIP question type with proper formatting.
   Questions are sorted easy → medium → hard before display.
══════════════════════════════════════════════════════════════ */
function QuestionPanel({ questions, color }) {
  const sortedQs = sortByDifficulty(questions)

  const [qIndex,   setQIndex]   = useState(0)
  const [answers,  setAnswers]  = useState({})   // { [sortedIndex]: selectedOptionIndex }
  const [revealed, setRevealed] = useState(false)

  const q        = sortedQs[qIndex]
  const total    = sortedQs.length
  const selected = answers[qIndex] ?? null
  const answered = selected !== null
  const correct  = selected === q.answer
  const qtype    = q.questionType || 'mcq'

  const goTo = (n) => { setQIndex(n); setRevealed(false) }
  const handleSelect = (i) => setAnswers(a => ({ ...a, [qIndex]: i }))

  const pct = Math.round(((qIndex + 1) / total) * 100)

  // Difficulty badge colour
  const diffC = DIFF_COLOURS[q.difficulty] || DIFF_COLOURS['medium']

  return (
    <div className="ps-qpanel">
      {/* ── Progress bar ── */}
      <div className="ps-qpanel-progress-wrap">
        <div className="ps-qpanel-progress-bar">
          <div className="ps-qpanel-progress-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="ps-qpanel-progress-label" style={{ color }}>
          {qIndex + 1} / {total}
        </span>
      </div>

      {/* ── Question card ── */}
      <motion.div
        key={qIndex}
        className={`ps-q-card ps-q-card--solo${answered ? (correct ? ' ps-q-correct' : ' ps-q-wrong') : ''}`}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header row: Q-number badge + type tag + difficulty + verdict */}
        <div className="ps-q-num-row">
          <span className="ps-q-num" style={{ background: color }}>Q{qIndex + 1}</span>

          {qtype && QTYPE_LABELS[qtype] && (
            <span className="ps-cq-qtype-tag">{QTYPE_LABELS[qtype]}</span>
          )}

          {q.difficulty && (
            <span className="ps-cq-diff-tag" style={{ background: diffC.bg, color: diffC.text }}>
              {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
            </span>
          )}

          {answered && (
            <span className={`ps-q-verdict ${correct ? 'ps-q-verdict--ok' : 'ps-q-verdict--err'}`}>
              {correct ? '✓ Correct' : '✗ Incorrect'}
            </span>
          )}
        </div>

        {/* ── Question body — switches on type ── */}
        {qtype === 'paragraph_match' ? (
          <ParagraphMatchQ
            q={q}
            answered={answered}
            selected={selected}
            revealed={revealed}
            color={color}
            onSelect={handleSelect}
          />
        ) : qtype === 'vocab_context' ? (
          <VocabContextQ
            q={q}
            answered={answered}
            selected={selected}
            revealed={revealed}
            color={color}
            onSelect={handleSelect}
          />
        ) : qtype === 'fill_blank' ? (
          <FillBlankQ
            q={q}
            qIndex={qIndex}
            answered={answered}
            selected={selected}
            revealed={revealed}
            color={color}
            onSelect={handleSelect}
          />
        ) : (
          /* mcq | inference | speaker_id | tone_purpose | gist */
          <StandardMCQ
            q={q}
            qIndex={qIndex}
            total={total}
            answered={answered}
            selected={selected}
            revealed={revealed}
            color={color}
            onSelect={handleSelect}
          />
        )}

        {/* ── Explanation ── */}
        <AnimatePresence>
          {(answered || revealed) && (
            <motion.div
              className={`ps-q-explanation${correct && answered ? ' ps-exp-correct' : ''}`}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            >
              {!correct && answered && (
                <div className="ps-fbq-correct-ans" style={{ marginBottom: 6 }}>
                  ✓ Correct answer: <strong>
                    {qtype === 'paragraph_match'
                      ? (q.options[q.answer] || q.answer)
                      : (q.options[q.answer] || '').replace(/^[A-E]\)\s*/, '')}
                  </strong>
                </div>
              )}
              <span className="ps-exp-icon">{correct && answered ? '✅' : '📘'}</span>
              <span>{q.explanation}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Navigation row ── */}
      <div className="ps-qpanel-nav">
        <button
          className="ps-qnav-btn ps-qnav-btn--prev"
          onClick={() => goTo(qIndex - 1)}
          disabled={qIndex === 0}
        >
          ← Prev
        </button>

        <button
          className="ps-qnav-btn ps-qnav-btn--reveal"
          style={{ color, borderColor: color }}
          onClick={() => setRevealed(v => !v)}
        >
          {revealed ? '🙈 Hide Answer' : '🔑 Show Answer'}
        </button>

        <button
          className="ps-qnav-btn ps-qnav-btn--next"
          style={{ background: color, borderColor: color }}
          onClick={() => goTo(qIndex + 1)}
          disabled={qIndex === total - 1}
        >
          Next →
        </button>
      </div>

      {/* ── Dot indicators ── */}
      <div className="ps-qpanel-dots">
        {sortedQs.map((sq, i) => {
          const isDone = answers[i] !== undefined
          const isOk   = isDone && answers[i] === sq.answer
          return (
            <button
              key={i}
              className={`ps-qdot${i === qIndex ? ' ps-qdot--active' : ''}${isDone ? (isOk ? ' ps-qdot--ok' : ' ps-qdot--err') : ''}`}
              style={i === qIndex ? { background: color, borderColor: color } : {}}
              onClick={() => goTo(i)}
              title={`Q${i + 1} — ${sq.questionType || 'mcq'} — ${sq.difficulty || ''}`}
            />
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SINGLE QUESTION PANEL — PrepCelpeep-style
   One question at a time with large option buttons,
   prev/next navigation, and explanation reveal.
══════════════════════════════════════════════════════════════ */
function SingleQuestionPanel({ q, qIndex, total, color, onPrev, onNext, answer, onAnswer }) {
  const [revealed, setRevealed] = useState(false)
  const LETTERS = ['A', 'B', 'C', 'D', 'E']
  const qtype   = q.questionType || 'mcq'
  const answered = answer !== undefined
  const correct  = answered && answer === q.answer

  // reset reveal when question changes
  useEffect(() => { setRevealed(false) }, [qIndex])

  const handlePick = (oi) => {
    if (!answered && !revealed) onAnswer(oi)
  }

  const showFeedback = answered || revealed

  return (
    <div className="pcp-qpanel">

      {/* Progress bar */}
      <div className="pcp-progress">
        <div className="pcp-progress-track">
          <div
            className="pcp-progress-fill"
            style={{ width: `${((qIndex + 1) / total) * 100}%`, background: color }}
          />
        </div>
        <span className="pcp-progress-label" style={{ color }}>
          Question {qIndex + 1} <span className="pcp-progress-of">of {total}</span>
        </span>
      </div>

      {/* Type + difficulty tags */}
      <div className="pcp-q-tags">
        {QTYPE_LABELS[qtype] && (
          <span className="pcp-q-type-tag">{QTYPE_LABELS[qtype]}</span>
        )}
        {q.difficulty && (
          <span
            className="pcp-q-diff-tag"
            style={{
              background: (DIFF_COLOURS[q.difficulty] || DIFF_COLOURS.medium).bg,
              color:      (DIFF_COLOURS[q.difficulty] || DIFF_COLOURS.medium).text,
            }}
          >
            {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
          </span>
        )}
      </div>

      {/* Question stem */}
      {qtype === 'paragraph_match' ? (
        <p className="pcp-q-stem pcp-q-stem--quote">"{q.text}"</p>
      ) : qtype === 'vocab_context' ? (
        <p className="pcp-q-stem">
          {q.targetWord
            ? q.text.split(new RegExp(`(${q.targetWord})`, 'i')).map((part, pi) =>
                pi % 2 === 1
                  ? <span key={pi} className="ps-cq-vocab-word">{part}</span>
                  : part
              )
            : q.text}
        </p>
      ) : qtype === 'fill_blank' ? (
        <p className="pcp-q-stem">
          {q.text.split(/(\d+___[.,]?)/).map((chunk, ci) =>
            /\d+___/.test(chunk)
              ? <span key={ci} className="pcp-blank-slot">
                  {showFeedback
                    ? <span className={answer === q.answer ? 'pcp-blank--correct' : 'pcp-blank--wrong'}>
                        {(q.options[q.answer] || '').replace(/^[A-E]\)\s*/, '')}
                      </span>
                    : <span className="pcp-blank--empty">____</span>}
                </span>
              : chunk
          )}
        </p>
      ) : (
        <p className="pcp-q-stem">{q.text}</p>
      )}

      {/* Options */}
      {qtype === 'paragraph_match' ? (
        <div className="pcp-para-grid">
          {(q.options || ['A','B','C','D','E']).map((val, oi) => {
            let cls = 'pcp-para-btn'
            if (showFeedback) {
              if (oi === q.answer)     cls += ' pcp-para-btn--correct'
              else if (oi === answer)  cls += ' pcp-para-btn--wrong'
              else                     cls += ' pcp-para-btn--dim'
            } else if (answer === oi) {
              cls += ' pcp-para-btn--sel'
            }
            return (
              <button
                key={oi}
                className={cls}
                style={answer === oi && !showFeedback ? { borderColor: color } : {}}
                onClick={() => handlePick(oi)}
                disabled={showFeedback}
                title={(q.paragraphLabels || {})[val] || val}
              >
                <span className="pcp-para-letter">{val}</span>
                <span className="pcp-para-sub">{(q.paragraphLabels || {})[val] || ''}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="pcp-opts">
          {(q.options || []).map((opt, oi) => {
            const letter   = LETTERS[oi] || String(oi + 1)
            const cleanOpt = opt.replace(/^[A-E]\)\s*/, '')
            let cls = 'pcp-opt'
            if (showFeedback) {
              if (oi === q.answer)    cls += ' pcp-opt--correct'
              else if (oi === answer) cls += ' pcp-opt--wrong'
              else                    cls += ' pcp-opt--dim'
            } else if (answer === oi) {
              cls += ' pcp-opt--sel'
            }
            return (
              <button
                key={oi}
                className={cls}
                style={answer === oi && !showFeedback
                  ? { borderColor: color, background: `${color}12` }
                  : {}}
                onClick={() => handlePick(oi)}
                disabled={showFeedback}
              >
                <span
                  className="pcp-opt-letter"
                  style={answer === oi && !showFeedback
                    ? { background: color, color: '#fff', borderColor: color }
                    : {}}
                >
                  {letter}
                </span>
                <span className="pcp-opt-text">{cleanOpt}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Explanation */}
      {showFeedback && q.explanation && (
        <div className={`pcp-expl${correct || (revealed && answer === q.answer) ? ' pcp-expl--ok' : ''}`}>
          {answered && !correct && (
            <div className="pcp-expl-correct">
              ✓ Correct answer: <strong>
                {qtype === 'paragraph_match'
                  ? (q.options || [])[q.answer] || q.answer
                  : (q.options[q.answer] || '').replace(/^[A-E]\)\s*/, '')}
              </strong>
            </div>
          )}
          <div className="pcp-expl-body">
            <span className="pcp-expl-icon">{correct && answered ? '✅' : '📘'}</span>
            <span>{q.explanation}</span>
          </div>
        </div>
      )}

      {/* Navigation row */}
      <div className="pcp-nav">
        <button
          className="pcp-nav-btn pcp-nav-btn--prev"
          onClick={onPrev}
          disabled={qIndex === 0}
        >
          ← Previous
        </button>

        {!answered && !revealed && (
          <button
            className="pcp-nav-btn pcp-nav-btn--skip"
            style={{ color, borderColor: color }}
            onClick={() => setRevealed(v => !v)}
          >
            🔑 Show Answer
          </button>
        )}
        {(answered || revealed) && (
          <button
            className="pcp-nav-btn pcp-nav-btn--skip"
            style={{ color, borderColor: color }}
            onClick={() => setRevealed(v => !v)}
          >
            {revealed ? '🙈 Hide' : '🔑 Show Answer'}
          </button>
        )}

        <button
          className="pcp-nav-btn pcp-nav-btn--next"
          style={{ background: color, borderColor: color }}
          onClick={onNext}
          disabled={qIndex === total - 1}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   PRACTICE LAYOUT — PrepCelpeep-style 3-column interface
   ┌──────────────────────────────────────────────────────────┐
   │  TOP BAR: [Icon + Part]  [Set tabs]  [Timer pill]       │
   ├────────┬──────────────────────────┬──────────────────────┤
   │ Q-NAV  │  PASSAGE (centre)        │  QUESTION (right)    │
   │ dots   │  scrollable text         │  one-at-a-time       │
   │        │                          │  Prev / Next         │
   └────────┴──────────────────────────┴──────────────────────┘
══════════════════════════════════════════════════════════════ */
function PracticeLayout({ sets, color, partId, section, startedSets, onStartSet }) {
  const [activeSet, setActiveSet] = useState(0)
  const [timeLeft,  setTimeLeft]  = useState(null)
  const [qIndex,    setQIndex]    = useState(0)
  const [answers,   setAnswers]   = useState({})   // { [setIdx_qIdx]: optIdx }
  const timerRef = useRef(null)

  const set     = sets[activeSet]
  if (!set) return null

  const sortedQs  = sortByDifficulty(set.questions || [])
  const total     = sortedQs.length
  const isStarted = startedSets[activeSet]
  const q         = sortedQs[qIndex]

  // Unique key per set+question
  const ansKey = (si, qi) => `${si}_${qi}`
  const curAns = answers[ansKey(activeSet, qIndex)]

  const handleAnswer = (optIdx) => {
    setAnswers(a => ({ ...a, [ansKey(activeSet, qIndex)]: optIdx }))
  }

  const switchSet = (i) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeLeft(null)
    setActiveSet(i)
    setQIndex(0)
  }

  const startTimer = () => {
    const mins = section === 'reading' ? 11 : section === 'listening' ? 8 : 27
    setTimeLeft(mins * 60)
    onStartSet(activeSet)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)
  }

  const fmtTime = (secs) => {
    if (secs === null) return null
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const timeCritical = timeLeft !== null && timeLeft < 120

  // Score for this set
  const answered = sortedQs.filter((_, i) => answers[ansKey(activeSet, i)] !== undefined).length
  const correct  = sortedQs.filter((sq, i) => answers[ansKey(activeSet, i)] === sq.answer).length
  const allDone  = answered === total && total > 0

  return (
    <div className="pcp-shell">

      {/* ════ TOP BAR ════ */}
      <div className="pcp-topbar">
        {/* Left: section label */}
        <div className="pcp-topbar-left">
          <span className="pcp-topbar-icon">
            {section === 'reading' ? '📖' : section === 'listening' ? '🎧' : section === 'writing' ? '✍️' : '🎙️'}
          </span>
          <span className="pcp-topbar-section" style={{ color }}>
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </span>
          <span className="pcp-topbar-sep">›</span>
          <span className="pcp-topbar-title">{set.setTitle || set.title}</span>
        </div>

        {/* Centre: set tab strip */}
        <div className="pcp-tabs">
          {sets.map((s, i) => {
            const diff = DIFF_COLOURS[s.difficulty] || DIFF_COLOURS.medium
            return (
              <button
                key={i}
                className={`pcp-tab${i === activeSet ? ' pcp-tab--active' : ''}`}
                style={i === activeSet ? { color, borderBottomColor: color } : {}}
                onClick={() => switchSet(i)}
              >
                {s.setNumber ? `Set ${s.setNumber}` : `Set ${i + 1}`}
                <span className="pcp-tab-diff" style={{ background: diff.bg, color: diff.text }}>
                  {(s.difficulty || 'med').charAt(0).toUpperCase()}
                </span>
              </button>
            )
          })}
        </div>

        {/* Right: timer pill + score badge */}
        <div className="pcp-topbar-right">
          {allDone && (
            <span className="pcp-score-badge" style={{ color, borderColor: `${color}40`, background: `${color}10` }}>
              {correct}/{total} ✓
            </span>
          )}
          {isStarted ? (
            <span className={`pcp-timer${timeCritical ? ' pcp-timer--critical' : ''}`}>
              ⏱ {fmtTime(timeLeft)}
            </span>
          ) : (
            <button className="pcp-start-timer-btn" style={{ background: color }} onClick={startTimer}>
              ▶ Start
            </button>
          )}
          {activeSet < sets.length - 1 && (
            <button
              className="pcp-next-set-btn"
              style={{ borderColor: color, color }}
              onClick={() => switchSet(activeSet + 1)}
            >
              Next Set ›
            </button>
          )}
        </div>
      </div>

      {/* ════ 3-COLUMN BODY ════ */}
      <div className="pcp-body">

        {/* COL 1: Question navigator */}
        <div className="pcp-qnav">
          <div className="pcp-qnav-label">Questions</div>
          <div className="pcp-qnav-dots">
            {sortedQs.map((sq, i) => {
              const a   = answers[ansKey(activeSet, i)]
              const done = a !== undefined
              const ok   = done && a === sq.answer
              return (
                <button
                  key={i}
                  className={`pcp-qdot${i === qIndex ? ' pcp-qdot--active' : ''}${done ? (ok ? ' pcp-qdot--ok' : ' pcp-qdot--err') : ''}`}
                  style={i === qIndex ? { background: color, borderColor: color, color: '#fff' } : {}}
                  onClick={() => setQIndex(i)}
                  title={`Q${i + 1}`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>

          {/* Mini progress */}
          {total > 0 && (
            <div className="pcp-qnav-progress">
              <div
                className="pcp-qnav-progress-fill"
                style={{ height: `${(answered / total) * 100}%`, background: color }}
              />
            </div>
          )}
          <div className="pcp-qnav-stat">
            <span style={{ color }}>{answered}</span>/{total} done
          </div>
        </div>

        {/* COL 2: Passage / Prompt / Audio */}
        <div className="pcp-passage">

          {/* Listening: start gate */}
          {section === 'listening' && !isStarted && (
            <div className="pcp-start-gate">
              <div className="pcp-gate-icon">🎧</div>
              <p className="pcp-gate-text">Press <strong>Start</strong> to begin the audio and timer.</p>
              <button className="pcp-gate-btn" style={{ background: color }} onClick={startTimer}>
                ▶ Start
              </button>
            </div>
          )}

          {section === 'listening' && isStarted && (
            <div className="pcp-audio-bar">
              <span>🔊</span>
              <span className="pcp-audio-label">Listening Audio</span>
              <span className="pcp-audio-note">Replay available here (once only on the real test)</span>
            </div>
          )}

          {/* Instruction */}
          {set.instruction && (
            <div className="pcp-instr" style={{ borderLeftColor: color }}>
              {set.instruction}
            </div>
          )}

          {/* Passage text */}
          {set.passage && (
            <div className="pcp-passage-body">
              <pre className="pcp-passage-text">{set.passage}</pre>
            </div>
          )}

          {/* Diagram */}
          {set.diagramHtml && (
            <div className="pcp-diagram">
              <div className="pcp-diagram-label">📊 Reference Information</div>
              <div dangerouslySetInnerHTML={{ __html: set.diagramHtml }} />
            </div>
          )}

          {/* Writing / Speaking prompts */}
          {set.type === 'writing' && (
            <WritingPractice data={set} started={isStarted} onStart={startTimer} color={color} />
          )}
          {set.type === 'speaking' && (
            <SpeakingPractice data={set} started={isStarted} onStart={startTimer} color={color} />
          )}
        </div>

        {/* COL 3: Single question panel */}
        <div className="pcp-question">
          {total === 0 ? (
            <div className="pcp-no-qs">No questions for this set.</div>
          ) : section === 'listening' && !isStarted ? (
            <div className="pcp-locked">
              <div className="pcp-locked-icon">🔒</div>
              <p>Start the audio to unlock questions.</p>
            </div>
          ) : q ? (
            <SingleQuestionPanel
              key={`${activeSet}-${qIndex}`}
              q={q}
              qIndex={qIndex}
              total={total}
              color={color}
              answer={curAns}
              onAnswer={handleAnswer}
              onPrev={() => setQIndex(i => Math.max(0, i - 1))}
              onNext={() => setQIndex(i => Math.min(total - 1, i + 1))}
            />
          ) : null}
        </div>

      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function PracticeSetPage({ section: propSection }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { partId: urlPartId } = useParams()
  const part = location.state?.part || null

  // Per-set "started" flags (for speaking)
  const [startedSets, setStartedSets] = useState({})

  const section = propSection || part?.section || 'listening'
  const partId  = urlPartId || part?.id || 'L1'
  const cfg     = SECTION_CONFIG[section] || SECTION_CONFIG.listening

  const isListening = section === 'listening'
  const isReading   = section === 'reading'
  const isWriting   = section === 'writing'

  // Derive label from data sources when not passed via state
  const partLabel = part?.label
    || (isListening && LISTENING_DATA[partId]?.partLabel)
    || (isReading && READING_DATA[partId]?.partLabel)
    || (partId === 'W1' ? 'Writing an Email' : partId === 'W2' ? 'Survey Questions' : null)
    || 'Practice'
  const writingQuestions = isWriting ? (WRITING_SETS[partId] || WRITING_SETS.W1) : []

  // For speaking: build sets array
  const staticSets = (() => {
    if (isListening || isReading || isWriting) return []
    if (section === 'speaking') return Object.values(SPEAKING_SETS).filter(Boolean)
    return [getSet(part)].filter(Boolean)
  })()

  const activeSets = staticSets

  // Calculate totals for header — scoped to the active part
  const activePartData = isListening ? LISTENING_DATA[partId] : isReading ? READING_DATA[partId] : null
  const partTotalQs = activePartData
    ? activePartData.sets.reduce((a, s) => a + s.questions.length, 0)
    : 0
  const partSetsCount = activePartData ? activePartData.sets.length : 0

  const pageTitle = `${partId} · ${partLabel}`

  const scenarioText = isListening || isReading
    ? `${partSetsCount} sets · ${partTotalQs} questions · ${activePartData?.timeLimitMinutes || 8} min each`
    : isWriting
      ? `${writingQuestions.length} tasks · ${partId === 'W1' ? '27' : '26'} min each · 150–200 words`
      : `${activeSets.length} Practice Sets`

  return (
    <div className={`ps-root${isListening || isReading || isWriting ? ' ps-root--wide' : ''}`}>
      <SEO
        title="CELPIP Practice Set"
        description="Work through a timed CELPIP practice set with real exam-format questions. AI scoring and instant feedback after every answer."
        noindex={true}
      />

      {/* Compact inline header */}
      <div className={`ps-topbar${isListening || isReading || isWriting ? ' ps-topbar--wide' : ''}`}>
        <div className="ps-topbar-left">
          <button className="ps-bc-link" onClick={() => navigate('/' + cfg.page)}>{cfg.icon} {cfg.label}</button>
          <span className="ps-bc-sep">›</span>
          <span className="ps-bc-current-bold" style={{ color: cfg.color }}>{partId} — {partLabel}</span>
          <span className="ps-bc-qs-tag">{scenarioText}</span>
        </div>
        <button className="ps-arrow-btn" onClick={() => navigate('/' + cfg.page)}>← Back to {cfg.label}</button>
      </div>

      {/* ── LISTENING: Use ListeningLayout ── */}
      {isListening && (
        <div className="ps-layout-wrap ps-layout-wrap--wide">
          <ListeningLayout color={cfg.color} partId={partId} />
        </div>
      )}

      {/* ── READING: Use ReadingLayout ── */}
      {isReading && (
        <div className="ps-layout-wrap ps-layout-wrap--wide">
          <ReadingLayout color={cfg.color} partId={partId} />
        </div>
      )}

      {/* ── WRITING: Use WritingLayout ── */}
      {isWriting && writingQuestions.length > 0 && (
        <div className="ps-layout-wrap ps-layout-wrap--wide">
          <WritingLayout
            questions={writingQuestions}
            color={cfg.color}
            partId={partId}
            partLabel={partId === 'W1' ? 'Email Writing' : 'Survey Response'}
            partIcon={partId === 'W1' ? '✉️' : '📋'}
          />
        </div>
      )}

      {/* ── OTHER SECTIONS (Speaking): Use PracticeLayout ── */}
      {!isListening && !isReading && !isWriting && activeSets.length > 0 && (
        <PracticeLayout
          sets={activeSets}
          color={cfg.color}
          partId={partId}
          section={section}
          startedSets={startedSets}
          onStartSet={i => setStartedSets(s => ({ ...s, [i]: true }))}
        />
      )}

    </div>
  )
}
