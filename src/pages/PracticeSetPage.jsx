import { useState, useEffect } from 'react'
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
══════════════════════════════════════════════════════════════ */
const LISTENING_SETS = {
  L1: {
    title: 'Customer & Staff at the Library',
    instruction: 'You will hear a conversation between a man and a woman at a public library. The woman is a library staff member, and the man is a customer who needs help locating a book.',
    scenario: 'Library — Customer Service',
    type: 'mcq',
    questions: [
      { id: 1, text: 'What is the main problem the customer is trying to solve?', options: ['A) His library card has expired.', 'B) He cannot find the book he is looking for on the shelf.', 'C) He wants to borrow more books than the limit allows.', 'D) He has been charged a late fee he disagrees with.'], answer: 1, explanation: 'The man explains he checked the shelf where the system shows the book should be, but it is not there. The staff member then offers to help locate it.' },
      { id: 2, text: 'What does the staff member suggest as the first step?', options: ['A) Check whether another branch has the book.', 'B) Place a hold on the book for a future date.', 'C) Look in the returns cart near the front desk.', 'D) Search the library catalog again on her computer.'], answer: 2, explanation: 'The staff member says the returns cart often has books that have been returned but not yet re-shelved. This is her first suggestion.' },
      { id: 3, text: 'What does the man decide to do by the end of the conversation?', options: ['A) Come back tomorrow when the book will definitely be available.', 'B) Place a hold on the book so he is notified when it is ready.', 'C) Borrow a different book on the same topic.', 'D) Ask a manager to help locate the book.'], answer: 1, explanation: 'After the returns cart does not have the book, the staff member offers to place a hold. The man agrees this is the best option.' },
    ],
  },
  L2: {
    title: 'Friends Planning a Weekend Trip',
    instruction: 'You will hear a phone conversation between two friends, Sarah and Mark, who are planning a weekend trip. Listen carefully to what each person wants and what they finally decide.',
    scenario: 'Phone call — Weekend Plans',
    type: 'mcq',
    questions: [
      { id: 1, text: 'What does Sarah want to do for the weekend?', options: ['A) Stay in the city and visit a museum.', 'B) Drive to the mountains for a hike.', 'C) Book a hotel near the beach.', 'D) Visit her family in another city.'], answer: 1, explanation: "Sarah mentions she has been wanting to hike and suggests the mountains specifically." },
      { id: 2, text: "What is Mark's concern about the trip?", options: ['A) He does not like hiking.', 'B) The weather forecast looks uncertain.', 'C) He already made other plans for Saturday.', "D) His car is being repaired that weekend."], answer: 1, explanation: "Mark says he checked the weather and it might rain on Saturday. This is his main hesitation." },
      { id: 3, text: 'What do they agree to do?', options: ['A) Go hiking on Sunday instead of Saturday.', 'B) Book a cabin for both nights to be safe.', 'C) Wait and check the weather again before deciding.', 'D) Cancel the trip and plan something closer to home.'], answer: 0, explanation: "They agree to shift the hike to Sunday when the weather looks clearer." },
    ],
  },
  L3: {
    title: 'Community Centre Announcement',
    instruction: 'You will hear an announcement from a community centre director about upcoming changes to the facility and new programs being offered this season.',
    scenario: 'Community Centre — Public Announcement',
    type: 'mcq',
    questions: [
      { id: 1, text: 'Why is the swimming pool temporarily closed?', options: ['A) The pool is being expanded to add more lanes.', 'B) Scheduled safety inspections and filter upgrades are underway.', 'C) Staff are on a two-week training program.', 'D) The pool water failed a health inspection.'], answer: 1, explanation: 'The director states the pool is closed for scheduled maintenance including safety checks and filter upgrades.' },
      { id: 2, text: 'Which new program is being introduced for seniors?', options: ['A) A Wednesday morning yoga class.', 'B) An outdoor walking club on Mondays.', 'C) A low-impact aquatic fitness session.', 'D) A community gardening workshop on Fridays.'], answer: 2, explanation: 'The director specifically introduces a new aquatic fitness program designed for seniors.' },
      { id: 3, text: 'How can residents register for the new programs?', options: ['A) By calling the front desk during business hours.', 'B) By filling out a paper form at the reception.', 'C) Through the community centre website or the mobile app.', 'D) By emailing the program coordinator directly.'], answer: 2, explanation: 'The director says registration is available through the website and the updated mobile app.' },
    ],
  },
  L4: {
    title: 'News Report — City Transit Expansion',
    instruction: 'You will hear a short news report from a Canadian radio station about a major announcement from the city transit authority.',
    scenario: 'Radio News — City Transit',
    type: 'mcq',
    questions: [
      { id: 1, text: 'What is the main topic of this news report?', options: ['A) A strike by city transit workers.', 'B) Plans to extend the subway line to two new neighbourhoods.', 'C) An increase in transit fares starting next month.', 'D) A new electric bus fleet purchased by the city.'], answer: 1, explanation: 'The report opens by announcing that city council has approved a subway extension project covering two new neighbourhoods.' },
      { id: 2, text: 'According to the report, when is the project expected to be completed?', options: ['A) By the end of next year.', 'B) Within 18 months.', 'C) In approximately three years.', 'D) Within five years, pending further funding.'], answer: 2, explanation: 'The transit authority spokesperson states the project timeline is approximately three years from the start of construction.' },
    ],
  },
  L5: {
    title: 'Panel Discussion — Remote Work Policy',
    instruction: "You will hear three speakers — a company manager, an employee, and a business consultant — discussing a new company remote work policy. Listen carefully to each person's position.",
    scenario: 'Panel — Workplace Policy',
    type: 'mcq',
    questions: [
      { id: 1, text: "What is the manager's main argument in favour of the new policy?", options: ["A) Remote work saves the company money on office space.", "B) Employees are more focused at home with fewer interruptions.", "C) The policy increases employee satisfaction and reduces turnover.", "D) Remote teams perform better on complex creative tasks."], answer: 2, explanation: "The manager says the policy was introduced primarily because exit surveys showed flexibility was a major factor in employees leaving." },
      { id: 2, text: "What concern does the employee raise?", options: ["A) The internet connection at home is unreliable.", "B) Remote work makes it harder to separate personal and work time.", "C) Team collaboration suffers when people are not in the same office.", "D) Promotions are harder to get for remote workers."], answer: 1, explanation: "The employee mentions that working from home has blurred the boundaries between work and personal life." },
      { id: 3, text: "Which point do the manager and consultant BOTH agree on?", options: ["A) All employees should have the option to work from home full time.", "B) In-person meetings should be held at least once a month.", "C) Clear communication guidelines are essential for remote teams.", "D) The policy should be reviewed after six months."], answer: 2, explanation: "Both independently mention that teams need clear communication protocols to make remote work effective." },
    ],
  },
  L6: {
    title: 'Debate — Should Cities Ban Single-Use Plastics?',
    instruction: 'You will hear two speakers presenting contrasting viewpoints on whether cities should ban single-use plastics. Speaker A supports the ban; Speaker B opposes it.',
    scenario: 'Debate Format — Environmental Policy',
    type: 'mcq',
    questions: [
      { id: 1, text: "What is Speaker A's main argument for the ban?", options: ["A) Single-use plastics are more expensive than reusable alternatives.", "B) Most plastics are not actually recyclable despite what labels say.", "C) A ban will drive innovation in sustainable packaging industries.", "D) Other countries have already banned plastics successfully."], answer: 1, explanation: "Speaker A argues the recycling system fails in practice — most single-use plastics end up in landfill despite being labelled recyclable." },
      { id: 2, text: "What is Speaker B's main concern about the ban?", options: ["A) Reusable bags are inconvenient for shoppers.", "B) The ban would disproportionately hurt low-income consumers.", "C) Plastic alternatives are less hygienic in food service.", "D) The government has no authority to regulate packaging."], answer: 1, explanation: "Speaker B argues that low-income households rely on cheap single-use products and banning them places an unfair financial burden on poorer communities." },
      { id: 3, text: 'What do both speakers agree on?', options: ["A) An outright ban is the only effective solution.", "B) Consumer education alone is insufficient to solve the plastic problem.", "C) Businesses should voluntarily phase out plastics without regulation.", "D) The issue requires more scientific research before action."], answer: 1, explanation: "Despite disagreeing on the solution, both acknowledge that relying on consumers alone without structural change is not enough." },
    ],
  },
}

/* ══════════════════════════════════════════════════════════════
   READING — sample practice sets
══════════════════════════════════════════════════════════════ */
const READING_SETS = {
  R1: {
    title: 'Email — Noise Complaint to Property Manager',
    instruction: 'Read the email below, then answer the questions that follow.',
    scenario: 'Residential — Tenant Correspondence',
    type: 'mcq',
    passage: `Subject: Ongoing Noise Disturbance — Unit 4B

Dear Ms. Harrington,

I am writing to bring a recurring issue to your attention. Over the past three weeks, the tenant in the unit directly above mine (4B) has been causing significant noise disturbances late at night — specifically between 11:00 PM and 2:00 AM on weekdays. The noise includes loud music, footsteps, and what sounds like furniture being moved repeatedly.

I have attempted to resolve this informally by speaking with the tenant directly, but the behaviour has continued without improvement. As a long-term resident of this building, I would appreciate your assistance in addressing this matter in accordance with the building's noise policy.

I am available to speak at your convenience and can provide dates and times of the specific incidents if needed.

Sincerely,
James Kowalski
Unit 3B`,
    questions: [
      { id: 1, text: 'What is the main purpose of this email?', options: ['A) To request a rent reduction due to the disturbance.', 'B) To formally report a noise complaint to the property manager.', 'C) To ask the property manager to evict the upstairs tenant.', 'D) To notify the building of a broken noise policy.'], answer: 1, explanation: "The email's primary purpose is to formally bring the noise issue to the property manager's attention and request that it be addressed. There is no mention of rent reduction or eviction." },
      { id: 2, text: 'Why does the writer mention speaking with the upstairs tenant?', options: ['A) To show that he has already tried to resolve the issue informally.', 'B) To suggest the upstairs tenant is willing to cooperate.', 'C) To prove that the disturbance is intentional.', 'D) To explain why he is frustrated with building management.'], answer: 0, explanation: "He mentions the prior conversation to demonstrate he tried to resolve it informally before escalating to the property manager — showing good faith." },
      { id: 3, text: 'What is the tone of this email?', options: ['A) Angry and confrontational.', 'B) Casual and conversational.', 'C) Formal and professional.', 'D) Apologetic and uncertain.'], answer: 2, explanation: "The email uses formal language (\"I am writing to bring...\", \"I would appreciate your assistance\") and maintains a professional, measured tone throughout." },
    ],
  },
  R2: {
    title: 'Community Centre — Weekly Schedule',
    instruction: 'Read the passage and the schedule below, then answer the questions.',
    scenario: 'Community Centre — Program Information',
    type: 'mcq',
    passage: `The Riverside Community Centre has updated its weekly fitness schedule for the spring season. Yoga classes run on Monday and Wednesday mornings from 9:00 AM to 10:00 AM. The aquatic fitness class for seniors is offered Tuesday and Thursday afternoons from 2:00 PM to 3:00 PM. Indoor cycling is available Monday through Friday at 6:00 PM. All classes require advance registration, which can be completed online or at the front desk.

Note: The pool will be closed for maintenance on Thursday, April 10th. The aquatic fitness class on that date will be replaced by a chair yoga session in Room 2.

SCHEDULE (Week of April 7–11):
Mon Apr 7:  Yoga (9AM), Indoor Cycling (6PM)
Tue Apr 8:  Aquatic Fitness (2PM), Indoor Cycling (6PM)
Wed Apr 9:  Yoga (9AM), Indoor Cycling (6PM)
Thu Apr 10: Chair Yoga – Room 2 (2PM), Indoor Cycling (6PM)
Fri Apr 11: Indoor Cycling (6PM)`,
    questions: [
      { id: 1, text: 'A senior wants to attend an aquatic fitness class this week. Which day should they register for?', options: ['A) Monday, April 7', 'B) Tuesday, April 8', 'C) Thursday, April 10', 'D) Friday, April 11'], answer: 1, explanation: "Aquatic Fitness runs Tuesday and Thursday. On Thursday April 10 the pool is closed and the class is replaced by Chair Yoga. Tuesday April 8 is the only aquatic fitness option that week." },
      { id: 2, text: 'How many classes are available on Wednesday, April 9?', options: ['A) One', 'B) Two', 'C) Three', 'D) Four'], answer: 1, explanation: "Wednesday has Yoga at 9AM and Indoor Cycling at 6PM — two classes total." },
      { id: 3, text: 'Why is the aquatic fitness class replaced on April 10?', options: ['A) The instructor is unavailable that day.', 'B) The pool is closed for maintenance.', 'C) A special event is taking place at the community centre.', 'D) Enrolment numbers were too low to run the class.'], answer: 1, explanation: "The passage specifically states the pool will be closed for maintenance on Thursday April 10, which is why the class is replaced." },
    ],
  },
  R3: {
    title: 'The Rise of Urban Beekeeping in Canadian Cities',
    instruction: 'Read the passage below, then answer the questions.',
    scenario: 'General Interest — Environment & Urban Life',
    type: 'mcq',
    passage: `Urban beekeeping has grown steadily across Canadian cities over the past decade, driven by a combination of environmental concern, community food initiatives, and changing municipal regulations. Cities like Toronto, Vancouver, and Montreal now permit residential beekeeping under specific conditions, and rooftop hives have become a visible presence in many downtown neighbourhoods.

Proponents argue that urban bees provide measurable ecological benefits. Because cities are often warmer than surrounding rural areas and contain a diverse range of flowering plants in gardens and parks, urban bees can actually thrive more consistently than their rural counterparts. Studies from several European cities have shown higher honey production per hive in urban environments compared to agricultural zones, largely because monoculture farming reduces the variety of plants available to rural bees.

Critics, however, raise concerns about the welfare of bees kept in high-density areas. Without the biodiversity of natural landscapes, urban bees may face nutritional gaps if flowering sources are limited or seasonal. There are also concerns about the spread of disease between hives kept in close proximity, and about what happens to colonies when inexperienced hobby beekeepers abandon the practice.

Despite these debates, urban beekeeping continues to expand. Many cities now offer training programs and community hive projects that allow residents to participate without managing a hive individually. Whether urban beekeeping represents a meaningful contribution to pollinator health or simply a well-intentioned hobby remains an open question — but its presence in Canadian cities shows no sign of diminishing.`,
    questions: [
      { id: 1, text: 'What is the main idea of this passage?', options: ['A) Urban beekeeping is more productive than rural beekeeping.', 'B) Urban beekeeping has grown in Canadian cities and raises both benefits and concerns.', 'C) Canadian cities should ban urban beekeeping to protect bee welfare.', 'D) European cities have better beekeeping practices than Canadian ones.'], answer: 1, explanation: "The passage introduces urban beekeeping's growth, presents arguments in favour, then raises concerns, ending with a balanced view. Option B captures this neutral, balanced main idea." },
      { id: 2, text: 'According to the passage, why might urban bees produce more honey than rural bees?', options: ['A) Urban bees are a different, more productive species.', 'B) City temperatures are warmer, which makes bees more active.', 'C) Cities offer a more diverse range of flowering plants than monoculture farmland.', 'D) Urban beekeepers are more experienced than rural ones.'], answer: 2, explanation: "The passage states that rural bees suffer because monoculture farming limits plant variety, while cities have diverse gardens and parks. More plant variety means more nectar sources for urban bees." },
      { id: 3, text: 'What does the word "proximity" mean as used in the third paragraph?', options: ['A) Competition', 'B) Closeness', 'C) Popularity', 'D) Movement'], answer: 1, explanation: "\"Proximity\" means nearness or being close together. The passage uses it to describe hives kept near each other in urban areas, which raises the risk of disease spreading between colonies." },
    ],
  },
  R4: {
    title: 'Should Remote Work Become a Permanent Right?',
    instruction: 'Read both viewpoints below, then answer the questions.',
    scenario: 'Opinion Texts — Workplace Policy',
    type: 'mcq',
    passage: `VIEWPOINT A — Maria Delacroix, HR Director

Remote work has proven itself. Productivity data from our organization shows no decline in output, employee satisfaction scores are at an all-time high, and we have successfully hired talent from cities we could not previously recruit from. The commute is the most universally disliked part of work life, and eliminating it has given employees back hours every week. Companies that refuse to offer flexible work will simply lose their best people to competitors who do.

That said, remote work is not appropriate for every role or every employee. Some positions require physical presence, and some individuals work better in a structured office environment. What we need is not a blanket policy but a framework that treats remote work as a default right — available to all unless the role requires otherwise.

VIEWPOINT B — Kevin Tanaka, Operations Manager

The enthusiasm for remote work ignores a significant problem: collaboration suffers. The spontaneous hallway conversation, the whiteboard session, the sense of shared momentum in a team working toward the same goal — these things do not translate to video calls. Junior employees in particular lose out: they learn their craft by being near experienced colleagues, and that informal mentorship disappears when everyone is working from home.

I am not arguing that remote work has no place. For focused, independent tasks, it is often better. But codifying it as a right risks normalizing a model that works well for senior individual contributors and poorly for everyone else. Organizations should retain the authority to determine what arrangements serve their teams best.`,
    questions: [
      { id: 1, text: "What is Maria's main argument in favour of remote work?", options: ['A) Remote work eliminates office costs for companies.', 'B) Data shows productivity and satisfaction have not suffered.', 'C) All employees prefer working from home.', 'D) Remote work is better suited to junior employees.'], answer: 1, explanation: "Maria cites productivity data, high satisfaction scores, and expanded hiring reach as evidence that remote work has proven itself — all forms of measurable outcome data." },
      { id: 2, text: "What is Kevin's main concern about making remote work a permanent right?", options: ['A) It costs too much to equip employees with home office tools.', 'B) Video calls are less reliable than in-person meetings.', 'C) It benefits senior employees but harms junior ones who rely on mentorship.', 'D) Remote workers are more likely to change jobs frequently.'], answer: 2, explanation: "Kevin specifically argues that junior employees lose informal mentorship when experienced colleagues are absent, and this is his primary concern about normalizing remote work." },
      { id: 3, text: 'On which point do both Maria and Kevin AGREE?', options: ['A) Remote work should be available to all employees without exception.', 'B) Some roles are not suitable for remote work.', 'C) Productivity declines significantly when teams work remotely.', 'D) Companies should let employees choose their own schedules.'], answer: 1, explanation: "Maria acknowledges remote work is not appropriate for every role or employee. Kevin says for focused independent tasks it is often better. Both agree remote work is not universally suitable — some roles require in-person presence." },
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
   SHARED MCQ COMPONENTS
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
   FILL-BLANK QUESTION — inline dropdown in sentence
══════════════════════════════════════════════════════════════ */
function FillBlankQuestion({ q, index }) {
  const [selected, setSelected] = useState(null)
  const answered = selected !== null
  const correct  = selected === q.answer

  // Split on the blank marker (e.g. "1___." or "1___,")
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

      {/* Sentence with inline dropdown */}
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

      {/* Explanation (after answer chosen) */}
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
   Shows a single MCQ or fill-blank question with Prev / Next nav.
   Used inside the main practice layout for all section types.
══════════════════════════════════════════════════════════════ */
function QuestionPanel({ questions, color }) {
  const [qIndex,    setQIndex]    = useState(0)
  const [answers,   setAnswers]   = useState({})  // { [qIndex]: selectedIndex }
  const [revealed,  setRevealed]  = useState(false)

  const q        = questions[qIndex]
  const total    = questions.length
  const selected = answers[qIndex] ?? null
  const answered = selected !== null
  const correct  = selected === q.answer
  const isFill   = q.questionType === 'fill_blank'

  // Reset reveal when changing question
  const goTo = (n) => { setQIndex(n); setRevealed(false) }

  // Fill-blank helpers
  const blankRe  = /\d+___[.,]?/
  const parts    = q.text.split(blankRe)
  const blankNum = (q.text.match(/(\d+)___/) || ['', qIndex + 1])[1]

  const pct = Math.round(((qIndex + 1) / total) * 100)

  return (
    <div className="ps-qpanel">
      {/* Progress bar */}
      <div className="ps-qpanel-progress-wrap">
        <div className="ps-qpanel-progress-bar">
          <div className="ps-qpanel-progress-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="ps-qpanel-progress-label" style={{ color }}>
          {qIndex + 1} / {total}
        </span>
      </div>

      {/* Question card */}
      <motion.div
        key={qIndex}
        className={`ps-q-card ps-q-card--solo${answered ? (correct ? ' ps-q-correct' : ' ps-q-wrong') : ''}`}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="ps-q-num-row">
          <span className="ps-q-num" style={{ background: color }}>Q{qIndex + 1}</span>
          {isFill && <span className="ps-fbq-tag">Fill in blank {blankNum}</span>}
          {answered && (
            <span className={`ps-q-verdict ${correct ? 'ps-q-verdict--ok' : 'ps-q-verdict--err'}`}>
              {correct ? '✓ Correct' : '✗ Incorrect'}
            </span>
          )}
        </div>

        {/* Question text — fill-blank shows sentence with inline dropdown */}
        {isFill ? (
          <div className="ps-fbq-sentence ps-fbq-sentence--solo">
            <span>{parts[0]}</span>
            <select
              className={`ps-blank-select${answered ? (correct ? ' ps-blank-select--correct' : ' ps-blank-select--wrong') : ''}`}
              value={selected ?? ''}
              onChange={e => setAnswers(a => ({ ...a, [qIndex]: Number(e.target.value) }))}
              disabled={answered}
            >
              <option value="" disabled>choose ▾</option>
              {(q.options || []).map((opt, i) => (
                <option key={i} value={i}>{opt}</option>
              ))}
            </select>
            {parts[1] && <span>{parts[1]}</span>}
          </div>
        ) : (
          <p className="ps-q-text">{q.text}</p>
        )}

        {/* Options — MCQ only */}
        {!isFill && (
          <div className="ps-q-options">
            {q.options.map((opt, i) => {
              let cls = 'ps-q-option'
              if (answered || revealed) {
                if (i === q.answer)        cls += ' ps-opt-correct'
                else if (i === selected)   cls += ' ps-opt-wrong'
                else                       cls += ' ps-opt-dim'
              }
              if (selected === i) cls += ' ps-opt-selected'
              return (
                <button
                  key={i}
                  className={cls}
                  style={selected === i && !answered ? { borderColor: color } : {}}
                  onClick={() => {
                    if (!answered && !revealed)
                      setAnswers(a => ({ ...a, [qIndex]: i }))
                  }}
                  disabled={answered || revealed}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {/* Explanation */}
        <AnimatePresence>
          {(answered || revealed) && (
            <motion.div
              className={`ps-q-explanation${correct && answered ? ' ps-exp-correct' : ''}`}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            >
              {!correct && answered && (
                <div className="ps-fbq-correct-ans" style={{ marginBottom: 6 }}>
                  ✓ Correct answer: <strong>{q.options[q.answer]}</strong>
                </div>
              )}
              <span className="ps-exp-icon">{correct && answered ? '✅' : '📘'}</span>
              <span>{q.explanation}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Navigation row */}
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

      {/* Dot indicators */}
      <div className="ps-qpanel-dots">
        {questions.map((_, i) => (
          <button
            key={i}
            className={`ps-qdot${i === qIndex ? ' ps-qdot--active' : ''}${answers[i] !== undefined ? (answers[i] === questions[i].answer ? ' ps-qdot--ok' : ' ps-qdot--err') : ''}`}
            style={i === qIndex ? { background: color, borderColor: color } : {}}
            onClick={() => goTo(i)}
            title={`Question ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   PRACTICE LAYOUT — Sidebar + Main panel
   Used for ALL section types (reading, listening, writing, speaking)
══════════════════════════════════════════════════════════════ */
function PracticeLayout({ sets, color, partId, section, startedSets, onStartSet, staticData }) {
  const [activeSet,     setActiveSet]     = useState(0)
  const [sidebarOpen,   setSidebarOpen]   = useState(true)

  const set = sets[activeSet]
  if (!set) return null

  const diffStyle  = DIFF_COLOURS[set.difficulty] || DIFF_COLOURS['medium']
  const fillBlanks = set.questions ? set.questions.filter(q => q.questionType === 'fill_blank') : []
  const mcqs       = set.questions ? set.questions.filter(q => q.questionType !== 'fill_blank') : []
  // For non-reading, all questions are MCQ (no questionType field → treat as mcq)
  const allQs      = set.questions || []

  return (
    <div className={`ps-layout${sidebarOpen ? '' : ' ps-layout--sidebar-hidden'}`}>

      {/* ── SIDEBAR ── */}
      <aside className="ps-sidebar">
        <div className="ps-sidebar-header">
          <span className="ps-sidebar-title" style={{ color }}>
            {section === 'reading' ? '📋 Practice Sets' : '� Topics'}
          </span>
          <button className="ps-sidebar-toggle" onClick={() => setSidebarOpen(false)} title="Hide panel">
            ✕
          </button>
        </div>
        <nav className="ps-sidebar-nav">
          {sets.map((s, i) => {
            const d   = DIFF_COLOURS[s.difficulty] || DIFF_COLOURS['medium']
            const qs  = s.questions?.length || 0
            return (
              <button
                key={i}
                className={`ps-sidebar-item${i === activeSet ? ' ps-sidebar-item--active' : ''}`}
                style={i === activeSet ? { borderLeftColor: color, background: `${color}0d` } : {}}
                onClick={() => setActiveSet(i)}
              >
                <span className="ps-sidebar-item-num" style={i === activeSet ? { background: color } : {}}>
                  {i + 1}
                </span>
                <span className="ps-sidebar-item-body">
                  <span className="ps-sidebar-item-title">{s.setTitle || s.title}</span>
                  <span className="ps-sidebar-item-meta">
                    <span className="ps-diff-badge" style={{ background: d.bg, color: d.text, fontSize: 10 }}>
                      {(s.difficulty || 'medium').charAt(0).toUpperCase() + (s.difficulty || 'medium').slice(1)}
                    </span>
                    {qs > 0 && <span className="ps-sidebar-item-qs">{qs} Qs</span>}
                  </span>
                </span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ── TOGGLE BUTTON (shown when sidebar is hidden) ── */}
      {!sidebarOpen && (
        <button
          className="ps-sidebar-show-btn"
          style={{ borderColor: color, color }}
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Sets
        </button>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="ps-main">

        {/* Set title bar */}
        <div className="ps-main-set-bar">
          <div className="ps-main-set-bar-left">
            <span className="ps-main-set-num" style={{ background: color }}>Set {set.setNumber ?? activeSet + 1}</span>
            <div>
              <div className="ps-main-set-title">{set.setTitle || set.title}</div>
              {(set.scenario || set.instruction) && (
                <div className="ps-main-set-scenario">{set.scenario || ''}</div>
              )}
            </div>
          </div>
          <span className="ps-diff-badge" style={{ background: diffStyle.bg, color: diffStyle.text }}>
            {(set.difficulty || 'medium').charAt(0).toUpperCase() + (set.difficulty || 'medium').slice(1)}
          </span>
        </div>

        {/* Instruction */}
        <div className="ps-main-instruction" style={{ borderLeftColor: color }}>
          {set.instruction}
        </div>

        {/* Diagram (R2 only — above passage) */}
        {set.diagramHtml && <DiagramBlock html={set.diagramHtml} />}

        {/* Passage / email */}
        {set.passage && (
          <div className="ps-passage-block" style={{ borderLeftColor: color }}>
            <div className="ps-passage-label" style={{ color }}>
              {set.diagramHtml ? '✉️ Email' : '📄 Reading Passage'}
            </div>
            <pre className="ps-passage-text">{set.passage}</pre>
          </div>
        )}

        {/* Writing / Speaking special UIs */}
        {set.type === 'writing' && (
          <WritingPractice
            data={set}
            started={startedSets[activeSet]}
            onStart={() => onStartSet(activeSet)}
            color={color}
          />
        )}
        {set.type === 'speaking' && (
          <SpeakingPractice
            data={set}
            started={startedSets[activeSet]}
            onStart={() => onStartSet(activeSet)}
            color={color}
          />
        )}

        {/* Listening audio gate */}
        {set.type === 'mcq' && section === 'listening' && !startedSets[activeSet] && (
          <AudioGate started={false} onStart={() => onStartSet(activeSet)} />
        )}

        {/* Questions — one at a time */}
        {allQs.length > 0 && (
          (set.type !== 'mcq' || section !== 'listening' || startedSets[activeSet]) &&
          set.type !== 'writing' && set.type !== 'speaking'
        ) && (
          <>
            {/* Fill-blank section header */}
            {fillBlanks.length > 0 && mcqs.length > 0 && (
              <div className="ps-section-divider" style={{ color }}>✏️ Part 1 — Fill in the Blanks</div>
            )}
            {fillBlanks.length > 0 && <QuestionPanel questions={fillBlanks} color={color} />}

            {fillBlanks.length > 0 && mcqs.length > 0 && (
              <div className="ps-section-divider" style={{ color, marginTop: 28 }}>📝 Part 2 — Comprehension Questions</div>
            )}
            {mcqs.length > 0 && <QuestionPanel questions={mcqs} color={color} />}

            {/* Pure MCQ (no fill-blank) — listening + reading R1/R3/R4 */}
            {fillBlanks.length === 0 && mcqs.length === 0 && allQs.length > 0 && (
              <QuestionPanel questions={allQs} color={color} />
            )}
          </>
        )}

      </main>
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
