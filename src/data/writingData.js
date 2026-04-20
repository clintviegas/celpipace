/**
 * writingData.js
 * 20 CELPIP writing practice sets — 40 tasks total.
 * Mirrors the Supabase writing_tasks table for client-side rendering.
 *
 * Difficulty distribution across 40 tasks:
 *   easy:         12  (sets 1T2, 3T1, 6T1,T2, 9T1, 10T2, 11T1, 13T2, 14T1, 17T1,T2)
 *   intermediate: 16  (sets 1T1?no→2T1, 2T1, 4T1,T2, 7T1,T2, 9T2, 10T1, 11T2, 13T1, 14T2, 16T1,T2, 19T1,T2)
 *   advanced:     12  (sets 2T2, 5T1,T2, 8T1,T2, 12T1,T2, 15T1,T2, 18T1,T2, 20T1,T2)
 */

export const WRITING_SETS = [
  // ── SET 1 ──────────────────────────────────────────────────────────────
  {
    setNumber: 1,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'easy',
        timeLimitMinutes: 27,
        scenarioContext: 'Your landlord\'s name is Mr. David Park. You are a tenant.',
        promptText: 'You recently moved into a new apartment. The heating in your unit has not been working properly for two weeks. You need to write an email to your landlord.',
        bulletPoints: [
          'Describe the heating problem and how long it has been happening',
          'Explain how it is affecting you',
          'Ask for the problem to be fixed and suggest a timeline',
        ],
        tone: 'Semi-formal — writing to your landlord',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'intermediate',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A city planning organization is asking residents for their opinion on the following topic: Some people believe that expanding public transit (buses and subways) is the best way to reduce traffic in cities. Others believe that building more roads and highways is the better solution. Which approach do you think the city should prioritize? Give specific reasons to support your choice.',
        bulletPoints: null,
        tone: 'Semi-formal — clear, direct opinion writing',
        optionA: 'Expanding public transit (buses and subways)',
        optionB: 'Building more roads and highways',
      },
    ],
  },

  // ── SET 2 ──────────────────────────────────────────────────────────────
  {
    setNumber: 2,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'advanced',
        timeLimitMinutes: 27,
        scenarioContext: 'Your manager\'s name is Ms. Jennifer Watts. You have worked at the company for three years.',
        promptText: 'You work full-time during the week. Your current work schedule is Monday to Friday, 9 AM to 5 PM. You need to request a schedule change from your manager.',
        bulletPoints: [
          'Explain why you need a schedule change and what change you are requesting',
          'Describe how you will ensure your work responsibilities are still met',
          'Thank your manager and offer to discuss the request further',
        ],
        tone: 'Formal — writing to your manager',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'intermediate',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A school board is surveying parents and community members on the following topic: Some educators argue that technology — tablets, laptops, and apps — should be used extensively in classrooms from an early age because it prepares children for the modern world. Others believe that excessive screen time in schools is harmful and that traditional hands-on learning is more effective for young children. What is your opinion? Should schools use technology extensively in early childhood education? Support your position with specific reasons and examples.',
        bulletPoints: null,
        tone: 'Semi-formal — opinion writing with specific support',
        optionA: 'Technology should be used extensively in early childhood classrooms',
        optionB: 'Traditional hands-on learning is more effective for young children',
      },
    ],
  },

  // ── SET 3 ──────────────────────────────────────────────────────────────
  {
    setNumber: 3,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'easy',
        timeLimitMinutes: 27,
        scenarioContext: 'Your friend\'s name is Maria. The event is a neighbourhood potluck dinner.',
        promptText: 'Your friend is coming to visit your city next month and you want to invite them to a community event you are organizing. Write an email to invite your friend.',
        bulletPoints: [
          'Tell your friend about the event and when it is happening',
          'Explain why you think they would enjoy it',
          'Give them the information they need to attend and ask them to confirm',
        ],
        tone: 'Informal — writing to a close friend',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'advanced',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A community organization is asking residents for their views: Some people believe governments should strictly limit social media access for children under 16 to protect their mental health. Others argue that restricting social media takes away young people\'s freedom and that parents — not governments — should decide. What is your view? Should governments set age restrictions on social media? Explain your position with specific reasons.',
        bulletPoints: null,
        tone: 'Semi-formal — clear, direct opinion writing',
        optionA: 'Governments should set strict age restrictions on social media',
        optionB: 'Parents — not governments — should decide children\'s social media access',
      },
    ],
  },

  // ── SET 4 ──────────────────────────────────────────────────────────────
  {
    setNumber: 4,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'easy',
        timeLimitMinutes: 27,
        scenarioContext: 'Your colleague\'s name is Alex. You work in the same department.',
        promptText: 'You missed an important project deadline at work because of a personal emergency. Your colleague had to cover for you. Write an email to your colleague.',
        bulletPoints: [
          'Apologize sincerely and briefly explain what happened',
          'Acknowledge the extra work Alex had to take on because of you',
          'Offer to help Alex with a future task as a gesture of appreciation',
        ],
        tone: 'Semi-formal — writing to a colleague you know well',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'advanced',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A housing authority is gathering opinions on urban development: Some people prefer living in high-rise apartments in the city centre because they are close to work, transit, and amenities. Others prefer suburban houses because they offer more space, privacy, and a quieter environment. Which type of housing do you think is better for families? Explain your position with specific reasons and examples.',
        bulletPoints: null,
        tone: 'Semi-formal — opinion with specific support',
        optionA: 'High-rise apartments in the city centre',
        optionB: 'Houses in suburban neighbourhoods',
      },
    ],
  },

  // ── SET 5 ──────────────────────────────────────────────────────────────
  {
    setNumber: 5,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'intermediate',
        timeLimitMinutes: 27,
        scenarioContext: 'The professor\'s name is Dr. Rebecca Stone. The job is at a national research institute.',
        promptText: 'You are a recent graduate and you want to ask one of your university professors to write a reference letter for a competitive job application. Write an email to your professor.',
        bulletPoints: [
          'Remind the professor who you are and mention the course you took with them',
          'Explain the position you are applying for and why you chose them as a reference',
          'Provide any details they might need and ask if they are willing to help',
        ],
        tone: 'Formal — writing to a professor/academic',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'advanced',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A health policy think tank is collecting public opinions: Some people argue that governments should invest the majority of healthcare funding in preventive care — education, screenings, and lifestyle programs — to reduce the burden of disease before it occurs. Others believe that healthcare funding should focus on treatment — hospitals, emergency care, and medication — to help people who are already sick. Where do you think healthcare funding should be prioritized? Explain your view with specific reasoning.',
        bulletPoints: null,
        tone: 'Semi-formal — structured argument with evidence',
        optionA: 'Governments should prioritize preventive healthcare (education and screenings)',
        optionB: 'Governments should prioritize treatment (hospitals and emergency care)',
      },
    ],
  },

  // ── SET 6 ──────────────────────────────────────────────────────────────
  {
    setNumber: 6,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'easy',
        timeLimitMinutes: 27,
        scenarioContext: 'The restaurant is called The Maple Leaf Bistro. You visited last Saturday.',
        promptText: 'You recently had a meal at a restaurant that you enjoyed very much. You want to share your feedback with the restaurant manager. Write an email.',
        bulletPoints: [
          'Describe the specific things you enjoyed about your experience',
          'Mention one small suggestion for improvement',
          'Say that you plan to return and recommend the restaurant to others',
        ],
        tone: 'Semi-formal — positive, polite customer feedback',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'intermediate',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A city council is asking residents for input on a local issue: Your city is deciding whether to ban single-use plastic bags in all retail stores. Some people support the ban because it reduces pollution and encourages sustainable habits. Others oppose it because it increases costs and inconvenience for shoppers and businesses. Do you support or oppose the ban on single-use plastic bags? Give specific reasons.',
        bulletPoints: null,
        tone: 'Semi-formal — clear opinion with reasoning',
        optionA: 'I support the ban on single-use plastic bags',
        optionB: 'I oppose the ban on single-use plastic bags',
      },
    ],
  },

  // ── SET 7 ──────────────────────────────────────────────────────────────
  {
    setNumber: 7,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'advanced',
        timeLimitMinutes: 27,
        scenarioContext: 'The condo board president is Ms. Sandra Lee. You represent 12 households.',
        promptText: 'You are the representative of a group of condo residents. Your building\'s outdoor common area has been neglected and needs improvements. Write an email to the condo board.',
        bulletPoints: [
          'Describe the current state of the outdoor common area and the specific problems',
          'Explain why these improvements are important to residents',
          'Propose two specific changes and ask for a meeting to discuss further',
        ],
        tone: 'Formal — representing residents, writing to governance body',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'easy',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A municipal government is surveying residents on community spending: Your city has extra funding available and needs to decide whether to spend it on expanding the community recreation centre (adding a gym, pool, and daycare) or on improving roads and sidewalks in the neighbourhood. Which do you think is a better use of the funds? Support your opinion with specific reasons.',
        bulletPoints: null,
        tone: 'Semi-formal — community opinion writing',
        optionA: 'Expand the community recreation centre',
        optionB: 'Improve roads and sidewalks in the neighbourhood',
      },
    ],
  },

  // ── SET 8 ──────────────────────────────────────────────────────────────
  {
    setNumber: 8,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'intermediate',
        timeLimitMinutes: 27,
        scenarioContext: 'The airline is called NorthStar Air. Your booking reference is NSA-28471.',
        promptText: 'Your flight was recently cancelled by an airline and your checked luggage was lost. You have been waiting five days with no response from the airline. Write a formal complaint email.',
        bulletPoints: [
          'Clearly state the flight cancellation issue and the lost luggage problem with relevant details',
          'Describe how this situation has inconvenienced you',
          'State what you expect the airline to do to resolve this, including a specific deadline',
        ],
        tone: 'Formal — firm, assertive complaint to a company',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'advanced',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A parenting magazine is gathering views on child-rearing: Some people believe strict parenting — with clear rules, high expectations, and firm consequences — produces more disciplined and successful children. Others believe relaxed, child-led parenting — with more freedom, self-expression, and minimal rules — produces happier, more creative children. Which parenting style do you believe is more effective for raising well-rounded children? Give specific reasons and examples.',
        bulletPoints: null,
        tone: 'Semi-formal — nuanced opinion with specific support',
        optionA: 'Strict parenting with clear rules and high expectations',
        optionB: 'Relaxed, child-led parenting with freedom and minimal rules',
      },
    ],
  },

  // ── SET 9 ──────────────────────────────────────────────────────────────
  {
    setNumber: 9,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'easy',
        timeLimitMinutes: 27,
        scenarioContext: 'You do not know your neighbour\'s name — address the email as "Dear Neighbour." You want to resolve this politely.',
        promptText: 'Your neighbour plays loud music late at night on weeknights, which is affecting your sleep and your ability to work the next day. Write a polite email to your neighbour.',
        bulletPoints: [
          'Describe the problem clearly and when it occurs',
          'Explain how it is affecting you personally',
          'Ask them politely to make a change and suggest a compromise',
        ],
        tone: 'Polite and diplomatic — writing to a neighbour you don\'t know well',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'intermediate',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'An economics research group is asking for public opinion: Some people believe that immigration has a positive effect on a local economy because immigrants fill important labour shortages, start businesses, and contribute to innovation. Others believe that immigration puts pressure on local housing, public services, and wages for existing residents. What is your view on the effect of immigration on the local economy? Support your position with specific reasons and examples.',
        bulletPoints: null,
        tone: 'Semi-formal — reasoned opinion on a social issue',
        optionA: 'Immigration has an overall positive effect on the local economy',
        optionB: 'Immigration puts excessive pressure on housing, services, and wages',
      },
    ],
  },

  // ── SET 10 ──────────────────────────────────────────────────────────────
  {
    setNumber: 10,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'advanced',
        timeLimitMinutes: 27,
        scenarioContext: 'The hiring manager\'s name is Mr. Thomas Yuen. The role is a Marketing Coordinator position.',
        promptText: 'You have recently completed a job interview at a company you are very interested in working for. Write a follow-up email to the hiring manager.',
        bulletPoints: [
          'Thank the hiring manager for their time and the opportunity to interview',
          'Reference one specific thing discussed in the interview that excited you about the role',
          'Reaffirm your interest and mention that you are available if they need any further information',
        ],
        tone: 'Professional and warm — post-interview follow-up',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'intermediate',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A career guidance organization is collecting opinions: Some people believe that a university degree is the best investment young people can make for their future career because it opens more doors and leads to higher salaries. Others believe that skilled trades training (plumbing, electrical, carpentry) is a better choice because it leads to stable, well-paying jobs without the cost and time of a degree. Which path do you think is better for young people entering the workforce today? Give specific reasons.',
        bulletPoints: null,
        tone: 'Semi-formal — career and education opinion',
        optionA: 'A university degree is the better investment for young people',
        optionB: 'Skilled trades training is the better path for young people',
      },
    ],
  },

  // ── SET 11 ──────────────────────────────────────────────────────────────
  {
    setNumber: 11,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'easy',
        timeLimitMinutes: 27,
        scenarioContext: 'The school is called Maplewood Elementary. You are moving to the area in two months.',
        promptText: 'You are planning to move to a new city and want to inquire about enrolling your child in a local school. Write an email to the school.',
        bulletPoints: [
          'Introduce yourself and explain your situation',
          'Ask about the enrollment process and what documents are required',
          'Ask if there is a particular grade level that has open spots and when you should apply',
        ],
        tone: 'Formal — professional inquiry to a school',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'intermediate',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A youth development foundation is gathering opinions: Some educators and community leaders believe that mandatory community service should be a requirement for high school graduation because it builds empathy, responsibility, and civic engagement. Others believe that mandatory volunteering removes the genuine spirit of service and that students should choose how to spend their time outside school. What is your opinion? Should community service be mandatory for high school students? Support your view with specific reasons.',
        bulletPoints: null,
        tone: 'Semi-formal — education policy opinion',
        optionA: 'Community service should be mandatory for high school graduation',
        optionB: 'Community service should be voluntary — not a graduation requirement',
      },
    ],
  },

  // ── SET 12 ──────────────────────────────────────────────────────────────
  {
    setNumber: 12,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'advanced',
        timeLimitMinutes: 27,
        scenarioContext: 'The organization is called New Horizons Support Centre. The volunteer coordinator\'s name is Ms. Angela Torres.',
        promptText: 'You are applying for a volunteer position with a local non-profit organization that supports newcomers to Canada. Write an inquiry email expressing your interest.',
        bulletPoints: [
          'Introduce yourself and explain why you are interested in volunteering with this specific organization',
          'Describe the relevant skills or experience you would bring to the role',
          'Ask about available volunteer positions and the application process',
        ],
        tone: 'Formal and enthusiastic — professional volunteer inquiry',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'intermediate',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A technology ethics panel is gathering public views: Some experts argue that artificial intelligence (AI) is transforming the workplace in positive ways — increasing productivity, reducing repetitive tasks, and creating new job categories. Others warn that AI will lead to widespread job losses, growing inequality, and a workforce that is unprepared for rapid change. What is your view on the impact of AI on the workplace? Give a clear position and support it with specific reasons and examples.',
        bulletPoints: null,
        tone: 'Semi-formal — technology and society opinion',
        optionA: 'AI is transforming the workplace in largely positive ways',
        optionB: 'AI poses serious risks of job loss and inequality in the workplace',
      },
    ],
  },

  // ── SET 13 ──────────────────────────────────────────────────────────────
  {
    setNumber: 13,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'easy',
        timeLimitMinutes: 27,
        scenarioContext: 'The gym is called FitCore. The manager\'s name is Mr. Sam Patel.',
        promptText: 'You recently joined a gym and want to cancel your membership because of a personal financial hardship. The contract says there is a cancellation fee. Write an email to the gym manager.',
        bulletPoints: [
          'Explain your situation clearly and why you need to cancel your membership',
          'Reference the contract terms and ask if there is a waiver option given your circumstances',
          'Ask for a response within a specific number of days',
        ],
        tone: 'Semi-formal — polite request with personal context',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'advanced',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A community wellness group is surveying residents: Parents, educators, and health experts are debating how much screen time teenagers should have outside of school. Some believe there should be strict daily limits (no more than 2 hours) to protect mental health and encourage physical activity. Others believe that teenagers are responsible enough to manage their own screen time without adult-imposed limits. What is your view? Should there be limits on teen screen time? Give specific reasons.',
        bulletPoints: null,
        tone: 'Semi-formal — parenting and health opinion',
        optionA: 'There should be strict daily limits on teenagers\' screen time',
        optionB: 'Teenagers should manage their own screen time without imposed limits',
      },
    ],
  },

  // ── SET 14 ──────────────────────────────────────────────────────────────
  {
    setNumber: 14,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'easy',
        timeLimitMinutes: 27,
        scenarioContext: 'Your mentor\'s name is Ms. Patricia Lam. You have worked together for two years.',
        promptText: 'You had a positive experience with a mentor at your workplace who helped you develop new skills. You are leaving the company for a new job and want to write a thank-you email.',
        bulletPoints: [
          'Thank your mentor for their specific help and the time they invested in you',
          'Mention one or two things you learned from them that made a real difference',
          'Say that you hope to stay in touch and wish them well',
        ],
        tone: 'Warm and personal — sincere professional gratitude',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'advanced',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A business association is gathering opinions from community members: Some people prefer to shop at locally owned small businesses because it supports the community, creates local jobs, and maintains the unique character of neighbourhoods. Others prefer large chain stores because they offer lower prices, wider selection, and more consistent quality. Which do you prefer and why? Give specific reasons and examples to support your choice.',
        bulletPoints: null,
        tone: 'Semi-formal — community and consumer opinion',
        optionA: 'I prefer locally owned small businesses',
        optionB: 'I prefer large chain stores',
      },
    ],
  },

  // ── SET 15 ──────────────────────────────────────────────────────────────
  {
    setNumber: 15,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'intermediate',
        timeLimitMinutes: 27,
        scenarioContext: 'The councillor\'s name is Councillor Maria Santos. You represent a group of concerned residents.',
        promptText: 'You live near a city park that has been poorly maintained. You want to write to your local city councillor to advocate for park improvements.',
        bulletPoints: [
          'Describe the current state of the park and the specific problems with evidence or examples',
          'Explain why the park matters to the community and who is affected',
          'Make two or three specific, realistic requests for improvement and offer to participate in a community meeting',
        ],
        tone: 'Formal — civic advocacy letter to an elected official',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'advanced',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'An energy policy organization is asking citizens for input: Some people believe governments should invest heavily in renewable energy (solar, wind, hydro) to combat climate change, even if it means higher short-term costs for taxpayers and consumers. Others argue that until renewable technologies become cost-competitive on their own, governments should continue supporting affordable conventional energy sources to protect household budgets. What is your view on government investment in renewable energy? Give a clear, supported position.',
        bulletPoints: null,
        tone: 'Semi-formal — policy and environment opinion',
        optionA: 'Governments should invest heavily in renewable energy now, even at higher short-term cost',
        optionB: 'Governments should wait until renewable energy is cost-competitive before major investment',
      },
    ],
  },

  // ── SET 16 ──────────────────────────────────────────────────────────────
  {
    setNumber: 16,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'easy',
        timeLimitMinutes: 27,
        scenarioContext: 'The retailer is called HomeStyle Direct. Your order number is HS-99217.',
        promptText: 'You recently purchased a product from an online retailer and it arrived damaged. You have tried to contact their customer service but received no response after 10 days. Write a formal complaint email.',
        bulletPoints: [
          'Describe the product you ordered and the damage you found when it arrived',
          'Explain your attempts to contact customer service and the lack of response',
          'State clearly what resolution you are expecting, and by what date',
        ],
        tone: 'Formal — firm consumer complaint to a business',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'intermediate',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A workplace research organization is collecting opinions: Many companies around the world are experimenting with a four-day work week (32 hours instead of 40, with no reduction in pay). Supporters say it improves employee wellbeing, productivity, and retention. Critics argue it is impractical, increases costs, and reduces the ability to serve customers and clients. What is your opinion on the four-day work week? Give a clear position and specific reasons.',
        bulletPoints: null,
        tone: 'Semi-formal — workplace policy opinion',
        optionA: 'The four-day work week should be adopted widely — it benefits both employees and employers',
        optionB: 'The four-day work week is impractical and would harm businesses and service delivery',
      },
    ],
  },

  // ── SET 17 ──────────────────────────────────────────────────────────────
  {
    setNumber: 17,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'advanced',
        timeLimitMinutes: 27,
        scenarioContext: 'Your departing colleague\'s name is James. The coworker you are inviting is named Priya.',
        promptText: 'A colleague at work is leaving for a new job in another city. You are organizing a small farewell gathering for them and want to invite another coworker. Write an email.',
        bulletPoints: [
          'Tell Priya about James leaving and the reason for the gathering',
          'Give the details of the event (when, where, and format)',
          'Ask Priya to confirm attendance and suggest she keep it a surprise',
        ],
        tone: 'Informal — friendly message to a coworker',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'easy',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A city safety committee is gathering public views: Some people strongly support the expansion of public surveillance cameras in city streets, parks, and transit stations because they deter crime and help police solve cases faster. Others oppose surveillance cameras because they invade privacy, create a culture of distrust, and are often misused by authorities. What is your view? Should cities expand their network of public surveillance cameras? Give specific reasons to support your position.',
        bulletPoints: null,
        tone: 'Semi-formal — civic safety and privacy opinion',
        optionA: 'Cities should expand their network of public surveillance cameras',
        optionB: 'Cities should not expand public surveillance cameras — they invade privacy',
      },
    ],
  },

  // ── SET 18 ──────────────────────────────────────────────────────────────
  {
    setNumber: 18,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'intermediate',
        timeLimitMinutes: 27,
        scenarioContext: 'The company is called Novex Solutions. The hiring contact is Ms. Rachel Kim, Head of Talent.',
        promptText: 'You are interested in applying for a position at a new company in your field. You have not seen a posted job opening but believe you would be a strong fit. Write a cover letter-style email to introduce yourself.',
        bulletPoints: [
          'Introduce yourself, briefly describe your professional background, and explain why you are reaching out to this specific company',
          'Highlight two or three skills or accomplishments that make you a strong candidate',
          'Express your interest in exploring any current or upcoming opportunities and offer to share your resume',
        ],
        tone: 'Formal and confident — speculative job inquiry',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'advanced',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A civic engagement organization is asking residents for input: Some people believe that allowing pets — especially dogs — in apartment buildings should be a right for all tenants, as pets improve mental health and quality of life. Others believe that building managers and strata councils should have the authority to ban pets because they cause noise, property damage, and allergic reactions for other residents. What is your view on pet ownership in apartments? Give a clear position with specific supporting reasons.',
        bulletPoints: null,
        tone: 'Semi-formal — property and tenant rights opinion',
        optionA: 'Tenants should have the right to keep pets in apartment buildings',
        optionB: 'Building managers should have authority to ban pets in apartments',
      },
    ],
  },

  // ── SET 19 ──────────────────────────────────────────────────────────────
  {
    setNumber: 19,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'easy',
        timeLimitMinutes: 27,
        scenarioContext: 'The building manager\'s name is Mr. Kevin Marsh. You are writing on behalf of several residents.',
        promptText: 'Your building management recently sent a notice prohibiting the use of the rooftop terrace for personal gatherings. Many residents feel this is unfair. You want to write a respectful email requesting a review of this policy.',
        bulletPoints: [
          'Acknowledge the building management\'s concern and show you understand the reason for the policy',
          'Explain why the rooftop terrace is valued by residents and give specific examples of responsible use',
          'Propose a compromise (such as a booking system or noise curfew) and ask for a review of the policy',
        ],
        tone: 'Respectful and constructive — tenant-management communication',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'intermediate',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A city digital access committee is surveying residents: Some people believe the city\'s top priority for free public Wi-Fi should be low-income neighbourhoods and community centres, where residents have the greatest need and least access to affordable internet. Others believe the city should focus on expanding free Wi-Fi in high-traffic public spaces like transit stations, parks, and downtown areas to benefit the largest number of people. What do you think should be the top priority for public Wi-Fi expansion in cities? Give specific reasons.',
        bulletPoints: null,
        tone: 'Semi-formal — digital equity and public policy opinion',
        optionA: 'Free public Wi-Fi should be prioritized in low-income neighbourhoods and community centres',
        optionB: 'Free public Wi-Fi should be expanded in high-traffic public spaces for the most users',
      },
    ],
  },

  // ── SET 20 ──────────────────────────────────────────────────────────────
  {
    setNumber: 20,
    tasks: [
      {
        taskNumber: 1,
        taskType: 'email',
        difficulty: 'advanced',
        timeLimitMinutes: 27,
        scenarioContext: 'The library director\'s name is Ms. Frances Okafor.',
        promptText: 'You recently visited a library in your community and noticed that it has very limited programming for adults — the focus is entirely on children\'s events. You want to write to the library director suggesting a new adult community program.',
        bulletPoints: [
          'Acknowledge the library\'s existing programs and mention your positive history as a library user',
          'Describe a specific adult programming idea you are proposing and explain its value to the community',
          'Ask if the library would consider your suggestion and offer to help organize or volunteer',
        ],
        tone: 'Warm and constructive — community member writing with a positive suggestion',
        optionA: null,
        optionB: null,
      },
      {
        taskNumber: 2,
        taskType: 'survey',
        difficulty: 'intermediate',
        timeLimitMinutes: 26,
        scenarioContext: null,
        promptText: 'A national debate organization is asking participants to share their views: Remote work — where employees work from home full-time or most of the time — has become much more common since 2020. Some people believe remote work is a permanent positive shift that benefits employees\' wellbeing, productivity, and work-life balance. Others argue that office work is essential for collaboration, company culture, mentoring junior staff, and maintaining clear boundaries between work and personal life. What is your view? Is remote work a positive long-term shift, or should offices remain central to how we work? Give a clear, supported position.',
        bulletPoints: null,
        tone: 'Semi-formal — workplace culture opinion with depth',
        optionA: 'Remote work is a positive long-term shift that should be widely adopted',
        optionB: 'Office-based work should remain central — remote work has significant limitations',
      },
    ],
  },
]

/** Helper: get a flat list of all tasks with their set info attached */
export function getAllTasks() {
  return WRITING_SETS.flatMap(set =>
    set.tasks.map(task => ({ ...task, setNumber: set.setNumber }))
  )
}

/** Difficulty badge colours — matches existing lp-diff-* CSS classes */
export const DIFF_STYLE = {
  easy:         { bg: '#F0FDF4', color: '#2D8A56', label: 'Easy' },
  intermediate: { bg: '#EEF7FF', color: '#4A90D9', label: 'Intermediate' },
  advanced:     { bg: '#FEF2F2', color: '#C8102E', label: 'Advanced' },
}
