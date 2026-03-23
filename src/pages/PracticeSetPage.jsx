import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePracticeSet } from '../hooks/usePracticeSet'

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
    title: 'The Rise of Urban Beekeeping in Canadian Cities',
    instruction: 'Read the passage, then answer Questions 1–5. Paragraphs are labelled A–D. For paragraph-matching questions, select which paragraph contains the information described. Select "E) Not Given" if the information does not appear in the passage.',
    scenario: 'Information Passage — Environment & Urban Life',
    type: 'mcq',
    paragraphLabels: { A: 'Para A', B: 'Para B', C: 'Para C', D: 'Para D', E: 'Not Given' },
    passage: `[A] Urban beekeeping has grown steadily across Canadian cities over the past decade, driven by a combination of environmental concern, community food initiatives, and changing municipal regulations. Cities like Toronto, Vancouver, and Montreal now permit residential beekeeping under specific conditions, and rooftop hives have become a visible presence in many downtown neighbourhoods.

[B] Proponents argue that urban bees provide measurable ecological benefits. Because cities are often warmer than surrounding rural areas and contain a diverse range of flowering plants in gardens and parks, urban bees can actually thrive more consistently than their rural counterparts. Studies from several European cities have shown higher honey production per hive in urban environments compared to agricultural zones, largely because monoculture farming reduces the variety of plants available to rural bees.

[C] Critics, however, raise concerns about the welfare of bees kept in high-density areas. Without the biodiversity of natural landscapes, urban bees may face nutritional gaps if flowering sources are limited or seasonal. There are also concerns about the spread of disease between hives kept in close proximity, and about what happens to colonies when inexperienced hobby beekeepers abandon the practice.

[D] Despite these debates, urban beekeeping continues to expand. Many cities now offer training programs and community hive projects that allow residents to participate without managing a hive individually. Whether urban beekeeping represents a meaningful contribution to pollinator health or simply a well-intentioned hobby remains an open question — but its presence in Canadian cities shows no sign of diminishing.`,
    questions: [
      { id: 1, difficulty: 'easy',   questionType: 'mcq',
        text: 'What is the main idea of this passage?',
        options: ['A) Urban beekeeping is more productive than rural beekeeping.', 'B) Urban beekeeping has grown in Canadian cities and raises both benefits and concerns.', 'C) Canadian cities should ban urban beekeeping to protect bee welfare.', 'D) European research methods are superior to Canadian beekeeping practices.'],
        answer: 1, explanation: 'The passage is balanced: it describes growth (A), presents benefits (B), raises concerns (C), and ends with an open question (D) — B is the only option that captures this nuanced, two-sided overview.' },
      { id: 2, difficulty: 'easy',   questionType: 'paragraph_match',
        text: 'Concerns about disease spreading between closely situated hives are raised.',
        options: ['A', 'B', 'C', 'D', 'E'],
        paragraphLabels: { A: 'Para A', B: 'Para B', C: 'Para C', D: 'Para D', E: 'Not Given' },
        answer: 2, explanation: 'Paragraph C specifically mentions "concerns about the spread of disease between hives kept in close proximity."' },
      { id: 3, difficulty: 'medium', questionType: 'vocab_context',
        text: 'The word "proximity" in paragraph C (line: "hives kept in close proximity") most closely means:',
        options: ['A) Competition', 'B) Closeness', 'C) Quantity', 'D) Movement'],
        targetWord: 'proximity',
        answer: 1, explanation: '"Proximity" means physical nearness. In context, hives located close together risk spreading disease — "closeness" captures this precisely.' },
      { id: 4, difficulty: 'medium', questionType: 'paragraph_match',
        text: 'A comparison is made between the amount of honey produced in cities versus agricultural areas.',
        options: ['A', 'B', 'C', 'D', 'E'],
        paragraphLabels: { A: 'Para A', B: 'Para B', C: 'Para C', D: 'Para D', E: 'Not Given' },
        answer: 1, explanation: 'Paragraph B states: "Studies from several European cities have shown higher honey production per hive in urban environments compared to agricultural zones."' },
      { id: 5, difficulty: 'hard',   questionType: 'inference',
        text: 'What does the writer\'s use of the phrase "a well-intentioned hobby" in paragraph D suggest?',
        options: ['A) The writer believes urban beekeeping has no real environmental value.', 'B) The writer is slightly sceptical about claims that it significantly helps pollinators.', 'C) The writer is enthusiastically in favour of urban beekeeping programs.', 'D) The writer believes hobby beekeepers are irresponsible.'],
        answer: 1, explanation: '"Well-intentioned hobby" is gently dismissive — it acknowledges sincerity but quietly questions whether the impact matches the enthusiasm. This is a mild sceptical hedge, not an outright dismissal.' },
    ],
  },
  R4: {
    title: 'Should Remote Work Become a Permanent Right?',
    instruction: 'Read BOTH viewpoints below. Then answer the questions by choosing the option that BEST reflects the content or position in the texts.',
    scenario: 'Viewpoints — Workplace Policy',
    type: 'mcq',
    passage: `VIEWPOINT A — Maria Delacroix, HR Director

Remote work has proven itself. Productivity data from our organization shows no decline in output, employee satisfaction scores are at an all-time high, and we have successfully hired talent from cities we could not previously recruit from. The commute is the most universally disliked part of work life, and eliminating it has given employees back hours every week. Companies that refuse to offer flexible work will simply lose their best people to competitors who do.

That said, remote work is not appropriate for every role or every employee. Some positions require physical presence, and some individuals work better in a structured office environment. What we need is not a blanket policy but a framework that treats remote work as a default right — available to all unless the role requires otherwise.

VIEWPOINT B — Kevin Tanaka, Operations Manager

The enthusiasm for remote work ignores a significant problem: collaboration suffers. The spontaneous hallway conversation, the whiteboard session, the sense of shared momentum in a team working toward the same goal — these things do not translate to video calls. Junior employees in particular lose out: they learn their craft by being near experienced colleagues, and that informal mentorship disappears when everyone is working from home.

I am not arguing that remote work has no place. For focused, independent tasks, it is often better. But codifying it as a right risks normalizing a model that works well for senior individual contributors and poorly for everyone else. Organizations should retain the authority to determine what arrangements serve their teams best.`,
    questions: [
      { id: 1, difficulty: 'easy',   questionType: 'speaker_id',
        text: 'What is Maria\'s main argument in favour of remote work?',
        options: ['A) Remote work eliminates office costs for companies.', 'B) Data shows productivity and employee satisfaction have not suffered.', 'C) All employees prefer working from home.', 'D) Remote work is better suited to junior employees than senior ones.'],
        answer: 1, explanation: 'Maria cites productivity data, high satisfaction scores, and expanded hiring reach — measurable outcomes — as evidence that remote work has proven itself.' },
      { id: 2, difficulty: 'easy',   questionType: 'speaker_id',
        text: 'What is Kevin\'s main concern about making remote work a permanent right?',
        options: ['A) It is too expensive to equip employees with home office tools.', 'B) Video calls are technically unreliable.', 'C) It benefits senior staff but disadvantages junior employees who depend on informal mentorship.', 'D) Remote workers are more likely to leave the company.'],
        answer: 2, explanation: 'Kevin specifically argues that junior employees lose the informal mentorship they gain from being physically near experienced colleagues.' },
      { id: 3, difficulty: 'medium', questionType: 'mcq',
        text: 'On which point do BOTH Maria and Kevin AGREE?',
        options: ['A) Remote work should be available to all employees without exception.', 'B) Some roles or individuals are not suited to remote work.', 'C) Productivity declines significantly when teams work remotely.', 'D) Employees should be allowed to choose their own schedules freely.'],
        answer: 1, explanation: 'Maria: "remote work is not appropriate for every role or every employee." Kevin: "for focused, independent tasks, it is often better" — implying other tasks require in-person work. Both concede remote work is not universally appropriate.' },
      { id: 4, difficulty: 'medium', questionType: 'inference',
        text: 'Kevin says codifying remote work as a right "risks normalizing a model that works well for senior individual contributors." What does this imply about his view?',
        options: ['A) He believes remote work should only be offered to senior employees.', 'B) He is concerned that making remote work a right privileges one group at the expense of another.', 'C) He thinks senior employees are more productive at home than in the office.', 'D) He wants organizations to eliminate remote work entirely for all staff.'],
        answer: 1, explanation: 'Kevin\'s point is that a blanket right would entrench a system that helps senior independent workers while systematically hurting juniors who need proximity and mentorship.' },
      { id: 5, difficulty: 'hard',   questionType: 'vocab_context',
        text: 'Maria says she wants "a framework that treats remote work as a default right." In context, "default" most closely means:',
        options: ['A) Temporary and subject to frequent review.', 'B) The standard starting position unless there is a specific reason to change it.', 'C) A strict rule with no exceptions permitted.', 'D) An optional benefit rather than an entitlement.'],
        answer: 1, explanation: '"Default" means the assumed starting point — the baseline assumption unless overridden. Maria is saying remote work should be assumed available unless a specific role requirement justifies in-person work.' },
    ],
  },
}

/* ══════════════════════════════════════════════════════════════
   WRITING — sample practice sets (writing prompt + model answer)
══════════════════════════════════════════════════════════════ */
const WRITING_SETS = {
  W1: {
    title: 'Email to a Neighbour About a Lost Package',
    instruction: 'Read the situation below and write an email of 150–200 words. You have 27 minutes.',
    scenario: 'Informal Email — Neighbourly Request',
    type: 'writing',
    prompt: `You recently ordered an important package online. The tracking system shows it was delivered to a neighbour's address by mistake three days ago. You have not been able to reach the neighbour by knocking on their door.

Write an email to your neighbour. In your email:
• Explain what happened with the package
• Describe the package so they can identify it
• Ask them to contact you and explain how they can reach you`,
    wordTarget: '150–200 words',
    tone: 'Informal — writing to a neighbour you do not know well',
    criteria: ['Address all 3 bullet points', 'Match informal but polite tone', 'Use natural, varied vocabulary', 'Clear structure and readability'],
    modelAnswer: `Hi,

I hope this message finds you well. My name is Alex Chen and I live next door at number 42. I am writing because I believe a package of mine may have been delivered to your address by mistake.

I ordered a pair of running shoes last week and the tracking information shows the parcel was delivered three days ago — but I never received it. The package is a medium-sized brown cardboard box with a blue shipping label from SportZone Canada. It would have been dropped off on Tuesday afternoon.

I would really appreciate it if you could let me know whether you received a box like this. If you did, there is absolutely no rush — I completely understand this happens — but it would be great to arrange a pickup at a time convenient for you.

You can reach me by phone at 416-555-0182 or simply knock on my door anytime after 5:00 PM on weekdays.

Thank you so much for your help!

Best regards,
Alex Chen`,
  },
  W2: {
    title: 'Survey — Working from Home vs. Working in an Office',
    instruction: 'Read the survey question below and write your response of 150–200 words. You have 26 minutes.',
    scenario: 'Opinion Response — Workplace Preference',
    type: 'writing',
    prompt: `A research organization is conducting a survey about work preferences. They want to know your opinion on the following:

Some people prefer working from home because it offers more flexibility and eliminates the daily commute. Others prefer working in an office because it provides better structure and face-to-face collaboration.

Which do you prefer — working from home or working in an office? Give specific reasons to support your choice.`,
    wordTarget: '150–200 words',
    tone: 'Semi-formal — clear, direct opinion writing',
    criteria: ['State a clear position in the opening', 'Support with 2–3 specific reasons', 'Avoid switching positions mid-response', 'Use varied vocabulary and sentence structure'],
    modelAnswer: `I strongly prefer working from home, primarily because it significantly increases my productivity and allows me to manage my time more effectively.

When I work from home, I eliminate approximately ninety minutes of daily commuting. That time is redirected into focused work, exercise, or rest — all of which contribute to better performance. Without the constant interruptions of an open office environment, I also find it much easier to concentrate on complex tasks that require sustained attention.

Beyond productivity, working from home has improved my work-life balance in ways I did not expect. I can attend to personal responsibilities — a medical appointment, a home delivery — without requesting time off. This flexibility reduces stress and, in my experience, makes me more motivated rather than less.

I acknowledge that some collaboration is harder remotely. However, with video calls, shared documents, and clear communication habits, most teamwork translates well to an online environment. The benefits of remote work far outweigh the limitations for roles that do not require physical presence.`,
  },
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
  if (sec === 'writing')   return WRITING_SETS[id]   || WRITING_SETS.W1
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

      <div className="ps-model-toggle">
        <button className="ps-reveal-btn" onClick={() => setShowModel(v => !v)} style={{ borderColor: color, color }}>
          {showModel ? '🙈 Hide Model Answer' : '📋 View Model Answer'}
        </button>
      </div>

      <AnimatePresence>
        {showModel && (
          <motion.div className="ps-model-answer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}>
            <div className="ps-model-label">📝 Model Answer</div>
            <pre className="ps-model-text">{data.modelAnswer}</pre>
          </motion.div>
        )}
      </AnimatePresence>
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
export default function PracticeSetPage({ part, setPage }) {
  // Per-set "started" flags (for listening audio gate / writing / speaking)
  const [startedSets, setStartedSets] = useState({})

  const section = part?.section || 'listening'
  const partId  = part?.id || 'L1'
  const cfg     = SECTION_CONFIG[section] || SECTION_CONFIG.listening

  // ── Fetch reading questions live from Supabase ──────────────
  const isReading = section === 'reading'
  const { sets: dbSets, loading: dbLoading, error: dbError } =
    usePracticeSet(isReading ? 'reading' : null, isReading ? partId : null)

  // ── For non-reading: build an array of all sets for this section ──
  // Show ALL sets in the sidebar so the user can switch between topics
  const staticSets = (() => {
    if (isReading) return []
    if (section === 'listening') return Object.values(LISTENING_SETS).filter(Boolean)
    if (section === 'writing')   return Object.values(WRITING_SETS).filter(Boolean)
    if (section === 'speaking')  return Object.values(SPEAKING_SETS).filter(Boolean)
    return [getSet(part)].filter(Boolean)
  })()

  const activeSets = isReading ? dbSets : staticSets

  // Loading state for reading
  if (isReading && dbLoading) {
    return (
      <div className="ps-root">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
          <div style={{ fontSize: 40 }}>📖</div>
          <p style={{ color: cfg.color, fontWeight: 600, fontSize: 18 }}>Loading practice sets…</p>
        </div>
      </div>
    )
  }

  // Error state for reading
  if (isReading && dbError) {
    return (
      <div className="ps-root">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <p style={{ color: '#C8102E', fontWeight: 600, fontSize: 18 }}>Could not load questions</p>
          <p style={{ color: '#666', fontSize: 14 }}>{dbError}</p>
          <button className="ps-start-btn" onClick={() => setPage('reading')}>← Back to Reading</button>
        </div>
      </div>
    )
  }

  const pageTitle = `${partId} · ${part?.label || 'Practice'}`
  const totalQs   = activeSets.reduce((s, x) => s + (x.questions?.length || 0), 0)

  return (
    <div className="ps-root">

      {/* Breadcrumb */}
      <div className="ps-breadcrumb">
        <button className="ps-bc-link" onClick={() => setPage('home')}>Home</button>
        <span className="ps-bc-sep">›</span>
        <button className="ps-bc-link" onClick={() => setPage(cfg.page)}>{cfg.label}</button>
        <span className="ps-bc-sep">›</span>
        <span className="ps-bc-current">{pageTitle}</span>
      </div>

      {/* Header */}
      <div className="ps-header">
        <div className="ps-header-inner">
          <div className="ps-header-top">
            <div className="ps-header-meta">
              <span className="ps-header-section">{cfg.icon} {cfg.label}</span>
              <span className="ps-bc-sep">›</span>
              <span className="ps-header-part" style={{ color: cfg.color }}>{pageTitle}</span>
            </div>
          </div>
          <h1 className="ps-title">{part?.label || pageTitle}</h1>
          <p className="ps-scenario">
            {activeSets.length} Practice Sets
            {totalQs > 0 && ` · ${totalQs} Questions`}
          </p>
        </div>
        <div className="ps-nav-arrows">
          <button className="ps-arrow-btn" onClick={() => setPage(cfg.page)}>← Back to {cfg.label}</button>
        </div>
      </div>

      {/* ── NEW SIDEBAR LAYOUT ── */}
      {activeSets.length > 0 && (
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
