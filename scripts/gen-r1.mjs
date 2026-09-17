import { readFileSync, writeFileSync } from 'fs';

const existing = JSON.parse(readFileSync('./src/data/reading/R1_correspondence.json', 'utf8'));

const newSets = [
  {
    set_number: 2,
    difficulty: "easy",
    title: "Request for Extended Library Borrowing",
    passage: {
      type: "email",
      from: "Daniel Park",
      to: "Oakville Public Library — Circulation Desk",
      subject: "Request for Extended Borrowing Period",
      body: "Dear Library Staff,\n\nMy name is Daniel Park, and I recently moved to Oakville from Hamilton. I signed up for a library card last month and have been very impressed with the selection of books, especially the Korean-language novels.\n\nHowever, I have found that the standard 14-day borrowing period is often too short for me. I work rotating shifts at a nearby hospital, and I sometimes cannot visit the library for two or three weeks at a time. I have already renewed several books online, and once I was charged a late fee because I forgot to renew before the deadline.\n\nI would like to request an extended borrowing period of 21 days, if that is available. I take good care of every book I borrow and always return items in excellent condition. I would also be happy to sign up for email reminders if that is required.\n\nThank you for considering my request. I look forward to continuing to use the library.\n\nSincerely,\nDaniel Park"
    },
    mcq_questions: [
      { question_number: 1, skill: "writer_purpose", question_text: "Why is Daniel writing this email?", options: { A: "To complain about a late fee he was charged", B: "To request a longer borrowing period", C: "To apply for a new library card", D: "To ask about Korean-language novels" }, correct_answer: "B" },
      { question_number: 2, skill: "detail_comprehension", question_text: "Where did Daniel recently move from?", options: { A: "Toronto", B: "Vancouver", C: "Hamilton", D: "Ottawa" }, correct_answer: "C" },
      { question_number: 3, skill: "detail_comprehension", question_text: "Why does Daniel find the 14-day period difficult?", options: { A: "He reads very slowly", B: "He borrows too many books at once", C: "His rotating work schedule makes regular visits hard", D: "He lives far from the library" }, correct_answer: "C" },
      { question_number: 4, skill: "detail_comprehension", question_text: "What happened when Daniel forgot to renew a book?", options: { A: "His card was suspended", B: "He was charged a late fee", C: "The book was considered lost", D: "He had to buy a replacement" }, correct_answer: "B" },
      { question_number: 5, skill: "inference", question_text: "What can be inferred about Daniel's attitude toward the library?", options: { A: "He is frustrated and wants to cancel his membership", B: "He values the library and wants to keep using it", C: "He thinks the library needs more books", D: "He prefers buying books over borrowing" }, correct_answer: "B" },
      { question_number: 6, skill: "tone_and_register", question_text: "How would you describe the tone of Daniel's email?", options: { A: "Demanding and impatient", B: "Casual and humorous", C: "Polite and reasonable", D: "Formal and legalistic" }, correct_answer: "C" }
    ],
    fill_in_blank_response: {
      instructions: "Now read the response written to Daniel. Complete the response by filling in the blanks. Choose the best option for each blank.",
      response_text: "Dear Mr. Park,\n\nThank you for reaching out and for your kind words about our [BLANK_7]. We are glad to hear you are enjoying the collection, including our Korean-language section.\n\nI am pleased to let you know that we do offer an extended borrowing option of 21 days for patrons who [BLANK_8] for our Frequent Reader program. To enroll, simply bring your library card to the front desk and complete a short form. There is no additional [BLANK_9] for this service.\n\nOnce enrolled, all items you borrow will automatically have a 21-day [BLANK_10] period. We also encourage you to sign up for email and text reminders, which can be set up through your online account.\n\nWe appreciate your care with borrowed materials and hope to continue [BLANK_11] you for a long time.\n\nWarm regards,\nHelen Ng\nHead Librarian, Oakville Public Library",
      blanks: [
        { blank_number: 7, options: { A: "collection", B: "complaint", C: "invoice", D: "parking" }, correct_answer: "A" },
        { blank_number: 8, options: { A: "pay", B: "compete", C: "register", D: "interview" }, correct_answer: "C" },
        { blank_number: 9, options: { A: "cost", B: "delay", C: "effort", D: "risk" }, correct_answer: "A" },
        { blank_number: 10, options: { A: "waiting", B: "storage", C: "loan", D: "return" }, correct_answer: "C" },
        { blank_number: 11, options: { A: "teaching", B: "serving", C: "visiting", D: "charging" }, correct_answer: "B" }
      ]
    }
  },
  {
    set_number: 3,
    difficulty: "intermediate",
    title: "Neighbourhood Spring Cleanup Invitation",
    passage: {
      type: "email",
      from: "Sarah Chen, Block Captain — Elmwood Crescent",
      to: "All Residents of Elmwood Crescent",
      subject: "Annual Spring Cleanup & BBQ — Saturday, April 20",
      body: "Dear Neighbours,\n\nSpring is here, and it is time once again for our annual Elmwood Crescent Spring Cleanup! Last year, more than 40 residents came out and we collected over 60 bags of leaves and litter — a new record. Let us see if we can do even better this year.\n\nThe cleanup will take place on Saturday, April 20, from 9:00 a.m. to noon. Gloves, bags, and rakes will be provided, but feel free to bring your own gardening tools if you have them. We will focus on the boulevard, the park path along the creek, and the area around the community mailboxes.\n\nOnce the work is done, everyone is invited to a barbecue at my house (14 Elmwood Crescent) starting at 12:30 p.m. Burgers, hot dogs, and drinks will be provided. If you would like to bring a side dish or dessert, that would be wonderful but is certainly not required.\n\nPlease reply to this email by April 15 so I can plan for food. Children are welcome — we will have sidewalk chalk and bubbles to keep the little ones busy. I hope to see you all there!\n\nWarm regards,\nSarah Chen"
    },
    mcq_questions: [
      { question_number: 1, skill: "writer_purpose", question_text: "What is the main purpose of Sarah's email?", options: { A: "To report a complaint about litter on the street", B: "To invite residents to a cleanup event and barbecue", C: "To sell tickets to a community fundraiser", D: "To ask neighbours to donate gardening tools" }, correct_answer: "B" },
      { question_number: 2, skill: "detail_comprehension", question_text: "How many bags of litter were collected last year?", options: { A: "Over 20", B: "Over 40", C: "Over 60", D: "Over 80" }, correct_answer: "C" },
      { question_number: 3, skill: "detail_comprehension", question_text: "What time does the barbecue begin?", options: { A: "9:00 a.m.", B: "12:00 p.m.", C: "12:30 p.m.", D: "1:00 p.m." }, correct_answer: "C" },
      { question_number: 4, skill: "detail_comprehension", question_text: "What does Sarah ask residents to do by April 15?", options: { A: "Pay a registration fee", B: "Bring their own food", C: "Reply to confirm attendance", D: "Drop off gardening tools" }, correct_answer: "C" },
      { question_number: 5, skill: "inference", question_text: "What can be inferred about the Elmwood Crescent community?", options: { A: "Most residents are unhappy with the neighbourhood", B: "The cleanup is a well-established annual tradition", C: "Sarah is being paid to organize the event", D: "Only adults are expected to participate" }, correct_answer: "B" },
      { question_number: 6, skill: "tone_and_register", question_text: "What is the overall tone of Sarah's email?", options: { A: "Urgent and demanding", B: "Warm and encouraging", C: "Formal and businesslike", D: "Apologetic and cautious" }, correct_answer: "B" }
    ],
    fill_in_blank_response: {
      instructions: "Now read the reply from a resident. Complete the reply by filling in the blanks. Choose the best option for each blank.",
      response_text: "Hi Sarah,\n\nThanks so much for organizing this again! You really are the [BLANK_7] of the neighbourhood when it comes to bringing people together.\n\nMy husband and I will both be there at 9:00 a.m. sharp. I will bring a large garden rake and an extra pair of gloves in case anyone [BLANK_8] theirs. We found the creek path especially messy last year, so maybe we should [BLANK_9] a few extra people to that area this time.\n\nFor the barbecue, I would love to bring my potato salad — it is always a [BLANK_10] at family gatherings. Should I also bring paper plates, or do you have enough?\n\nThe kids are excited too. My daughter has been talking about the sidewalk chalk since you first [BLANK_11] the cleanup last month. See you on the 20th!\n\nBest,\nJennifer",
      blanks: [
        { blank_number: 7, options: { A: "backbone", B: "stranger", C: "critic", D: "problem" }, correct_answer: "A" },
        { blank_number: 8, options: { A: "sells", B: "forgets", C: "hides", D: "paints" }, correct_answer: "B" },
        { blank_number: 9, options: { A: "avoid", B: "remove", C: "assign", D: "dismiss" }, correct_answer: "C" },
        { blank_number: 10, options: { A: "disaster", B: "secret", C: "hit", D: "chore" }, correct_answer: "C" },
        { blank_number: 11, options: { A: "cancelled", B: "criticized", C: "ignored", D: "mentioned" }, correct_answer: "D" }
      ]
    }
  },
  {
    set_number: 4,
    difficulty: "easy",
    title: "Restaurant Apology for a Bad Experience",
    passage: {
      type: "email",
      from: "Marco Rossi, General Manager — Bella Cucina Restaurant",
      to: "Stephanie Howard",
      subject: "Our Sincere Apologies for Your Recent Visit",
      body: "Dear Ms. Howard,\n\nThank you for taking the time to share your experience at Bella Cucina last Saturday evening. I have read your comments carefully, and I want you to know that I take your concerns very seriously.\n\nI understand that your pasta arrived cold, that you waited over 45 minutes for your main course, and that there was an error on your bill. None of this is acceptable, and I sincerely apologize. Saturday was an unusually busy night, but that is not an excuse for the level of service you received.\n\nI have spoken with the kitchen team and the server who assisted you to make sure this does not happen again. I would like to invite you and a guest back for a complimentary dinner so that we can show you the experience Bella Cucina is known for. Please call me directly at 905-555-0173 to arrange a convenient date.\n\nThank you again for bringing this to my attention. Your feedback helps us improve.\n\nWith warm regards,\nMarco Rossi"
    },
    mcq_questions: [
      { question_number: 1, skill: "writer_purpose", question_text: "Why is Marco writing this email?", options: { A: "To promote a new menu item", B: "To apologize for a poor dining experience", C: "To respond to a job application", D: "To announce new restaurant hours" }, correct_answer: "B" },
      { question_number: 2, skill: "detail_comprehension", question_text: "Which of the following was NOT a problem during Stephanie's visit?", options: { A: "Cold food", B: "A long wait", C: "A billing error", D: "A rude manager" }, correct_answer: "D" },
      { question_number: 3, skill: "detail_comprehension", question_text: "How long did Stephanie wait for her main course?", options: { A: "About 20 minutes", B: "About 30 minutes", C: "Over 45 minutes", D: "Over an hour" }, correct_answer: "C" },
      { question_number: 4, skill: "detail_comprehension", question_text: "What does Marco offer Stephanie?", options: { A: "A full refund", B: "A gift card", C: "A free dinner for two", D: "A discount on her next visit" }, correct_answer: "C" },
      { question_number: 5, skill: "inference", question_text: "Why does Marco mention that Saturday was unusually busy?", options: { A: "To boast about the restaurant's popularity", B: "To explain, but not excuse, the poor service", C: "To suggest Stephanie visit on a quieter night", D: "To blame the kitchen staff" }, correct_answer: "B" },
      { question_number: 6, skill: "tone_and_register", question_text: "How would you describe Marco's tone?", options: { A: "Defensive and dismissive", B: "Sincere and apologetic", C: "Casual and humorous", D: "Cold and impersonal" }, correct_answer: "B" }
    ],
    fill_in_blank_response: {
      instructions: "Now read Stephanie's reply to Marco. Complete the reply by filling in the blanks. Choose the best option for each blank.",
      response_text: "Dear Mr. Rossi,\n\nThank you for your prompt and thoughtful [BLANK_7]. I appreciate that you took the time to acknowledge what happened and to follow up with your staff.\n\nI was quite [BLANK_8] after our visit, especially because we had chosen Bella Cucina to celebrate my mother's birthday. However, your response has changed my impression of the restaurant, and I would be happy to [BLANK_9] your offer of a complimentary dinner.\n\nI will call the number you provided to [BLANK_10] a date that works for us. I am hopeful that our next visit will be a much better [BLANK_11].\n\nThank you again,\nStephanie Howard",
      blanks: [
        { blank_number: 7, options: { A: "complaint", B: "response", C: "menu", D: "invoice" }, correct_answer: "B" },
        { blank_number: 8, options: { A: "relieved", B: "excited", C: "disappointed", D: "confused" }, correct_answer: "C" },
        { blank_number: 9, options: { A: "decline", B: "accept", C: "ignore", D: "delay" }, correct_answer: "B" },
        { blank_number: 10, options: { A: "cancel", B: "forget", C: "arrange", D: "avoid" }, correct_answer: "C" },
        { blank_number: 11, options: { A: "expense", B: "problem", C: "secret", D: "experience" }, correct_answer: "D" }
      ]
    }
  },
  {
    set_number: 5,
    difficulty: "intermediate",
    title: "Inquiry About a Summer Day Camp",
    passage: {
      type: "email",
      from: "Lisa Thompson",
      to: "Camp Sunshine — Registration Office",
      subject: "Questions About the Junior Explorer Program",
      body: "Dear Camp Sunshine Team,\n\nI am writing to ask about the Junior Explorer Program for this coming summer. My daughter, Emma, is seven years old and has never attended a day camp before. She is very excited about the idea, but as a first-time camp parent, I have a number of questions.\n\nFirst, could you confirm the age range for the Junior Explorer group? Your website says ages 6 to 9, but a friend told me it recently changed to ages 7 to 10. Second, what does a typical day look like? Emma is an active child who loves being outdoors, but she is also quite shy and may need some time to adjust to new groups.\n\nI also need to know whether you can accommodate food allergies. Emma has a severe peanut allergy, and I need to be confident that the camp environment is safe for her. Do you have an allergy policy, and are the counsellors trained in using an EpiPen?\n\nFinally, I was wondering about payment options. Is it possible to pay in two instalments rather than one lump sum? The full fee of $475 is manageable, but splitting it would be helpful for our family budget.\n\nThank you for your time. I look forward to hearing from you.\n\nBest regards,\nLisa Thompson"
    },
    mcq_questions: [
      { question_number: 1, skill: "writer_purpose", question_text: "Why is Lisa writing this email?", options: { A: "To register her daughter for camp immediately", B: "To complain about incorrect information on the website", C: "To ask questions before enrolling her daughter", D: "To request a refund for last year's camp" }, correct_answer: "C" },
      { question_number: 2, skill: "detail_comprehension", question_text: "Why is Lisa unsure about the age range?", options: { A: "She lost the brochure", B: "The website and a friend gave different information", C: "Emma is too old for the program", D: "The camp changed its name recently" }, correct_answer: "B" },
      { question_number: 3, skill: "detail_comprehension", question_text: "What is Lisa's concern about Emma's personality?", options: { A: "Emma does not like outdoor activities", B: "Emma may struggle to adjust because she is shy", C: "Emma has trouble following instructions", D: "Emma does not get along with other children" }, correct_answer: "B" },
      { question_number: 4, skill: "detail_comprehension", question_text: "What medical concern does Lisa raise?", options: { A: "Emma needs daily medication", B: "Emma has asthma", C: "Emma has a severe peanut allergy", D: "Emma recently had surgery" }, correct_answer: "C" },
      { question_number: 5, skill: "inference", question_text: "What can be inferred about Lisa's financial situation?", options: { A: "She cannot afford the camp at all", B: "She can manage the cost but would prefer to split payments", C: "She is looking for a free program", D: "She wants to negotiate a lower price" }, correct_answer: "B" },
      { question_number: 6, skill: "tone_and_register", question_text: "How would you describe Lisa's tone?", options: { A: "Anxious and demanding", B: "Indifferent and rushed", C: "Thoughtful and concerned", D: "Angry and frustrated" }, correct_answer: "C" }
    ],
    fill_in_blank_response: {
      instructions: "Now read the response from Camp Sunshine. Complete the response by filling in the blanks. Choose the best option for each blank.",
      response_text: "Dear Ms. Thompson,\n\nThank you for your interest in Camp Sunshine! I am happy to answer your questions and help you feel [BLANK_7] about sending Emma to us this summer.\n\nThe Junior Explorer group is for ages 6 to 9 — the website is correct. A typical day includes outdoor games, nature hikes, arts and crafts, and a supervised swim period. Our counsellors are experienced at helping shy children feel [BLANK_8], and we always pair newcomers with a buddy during the first week.\n\nRegarding allergies, we take food safety very seriously. Our camp is completely nut-free, and all counsellors are [BLANK_9] in first aid, including EpiPen administration. We ask parents to complete a detailed medical form before the first day.\n\nAs for payment, we are happy to offer a two-instalment plan. The first [BLANK_10] of $237.50 is due at registration, and the second is due by June 15.\n\nPlease do not [BLANK_11] to reach out if you have more questions. We would love to have Emma join us!\n\nWarm regards,\nAmanda Gill\nCamp Director",
      blanks: [
        { blank_number: 7, options: { A: "nervous", B: "confident", C: "guilty", D: "curious" }, correct_answer: "B" },
        { blank_number: 8, options: { A: "isolated", B: "bored", C: "included", D: "pressured" }, correct_answer: "C" },
        { blank_number: 9, options: { A: "trained", B: "interested", C: "worried", D: "excused" }, correct_answer: "A" },
        { blank_number: 10, options: { A: "refund", B: "penalty", C: "instalment", D: "discount" }, correct_answer: "C" },
        { blank_number: 11, options: { A: "plan", B: "hesitate", C: "forget", D: "promise" }, correct_answer: "B" }
      ]
    }
  },
  {
    set_number: 6,
    difficulty: "advanced",
    title: "Professor's Scholarship Recommendation",
    passage: {
      type: "email",
      from: "Dr. Margaret Hayes, Department of Political Science — Dalhousie University",
      to: "Selection Committee, Pearson Academic Foundation",
      subject: "Letter of Recommendation — Priya Nair for the Leadership Scholarship",
      body: "Dear Members of the Selection Committee,\n\nI am writing to offer my strongest recommendation for Priya Nair, who is applying for the Pearson Leadership Scholarship. I have had the privilege of teaching and mentoring Priya over the past three years, and I can say without reservation that she is among the most intellectually curious and socially committed students I have encountered in my twenty-two years of university teaching.\n\nPriya maintained a 3.92 GPA while simultaneously serving as president of the university's Model United Nations club and co-founding a peer tutoring program for first-year international students. What distinguishes her from other high achievers is the genuineness of her engagement: she does not pursue activities to build a résumé, but because she is deeply moved by questions of equity and access.\n\nIn my senior seminar on democratic governance, Priya produced a research paper examining voter suppression in municipal elections that was later accepted for presentation at the Canadian Political Science Association's annual conference — a rare achievement for an undergraduate. Her analysis was methodologically rigorous, carefully sourced, and written with a clarity that many graduate students struggle to achieve.\n\nBeyond academics, Priya has volunteered with the Halifax Refugee Clinic for two years, assisting newcomers with housing applications and interpretation services. She has spoken publicly about the challenges facing refugee claimants, and her advocacy contributed to the clinic receiving additional provincial funding last year.\n\nI have no doubt that Priya will use the Pearson Scholarship not merely to advance her own career, but to create meaningful change in whatever community she enters. She has my highest and most enthusiastic endorsement.\n\nSincerely,\nDr. Margaret Hayes"
    },
    mcq_questions: [
      { question_number: 1, skill: "writer_purpose", question_text: "What is the primary purpose of this email?", options: { A: "To announce a conference presentation", B: "To recommend a student for a scholarship", C: "To describe a tutoring program", D: "To request funding for a research project" }, correct_answer: "B" },
      { question_number: 2, skill: "detail_comprehension", question_text: "What did Priya co-found at the university?", options: { A: "A political science journal", B: "A Model United Nations club", C: "A peer tutoring program for international students", D: "A student government association" }, correct_answer: "C" },
      { question_number: 3, skill: "detail_comprehension", question_text: "What was notable about Priya's research paper?", options: { A: "It won a national essay contest", B: "It was published in a book", C: "It was accepted at a major academic conference", D: "It was co-written with Dr. Hayes" }, correct_answer: "C" },
      { question_number: 4, skill: "inference", question_text: "Why does Dr. Hayes mention that presenting at the conference is 'a rare achievement for an undergraduate'?", options: { A: "To suggest Priya should switch to graduate studies", B: "To emphasize how exceptional Priya's work is", C: "To criticize the conference's selection standards", D: "To explain why she helped Priya with the paper" }, correct_answer: "B" },
      { question_number: 5, skill: "detail_comprehension", question_text: "What contribution did Priya make at the Halifax Refugee Clinic?", options: { A: "She managed the clinic's budget", B: "She trained other volunteers", C: "She helped newcomers with housing and interpretation", D: "She started a fundraising campaign" }, correct_answer: "C" },
      { question_number: 6, skill: "inference", question_text: "What does Dr. Hayes imply about Priya's motivation for extracurricular activities?", options: { A: "Priya participates mainly to strengthen her applications", B: "Priya is required to volunteer for her degree", C: "Priya is genuinely driven by a concern for fairness", D: "Priya prefers volunteering to studying" }, correct_answer: "C" }
    ],
    fill_in_blank_response: {
      instructions: "Now read the committee's reply to Dr. Hayes. Complete the reply by filling in the blanks. Choose the best option for each blank.",
      response_text: "Dear Dr. Hayes,\n\nThank you for your detailed and [BLANK_7] recommendation of Priya Nair. We receive many applications each year, and letters from faculty mentors are an essential part of our [BLANK_8] process.\n\nYour description of Priya's academic achievements, particularly her conference presentation, clearly [BLANK_9] her from the typical applicant pool. We were also impressed to learn about her sustained commitment to the Halifax Refugee Clinic, which aligns closely with the Foundation's values of community [BLANK_10] and leadership.\n\nWe are now in the final stage of review and expect to notify all candidates by May 15. Should we require any additional information, we will not hesitate to [BLANK_11] you.\n\nWith appreciation,\nRobert Fung\nChair, Pearson Academic Foundation Selection Committee",
      blanks: [
        { blank_number: 7, options: { A: "reluctant", B: "compelling", C: "brief", D: "confusing" }, correct_answer: "B" },
        { blank_number: 8, options: { A: "elimination", B: "payment", C: "evaluation", D: "advertising" }, correct_answer: "C" },
        { blank_number: 9, options: { A: "removes", B: "separates", C: "hides", D: "distinguishes" }, correct_answer: "D" },
        { blank_number: 10, options: { A: "avoidance", B: "engagement", C: "isolation", D: "competition" }, correct_answer: "B" },
        { blank_number: 11, options: { A: "ignore", B: "replace", C: "contact", D: "criticize" }, correct_answer: "C" }
      ]
    }
  },
  {
    set_number: 7,
    difficulty: "intermediate",
    title: "Tenant Complaint About Heating Problems",
    passage: {
      type: "email",
      from: "James O'Brien",
      to: "Sunrise Property Management",
      subject: "Recurring Heating Issues — Unit 4B, 210 Maple Road",
      body: "Dear Property Management,\n\nI am writing to report an ongoing heating problem in my apartment at 210 Maple Road, Unit 4B. For the past three months, the radiator in my living room has been making loud banging noises and frequently shuts off on its own, sometimes for hours at a time. On several nights in January, the indoor temperature dropped below 16°C, which I understand is below the minimum standard set by the city's property maintenance bylaw.\n\nI reported this issue in early December and again in mid-January. A maintenance technician visited on both occasions and told me the problem was related to an aging boiler in the basement. Each time, the radiator worked for a few days after the visit and then stopped again.\n\nThis situation has been especially difficult because my daughter, who is four years old, has been getting frequent colds this winter. Our family doctor suggested that the cold indoor temperatures may be contributing to her illness.\n\nI am requesting that the boiler be properly repaired or replaced as soon as possible. I would also appreciate a written timeline for when this work will be completed. If the issue is not resolved within the next two weeks, I may need to contact the Landlord and Tenant Board for assistance.\n\nThank you for your prompt attention to this matter.\n\nSincerely,\nJames O'Brien"
    },
    mcq_questions: [
      { question_number: 1, skill: "writer_purpose", question_text: "Why is James writing this email?", options: { A: "To request a rent reduction for the winter months", B: "To report recurring heating problems and demand a fix", C: "To give notice that he is moving out", D: "To ask about a new apartment in the building" }, correct_answer: "B" },
      { question_number: 2, skill: "detail_comprehension", question_text: "How long has the heating problem been going on?", options: { A: "A few weeks", B: "About three months", C: "Since he moved in", D: "About a year" }, correct_answer: "B" },
      { question_number: 3, skill: "detail_comprehension", question_text: "What did the maintenance technician say was causing the problem?", options: { A: "A broken window", B: "Blocked ventilation pipes", C: "An aging boiler in the basement", D: "A faulty thermostat in the unit" }, correct_answer: "C" },
      { question_number: 4, skill: "detail_comprehension", question_text: "What happened after each maintenance visit?", options: { A: "The radiator was permanently fixed", B: "The radiator worked briefly and then stopped again", C: "James received a rent credit", D: "A new radiator was installed" }, correct_answer: "B" },
      { question_number: 5, skill: "inference", question_text: "Why does James mention his daughter's health?", options: { A: "To ask the landlord to pay her medical bills", B: "To show that the heating problem is causing real harm to his family", C: "To explain why he cannot pay rent this month", D: "To request a transfer to a warmer unit" }, correct_answer: "B" },
      { question_number: 6, skill: "inference", question_text: "What is James implying by mentioning the Landlord and Tenant Board?", options: { A: "He plans to move out immediately", B: "He has already filed a complaint", C: "He will take formal action if the problem is not fixed soon", D: "He wants to become a member of the board" }, correct_answer: "C" }
    ],
    fill_in_blank_response: {
      instructions: "Now read the response from the property manager. Complete the response by filling in the blanks. Choose the best option for each blank.",
      response_text: "Dear Mr. O'Brien,\n\nThank you for bringing this matter to our attention again, and please accept my [BLANK_7] for the ongoing inconvenience. I understand how frustrating it must be, especially with a young child at home.\n\nAfter reviewing the maintenance reports from December and January, I agree that the temporary repairs have not been [BLANK_8]. I have authorized the replacement of the basement boiler, and our contractor has confirmed that the work can begin this Thursday. The installation is expected to take two to three days, during which we will provide [BLANK_9] space heaters for your unit at no charge.\n\nI have also arranged for a building inspector to [BLANK_10] the heating system once the new boiler is in place to ensure everything meets city standards. You will receive a written confirmation of the completion date by email.\n\nPlease do not hesitate to call me directly if you have any further [BLANK_11]. I want to make sure your family is comfortable.\n\nSincerely,\nDiane Foster\nSunrise Property Management",
      blanks: [
        { blank_number: 7, options: { A: "congratulations", B: "invoice", C: "apologies", D: "resignation" }, correct_answer: "C" },
        { blank_number: 8, options: { A: "expensive", B: "sufficient", C: "invisible", D: "popular" }, correct_answer: "B" },
        { blank_number: 9, options: { A: "permanent", B: "decorative", C: "portable", D: "industrial" }, correct_answer: "C" },
        { blank_number: 10, options: { A: "demolish", B: "ignore", C: "photograph", D: "inspect" }, correct_answer: "D" },
        { blank_number: 11, options: { A: "concerns", B: "payments", C: "hobbies", D: "recipes" }, correct_answer: "A" }
      ]
    }
  },
  {
    set_number: 8,
    difficulty: "easy",
    title: "Farewell Lunch Invitation for a Coworker",
    passage: {
      type: "email",
      from: "Rachel Kim",
      to: "Marketing Team",
      subject: "Farewell Lunch for Kevin — Friday, March 14",
      body: "Hi everyone,\n\nAs most of you know, Kevin Chandra's last day at Horizon Media will be next Friday, March 14. After five wonderful years on our team, Kevin is moving to Calgary to be closer to his family. We will miss him greatly!\n\nTo send him off properly, I am organizing a farewell lunch at Trattoria on King Street. The reservation is for 12:30 p.m., and I have booked the back room so we can have some privacy. The restaurant offers a set lunch menu for $22 per person, which includes an appetizer, main course, and coffee or tea.\n\nI am also collecting contributions for a goodbye gift. If you would like to chip in, please send me $10 by e-transfer or bring cash to my desk by Wednesday. I am planning to get him a gift card to his favourite outdoor gear store.\n\nPlease let me know by Tuesday if you can make it so I can confirm the headcount with the restaurant.\n\nThanks!\nRachel"
    },
    mcq_questions: [
      { question_number: 1, skill: "writer_purpose", question_text: "Why is Rachel writing this email?", options: { A: "To announce a team meeting", B: "To organize Kevin's farewell lunch", C: "To invite the team to a birthday party", D: "To ask for help with a project" }, correct_answer: "B" },
      { question_number: 2, skill: "detail_comprehension", question_text: "Why is Kevin leaving the company?", options: { A: "He was offered a promotion elsewhere", B: "He is retiring after a long career", C: "He is moving to Calgary to be near family", D: "He is unhappy with his current role" }, correct_answer: "C" },
      { question_number: 3, skill: "detail_comprehension", question_text: "How much does the set lunch cost per person?", options: { A: "$10", B: "$15", C: "$22", D: "$30" }, correct_answer: "C" },
      { question_number: 4, skill: "detail_comprehension", question_text: "What gift does Rachel plan to buy?", options: { A: "A watch", B: "A gift card to an outdoor gear store", C: "A book about Calgary", D: "A framed team photo" }, correct_answer: "B" },
      { question_number: 5, skill: "inference", question_text: "Why did Rachel book the back room?", options: { A: "It is cheaper than the main dining area", B: "So the group can celebrate privately", C: "Kevin requested it", D: "The restaurant requires it for large groups" }, correct_answer: "B" },
      { question_number: 6, skill: "tone_and_register", question_text: "What is the tone of Rachel's email?", options: { A: "Sad and formal", B: "Friendly and organized", C: "Urgent and serious", D: "Neutral and impersonal" }, correct_answer: "B" }
    ],
    fill_in_blank_response: {
      instructions: "Now read a colleague's reply to Rachel. Complete the reply by filling in the blanks. Choose the best option for each blank.",
      response_text: "Hi Rachel,\n\nThanks for putting this together — Kevin definitely [BLANK_7] a proper send-off. Count me in for Friday! I love Trattoria, so that is a great choice.\n\nI will send you $10 by e-transfer tonight for the gift. An outdoor gear card is a perfect idea since Kevin is always talking about his [BLANK_8] trips. Maybe we can also sign a card? I feel like a group message would be a nice personal [BLANK_9].\n\nOne quick question — is parking available near the restaurant, or should I plan to take the [BLANK_10]? I do not want to be late trying to find a spot.\n\nIt is hard to believe Kevin has been here for five years already. He has been such a great [BLANK_11] to work with. Calgary is lucky to have him!\n\nSee you Friday,\nTom",
      blanks: [
        { blank_number: 7, options: { A: "avoids", B: "deserves", C: "dislikes", D: "delays" }, correct_answer: "B" },
        { blank_number: 8, options: { A: "business", B: "cooking", C: "camping", D: "reading" }, correct_answer: "C" },
        { blank_number: 9, options: { A: "expense", B: "problem", C: "touch", D: "burden" }, correct_answer: "C" },
        { blank_number: 10, options: { A: "highway", B: "subway", C: "elevator", D: "ferry" }, correct_answer: "B" },
        { blank_number: 11, options: { A: "challenge", B: "stranger", C: "colleague", D: "competitor" }, correct_answer: "C" }
      ]
    }
  },
  {
    set_number: 9,
    difficulty: "intermediate",
    title: "Employee Request for Modified Work Schedule",
    passage: {
      type: "email",
      from: "Ahmed Hassan",
      to: "Human Resources Department, Clearview Financial Group",
      subject: "Request for Modified Work Hours — Effective April 1",
      body: "Dear HR Team,\n\nI am writing to formally request a modification to my daily work schedule, beginning April 1, if possible. I have been with Clearview Financial for four years and currently work the standard hours of 9:00 a.m. to 5:00 p.m., Monday through Friday.\n\nMy wife recently accepted a nursing position with shifts that start at 7:00 a.m. This means that I will now be the one responsible for dropping our three-year-old daughter off at daycare each morning. The daycare opens at 7:30 a.m., but it takes me approximately 40 minutes to drive from there to the office during rush hour. As a result, I would not be able to arrive before 9:15 most mornings.\n\nI would like to propose starting my workday at 8:30 a.m. and finishing at 4:30 p.m. This half-hour shift would allow me to drop off my daughter on time and still complete a full eight-hour day. I have discussed this arrangement with my supervisor, David Liu, who has indicated that he is supportive as long as HR approves it.\n\nI want to emphasize that this change would not affect my productivity or availability for team meetings, which typically begin at 10:00 a.m. I am committed to maintaining the same level of performance that I have always brought to my role.\n\nThank you for considering this request. I am happy to discuss it further at your convenience.\n\nBest regards,\nAhmed Hassan"
    },
    mcq_questions: [
      { question_number: 1, skill: "writer_purpose", question_text: "What is the main reason Ahmed is writing this email?", options: { A: "To request a salary increase", B: "To ask for a change in his daily work hours", C: "To report a problem with his supervisor", D: "To resign from his position" }, correct_answer: "B" },
      { question_number: 2, skill: "detail_comprehension", question_text: "Why has Ahmed's morning routine changed?", options: { A: "He moved to a new neighbourhood", B: "His daughter started elementary school", C: "His wife took a job with early morning shifts", D: "The office relocated to a different building" }, correct_answer: "C" },
      { question_number: 3, skill: "detail_comprehension", question_text: "What schedule does Ahmed propose?", options: { A: "8:00 a.m. to 4:00 p.m.", B: "8:30 a.m. to 4:30 p.m.", C: "9:30 a.m. to 5:30 p.m.", D: "10:00 a.m. to 6:00 p.m." }, correct_answer: "B" },
      { question_number: 4, skill: "detail_comprehension", question_text: "What has Ahmed's supervisor said about the request?", options: { A: "He has rejected it outright", B: "He supports it if HR approves", C: "He wants Ahmed to work from home instead", D: "He has not yet been told about it" }, correct_answer: "B" },
      { question_number: 5, skill: "inference", question_text: "Why does Ahmed mention that team meetings start at 10:00 a.m.?", options: { A: "To suggest the meetings should be rescheduled", B: "To show that his proposed schedule would not cause conflicts", C: "To complain that meetings are too early", D: "To ask for fewer meetings" }, correct_answer: "B" },
      { question_number: 6, skill: "tone_and_register", question_text: "Which word best describes Ahmed's approach in this email?", options: { A: "Apologetic", B: "Aggressive", C: "Professional", D: "Indifferent" }, correct_answer: "C" }
    ],
    fill_in_blank_response: {
      instructions: "Now read HR's response to Ahmed. Complete the response by filling in the blanks. Choose the best option for each blank.",
      response_text: "Dear Ahmed,\n\nThank you for your request regarding a modified work schedule. We appreciate you [BLANK_7] this matter with your supervisor before reaching out to us.\n\nAfter reviewing your proposal, I am pleased to confirm that your request has been [BLANK_8]. Starting April 1, your work hours will officially change to 8:30 a.m. to 4:30 p.m. This arrangement will be reviewed after a three-month [BLANK_9] period to ensure it continues to work well for both you and the team.\n\nPlease note that all employees on modified schedules are expected to remain [BLANK_10] by phone and email during core business hours, which are 10:00 a.m. to 3:00 p.m. If you need to be away during those hours for any reason, standard leave procedures apply.\n\nWe value your dedication over the past four years and are happy to [BLANK_11] your family needs wherever possible. Please feel free to contact me with any questions.\n\nBest regards,\nNatalie Park\nHR Coordinator",
      blanks: [
        { blank_number: 7, options: { A: "hiding", B: "discussing", C: "ignoring", D: "denying" }, correct_answer: "B" },
        { blank_number: 8, options: { A: "denied", B: "delayed", C: "approved", D: "cancelled" }, correct_answer: "C" },
        { blank_number: 9, options: { A: "hiring", B: "trial", C: "vacation", D: "penalty" }, correct_answer: "B" },
        { blank_number: 10, options: { A: "invisible", B: "absent", C: "reachable", D: "promoted" }, correct_answer: "C" },
        { blank_number: 11, options: { A: "accommodate", B: "overlook", C: "dismiss", D: "complicate" }, correct_answer: "A" }
      ]
    }
  },
  {
    set_number: 10,
    difficulty: "advanced",
    title: "Formal Complaint About a Home Renovation",
    passage: {
      type: "email",
      from: "Catherine Dubois",
      to: "Customer Relations, GreenBuild Renovations Inc.",
      subject: "Formal Complaint — Kitchen Renovation, Contract #GBR-2024-1187",
      body: "Dear Customer Relations Department,\n\nI am writing to formally document my dissatisfaction with the kitchen renovation project currently being carried out at my home (Contract #GBR-2024-1187). What was presented as a straightforward four-week job has now stretched into its ninth week, with significant deficiencies in both workmanship and communication.\n\nThe tile work behind the stove is visibly uneven, with grout lines that vary in width by as much as five millimetres. When I raised this with the site foreman, Mr. Garrett, he dismissed my concern by saying it would 'look fine once the backsplash dries.' I subsequently had an independent contractor assess the work, and he confirmed that the tiles would need to be removed and re-laid.\n\nMore troubling is the countertop issue. The contract clearly specifies Calacatta quartz, yet the material installed is a lower-grade marble that chips easily and requires regular sealing — a significant downgrade that was never discussed with me. When I contacted your office about this, I was told the substitution was made because the specified material was 'backordered,' but no one sought my approval or offered alternatives.\n\nAdditionally, the crew has consistently left debris, open paint cans, and tools scattered across my backyard, raising safety concerns. My neighbour's child stepped on a loose nail near my fence line last week, fortunately without serious injury.\n\nI am requesting a detailed remediation plan within seven business days, including a timeline for correcting the tile work, replacing the countertop with the specified material, and cleaning the work site daily going forward. Should these issues not be addressed satisfactorily, I intend to file a complaint with the Ontario Ministry of Public and Business Service Delivery and seek cost recovery through Small Claims Court.\n\nSincerely,\nCatherine Dubois"
    },
    mcq_questions: [
      { question_number: 1, skill: "writer_purpose", question_text: "What is the primary purpose of Catherine's email?", options: { A: "To request an extension to the renovation timeline", B: "To formally document deficiencies and demand corrections", C: "To compliment the foreman on his work", D: "To cancel the renovation contract entirely" }, correct_answer: "B" },
      { question_number: 2, skill: "detail_comprehension", question_text: "How long was the renovation originally supposed to take?", options: { A: "Two weeks", B: "Four weeks", C: "Nine weeks", D: "Three months" }, correct_answer: "B" },
      { question_number: 3, skill: "detail_comprehension", question_text: "What did the independent contractor say about the tile work?", options: { A: "It was acceptable", B: "It needed minor touch-ups", C: "The tiles would need to be removed and redone", D: "It was the best he had seen" }, correct_answer: "C" },
      { question_number: 4, skill: "detail_comprehension", question_text: "Why was the countertop material changed?", options: { A: "Catherine requested a cheaper option", B: "The original material was backordered and GreenBuild substituted without approval", C: "Marble was higher quality than quartz", D: "The contract did not specify a material" }, correct_answer: "B" },
      { question_number: 5, skill: "inference", question_text: "Why does Catherine mention the neighbour's child stepping on a nail?", options: { A: "To suggest the renovation is too noisy", B: "To illustrate the serious safety risks of the messy work site", C: "To ask GreenBuild to pay for medical treatment", D: "To recommend a different contractor" }, correct_answer: "B" },
      { question_number: 6, skill: "inference", question_text: "What can be inferred about Catherine's next steps if GreenBuild does not respond?", options: { A: "She will accept the current work as finished", B: "She will hire GreenBuild for future projects", C: "She will pursue government complaint channels and legal action", D: "She will renovate the kitchen herself" }, correct_answer: "C" }
    ],
    fill_in_blank_response: {
      instructions: "Now read GreenBuild's response to Catherine. Complete the response by filling in the blanks. Choose the best option for each blank.",
      response_text: "Dear Ms. Dubois,\n\nThank you for your detailed correspondence regarding Contract #GBR-2024-1187. I have reviewed each of your concerns with our operations team, and I want to assure you that we take these matters [BLANK_7].\n\nFirst, regarding the tile work: I have examined the photographs you attached and agree that the installation does not meet our quality [BLANK_8]. We will schedule a crew to remove and re-lay the affected tiles at no additional cost to you, beginning no later than next Monday.\n\nSecond, I must sincerely apologize for the countertop substitution. The decision to install an alternative material without your [BLANK_9] was a clear violation of our company policy. We have already ordered the Calacatta quartz specified in your contract and expect it to arrive within ten business days.\n\nFinally, I have reminded all crew members of our strict site-cleanup protocol. A supervisor will now conduct end-of-day inspections to ensure compliance. The safety of your family and neighbours is not something we are willing to [BLANK_10].\n\nI will personally oversee the remaining work to ensure it is completed to your [BLANK_11]. Please feel free to contact me directly at the number below.\n\nWith sincere apologies,\nAndrew Carr\nPresident, GreenBuild Renovations Inc.",
      blanks: [
        { blank_number: 7, options: { A: "lightly", B: "personally", C: "seriously", D: "humorously" }, correct_answer: "C" },
        { blank_number: 8, options: { A: "standards", B: "discounts", C: "prices", D: "brochures" }, correct_answer: "A" },
        { blank_number: 9, options: { A: "payment", B: "approval", C: "complaint", D: "address" }, correct_answer: "B" },
        { blank_number: 10, options: { A: "publicize", B: "improve", C: "compromise", D: "celebrate" }, correct_answer: "C" },
        { blank_number: 11, options: { A: "amusement", B: "confusion", C: "schedule", D: "satisfaction" }, correct_answer: "D" }
      ]
    }
  },
  {
    set_number: 11,
    difficulty: "intermediate",
    title: "Apology for a Festival Postponement",
    passage: {
      type: "email",
      from: "Derek Singh, Festival Director",
      to: "Registered Attendees — Autumn Harvest Festival",
      subject: "Important Update: Festival Postponed to November 9",
      body: "Dear Festival Guests,\n\nIt is with great regret that I must inform you of the postponement of the Autumn Harvest Festival, originally scheduled for this Saturday, October 26. Due to a severe weather warning issued by Environment Canada — with heavy rain, strong winds, and potential flooding expected throughout the weekend — we have made the difficult decision to move the event to Saturday, November 9.\n\nThe safety of our guests, vendors, and volunteer staff is our top priority, and we simply cannot risk holding an outdoor event under these conditions. The main stage, food court, and children's activity zone are all open-air areas with limited shelter, and setting up in high winds would put our team at risk.\n\nI know this is disappointing. Many of you have been looking forward to the pumpkin carving contest, the live bluegrass performances, and the local cider tasting — and so have we. I want to assure you that every activity on the original program will be offered on November 9, and we are adding a bonus attraction: a farm-to-table cooking demonstration by Chef Alicia Fontaine.\n\nAll tickets remain valid for the new date. If you are unable to attend on November 9, you may request a full refund through our website by October 31. We have also extended the early bird discount for an additional week for anyone who would like to bring a friend.\n\nThank you for your understanding, and I sincerely apologize for the inconvenience.\n\nWarm regards,\nDerek Singh"
    },
    mcq_questions: [
      { question_number: 1, skill: "writer_purpose", question_text: "What is the main purpose of Derek's email?", options: { A: "To announce the cancellation of the festival permanently", B: "To inform attendees that the festival has been moved to a new date", C: "To advertise a cooking demonstration", D: "To request more volunteers for the event" }, correct_answer: "B" },
      { question_number: 2, skill: "detail_comprehension", question_text: "What is the primary reason for the postponement?", options: { A: "Low ticket sales", B: "A scheduling conflict with another event", C: "A severe weather warning from Environment Canada", D: "The main stage collapsed during setup" }, correct_answer: "C" },
      { question_number: 3, skill: "detail_comprehension", question_text: "What bonus attraction has been added to the rescheduled event?", options: { A: "A fireworks display", B: "A farm-to-table cooking demonstration", C: "Free cider for all attendees", D: "An extra day of performances" }, correct_answer: "B" },
      { question_number: 4, skill: "detail_comprehension", question_text: "By what date must refund requests be submitted?", options: { A: "October 26", B: "October 31", C: "November 1", D: "November 9" }, correct_answer: "B" },
      { question_number: 5, skill: "inference", question_text: "Why does Derek mention specific activities like pumpkin carving and cider tasting?", options: { A: "To remind people what they are paying for so they do not ask for refunds", B: "To acknowledge what attendees are missing and show the event is still worth attending", C: "To describe new activities that were not on the original schedule", D: "To explain why those activities are being removed" }, correct_answer: "B" },
      { question_number: 6, skill: "tone_and_register", question_text: "How would you describe Derek's tone in this email?", options: { A: "Impersonal and bureaucratic", B: "Defensive and unapproetic", C: "Regretful but reassuring", D: "Excited and celebratory" }, correct_answer: "C" }
    ],
    fill_in_blank_response: {
      instructions: "Now read a reply from an attendee. Complete the reply by filling in the blanks. Choose the best option for each blank.",
      response_text: "Hi Derek,\n\nThank you for the [BLANK_7] about the Autumn Harvest Festival. I understand the decision completely — safety should always come first, and it sounds like the weather forecast leaves no room for [BLANK_8].\n\nHappily, November 9 works for our family, so we will keep our tickets. My kids were a bit disappointed at first, but when I told them about the cooking [BLANK_9] with Chef Fontaine, they got excited all over again.\n\nI also appreciate you extending the early bird discount. I have already forwarded your email to a couple of friends who were on the [BLANK_10] about buying tickets. Hopefully they will join us now.\n\nThank you for handling this so [BLANK_11]. We know it is not easy to reschedule something this big.\n\nBest,\nKaren",
      blanks: [
        { blank_number: 7, options: { A: "refund", B: "update", C: "complaint", D: "invoice" }, correct_answer: "B" },
        { blank_number: 8, options: { A: "doubt", B: "profit", C: "celebration", D: "error" }, correct_answer: "A" },
        { blank_number: 9, options: { A: "cancellation", B: "disaster", C: "demonstration", D: "experiment" }, correct_answer: "C" },
        { blank_number: 10, options: { A: "edge", B: "fence", C: "roof", D: "floor" }, correct_answer: "B" },
        { blank_number: 11, options: { A: "secretly", B: "carelessly", C: "transparently", D: "reluctantly" }, correct_answer: "C" }
      ]
    }
  },
  {
    set_number: 12,
    difficulty: "easy",
    title: "Newcomer Inquiry About English Classes",
    passage: {
      type: "email",
      from: "Maria Santos",
      to: "Pinecrest Settlement Services Centre",
      subject: "Information About English Language Programs",
      body: "Dear Pinecrest Centre,\n\nMy name is Maria Santos, and I arrived in Canada from Brazil four months ago. I live in the Scarborough area of Toronto with my husband and our two young children.\n\nI studied some English in school, but I find it difficult to have conversations in everyday situations such as visiting the doctor, speaking to my children's teachers, or shopping at the grocery store. I would like to take English classes to improve my speaking and listening skills.\n\nCould you please let me know what programs you offer for newcomers at my level? I am especially interested in classes that focus on practical, everyday English rather than academic writing. I am available on weekday mornings while my children are at school.\n\nI also want to ask whether childcare is available during classes. My younger son is two years old and is not yet in daycare. If childcare is offered, I may be able to attend afternoon sessions as well.\n\nThank you very much for your help. I am looking forward to hearing from you.\n\nSincerely,\nMaria Santos"
    },
    mcq_questions: [
      { question_number: 1, skill: "writer_purpose", question_text: "Why is Maria writing this email?", options: { A: "To apply for a job at the settlement centre", B: "To ask about English classes for newcomers", C: "To register her children for school", D: "To complain about a service she received" }, correct_answer: "B" },
      { question_number: 2, skill: "detail_comprehension", question_text: "How long has Maria been in Canada?", options: { A: "Two months", B: "Four months", C: "One year", D: "Two years" }, correct_answer: "B" },
      { question_number: 3, skill: "detail_comprehension", question_text: "What kind of English does Maria want to focus on?", options: { A: "Academic writing", B: "Business English", C: "Practical, everyday conversation", D: "Legal terminology" }, correct_answer: "C" },
      { question_number: 4, skill: "detail_comprehension", question_text: "Why is Maria asking about childcare?", options: { A: "She wants a job as a childcare worker", B: "She needs someone to watch her two-year-old during class", C: "Her older child does not have a school", D: "She runs a home daycare" }, correct_answer: "B" },
      { question_number: 5, skill: "inference", question_text: "What can be inferred about Maria's current English level?", options: { A: "She is completely fluent", B: "She has some basics but struggles with real-life conversations", C: "She has never studied English before", D: "She speaks English at a professional level" }, correct_answer: "B" },
      { question_number: 6, skill: "tone_and_register", question_text: "How would you describe Maria's tone?", options: { A: "Impatient and demanding", B: "Confident and assertive", C: "Polite and hopeful", D: "Formal and distant" }, correct_answer: "C" }
    ],
    fill_in_blank_response: {
      instructions: "Now read the reply from the settlement centre. Complete the reply by filling in the blanks. Choose the best option for each blank.",
      response_text: "Dear Maria,\n\nThank you for contacting us, and welcome to Canada! We are happy to help you find the right English [BLANK_7] for your needs.\n\nBased on your description, our LINC (Language Instruction for Newcomers to Canada) program at the CLB 3–4 level would be a great [BLANK_8]. These classes focus on everyday communication skills — such as making appointments, talking to teachers, and understanding public notices — exactly what you described.\n\nMorning classes run Monday to Thursday from 9:30 a.m. to 12:00 p.m. We do offer free on-site childcare for children under four, so your younger son would be [BLANK_9] while you are in class.\n\nTo get started, you will need to complete a language [BLANK_10] at our centre so we can place you in the right level. Assessments are available every Tuesday morning. Please bring your permanent resident card or other immigration documents.\n\nWe look forward to [BLANK_11] you soon!\n\nWarm regards,\nJasmine Ali\nProgram Coordinator, Pinecrest Settlement Services",
      blanks: [
        { blank_number: 7, options: { A: "exam", B: "bill", C: "program", D: "complaint" }, correct_answer: "C" },
        { blank_number: 8, options: { A: "problem", B: "fit", C: "risk", D: "burden" }, correct_answer: "B" },
        { blank_number: 9, options: { A: "enrolled", B: "ignored", C: "tested", D: "welcome" }, correct_answer: "D" },
        { blank_number: 10, options: { A: "assessment", B: "vacation", C: "punishment", D: "rejection" }, correct_answer: "A" },
        { blank_number: 11, options: { A: "billing", B: "correcting", C: "meeting", D: "declining" }, correct_answer: "C" }
      ]
    }
  },
  {
    set_number: 13,
    difficulty: "advanced",
    title: "Professional Reference for a Social Worker",
    passage: {
      type: "email",
      from: "Dr. Susan Webb, Clinical Director — Harbourview Mental Health Services",
      to: "Hiring Committee, Riverside Health Centre",
      subject: "Professional Reference — Karen Liu, MSW, RSW",
      body: "Dear Hiring Committee,\n\nI am writing in response to your request for a professional reference for Karen Liu, who has applied for the Social Worker position at Riverside Health Centre. Karen worked under my supervision at Harbourview Mental Health Services for four years, from 2020 to 2024, and I can provide an unqualified endorsement of her clinical abilities and professional character.\n\nDuring her time at Harbourview, Karen managed a caseload of approximately 35 to 40 clients, many of whom presented with complex, co-occurring conditions including severe anxiety disorders, substance use, and trauma histories. She consistently demonstrated the ability to build therapeutic rapport quickly, even with clients who had previously disengaged from services. Her documentation was thorough, timely, and reflective of sound clinical reasoning.\n\nOne area where Karen particularly excelled was interdisciplinary collaboration. She worked closely with psychiatrists, occupational therapists, and community outreach workers to develop integrated care plans, and she frequently took the lead in coordinating case conferences. Her colleagues often noted that she elevated the quality of discussion by asking precise, client-centred questions that kept the team focused on outcomes rather than process.\n\nKaren also showed exceptional composure in crisis situations. On more than one occasion, she de-escalated volatile encounters in the walk-in intake area with a combination of calm authority and genuine empathy. Following one particularly difficult incident involving a client in acute psychosis, Karen developed a revised safety protocol for the intake team that was adopted agency-wide.\n\nI consider Karen to be among the top five social workers I have supervised in my career. She would be a significant asset to your team, and I am confident she will bring the same dedication and professionalism to Riverside that she demonstrated here.\n\nPlease do not hesitate to contact me if you require any further information.\n\nSincerely,\nDr. Susan Webb, PhD, RSW"
    },
    mcq_questions: [
      { question_number: 1, skill: "writer_purpose", question_text: "What is the primary purpose of this email?", options: { A: "To provide a professional reference for a job applicant", B: "To report a workplace incident", C: "To request a meeting with the hiring committee", D: "To announce a new safety protocol" }, correct_answer: "A" },
      { question_number: 2, skill: "detail_comprehension", question_text: "How many clients did Karen typically manage at one time?", options: { A: "10 to 15", B: "20 to 25", C: "35 to 40", D: "Over 50" }, correct_answer: "C" },
      { question_number: 3, skill: "detail_comprehension", question_text: "What kind of protocol did Karen develop?", options: { A: "A training manual for new hires", B: "A client intake questionnaire", C: "A revised safety protocol for the intake team", D: "A medication management guide" }, correct_answer: "C" },
      { question_number: 4, skill: "inference", question_text: "What does Dr. Webb mean by saying Karen 'elevated the quality of discussion' in case conferences?", options: { A: "Karen spoke the most during meetings", B: "Karen helped the team stay focused and make better decisions", C: "Karen disagreed with her colleagues frequently", D: "Karen prepared all conference materials alone" }, correct_answer: "B" },
      { question_number: 5, skill: "detail_comprehension", question_text: "What is notable about Karen's ability with difficult clients?", options: { A: "She transferred them to other workers", B: "She avoided seeing clients with complex needs", C: "She built rapport quickly, even with disengaged clients", D: "She only worked with mild cases" }, correct_answer: "C" },
      { question_number: 6, skill: "vocabulary_in_context", question_text: "What does 'unqualified endorsement' most likely mean in this context?", options: { A: "An endorsement written by someone without qualifications", B: "A complete and unreserved recommendation", C: "A recommendation with several conditions attached", D: "A brief and informal opinion" }, correct_answer: "B" }
    ],
    fill_in_blank_response: {
      instructions: "Now read the hiring committee's reply to Dr. Webb. Complete the reply by filling in the blanks. Choose the best option for each blank.",
      response_text: "Dear Dr. Webb,\n\nThank you for your exceptionally thorough reference for Karen Liu. Your insights into her clinical skills and professional [BLANK_7] have been very helpful to our committee.\n\nWe were particularly impressed by your description of her crisis [BLANK_8] skills and her initiative in developing a new safety protocol. These are qualities we value highly at Riverside, where our team handles a significant volume of intake and emergency cases.\n\nBased on the strength of her application and your recommendation, we would like to [BLANK_9] Karen for an interview panel next week. We will contact her directly with scheduling details.\n\nShould we require any [BLANK_10] information during the evaluation process, we will reach out to you again. We greatly appreciate the time and care you put into this reference — it is clear that Karen made a lasting [BLANK_11] during her years at Harbourview.\n\nWith thanks,\nDr. Nadia Osman\nChair, Hiring Committee — Riverside Health Centre",
      blanks: [
        { blank_number: 7, options: { A: "weaknesses", B: "conduct", C: "expenses", D: "vacations" }, correct_answer: "B" },
        { blank_number: 8, options: { A: "avoidance", B: "creation", C: "management", D: "celebration" }, correct_answer: "C" },
        { blank_number: 9, options: { A: "reject", B: "invite", C: "warn", D: "dismiss" }, correct_answer: "B" },
        { blank_number: 10, options: { A: "additional", B: "false", C: "irrelevant", D: "classified" }, correct_answer: "A" },
        { blank_number: 11, options: { A: "mess", B: "threat", C: "impression", D: "complaint" }, correct_answer: "C" }
      ]
    }
  },
  {
    set_number: 14,
    difficulty: "intermediate",
    title: "Request for a Traffic Safety Measure",
    passage: {
      type: "email",
      from: "Paul Andrews",
      to: "City of Burlington — Traffic Safety Division",
      subject: "Request for Speed Bumps on Willow Street",
      body: "Dear Traffic Safety Division,\n\nI am writing on behalf of the residents of Willow Street to request the installation of speed bumps or an additional stop sign on our street. We have become increasingly concerned about vehicle speeds in our neighbourhood, particularly during school drop-off and pick-up hours.\n\nWillow Street runs directly past Lakeview Elementary School and has no traffic calming measures between Pine Avenue and the school entrance — a distance of roughly 400 metres. Despite the posted 40 km/h speed limit, many vehicles travel well above this during the morning rush. Last month, a child on a bicycle was nearly struck by a speeding van while crossing at the school crosswalk. Fortunately, the child's parent pulled him back just in time.\n\nI have circulated a petition among our neighbours and collected 34 signatures from households on Willow Street and the surrounding blocks, all supporting the installation of speed bumps. The petition is attached to this email.\n\nWe are not asking for a major infrastructure project — just two or three well-placed speed bumps between Pine Avenue and the school would make a meaningful difference. We would also welcome a community meeting with your team to discuss other options, such as a flashing speed sign or additional crosswalk markings.\n\nThank you for considering our request. Our children's safety is our primary concern.\n\nSincerely,\nPaul Andrews\nWillow Street"
    },
    mcq_questions: [
      { question_number: 1, skill: "writer_purpose", question_text: "Why is Paul writing this email?", options: { A: "To report a traffic accident", B: "To request traffic calming measures near a school", C: "To object to a new road construction project", D: "To apply for a crossing guard position" }, correct_answer: "B" },
      { question_number: 2, skill: "detail_comprehension", question_text: "What is the speed limit on Willow Street?", options: { A: "30 km/h", B: "40 km/h", C: "50 km/h", D: "60 km/h" }, correct_answer: "B" },
      { question_number: 3, skill: "detail_comprehension", question_text: "What near-accident occurred recently?", options: { A: "A school bus ran a red light", B: "A child on a bicycle was nearly hit by a speeding van", C: "Two cars collided at the intersection", D: "A pedestrian fell on the sidewalk" }, correct_answer: "B" },
      { question_number: 4, skill: "detail_comprehension", question_text: "How many signatures did Paul collect?", options: { A: "15", B: "23", C: "34", D: "50" }, correct_answer: "C" },
      { question_number: 5, skill: "inference", question_text: "Why does Paul say 'We are not asking for a major infrastructure project'?", options: { A: "To suggest that he does not care about the issue deeply", B: "To show the request is modest and reasonable", C: "To discourage the city from doing more than speed bumps", D: "To imply that the city wastes money on large projects" }, correct_answer: "B" },
      { question_number: 6, skill: "inference", question_text: "What is the effect of Paul mentioning the near-accident involving a child?", options: { A: "It shows he is exaggerating the problem", B: "It proves that the speed limit should be lowered to 20 km/h", C: "It gives a concrete example that makes the safety concern urgent", D: "It suggests that the school should move to a safer location" }, correct_answer: "C" }
    ],
    fill_in_blank_response: {
      instructions: "Now read the city's response to Paul. Complete the response by filling in the blanks. Choose the best option for each blank.",
      response_text: "Dear Mr. Andrews,\n\nThank you for writing to us about traffic safety on Willow Street. We take concerns related to school zones very [BLANK_7], and I appreciate you taking the time to organize a petition from your neighbours.\n\nAfter reviewing your request, I can confirm that Willow Street has been added to our list of priority locations for a traffic [BLANK_8]. A team from our division will visit the area next week to collect speed data, observe traffic patterns during school hours, and assess the roadway for suitable speed bump [BLANK_9].\n\nOnce the study is complete — typically within three to four weeks — we will share the results with you and [BLANK_10] our recommendations. If speed bumps are warranted, we can usually begin installation within two months of approval.\n\nI would also be happy to arrange the community meeting you [BLANK_11]. I will follow up with some possible dates early next week.\n\nBest regards,\nSusan Lam\nTraffic Safety Coordinator, City of Burlington",
      blanks: [
        { blank_number: 7, options: { A: "lightly", B: "secretly", C: "seriously", D: "slowly" }, correct_answer: "C" },
        { blank_number: 8, options: { A: "accident", B: "study", C: "violation", D: "lane" }, correct_answer: "B" },
        { blank_number: 9, options: { A: "removal", B: "criticism", C: "placement", D: "rejection" }, correct_answer: "C" },
        { blank_number: 10, options: { A: "hide", B: "present", C: "withdraw", D: "block" }, correct_answer: "B" },
        { blank_number: 11, options: { A: "rejected", B: "cancelled", C: "avoided", D: "suggested" }, correct_answer: "D" }
      ]
    }
  },
  {
    set_number: 15,
    difficulty: "advanced",
    title: "Condo Owner Protests a Special Assessment",
    passage: {
      type: "email",
      from: "Natasha Volkov, Unit 1204",
      to: "Board of Directors, Lakeshore Terrace Condominium Corporation",
      subject: "Objection to Special Assessment — Resolution 2024-07",
      body: "Dear Board of Directors,\n\nI am writing to formally object to the special assessment of $15,000 per unit approved under Resolution 2024-07 at last month's board meeting. While I understand that the lobby renovation is intended to improve the building's appearance and property values, I have serious concerns about the process by which this decision was made, the scope of the proposed work, and the financial burden it places on owners.\n\nFirst, the notice of the meeting at which this resolution was passed was sent just ten days in advance, giving owners insufficient time to review the renovation proposal, obtain independent cost estimates, or organize a meaningful discussion. Under the Condominium Act, matters involving a special assessment of this magnitude should, in my view, require a broader consultation process, including a town hall meeting open to all owners.\n\nSecond, the proposed budget of $1.2 million for a lobby renovation appears excessive. I have spoken with two licensed contractors who estimate that comparable work — new flooring, lighting, and furniture — could be completed for approximately $650,000 to $800,000. The board has not provided a breakdown of costs, nor has it indicated whether competitive bids were solicited. Transparency on this point is essential.\n\nThird, many owners in this building are retirees on fixed incomes. A $15,000 lump-sum payment with only 60 days' notice creates genuine financial hardship. I would urge the board to consider alternatives such as a phased payment plan over 12 months, a scaled-back renovation focusing on safety-critical items first, or the use of reserve fund contributions to offset part of the cost.\n\nI request that the board table Resolution 2024-07, schedule a town hall meeting within 30 days, and provide a full cost breakdown and evidence of competitive bidding before proceeding. I reserve the right to bring this matter before the Condominium Authority Tribunal if my concerns are not addressed.\n\nSincerely,\nNatasha Volkov"
    },
    mcq_questions: [
      { question_number: 1, skill: "writer_purpose", question_text: "What is Natasha's main purpose in writing this email?", options: { A: "To volunteer for the renovation committee", B: "To object to a special assessment and request changes to the process", C: "To propose a completely different renovation plan", D: "To resign from the condo board" }, correct_answer: "B" },
      { question_number: 2, skill: "detail_comprehension", question_text: "How much is each unit being assessed?", options: { A: "$5,000", B: "$10,000", C: "$15,000", D: "$20,000" }, correct_answer: "C" },
      { question_number: 3, skill: "detail_comprehension", question_text: "What does Natasha say about the notice period for the meeting?", options: { A: "It was more than adequate", B: "It gave owners ten days, which she feels was not enough", C: "She received no notice at all", D: "The meeting was postponed twice" }, correct_answer: "B" },
      { question_number: 4, skill: "detail_comprehension", question_text: "What do independent contractors estimate the renovation could cost?", options: { A: "$400,000 to $500,000", B: "$650,000 to $800,000", C: "$1.0 million to $1.2 million", D: "$1.5 million to $2.0 million" }, correct_answer: "B" },
      { question_number: 5, skill: "inference", question_text: "Why does Natasha mention that many owners are retirees on fixed incomes?", options: { A: "To suggest they should be exempt from the assessment", B: "To argue that the payment timeline creates genuine financial hardship", C: "To recommend that only retirees vote on the resolution", D: "To propose that the building should be sold" }, correct_answer: "B" },
      { question_number: 6, skill: "inference", question_text: "What does Natasha's mention of the Condominium Authority Tribunal imply?", options: { A: "She has already lost a case before the tribunal", B: "She believes the tribunal will automatically side with her", C: "She is prepared to pursue legal remedies if the board does not respond", D: "She works at the tribunal" }, correct_answer: "C" }
    ],
    fill_in_blank_response: {
      instructions: "Now read the board chair's response. Complete the response by filling in the blanks. Choose the best option for each blank.",
      response_text: "Dear Ms. Volkov,\n\nThank you for your detailed letter regarding Resolution 2024-07. The board takes your [BLANK_7] seriously, and I appreciate you raising several points that warrant further discussion.\n\nYou are correct that the notice period was shorter than ideal. While the ten-day notice met the minimum legal requirement under the Condominium Act, I [BLANK_8] that a matter of this financial significance deserved more lead time. We will ensure broader consultation going forward.\n\nRegarding costs, the board did receive three bids from licensed contractors. The winning bid included structural upgrades to the lobby pillars that were not part of the purely cosmetic estimates you may have [BLANK_9]. We will circulate a full cost breakdown to all owners within the next two weeks.\n\nI am also open to your suggestion of a phased payment plan. We will explore the [BLANK_10] of offering a 12-month instalment option and will include this topic on the agenda for a town hall meeting, which I am scheduling for November 15.\n\nI hope this response demonstrates our willingness to address your concerns in good [BLANK_11]. We look forward to your participation in the upcoming meeting.\n\nBest regards,\nGraham Ellis\nBoard Chair, Lakeshore Terrace Condominium Corporation",
      blanks: [
        { blank_number: 7, options: { A: "donation", B: "objections", C: "decorations", D: "payments" }, correct_answer: "B" },
        { blank_number: 8, options: { A: "deny", B: "celebrate", C: "acknowledge", D: "exaggerate" }, correct_answer: "C" },
        { blank_number: 9, options: { A: "obtained", B: "inflated", C: "rejected", D: "invented" }, correct_answer: "A" },
        { blank_number: 10, options: { A: "danger", B: "impossibility", C: "feasibility", D: "failure" }, correct_answer: "C" },
        { blank_number: 11, options: { A: "humour", B: "faith", C: "timing", D: "fortune" }, correct_answer: "B" }
      ]
    }
  }
];

existing.sets.push(...newSets);
writeFileSync('./src/data/reading/R1_correspondence.json', JSON.stringify(existing, null, 2));
console.log('R1: 15 sets written');
