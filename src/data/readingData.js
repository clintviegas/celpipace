/* ══════════════════════════════════════════════════════════════
   READING PRACTICE DATA — Proper CELPIP Format
   
   R1: Reading Correspondence (11 min) — 11 Questions
       Q1-5: MCQ  |  Q6-11: Dropdown (fill blanks)
   
   R2: Reading to Apply a Diagram (13 min) — 8 Questions
       Q1-5: Dropdown (fill blanks)  |  Q6-8: MCQ
       Includes a diagram (ASCII table/chart)
   
   R3: Reading for Information (14 min) — 9 Questions
       Q1-6: Drag & Drop (matching)  |  Q7-9: MCQ
   
   R4: Reading for Viewpoints (17 min) — 10 Questions
       Q1-7: Drag & Drop (matching)  |  Q8-10: MCQ
══════════════════════════════════════════════════════════════ */

export const READING_DATA = {
  R1: {
    partId: 'R1',
    partLabel: 'Reading Correspondence',
    icon: '\u2709\uFE0F',
    timeLimitMinutes: 11,
    totalQuestions: 11,
    passage: `From: James Whitfield <jwhitfield@greystone-apts.ca>
To: All Residents — Greystone Apartments
Date: March 18, 2026
Subject: Important Updates — Parking, Recycling & Lobby Renovation

Dear Residents,

I am writing to share three important updates that will affect everyone in the building over the coming weeks.

First, our underground parking garage will be repainted and re-lined starting April 1. The work will take approximately two weeks and will proceed one level at a time. Residents on Level P1 will need to park temporarily on Level P3 from April 1-7, and Level P2 residents will relocate to P3 from April 8-14. Temporary parking passes will be placed under your door by March 28. If you have a motorcycle or oversized vehicle, please contact me directly so we can make alternative arrangements.

Second, the city has updated its recycling guidelines effective April 15. Soft plastics (bags, wrappers, film packaging) will NO LONGER be accepted in blue bins. Instead, residents must take soft plastics to the collection depot at 440 Queen Street or use the new drop-off bin we are installing in the mail room. Please do not place soft plastics in the blue bin after April 15 — contaminated loads result in fines to the building, which are passed on through maintenance fees.

Third, our lobby renovation is on track to begin May 5. The main entrance will be closed for 3-4 weeks. During this time, please use the side entrance on Elm Street. The renovation includes new flooring, a modernized mailbox area, updated lighting, and a small parcel room for package deliveries. I know the temporary inconvenience will be worth it.

If you have any questions about these changes, please do not hesitate to reach out. I will also host a short Q&A session in the common room on March 25 at 7:00 PM.

Best regards,
James Whitfield
Property Manager, Greystone Apartments
(416) 555-0192 | jwhitfield@greystone-apts.ca`,

    questions: [
      {
        id: 'r1q1', type: 'mcq', num: 1,
        text: 'What is the main purpose of this email?',
        options: [
          'To announce an increase in maintenance fees',
          'To inform residents about upcoming building changes',
          'To invite residents to a lobby renovation party',
          'To request that residents move their vehicles permanently'
        ],
        answer: 1,
        explanation: 'The email covers three updates (parking, recycling, lobby renovation) — its main purpose is to inform residents about upcoming changes.'
      },
      {
        id: 'r1q2', type: 'mcq', num: 2,
        text: 'How long will the parking garage work take in total?',
        options: [
          'One week',
          'Approximately two weeks',
          'Three to four weeks',
          'One month'
        ],
        answer: 1,
        explanation: 'The email states: "The work will take approximately two weeks and will proceed one level at a time."'
      },
      {
        id: 'r1q3', type: 'mcq', num: 3,
        text: 'What should residents do with soft plastics after April 15?',
        options: [
          'Place them in the blue recycling bin as usual',
          'Leave them outside their apartment door for collection',
          'Take them to the depot at 440 Queen Street or use the mail room drop-off bin',
          'Throw them in the regular garbage bin'
        ],
        answer: 2,
        explanation: 'The email says soft plastics must go to "the collection depot at 440 Queen Street or use the new drop-off bin we are installing in the mail room."'
      },
      {
        id: 'r1q4', type: 'mcq', num: 4,
        text: 'Why does James mention that contaminated recycling loads result in fines?',
        options: [
          'To explain why the city changed its guidelines',
          'To encourage residents to stop recycling entirely',
          'To motivate residents to follow the new rules to avoid extra costs',
          'To announce that maintenance fees have already increased'
        ],
        answer: 2,
        explanation: 'James mentions fines "passed on through maintenance fees" to motivate compliance with the new recycling rules.'
      },
      {
        id: 'r1q5', type: 'mcq', num: 5,
        text: 'Which entrance should residents use during the lobby renovation?',
        options: [
          'The underground parking entrance',
          'The back entrance on Oak Street',
          'The side entrance on Elm Street',
          'The emergency exit on the second floor'
        ],
        answer: 2,
        explanation: 'The email states: "please use the side entrance on Elm Street."'
      },
      {
        id: 'r1q6', type: 'dropdown', num: 6,
        text: 'Residents on Level P1 must move their cars to Level ______ from April 1-7.',
        options: ['P2', 'P3', 'P4', 'the street'],
        answer: 1,
        explanation: 'The email says "Residents on Level P1 will need to park temporarily on Level P3 from April 1-7."'
      },
      {
        id: 'r1q7', type: 'dropdown', num: 7,
        text: 'Temporary parking passes will be delivered by ______.',
        options: ['April 1', 'March 25', 'March 28', 'April 15'],
        answer: 2,
        explanation: '"Temporary parking passes will be placed under your door by March 28."'
      },
      {
        id: 'r1q8', type: 'dropdown', num: 8,
        text: 'The new recycling rules take effect on ______.',
        options: ['April 1', 'April 15', 'May 5', 'March 25'],
        answer: 1,
        explanation: '"the city has updated its recycling guidelines effective April 15."'
      },
      {
        id: 'r1q9', type: 'dropdown', num: 9,
        text: 'The lobby renovation will close the main entrance for ______.',
        options: ['one week', 'two weeks', '3-4 weeks', '2 months'],
        answer: 2,
        explanation: '"The main entrance will be closed for 3-4 weeks."'
      },
      {
        id: 'r1q10', type: 'dropdown', num: 10,
        text: 'The renovation will include new flooring, updated lighting, modernized mailboxes, and a new ______.',
        options: ['gym', 'parcel room', 'laundry area', 'bike storage'],
        answer: 1,
        explanation: '"new flooring, a modernized mailbox area, updated lighting, and a small parcel room for package deliveries."'
      },
      {
        id: 'r1q11', type: 'dropdown', num: 11,
        text: 'The Q&A session will be held in the ______ on March 25.',
        options: ['lobby', 'parking garage', 'common room', 'mail room'],
        answer: 2,
        explanation: '"I will also host a short Q&A session in the common room on March 25 at 7:00 PM."'
      }
    ]
  },

  R2: {
    partId: 'R2',
    partLabel: 'Reading to Apply a Diagram',
    icon: '\uD83D\uDCCA',
    timeLimitMinutes: 13,
    totalQuestions: 8,
    passage: `Lakewood Community Centre — Spring 2026 Program Guide

Welcome to the spring session! Registration opens March 20 for members and March 25 for non-members. All classes run for 8 weeks unless noted otherwise. Fees listed are for members; non-members add $25.

Please review the schedule below carefully. Note that some classes have age restrictions, prerequisite requirements, or limited capacity. Early registration is recommended for popular programs.

Important notes:
- Classes marked with * require participants to bring their own equipment.
- Classes marked with + have a prerequisite skill level.
- Refunds are available up to 7 days before the class start date. After that, only a 50% credit toward future classes is offered.
- The pool will be closed May 12-16 for annual maintenance.`,

    diagram: `\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502  Program            \u2502 Day       \u2502 Time          \u2502 Age     \u2502 Fee   \u2502 Notes          \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502  Yoga Basics         \u2502 Monday    \u2502 9:00-10:00 AM \u2502 16+     \u2502 $85   \u2502                \u2502
\u2502  Yoga Intermediate+  \u2502 Wednesday \u2502 9:00-10:00 AM \u2502 16+     \u2502 $95   \u2502 + Prerequisite \u2502
\u2502  Kids Swim Lessons   \u2502 Tuesday   \u2502 4:00-4:45 PM  \u2502 5-12    \u2502 $70   \u2502 Pool           \u2502
\u2502  Adult Lap Swim      \u2502 Mon/Wed   \u2502 6:30-7:30 AM  \u2502 18+     \u2502 $60   \u2502 Pool           \u2502
\u2502  Painting Studio*    \u2502 Thursday  \u2502 7:00-9:00 PM  \u2502 14+     \u2502 $110  \u2502 * Bring suppl. \u2502
\u2502  Pottery Workshop    \u2502 Saturday  \u2502 10:00-12:00   \u2502 12+     \u2502 $120  \u2502 6 weeks only   \u2502
\u2502  Basketball League   \u2502 Friday    \u2502 6:00-8:00 PM  \u2502 18+     \u2502 $50   \u2502                \u2502
\u2502  Senior Fitness      \u2502 Tue/Thu   \u2502 10:30-11:30AM \u2502 60+     \u2502 $45   \u2502                \u2502
\u2502  Photography Basics* \u2502 Sunday    \u2502 1:00-3:00 PM  \u2502 16+     \u2502 $95   \u2502 * Bring camera \u2502
\u2502  Coding for Kids     \u2502 Saturday  \u2502 2:00-3:30 PM  \u2502 8-14    \u2502 $80   \u2502 Laptops given  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`,

    questions: [
      {
        id: 'r2q1', type: 'dropdown', num: 1,
        text: 'A 10-year-old child could enrol in ______ and ______.',
        options: ['Kids Swim Lessons & Coding for Kids', 'Yoga Basics & Painting Studio', 'Basketball League & Senior Fitness', 'Photography Basics & Adult Lap Swim'],
        answer: 0,
        explanation: 'Kids Swim Lessons is for ages 5-12 and Coding for Kids is for ages 8-14. A 10-year-old fits both.'
      },
      {
        id: 'r2q2', type: 'dropdown', num: 2,
        text: 'A non-member who wants to join Painting Studio would pay ______.',
        options: ['$110', '$120', '$135', '$95'],
        answer: 2,
        explanation: 'Painting Studio costs $110 for members. Non-members add $25, so the total is $135.'
      },
      {
        id: 'r2q3', type: 'dropdown', num: 3,
        text: 'The class that does NOT run for the full 8 weeks is ______.',
        options: ['Yoga Basics', 'Pottery Workshop', 'Basketball League', 'Senior Fitness'],
        answer: 1,
        explanation: 'Pottery Workshop is noted as "6 weeks only." All other classes follow the default 8-week session.'
      },
      {
        id: 'r2q4', type: 'dropdown', num: 4,
        text: 'Kids Swim Lessons would be affected during the week of May 12 because ______.',
        options: ['the instructor is on vacation', 'the pool will be closed for maintenance', 'registration has not opened yet', 'the class has been cancelled'],
        answer: 1,
        explanation: 'The notes state "The pool will be closed May 12-16 for annual maintenance." Kids Swim uses the pool.'
      },
      {
        id: 'r2q5', type: 'dropdown', num: 5,
        text: 'To join Yoga Intermediate, you must ______.',
        options: ['be a member for at least one year', 'have completed a prerequisite level', 'bring your own yoga mat', 'be at least 18 years old'],
        answer: 1,
        explanation: 'Yoga Intermediate is marked with "+", which means it "requires a prerequisite skill level."'
      },
      {
        id: 'r2q6', type: 'mcq', num: 6,
        text: 'A 70-year-old member wants the most affordable class available. Which should they choose?',
        options: [
          'Yoga Basics ($85)',
          'Senior Fitness ($45)',
          'Adult Lap Swim ($60)',
          'Basketball League ($50)'
        ],
        answer: 1,
        explanation: 'Senior Fitness costs $45 and is for age 60+. It is the cheapest class a 70-year-old qualifies for.'
      },
      {
        id: 'r2q7', type: 'mcq', num: 7,
        text: 'Which two classes require participants to bring their own equipment?',
        options: [
          'Yoga Basics and Pottery Workshop',
          'Painting Studio and Photography Basics',
          'Basketball League and Coding for Kids',
          'Senior Fitness and Adult Lap Swim'
        ],
        answer: 1,
        explanation: 'Classes marked with * require own equipment: Painting Studio ("Bring suppl.") and Photography Basics ("Bring camera").'
      },
      {
        id: 'r2q8', type: 'mcq', num: 8,
        text: 'If you cancel a class 3 days before it starts, what happens?',
        options: [
          'You receive a full refund',
          'You receive a 50% credit toward future classes',
          'You forfeit the entire fee',
          'You can transfer to another class for free'
        ],
        answer: 1,
        explanation: 'Refunds are available up to 7 days before. After that, "only a 50% credit toward future classes is offered." 3 days is within 7 days.'
      }
    ]
  },

  R3: {
    partId: 'R3',
    partLabel: 'Reading for Information',
    icon: '\uD83D\uDCF0',
    timeLimitMinutes: 14,
    totalQuestions: 9,
    passage: `[A] Remote work was once considered a perk reserved for freelancers and tech workers. Today, it has become a permanent fixture in the Canadian labour market. According to Statistics Canada, approximately 20% of Canadian employees worked from home at least part of the week in late 2025 — down from the pandemic peak of 40%, but still five times higher than pre-2020 levels.

[B] The shift has not been evenly distributed. Workers in professional services, finance, IT, and government are far more likely to work remotely than those in manufacturing, retail, healthcare, or construction. Geography matters too: in cities like Ottawa and Toronto, remote work rates exceed 30%, while in rural areas and smaller cities, rates hover around 8-10%.

[C] Employers have responded with a mix of enthusiasm and caution. Many companies report higher employee satisfaction and lower turnover among hybrid workers. A 2025 survey by the Canadian Federation of Independent Business found that 62% of firms offering remote options reported improved retention. However, concerns about collaboration, mentoring junior staff, and maintaining company culture have led some organizations — including several major banks and consulting firms — to mandate three or more office days per week.

[D] The economic ripple effects are significant. Downtown office vacancy rates in Toronto hit 18% in 2025, the highest in two decades. Commercial landlords are converting unused office towers into residential units. Meanwhile, suburban and exurban communities have seen population growth as workers no longer need to live near their offices. Towns like Collingwood, Canmore, and Fredericton have experienced housing price increases of 25-40% since 2020.

[E] Health researchers have flagged both benefits and risks. Remote workers report less commute-related stress and more time for exercise. But they also report higher rates of social isolation, blurred work-life boundaries, and sedentary behaviour. A McMaster University study found that fully remote workers were 35% more likely to report feelings of professional isolation than their hybrid counterparts.

[F] Looking ahead, most labour economists predict that hybrid work — typically 2-3 days in the office — will remain the dominant model for knowledge workers. Fully remote arrangements will persist for specialized roles but are unlikely to expand further. The key challenge for employers is designing work structures that balance productivity, collaboration, and employee wellbeing.`,

    questions: [
      {
        id: 'r3q1', type: 'drag_drop', num: 1,
        text: 'Match each statement to the correct paragraph (A-F).',
        matchItems: [
          { statement: 'Remote work rates vary significantly by industry and city size.', answer: 'B' },
          { statement: 'Some employers are requiring employees to return to the office more often.', answer: 'C' },
          { statement: 'Remote work has caused major changes in real estate markets.', answer: 'D' },
          { statement: 'Fully remote workers experience more isolation than hybrid workers.', answer: 'E' },
          { statement: 'Hybrid work is expected to be the long-term standard.', answer: 'F' },
          { statement: 'Remote work has increased dramatically compared to before 2020.', answer: 'A' }
        ],
        paragraphOptions: ['A', 'B', 'C', 'D', 'E', 'F'],
        explanation: 'Each statement summarizes the main idea of its corresponding paragraph.'
      },
      {
        id: 'r3q7', type: 'mcq', num: 7,
        text: 'What percentage of Canadian employees worked from home at least part-time in late 2025?',
        options: [
          '8-10%',
          'Approximately 20%',
          '30%',
          '40%'
        ],
        answer: 1,
        explanation: 'Paragraph A states "approximately 20% of Canadian employees worked from home at least part of the week in late 2025."'
      },
      {
        id: 'r3q8', type: 'mcq', num: 8,
        text: 'According to the passage, why have some organizations mandated more office days?',
        options: [
          'Because remote workers are less productive',
          'Because of concerns about collaboration, mentoring, and company culture',
          'Because employees prefer to work from the office',
          'Because government regulations require in-person work'
        ],
        answer: 1,
        explanation: 'Paragraph C mentions "concerns about collaboration, mentoring junior staff, and maintaining company culture" as reasons for return-to-office mandates.'
      },
      {
        id: 'r3q9', type: 'mcq', num: 9,
        text: 'What can be inferred about the future of fully remote work?',
        options: [
          'It will completely replace office work within five years',
          'It will expand to include most industries',
          'It will continue for some roles but not grow significantly',
          'It will be banned by most employers'
        ],
        answer: 2,
        explanation: 'Paragraph F states that "Fully remote arrangements will persist for specialized roles but are unlikely to expand further."'
      }
    ]
  },

  R4: {
    partId: 'R4',
    partLabel: 'Reading for Viewpoints',
    icon: '\uD83D\uDDE3\uFE0F',
    timeLimitMinutes: 17,
    totalQuestions: 10,
    passage: `Should Canadian Universities Require Mandatory Attendance?

VIEWPOINT A — Professor David Crawford, Department of Biology, Dalhousie University:

University education is not just about reading textbooks and passing exams. It is about engaging with ideas in real time, participating in discussions, asking questions, and learning from peers. My department has tracked attendance data for over five years, and the results are clear: students who attend fewer than 60% of lectures are three times more likely to fail the course. This is not merely correlation — missing lectures means missing the demonstrations, case studies, and spontaneous discussions that cannot be replicated in recorded form.

I support a policy where attendance counts for 10% of the final grade, with allowances for documented illness or emergencies. This is not punitive — it is a reasonable expectation for students who are investing significant tuition fees in their education. If a student does not value being present, they should consider whether university is the right choice for them.

Opponents argue that adults should manage their own time. I agree in principle, but the evidence shows that many students — especially in their first and second years — lack the self-discipline to make good attendance decisions. A structured expectation helps them develop habits that serve them well beyond university.

VIEWPOINT B — Maya Singh, Fourth-Year Student, University of British Columbia:

Mandatory attendance policies are outdated, paternalistic, and counterproductive. University students are adults who pay significant tuition fees. We should have the autonomy to decide how we learn best. Some students absorb material more effectively through independent reading, recorded lectures, or study groups than by sitting in a large lecture hall.

These policies also ignore the reality of modern student life. Many of us work part-time jobs to afford tuition, care for family members, or manage health conditions that make attending every class difficult. Penalizing students for absences — when they are still completing assignments and passing exams — is punitive, not educational.

The real issue is not attendance — it is engagement. Instead of tracking who sits in a chair, professors should focus on creating classes worth attending. When professors use active learning techniques, real-world case studies, and interactive discussions, attendance takes care of itself. The classes I attend most regularly are the ones where being present genuinely adds value, not the ones where a roll call forces me to show up.

If universities want to improve outcomes, they should invest in better teaching, not surveillance.`,

    questions: [
      {
        id: 'r4q1', type: 'drag_drop', num: 1,
        text: 'Match each statement to the correct viewpoint.',
        matchItems: [
          { statement: 'Students who miss lectures frequently are more likely to fail.', answer: 'Crawford' },
          { statement: 'Students should have autonomy over how they learn.', answer: 'Singh' },
          { statement: 'Attendance should count for a portion of the final grade.', answer: 'Crawford' },
          { statement: 'Many students have work or family obligations that affect attendance.', answer: 'Singh' },
          { statement: 'First and second-year students often lack self-discipline.', answer: 'Crawford' },
          { statement: 'Professors should focus on making classes worth attending.', answer: 'Singh' },
          { statement: 'The evidence clearly links attendance to academic performance.', answer: 'Crawford' }
        ],
        authorOptions: ['Crawford', 'Singh'],
        explanation: 'Each statement reflects the specific arguments made by either Professor Crawford or Maya Singh in their viewpoints.'
      },
      {
        id: 'r4q8', type: 'mcq', num: 8,
        text: 'What evidence does Professor Crawford use to support mandatory attendance?',
        options: [
          'Student satisfaction surveys showing preference for in-person classes',
          'Department data showing low-attendance students are three times more likely to fail',
          'Research from other universities proving attendance policies work',
          'Feedback from employers who prefer graduates with good attendance records'
        ],
        answer: 1,
        explanation: 'Crawford cites his department tracking data: "students who attend fewer than 60% of lectures are three times more likely to fail the course."'
      },
      {
        id: 'r4q9', type: 'mcq', num: 9,
        text: 'What does Maya Singh mean when she calls attendance policies "paternalistic"?',
        options: [
          'They cost too much money to enforce',
          'They treat adult students as if they cannot make their own decisions',
          'They favour male students over female students',
          'They are based on outdated research methods'
        ],
        answer: 1,
        explanation: 'Singh argues students "are adults" who should have "autonomy" — calling policies paternalistic means they treat adults like children who need supervision.'
      },
      {
        id: 'r4q10', type: 'mcq', num: 10,
        text: 'On which point would Crawford and Singh most likely agree?',
        options: [
          'Attendance should never be tracked or measured',
          'University education involves more than just reading textbooks',
          'Recorded lectures are a complete substitute for in-person classes',
          'First-year students are mature enough to manage their own schedules'
        ],
        answer: 1,
        explanation: 'Both value the in-class experience — Crawford explicitly says education is "not just about reading textbooks," and Singh values classes that "genuinely add value" through interaction.'
      }
    ]
  }
}
