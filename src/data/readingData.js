/**
 * readingData.js
 * 5 complete CELPIP Reading practice sets.
 * Each set contains 4 parts (R1–R4) with a passage and questions.
 *
 * Part format:
 *   R1 — Correspondence      (11 min, Intermediate)
 *   R2 — Apply a Diagram     (13 min, Intermediate)
 *   R3 — Information          (14 min, Upper Intermediate)
 *   R4 — Viewpoints           (17 min, Advanced)
 *
 * Question format:
 *   { id, text, options: [A,B,C,D], answer: 0–3, explanation, difficulty, questionType }
 */

export const READING_PRACTICE_SETS = [
  // ═══════════════════════ SET 1 ═══════════════════════
  {
    setNumber: 1,
    title: 'Set 1',
    parts: [
      // ── R1 — Correspondence ──
      {
        partId: 'R1',
        partLabel: 'Correspondence',
        icon: '✉️',
        difficulty: 'intermediate',
        timeLimitMinutes: 11,
        passage: `From: Unit 4B — Rashid Karim <rashid.karim@email.com>
To: buildingmanager@mapleviewresidences.ca
Date: September 12, 2025
Subject: Elevator out of service & parking concern

Dear Building Manager,

I am writing to bring two issues to your attention.

First, the elevator in the east wing has been out of service since Monday, September 8th. I live on the 11th floor, and the stairwell has become my only option. I have a knee condition that makes climbing stairs painful, and I know at least two other residents on upper floors who are elderly and equally affected. A notice was posted saying repairs would take "a few days," but it has now been five days with no update.

Second, I have noticed that an unmarked white van has been parked in my assigned spot (B-12) every night this week. I have had to park on the street, which has resulted in two parking tickets totalling $140. I would appreciate it if you could look into who owns the vehicle and ask them to move it.

I understand that building maintenance takes time, but I would appreciate a timeline for the elevator repair and a resolution to the parking issue as soon as possible.

Thank you for your attention.

Best regards,
Rashid Karim
Unit 4B`,
        questions: [
          {
            id: 'r1s1q1', difficulty: 'easy', questionType: 'gist',
            text: 'What is the main purpose of Rashid\'s email?',
            options: [
              'A) To complain about noisy neighbours in the building',
              'B) To report two building issues and request resolution',
              'C) To request a rent reduction due to poor maintenance',
              'D) To announce that he is moving out of the building',
            ],
            answer: 1,
            explanation: 'Rashid clearly states two issues — the broken elevator and the parking problem — and asks the manager to address both.',
          },
          {
            id: 'r1s1q2', difficulty: 'medium', questionType: 'detail',
            text: 'How long has the elevator been out of service when Rashid writes?',
            options: [
              'A) Two days',
              'B) Three days',
              'C) Five days',
              'D) One week',
            ],
            answer: 2,
            explanation: 'The elevator went out on Monday September 8th, and Rashid writes on September 12th — five days later. He also explicitly says "it has now been five days."',
          },
          {
            id: 'r1s1q3', difficulty: 'medium', questionType: 'inference',
            text: 'What can be inferred about Rashid\'s tone in this email?',
            options: [
              'A) Aggressive and threatening legal action',
              'B) Frustrated but polite and reasonable',
              'C) Indifferent and unconcerned about the issues',
              'D) Sarcastic and mocking toward management',
            ],
            answer: 1,
            explanation: 'Rashid acknowledges "building maintenance takes time" while firmly requesting resolution — frustrated but respectful throughout.',
          },
          {
            id: 'r1s1q4', difficulty: 'hard', questionType: 'inference',
            text: 'Why does Rashid mention the $140 in parking tickets?',
            options: [
              'A) To show he can afford the cost without issue',
              'B) To demonstrate the financial impact of the unresolved parking problem',
              'C) To threaten the building manager with a lawsuit',
              'D) To request that the building pay for his street parking',
            ],
            answer: 1,
            explanation: 'The specific dollar amount shows the tangible cost Rashid is bearing because the parking issue remains unresolved — it strengthens his case for urgency.',
          },
        ],
      },
      // ── R2 — Apply a Diagram ──
      {
        partId: 'R2',
        partLabel: 'Apply a Diagram',
        icon: '📊',
        difficulty: 'intermediate',
        timeLimitMinutes: 13,
        passage: `The Oakridge Community Centre has released its updated weekly activity schedule for the fall season. All programs require advance registration through the centre website or at the front desk. Drop-in attendance is no longer permitted for any program.

Note: The swimming pool will be closed for maintenance from October 6–10. All aquatic programs during that week will be replaced with alternative land-based activities in the gymnasium.

FALL ACTIVITY SCHEDULE
┌──────────────┬─────────────────────────────────────────────────┐
│ Monday       │ Yoga (9:00–10:00 AM) · Swim Fit (6:00–7:00 PM) │
│ Tuesday      │ Seniors\' Tai Chi (10:00–11:00 AM) · Art Class (4:00–5:30 PM) │
│ Wednesday    │ Yoga (9:00–10:00 AM) · Indoor Soccer (7:00–8:30 PM) │
│ Thursday     │ Seniors\' Tai Chi (10:00–11:00 AM) · Swim Fit (6:00–7:00 PM) │
│ Friday       │ Family Dance (5:00–6:00 PM) · Open Gym (6:30–8:00 PM) │
│ Saturday     │ Kids\' Swimming (9:00–10:00 AM) · Community BBQ (12:00–2:00 PM — monthly, first Saturday only) │
└──────────────┴─────────────────────────────────────────────────┘`,
        questions: [
          {
            id: 'r2s1q1', difficulty: 'easy', questionType: 'detail',
            text: 'On which days is Yoga offered at the community centre?',
            options: [
              'A) Monday and Thursday',
              'B) Monday and Wednesday',
              'C) Tuesday and Thursday',
              'D) Wednesday and Friday',
            ],
            answer: 1,
            explanation: 'The schedule clearly shows Yoga on Monday and Wednesday mornings from 9:00–10:00 AM.',
          },
          {
            id: 'r2s1q2', difficulty: 'medium', questionType: 'inference',
            text: 'A senior wants to attend Swim Fit on Thursday, October 9th. What will most likely happen?',
            options: [
              'A) The class will run as normal in the pool',
              'B) The class will be cancelled with no replacement',
              'C) The class will be replaced with a land-based activity in the gymnasium',
              'D) The class will be moved to Friday',
            ],
            answer: 2,
            explanation: 'October 9th falls within the pool closure period (October 6–10). The passage states all aquatic programs during that week will be replaced with land-based alternatives in the gym.',
          },
          {
            id: 'r2s1q3', difficulty: 'medium', questionType: 'detail',
            text: 'How can residents register for programs?',
            options: [
              'A) By calling the centre during business hours',
              'B) Through the website or at the front desk',
              'C) By emailing the program coordinator',
              'D) Drop-in registration is available at any time',
            ],
            answer: 1,
            explanation: 'The passage states registration can be completed "through the centre website or at the front desk." Drop-in is explicitly no longer permitted.',
          },
        ],
      },
      // ── R3 — Information ──
      {
        partId: 'R3',
        partLabel: 'Information',
        icon: '📄',
        difficulty: 'upper-intermediate',
        timeLimitMinutes: 14,
        passage: `[A] The adoption of electric vehicles (EVs) in Canadian cities has accelerated sharply over the past three years. In 2022, EVs accounted for roughly 8% of new vehicle sales nationwide. By 2025, that figure had climbed to nearly 19%, driven by a combination of federal purchase incentives, tighter emissions standards, and a growing network of public charging stations.

[B] The shift has been most pronounced in British Columbia and Quebec, where provincial rebates stack on top of the federal incentive, making the upfront cost of an EV comparable to a mid-range gasoline vehicle. In contrast, provinces like Alberta and Saskatchewan — where distances between cities are greater and charging infrastructure is thinner — have seen slower uptake.

[C] Range anxiety remains the most commonly cited barrier among potential buyers. While modern EVs routinely offer 350–500 km on a single charge, many Canadians worry about long highway trips in winter, when cold temperatures can reduce battery range by 20–30%. Automakers have responded with improved battery chemistry and heat-pump cabin heating systems, but consumer confidence still lags behind the technology.

[D] Environmental advocates point to the broader benefits: reduced tailpipe emissions, lower lifetime fuel costs, and quieter streets. Critics, however, note that the electricity powering EVs in coal-dependent provinces may not be significantly cleaner than gasoline, and that mining lithium and cobalt for batteries carries its own environmental cost.

[E] Looking ahead, the federal government's mandate requiring all new light-duty vehicles sold in Canada to be zero-emission by 2035 will likely make EVs the default rather than the exception. Whether the charging infrastructure and electricity grid can scale fast enough remains an open question.`,
        questions: [
          {
            id: 'r3s1q1', difficulty: 'easy', questionType: 'detail',
            text: 'According to the passage, what percentage of new vehicle sales were EVs in 2025?',
            options: [
              'A) 8%',
              'B) 12%',
              'C) Nearly 19%',
              'D) Over 25%',
            ],
            answer: 2,
            explanation: 'Paragraph A states the figure "climbed to nearly 19%" by 2025.',
          },
          {
            id: 'r3s1q2', difficulty: 'medium', questionType: 'inference',
            text: 'Why have British Columbia and Quebec seen higher EV adoption than Alberta?',
            options: [
              'A) They have warmer climates that extend battery range',
              'B) Provincial rebates reduce upfront costs below what federal incentives alone achieve',
              'C) Gasoline is not available in those provinces',
              'D) Residents in Alberta prefer larger vehicles',
            ],
            answer: 1,
            explanation: 'Paragraph B explains that BC and Quebec offer provincial rebates that "stack on top of the federal incentive," making EVs price-competitive.',
          },
          {
            id: 'r3s1q3', difficulty: 'medium', questionType: 'vocab_context',
            text: 'In paragraph C, "range anxiety" most likely refers to:',
            options: [
              'A) Fear of driving at high speeds on highways',
              'B) Concern that the vehicle will run out of charge before reaching a destination',
              'C) Worry about the cost of replacing the battery',
              'D) Anxiety about learning to drive a new type of vehicle',
            ],
            answer: 1,
            explanation: 'The context makes clear that "range anxiety" is the fear of running out of charge — the passage immediately discusses battery range and charging concerns.',
          },
          {
            id: 'r3s1q4', difficulty: 'hard', questionType: 'inference',
            text: 'What does the author suggest by saying "consumer confidence still lags behind the technology"?',
            options: [
              'A) Consumers do not trust automakers in general',
              'B) The technology has improved faster than public perception of it',
              'C) EVs are unreliable and consumers are right to be cautious',
              'D) Technology companies are not marketing EVs effectively',
            ],
            answer: 1,
            explanation: 'The phrase means EVs have improved significantly (350–500 km range, better heating), but buyers have not yet caught up to trusting those improvements.',
          },
        ],
      },
      // ── R4 — Viewpoints ──
      {
        partId: 'R4',
        partLabel: 'Viewpoints',
        icon: '⚖️',
        difficulty: 'advanced',
        timeLimitMinutes: 17,
        passage: `LETTER A — In support of the proposed bike lane on Dundas Street
To the Editor,

I strongly support the city's plan to install a protected bike lane on Dundas Street. As a daily cyclist, I have witnessed firsthand how dangerous this corridor is for people on bikes. In the past two years, there have been 14 reported collisions involving cyclists on this stretch — three of them serious. A protected lane would physically separate cyclists from motor vehicle traffic and dramatically reduce these incidents.

Beyond safety, bike lanes encourage more residents to choose cycling over driving, which eases congestion and reduces emissions. Cities like Montreal and Vancouver have seen measurable drops in car traffic on streets where protected lanes were built. Dundas Street is wide enough to accommodate the lane without eliminating parking on both sides — the current proposal removes parking on one side only, which is a reasonable compromise.

I understand that some business owners are worried about losing customers who drive. But research from Toronto's Bloor Street bike lane pilot showed that retail sales on the street actually increased after the lane was installed, because cyclists stop more frequently at local shops than drivers passing through.

— Maria Santos, Ward 6 resident

LETTER B — Against the proposed bike lane on Dundas Street
To the Editor,

I am opposed to the Dundas Street bike lane proposal, and I say this as someone who supports cycling in principle. The problem is not the concept — it is this specific plan on this specific street.

Dundas Street is a primary transit and delivery corridor. Removing parking on one side will force delivery trucks to double-park in the remaining lane, which will create more congestion, not less. The city's own traffic study estimates that vehicle travel times on Dundas will increase by 15–22% during peak hours. For the thousands of commuters who use this route daily, that is a significant cost.

I am also concerned about the consultation process. The proposal was fast-tracked through committee with only one public meeting, held on a Tuesday afternoon when most working residents could not attend. A decision this significant deserves broader community input.

Instead of a protected bike lane on Dundas, I would support expanding the cycling network on parallel residential streets like Elm and Pine, where traffic volumes are lower and the infrastructure can be built without disrupting a major corridor. This approach would still grow the bike network while avoiding the congestion problems that the Dundas plan creates.

— James Whitfield, Dundas Street business owner`,
        questions: [
          {
            id: 'r4s1q1', difficulty: 'easy', questionType: 'detail',
            text: 'What is Maria Santos\'s main argument in favour of the bike lane?',
            options: [
              'A) It will increase property values on Dundas Street',
              'B) It will improve cyclist safety on a dangerous corridor',
              'C) It will eliminate all car traffic from the street',
              'D) It is required by federal law',
            ],
            answer: 1,
            explanation: 'Maria leads with the safety argument — 14 reported collisions, three serious — and states a protected lane would "dramatically reduce these incidents."',
          },
          {
            id: 'r4s1q2', difficulty: 'medium', questionType: 'inference',
            text: 'What is James Whitfield\'s main concern about the proposal?',
            options: [
              'A) Cyclists will damage storefronts along the route',
              'B) The lane will cause delivery and congestion problems on a major corridor',
              'C) The city cannot afford to build the lane',
              'D) Cycling is inherently dangerous and should be discouraged',
            ],
            answer: 1,
            explanation: 'Whitfield focuses on delivery trucks double-parking and a 15–22% increase in travel times — the practical congestion impact on a transit and delivery corridor.',
          },
          {
            id: 'r4s1q3', difficulty: 'hard', questionType: 'inference',
            text: 'On which point do BOTH writers implicitly agree?',
            options: [
              'A) Dundas Street is the best location for a bike lane',
              'B) The public consultation process was adequate',
              'C) Cycling infrastructure in the city should be expanded',
              'D) Parking should be completely eliminated on Dundas Street',
            ],
            answer: 2,
            explanation: 'Maria supports the Dundas lane; Whitfield opposes it but proposes expanding cycling on parallel streets instead. Both agree that cycling infrastructure should grow — they disagree on where.',
          },
          {
            id: 'r4s1q4', difficulty: 'hard', questionType: 'tone_purpose',
            text: 'How would you describe James Whitfield\'s overall tone?',
            options: [
              'A) Angry and hostile toward cyclists',
              'B) Measured and constructive, offering an alternative solution',
              'C) Indifferent and apathetic about the proposal',
              'D) Sarcastic and dismissive of city planning',
            ],
            answer: 1,
            explanation: 'Whitfield explicitly says he "supports cycling in principle" and offers a concrete alternative (Elm and Pine streets). His tone is critical of the plan but constructive, not hostile.',
          },
        ],
      },
    ],
  },

  // ═══════════════════════ SET 2 ═══════════════════════
  {
    setNumber: 2,
    title: 'Set 2',
    parts: [
      // ── R1 ──
      {
        partId: 'R1',
        partLabel: 'Correspondence',
        icon: '✉️',
        difficulty: 'intermediate',
        timeLimitMinutes: 11,
        passage: `From: Priya Sharma <priya.sharma@techcorp.ca>
To: Daniel Kim <daniel.kim@techcorp.ca>
Date: October 3, 2025
Subject: Shift coverage & Greenfield project handover

Hi Daniel,

I hope you had a good weekend. I am writing about two things — the shift swap and the Greenfield project handover.

First, I will not be able to cover your Friday evening shift on October 10th after all. My daughter has a school concert that evening and I only found out this morning. I am sorry about the short notice. I have already asked Tomas if he can take it instead, and he said he is available. You just need to confirm with him directly and let Anika (our supervisor) know so she can update the schedule.

Second, I am taking two weeks off starting October 14th for a family trip. Before I leave, I need to hand over the Greenfield client project to you. The status report is due on October 20th — I have drafted it up to last Friday's numbers, but you will need to add the week of October 14–18 data before sending it to the client. The draft is in our shared Google Drive folder under "Greenfield > Reports > October."

One more thing — the client contact, Mr. Pearson, prefers phone calls over email. His direct line is in the project contact sheet. He can be particular about response times, so try to reply within the same business day if he reaches out.

Thanks for taking this on. I owe you one!

Priya`,
        questions: [
          {
            id: 'r1s2q1', difficulty: 'easy', questionType: 'gist',
            text: 'What is the main purpose of Priya\'s email?',
            options: [
              'A) To apologize for missing a deadline',
              'B) To inform Daniel about a shift change and project handover',
              'C) To request time off from their supervisor',
              'D) To introduce a new client to Daniel',
            ],
            answer: 1,
            explanation: 'Priya covers two topics: she cannot cover the Friday shift (and has arranged a replacement), and she needs Daniel to take over the Greenfield project while she is away.',
          },
          {
            id: 'r1s2q2', difficulty: 'medium', questionType: 'detail',
            text: 'What does Daniel need to do with the Greenfield status report?',
            options: [
              'A) Rewrite the entire report from scratch',
              'B) Add data from October 14–18 and send it to the client',
              'C) Email the draft directly to Mr. Pearson without changes',
              'D) Submit it to Anika for approval before sending',
            ],
            answer: 1,
            explanation: 'Priya says she drafted the report up to last Friday but Daniel needs to "add the week of October 14–18 data before sending it to the client."',
          },
          {
            id: 'r1s2q3', difficulty: 'medium', questionType: 'inference',
            text: 'What does Priya mean when she says "He can be particular about response times"?',
            options: [
              'A) Mr. Pearson is usually slow to respond to messages',
              'B) Mr. Pearson expects prompt replies and may be frustrated by delays',
              'C) Mr. Pearson only checks his phone at specific times of day',
              'D) Mr. Pearson prefers to schedule all calls in advance',
            ],
            answer: 1,
            explanation: '"Particular about response times" is a polite way of saying the client expects fast replies. Priya reinforces this by advising "reply within the same business day."',
          },
        ],
      },
      // ── R2 ──
      {
        partId: 'R2',
        partLabel: 'Apply a Diagram',
        icon: '📊',
        difficulty: 'intermediate',
        timeLimitMinutes: 13,
        passage: `The Lakeside Bistro has updated its menu for the fall season. All dishes include a note about common allergens. Gluten-free (GF) and vegan (V) options are clearly marked. The restaurant asks guests with severe allergies to inform their server before ordering, as some items are prepared in shared kitchen spaces.

A customer, Rachel, has emailed the restaurant: "I am coming for dinner on Saturday with my family. My son is allergic to nuts and my mother is gluten-intolerant. Could you let me know which options are safe for them?"

FALL DINNER MENU
┌──────────────────────────────────┬────────────┬───────────────────────┐
│ Dish                             │ Price      │ Allergen Notes        │
├──────────────────────────────────┼────────────┼───────────────────────┤
│ Butternut Squash Soup (V, GF)    │ $12        │ No common allergens   │
│ Caesar Salad                     │ $14        │ Contains dairy, gluten│
│ Grilled Salmon (GF)              │ $26        │ Contains fish         │
│ Mushroom Risotto (V)             │ $22        │ Contains gluten       │
│ Chicken Pad Thai (GF)            │ $20        │ Contains peanuts      │
│ Beef Burger                      │ $18        │ Contains gluten, dairy│
│ Dark Chocolate Torte             │ $10        │ Contains tree nuts, dairy, gluten │
│ Seasonal Fruit Plate (V, GF)    │ $9         │ No common allergens   │
└──────────────────────────────────┴────────────┴───────────────────────┘`,
        questions: [
          {
            id: 'r2s2q1', difficulty: 'easy', questionType: 'detail',
            text: 'Which dish is safe for BOTH Rachel\'s son (nut allergy) and her mother (gluten-intolerant)?',
            options: [
              'A) Chicken Pad Thai',
              'B) Mushroom Risotto',
              'C) Butternut Squash Soup',
              'D) Dark Chocolate Torte',
            ],
            answer: 2,
            explanation: 'Butternut Squash Soup is both GF (safe for the mother) and has no common allergens including nuts (safe for the son). Pad Thai contains peanuts; Risotto contains gluten; Torte contains tree nuts and gluten.',
          },
          {
            id: 'r2s2q2', difficulty: 'medium', questionType: 'inference',
            text: 'Why does the restaurant ask guests with severe allergies to inform their server before ordering?',
            options: [
              'A) So the server can recommend the most expensive dishes',
              'B) Because some items are prepared in shared kitchen spaces where cross-contamination could occur',
              'C) Because the restaurant does not list allergens on the menu',
              'D) So the kitchen can prepare a custom dish not on the menu',
            ],
            answer: 1,
            explanation: 'The passage explicitly states "some items are prepared in shared kitchen spaces" — informing the server helps prevent cross-contamination for those with severe allergies.',
          },
          {
            id: 'r2s2q3', difficulty: 'medium', questionType: 'detail',
            text: 'Which dessert option can Rachel\'s mother safely eat?',
            options: [
              'A) Dark Chocolate Torte',
              'B) Caesar Salad',
              'C) Seasonal Fruit Plate',
              'D) Mushroom Risotto',
            ],
            answer: 2,
            explanation: 'The Seasonal Fruit Plate is GF with no common allergens. The Torte contains gluten, so it is not safe for someone who is gluten-intolerant.',
          },
        ],
      },
      // ── R3 ──
      {
        partId: 'R3',
        partLabel: 'Information',
        icon: '📄',
        difficulty: 'upper-intermediate',
        timeLimitMinutes: 14,
        passage: `[A] Choosing an internet plan in Canada can be overwhelming. The major providers — Bell, Rogers, Telus, and Shaw (now merged with Rogers) — each offer dozens of packages that vary by speed, data cap, and contract length. Smaller regional providers like TekSavvy and Oxio often resell the same infrastructure at lower prices but with less customer support.

[B] The first question to answer is how much speed you actually need. A household that streams video on one or two devices and browses the web can function well on a plan offering 50–75 Mbps. A family of four streaming on multiple screens simultaneously, gaming online, and making video calls will want at least 150 Mbps. Plans offering 500 Mbps or more are available but are overkill for most residential users.

[C] Data caps are another consideration. Many providers still impose monthly data limits of 200–500 GB on their lower-tier plans, with overage charges of $3–5 per additional gigabyte. Unlimited data plans typically cost $10–15 more per month but eliminate the risk of surprise charges — a worthwhile investment for heavy users.

[D] Contract terms matter as well. Two-year contracts often come with promotional pricing that jumps significantly after the promotional period ends. Month-to-month plans cost slightly more upfront but offer the flexibility to switch providers without penalty if a better deal appears.

[E] Finally, check whether fibre-optic service is available at your address. Fibre delivers faster and more reliable speeds than DSL or cable, particularly for upload-heavy tasks like video conferencing. Coverage is expanding but remains patchy outside major urban centres.`,
        questions: [
          {
            id: 'r3s2q1', difficulty: 'easy', questionType: 'detail',
            text: 'According to paragraph B, what internet speed is recommended for a family streaming on multiple devices?',
            options: [
              'A) 25 Mbps',
              'B) 50–75 Mbps',
              'C) At least 150 Mbps',
              'D) 500 Mbps or more',
            ],
            answer: 2,
            explanation: 'Paragraph B states a family of four streaming, gaming, and on video calls "will want at least 150 Mbps."',
          },
          {
            id: 'r3s2q2', difficulty: 'medium', questionType: 'inference',
            text: 'What does the author suggest about plans offering 500 Mbps or more?',
            options: [
              'A) They are the best value for most households',
              'B) They are necessary for video streaming',
              'C) They exceed what most residential users need',
              'D) They are only available from major providers',
            ],
            answer: 2,
            explanation: 'The passage calls 500+ Mbps plans "overkill for most residential users," suggesting they exceed typical household needs.',
          },
          {
            id: 'r3s2q3', difficulty: 'hard', questionType: 'vocab_context',
            text: 'In paragraph E, "patchy" most likely means:',
            options: [
              'A) Expensive and overpriced',
              'B) Inconsistent and unevenly distributed',
              'C) Completely unavailable',
              'D) Slow and unreliable',
            ],
            answer: 1,
            explanation: '"Patchy outside major urban centres" means fibre coverage is available in some areas but not others — inconsistent and uneven, not absent or slow.',
          },
        ],
      },
      // ── R4 ──
      {
        partId: 'R4',
        partLabel: 'Viewpoints',
        icon: '⚖️',
        difficulty: 'advanced',
        timeLimitMinutes: 17,
        passage: `VIEWPOINT A — Libraries must embrace digital transformation
By Councillor Andrea Marsh

Public libraries are at a crossroads. Foot traffic has declined by 30% over the past decade, while digital borrowing — e-books, audiobooks, and streaming — has increased by over 200%. The message is clear: patrons want digital access.

I propose that the city redirect 40% of the library's physical collection budget toward digital resources and convert underused floor space into collaborative workspaces, maker labs, and community meeting rooms. This is not about eliminating books — it is about making the library relevant to how people actually use information in 2026.

Some will argue that not everyone has internet access at home. That is precisely why libraries should invest in high-speed public Wi-Fi, lending tablets and laptops, and digital literacy workshops. A modern library bridges the digital divide; a building full of unread physical books does not.

VIEWPOINT B — Physical collections remain essential
By Dr. Helen Tremblay, Library Science Professor

Councillor Marsh's enthusiasm for digital transformation is understandable but misguided. Redirecting 40% of the physical collection budget would devastate reference sections, local history archives, and children's collections — areas where physical materials remain irreplaceable.

Digital platforms are controlled by private companies that can change licensing terms at any time. In 2024, a major e-book distributor raised its prices by 35% overnight, and several libraries were forced to reduce their digital catalogues. Physical books, once purchased, belong to the library permanently.

I agree that libraries must evolve, but the answer is not to defund physical collections. Instead, seek dedicated new funding for digital services so that both formats can coexist. A library that abandons its physical identity is no longer a library — it is a co-working space with a government subsidy.`,
        questions: [
          {
            id: 'r4s2q1', difficulty: 'easy', questionType: 'detail',
            text: 'What does Councillor Marsh propose doing with underused library floor space?',
            options: [
              'A) Closing it permanently to save costs',
              'B) Converting it into workspaces, maker labs, and meeting rooms',
              'C) Renting it to private businesses for revenue',
              'D) Expanding the physical book collection into those areas',
            ],
            answer: 1,
            explanation: 'Marsh proposes converting "underused floor space into collaborative workspaces, maker labs, and community meeting rooms."',
          },
          {
            id: 'r4s2q2', difficulty: 'medium', questionType: 'inference',
            text: 'Why does Dr. Tremblay mention the 2024 e-book price increase?',
            options: [
              'A) To show that digital resources are always cheaper than physical ones',
              'B) To illustrate that relying on digital platforms makes libraries vulnerable to corporate pricing decisions',
              'C) To argue that libraries should stop buying e-books entirely',
              'D) To praise the distributor for supporting library programs',
            ],
            answer: 1,
            explanation: 'The 2024 example demonstrates the risk of depending on private platforms — when prices rose 35%, libraries lost catalogue access. It supports her argument for maintaining physical collections.',
          },
          {
            id: 'r4s2q3', difficulty: 'hard', questionType: 'inference',
            text: 'On which point do BOTH writers agree?',
            options: [
              'A) 40% of the physical budget should move to digital',
              'B) Libraries need to evolve and adapt to changing needs',
              'C) Physical books are no longer relevant to modern patrons',
              'D) Digital literacy workshops are a waste of resources',
            ],
            answer: 1,
            explanation: 'Marsh says libraries must become "relevant to how people actually use information." Tremblay says "libraries must evolve." Both acknowledge change is needed — they disagree on how.',
          },
        ],
      },
    ],
  },

  // ═══════════════════════ SET 3 ═══════════════════════
  {
    setNumber: 3,
    title: 'Set 3',
    parts: [
      // ── R1 ──
      {
        partId: 'R1',
        partLabel: 'Correspondence',
        icon: '✉️',
        difficulty: 'intermediate',
        timeLimitMinutes: 11,
        passage: `From: Westfield Elementary — Principal Margaret O'Brien <mobrien@westfieldschool.ca>
To: All Parents and Guardians
Date: November 4, 2025
Subject: New pickup procedure & volunteer opportunity

Dear Families,

I am writing to inform you of two important updates.

Effective Monday, November 10th, we are introducing a new pickup procedure for students in Grades 1 through 3. Parents will now pick up children from the rear parking lot rather than the front entrance. The change is being made because the front entrance has become severely congested during dismissal, creating safety concerns for students crossing the parking lot. Signs and staff will be in place during the first week to guide families through the new process.

Students in Grades 4 through 6 who walk home independently will continue to be dismissed from the front entrance.

Separately, our annual Winter Fair is scheduled for Saturday, December 6th, and we are looking for parent volunteers. We need help with setup (8:00 AM), food stations, game booths, and cleanup (4:00 PM). If you can contribute even two hours of your time, please fill out the volunteer form linked below by November 21st. Last year the fair raised over $3,200 for our arts and music programs, and we hope to exceed that this year.

Thank you for your continued support of our school community.

Warm regards,
Margaret O'Brien
Principal, Westfield Elementary`,
        questions: [
          {
            id: 'r1s3q1', difficulty: 'easy', questionType: 'detail',
            text: 'Why is the school changing the pickup location for younger students?',
            options: [
              'A) The rear parking lot is being renovated',
              'B) The front entrance has become congested and unsafe during dismissal',
              'C) Parents requested the change through a survey',
              'D) The school board mandated a new province-wide policy',
            ],
            answer: 1,
            explanation: 'The principal states the front entrance "has become severely congested during dismissal, creating safety concerns for students crossing the parking lot."',
          },
          {
            id: 'r1s3q2', difficulty: 'medium', questionType: 'detail',
            text: 'Which students will still be dismissed from the front entrance?',
            options: [
              'A) All students regardless of grade',
              'B) Only students who take the school bus',
              'C) Students in Grades 4 through 6 who walk home independently',
              'D) Students whose parents volunteer at the school',
            ],
            answer: 2,
            explanation: 'The email specifies: "Students in Grades 4 through 6 who walk home independently will continue to be dismissed from the front entrance."',
          },
          {
            id: 'r1s3q3', difficulty: 'medium', questionType: 'inference',
            text: 'Why does the principal mention that last year\'s fair raised $3,200?',
            options: [
              'A) To show that the school wastes money on events',
              'B) To motivate parents to volunteer by demonstrating the impact of the fair',
              'C) To justify raising ticket prices this year',
              'D) To compare the school with other schools in the district',
            ],
            answer: 1,
            explanation: 'Mentioning the $3,200 and hoping to "exceed that this year" encourages parents to contribute by showing their effort makes a tangible difference.',
          },
        ],
      },
      // ── R2 ──
      {
        partId: 'R2',
        partLabel: 'Apply a Diagram',
        icon: '📊',
        difficulty: 'intermediate',
        timeLimitMinutes: 13,
        passage: `Pearson International Airport — Terminal 1 has announced gate changes for several domestic flights on December 15, 2025 due to construction in Concourse B. Passengers are advised to check departure screens upon arrival. All gates in Concourse C remain unchanged.

DEPARTURE SCHEDULE — December 15, 2025 (selected flights)
┌────────┬──────────────────────────┬──────────┬────────────────────────┐
│ Flight │ Destination              │ Time     │ Gate                   │
├────────┼──────────────────────────┼──────────┼────────────────────────┤
│ AC 201 │ Vancouver                │ 7:15 AM  │ C-22 (unchanged)       │
│ WJ 412 │ Calgary                  │ 8:30 AM  │ B-14 → moved to C-31  │
│ AC 330 │ Montreal                 │ 9:00 AM  │ C-18 (unchanged)       │
│ WJ 550 │ Halifax                  │ 10:45 AM │ B-09 → moved to C-27  │
│ AC 118 │ Edmonton                 │ 12:00 PM │ B-06 → moved to C-33  │
│ WJ 780 │ Winnipeg                 │ 1:30 PM  │ C-20 (unchanged)       │
└────────┴──────────────────────────┴──────────┴────────────────────────┘`,
        questions: [
          {
            id: 'r2s3q1', difficulty: 'easy', questionType: 'detail',
            text: 'A passenger is flying WJ 412 to Calgary. Which gate should they go to?',
            options: [
              'A) B-14',
              'B) C-22',
              'C) C-31',
              'D) C-27',
            ],
            answer: 2,
            explanation: 'WJ 412 has been moved from B-14 to C-31 due to construction.',
          },
          {
            id: 'r2s3q2', difficulty: 'medium', questionType: 'inference',
            text: 'Why are some flights being moved from Concourse B to Concourse C?',
            options: [
              'A) Concourse C has larger gates',
              'B) Construction in Concourse B requires gate reassignments',
              'C) The airline changed its terminal agreement',
              'D) Security screening in Concourse B is closed',
            ],
            answer: 1,
            explanation: 'The passage explicitly states gate changes are "due to construction in Concourse B."',
          },
          {
            id: 'r2s3q3', difficulty: 'medium', questionType: 'detail',
            text: 'Which of the following flights has NOT been moved to a different gate?',
            options: [
              'A) WJ 412 to Calgary',
              'B) AC 118 to Edmonton',
              'C) WJ 780 to Winnipeg',
              'D) WJ 550 to Halifax',
            ],
            answer: 2,
            explanation: 'WJ 780 to Winnipeg departs from C-20 (unchanged). All other listed options were moved from Concourse B.',
          },
        ],
      },
      // ── R3 ──
      {
        partId: 'R3',
        partLabel: 'Information',
        icon: '📄',
        difficulty: 'upper-intermediate',
        timeLimitMinutes: 14,
        passage: `[A] The shift to remote work, accelerated by the pandemic, has brought both health benefits and health risks that researchers are only now beginning to quantify. A 2025 study by the Canadian Institute for Health Information found that remote workers reported 22% lower levels of daily stress compared to their in-office counterparts, citing the elimination of commuting and greater control over their work environment as primary factors.

[B] However, the same study revealed a troubling countertrend: remote workers were 35% more likely to report chronic back pain and 28% more likely to describe their daily physical activity as "insufficient." Many home workstations lack ergonomic furniture, and the absence of a commute eliminates what was, for many workers, their only daily walking.

[C] Mental health effects are more complex. While stress levels are lower, remote workers reported higher rates of loneliness and professional isolation. Workers under 30 were particularly affected, with 41% saying they felt "disconnected from their team" — a figure that dropped to just 18% among workers over 45, who tended to have more established professional relationships before going remote.

[D] Employers have responded with a range of interventions: stipends for home office equipment, mandatory "no-meeting" afternoons, and subsidized gym memberships. Whether these measures are sufficient remains unclear. Some researchers argue that hybrid models — two to three days in the office per week — offer the best balance, combining the stress reduction of remote work with the social connection of in-person collaboration.

[E] What is clear is that the health impacts of remote work are not uniform. They vary by age, living situation, job type, and the quality of the home work environment. A one-size-fits-all policy is unlikely to serve all employees well.`,
        questions: [
          {
            id: 'r3s3q1', difficulty: 'easy', questionType: 'detail',
            text: 'According to the study, how much lower were stress levels for remote workers?',
            options: [
              'A) 12% lower',
              'B) 22% lower',
              'C) 35% lower',
              'D) 41% lower',
            ],
            answer: 1,
            explanation: 'Paragraph A states "remote workers reported 22% lower levels of daily stress."',
          },
          {
            id: 'r3s3q2', difficulty: 'medium', questionType: 'inference',
            text: 'Why were workers under 30 more affected by professional isolation?',
            options: [
              'A) They have slower internet connections at home',
              'B) They had fewer established professional relationships before going remote',
              'C) They prefer working in offices over working from home',
              'D) They were given fewer remote work tools by their employers',
            ],
            answer: 1,
            explanation: 'Paragraph C explains the age gap: workers over 45 had "more established professional relationships before going remote," implying younger workers lacked those pre-existing connections.',
          },
          {
            id: 'r3s3q3', difficulty: 'hard', questionType: 'inference',
            text: 'What does the author mean by "a one-size-fits-all policy is unlikely to serve all employees well"?',
            options: [
              'A) All employees should work from home permanently',
              'B) Companies should force all employees back to the office',
              'C) Remote work policies need to be flexible and account for individual differences',
              'D) The government should set a national remote work standard',
            ],
            answer: 2,
            explanation: 'The conclusion emphasizes that impacts "vary by age, living situation, job type" — meaning policies must be flexible and personalized rather than uniform.',
          },
        ],
      },
      // ── R4 ──
      {
        partId: 'R4',
        partLabel: 'Viewpoints',
        icon: '⚖️',
        difficulty: 'advanced',
        timeLimitMinutes: 17,
        passage: `VIEWPOINT A — Ban single-use plastics now
By Dr. Sarah Okonkwo, Environmental Policy Analyst

The evidence is overwhelming. Over 3 million tonnes of plastic waste are generated in Canada every year, and less than 9% is recycled. The rest ends up in landfills, oceans, and ecosystems where it persists for centuries. Single-use items — bags, straws, cutlery, food containers — make up the largest share of this waste.

Canada's 2023 ban on six categories of single-use plastics was a good start, but it does not go far enough. We need to expand the ban to include coffee cups, plastic-lined takeout containers, and single-use condiment packets. We also need mandatory Extended Producer Responsibility (EPR) programs that force manufacturers — not taxpayers — to pay for collecting and recycling their packaging.

Some argue that bans hurt low-income consumers. But reusable alternatives are already affordable and widely available. And the health costs of plastic pollution — contaminated water, microplastics in food — fall disproportionately on the same low-income communities that critics claim to protect.

VIEWPOINT B — Bans alone are not the answer
By Michael Torres, Small Business Federation

Dr. Okonkwo is right that plastic waste is a serious problem. But expanding bans is a blunt instrument that imposes costs on small businesses and consumers while doing little to address the root cause: a broken recycling system.

My members — restaurant owners, coffee shops, caterers — have already absorbed significant costs complying with the 2023 ban. Switching from plastic to compostable containers increased our packaging costs by 40–60%. For a small café operating on thin margins, that is the difference between profit and loss.

Instead of more bans, I advocate for investment in recycling infrastructure, standardized labelling so consumers know what goes where, and incentive programs that reward businesses for reducing packaging voluntarily. Germany's deposit-return system recovers over 98% of beverage containers — without banning them.

The goal should be a circular economy, not a prohibition economy. Give businesses the tools and infrastructure to do the right thing, and most will.`,
        questions: [
          {
            id: 'r4s3q1', difficulty: 'easy', questionType: 'detail',
            text: 'What percentage of Canadian plastic waste is recycled, according to Dr. Okonkwo?',
            options: [
              'A) Less than 5%',
              'B) Less than 9%',
              'C) About 15%',
              'D) Over 20%',
            ],
            answer: 1,
            explanation: 'Dr. Okonkwo states "less than 9% is recycled."',
          },
          {
            id: 'r4s3q2', difficulty: 'medium', questionType: 'inference',
            text: 'Why does Michael Torres mention Germany\'s deposit-return system?',
            options: [
              'A) To argue that Germany has more plastic pollution than Canada',
              'B) To show that high recovery rates are possible without banning products',
              'C) To suggest that Canada should import German containers',
              'D) To prove that all bans are ineffective everywhere',
            ],
            answer: 1,
            explanation: `Torres uses Germany's 98% recovery rate as evidence that effective recycling infrastructure can work without bans — supporting his argument for alternatives.`,
          },
          {
            id: 'r4s3q3', difficulty: 'hard', questionType: 'inference',
            text: 'On which point do BOTH writers agree?',
            options: [
              'A) More plastic bans should be implemented immediately',
              'B) Plastic waste is a serious environmental problem in Canada',
              'C) Small businesses should not bear the cost of environmental policy',
              'D) Recycling infrastructure is working well in Canada',
            ],
            answer: 1,
            explanation: 'Okonkwo calls the evidence "overwhelming" and Torres says "plastic waste is a serious problem." Both acknowledge the problem — they differ on solutions.',
          },
        ],
      },
    ],
  },

  // ═══════════════════════ SET 4 ═══════════════════════
  {
    setNumber: 4,
    title: 'Set 4',
    parts: [
      // ── R1 ──
      {
        partId: 'R1',
        partLabel: 'Correspondence',
        icon: '✉️',
        difficulty: 'intermediate',
        timeLimitMinutes: 11,
        passage: `From: Greenleaf Properties — Management Office
To: All Tenants — 45 Riverside Drive
Date: January 8, 2026
Subject: Upcoming renovations — January 20 to February 28

Dear Tenants,

We are writing to inform you that building-wide renovations will begin on Monday, January 20th and are expected to continue through the end of February.

The work includes replacement of the lobby flooring, repainting of all common-area hallways (floors 1–12), and an upgrade to the building's hot water system. While we have scheduled most work during business hours (8:00 AM – 5:00 PM, Monday to Friday), some plumbing work may require temporary water shutoffs lasting 2–4 hours. You will receive at least 48 hours' notice before any water shutoff affecting your unit.

During the hallway painting phase, we ask that residents avoid leaving personal items (shoes, strollers, doormats) in the hallway, as painters need clear access to all walls. Items left in the hallway after January 18th will be moved to storage on the ground floor.

We understand that renovations can be inconvenient, and we appreciate your patience. The completed upgrades will improve both the appearance and functionality of the building for all residents.

If you have questions or concerns, please contact the management office at 416-555-0200 or email manager@greenleafproperties.ca.

Sincerely,
Greenleaf Properties Management`,
        questions: [
          {
            id: 'r1s4q1', difficulty: 'easy', questionType: 'gist',
            text: 'What is the main purpose of this letter?',
            options: [
              'A) To announce a rent increase for all tenants',
              'B) To inform tenants about upcoming building renovations and what to expect',
              'C) To apologize for a recent plumbing emergency',
              'D) To introduce a new building manager',
            ],
            answer: 1,
            explanation: 'The letter describes the scope, timeline, and impact of upcoming renovations and tells tenants what to expect.',
          },
          {
            id: 'r1s4q2', difficulty: 'medium', questionType: 'detail',
            text: 'How much notice will tenants receive before a water shutoff?',
            options: [
              'A) 12 hours',
              'B) 24 hours',
              'C) At least 48 hours',
              'D) One week',
            ],
            answer: 2,
            explanation: 'The letter states "You will receive at least 48 hours\' notice before any water shutoff affecting your unit."',
          },
          {
            id: 'r1s4q3', difficulty: 'medium', questionType: 'inference',
            text: 'What will happen to personal items left in the hallway after January 18th?',
            options: [
              'A) They will be discarded permanently',
              'B) They will be moved to ground-floor storage',
              'C) Tenants will receive a fine',
              'D) The items will be left in place and painted around',
            ],
            answer: 1,
            explanation: 'The letter says "Items left in the hallway after January 18th will be moved to storage on the ground floor."',
          },
        ],
      },
      // ── R2 ──
      {
        partId: 'R2',
        partLabel: 'Apply a Diagram',
        icon: '📊',
        difficulty: 'intermediate',
        timeLimitMinutes: 13,
        passage: `Maplewood Technologies is hiring a Customer Support Specialist. The position is full-time, permanent, and based in the company's downtown Toronto office with the option to work remotely two days per week.

Applicants must have at least two years of customer service experience and strong written communication skills. Bilingual candidates (English/French) are preferred but not required.

EMPLOYEE BENEFITS SUMMARY
┌────────────────────────┬──────────────────────────────────────────────┐
│ Benefit                │ Details                                      │
├────────────────────────┼──────────────────────────────────────────────┤
│ Base Salary            │ $52,000 – $58,000 depending on experience   │
│ Health & Dental        │ Full coverage after 3-month probation period │
│ Vacation               │ 15 days per year (increases to 20 after 3 years) │
│ Remote Work            │ Up to 2 days/week after probation            │
│ Professional Dev.      │ $1,500 annual learning budget                │
│ RRSP Matching          │ Company matches up to 4% of salary          │
│ Wellness Benefit       │ $500/year for gym, therapy, or wellness apps │
└────────────────────────┴──────────────────────────────────────────────┘`,
        questions: [
          {
            id: 'r2s4q1', difficulty: 'easy', questionType: 'detail',
            text: 'When does health and dental coverage begin for new employees?',
            options: [
              'A) Immediately on the first day of work',
              'B) After a 3-month probation period',
              'C) After 6 months of employment',
              'D) After 1 year of employment',
            ],
            answer: 1,
            explanation: 'The benefits table states "Full coverage after 3-month probation period."',
          },
          {
            id: 'r2s4q2', difficulty: 'medium', questionType: 'detail',
            text: 'How many vacation days would an employee receive after 4 years at the company?',
            options: [
              'A) 10 days',
              'B) 15 days',
              'C) 20 days',
              'D) 25 days',
            ],
            answer: 2,
            explanation: 'Vacation starts at 15 days and "increases to 20 after 3 years." After 4 years, the employee would have 20 days.',
          },
          {
            id: 'r2s4q3', difficulty: 'medium', questionType: 'inference',
            text: 'Why might bilingual candidates have an advantage for this role?',
            options: [
              'A) The company only operates in Quebec',
              'B) Customer support may involve serving French-speaking clients across Canada',
              'C) Bilingual employees receive higher salaries automatically',
              'D) The job posting requires French certification',
            ],
            answer: 1,
            explanation: 'Bilingual (English/French) is "preferred but not required" — suggesting the company serves French-speaking customers but does not mandate bilingualism.',
          },
        ],
      },
      // ── R3 ──
      {
        partId: 'R3',
        partLabel: 'Information',
        icon: '📄',
        difficulty: 'upper-intermediate',
        timeLimitMinutes: 14,
        passage: `[A] Canada's immigration system has long been a lifeline for small towns. While major cities like Toronto, Vancouver, and Montreal attract the majority of newcomers, a growing number of immigrants are settling in smaller communities — drawn by affordable housing, lower competition for jobs, and provincial nominee programs designed to channel newcomers away from urban centres.

[B] The economic impact in these communities has been significant. In towns across Atlantic Canada, immigration has reversed population decline, filled vacancies in healthcare, agriculture, and food processing, and injected new consumer spending into local economies. The town of Florenceville-Bristol, New Brunswick — home to the McCain Foods headquarters — saw its population stabilize after years of decline thanks largely to an influx of immigrants from the Philippines and India.

[C] Integration, however, remains a challenge. Small towns often lack the settlement services available in cities — language classes, cultural centres, and employment counselling. Newcomers may feel isolated, particularly in communities where they are among very few visible minorities. Schools may not have ESL resources for children who arrive without English proficiency.

[D] Some communities have responded creatively. Morden, Manitoba, established a community-led settlement program that pairs each newcomer family with a local volunteer mentor. The program covers everything from navigating healthcare to finding winter clothing. It has been credited with a retention rate above 85% — meaning most immigrants who arrive in Morden choose to stay.

[E] The federal government has recognized the potential of regional immigration and has increased the allocation of Provincial Nominee Program spots. Whether small towns can scale their integration services to match the growing numbers remains the central question.`,
        questions: [
          {
            id: 'r3s4q1', difficulty: 'easy', questionType: 'detail',
            text: 'According to the passage, what draws immigrants to smaller Canadian communities?',
            options: [
              'A) Higher salaries than in major cities',
              'B) Affordable housing, lower job competition, and provincial nominee programs',
              'C) Better public transit systems',
              'D) Proximity to international airports',
            ],
            answer: 1,
            explanation: 'Paragraph A lists "affordable housing, lower competition for jobs, and provincial nominee programs" as factors.',
          },
          {
            id: 'r3s4q2', difficulty: 'medium', questionType: 'inference',
            text: `What is the significance of Morden, Manitoba's 85% retention rate?`,
            options: [
              'A) It shows that most immigrants eventually leave small towns',
              'B) It demonstrates that community-led support programs help newcomers choose to stay',
              'C) It proves that government programs are unnecessary',
              'D) It means 85% of residents in Morden are immigrants',
            ],
            answer: 1,
            explanation: 'The 85% retention rate is cited as evidence that the volunteer mentor program works — it keeps newcomers in the community rather than losing them to larger cities.',
          },
          {
            id: 'r3s4q3', difficulty: 'hard', questionType: 'vocab_context',
            text: 'In paragraph C, "settlement services" most likely refers to:',
            options: [
              'A) Real estate agencies that help newcomers buy property',
              'B) Programs that help immigrants adjust to life in a new community',
              'C) Government offices that process immigration applications',
              'D) Financial services that help immigrants send money home',
            ],
            answer: 1,
            explanation: 'The passage lists "language classes, cultural centres, and employment counselling" as examples of settlement services — programs designed to help newcomers integrate.',
          },
        ],
      },
      // ── R4 ──
      {
        partId: 'R4',
        partLabel: 'Viewpoints',
        icon: '⚖️',
        difficulty: 'advanced',
        timeLimitMinutes: 17,
        passage: `VIEWPOINT A — Attendance should be mandatory
By Professor Alan Crawford, University of Western Ontario

University attendance policies exist because learning is not just about content — it is about process. Students who attend lectures regularly perform better on exams, engage more deeply with material, and develop the professional habits that employers value.

My department's data shows that students who attend fewer than 60% of lectures are three times more likely to fail the course. This is not correlation — it is a direct consequence of missing the discussions, demonstrations, and peer interactions that lectures provide. Recorded lectures, while useful as supplements, do not replicate the experience of being present.

Mandatory attendance also teaches accountability. In the working world, showing up is not optional. Universities that allow unlimited absences are setting students up for a rude awakening when they enter careers that demand reliability.

VIEWPOINT B — Attendance should be optional
By Maya Singh, Student Union President

Professor Crawford assumes that lecture attendance equals learning. For many students, it does not. I have sat through three-hour lectures where the professor reads directly from slides that are already posted online. In those cases, I learn more efficiently by studying independently.

Mandatory attendance policies also ignore the reality of modern students' lives. Many of us work part-time jobs to pay tuition, care for family members, or manage health conditions that make attending every class impossible. Penalizing us for absences — when we are still completing all assignments and passing exams — is punitive, not educational.

I agree that engagement matters, but attendance is not the only measure of engagement. A student who misses lectures but reads every assigned text, participates in online forums, and scores well on assessments is clearly engaged. Universities should measure outcomes, not seat time.`,
        questions: [
          {
            id: 'r4s4q1', difficulty: 'easy', questionType: 'detail',
            text: 'What evidence does Professor Crawford cite to support mandatory attendance?',
            options: [
              'A) A national survey of university students',
              `B) His department's data showing low-attendance students are more likely to fail`,
              'C) Research from universities in Europe',
              'D) Feedback from employers in the technology sector',
            ],
            answer: 1,
            explanation: `Crawford cites "my department's data" showing students attending fewer than 60% of lectures are "three times more likely to fail."`,
          },
          {
            id: 'r4s4q2', difficulty: 'medium', questionType: 'inference',
            text: `What is Maya Singh's main argument about measuring student engagement?`,
            options: [
              'A) Students should be graded only on attendance',
              'B) Universities should measure learning outcomes rather than physical presence',
              'C) Online forums should replace all lectures',
              'D) Students who miss lectures should not be allowed to submit assignments',
            ],
            answer: 1,
            explanation: 'Singh argues "Universities should measure outcomes, not seat time" — a student who reads, participates online, and scores well is engaged regardless of physical attendance.',
          },
          {
            id: 'r4s4q3', difficulty: 'hard', questionType: 'inference',
            text: 'On which point do BOTH writers implicitly agree?',
            options: [
              'A) Lectures are always the most effective way to learn',
              'B) Student engagement with course material is important for success',
              'C) Recorded lectures are an adequate replacement for in-person attendance',
              'D) Working students should be exempt from attendance policies',
            ],
            answer: 1,
            explanation: 'Crawford values engagement through attendance; Singh values engagement through outcomes. Both agree engagement matters — they disagree on how to measure it.',
          },
        ],
      },
    ],
  },

  // ═══════════════════════ SET 5 ═══════════════════════
  {
    setNumber: 5,
    title: 'Set 5',
    parts: [
      // ── R1 ──
      {
        partId: 'R1',
        partLabel: 'Correspondence',
        icon: '✉️',
        difficulty: 'intermediate',
        timeLimitMinutes: 11,
        passage: `From: Karen Liu <karen.liu@email.com>
To: David Okafor <david.okafor@email.com>
Date: February 10, 2026
Subject: Shared fence repair — cost and timeline

Hi David,

I hope you and your family are doing well. I wanted to reach out about the fence between our backyards.

As you may have noticed, the section near the back corner has been leaning significantly since the windstorm last month. I had a contractor come by yesterday to take a look. He said the two posts on that end are rotted through and the entire 12-foot section needs to be replaced. He quoted $1,400 for materials and labour, which he said is standard for cedar panels.

Since it is a shared boundary fence, I believe we would typically split the cost equally — $700 each. I am happy to arrange the work and coordinate with the contractor if you agree.

He is available the week of February 24th. He estimated the job would take one full day. I would just need to confirm with him by February 17th.

If you have a different contractor in mind or want to get a second quote, I am completely open to that too. Just let me know your thoughts when you get a chance.

Thanks, David!

Karen`,
        questions: [
          {
            id: 'r1s5q1', difficulty: 'easy', questionType: 'gist',
            text: `What is the main purpose of Karen's email?`,
            options: [
              `A) To complain about David's property maintenance`,
              'B) To propose splitting the cost of a shared fence repair',
              'C) To ask David to pay for the entire fence replacement',
              'D) To inform David that she is selling her house',
            ],
            answer: 1,
            explanation: 'Karen explains the fence damage, shares the contractor quote, and proposes splitting the $1,400 cost equally.',
          },
          {
            id: 'r1s5q2', difficulty: 'medium', questionType: 'detail',
            text: `How much would each neighbour pay under Karen's proposal?`,
            options: [
              'A) $400',
              'B) $700',
              'C) $1,000',
              'D) $1,400',
            ],
            answer: 1,
            explanation: 'Karen states the total is $1,400 and proposes splitting it equally — "$700 each."',
          },
          {
            id: 'r1s5q3', difficulty: 'medium', questionType: 'tone_purpose',
            text: `How would you describe Karen's tone in this email?`,
            options: [
              'A) Demanding and inflexible',
              'B) Friendly, reasonable, and open to alternatives',
              'C) Formal and impersonal',
              'D) Apologetic and anxious',
            ],
            answer: 1,
            explanation: 'Karen uses warm language ("I hope you and your family are doing well"), offers to coordinate, and says she is "completely open" to a second quote — friendly and flexible.',
          },
        ],
      },
      // ── R2 ──
      {
        partId: 'R2',
        partLabel: 'Apply a Diagram',
        icon: '📊',
        difficulty: 'intermediate',
        timeLimitMinutes: 13,
        passage: `Metro Transit has introduced a new zone-based fare structure effective March 1, 2026. All bus and subway rides within the city are now priced according to the number of zones crossed. Passengers must tap their fare card at both entry and exit to ensure correct fare calculation. Children under 5 ride free. Seniors (65+) and students with valid ID receive a 30% discount on all fares.

FARE TABLE — Single Trip (effective March 1, 2026)
┌──────────────────────┬─────────────────┬─────────────────────────┐
│ Zones Crossed        │ Adult Fare      │ Senior / Student Fare   │
├──────────────────────┼─────────────────┼─────────────────────────┤
│ Zone 1 only          │ $3.25           │ $2.30                   │
│ Zone 1 + Zone 2      │ $4.50           │ $3.15                   │
│ Zone 1 + Zone 2 + 3  │ $5.75           │ $4.05                   │
│ Monthly Pass (all)   │ $120.00         │ $84.00                  │
└──────────────────────┴─────────────────┴─────────────────────────┘`,
        questions: [
          {
            id: 'r2s5q1', difficulty: 'easy', questionType: 'detail',
            text: 'How much does a single adult trip across two zones cost?',
            options: [
              'A) $3.25',
              'B) $4.50',
              'C) $5.75',
              'D) $120.00',
            ],
            answer: 1,
            explanation: 'The fare table shows Zone 1 + Zone 2 costs $4.50 for an adult single trip.',
          },
          {
            id: 'r2s5q2', difficulty: 'medium', questionType: 'inference',
            text: 'A 67-year-old resident takes 30 single trips per month, all within Zone 1. Would a monthly pass save them money?',
            options: [
              'A) Yes — the pass costs less than 30 trips at the senior rate',
              'B) No — 30 trips at the senior rate is cheaper than the monthly pass',
              'C) They pay the same amount either way',
              'D) Seniors are not eligible for the monthly pass',
            ],
            answer: 1,
            explanation: '30 trips × $2.30 (senior Zone 1 fare) = $69. The senior monthly pass costs $84. Individual trips ($69) are cheaper than the pass ($84), so no — the pass would not save money.',
          },
          {
            id: 'r2s5q3', difficulty: 'medium', questionType: 'detail',
            text: 'What must passengers do to ensure correct fare calculation?',
            options: [
              'A) Show their ticket to the bus driver',
              'B) Tap their fare card at both entry and exit',
              'C) Purchase a paper ticket at each station',
              'D) Download the transit app and check in digitally',
            ],
            answer: 1,
            explanation: 'The passage states "Passengers must tap their fare card at both entry and exit to ensure correct fare calculation."',
          },
        ],
      },
      // ── R3 ──
      {
        partId: 'R3',
        partLabel: 'Information',
        icon: '📄',
        difficulty: 'upper-intermediate',
        timeLimitMinutes: 14,
        passage: `[A] Artificial intelligence is transforming customer service faster than most consumers realize. Chatbots now handle an estimated 65% of initial customer inquiries at major Canadian banks, telecom providers, and online retailers. These systems can answer common questions — account balances, order status, return policies — in seconds, without a human agent ever being involved.

[B] The efficiency gains are substantial. A 2025 report by McKinsey estimated that AI-powered customer service reduces average handling time by 40% and operating costs by up to 30%. For companies processing millions of inquiries per year, the savings are enormous.

[C] But efficiency comes at a cost. Customer satisfaction surveys consistently show that people become frustrated when AI systems cannot understand nuanced or emotionally charged issues. A customer calling to dispute a billing error or report a service failure wants empathy and problem-solving, not a script. When the chatbot loops through the same options without resolving the issue, frustration compounds.

[D] The impact on employment is also significant. The same McKinsey report projected that AI could displace 25–30% of entry-level customer service positions in Canada by 2028. Workers in call centres — often young, racialized, and without post-secondary credentials — are disproportionately affected. Retraining programs exist but reach only a fraction of displaced workers.

[E] The most effective companies are finding a middle ground: using AI for routine inquiries while routing complex or sensitive issues to human agents. This hybrid model preserves efficiency while maintaining the human connection that customers need when something goes wrong. The challenge is knowing where to draw the line — and that line is constantly moving as AI capabilities improve.`,
        questions: [
          {
            id: 'r3s5q1', difficulty: 'easy', questionType: 'detail',
            text: 'What percentage of initial customer inquiries do chatbots now handle at major Canadian companies?',
            options: [
              'A) 25%',
              'B) 40%',
              'C) 65%',
              'D) 85%',
            ],
            answer: 2,
            explanation: 'Paragraph A states "Chatbots now handle an estimated 65% of initial customer inquiries."',
          },
          {
            id: 'r3s5q2', difficulty: 'medium', questionType: 'inference',
            text: 'Why does the author mention "young, racialized, and without post-secondary credentials" in paragraph D?',
            options: [
              'A) To suggest these workers are less competent than others',
              'B) To highlight that AI displacement disproportionately affects vulnerable populations',
              'C) To argue that call centres should only hire university graduates',
              'D) To show that AI creates more jobs than it eliminates',
            ],
            answer: 1,
            explanation: 'The author is pointing out that the workers most affected by AI displacement are from already marginalized groups — it highlights an equity concern.',
          },
          {
            id: 'r3s5q3', difficulty: 'hard', questionType: 'vocab_context',
            text: 'In paragraph E, the phrase "that line is constantly moving" refers to:',
            options: [
              'A) The physical queue of customers waiting for service',
              'B) The boundary between tasks AI can handle and those requiring humans keeps shifting',
              `C) The company's financial bottom line is changing every quarter`,
              'D) Customer expectations are unpredictable from day to day',
            ],
            answer: 1,
            explanation: '"The line" refers to the division between AI-handled and human-handled tasks. As AI improves, it can handle more — so the boundary between the two is always changing.',
          },
        ],
      },
      // ── R4 ──
      {
        partId: 'R4',
        partLabel: 'Viewpoints',
        icon: '⚖️',
        difficulty: 'advanced',
        timeLimitMinutes: 17,
        passage: `VIEWPOINT A — Age verification protects young users
By Carmen Alvarez, Children's Digital Safety Advocate

Social media platforms are designed to be addictive. Infinite scrolling, push notifications, and algorithmic content feeds exploit psychological vulnerabilities that young people are especially susceptible to. Research from the Centre for Addiction and Mental Health found that Canadian teens who spend more than three hours per day on social media are twice as likely to report symptoms of anxiety and depression.

Requiring platforms to verify the age of every user is a necessary first step. If we can prevent minors from buying alcohol and tobacco, we can prevent them from accessing platforms that measurably harm their mental health. Australia's 2025 social media age verification law provides a model: platforms must use privacy-preserving identity checks to confirm users are at least 16 years old.

Critics say this violates privacy. But age verification does not require collecting personal data permanently — it requires a one-time check, much like presenting ID at a door. The privacy cost is minimal; the protection for children is significant.

VIEWPOINT B — Age verification is surveillance disguised as protection
By Kwame Asante, Digital Rights Researcher

I share Carmen Alvarez's concern about youth mental health. But mandatory age verification is the wrong solution — it trades one harm for another.

First, any age verification system that actually works requires linking a real-world identity to an online account. That creates a database of verified identities that is a gift to hackers, authoritarian governments, and data brokers. We have seen repeatedly — Equifax, Optus, 23andMe — that centralized identity databases get breached. Adding social media to that list would be reckless.

Second, age verification does not make platforms less addictive. A verified 16-year-old will still see the same algorithmic feeds, the same infinite scroll, the same notification tactics. If the goal is to protect young people, we should regulate the design of platforms — ban addictive features for users under 18, require chronological feeds by default, and limit notification frequency. These interventions address the actual harm without building a surveillance infrastructure.

Finally, age gates are trivially bypassed. VPNs, borrowed IDs, and fake credentials will allow determined teens to access restricted platforms regardless. We would build an expensive, privacy-invasive system that locks out compliant families while doing nothing about the teens most at risk.`,
        questions: [
          {
            id: 'r4s5q1', difficulty: 'easy', questionType: 'detail',
            text: 'What does Carmen Alvarez propose as a solution to protect young social media users?',
            options: [
              'A) Banning all social media platforms entirely',
              `B) Requiring platforms to verify users' ages before granting access`,
              'C) Teaching digital literacy in schools instead of regulation',
              `D) Allowing parents to monitor their children's accounts`,
            ],
            answer: 1,
            explanation: 'Alvarez explicitly states: "Requiring platforms to verify the age of every user is a necessary first step."',
          },
          {
            id: 'r4s5q2', difficulty: 'medium', questionType: 'inference',
            text: 'Why does Kwame Asante mention the Equifax and Optus data breaches?',
            options: [
              'A) To show that social media companies are well-protected',
              'B) To demonstrate that centralized identity databases are vulnerable to hacking',
              'C) To argue that financial companies should be regulated differently',
              'D) To praise those companies for their security improvements',
            ],
            answer: 1,
            explanation: 'Asante cites Equifax, Optus, and 23andMe as examples of identity database breaches to argue that creating another such database for social media would be dangerous.',
          },
          {
            id: 'r4s5q3', difficulty: 'hard', questionType: 'inference',
            text: 'On which point do BOTH writers agree?',
            options: [
              'A) Age verification systems effectively prevent underage access',
              'B) Social media can harm the mental health of young people',
              'C) Privacy concerns about age verification are exaggerated',
              'D) Algorithmic feeds should remain unregulated',
            ],
            answer: 1,
            explanation: `Alvarez cites research on anxiety and depression; Asante says he "shares Alvarez's concern about youth mental health." Both agree on the harm — they disagree on the solution.`,
          },
        ],
      },
    ],
  },
]
