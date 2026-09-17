/* ══════════════════════════════════════════════════════════════
   READING PRACTICE DATA — CELPIP Official Format

   R1: Reading Correspondence (11 min) — 11 Questions × 20 Sets
       Q1-5: MCQ  |  Q6-11: Dropdown (fill blanks)

   R2: Reading to Apply a Diagram (13 min) — 8 Questions × 20 Sets
       Q1-5: Dropdown (fill blanks)  |  Q6-8: MCQ

   R3: Reading for Information (14 min) — 9 Questions × 20 Sets
       Q1-6: Drag & Drop (matching)  |  Q7-9: MCQ

   R4: Reading for Viewpoints (17 min) — 10 Questions × 20 Sets
       Q1-7: Drag & Drop (matching)  |  Q8-10: MCQ
══════════════════════════════════════════════════════════════ */

export const READING_DATA = {
  R1: {
    partId: 'R1',
    partLabel: 'Reading Correspondence',
    icon: '✉️',
    timeLimitMinutes: 11,
    totalQuestions: 11,
    sets: [

      // ── Set 1 ── Apartment Building Notices ─────────────────────────
      {
        setNumber: 1, difficulty: 'easy',
        title: 'Apartment Building — Spring Notices',
        passage: `From: James Whitfield <jwhitfield@greystone-apts.ca>
To: All Residents — Greystone Apartments
Date: March 18, 2026
Subject: Important Updates — Parking, Recycling & Lobby Renovation

Dear Residents,

I am writing to share three important updates that will affect everyone in the building over the coming weeks.

First, our underground parking garage will be repainted and re-lined starting April 1. The work will take approximately two weeks and will proceed one level at a time. Residents on Level P1 will need to park temporarily on Level P3 from April 1–7, and Level P2 residents will relocate to P3 from April 8–14. Temporary parking passes will be placed under your door by March 28. If you have a motorcycle or oversized vehicle, please contact me directly so we can make alternative arrangements.

Second, the city has updated its recycling guidelines effective April 15. Soft plastics (bags, wrappers, film packaging) will NO LONGER be accepted in blue bins. Instead, residents must take soft plastics to the collection depot at 440 Queen Street or use the new drop-off bin we are installing in the mail room. Please do not place soft plastics in the blue bin after April 15 — contaminated loads result in fines to the building, which are passed on through maintenance fees.

Third, our lobby renovation is on track to begin May 5. The main entrance will be closed for 3–4 weeks. During this time, please use the side entrance on Elm Street. The renovation includes new flooring, a modernized mailbox area, updated lighting, and a small parcel room for package deliveries. I know the temporary inconvenience will be worth it.

If you have any questions about these changes, please do not hesitate to reach out. I will also host a short Q&A session in the common room on March 25 at 7:00 PM.

Best regards,
James Whitfield
Property Manager, Greystone Apartments
(416) 555-0192 | jwhitfield@greystone-apts.ca`,
        questions: [
          { id: 'r1s1q1', type: 'mcq', num: 1, text: 'What is the main purpose of this email?', options: ['To announce an increase in maintenance fees', 'To inform residents about upcoming building changes', 'To invite residents to a lobby renovation party', 'To request that residents move their vehicles permanently'], answer: 1, explanation: 'The email covers three updates — parking, recycling, and lobby renovation. Its main purpose is to inform residents of upcoming changes.' },
          { id: 'r1s1q2', type: 'mcq', num: 2, text: 'How long will the parking garage work take in total?', options: ['One week', 'Approximately two weeks', 'Three to four weeks', 'One month'], answer: 1, explanation: '"The work will take approximately two weeks and will proceed one level at a time."' },
          { id: 'r1s1q3', type: 'mcq', num: 3, text: 'What should residents do with soft plastics after April 15?', options: ['Place them in the blue recycling bin as usual', 'Leave them outside their apartment door for collection', 'Take them to the depot at 440 Queen Street or use the mail room drop-off bin', 'Throw them in the regular garbage bin'], answer: 2, explanation: 'Soft plastics must go to "the collection depot at 440 Queen Street or use the new drop-off bin we are installing in the mail room."' },
          { id: 'r1s1q4', type: 'mcq', num: 4, text: 'Why does James mention that contaminated recycling loads result in fines?', options: ['To explain why the city changed its guidelines', 'To encourage residents to stop recycling entirely', 'To motivate residents to follow the new rules to avoid extra costs', 'To announce that maintenance fees have already increased'], answer: 2, explanation: 'James mentions fines "passed on through maintenance fees" to motivate compliance with the new recycling rules.' },
          { id: 'r1s1q5', type: 'mcq', num: 5, text: 'Which entrance should residents use during the lobby renovation?', options: ['The underground parking entrance', 'The back entrance on Oak Street', 'The side entrance on Elm Street', 'The emergency exit on the second floor'], answer: 2, explanation: '"please use the side entrance on Elm Street."' },
          { id: 'r1s1q6', type: 'dropdown', num: 6, text: 'Residents on Level P1 must move their cars to Level ______ from April 1–7.', options: ['P2', 'P3', 'P4', 'the street'], answer: 1, explanation: '"Residents on Level P1 will need to park temporarily on Level P3 from April 1–7."' },
          { id: 'r1s1q7', type: 'dropdown', num: 7, text: 'Temporary parking passes will be delivered by ______.', options: ['April 1', 'March 25', 'March 28', 'April 15'], answer: 2, explanation: '"Temporary parking passes will be placed under your door by March 28."' },
          { id: 'r1s1q8', type: 'dropdown', num: 8, text: 'The new recycling rules take effect on ______.', options: ['April 1', 'April 15', 'May 5', 'March 25'], answer: 1, explanation: '"the city has updated its recycling guidelines effective April 15."' },
          { id: 'r1s1q9', type: 'dropdown', num: 9, text: 'The lobby renovation will close the main entrance for ______.', options: ['one week', 'two weeks', '3–4 weeks', '2 months'], answer: 2, explanation: '"The main entrance will be closed for 3–4 weeks."' },
          { id: 'r1s1q10', type: 'dropdown', num: 10, text: 'The renovation will include new flooring, updated lighting, modernized mailboxes, and a new ______.', options: ['gym', 'parcel room', 'laundry area', 'bike storage'], answer: 1, explanation: '"new flooring, a modernized mailbox area, updated lighting, and a small parcel room for package deliveries."' },
          { id: 'r1s1q11', type: 'dropdown', num: 11, text: 'The Q&A session will be held in the ______ on March 25.', options: ['lobby', 'parking garage', 'common room', 'mail room'], answer: 2, explanation: '"I will also host a short Q&A session in the common room on March 25 at 7:00 PM."' },
        ],
      },

      // ── Set 2 ── Bank Fraud Alert ────────────────────────────────────
      {
        setNumber: 2, difficulty: 'intermediate',
        title: 'Bank — Fraud Alert & Account Security',
        passage: `From: Security Team <security@northernbank.ca>
To: Account Holder
Date: April 2, 2026
Subject: Important Security Notice — Unusual Activity on Your Account

Dear Valued Customer,

We are writing to notify you of unusual activity detected on your Northern Bank chequing account ending in 4821. On April 1, 2026, at 11:47 PM EST, our fraud detection system flagged three transactions that appear inconsistent with your normal spending patterns:

1. Online purchase — Electronics retailer — $1,249.00 (declined)
2. International wire transfer — $850.00 — destination: overseas (pending)
3. ATM cash withdrawal — $500.00 — location: downtown Calgary (approved)

To protect your account, we have temporarily placed a hold on outgoing transfers and new online purchases. Your debit card remains active for in-person purchases at Canadian retailers. The ATM withdrawal of $500.00 has already been processed.

ACTION REQUIRED: You must verify these transactions within 48 hours to restore full account access. Please log in to your Northern Bank online portal at northernbank.ca/security or call our 24-hour fraud line at 1-800-555-0241. Do NOT click any links sent to you by email — always navigate directly to our website.

If you recognize all three transactions, your hold will be lifted within two business hours of verification. If any transaction is unauthorized, our fraud team will begin an investigation immediately and issue a replacement card within 5–7 business days.

We take the security of your finances seriously. We apologize for any inconvenience this temporary hold may cause.

Sincerely,
Northern Bank Fraud Prevention Team
1-800-555-0241 (24 hours) | northernbank.ca/security`,
        questions: [
          { id: 'r1s2q1', type: 'mcq', num: 1, text: 'Why did Northern Bank send this email?', options: ['To offer the customer a new credit card', 'To notify the customer of unusual account activity', 'To confirm a large international wire transfer', 'To cancel the customer\'s account'], answer: 1, explanation: 'The email states it was sent "to notify you of unusual activity detected on your Northern Bank chequing account."' },
          { id: 'r1s2q2', type: 'mcq', num: 2, text: 'Which of the three flagged transactions was successfully completed?', options: ['The electronics purchase of $1,249.00', 'The international wire transfer of $850.00', 'The ATM cash withdrawal of $500.00', 'None — all were blocked'], answer: 2, explanation: 'The ATM withdrawal of $500.00 is listed as "(approved)" and the email confirms "The ATM withdrawal of $500.00 has already been processed."' },
          { id: 'r1s2q3', type: 'mcq', num: 3, text: 'What can the customer still do while the account hold is in place?', options: ['Make international wire transfers', 'Make online purchases', 'Make in-person purchases at Canadian retailers', 'Access full banking services online'], answer: 2, explanation: '"Your debit card remains active for in-person purchases at Canadian retailers."' },
          { id: 'r1s2q4', type: 'mcq', num: 4, text: 'What does the bank warn the customer NOT to do?', options: ['Call the fraud line', 'Log into the online portal', 'Click links sent by email', 'Request a replacement card'], answer: 2, explanation: '"Do NOT click any links sent to you by email — always navigate directly to our website."' },
          { id: 'r1s2q5', type: 'mcq', num: 5, text: 'If the customer verifies all transactions as legitimate, how long will it take to restore full access?', options: ['5–7 business days', 'Within 24 hours', 'Within two business hours', '48 hours exactly'], answer: 2, explanation: '"your hold will be lifted within two business hours of verification."' },
          { id: 'r1s2q6', type: 'dropdown', num: 6, text: 'The fraud was flagged on ______ at 11:47 PM EST.', options: ['March 31, 2026', 'April 1, 2026', 'April 2, 2026', 'April 3, 2026'], answer: 1, explanation: '"On April 1, 2026, at 11:47 PM EST, our fraud detection system flagged three transactions."' },
          { id: 'r1s2q7', type: 'dropdown', num: 7, text: 'The account number affected ends in ______.', options: ['4182', '8214', '4821', '2148'], answer: 2, explanation: '"unusual activity detected on your Northern Bank chequing account ending in 4821."' },
          { id: 'r1s2q8', type: 'dropdown', num: 8, text: 'The customer must verify their transactions within ______ to restore full access.', options: ['24 hours', '48 hours', '5 business days', '7 business days'], answer: 1, explanation: '"You must verify these transactions within 48 hours to restore full account access."' },
          { id: 'r1s2q9', type: 'dropdown', num: 9, text: 'If a transaction is unauthorized, a replacement card will arrive within ______.', options: ['24 hours', '2 business days', '5–7 business days', '10 business days'], answer: 2, explanation: '"issue a replacement card within 5–7 business days."' },
          { id: 'r1s2q10', type: 'dropdown', num: 10, text: 'The fraud prevention phone line operates ______.', options: ['Monday to Friday', '9 AM to 5 PM', '24 hours a day', 'on weekdays only'], answer: 2, explanation: '"1-800-555-0241 (24 hours)"' },
          { id: 'r1s2q11', type: 'dropdown', num: 11, text: 'The wire transfer destination was listed as ______.', options: ['a domestic account', 'a U.S. account', 'overseas', 'unknown'], answer: 2, explanation: '"International wire transfer — $850.00 — destination: overseas (pending)"' },
        ],
      },

      // ── Set 3 ── Job Offer Letter ────────────────────────────────────
      {
        setNumber: 3, difficulty: 'advanced',
        title: 'HR Department — Job Offer Letter',
        passage: `From: Linda Okafor <l.okafor@horizoncorp.ca>
To: Marcus Reyes <marcusreyes@email.com>
Date: March 22, 2026
Subject: Offer of Employment — Junior Data Analyst, Horizon Corporation

Dear Marcus,

On behalf of Horizon Corporation, I am delighted to offer you the position of Junior Data Analyst within our Analytics & Insights team, reporting to the Director of Business Intelligence, Mr. Paul Huang.

Your start date is tentatively set for Monday, April 14, 2026. Please confirm your acceptance no later than Friday, March 28, 2026 so we can complete your onboarding paperwork in advance.

The position is full-time, Monday through Friday, 9:00 AM to 5:00 PM, with occasional overtime during quarterly reporting periods. This role is hybrid: you will work from our downtown Vancouver office three days per week (Tuesday, Wednesday, Thursday) and remotely on Mondays and Fridays.

Compensation & Benefits:
- Annual base salary: $68,500
- Performance bonus: up to 8% of base salary, paid annually in March
- Extended health and dental: effective the first day of employment
- RRSP matching: up to 4% of gross salary, after a 6-month probationary period
- Three weeks of paid vacation per year (accrued monthly)
- Professional development fund: $1,200 per year

We will require a background check and verification of your academic credentials before your first day. These will be coordinated through our HR portal, which you will receive access to upon acceptance.

We are excited about what you will bring to the team, Marcus. Please do not hesitate to contact me if you have any questions before signing.

Warm regards,
Linda Okafor
Human Resources Manager
Horizon Corporation | (604) 555-0187 | l.okafor@horizoncorp.ca`,
        questions: [
          { id: 'r1s3q1', type: 'mcq', num: 1, text: 'What is the purpose of this email?', options: ['To schedule a job interview for Marcus', 'To offer Marcus a position at Horizon Corporation', 'To inform Marcus that he was not selected for the role', 'To request references from Marcus'], answer: 1, explanation: 'The email explicitly states: "I am delighted to offer you the position of Junior Data Analyst."' },
          { id: 'r1s3q2', type: 'mcq', num: 2, text: 'Who will Marcus report to in his new role?', options: ['Linda Okafor', 'The CEO of Horizon Corporation', 'Mr. Paul Huang', 'The Head of IT'], answer: 2, explanation: '"reporting to the Director of Business Intelligence, Mr. Paul Huang."' },
          { id: 'r1s3q3', type: 'mcq', num: 3, text: 'How many days per week will Marcus work from the office?', options: ['Two', 'Three', 'Four', 'Five'], answer: 1, explanation: '"you will work from our downtown Vancouver office three days per week (Tuesday, Wednesday, Thursday)."' },
          { id: 'r1s3q4', type: 'mcq', num: 4, text: 'When does extended health and dental coverage begin?', options: ['After a 6-month probationary period', 'After 3 months of employment', 'On the first day of employment', 'At the start of the following calendar year'], answer: 2, explanation: '"Extended health and dental: effective the first day of employment."' },
          { id: 'r1s3q5', type: 'mcq', num: 5, text: 'What must Marcus do before his first day of work?', options: ['Attend an in-person orientation session', 'Complete a background check and academic credential verification', 'Purchase his own laptop and equipment', 'Sign a non-disclosure agreement in person'], answer: 1, explanation: '"We will require a background check and verification of your academic credentials before your first day."' },
          { id: 'r1s3q6', type: 'dropdown', num: 6, text: 'Marcus must accept the offer no later than ______.', options: ['March 22, 2026', 'March 28, 2026', 'April 7, 2026', 'April 14, 2026'], answer: 1, explanation: '"Please confirm your acceptance no later than Friday, March 28, 2026."' },
          { id: 'r1s3q7', type: 'dropdown', num: 7, text: 'The annual base salary offered is ______.', options: ['$62,500', '$65,000', '$68,500', '$72,000'], answer: 2, explanation: '"Annual base salary: $68,500"' },
          { id: 'r1s3q8', type: 'dropdown', num: 8, text: 'The performance bonus is up to ______ of base salary, paid in March.', options: ['4%', '6%', '8%', '10%'], answer: 2, explanation: '"Performance bonus: up to 8% of base salary, paid annually in March."' },
          { id: 'r1s3q9', type: 'dropdown', num: 9, text: 'RRSP matching begins after a ______ probationary period.', options: ['3-month', '6-month', '9-month', '12-month'], answer: 1, explanation: '"RRSP matching: up to 4% of gross salary, after a 6-month probationary period."' },
          { id: 'r1s3q10', type: 'dropdown', num: 10, text: 'The annual professional development fund is ______.', options: ['$800', '$1,000', '$1,200', '$1,500'], answer: 2, explanation: '"Professional development fund: $1,200 per year."' },
          { id: 'r1s3q11', type: 'dropdown', num: 11, text: 'Marcus\'s tentative start date is ______.', options: ['March 28, 2026', 'April 7, 2026', 'April 14, 2026', 'May 1, 2026'], answer: 2, explanation: '"Your start date is tentatively set for Monday, April 14, 2026."' },
        ],
      },

      // ── Set 4 ── Library Overdue Notice ──────────────────────────────
      {
        setNumber: 4, difficulty: 'intermediate',
        title: 'Public Library — Overdue Items & Fine Notice',
        passage: `From: Vancouver Public Library <accounts@vpl.ca>
To: Priya Sharma <priya.sharma@email.com>
Date: April 5, 2026
Subject: Overdue Items — Action Required to Avoid Suspension

Dear Priya Sharma,

This is a reminder that your Vancouver Public Library account (Card #VPL-88341) has items that are significantly overdue. Your borrowing privileges have been temporarily suspended until these items are returned and any applicable fines are paid.

OVERDUE ITEMS:
1. "The Midnight Library" by Matt Haig — due March 10, 2026 (26 days overdue) — Fine: $3.90
2. "The Wim Hof Method" — due March 17, 2026 (19 days overdue) — Fine: $2.85
3. "Excel for Beginners" (DVD) — due March 20, 2026 (16 days overdue) — Fine: $4.80
Total outstanding fine: $11.55

Our standard fine rate is $0.15 per day for books and $0.30 per day for DVDs. Fines continue to accrue until items are returned. You may pay your fine online at vpl.ca/account, in person at any branch, or by calling our automated payment line at 604-555-0188.

Once items are returned and the balance is paid, your account will be restored within one hour during branch operating hours.

If you believe any of these items have already been returned, please contact your branch directly with your receipt or date of return, as processing delays occasionally occur. Items more than 60 days overdue are assumed lost and charged at full replacement cost.

Please return your items at your earliest convenience. Branch hours are Monday–Thursday 10 AM–8 PM, Friday–Saturday 10 AM–6 PM, and Sunday 12 PM–5 PM.

Thank you for your continued support of your local library.

Vancouver Public Library
accounts@vpl.ca | 604-555-0120`,
        questions: [
          { id: 'r1s4q1', type: 'mcq', num: 1, text: 'Why has Priya\'s borrowing account been suspended?', options: ['She has not paid her annual library membership fee', 'She has overdue items and outstanding fines', 'She attempted to borrow more items than the limit allows', 'Her library card has expired'], answer: 1, explanation: '"Your borrowing privileges have been temporarily suspended until these items are returned and any applicable fines are paid."' },
          { id: 'r1s4q2', type: 'mcq', num: 2, text: 'What is the fine rate for DVDs per day?', options: ['$0.15', '$0.20', '$0.25', '$0.30'], answer: 3, explanation: '"Our standard fine rate is $0.15 per day for books and $0.30 per day for DVDs."' },
          { id: 'r1s4q3', type: 'mcq', num: 3, text: 'How long after returning items and paying the balance will Priya\'s account be restored?', options: ['Immediately', 'Within one hour during branch hours', 'Within one business day', 'Within 48 hours'], answer: 1, explanation: '"your account will be restored within one hour during branch operating hours."' },
          { id: 'r1s4q4', type: 'mcq', num: 4, text: 'What happens to items that are more than 60 days overdue?', options: ['They are written off with no charge to the borrower', 'They are charged at full replacement cost', 'The borrower is charged a flat $50 late fee', 'The library contacts law enforcement'], answer: 1, explanation: '"Items more than 60 days overdue are assumed lost and charged at full replacement cost."' },
          { id: 'r1s4q5', type: 'mcq', num: 5, text: 'What should Priya do if she thinks she already returned an item?', options: ['Email the library and wait for a response', 'Go to court to dispute the fine', 'Contact her branch directly with her receipt or date of return', 'Simply ignore the notice'], answer: 2, explanation: '"please contact your branch directly with your receipt or date of return, as processing delays occasionally occur."' },
          { id: 'r1s4q6', type: 'dropdown', num: 6, text: 'Priya\'s library card number is ______.', options: ['VPL-83341', 'VPL-88341', 'VPL-83841', 'VPL-88431'], answer: 1, explanation: '"your Vancouver Public Library account (Card #VPL-88341)"' },
          { id: 'r1s4q7', type: 'dropdown', num: 7, text: 'The total outstanding fine on Priya\'s account is ______.', options: ['$7.50', '$9.75', '$11.55', '$13.80'], answer: 2, explanation: '"Total outstanding fine: $11.55"' },
          { id: 'r1s4q8', type: 'dropdown', num: 8, text: 'The most overdue item is "The Midnight Library," which was due on ______.', options: ['March 1', 'March 10', 'March 17', 'March 20'], answer: 1, explanation: '"The Midnight Library" by Matt Haig — due March 10, 2026 (26 days overdue).' },
          { id: 'r1s4q9', type: 'dropdown', num: 9, text: 'The DVD fine rate results in a fine of ______ for the 16-day overdue DVD.', options: ['$2.40', '$3.60', '$4.80', '$6.00'], answer: 2, explanation: '$0.30/day × 16 days = $4.80. The email confirms: "Excel for Beginners" (DVD) — Fine: $4.80.' },
          { id: 'r1s4q10', type: 'dropdown', num: 10, text: 'On Sundays, the library is open from ______.', options: ['10 AM–5 PM', '11 AM–5 PM', '12 PM–5 PM', '12 PM–6 PM'], answer: 2, explanation: '"Sunday 12 PM–5 PM."' },
          { id: 'r1s4q11', type: 'dropdown', num: 11, text: 'Fines can be paid online, in person, or by calling ______.', options: ['604-555-0120', '604-555-0188', '604-555-0241', '604-555-0199'], answer: 1, explanation: '"by calling our automated payment line at 604-555-0188."' },
        ],
      },

      // ── Set 5 ── Dental Appointment Reminder ────────────────────────
      {
        setNumber: 5, difficulty: 'easy',
        title: 'Dental Clinic — Appointment Reminder & Rescheduling',
        passage: `From: Maple Leaf Dental <appointments@mapleleafdental.ca>
To: David Kim <dkim@email.com>
Date: April 3, 2026
Subject: Appointment Reminder — Thursday, April 10 at 2:30 PM

Dear David,

This is a friendly reminder that you have a dental appointment scheduled for Thursday, April 10, 2026 at 2:30 PM with Dr. Sophie Tremblay at Maple Leaf Dental, 820 Main Street, Suite 210, Mississauga.

Your appointment includes a full examination, professional cleaning, and updated dental X-rays. Please plan for approximately 75 minutes.

IMPORTANT — Before Your Visit:
- Eat normally before your appointment. If you are receiving a local anaesthetic for any reason, avoid eating for 2 hours prior.
- Bring your current insurance card. We will submit your claim directly to your provider. Our office accepts most major dental plans, including Sun Life, Great-West Life, and Manulife.
- Brush and floss before your appointment out of courtesy to your hygienist.
- If you take daily medications, continue as normal unless your doctor has advised otherwise.

CANCELLATION POLICY:
We request a minimum of 48 hours' notice for all cancellations. Cancellations with less than 48 hours' notice will incur a $50 cancellation fee. To reschedule, please call 905-555-0173 or reply to this email. Online booking is also available at mapleleafdental.ca/book.

We have a new patient intake form available on our website if your address, insurance, or health information has changed since your last visit. Please complete it prior to arriving to reduce your wait time.

We look forward to seeing you!

Maple Leaf Dental Team
905-555-0173 | mapleleafdental.ca`,
        questions: [
          { id: 'r1s5q1', type: 'mcq', num: 1, text: 'What is the primary purpose of this email?', options: ['To confirm that David\'s insurance claim was approved', 'To remind David of an upcoming dental appointment', 'To inform David that his appointment has been cancelled', 'To request that David update his insurance information'], answer: 1, explanation: '"This is a friendly reminder that you have a dental appointment scheduled for Thursday, April 10, 2026."' },
          { id: 'r1s5q2', type: 'mcq', num: 2, text: 'How long should David plan for his appointment?', options: ['30 minutes', '45 minutes', '60 minutes', 'Approximately 75 minutes'], answer: 3, explanation: '"Please plan for approximately 75 minutes."' },
          { id: 'r1s5q3', type: 'mcq', num: 3, text: 'What will David\'s appointment include?', options: ['Only a cleaning and X-rays', 'A full examination, cleaning, and updated X-rays', 'A root canal and crown fitting', 'A consultation and treatment plan only'], answer: 1, explanation: '"Your appointment includes a full examination, professional cleaning, and updated dental X-rays."' },
          { id: 'r1s5q4', type: 'mcq', num: 4, text: 'What will happen if David cancels with less than 48 hours\' notice?', options: ['His next appointment will be cancelled automatically', 'He will be charged a $50 cancellation fee', 'He will be charged the full cost of the missed appointment', 'He will be required to pay the fee upfront at his next visit'], answer: 1, explanation: '"Cancellations with less than 48 hours\' notice will incur a $50 cancellation fee."' },
          { id: 'r1s5q5', type: 'mcq', num: 5, text: 'What can David do online before his appointment to reduce his wait time?', options: ['Pay for his appointment in advance', 'Request a prescription refill', 'Complete a new patient intake form', 'Confirm his appointment by email'], answer: 2, explanation: '"We have a new patient intake form available on our website... Please complete it prior to arriving to reduce your wait time."' },
          { id: 'r1s5q6', type: 'dropdown', num: 6, text: 'David\'s appointment is with Dr. ______ at 2:30 PM.', options: ['Paul Huang', 'Linda Okafor', 'Sophie Tremblay', 'James Whitfield'], answer: 2, explanation: '"appointment scheduled for Thursday, April 10, 2026 at 2:30 PM with Dr. Sophie Tremblay."' },
          { id: 'r1s5q7', type: 'dropdown', num: 7, text: 'The dental clinic is located at ______ in Mississauga.', options: ['820 Elm Street, Suite 210', '820 Main Street, Suite 210', '280 Main Street, Suite 210', '820 Main Street, Suite 120'], answer: 1, explanation: '"Maple Leaf Dental, 820 Main Street, Suite 210, Mississauga."' },
          { id: 'r1s5q8', type: 'dropdown', num: 8, text: 'If David is receiving a local anaesthetic, he should avoid eating for ______ before his appointment.', options: ['1 hour', '2 hours', '4 hours', '6 hours'], answer: 1, explanation: '"If you are receiving a local anaesthetic for any reason, avoid eating for 2 hours prior."' },
          { id: 'r1s5q9', type: 'dropdown', num: 9, text: 'To reschedule, David can call, reply to this email, or book online at ______.', options: ['mapleleafdental.ca/contact', 'mapleleafdental.ca/book', 'mapleleafdental.ca/schedule', 'mapleleafdental.ca/appointment'], answer: 1, explanation: '"Online booking is also available at mapleleafdental.ca/book."' },
          { id: 'r1s5q10', type: 'dropdown', num: 10, text: 'The clinic accepts dental plans including Sun Life, Manulife, and ______.', options: ['Blue Cross', 'Desjardins', 'Great-West Life', 'Canada Life'], answer: 2, explanation: '"Our office accepts most major dental plans, including Sun Life, Great-West Life, and Manulife."' },
          { id: 'r1s5q11', type: 'dropdown', num: 11, text: 'The cancellation notice period required is ______ hours.', options: ['24', '36', '48', '72'], answer: 2, explanation: '"We request a minimum of 48 hours\' notice for all cancellations."' },
        ],
      },

      // ── Set 6 ── City Road Construction Notice ───────────────────────
      {
        setNumber: 6, difficulty: 'advanced',
        title: 'City of Burlington — Road Construction Detour',
        passage: `From: City of Burlington Public Works <publicworks@burlington.ca>
To: All Residents — Brant Street Corridor
Date: March 30, 2026
Subject: Road Construction Notice — Brant Street Closure, April 7–May 2

Dear Resident,

The City of Burlington will begin major infrastructure work on Brant Street between Caroline Street and Victoria Avenue beginning Monday, April 7, 2026. This work is scheduled to be completed by Friday, May 2, 2026, weather permitting.

The work includes full replacement of a 40-year-old water main, resurfacing of the road surface, and installation of new bicycle lane markings. During construction, Brant Street will be CLOSED to all through traffic between Caroline Street and Victoria Avenue.

DETOUR ROUTE FOR DRIVERS:
Northbound: Take Guelph Line north, then left on Plains Road East, then right on Victoria Avenue.
Southbound: Take Victoria Avenue west, then left on Plains Road East, then right on Guelph Line south.
Local access will be maintained for residents within the construction zone.

WHAT TO EXPECT:
- Daytime work only: Monday to Friday, 7:00 AM to 7:00 PM
- No weekend construction
- Occasional short-term water service interruptions (maximum 4 hours) — you will receive 24-hour advance notice by door hanger
- Construction noise and dust are unavoidable; we ask for your patience

BUS ROUTES 10 AND 14 AFFECTED: Both routes will be rerouted during construction. Temporary bus stops are being set up on Guelph Line. Updated route maps are available at burlington.ca/transit or at all city libraries.

For questions or concerns, contact our Construction Hotline at 905-555-0142 (Monday–Friday, 8:00 AM–4:30 PM) or email publicworks@burlington.ca.

We apologize for the inconvenience and appreciate your understanding as we make this important investment in Burlington's infrastructure.

Burlington Public Works Department`,
        questions: [
          { id: 'r1s6q1', type: 'mcq', num: 1, text: 'What is the main purpose of this letter?', options: ['To announce a new bicycle lane on Guelph Line', 'To inform residents about upcoming road construction and a detour', 'To request feedback from residents about infrastructure priorities', 'To warn residents about a water main emergency'], answer: 1, explanation: 'The letter informs residents about the Brant Street construction, the closure, and the detour route.' },
          { id: 'r1s6q2', type: 'mcq', num: 2, text: 'What THREE things will be done during the Brant Street construction?', options: ['Water main replacement, road resurfacing, and new sidewalks', 'Water main replacement, road resurfacing, and bicycle lane markings', 'Traffic light installation, road resurfacing, and water main replacement', 'Bicycle lanes, new sidewalks, and storm drain replacement'], answer: 1, explanation: '"This work includes full replacement of a 40-year-old water main, resurfacing of the road surface, and installation of new bicycle lane markings."' },
          { id: 'r1s6q3', type: 'mcq', num: 3, text: 'How will residents know in advance about water service interruptions?', options: ['By email notification 48 hours in advance', 'By a door hanger delivered 24 hours in advance', 'By a voicemail from the city 24 hours in advance', 'By a notice posted at the construction site'], answer: 1, explanation: '"Occasional short-term water service interruptions... you will receive 24-hour advance notice by door hanger."' },
          { id: 'r1s6q4', type: 'mcq', num: 4, text: 'Where can residents find the updated bus route maps?', options: ['Only at City Hall', 'On the Burlington transit website or at city libraries', 'At construction site notices', 'By calling the Construction Hotline'], answer: 1, explanation: '"Updated route maps are available at burlington.ca/transit or at all city libraries."' },
          { id: 'r1s6q5', type: 'mcq', num: 5, text: 'Who will still be able to access Brant Street during the closure?', options: ['No one — access will be completely blocked', 'Only emergency vehicles', 'Local residents within the construction zone', 'Only cyclists and pedestrians'], answer: 2, explanation: '"Local access will be maintained for residents within the construction zone."' },
          { id: 'r1s6q6', type: 'dropdown', num: 6, text: 'Construction on Brant Street will run from April 7 to ______.', options: ['April 30, 2026', 'May 2, 2026', 'May 9, 2026', 'May 15, 2026'], answer: 1, explanation: '"scheduled to be completed by Friday, May 2, 2026."' },
          { id: 'r1s6q7', type: 'dropdown', num: 7, text: 'The water main being replaced is ______ years old.', options: ['20', '30', '40', '50'], answer: 2, explanation: '"full replacement of a 40-year-old water main."' },
          { id: 'r1s6q8', type: 'dropdown', num: 8, text: 'Construction work will take place from ______ AM to 7:00 PM, Monday to Friday.', options: ['6:00', '7:00', '8:00', '9:00'], answer: 1, explanation: '"Daytime work only: Monday to Friday, 7:00 AM to 7:00 PM."' },
          { id: 'r1s6q9', type: 'dropdown', num: 9, text: 'Water service interruptions will last a maximum of ______ hours.', options: ['2', '4', '6', '8'], answer: 1, explanation: '"Occasional short-term water service interruptions (maximum 4 hours)."' },
          { id: 'r1s6q10', type: 'dropdown', num: 10, text: 'The Construction Hotline is available Monday to Friday from 8:00 AM to ______.', options: ['4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'], answer: 1, explanation: '"905-555-0142 (Monday–Friday, 8:00 AM–4:30 PM)."' },
          { id: 'r1s6q11', type: 'dropdown', num: 11, text: 'Bus routes ______ and 14 are affected by the construction.', options: ['8', '10', '12', '16'], answer: 1, explanation: '"BUS ROUTES 10 AND 14 AFFECTED."' },
        ],
      },

      // ── Set 7 ── Insurance Renewal ───────────────────────────────────
      {
        setNumber: 7, difficulty: 'easy',
        title: 'Insurance Company — Policy Renewal Notice',
        passage: `From: Dominion Insurance Group <renewals@dominioninsurance.ca>
To: Helen Fontaine <h.fontaine@email.com>
Date: April 1, 2026
Subject: Your Home Insurance Policy — Renewal Notice (Policy #DI-447832)

Dear Helen Fontaine,

Your home insurance policy (#DI-447832) is scheduled to renew automatically on May 1, 2026. We are writing to inform you of the updated terms and premium for the coming year.

RENEWAL SUMMARY:
- Policy period: May 1, 2026 – April 30, 2027
- Dwelling coverage: $620,000 (previously $580,000 — updated to reflect current replacement costs)
- Contents coverage: $85,000 (unchanged)
- Additional living expenses: $40,000
- Annual premium: $1,847.00 (previously $1,690.00 — an increase of $157.00)
- Monthly payment option: $157.92/month (includes $3.67 instalment fee)

REASON FOR PREMIUM INCREASE:
Your premium has increased by 9.3% due to two factors: (1) rising construction costs in your area mean your dwelling coverage has been increased by $40,000 to ensure full replacement value, and (2) a slight adjustment in regional risk ratings reflecting increased storm claims across southwestern Ontario.

YOUR DEDUCTIBLE:
Standard deductible: $1,000 per claim
Water damage deductible: $2,500 per claim (this deductible type applies specifically to water backup events)

If you would like to discuss your coverage, adjust your deductible, or explore discounts such as our new home security discount (up to 10%) or our multi-policy discount (up to 8%), please call our renewals team at 1-888-555-0293 or log in to your account at dominioninsurance.ca.

Your policy will renew automatically unless you contact us before April 25, 2026. To decline renewal, you must notify us in writing.

Thank you for being a valued Dominion Insurance customer.

Sincerely,
Renewals Department
Dominion Insurance Group
1-888-555-0293 | dominioninsurance.ca`,
        questions: [
          { id: 'r1s7q1', type: 'mcq', num: 1, text: 'Why is Helen\'s premium increasing?', options: ['She filed a water damage claim last year', 'Rising construction costs increased her dwelling coverage, and regional risk ratings adjusted', 'She added a new vehicle to her policy', 'Her credit score decreased'], answer: 1, explanation: '"Your premium has increased by 9.3% due to two factors: (1) rising construction costs... and (2) a slight adjustment in regional risk ratings."' },
          { id: 'r1s7q2', type: 'mcq', num: 2, text: 'What changed in Helen\'s dwelling coverage?', options: ['It decreased by $40,000', 'It remained unchanged at $580,000', 'It increased from $580,000 to $620,000', 'It increased from $620,000 to $660,000'], answer: 2, explanation: '"Dwelling coverage: $620,000 (previously $580,000 — updated to reflect current replacement costs)."' },
          { id: 'r1s7q3', type: 'mcq', num: 3, text: 'If Helen chooses the monthly payment option, what additional cost does she pay?', options: ['A $5.00 processing fee', 'A $3.67 instalment fee per month', 'An annual administration fee of $25.00', 'No additional cost'], answer: 1, explanation: '"Monthly payment option: $157.92/month (includes $3.67 instalment fee)."' },
          { id: 'r1s7q4', type: 'mcq', num: 4, text: 'What must Helen do if she does NOT want her policy to renew?', options: ['Simply do nothing', 'Call the renewals team before May 1', 'Notify Dominion in writing before April 25', 'Email the company and wait for confirmation'], answer: 2, explanation: '"Your policy will renew automatically unless you contact us before April 25, 2026. To decline renewal, you must notify us in writing."' },
          { id: 'r1s7q5', type: 'mcq', num: 5, text: 'Which deductible applies specifically to water backup events?', options: ['The standard $1,000 deductible', 'The $2,500 water damage deductible', 'There is no deductible for water damage', 'The deductible for water events is $1,500'], answer: 1, explanation: '"Water damage deductible: $2,500 per claim (this deductible type applies specifically to water backup events)."' },
          { id: 'r1s7q6', type: 'dropdown', num: 6, text: 'Helen\'s policy number is ______.', options: ['DI-447382', 'DI-447832', 'DI-474832', 'DI-447823'], answer: 1, explanation: '"Your home insurance policy (#DI-447832)."' },
          { id: 'r1s7q7', type: 'dropdown', num: 7, text: 'The new annual premium is ______, up from $1,690.00.', options: ['$1,750.00', '$1,800.00', '$1,847.00', '$1,900.00'], answer: 2, explanation: '"Annual premium: $1,847.00 (previously $1,690.00)."' },
          { id: 'r1s7q8', type: 'dropdown', num: 8, text: 'The premium increase percentage is ______.', options: ['7.5%', '8.0%', '9.3%', '10.1%'], answer: 2, explanation: '"Your premium has increased by 9.3%."' },
          { id: 'r1s7q9', type: 'dropdown', num: 9, text: 'The multi-policy discount offered is up to ______.', options: ['5%', '8%', '10%', '12%'], answer: 1, explanation: '"multi-policy discount (up to 8%)."' },
          { id: 'r1s7q10', type: 'dropdown', num: 10, text: 'The new policy period runs from May 1, 2026 to ______.', options: ['April 30, 2026', 'April 30, 2027', 'May 1, 2027', 'December 31, 2027'], answer: 1, explanation: '"Policy period: May 1, 2026 – April 30, 2027."' },
          { id: 'r1s7q11', type: 'dropdown', num: 11, text: 'Additional living expenses coverage is set at ______.', options: ['$25,000', '$35,000', '$40,000', '$50,000'], answer: 2, explanation: '"Additional living expenses: $40,000."' },
        ],
      },

      // ── Set 8 ── Landlord Lease Renewal ─────────────────────────────
      {
        setNumber: 8, difficulty: 'advanced',
        title: 'Landlord — Lease Renewal & Rent Increase Notice',
        passage: `From: Teresa Morin <t.morin@silvermapleproperties.ca>
To: Aidan Clarke <aidanclarke@email.com>
Date: March 25, 2026
Subject: Lease Renewal — Unit 308, 1450 Lakeview Drive, Ottawa

Dear Aidan,

I am writing to inform you that your current one-year lease for Unit 308 at 1450 Lakeview Drive will expire on June 30, 2026. I would like to offer you the opportunity to renew.

RENEWAL OPTIONS:
1. One-year fixed lease (July 1, 2026 – June 30, 2027): Monthly rent of $1,875/month (current rent: $1,780/month — increase of $95/month, which is within Ontario's 2026 rent increase guideline of 2.5%).
2. Month-to-month tenancy: Monthly rent of $1,875/month, with either party providing 60 days' written notice to terminate.

WHAT STAYS THE SAME:
- All current lease terms remain in effect (no pets permitted, no smoking anywhere on the property, parking space #14 included).
- Utilities: hydro and internet are tenant responsibility; heat and water remain included.
- Building laundry and storage locker access continue at no additional cost.

WHAT'S NEW IN THE BUILDING:
We have completed renovations to the rooftop patio, which is now open to all residents from 8:00 AM to 10:00 PM. A new secure parcel room was also installed in the lobby in January.

NEXT STEPS:
Please let me know your decision by April 25, 2026. If I do not hear from you, Ontario tenancy law allows your tenancy to automatically continue on a month-to-month basis at the new rent. To accept the one-year renewal, please sign and return the enclosed renewal agreement.

Please feel free to call me at 613-555-0182 or reply to this email if you have any questions.

Warm regards,
Teresa Morin
Property Manager, Silver Maple Properties`,
        questions: [
          { id: 'r1s8q1', type: 'mcq', num: 1, text: 'What is the purpose of this email?', options: ['To inform Aidan that his lease will not be renewed', 'To offer Aidan lease renewal options and inform him of the new rent', 'To notify Aidan of an emergency maintenance issue', 'To invite Aidan to a building meeting'], answer: 1, explanation: 'Teresa writes "to inform you that your current one-year lease... will expire on June 30, 2026" and offers renewal options.' },
          { id: 'r1s8q2', type: 'mcq', num: 2, text: 'By how much is the monthly rent increasing?', options: ['$50/month', '$75/month', '$95/month', '$120/month'], answer: 2, explanation: '"Monthly rent of $1,875/month (current rent: $1,780/month — increase of $95/month)."' },
          { id: 'r1s8q3', type: 'mcq', num: 3, text: 'What happens if Aidan does not respond by April 25?', options: ['His tenancy ends automatically on June 30', 'His lease automatically renews for another year at the same rent', 'His tenancy continues month-to-month at the new rent', 'He will be issued an eviction notice'], answer: 2, explanation: '"Ontario tenancy law allows your tenancy to automatically continue on a month-to-month basis at the new rent."' },
          { id: 'r1s8q4', type: 'mcq', num: 4, text: 'Which utilities are included in Aidan\'s rent?', options: ['Hydro and internet', 'Hydro and heat', 'Heat and water', 'Heat, water, and internet'], answer: 2, explanation: '"hydro and internet are tenant responsibility; heat and water remain included."' },
          { id: 'r1s8q5', type: 'mcq', num: 5, text: 'What new amenity has been added to the building?', options: ['An indoor swimming pool', 'A rooftop garden with a BBQ area', 'A secure parcel room in the lobby', 'A fitness centre on the ground floor'], answer: 2, explanation: '"A new secure parcel room was also installed in the lobby in January."' },
          { id: 'r1s8q6', type: 'dropdown', num: 6, text: 'Aidan\'s current monthly rent is ______.', options: ['$1,750', '$1,780', '$1,875', '$1,900'], answer: 1, explanation: '"current rent: $1,780/month."' },
          { id: 'r1s8q7', type: 'dropdown', num: 7, text: 'The rent increase is within Ontario\'s 2026 guideline of ______.', options: ['1.5%', '2.0%', '2.5%', '3.0%'], answer: 2, explanation: '"which is within Ontario\'s 2026 rent increase guideline of 2.5%."' },
          { id: 'r1s8q8', type: 'dropdown', num: 8, text: 'Aidan\'s parking space number is ______.', options: ['12', '14', '16', '18'], answer: 1, explanation: '"parking space #14 included."' },
          { id: 'r1s8q9', type: 'dropdown', num: 9, text: 'The rooftop patio is open to residents from 8:00 AM to ______.', options: ['9:00 PM', '10:00 PM', '11:00 PM', 'midnight'], answer: 1, explanation: '"open to all residents from 8:00 AM to 10:00 PM."' },
          { id: 'r1s8q10', type: 'dropdown', num: 10, text: 'Aidan must respond to the renewal offer by ______.', options: ['April 15, 2026', 'April 25, 2026', 'May 1, 2026', 'June 30, 2026'], answer: 1, explanation: '"Please let me know your decision by April 25, 2026."' },
          { id: 'r1s8q11', type: 'dropdown', num: 11, text: 'The month-to-month option requires ______ days\' written notice to terminate.', options: ['30', '45', '60', '90'], answer: 2, explanation: '"Month-to-month tenancy... with either party providing 60 days\' written notice to terminate."' },
        ],
      },

      // ── Set 9 ── School Cafeteria Policy ─────────────────────────────
      {
        setNumber: 9, difficulty: 'intermediate',
        title: 'School District — New Cafeteria Nutrition Policy',
        passage: `From: Westfield School District <communications@westfieldsd.ca>
To: Parents and Guardians — Westfield Elementary & Middle Schools
Date: April 2, 2026
Subject: Important Update — Nutrition and Cafeteria Policy, Effective September 2026

Dear Parent or Guardian,

We are pleased to announce the implementation of Westfield School District's updated Nutrition and Cafeteria Policy, which will take effect at the beginning of the 2026–2027 school year (September 2, 2026). This policy was developed with input from parents, teachers, nutritionists, and the school board, and is designed to promote healthy habits and improve student focus and energy throughout the school day.

KEY CHANGES:
1. Sugar-sweetened beverages (soft drinks, fruit-flavoured drinks with added sugar) will no longer be sold in school cafeterias or vending machines. Water, milk (dairy and unsweetened plant-based), and 100% fruit juice (one serving) will remain available.
2. All cafeteria meals will follow Canada's Food Guide, ensuring each meal includes a protein, whole grain, and at least one vegetable or fruit serving.
3. "Treat days" — previously held every Friday — will be reduced to once per month. On treat days, one low-sugar dessert option will be available.
4. A new allergen management system will be introduced: all dishes will be labelled with the top 14 allergens (including peanuts, tree nuts, dairy, eggs, gluten, and shellfish).

WHAT THIS MEANS FOR PACKED LUNCHES:
The policy does NOT restrict what students bring from home. However, we ask that families avoid sending nut products, as we have students with severe allergies. Existing allergen-free guidelines for classrooms remain in place.

We will host an information session for parents on May 14, 2026, at 6:30 PM in the school gymnasium to answer questions and share sample meal plans. A full copy of the policy is available at westfieldsd.ca/nutrition.

Thank you for your partnership in supporting student health and wellbeing.

Westfield School District Administration`,
        questions: [
          { id: 'r1s9q1', type: 'mcq', num: 1, text: 'What is the main purpose of this letter?', options: ['To ask parents to volunteer in the cafeteria', 'To announce and explain an updated cafeteria and nutrition policy', 'To report a food safety incident at the school', 'To request dietary information from all students'], answer: 1, explanation: 'The letter announces "the implementation of Westfield School District\'s updated Nutrition and Cafeteria Policy."' },
          { id: 'r1s9q2', type: 'mcq', num: 2, text: 'Which beverages will still be available in school cafeterias?', options: ['Soft drinks and milk', 'Only water and milk', 'Water, milk, and 100% fruit juice', 'Sports drinks and water'], answer: 2, explanation: '"Water, milk (dairy and unsweetened plant-based), and 100% fruit juice (one serving) will remain available."' },
          { id: 'r1s9q3', type: 'mcq', num: 3, text: 'How has the "treat day" frequency changed?', options: ['Treat days have been completely eliminated', 'They have changed from daily to once per week', 'They have changed from once per week to once per month', 'They remain unchanged at once per week'], answer: 2, explanation: '"\'Treat days\' — previously held every Friday — will be reduced to once per month."' },
          { id: 'r1s9q4', type: 'mcq', num: 4, text: 'Does the new policy restrict what children bring from home?', options: ['Yes, all lunches must follow Canada\'s Food Guide', 'Yes, no sugar is allowed in packed lunches', 'No, the policy does not restrict packed lunches, though nut products are discouraged', 'No restrictions at all are mentioned for packed lunches'], answer: 2, explanation: '"The policy does NOT restrict what students bring from home. However, we ask that families avoid sending nut products."' },
          { id: 'r1s9q5', type: 'mcq', num: 5, text: 'How many allergens will be labelled on all cafeteria dishes under the new system?', options: ['8', '10', '12', '14'], answer: 3, explanation: '"all dishes will be labelled with the top 14 allergens (including peanuts, tree nuts, dairy, eggs, gluten, and shellfish)."' },
          { id: 'r1s9q6', type: 'dropdown', num: 6, text: 'The new policy will take effect on ______.', options: ['January 6, 2026', 'April 2, 2026', 'September 2, 2026', 'September 7, 2026'], answer: 2, explanation: '"which will take effect at the beginning of the 2026–2027 school year (September 2, 2026)."' },
          { id: 'r1s9q7', type: 'dropdown', num: 7, text: 'The parent information session will be held on ______ at 6:30 PM.', options: ['April 14, 2026', 'May 1, 2026', 'May 14, 2026', 'September 2, 2026'], answer: 2, explanation: '"We will host an information session for parents on May 14, 2026, at 6:30 PM."' },
          { id: 'r1s9q8', type: 'dropdown', num: 8, text: 'The parent information session will be held in the school ______.', options: ['cafeteria', 'gymnasium', 'library', 'auditorium'], answer: 1, explanation: '"at 6:30 PM in the school gymnasium."' },
          { id: 'r1s9q9', type: 'dropdown', num: 9, text: 'The full policy document is available at ______.', options: ['westfieldsd.ca/policy', 'westfieldsd.ca/nutrition', 'westfieldsd.ca/cafeteria', 'westfieldsd.ca/health'], answer: 1, explanation: '"A full copy of the policy is available at westfieldsd.ca/nutrition."' },
          { id: 'r1s9q10', type: 'dropdown', num: 10, text: 'Each cafeteria meal will include a protein, whole grain, and at least one ______.', options: ['dessert option', 'vitamin supplement', 'vegetable or fruit serving', 'dairy product'], answer: 2, explanation: '"each meal includes a protein, whole grain, and at least one vegetable or fruit serving."' },
          { id: 'r1s9q11', type: 'dropdown', num: 11, text: 'The policy was developed with input from parents, teachers, nutritionists, and ______.', options: ['the ministry of education', 'the school board', 'a dietitian council', 'Health Canada'], answer: 1, explanation: '"developed with input from parents, teachers, nutritionists, and the school board."' },
        ],
      },

      // ── Set 10 ── Online Order Delay ─────────────────────────────────
      {
        setNumber: 10, difficulty: 'advanced',
        title: 'Online Retailer — Order Delay & Shipping Update',
        passage: `From: NorthShop Canada <orders@northshop.ca>
To: Fatima Al-Hassan <fatima.alhassan@email.com>
Date: April 4, 2026
Subject: Update on Your Order #NS-2026-08817

Dear Fatima,

Thank you for shopping with NorthShop Canada. We are writing to inform you of an unexpected delay affecting your order #NS-2026-08817, placed on March 28, 2026.

YOUR ORDER:
- Portable Bluetooth Speaker (Model: SoundWave Pro X) × 1 — $89.99
- Laptop Sleeve — 15-inch Charcoal Grey × 1 — $34.99
- USB-C Hub 7-Port × 1 — $44.99
Order subtotal: $169.97 + HST ($22.10) = $192.07 (paid via Visa ending 3312)

WHAT HAPPENED:
The USB-C Hub you ordered is currently out of stock at our fulfillment centre due to an unexpected supplier delay. Your SoundWave Pro X speaker and laptop sleeve are ready to ship and will be sent within 24–48 hours. The USB-C Hub is expected to be restocked by April 14–18, 2026.

YOUR OPTIONS:
1. Wait for the full order: We can ship everything together when the hub arrives (estimated delivery: April 21–25).
2. Split shipment: We ship the speaker and sleeve now at no extra cost; the hub ships when restocked (additional 3–5 business days after restocking).
3. Cancel the USB-C Hub: We will refund $44.99 + applicable tax ($5.85) = $50.84 to your Visa ending 3312 within 3–5 business days.

Please reply to this email or contact us at 1-800-555-0311 by April 8, 2026 to let us know your preference. If we do not hear from you by April 8, we will proceed with Option 1 (ship together).

We apologize for this inconvenience and have applied a $10 discount code to your account (code: DELAY10) for use on your next order.

NorthShop Canada Customer Care`,
        questions: [
          { id: 'r1s10q1', type: 'mcq', num: 1, text: 'Why is Fatima\'s order delayed?', options: ['The warehouse lost her order', 'The USB-C Hub is out of stock due to a supplier delay', 'The payment on her Visa card was declined', 'Bad weather disrupted the shipping route'], answer: 1, explanation: '"The USB-C Hub you ordered is currently out of stock at our fulfillment centre due to an unexpected supplier delay."' },
          { id: 'r1s10q2', type: 'mcq', num: 2, text: 'Which items are ready to ship immediately?', options: ['Only the USB-C Hub', 'The SoundWave Pro X speaker and laptop sleeve', 'The laptop sleeve and USB-C Hub only', 'None of the items are ready'], answer: 1, explanation: '"Your SoundWave Pro X speaker and laptop sleeve are ready to ship and will be sent within 24–48 hours."' },
          { id: 'r1s10q3', type: 'mcq', num: 3, text: 'What happens if Fatima does not respond by April 8?', options: ['Her entire order will be cancelled', 'NorthShop will ship the ready items immediately', 'NorthShop will ship everything together (Option 1)', 'A refund will be issued automatically'], answer: 2, explanation: '"If we do not hear from you by April 8, we will proceed with Option 1 (ship together)."' },
          { id: 'r1s10q4', type: 'mcq', num: 4, text: 'If Fatima cancels the USB-C Hub, how much will she be refunded?', options: ['$44.99', '$49.00', '$50.84', '$53.19'], answer: 2, explanation: '"refund $44.99 + applicable tax ($5.85) = $50.84 to your Visa ending 3312."' },
          { id: 'r1s10q5', type: 'mcq', num: 5, text: 'What has NorthShop done to compensate for the delay?', options: ['Offered free expedited shipping on this order', 'Applied a $10 discount code for Fatima\'s next order', 'Upgraded her to a premium speaker model', 'Waived the HST on her order'], answer: 1, explanation: '"we have applied a $10 discount code to your account (code: DELAY10) for use on your next order."' },
          { id: 'r1s10q6', type: 'dropdown', num: 6, text: 'Fatima\'s order number is ______.', options: ['NS-2026-08817', 'NS-2026-08871', 'NS-2026-08718', 'NS-2026-08178'], answer: 0, explanation: '"your order #NS-2026-08817."' },
          { id: 'r1s10q7', type: 'dropdown', num: 7, text: 'The total amount Fatima paid including HST was ______.', options: ['$169.97', '$180.07', '$192.07', '$199.97'], answer: 2, explanation: '"$169.97 + HST ($22.10) = $192.07."' },
          { id: 'r1s10q8', type: 'dropdown', num: 8, text: 'The USB-C Hub is expected to be restocked by ______.', options: ['April 8–10, 2026', 'April 14–18, 2026', 'April 21–25, 2026', 'May 1–5, 2026'], answer: 1, explanation: '"The USB-C Hub is expected to be restocked by April 14–18, 2026."' },
          { id: 'r1s10q9', type: 'dropdown', num: 9, text: 'If Fatima chooses a split shipment, the hub will arrive ______ business days after restocking.', options: ['1–2', '3–5', '5–7', '7–10'], answer: 1, explanation: '"the hub ships when restocked (additional 3–5 business days after restocking)."' },
          { id: 'r1s10q10', type: 'dropdown', num: 10, text: 'The discount code for Fatima\'s next order is ______.', options: ['SORRY10', 'WAIT10', 'DELAY10', 'LATE10'], answer: 2, explanation: '"discount code: DELAY10."' },
          { id: 'r1s10q11', type: 'dropdown', num: 11, text: 'Fatima\'s Visa card ends in ______.', options: ['3132', '3312', '3321', '3231'], answer: 1, explanation: '"paid via Visa ending 3312."' },
        ],
      },

      // ── Set 11 ── Noise Bylaw Response ───────────────────────────────
      {
        setNumber: 11, difficulty: 'easy',
        title: 'Municipal Bylaw Office — Noise Complaint Response',
        passage: `From: City of Hamilton Bylaw Services <bylaw@hamilton.ca>
To: Residence at 44 Maple Crescent
Date: April 5, 2026
Subject: Response to Noise Complaint — File #BL-2026-1144

Dear Resident,

Thank you for submitting a noise complaint (File #BL-2026-1144) regarding the property at 46 Maple Crescent. We are writing to inform you of the outcome of our investigation.

INVESTIGATION SUMMARY:
A bylaw officer visited the property on April 3, 2026 at 9:45 PM in response to your complaint about repeated late-night noise (music and gatherings). The officer confirmed that noise levels at the property at the time of the visit were within acceptable limits under the City of Hamilton Noise By-law No. 96-136. No violation was issued.

However, our records show that this address has received two previous noise complaints in the past 12 months (filed October 2025 and January 2026). The resident at 46 Maple Crescent has been issued a formal written warning, which has been placed on file. A second violation within 24 months may result in a fine of up to $500 under the City of Hamilton Noise By-law.

YOUR RIGHTS AS A COMPLAINANT:
If the noise issue continues, you may:
1. Submit a new complaint online at hamilton.ca/bylaw or by calling 905-546-2489 (available 24 hours).
2. Document the noise with timestamps and, if possible, a brief recording on your phone.
3. Request mediation through the Hamilton Community Mediation Service at no cost (905-526-8100).

All complaints are handled confidentially. The identity of complainants is not disclosed to the subject of the investigation.

We encourage neighbours to attempt direct communication where safe to do so, as many disputes are resolved without bylaw involvement.

Thank you for helping maintain a peaceful community.

Bylaw Services Division — City of Hamilton`,
        questions: [
          { id: 'r1s11q1', type: 'mcq', num: 1, text: 'What was the result of the bylaw officer\'s investigation?', options: ['A $500 fine was issued to 46 Maple Crescent', 'The noise at the time of the visit was within acceptable limits; no violation was issued', 'The property was shut down for 30 days', 'A warning was issued to both properties'], answer: 1, explanation: '"noise levels at the property at the time of the visit were within acceptable limits... No violation was issued."' },
          { id: 'r1s11q2', type: 'mcq', num: 2, text: 'How many previous noise complaints had 46 Maple Crescent received in the past 12 months?', options: ['None', 'One', 'Two', 'Three'], answer: 2, explanation: '"our records show that this address has received two previous noise complaints in the past 12 months."' },
          { id: 'r1s11q3', type: 'mcq', num: 3, text: 'What could happen if the resident at 46 Maple Crescent receives another violation within 24 months?', options: ['Immediate eviction from the property', 'A fine of up to $500', 'Criminal charges for disturbing the peace', 'Automatic suspension of their noise complaint history'], answer: 1, explanation: '"A second violation within 24 months may result in a fine of up to $500."' },
          { id: 'r1s11q4', type: 'mcq', num: 4, text: 'What is the Community Mediation Service option?', options: ['A free service provided by the city to help resolve neighbour disputes', 'A paid service that requires a court order', 'A service provided only for repeat offenders', 'A service that forces the noisy neighbour to relocate'], answer: 0, explanation: '"Request mediation through the Hamilton Community Mediation Service at no cost."' },
          { id: 'r1s11q5', type: 'mcq', num: 5, text: 'Is the complainant\'s identity disclosed to the person being investigated?', options: ['Yes, always, to maintain transparency', 'Only if a fine is issued', 'No — complaints are handled confidentially', 'Only with the complainant\'s written permission'], answer: 2, explanation: '"All complaints are handled confidentially. The identity of complainants is not disclosed to the subject of the investigation."' },
          { id: 'r1s11q6', type: 'dropdown', num: 6, text: 'The complaint file number is ______.', options: ['BL-2026-1114', 'BL-2026-1141', 'BL-2026-1144', 'BL-2026-4114'], answer: 2, explanation: '"File #BL-2026-1144."' },
          { id: 'r1s11q7', type: 'dropdown', num: 7, text: 'The bylaw officer visited the property on April 3, 2026 at ______ PM.', options: ['8:45', '9:15', '9:45', '10:15'], answer: 2, explanation: '"A bylaw officer visited the property on April 3, 2026 at 9:45 PM."' },
          { id: 'r1s11q8', type: 'dropdown', num: 8, text: 'The resident at 46 Maple Crescent received a formal ______.', options: ['court summons', 'written warning', '$250 fine', 'eviction notice'], answer: 1, explanation: '"The resident at 46 Maple Crescent has been issued a formal written warning."' },
          { id: 'r1s11q9', type: 'dropdown', num: 9, text: 'Bylaw complaints can be submitted 24 hours a day by calling ______.', options: ['905-526-8100', '905-546-2489', '905-555-0142', '905-555-0188'], answer: 1, explanation: '"Submit a new complaint online at hamilton.ca/bylaw or by calling 905-546-2489 (available 24 hours)."' },
          { id: 'r1s11q10', type: 'dropdown', num: 10, text: 'The previous complaints were filed in October 2025 and ______.', options: ['November 2025', 'December 2025', 'January 2026', 'February 2026'], answer: 2, explanation: '"two previous noise complaints in the past 12 months (filed October 2025 and January 2026)."' },
          { id: 'r1s11q11', type: 'dropdown', num: 11, text: 'The applicable noise bylaw is City of Hamilton By-law No. ______.', options: ['96-113', '96-136', '96-163', '96-316'], answer: 1, explanation: '"within acceptable limits under the City of Hamilton Noise By-law No. 96-136."' },
        ],
      },

      // ── Set 12 ── Hybrid Work Policy ─────────────────────────────────
      {
        setNumber: 12, difficulty: 'intermediate',
        title: 'Employer — Hybrid Work Policy Announcement',
        passage: `From: Rachel Stern, Chief People Officer <r.stern@clearpath.ca>
To: All Staff — Clearpath Consulting
Date: March 31, 2026
Subject: Hybrid Work Policy — Effective May 1, 2026

Dear Clearpath Team,

After extensive consultation with department heads, employee working groups, and our external HR advisors, Clearpath Consulting is implementing a formal Hybrid Work Policy effective May 1, 2026.

KEY ELEMENTS OF THE POLICY:

In-Office Requirements: All permanent employees are expected to work from the office a minimum of three days per week. Your team lead will coordinate specific in-office days to ensure team overlap. The expectation is that most teams will align on a Tuesday–Thursday core in-office schedule, with flexibility on Mondays and Fridays.

Remote Days: On remote days, employees are expected to be available during core hours (10:00 AM–3:00 PM Eastern), regardless of their time zone. Cameras should be on for team meetings unless technical issues are present.

Equipment: Employees working remotely are responsible for maintaining a reliable internet connection. The company will provide one ergonomic chair, one external monitor, and a laptop stand for home offices through our Equipment Request Portal (clearpath.ca/equipment). Requests must be submitted by April 20, 2026.

Exceptions: Roles that are fully remote by original designation (certain IT and contractor positions) are exempt. Employees with documented medical accommodations remain in effect. Requests for additional remote flexibility will be reviewed by HR on a case-by-case basis.

We understand change is not always easy. A full FAQ and a recorded town hall session from last week are available at clearpath.ca/hybridwork. One-on-one meetings with your manager to discuss any concerns are encouraged and can be scheduled through the HR portal.

Thank you for your continued dedication. We believe this balanced approach will strengthen our culture while preserving the flexibility many of us value.

Rachel Stern
Chief People Officer, Clearpath Consulting`,
        questions: [
          { id: 'r1s12q1', type: 'mcq', num: 1, text: 'What is the minimum number of days per week all permanent employees must work from the office?', options: ['One day', 'Two days', 'Three days', 'Four days'], answer: 2, explanation: '"All permanent employees are expected to work from the office a minimum of three days per week."' },
          { id: 'r1s12q2', type: 'mcq', num: 2, text: 'What are "core hours" on remote days?', options: ['9:00 AM–5:00 PM Eastern', '9:00 AM–12:00 PM Eastern', '10:00 AM–3:00 PM Eastern', '10:00 AM–4:00 PM Eastern'], answer: 2, explanation: '"employees are expected to be available during core hours (10:00 AM–3:00 PM Eastern)."' },
          { id: 'r1s12q3', type: 'mcq', num: 3, text: 'What home office equipment will Clearpath provide?', options: ['A desk, chair, and monitor', 'A laptop, chair, and mouse', 'An ergonomic chair, external monitor, and laptop stand', 'A second monitor, keyboard, and webcam'], answer: 2, explanation: '"The company will provide one ergonomic chair, one external monitor, and a laptop stand for home offices."' },
          { id: 'r1s12q4', type: 'mcq', num: 4, text: 'Who is exempt from the in-office requirement?', options: ['All employees who prefer remote work', 'Employees with more than 5 years of seniority', 'Certain IT and contractor positions originally designated as fully remote, and medical accommodation holders', 'Department managers and team leads'], answer: 2, explanation: '"Roles that are fully remote by original designation (certain IT and contractor positions) are exempt. Employees with documented medical accommodations remain in effect."' },
          { id: 'r1s12q5', type: 'mcq', num: 5, text: 'Where can employees find the FAQ and town hall recording?', options: ['In a PDF attached to this email', 'On the HR portal clearpath.ca/hybridwork', 'Distributed by their team lead in the next meeting', 'Only available in the office on request'], answer: 1, explanation: '"A full FAQ and a recorded town hall session from last week are available at clearpath.ca/hybridwork."' },
          { id: 'r1s12q6', type: 'dropdown', num: 6, text: 'The hybrid work policy takes effect on ______.', options: ['April 1, 2026', 'April 20, 2026', 'May 1, 2026', 'June 1, 2026'], answer: 2, explanation: '"implementing a formal Hybrid Work Policy effective May 1, 2026."' },
          { id: 'r1s12q7', type: 'dropdown', num: 7, text: 'Equipment requests must be submitted by ______.', options: ['April 15, 2026', 'April 20, 2026', 'April 30, 2026', 'May 1, 2026'], answer: 1, explanation: '"Requests must be submitted by April 20, 2026."' },
          { id: 'r1s12q8', type: 'dropdown', num: 8, text: 'The expected core in-office days for most teams are ______.', options: ['Monday to Wednesday', 'Tuesday to Thursday', 'Wednesday to Friday', 'Monday, Wednesday, Friday'], answer: 1, explanation: '"most teams will align on a Tuesday–Thursday core in-office schedule."' },
          { id: 'r1s12q9', type: 'dropdown', num: 9, text: 'The sender\'s title is ______.', options: ['Chief Executive Officer', 'Chief Operating Officer', 'Chief People Officer', 'Head of Human Resources'], answer: 2, explanation: '"Rachel Stern, Chief People Officer."' },
          { id: 'r1s12q10', type: 'dropdown', num: 10, text: 'Requests for additional remote flexibility are reviewed by ______ on a case-by-case basis.', options: ['the CEO', 'the department head', 'HR', 'the company board'], answer: 2, explanation: '"Requests for additional remote flexibility will be reviewed by HR on a case-by-case basis."' },
          { id: 'r1s12q11', type: 'dropdown', num: 11, text: 'On remote days, cameras should be on for team meetings unless ______.', options: ['the employee is working from a café', 'technical issues are present', 'the meeting is with external clients', 'the employee has prior approval'], answer: 1, explanation: '"Cameras should be on for team meetings unless technical issues are present."' },
        ],
      },

      // ── Set 13 ── Doctor Referral ─────────────────────────────────────
      {
        setNumber: 13, difficulty: 'advanced',
        title: "Doctor's Office — Test Results & Specialist Referral",
        passage: `From: Dr. Ana Pereira <dr.pereira@northtownfamilyhealth.ca>
To: Thomas Bergstrom <t.bergstrom@email.com>
Date: April 6, 2026
Subject: Your Recent Blood Work Results & Specialist Referral

Dear Thomas,

Thank you for visiting our clinic last week. Your blood work results are now available, and I would like to share them with you and discuss next steps.

YOUR RESULTS SUMMARY:
- Complete blood count (CBC): Normal
- Liver enzymes (ALT/AST): Mildly elevated — ALT at 52 U/L (normal range: 7–40 U/L)
- Fasting glucose: 6.1 mmol/L (normal: below 6.0 — borderline; monitoring recommended)
- Total cholesterol: 5.4 mmol/L (borderline high — target below 5.2)
- Thyroid (TSH): Normal

WHAT THIS MEANS:
The mildly elevated liver enzymes may be related to a medication you are taking, recent alcohol use, or other factors. This is not an emergency, but it warrants follow-up. Your borderline fasting glucose and cholesterol readings also suggest we should monitor your cardiovascular risk factors more closely over the coming months.

NEXT STEPS:
I have referred you to Dr. Mark Elias, a gastroenterologist at Sunridge Medical Specialists. His office will contact you within 5 business days to schedule an appointment. In the meantime, I recommend: (1) avoiding alcohol for at least 3 weeks before your specialist visit; (2) a low-saturated-fat diet to help bring your cholesterol into target range; and (3) a 30-minute walk most days of the week.

A repeat blood panel is scheduled for 3 months from now. Please book this through our front desk at 905-555-0161.

If you have any questions or experience new symptoms — particularly abdominal pain, jaundice, or unusual fatigue — please call our office immediately or visit an urgent care clinic.

Kind regards,
Dr. Ana Pereira
North Town Family Health Centre`,
        questions: [
          { id: 'r1s13q1', type: 'mcq', num: 1, text: 'Why is Dr. Pereira writing to Thomas?', options: ['To reschedule his annual physical examination', 'To share his blood work results and outline next steps', 'To refer him directly to an emergency department', 'To inform him that all his results are normal'], answer: 1, explanation: 'Dr. Pereira writes: "Your blood work results are now available, and I would like to share them with you and discuss next steps."' },
          { id: 'r1s13q2', type: 'mcq', num: 2, text: 'Which test result was flagged as mildly elevated?', options: ['Complete blood count (CBC)', 'Thyroid (TSH)', 'Liver enzyme ALT', 'Fasting glucose'], answer: 2, explanation: '"Liver enzymes (ALT/AST): Mildly elevated — ALT at 52 U/L (normal range: 7–40 U/L)."' },
          { id: 'r1s13q3', type: 'mcq', num: 3, text: 'Why might Thomas\'s liver enzymes be elevated?', options: ['Due to a serious liver disease', 'Possibly due to a medication, recent alcohol use, or other factors', 'Because of his thyroid condition', 'Because his cholesterol is too high'], answer: 1, explanation: '"The mildly elevated liver enzymes may be related to a medication you are taking, recent alcohol use, or other factors."' },
          { id: 'r1s13q4', type: 'mcq', num: 4, text: 'What should Thomas call the clinic immediately about?', options: ['Questions about his diet plan', 'Booking his 3-month blood panel', 'New symptoms such as abdominal pain, jaundice, or unusual fatigue', 'Confirming his specialist appointment'], answer: 2, explanation: '"If you have any questions or experience new symptoms — particularly abdominal pain, jaundice, or unusual fatigue — please call our office immediately."' },
          { id: 'r1s13q5', type: 'mcq', num: 5, text: 'Which two test results are described as "borderline" or higher than the target range?', options: ['CBC and TSH', 'ALT and CBC', 'Fasting glucose and total cholesterol', 'TSH and total cholesterol'], answer: 2, explanation: 'Fasting glucose at 6.1 mmol/L is "borderline" and total cholesterol at 5.4 is "borderline high — target below 5.2."' },
          { id: 'r1s13q6', type: 'dropdown', num: 6, text: 'Thomas has been referred to Dr. Mark Elias, a ______.', options: ['cardiologist', 'endocrinologist', 'gastroenterologist', 'hepatologist'], answer: 2, explanation: '"Dr. Mark Elias, a gastroenterologist at Sunridge Medical Specialists."' },
          { id: 'r1s13q7', type: 'dropdown', num: 7, text: 'The specialist\'s office will contact Thomas within ______ business days.', options: ['2', '3', '5', '7'], answer: 2, explanation: '"His office will contact you within 5 business days to schedule an appointment."' },
          { id: 'r1s13q8', type: 'dropdown', num: 8, text: 'Thomas should avoid alcohol for at least ______ before his specialist visit.', options: ['1 week', '2 weeks', '3 weeks', '1 month'], answer: 2, explanation: '"avoiding alcohol for at least 3 weeks before your specialist visit."' },
          { id: 'r1s13q9', type: 'dropdown', num: 9, text: 'Thomas\'s ALT level was ______ U/L, compared to the normal upper limit of 40 U/L.', options: ['42', '48', '52', '58'], answer: 2, explanation: '"ALT at 52 U/L (normal range: 7–40 U/L)."' },
          { id: 'r1s13q10', type: 'dropdown', num: 10, text: 'A repeat blood panel is scheduled in ______ from now.', options: ['1 month', '2 months', '3 months', '6 months'], answer: 2, explanation: '"A repeat blood panel is scheduled for 3 months from now."' },
          { id: 'r1s13q11', type: 'dropdown', num: 11, text: 'To book the repeat blood panel, Thomas should contact the clinic at ______.', options: ['905-555-0142', '905-555-0161', '905-555-0173', '905-555-0188'], answer: 1, explanation: '"Please book this through our front desk at 905-555-0161."' },
        ],
      },

      // ── Set 14 ── Condo Pet Policy ────────────────────────────────────
      {
        setNumber: 14, difficulty: 'easy',
        title: 'Condo Board — Pet Policy Amendment Notice',
        passage: `From: Thornwood Place Condominium Corporation <board@thornwoodplace.ca>
To: All Unit Owners and Residents
Date: April 1, 2026
Subject: Amendment to Declaration — Pet Ownership Policy (Effective June 1, 2026)

Dear Owner/Resident,

The Board of Directors of Thornwood Place Condominium Corporation (TPCC) hereby provides formal notice of an amendment to the condominium declaration regarding pet ownership on the property, in accordance with the Condominium Act of Ontario, 1998.

CURRENT POLICY:
The current declaration prohibits ALL pets in the building with no exceptions.

AMENDED POLICY (Effective June 1, 2026):
Following a unit owner vote conducted February 28, 2026, at which 68% of voting owners approved the amendment (the Condominium Act requires a minimum of 66⅔%), the following changes take effect:

1. Residents may keep one (1) cat or one (1) dog per unit. Dogs must weigh 10 kg or less at full maturity.
2. All pets must be registered with the Property Management Office within 30 days of acquisition or within 30 days of June 1, 2026, for existing pets.
3. Dogs must be leashed at all times in common areas. Cats are not permitted in common areas.
4. Pet owners are financially responsible for any damage caused by their pet to common elements or other units.
5. Fish tanks, small caged birds, and reptiles (in enclosed terrariums) remain permitted without registration.
6. Emotional support animals and service animals remain fully permitted under existing provincial law, independent of this policy.

REGISTRATION PROCESS:
A Pet Registration Form is available at the property management office (Room 101) and online at thornwoodplace.ca/pets. A one-time registration fee of $75 per pet applies. Registration must include proof of current rabies vaccination for all dogs and cats.

Owners who do not comply with registration by the deadline may receive a Notice of Violation and a compliance fine of $250 under TPCC By-law No. 4.

For questions, contact Property Management at 416-555-0177 or board@thornwoodplace.ca.

Thornwood Place Board of Directors`,
        questions: [
          { id: 'r1s14q1', type: 'mcq', num: 1, text: 'What was the result of the February 28 unit owner vote?', options: ['The vote failed, and the pet ban continues', '68% of voting owners approved the amendment, meeting the required threshold', '66⅔% voted against the amendment', 'The vote was postponed due to insufficient participation'], answer: 1, explanation: '"68% of voting owners approved the amendment (the Condominium Act requires a minimum of 66⅔%)."' },
          { id: 'r1s14q2', type: 'mcq', num: 2, text: 'Under the new policy, what size restriction applies to dogs?', options: ['Dogs must weigh under 5 kg', 'Dogs must weigh 10 kg or less at full maturity', 'Dogs may be any size but must be kept indoors', 'There is no size restriction; any breed is permitted'], answer: 1, explanation: '"Dogs must weigh 10 kg or less at full maturity."' },
          { id: 'r1s14q3', type: 'mcq', num: 3, text: 'What must be included when registering a dog or cat?', options: ['A photo ID of the owner and pet', 'Proof of current rabies vaccination', 'A signed neighbour consent form', 'A veterinary health certificate from the past 6 months'], answer: 1, explanation: '"Registration must include proof of current rabies vaccination for all dogs and cats."' },
          { id: 'r1s14q4', type: 'mcq', num: 4, text: 'Which pets are permitted in common areas?', options: ['Cats and dogs on leash', 'Dogs on leash only; cats are not allowed in common areas', 'Cats only; dogs must use a private entrance', 'No pets are allowed in common areas'], answer: 1, explanation: '"Dogs must be leashed at all times in common areas. Cats are not permitted in common areas."' },
          { id: 'r1s14q5', type: 'mcq', num: 5, text: 'What do emotional support animals and service animals NOT need to comply with?', options: ['Provincial law', 'This condominium pet policy', 'Any rules regarding common areas', 'Vaccination requirements under provincial law'], answer: 1, explanation: '"Emotional support animals and service animals remain fully permitted under existing provincial law, independent of this policy."' },
          { id: 'r1s14q6', type: 'dropdown', num: 6, text: 'The new pet policy takes effect on ______.', options: ['March 1, 2026', 'April 1, 2026', 'June 1, 2026', 'July 1, 2026'], answer: 2, explanation: '"AMENDED POLICY (Effective June 1, 2026)."' },
          { id: 'r1s14q7', type: 'dropdown', num: 7, text: 'The one-time pet registration fee is ______.', options: ['$50', '$75', '$100', '$250'], answer: 1, explanation: '"A one-time registration fee of $75 per pet applies."' },
          { id: 'r1s14q8', type: 'dropdown', num: 8, text: 'Owners who fail to register on time may receive a compliance fine of ______.', options: ['$75', '$150', '$200', '$250'], answer: 3, explanation: '"a compliance fine of $250 under TPCC By-law No. 4."' },
          { id: 'r1s14q9', type: 'dropdown', num: 9, text: 'Existing pet owners must register within ______ days of June 1, 2026.', options: ['15', '30', '45', '60'], answer: 1, explanation: '"within 30 days of June 1, 2026, for existing pets."' },
          { id: 'r1s14q10', type: 'dropdown', num: 10, text: 'The Pet Registration Form can be obtained at Room ______ in the building.', options: ['001', '101', '201', '301'], answer: 1, explanation: '"available at the property management office (Room 101)."' },
          { id: 'r1s14q11', type: 'dropdown', num: 11, text: 'Items that remain permitted without registration include fish tanks, small caged birds, and ______.', options: ['hamsters', 'guinea pigs', 'rabbits', 'reptiles in enclosed terrariums'], answer: 3, explanation: '"Fish tanks, small caged birds, and reptiles (in enclosed terrariums) remain permitted without registration."' },
        ],
      },

      // ── Set 15 ── University Tuition Increase ─────────────────────────
      {
        setNumber: 15, difficulty: 'intermediate',
        title: 'University Registrar — Tuition Fee Increase',
        passage: `From: Office of the Registrar — Maple Ridge University <registrar@mru.ca>
To: All Registered Students
Date: April 3, 2026
Subject: 2026–2027 Tuition and Fee Schedule — Important Notice

Dear Student,

Maple Ridge University is writing to inform you of approved tuition and ancillary fee rates for the 2026–2027 academic year. These rates were approved by the Board of Governors on March 20, 2026, following a review of operating costs, provincial funding levels, and peer institution benchmarks.

TUITION CHANGES FOR DOMESTIC UNDERGRADUATE STUDENTS:
Effective September 2026, domestic undergraduate tuition will increase by 3.2%, in line with the provincial tuition framework. This translates to an increase of approximately $288 per year for full-time students based on the current average annual tuition of $9,000.

ANCILLARY FEES:
Ancillary fees (student services, athletics, bus pass, student union) increase by an average of 1.8% across all programs. The student transit pass — which provides unlimited regional transit access for the full academic year — remains the best-value component at $185/year (increasing from $175/year). More detailed breakdowns by program are available at mru.ca/fees.

INTERNATIONAL STUDENTS:
International undergraduate tuition varies by program. Sciences and Engineering programs will see a 5% increase; Humanities and Social Sciences will increase by 4%; Business programs will increase by 6%. The International Student Bursary, providing up to $3,000 in annual assistance, has been expanded to support 200 additional students in 2026–2027.

FINANCIAL AID:
All students facing financial difficulty are encouraged to contact the Financial Aid Office at finaid@mru.ca or 1-800-555-0238. Applications for emergency bursaries, payment plans, and OSAP support are available year-round. The deadline to apply for major bursaries for the 2026–2027 year is June 15, 2026.

Your tuition invoice for Fall 2026 will be posted to your student account in July 2026. The first payment due date is August 15, 2026.

Office of the Registrar — Maple Ridge University`,
        questions: [
          { id: 'r1s15q1', type: 'mcq', num: 1, text: 'Who approved the new tuition rates?', options: ['The provincial Ministry of Education', 'The Student Union by referendum', 'The Board of Governors', 'The University President unilaterally'], answer: 2, explanation: '"These rates were approved by the Board of Governors on March 20, 2026."' },
          { id: 'r1s15q2', type: 'mcq', num: 2, text: 'By approximately how much will domestic undergraduate tuition increase per year?', options: ['$144', '$220', '$288', '$350'], answer: 2, explanation: '"an increase of approximately $288 per year for full-time students based on the current average annual tuition of $9,000."' },
          { id: 'r1s15q3', type: 'mcq', num: 3, text: 'Which international program will see the highest tuition increase?', options: ['Sciences and Engineering at 5%', 'Humanities and Social Sciences at 4%', 'Business programs at 6%', 'Arts programs at 3%'], answer: 2, explanation: '"Business programs will increase by 6%."' },
          { id: 'r1s15q4', type: 'mcq', num: 4, text: 'What has changed about the International Student Bursary?', options: ['It has been reduced due to budget constraints', 'It has been eliminated for 2026–2027', 'It has been expanded to support 200 additional students', 'The amount has been increased from $2,000 to $3,000'], answer: 2, explanation: '"The International Student Bursary... has been expanded to support 200 additional students in 2026–2027."' },
          { id: 'r1s15q5', type: 'mcq', num: 5, text: 'When will students receive their Fall 2026 tuition invoice?', options: ['April 2026', 'June 2026', 'July 2026', 'August 2026'], answer: 2, explanation: '"Your tuition invoice for Fall 2026 will be posted to your student account in July 2026."' },
          { id: 'r1s15q6', type: 'dropdown', num: 6, text: 'Domestic undergraduate tuition will increase by ______ per cent.', options: ['2.5%', '3.0%', '3.2%', '3.5%'], answer: 2, explanation: '"domestic undergraduate tuition will increase by 3.2%."' },
          { id: 'r1s15q7', type: 'dropdown', num: 7, text: 'The student transit pass increases from $175/year to ______.', options: ['$180', '$185', '$190', '$195'], answer: 1, explanation: '"The student transit pass... remains the best-value component at $185/year (increasing from $175/year)."' },
          { id: 'r1s15q8', type: 'dropdown', num: 8, text: 'The deadline to apply for major bursaries for 2026–2027 is ______.', options: ['April 15, 2026', 'May 31, 2026', 'June 15, 2026', 'July 1, 2026'], answer: 2, explanation: '"The deadline to apply for major bursaries for the 2026–2027 year is June 15, 2026."' },
          { id: 'r1s15q9', type: 'dropdown', num: 9, text: 'The first tuition payment due date for Fall 2026 is ______.', options: ['July 15, 2026', 'July 31, 2026', 'August 15, 2026', 'September 1, 2026'], answer: 2, explanation: '"The first payment due date is August 15, 2026."' },
          { id: 'r1s15q10', type: 'dropdown', num: 10, text: 'The International Student Bursary provides up to ______ in annual assistance.', options: ['$1,500', '$2,000', '$2,500', '$3,000'], answer: 3, explanation: '"The International Student Bursary, providing up to $3,000 in annual assistance."' },
          { id: 'r1s15q11', type: 'dropdown', num: 11, text: 'Ancillary fees increase by an average of ______ across all programs.', options: ['1.2%', '1.5%', '1.8%', '2.0%'], answer: 2, explanation: '"Ancillary fees... increase by an average of 1.8% across all programs."' },
        ],
      },

      // ── Set 16 ── Pest Control Access ─────────────────────────────────
      {
        setNumber: 16, difficulty: 'advanced',
        title: 'Property Manager — Pest Control Access Notice',
        passage: `From: Derek Sawyer <d.sawyer@urbanedge-pm.ca>
To: All Residents — Hazel Park Apartments, 88 Hazel Drive
Date: April 7, 2026
Subject: Mandatory Pest Control Inspection & Treatment — April 22–25, 2026

Dear Resident,

We are writing to advise you that Hazel Park Apartments will be undergoing a scheduled pest control inspection and preventive treatment program from Tuesday, April 22 to Friday, April 25, 2026. This program is conducted annually to maintain a pest-free environment for all residents and is administered by certified pest control technicians from GreenShield Pest Solutions.

YOUR UNIT'S SCHEDULED DATE:
Each unit has been assigned a specific date and two-hour access window for the technician visit. Your unit's date and time will be communicated by a notice placed under your door no later than April 14, 2026.

ACCESS REQUIREMENTS:
- You are NOT required to be present during the inspection, but you must unlock your unit.
- If you cannot unlock your unit during your scheduled window, contact our office by April 19 to arrange key access (a building key will be used with your prior written consent, signed on file).
- Remove pets from the unit during treatment. If you have fish tanks, cover them and turn off the filter 30 minutes before the technician arrives and for 2 hours after treatment.
- Clear under sinks, behind the fridge, and around baseboards to allow access to treatment areas.

POST-TREATMENT PRECAUTIONS:
- Keep windows open for at least 2 hours after treatment to ventilate the unit.
- Wipe down any food preparation surfaces before use.
- The treatment products used are Health Canada–approved and safe for adults and children once dry (approximately 30 minutes after application).

If you have allergies, asthma, or chemical sensitivities, please notify us before April 17, 2026, and we will schedule an alternative low-chemical treatment for your unit.

For questions, contact the management office at 905-555-0199 or d.sawyer@urbanedge-pm.ca.

Derek Sawyer
Property Manager, Urban Edge Property Management`,
        questions: [
          { id: 'r1s16q1', type: 'mcq', num: 1, text: 'Is the pest control inspection mandatory, and must residents be home?', options: ['Yes, it is mandatory, and residents must be present the entire time', 'Yes it is mandatory, but residents do not need to be present — only the unit must be unlocked', 'No, residents can opt out if they prefer', 'Yes, it is mandatory and residents must sign a consent form in person'], answer: 1, explanation: '"You are NOT required to be present during the inspection, but you must unlock your unit."' },
          { id: 'r1s16q2', type: 'mcq', num: 2, text: 'By when will residents receive their specific access window notice?', options: ['April 7, 2026', 'April 14, 2026', 'April 19, 2026', 'April 22, 2026'], answer: 1, explanation: '"Your unit\'s date and time will be communicated by a notice placed under your door no later than April 14, 2026."' },
          { id: 'r1s16q3', type: 'mcq', num: 3, text: 'What should residents with fish tanks do before the technician arrives?', options: ['Remove the fish tank from the unit entirely', 'Cover the tank and turn off the filter 30 minutes before the visit', 'Cover the tank and leave the filter running throughout', 'Seal the fish tank with plastic wrap for 2 hours during treatment'], answer: 1, explanation: '"cover them and turn off the filter 30 minutes before the technician arrives and for 2 hours after treatment."' },
          { id: 'r1s16q4', type: 'mcq', num: 4, text: 'When is the treatment considered safe for adults and children?', options: ['Immediately after application', 'After 15 minutes', 'Once dry, approximately 30 minutes after application', 'After 2 hours when the windows have been open'], answer: 2, explanation: '"safe for adults and children once dry (approximately 30 minutes after application)."' },
          { id: 'r1s16q5', type: 'mcq', num: 5, text: 'What should residents with chemical sensitivities do?', options: ['Vacate their unit during the four-day program', 'Purchase their own alternative treatment products', 'Notify management before April 17 to arrange a low-chemical alternative', 'Request to opt out of the mandatory program'], answer: 2, explanation: '"If you have allergies, asthma, or chemical sensitivities, please notify us before April 17, 2026, and we will schedule an alternative low-chemical treatment."' },
          { id: 'r1s16q6', type: 'dropdown', num: 6, text: 'The pest control program runs from April 22 to ______.', options: ['April 23', 'April 24', 'April 25', 'April 26'], answer: 2, explanation: '"from Tuesday, April 22 to Friday, April 25, 2026."' },
          { id: 'r1s16q7', type: 'dropdown', num: 7, text: 'The pest control company is called ______.', options: ['SafeGuard Pest Solutions', 'GreenShield Pest Solutions', 'ClearPath Pest Control', 'EcoSafe Exterminators'], answer: 1, explanation: '"certified pest control technicians from GreenShield Pest Solutions."' },
          { id: 'r1s16q8', type: 'dropdown', num: 8, text: 'Windows should be kept open for at least ______ after treatment.', options: ['30 minutes', '1 hour', '2 hours', '4 hours'], answer: 2, explanation: '"Keep windows open for at least 2 hours after treatment to ventilate the unit."' },
          { id: 'r1s16q9', type: 'dropdown', num: 9, text: 'Residents who cannot unlock their unit should contact the office by ______.', options: ['April 14', 'April 17', 'April 19', 'April 22'], answer: 2, explanation: '"contact our office by April 19 to arrange key access."' },
          { id: 'r1s16q10', type: 'dropdown', num: 10, text: 'Residents should clear under sinks, behind the fridge, and around ______ before the visit.', options: ['windows', 'doors', 'baseboards', 'furniture'], answer: 2, explanation: '"Clear under sinks, behind the fridge, and around baseboards to allow access to treatment areas."' },
          { id: 'r1s16q11', type: 'dropdown', num: 11, text: 'The notification of specific access windows will be delivered ______.', options: ['by email', 'by phone call', 'under the resident\'s door', 'posted on the building bulletin board'], answer: 2, explanation: '"Your unit\'s date and time will be communicated by a notice placed under your door."' },
        ],
      },

      // ── Set 17 ── Property Tax Reassessment ──────────────────────────
      {
        setNumber: 17, difficulty: 'easy',
        title: 'Municipal Assessment — Property Tax Reassessment',
        passage: `From: Municipal Property Assessment Corporation (MPAC)
To: Property Owner — 12 Ridgewood Lane, Brampton, ON
Date: April 1, 2026
Subject: Property Assessment Notice — 2026 Reassessment

Dear Property Owner,

The Municipal Property Assessment Corporation (MPAC) has completed its 2026 assessment of your property. This notice provides your assessed value, which will be used by your municipality to calculate your 2026–2027 property tax.

ASSESSMENT DETAILS:
- Property address: 12 Ridgewood Lane, Brampton, ON
- Roll number: 2110.350.010.28200
- 2026 assessed value: $875,000
- Previous assessed value (2024): $795,000
- Change: +$80,000 (+10.1%)

The assessed value reflects the estimated market value of your property as of January 1, 2026, and takes into account recent comparable sales in your area, improvements made to the property, and current market conditions. Brampton properties in this area have seen strong demand due to transit expansion and new commercial development nearby.

YOUR ESTIMATED TAX IMPACT:
This is an estimate only, as tax rates are set by Brampton City Council and the Region of Peel. Based on the current combined residential tax rate of approximately 0.97%, your estimated 2026 property tax would be approximately $8,488/year (or ~$707/month if you are enrolled in the monthly payment plan), up from approximately $7,712/year based on the previous assessment.

YOUR RIGHT TO REQUEST A RECONSIDERATION:
If you believe the assessed value does not accurately reflect your property's market value, you have the right to file a Request for Reconsideration (RfR) by June 30, 2026. There is no fee to file an RfR. More information is available at mpac.ca or by calling 1-866-296-6722.

Phased-in assessments ensure that significant increases are introduced gradually over four years to limit the impact on taxpayers. Please see mpac.ca/phasedin for details on whether phased-in values apply to your property.

MPAC — 1-866-296-6722 | mpac.ca`,
        questions: [
          { id: 'r1s17q1', type: 'mcq', num: 1, text: 'What is the purpose of this assessment notice?', options: ['To inform the owner of an unpaid property tax bill', 'To provide the 2026 assessed value used for property tax calculation', 'To announce a new municipal tax rate for Brampton', 'To request the owner pay for a property inspection'], answer: 1, explanation: '"This notice provides your assessed value, which will be used by your municipality to calculate your 2026–2027 property tax."' },
          { id: 'r1s17q2', type: 'mcq', num: 2, text: 'By what percentage did the assessed value increase from 2024 to 2026?', options: ['5.5%', '8.0%', '10.1%', '12.5%'], answer: 2, explanation: '"Change: +$80,000 (+10.1%)."' },
          { id: 'r1s17q3', type: 'mcq', num: 3, text: 'Why did property values in this area of Brampton increase?', options: ['New schools and parks were built nearby', 'Government-subsidized housing was introduced', 'Transit expansion and new commercial development', 'The city of Brampton changed zoning laws'], answer: 2, explanation: '"Brampton properties in this area have seen strong demand due to transit expansion and new commercial development nearby."' },
          { id: 'r1s17q4', type: 'mcq', num: 4, text: 'What does a phased-in assessment do?', options: ['Freezes the property assessment for 4 years', 'Reduces the tax rate for properties that increase in value', 'Introduces significant assessment increases gradually over four years', 'Eliminates the need for annual property tax payments'], answer: 2, explanation: '"Phased-in assessments ensure that significant increases are introduced gradually over four years to limit the impact on taxpayers."' },
          { id: 'r1s17q5', type: 'mcq', num: 5, text: 'What is the fee to file a Request for Reconsideration?', options: ['$50 processing fee', '$100 administration fee', '$250 per property', 'There is no fee'], answer: 3, explanation: '"There is no fee to file an RfR."' },
          { id: 'r1s17q6', type: 'dropdown', num: 6, text: 'The 2026 assessed value of the property is ______.', options: ['$795,000', '$850,000', '$875,000', '$900,000'], answer: 2, explanation: '"2026 assessed value: $875,000."' },
          { id: 'r1s17q7', type: 'dropdown', num: 7, text: 'The estimated 2026 annual property tax is approximately ______.', options: ['$7,712', '$8,200', '$8,488', '$9,000'], answer: 2, explanation: '"your estimated 2026 property tax would be approximately $8,488/year."' },
          { id: 'r1s17q8', type: 'dropdown', num: 8, text: 'The combined residential tax rate used in the estimate is approximately ______.', options: ['0.77%', '0.87%', '0.97%', '1.07%'], answer: 2, explanation: '"the current combined residential tax rate of approximately 0.97%."' },
          { id: 'r1s17q9', type: 'dropdown', num: 9, text: 'The deadline to file a Request for Reconsideration is ______.', options: ['April 30, 2026', 'May 31, 2026', 'June 30, 2026', 'September 30, 2026'], answer: 2, explanation: '"you have the right to file a Request for Reconsideration (RfR) by June 30, 2026."' },
          { id: 'r1s17q10', type: 'dropdown', num: 10, text: 'The assessed value reflects the estimated market value as of ______.', options: ['January 1, 2025', 'January 1, 2026', 'April 1, 2026', 'December 31, 2025'], answer: 1, explanation: '"The assessed value reflects the estimated market value of your property as of January 1, 2026."' },
          { id: 'r1s17q11', type: 'dropdown', num: 11, text: 'Monthly property tax payments would be approximately ______.', options: ['$650', '$685', '$707', '$725'], answer: 2, explanation: '"~$707/month if you are enrolled in the monthly payment plan."' },
        ],
      },

      // ── Set 18 ── Travel Insurance Claim ─────────────────────────────
      {
        setNumber: 18, difficulty: 'intermediate',
        title: 'Travel Insurance — Claim Approval & Reimbursement',
        passage: `From: Voyager Travel Insurance <claims@voyagerinsurance.ca>
To: Christine Osei <c.osei@email.com>
Date: April 5, 2026
Subject: Claim Approval — File #VTI-2026-04419

Dear Ms. Osei,

We are pleased to inform you that your travel insurance claim (File #VTI-2026-04419) has been approved. Thank you for your patience while our team reviewed your documentation.

CLAIM SUMMARY:
- Insured: Christine Osei
- Policy number: VPI-887-22C
- Trip destination: Costa Rica (February 14 – March 2, 2026)
- Claim type: Emergency medical / Trip interruption
- Submitted documentation: Medical reports, receipts, and airline rebooking confirmation — all received February 28, 2026

APPROVED AMOUNTS:
- Emergency medical treatment (Hospital San José, February 17–19): $3,840.00 (USD converted at rate of 1.365 = CAD $5,241.60)
- Emergency physician fees: $620.00 CAD
- Prescription medications during trip: $184.30 CAD
- Return flight rebooking (Air Canada, economy class, February 21): $1,175.00 CAD
- Hotel accommodation during recovery (2 nights, February 19–21): $364.00 CAD

TOTAL APPROVED: CAD $7,584.90
LESS: Policy deductible ($500.00)
NET REIMBURSEMENT: CAD $7,084.90

The reimbursement will be deposited via EFT (Electronic Funds Transfer) to your bank account on file within 5 to 7 business days. If you do not receive the deposit by April 16, 2026, please contact us at 1-888-555-0294.

Please note that your claim for trip cancellation insurance on the unused Costa Rica hotel nights (February 17–21) has been reviewed separately under your policy and was NOT approved, as the policy excludes reimbursement for pre-booked hotel stays when the cause of interruption is a medical condition that was diagnosed prior to the policy purchase date. Our team has mailed a detailed explanation letter to your home address.

Voyager Travel Insurance — Claims Division
1-888-555-0294 | voyagerinsurance.ca`,
        questions: [
          { id: 'r1s18q1', type: 'mcq', num: 1, text: 'What is the purpose of this email?', options: ['To request additional documentation for a pending claim', 'To inform Christine that her travel insurance claim has been approved', 'To cancel Christine\'s travel insurance policy', 'To deny Christine\'s full claim for trip cancellation'], answer: 1, explanation: '"We are pleased to inform you that your travel insurance claim (File #VTI-2026-04419) has been approved."' },
          { id: 'r1s18q2', type: 'mcq', num: 2, text: 'Why was the trip cancellation portion of the claim NOT approved?', options: ['The hotel did not provide valid receipts', 'Christine did not submit the claim within the required timeframe', 'The medical condition was diagnosed before the policy purchase date', 'Trip cancellation insurance was not included in Christine\'s policy'], answer: 2, explanation: '"the policy excludes reimbursement for pre-booked hotel stays when the cause of interruption is a medical condition that was diagnosed prior to the policy purchase date."' },
          { id: 'r1s18q3', type: 'mcq', num: 3, text: 'How will the reimbursement be sent to Christine?', options: ['By cheque mailed to her home address', 'Via EFT to her bank account on file', 'By wire transfer to her travel credit card', 'By a prepaid Visa gift card'], answer: 1, explanation: '"The reimbursement will be deposited via EFT (Electronic Funds Transfer) to your bank account on file."' },
          { id: 'r1s18q4', type: 'mcq', num: 4, text: 'What is the net reimbursement amount after the deductible?', options: ['$3,840.00', '$7,084.90', '$7,584.90', '$8,084.90'], answer: 1, explanation: '"TOTAL APPROVED: CAD $7,584.90 — LESS: Policy deductible ($500.00) — NET REIMBURSEMENT: CAD $7,084.90."' },
          { id: 'r1s18q5', type: 'mcq', num: 5, text: 'If Christine does not receive her deposit by April 16, what should she do?', options: ['Resubmit her entire claim application', 'Contact her bank to investigate the delay', 'Contact Voyager Travel Insurance at 1-888-555-0294', 'Mail a formal written inquiry to Voyager\'s head office'], answer: 2, explanation: '"If you do not receive the deposit by April 16, 2026, please contact us at 1-888-555-0294."' },
          { id: 'r1s18q6', type: 'dropdown', num: 6, text: 'Christine\'s claim file number is ______.', options: ['VTI-2026-04149', 'VTI-2026-04419', 'VTI-2026-04491', 'VTI-2026-04914'], answer: 1, explanation: '"your travel insurance claim (File #VTI-2026-04419)."' },
          { id: 'r1s18q7', type: 'dropdown', num: 7, text: 'Christine was hospitalized from February ______ to 19.', options: ['15', '16', '17', '18'], answer: 2, explanation: '"Emergency medical treatment (Hospital San José, February 17–19)."' },
          { id: 'r1s18q8', type: 'dropdown', num: 8, text: 'The USD-to-CAD conversion rate used for the hospital bill was ______.', options: ['1.285', '1.310', '1.365', '1.420'], answer: 2, explanation: '"USD converted at rate of 1.365 = CAD $5,241.60."' },
          { id: 'r1s18q9', type: 'dropdown', num: 9, text: 'The policy deductible is ______.', options: ['$250', '$500', '$750', '$1,000'], answer: 1, explanation: '"LESS: Policy deductible ($500.00)."' },
          { id: 'r1s18q10', type: 'dropdown', num: 10, text: 'Christine\'s return flight rebooking cost ______ CAD.', options: ['$975.00', '$1,075.00', '$1,175.00', '$1,275.00'], answer: 2, explanation: '"Return flight rebooking (Air Canada, economy class, February 21): $1,175.00 CAD."' },
          { id: 'r1s18q11', type: 'dropdown', num: 11, text: 'The claim documentation was received on ______.', options: ['February 21, 2026', 'February 28, 2026', 'March 2, 2026', 'April 1, 2026'], answer: 1, explanation: '"all received February 28, 2026."' },
        ],
      },

      // ── Set 19 ── Workplace Health & Safety ──────────────────────────
      {
        setNumber: 19, difficulty: 'advanced',
        title: 'Workplace Safety Committee — Updated H&S Protocols',
        passage: `From: WorkSafe Committee <safety@granitelogistics.ca>
To: All Employees — Granite Logistics Inc.
Date: April 3, 2026
Subject: Updated Workplace Health & Safety Protocols — Effective Immediately

Dear Team,

Granite Logistics Inc.'s Joint Health and Safety Committee (JHSC) has completed its quarterly review and is issuing updated protocols in three areas following our internal audit on March 20, 2026. These changes are effective immediately for all employees, contractors, and visitors.

1. WAREHOUSE AISLE CLEARANCE:
All walking aisles in the warehouse must maintain a minimum clearance of 1.2 metres at all times. Pallets, equipment, or materials left in aisles — even temporarily — are a leading cause of slip-and-fall incidents. Team leads are empowered to immediately remove any obstruction and issue a verbal warning. A third violation by any individual within a 90-day period will be escalated to the Operations Manager and may result in formal corrective action.

2. PERSONAL PROTECTIVE EQUIPMENT (PPE) COMPLIANCE:
Effective immediately, all warehouse and loading dock employees must wear steel-toed safety boots, high-visibility vests, and safety glasses at all times while on the warehouse floor — not just when operating equipment. Office staff entering the warehouse are required to wear high-visibility vests (available at the entrance kiosk). PPE non-compliance will now be tracked in our safety management system.

3. INCIDENT REPORTING:
All workplace incidents — including near-misses — must be reported to a supervisor within 2 hours of occurrence and documented using the updated Incident Report Form (available on the company intranet at granitelogistics.ca/safety). The previous 24-hour reporting window has been reduced to 2 hours in compliance with updated Ontario Occupational Health and Safety Act guidelines.

TRAINING REMINDER:
Annual Workplace Safety Awareness training is mandatory for all employees. Those who have not completed this year's module must do so by April 30, 2026. Check your training status in the HR portal.

Please direct questions to the JHSC Co-Chairs: Maria Santos (employee representative, ext. 204) or Devon Blake (management representative, ext. 311).

Joint Health and Safety Committee — Granite Logistics Inc.`,
        questions: [
          { id: 'r1s19q1', type: 'mcq', num: 1, text: 'What triggered these protocol updates?', options: ['A serious workplace injury reported in January 2026', 'An internal audit conducted on March 20, 2026', 'New federal workplace safety legislation effective April 1', 'A complaint filed by a worker to the Ministry of Labour'], answer: 1, explanation: '"following our internal audit on March 20, 2026."' },
          { id: 'r1s19q2', type: 'mcq', num: 2, text: 'What is the minimum aisle clearance required in the warehouse?', options: ['0.9 metres', '1.0 metres', '1.2 metres', '1.5 metres'], answer: 2, explanation: '"All walking aisles in the warehouse must maintain a minimum clearance of 1.2 metres at all times."' },
          { id: 'r1s19q3', type: 'mcq', num: 3, text: 'What happens after a third aisle violation within 90 days?', options: ['The employee is immediately terminated', 'The issue is escalated to the Operations Manager and may result in formal corrective action', 'The employee is required to complete safety retraining', 'A fine is applied to the department budget'], answer: 1, explanation: '"A third violation by any individual within a 90-day period will be escalated to the Operations Manager and may result in formal corrective action."' },
          { id: 'r1s19q4', type: 'mcq', num: 4, text: 'What PPE are office staff required to wear when entering the warehouse?', options: ['Steel-toed boots and safety glasses', 'High-visibility vests only', 'High-visibility vests and safety glasses', 'All the same PPE as warehouse staff'], answer: 1, explanation: '"Office staff entering the warehouse are required to wear high-visibility vests (available at the entrance kiosk)."' },
          { id: 'r1s19q5', type: 'mcq', num: 5, text: 'Why was the incident reporting window reduced from 24 hours to 2 hours?', options: ['To reduce paperwork processing time', 'To comply with updated Ontario Occupational Health and Safety Act guidelines', 'Due to a recent serious injury that went unreported for too long', 'Because the previous rule was not in line with company policy'], answer: 1, explanation: '"in compliance with updated Ontario Occupational Health and Safety Act guidelines."' },
          { id: 'r1s19q6', type: 'dropdown', num: 6, text: 'Incidents must now be reported to a supervisor within ______ of occurrence.', options: ['30 minutes', '1 hour', '2 hours', '4 hours'], answer: 2, explanation: '"All workplace incidents... must be reported to a supervisor within 2 hours of occurrence."' },
          { id: 'r1s19q7', type: 'dropdown', num: 7, text: 'Annual Workplace Safety Awareness training must be completed by ______.', options: ['April 15, 2026', 'April 30, 2026', 'May 15, 2026', 'May 31, 2026'], answer: 1, explanation: '"must do so by April 30, 2026."' },
          { id: 'r1s19q8', type: 'dropdown', num: 8, text: 'The Incident Report Form is available on the intranet at ______.', options: ['granitelogistics.ca/forms', 'granitelogistics.ca/hr', 'granitelogistics.ca/safety', 'granitelogistics.ca/incidents'], answer: 2, explanation: '"using the updated Incident Report Form (available on the company intranet at granitelogistics.ca/safety)."' },
          { id: 'r1s19q9', type: 'dropdown', num: 9, text: 'The employee JHSC co-chair is Maria Santos, reachable at extension ______.', options: ['104', '204', '211', '311'], answer: 1, explanation: '"Maria Santos (employee representative, ext. 204)."' },
          { id: 'r1s19q10', type: 'dropdown', num: 10, text: 'PPE non-compliance will be tracked in the company\'s ______.', options: ['HR portal', 'safety management system', 'operations database', 'training records system'], answer: 1, explanation: '"PPE non-compliance will now be tracked in our safety management system."' },
          { id: 'r1s19q11', type: 'dropdown', num: 11, text: 'These protocols apply to employees, contractors, and ______.', options: ['management only', 'union members', 'visitors', 'supervisors only'], answer: 2, explanation: '"effective immediately for all employees, contractors, and visitors."' },
        ],
      },

      // ── Set 20 ── Community Center Cancellation ───────────────────────
      {
        setNumber: 20, difficulty: 'intermediate',
        title: 'Community Centre — Program Cancellation & Alternatives',
        passage: `From: Westside Community Centre <programs@westsidecc.ca>
To: Registered Participants — Spring 2026 Programs
Date: April 6, 2026
Subject: Important Notice — Cancellation of Select Spring Programs

Dear Participant,

We are writing to inform you that due to an unexpected shortfall in the seasonal program budget and a lower-than-anticipated registration rate, Westside Community Centre has made the difficult decision to cancel the following Spring 2026 programs:

CANCELLED PROGRAMS (effective immediately):
1. Beginner Watercolour Painting — Thursdays, 6:00–8:00 PM (8-week session)
2. Adult Conversational Spanish — Saturdays, 10:00 AM–12:00 PM (10-week session)
3. Youth Photography Workshop — Sundays, 2:00–4:00 PM (6-week session)

We sincerely apologize for this disruption, particularly for those who have already registered and made arrangements to attend.

REFUNDS:
Full refunds will be issued to all registered participants within 10 business days. If you paid by credit card, the refund will appear on your statement within the standard processing time of 3–5 business days after our refund is issued. If you paid by cheque or cash, a refund cheque will be mailed to your address on file.

ALTERNATIVE OPTIONS:
We want to support you in continuing your learning journey. Below are alternatives within our network:

- Watercolour Painting: Hillcrest Arts Centre (hillcrestarts.ca) is offering the same class starting April 20. Call 905-555-0162 to register.
- Conversational Spanish: A 10-week online option is offered by the YMCA Learning Hub (ymcalearning.ca). Registration closes April 15.
- Youth Photography: The Eastside Community Centre has one remaining spot in their Sunday workshop. Call 416-555-0198 immediately if interested.

As a gesture of goodwill, all affected participants will receive a 15% discount code by email within 3 business days for use on any future Westside Community Centre program registration.

We deeply value your support and participation. If you have questions or concerns, please contact us at 905-555-0177 or programs@westsidecc.ca.

Westside Community Centre Programs Team`,
        questions: [
          { id: 'r1s20q1', type: 'mcq', num: 1, text: 'Why were these programs cancelled?', options: ['The instructors resigned without notice', 'Due to a budget shortfall and lower-than-expected registration', 'The centre is undergoing renovations during the spring', 'New provincial regulations required programme cancellations'], answer: 1, explanation: '"due to an unexpected shortfall in the seasonal program budget and a lower-than-anticipated registration rate."' },
          { id: 'r1s20q2', type: 'mcq', num: 2, text: 'How will participants who paid by cash receive their refund?', options: ['As a credit toward a future program', 'As a cheque mailed to their address on file', 'Via EFT to their bank account', 'By picking up cash at the community centre front desk'], answer: 1, explanation: '"If you paid by cheque or cash, a refund cheque will be mailed to your address on file."' },
          { id: 'r1s20q3', type: 'mcq', num: 3, text: 'What should a participant interested in the Eastside Youth Photography spot do?', options: ['Email the Eastside Community Centre directly', 'Register online at eastsidecc.ca immediately', 'Call 416-555-0198 immediately, as only one spot remains', 'Join the Westside waiting list for next semester'], answer: 2, explanation: '"The Eastside Community Centre has one remaining spot... Call 416-555-0198 immediately if interested."' },
          { id: 'r1s20q4', type: 'mcq', num: 4, text: 'What goodwill offer is being made to all affected participants?', options: ['A free registration for any one program in the fall session', 'A 10% discount on their next Westside registration', 'A 15% discount code for use on any future Westside program', 'An invitation to a free community event this summer'], answer: 2, explanation: '"all affected participants will receive a 15% discount code by email within 3 business days for use on any future Westside Community Centre program registration."' },
          { id: 'r1s20q5', type: 'mcq', num: 5, text: 'What is the deadline to register for the YMCA\'s online Spanish course?', options: ['April 6, 2026', 'April 15, 2026', 'April 20, 2026', 'April 30, 2026'], answer: 1, explanation: '"A 10-week online option is offered by the YMCA Learning Hub (ymcalearning.ca). Registration closes April 15."' },
          { id: 'r1s20q6', type: 'dropdown', num: 6, text: 'Full refunds will be issued within ______ business days.', options: ['5', '7', '10', '14'], answer: 2, explanation: '"Full refunds will be issued to all registered participants within 10 business days."' },
          { id: 'r1s20q7', type: 'dropdown', num: 7, text: 'Credit card refunds will appear on statements within ______ business days after the refund is issued.', options: ['1–2', '2–3', '3–5', '5–7'], answer: 2, explanation: '"the refund will appear on your statement within the standard processing time of 3–5 business days after our refund is issued."' },
          { id: 'r1s20q8', type: 'dropdown', num: 8, text: 'The Hillcrest Arts Centre watercolour class starts on ______.', options: ['April 10', 'April 15', 'April 20', 'April 27'], answer: 2, explanation: '"Hillcrest Arts Centre (hillcrestarts.ca) is offering the same class starting April 20."' },
          { id: 'r1s20q9', type: 'dropdown', num: 9, text: 'The discount code will be emailed to affected participants within ______ business days.', options: ['1', '2', '3', '5'], answer: 2, explanation: '"will receive a 15% discount code by email within 3 business days."' },
          { id: 'r1s20q10', type: 'dropdown', num: 10, text: 'The cancelled Adult Conversational Spanish was a ______ session.', options: ['6-week', '8-week', '10-week', '12-week'], answer: 2, explanation: '"Adult Conversational Spanish — Saturdays, 10:00 AM–12:00 PM (10-week session)."' },
          { id: 'r1s20q11', type: 'dropdown', num: 11, text: 'The Watercolour alternative is at Hillcrest Arts Centre. To register, participants should call ______.', options: ['905-555-0162', '905-555-0177', '416-555-0198', '905-555-0199'], answer: 0, explanation: '"Hillcrest Arts Centre (hillcrestarts.ca)... Call 905-555-0162 to register."' },
        ],
      },

    ], // end R1.sets
  },

  R2: {
    partId: 'R2',
    partLabel: 'Reading to Apply a Diagram',
    icon: '📊',
    timeLimitMinutes: 13,
    totalQuestions: 8,
    sets: [
        {
            "setNumber": 1,
            "difficulty": "easy",
            "title": "Community Centre Weekly Schedule",
            "passage": "The Riverside Community Centre has updated its spring program schedule. All classes run for eight weeks starting the week of April 7th. Registration is now open online at www.riversidecc.ca or in person at the front desk. Early bird pricing is available until March 28th — register before that date and save fifteen percent on all program fees.\n\nPlease note that the pool will be closed for maintenance from April 14th to April 18th. All aquatic programs during that week will be cancelled and participants will receive a pro-rated refund. The gym remains open during pool maintenance.\n\nChildren's programs require a parent or guardian to remain in the building during the class. The centre provides free Wi-Fi in the lobby and café area for parents who wish to work while waiting. Parking is free for the first two hours; after that, it's three dollars per hour.",
            "visualType": "schedule_table",
            "visualTitle": "Spring Program Schedule — April 7 to May 30",
            "visualData": [
                [
                    "Program",
                    "Day",
                    "Time",
                    "Age Group",
                    "Room",
                    "Fee (8 weeks)",
                    "Instructor"
                ],
                [
                    "Yoga Flow",
                    "Monday",
                    "9:00–10:00 AM",
                    "Adults 18+",
                    "Studio A",
                    "$96",
                    "Sarah M."
                ],
                [
                    "Tot Swim",
                    "Monday",
                    "10:30–11:15 AM",
                    "Ages 3–5",
                    "Pool",
                    "$72",
                    "Mike R."
                ],
                [
                    "Zumba",
                    "Tuesday",
                    "6:30–7:30 PM",
                    "Adults 18+",
                    "Studio B",
                    "$88",
                    "Diana K."
                ],
                [
                    "Kids Art",
                    "Wednesday",
                    "4:00–5:00 PM",
                    "Ages 6–10",
                    "Room 204",
                    "$80",
                    "Priya S."
                ],
                [
                    "Senior Fitness",
                    "Wednesday",
                    "10:00–11:00 AM",
                    "Ages 60+",
                    "Studio A",
                    "$64",
                    "Tom H."
                ],
                [
                    "Aqua Aerobics",
                    "Thursday",
                    "7:00–8:00 PM",
                    "Adults 18+",
                    "Pool",
                    "$104",
                    "Mike R."
                ],
                [
                    "Youth Basketball",
                    "Friday",
                    "4:30–6:00 PM",
                    "Ages 11–15",
                    "Gymnasium",
                    "$112",
                    "Coach Davis"
                ],
                [
                    "Family Swim",
                    "Saturday",
                    "10:00–11:30 AM",
                    "All Ages",
                    "Pool",
                    "$60/family",
                    "Lifeguard on duty"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s1q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "A parent wants to enrol their four-year-old in a swimming class. Which program should they register for?",
                    "options": [
                        "Aqua Aerobics",
                        "Tot Swim",
                        "Family Swim",
                        "Youth Basketball"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s1q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "How much would Yoga Flow cost if you register before March 28th?",
                    "options": [
                        "$72.00",
                        "$76.80",
                        "$81.60",
                        "$88.00"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s1q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "Which programs will be affected by the pool maintenance closure on April 14–18?",
                    "options": [
                        "Yoga Flow and Zumba",
                        "Tot Swim, Aqua Aerobics, and Family Swim",
                        "Kids Art and Senior Fitness",
                        "All programs that week"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s1q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "A 62-year-old resident wants a low-impact class during the daytime. Which program is best suited?",
                    "options": [
                        "Yoga Flow on Monday morning",
                        "Senior Fitness on Wednesday morning",
                        "Aqua Aerobics on Thursday evening",
                        "Zumba on Tuesday evening"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s1q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "Who teaches the most programs at the centre?",
                    "options": [
                        "Sarah M.",
                        "Diana K.",
                        "Mike R.",
                        "Coach Davis"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s1q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "Which is the most expensive program for an individual?",
                    "options": [
                        "Yoga Flow",
                        "Aqua Aerobics",
                        "Youth Basketball",
                        "Zumba"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s1q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "A parent drops their child off for Kids Art and waits in the lobby. If they parked at 3:30 PM and leave at 5:15 PM, how much will parking cost?",
                    "options": [
                        "Free",
                        "$3.00",
                        "$6.00",
                        "$9.00"
                    ],
                    "answer": 0,
                    "explanation": ""
                },
                {
                    "id": "r2s1q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "According to the passage, what must parents do during children's programs?",
                    "options": [
                        "Assist the instructor",
                        "Wait in the parking lot",
                        "Remain in the building",
                        "Sign a waiver at the front desk each visit"
                    ],
                    "answer": 2,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 2,
            "difficulty": "easy",
            "title": "Restaurant Menu with Dietary Labels",
            "passage": "The Green Table is a family-friendly restaurant in downtown Hamilton. We pride ourselves on offering options for all dietary needs. All menu items are clearly labelled with dietary icons so you can make informed choices.\n\nOur kitchen uses shared equipment for preparing all dishes. While we take precautions, we cannot guarantee a completely allergen-free environment. If you have a severe allergy, please inform your server before ordering.\n\nLunch specials are available Monday through Friday from 11:30 AM to 2:00 PM. Each lunch special includes an entrée and your choice of soup of the day or a house salad for a flat rate of $14.95. Lunch specials cannot be combined with other promotions or coupons.\n\nTakeout orders over $50 receive free delivery within a 5 km radius. A delivery fee of $4.95 applies to all other orders. Estimated delivery time is 30 to 45 minutes.",
            "visualType": "menu_table",
            "visualTitle": "The Green Table — Lunch Menu",
            "visualData": [
                [
                    "Item",
                    "Price",
                    "Dietary Labels"
                ],
                [
                    "Classic Burger & Fries",
                    "$16.95",
                    "—"
                ],
                [
                    "Grilled Chicken Caesar Salad",
                    "$14.95",
                    "GF (Gluten-Free)"
                ],
                [
                    "Veggie Wrap",
                    "$13.50",
                    "V (Vegetarian), DF (Dairy-Free)"
                ],
                [
                    "Salmon Teriyaki Bowl",
                    "$18.95",
                    "GF, DF"
                ],
                [
                    "Mushroom Risotto",
                    "$15.95",
                    "V, GF"
                ],
                [
                    "Fish & Chips",
                    "$17.50",
                    "—"
                ],
                [
                    "Falafel Plate",
                    "$14.50",
                    "V, VG (Vegan), GF"
                ],
                [
                    "Steak Sandwich",
                    "$19.95",
                    "—"
                ],
                [
                    "Kids' Mac & Cheese",
                    "$8.95",
                    "V"
                ],
                [
                    "Soup of the Day",
                    "$6.50",
                    "Varies — ask server"
                ],
                [
                    "House Salad",
                    "$5.95",
                    "V, VG, GF, DF"
                ]
            ],
            "visualNotes": "Dietary Key: V = Vegetarian | VG = Vegan | GF = Gluten-Free | DF = Dairy-Free",
            "questions": [
                {
                    "id": "r2s2q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "A customer is vegan and also avoids gluten. Which entrée is the best choice?",
                    "options": [
                        "Mushroom Risotto",
                        "Veggie Wrap",
                        "Falafel Plate",
                        "Grilled Chicken Caesar Salad"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s2q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "How much would a customer pay for the Grilled Chicken Caesar Salad as a lunch special with soup?",
                    "options": [
                        "$14.95 (the lunch special flat rate)",
                        "$14.95 plus $6.50 for the soup",
                        "$14.95 plus $5.95 for a salad",
                        "$21.45"
                    ],
                    "answer": 0,
                    "explanation": ""
                },
                {
                    "id": "r2s2q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "A customer orders a Steak Sandwich, Fish & Chips, and a Salmon Teriyaki Bowl for takeout delivery. Will the delivery be free?",
                    "options": [
                        "Yes, because the total exceeds $50",
                        "No, the total is $56.40 but delivery is never free",
                        "Yes, because there are three items",
                        "No, the total is only $47.45"
                    ],
                    "answer": 0,
                    "explanation": ""
                },
                {
                    "id": "r2s2q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "Which statement about allergens is true according to the passage?",
                    "options": [
                        "The kitchen has separate equipment for each dietary need",
                        "The restaurant cannot guarantee an allergen-free environment",
                        "Only gluten-free items are prepared in a separate area",
                        "Customers with allergies are advised to eat elsewhere"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s2q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "A parent wants a vegetarian option for their child. What should they order?",
                    "options": [
                        "Fish & Chips",
                        "Classic Burger & Fries",
                        "Kids' Mac & Cheese",
                        "Salmon Teriyaki Bowl"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s2q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "What is the most expensive item on the menu?",
                    "options": [
                        "Salmon Teriyaki Bowl",
                        "Fish & Chips",
                        "Steak Sandwich",
                        "Classic Burger & Fries"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s2q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "A customer arrives at 2:15 PM on a Tuesday and wants the lunch special. Can they order it?",
                    "options": [
                        "Yes, lunch specials are available all day on weekdays",
                        "No, lunch specials end at 2:00 PM",
                        "Yes, but only with a coupon",
                        "No, lunch specials are only on weekends"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s2q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "How many menu items are suitable for someone who is dairy-free?",
                    "options": [
                        "Two",
                        "Three",
                        "Four",
                        "Five"
                    ],
                    "answer": 1,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 3,
            "difficulty": "easy",
            "title": "Public Library Floor Plan and Services",
            "passage": "The Oakville Central Library is a three-floor facility serving over 180,000 residents. The library underwent a renovation in 2023 and now features updated technology, expanded programming spaces, and improved accessibility throughout the building.\n\nAll floors are wheelchair accessible via elevator. Service animals are welcome on all floors. Food and drinks are permitted only in the café area on the ground floor. Silent study areas are enforced — please silence your devices and avoid phone calls in these zones.\n\nPrinting and photocopying services are available at the self-service stations on the second floor. Black and white prints cost $0.10 per page, and colour prints cost $0.25 per page. A library card is required to use the computers. Guest passes are available at the information desk for visitors without a card (valid for one day, maximum two hours of computer use).",
            "visualType": "floor_plan_table",
            "visualTitle": "Oakville Central Library — Floor Directory",
            "visualData": [
                [
                    "Floor",
                    "Area",
                    "Features"
                ],
                [
                    "Ground Floor",
                    "Main Entrance & Lobby",
                    "Information desk, returns drop-off, self-checkout stations"
                ],
                [
                    "Ground Floor",
                    "Children's Section",
                    "Picture books, early readers, kids' computers (6 stations), story time room"
                ],
                [
                    "Ground Floor",
                    "Café Area",
                    "Seating for 30, vending machines, food and drinks permitted"
                ],
                [
                    "Second Floor",
                    "Adult Fiction & Non-Fiction",
                    "Browsing collection, new arrivals display, reading lounge"
                ],
                [
                    "Second Floor",
                    "Digital Services Hub",
                    "12 public computers, self-service printing/photocopying, scanner"
                ],
                [
                    "Second Floor",
                    "Study Rooms",
                    "4 bookable rooms (2–6 people each), whiteboard, power outlets"
                ],
                [
                    "Third Floor",
                    "Quiet Study Zone",
                    "Individual carrels (28 seats), silent zone — no phones, no talking"
                ],
                [
                    "Third Floor",
                    "Local History Archive",
                    "Microfilm readers, historical newspapers, genealogy resources"
                ],
                [
                    "Third Floor",
                    "Meeting Room A",
                    "Capacity 40 people, projector, available for community bookings"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s3q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "A parent wants to take their toddler to a library program. Which floor should they go to?",
                    "options": [
                        "Ground Floor — Children's Section",
                        "Second Floor — Study Rooms",
                        "Third Floor — Meeting Room A",
                        "Second Floor — Digital Services Hub"
                    ],
                    "answer": 0,
                    "explanation": ""
                },
                {
                    "id": "r2s3q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "A student needs to print a 20-page colour report. How much will it cost?",
                    "options": [
                        "$2.00",
                        "$3.00",
                        "$5.00",
                        "$7.50"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s3q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "Where can someone eat lunch in the library?",
                    "options": [
                        "At the reading lounge on the second floor",
                        "In the quiet study zone on the third floor",
                        "At any table on any floor",
                        "Only in the café area on the ground floor"
                    ],
                    "answer": 3,
                    "explanation": ""
                },
                {
                    "id": "r2s3q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "A visitor without a library card wants to use a computer. What should they do?",
                    "options": [
                        "Use any available computer without signing in",
                        "Get a guest pass at the information desk",
                        "Apply for a full library card, which takes two weeks",
                        "Use the computers in the children's section instead"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s3q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "A group of five students needs a quiet space to work on a project together. Where should they go?",
                    "options": [
                        "The quiet study zone on the third floor",
                        "A bookable study room on the second floor",
                        "The café area on the ground floor",
                        "Meeting Room A on the third floor"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s3q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "Someone is researching their family history in Canada. Which area is most useful?",
                    "options": [
                        "Adult Fiction & Non-Fiction on the second floor",
                        "The Digital Services Hub on the second floor",
                        "The Local History Archive on the third floor",
                        "The information desk on the ground floor"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s3q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "How many individual study carrels are available in the quiet study zone?",
                    "options": [
                        "12",
                        "20",
                        "28",
                        "40"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s3q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "Which of the following is NOT allowed in the quiet study zone?",
                    "options": [
                        "Using a laptop",
                        "Reading a book",
                        "Making a phone call",
                        "Charging your device"
                    ],
                    "answer": 2,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 4,
            "difficulty": "easy",
            "title": "Apartment Building Amenities and Rules",
            "passage": "Welcome to Lakeview Towers! As a new resident, here is a summary of our building amenities and key policies.\n\nAll amenities are available exclusively to registered residents and their guests. Each resident may have a maximum of two guests at a time in amenity areas. Guests must be accompanied by the resident at all times. Amenity hours may change on statutory holidays — check the lobby notice board for updates.\n\nThe rooftop terrace is a seasonal amenity, open from May 1st to October 15th. It is available on a first-come, first-served basis and cannot be reserved for private events. Smoking is prohibited on the terrace and all common areas.\n\nParcel delivery: Packages are accepted at the concierge desk between 8 AM and 8 PM. After 8 PM, couriers will leave packages in the secure parcel room. Residents can retrieve parcels using their key fob. Parcels must be picked up within 7 days or they will be returned to the sender.",
            "visualType": "amenity_table",
            "visualTitle": "Lakeview Towers — Amenity Directory",
            "visualData": [
                [
                    "Amenity",
                    "Location",
                    "Hours",
                    "Key Rules"
                ],
                [
                    "Fitness Centre",
                    "2nd Floor",
                    "5:00 AM – 11:00 PM daily",
                    "Closed-toe shoes required, wipe equipment after use"
                ],
                [
                    "Indoor Pool",
                    "2nd Floor",
                    "6:00 AM – 10:00 PM daily",
                    "Swim cap required for lap swim, no glass containers"
                ],
                [
                    "Party Room",
                    "Ground Floor",
                    "9:00 AM – 11:00 PM",
                    "Book 14 days in advance, $200 refundable deposit, max 40 guests"
                ],
                [
                    "Rooftop Terrace",
                    "26th Floor",
                    "8:00 AM – 10:00 PM (seasonal)",
                    "No smoking, no glass, first-come basis only"
                ],
                [
                    "Co-Working Lounge",
                    "3rd Floor",
                    "7:00 AM – 10:00 PM daily",
                    "Free Wi-Fi, printing $0.15/page, quiet zone after 6 PM"
                ],
                [
                    "Bike Storage",
                    "P1 Level",
                    "24 hours",
                    "Register bike with concierge, max 1 bike per unit"
                ],
                [
                    "Dog Run",
                    "Ground Floor (exterior)",
                    "6:00 AM – 9:00 PM",
                    "Dogs must be leashed in all other common areas, clean up required"
                ],
                [
                    "Guest Suite",
                    "4th Floor",
                    "Check-in 3 PM, Check-out 11 AM",
                    "Book 30 days in advance, $75/night, max 3 consecutive nights"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s4q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "A resident wants to host a birthday party for 35 people. Which amenity should they book?",
                    "options": [
                        "The Rooftop Terrace",
                        "The Party Room",
                        "The Co-Working Lounge",
                        "The Guest Suite"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s4q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "How far in advance must a resident book the Guest Suite?",
                    "options": [
                        "7 days",
                        "14 days",
                        "21 days",
                        "30 days"
                    ],
                    "answer": 3,
                    "explanation": ""
                },
                {
                    "id": "r2s4q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "A resident's parents are visiting for 4 nights. Can they stay in the Guest Suite?",
                    "options": [
                        "Yes, as long as they book 30 days in advance",
                        "No, the maximum stay is 3 consecutive nights",
                        "Yes, but they'll need to pay an extra fee for the 4th night",
                        "No, the Guest Suite is only for residents, not guests"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s4q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "A resident receives a package delivery at 9 PM. Where will the package be?",
                    "options": [
                        "At the concierge desk",
                        "Outside the resident's apartment door",
                        "In the secure parcel room",
                        "Returned to the sender immediately"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s4q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "A resident wants to use the Co-Working Lounge at 7 PM. What rule applies?",
                    "options": [
                        "It's closed after 6 PM",
                        "It becomes a quiet zone after 6 PM",
                        "Only residents with a work-from-home permit can use it",
                        "Printing services are unavailable in the evening"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s4q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "Can a resident reserve the rooftop terrace for a private dinner party?",
                    "options": [
                        "Yes, for a $200 deposit",
                        "Yes, if booked 14 days in advance",
                        "No, it is first-come, first-served and cannot be reserved",
                        "No, it is only open to residents without guests"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s4q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "How much would it cost to stay in the Guest Suite for 3 nights?",
                    "options": [
                        "$75",
                        "$150",
                        "$200",
                        "$225"
                    ],
                    "answer": 3,
                    "explanation": ""
                },
                {
                    "id": "r2s4q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "How long does a resident have to pick up a parcel before it's returned?",
                    "options": [
                        "3 days",
                        "5 days",
                        "7 days",
                        "14 days"
                    ],
                    "answer": 2,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 5,
            "difficulty": "easy",
            "title": "Movie Theatre Showtimes and Pricing",
            "passage": "Galaxy Cinemas Mississauga is open seven days a week. Tickets can be purchased online, at the box office, or through self-serve kiosks in the lobby. Online purchases include a $1.50 convenience fee per ticket.\n\nTuesday is Discount Day — all regular screenings are $8.99 regardless of age or time. This promotion does not apply to IMAX, 3D, or special event screenings.\n\nThe VIP Cinema experience includes luxury reclining seats, in-seat food and drink service, and a premium sound system. VIP screenings are restricted to guests aged 19 and older. Valid government-issued photo ID may be requested.\n\nFree refills are available on large popcorn and large fountain drinks. Simply bring your container back to the concession counter on the same visit.",
            "visualType": "showtime_table",
            "visualTitle": "Showtimes — Friday, April 11",
            "visualData": [
                [
                    "Movie",
                    "Format",
                    "Showtimes",
                    "Rating",
                    "Regular Price",
                    "VIP Price"
                ],
                [
                    "The Northern Ridge",
                    "Standard",
                    "1:15 PM, 4:00 PM, 7:30 PM, 10:15 PM",
                    "PG",
                    "$13.99",
                    "—"
                ],
                [
                    "Dark Waters",
                    "IMAX",
                    "3:30 PM, 7:00 PM, 10:00 PM",
                    "14A",
                    "$18.99",
                    "—"
                ],
                [
                    "Love in Lisbon",
                    "Standard",
                    "1:00 PM, 3:45 PM, 6:30 PM",
                    "PG",
                    "$13.99",
                    "$23.99"
                ],
                [
                    "Love in Lisbon",
                    "VIP",
                    "7:00 PM, 9:45 PM",
                    "PG",
                    "—",
                    "$23.99"
                ],
                [
                    "The Last Signal",
                    "3D",
                    "2:00 PM, 5:15 PM, 8:30 PM",
                    "14A",
                    "$16.99",
                    "—"
                ],
                [
                    "Adventure Planet",
                    "Standard",
                    "11:00 AM, 1:30 PM, 4:00 PM",
                    "G",
                    "$13.99",
                    "—"
                ],
                [
                    "Midnight Echo",
                    "Standard",
                    "9:00 PM, 11:30 PM",
                    "18A",
                    "$13.99",
                    "$23.99"
                ],
                [
                    "Midnight Echo",
                    "VIP",
                    "10:00 PM",
                    "18A",
                    "—",
                    "$23.99"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s5q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "A parent wants to take their 8-year-old to a movie. Which film is rated for all ages?",
                    "options": [
                        "The Northern Ridge",
                        "Dark Waters",
                        "Adventure Planet",
                        "The Last Signal"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s5q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "How much would two adult tickets to Love in Lisbon VIP at 7:00 PM cost if purchased online?",
                    "options": [
                        "$47.98",
                        "$50.98",
                        "$48.98",
                        "$51.98"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s5q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "A 17-year-old wants to see Midnight Echo in VIP. Can they?",
                    "options": [
                        "Yes, as long as they have a ticket",
                        "Yes, because the movie is rated 18A which allows minors with an adult",
                        "No, VIP screenings require guests to be 19 or older",
                        "No, the movie is only available in standard format"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s5q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "If this were a Tuesday, how much would a regular ticket to Dark Waters cost?",
                    "options": [
                        "$8.99",
                        "$13.99",
                        "$16.99",
                        "$18.99 — the discount doesn't apply to IMAX"
                    ],
                    "answer": 3,
                    "explanation": ""
                },
                {
                    "id": "r2s5q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "Which movie has the earliest showtime of the day?",
                    "options": [
                        "The Northern Ridge",
                        "Love in Lisbon",
                        "Adventure Planet",
                        "The Last Signal"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s5q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "What is the latest showtime available on Friday?",
                    "options": [
                        "10:15 PM",
                        "10:30 PM",
                        "11:00 PM",
                        "11:30 PM"
                    ],
                    "answer": 3,
                    "explanation": ""
                },
                {
                    "id": "r2s5q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "A customer buys a large popcorn. What benefit do they receive?",
                    "options": [
                        "A free drink with purchase",
                        "A $2 discount on their next visit",
                        "A free refill on the same visit",
                        "Free refills for the rest of the month"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s5q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "How many movies are available in both Standard and VIP formats?",
                    "options": [
                        "One",
                        "Two",
                        "Three",
                        "Four"
                    ],
                    "answer": 1,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 6,
            "difficulty": "intermediate",
            "title": "Airport Terminal Map and Flight Information",
            "passage": "Welcome to Toronto Pearson International Airport, Terminal 1. Please review the terminal map and your flight information carefully before proceeding to your gate.\n\nAll passengers must clear security before accessing the departure gates. Security screening is located on Level 3, between the check-in hall and the gate areas. During peak travel periods (6:00–9:00 AM and 4:00–7:00 PM), wait times can exceed 45 minutes. We recommend arriving at the airport at least 2 hours before domestic flights and 3 hours before international flights.\n\nGate changes are common and may occur up to 30 minutes before departure. Always check the nearest departure screen for the most current gate information. Free Wi-Fi is available throughout the terminal — network name: PearsonFreeWiFi.\n\nCurrency exchange is available before and after security. The post-security exchange (Gate D area) generally offers better rates. Duty-free shopping is available only after security clearance for international departures.",
            "visualType": "flight_info_table",
            "visualTitle": "Departures — Terminal 1, April 11 (Afternoon)",
            "visualData": [
                [
                    "Flight",
                    "Airline",
                    "Destination",
                    "Scheduled",
                    "Gate",
                    "Status"
                ],
                [
                    "AC 455",
                    "Air Canada",
                    "Vancouver (YVR)",
                    "1:15 PM",
                    "D32",
                    "On Time"
                ],
                [
                    "WS 248",
                    "WestJet",
                    "Calgary (YYC)",
                    "1:45 PM",
                    "D41",
                    "Delayed — 2:30 PM"
                ],
                [
                    "AC 890",
                    "Air Canada",
                    "London Heathrow (LHR)",
                    "2:00 PM",
                    "E71",
                    "Boarding"
                ],
                [
                    "DL 5678",
                    "Delta",
                    "New York (JFK)",
                    "2:20 PM",
                    "F12",
                    "On Time"
                ],
                [
                    "TS 186",
                    "Air Transat",
                    "Cancun (CUN)",
                    "2:45 PM",
                    "E55",
                    "Gate Change — E58"
                ],
                [
                    "AC 101",
                    "Air Canada",
                    "Montreal (YUL)",
                    "3:00 PM",
                    "D28",
                    "On Time"
                ],
                [
                    "UA 8812",
                    "United",
                    "Chicago (ORD)",
                    "3:15 PM",
                    "F08",
                    "Cancelled"
                ],
                [
                    "WS 654",
                    "WestJet",
                    "Halifax (YHZ)",
                    "3:30 PM",
                    "D36",
                    "On Time"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s6q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "A passenger is flying to Cancun on Air Transat. Which gate should they go to?",
                    "options": [
                        "E55",
                        "E58",
                        "E71",
                        "D41"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s6q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "A passenger booked on the United flight to Chicago sees the status. What should they do?",
                    "options": [
                        "Go directly to Gate F08 and wait",
                        "Contact United or check the airline desk because the flight is cancelled",
                        "Switch to the Air Canada Montreal flight instead",
                        "Wait at security until the flight is rescheduled"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s6q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "How long is the WestJet flight to Calgary delayed?",
                    "options": [
                        "30 minutes",
                        "45 minutes",
                        "1 hour",
                        "1 hour and 15 minutes"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s6q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "A passenger is flying internationally to London. How early should they arrive at the airport according to the passage?",
                    "options": [
                        "At least 1 hour before departure",
                        "At least 90 minutes before departure",
                        "At least 2 hours before departure",
                        "At least 3 hours before departure"
                    ],
                    "answer": 3,
                    "explanation": ""
                },
                {
                    "id": "r2s6q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "A passenger wants to buy duty-free perfume. When can they access the duty-free shops?",
                    "options": [
                        "Before security in the check-in hall",
                        "Only after clearing security for international flights",
                        "At any time at the currency exchange desk",
                        "Only in the arrivals area"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s6q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "Which flight is currently boarding?",
                    "options": [
                        "AC 455 to Vancouver",
                        "AC 890 to London Heathrow",
                        "DL 5678 to New York",
                        "AC 101 to Montreal"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s6q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "Where does the passage recommend exchanging currency for better rates?",
                    "options": [
                        "Before security in the check-in area",
                        "At the post-security exchange in the Gate D area",
                        "At any ATM in the terminal",
                        "At the airline check-in counter"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s6q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "How many flights in the table are departing from Gate area D?",
                    "options": [
                        "Two",
                        "Three",
                        "Four",
                        "Five"
                    ],
                    "answer": 2,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 7,
            "difficulty": "intermediate",
            "title": "Job Posting and Company Benefits",
            "passage": "TechBridge Solutions is hiring a Marketing Coordinator to join our growing team at our Waterloo, Ontario headquarters. This is a full-time, permanent position reporting to the Director of Marketing.\n\nThe ideal candidate has 2–4 years of experience in digital marketing, strong written communication skills, and proficiency with tools like Google Analytics, Mailchimp, and Canva. A bachelor's degree in marketing, communications, or a related field is required. Bilingualism (English/French) is considered an asset but is not required.\n\nApplications must include a resume, cover letter, and a link to a portfolio or work sample. The deadline to apply is April 25th at 11:59 PM EST. Only shortlisted candidates will be contacted for an interview. TechBridge Solutions is committed to diversity and encourages applications from all qualified candidates.",
            "visualType": "benefits_table",
            "visualTitle": "TechBridge Solutions — Employee Benefits Summary",
            "visualData": [
                [
                    "Benefit",
                    "Details",
                    "Eligibility"
                ],
                [
                    "Base Salary",
                    "$55,000 – $65,000 annually",
                    "Starts on Day 1"
                ],
                [
                    "Health & Dental",
                    "Extended health, dental, and vision coverage (80% employer-paid)",
                    "After 3-month probation"
                ],
                [
                    "RRSP Matching",
                    "Company matches contributions up to 4% of salary",
                    "After 1 year"
                ],
                [
                    "Paid Vacation",
                    "3 weeks (15 days) per year",
                    "Starts on Day 1 (pro-rated first year)"
                ],
                [
                    "Sick Days",
                    "6 paid sick days per year",
                    "Starts on Day 1"
                ],
                [
                    "Remote Work",
                    "Hybrid model: 3 days in office, 2 days remote",
                    "Starts on Day 1"
                ],
                [
                    "Professional Development",
                    "$1,500 annual budget for courses, conferences, certifications",
                    "After 6 months"
                ],
                [
                    "Parental Leave Top-Up",
                    "Top-up to 80% of salary for 12 weeks",
                    "After 1 year"
                ],
                [
                    "Employee Assistance Program",
                    "Free confidential counselling and support services",
                    "Starts on Day 1"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s7q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "What is the salary range for this position?",
                    "options": [
                        "$45,000 – $55,000",
                        "$50,000 – $60,000",
                        "$55,000 – $65,000",
                        "$60,000 – $70,000"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s7q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "When does health and dental coverage begin?",
                    "options": [
                        "On the first day of employment",
                        "After 3 months",
                        "After 6 months",
                        "After 1 year"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s7q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "A new employee starts on May 1st. When can they start using their professional development budget?",
                    "options": [
                        "Immediately",
                        "After 3 months — August 1st",
                        "After 6 months — November 1st",
                        "After 1 year — May 1st of the next year"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s7q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "Is bilingualism required for this position?",
                    "options": [
                        "Yes, English and French are both required",
                        "No, but it is considered an asset",
                        "Yes, for customer-facing duties",
                        "Only if the candidate wants to work in the Quebec office"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s7q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "How many days per week does the employee work from home?",
                    "options": [
                        "One",
                        "Two",
                        "Three",
                        "Five — fully remote"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s7q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "What must applicants include with their application?",
                    "options": [
                        "Resume, cover letter, and three references",
                        "Resume, cover letter, and a portfolio or work sample",
                        "Resume and a video introduction",
                        "Resume, transcript, and a writing test"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s7q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "If an employee earning $60,000 contributes 4% to their RRSP, how much will the company match per year?",
                    "options": [
                        "$1,200",
                        "$1,800",
                        "$2,400",
                        "$3,000"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s7q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "Which benefit is available only after one full year of employment?",
                    "options": [
                        "Paid vacation",
                        "Health and dental coverage",
                        "RRSP matching and parental leave top-up",
                        "Professional development budget"
                    ],
                    "answer": 2,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 8,
            "difficulty": "intermediate",
            "title": "Public Transit Fare Table and Zone Map",
            "passage": "TransLink Metro operates bus, SkyTrain, and SeaBus services across the Greater Vancouver area. The fare system is based on zones — the more zones you travel through, the higher the fare. There are three zones: Zone 1 covers Vancouver, Zone 2 includes Burnaby, New Westminster, and Richmond, and Zone 3 covers Surrey, Langley, Coquitlam, and other outlying areas.\n\nFares are discounted when using a Compass Card (reloadable transit card) compared to cash. Monthly passes are available for unlimited travel within your selected zone(s). Children under 5 ride free and do not need a fare or ticket. Students and seniors qualify for concession rates with valid ID.\n\nAfter 6:30 PM on weekdays and all day on weekends and holidays, all travel is charged at the one-zone rate regardless of how many zones you cross. This makes evening and weekend travel significantly cheaper for commuters from outer zones.\n\nTransfers are valid for 90 minutes from the time of tap-in. During that window, you can transfer between buses, SkyTrain, and SeaBus at no extra charge.",
            "visualType": "fare_table",
            "visualTitle": "TransLink Metro — Fare Table (Effective January 2025)",
            "visualData": [
                [
                    "Fare Type",
                    "1 Zone",
                    "2 Zones",
                    "3 Zones"
                ],
                [
                    "Adult Compass Card",
                    "$3.15",
                    "$4.55",
                    "$6.05"
                ],
                [
                    "Adult Cash",
                    "$3.25",
                    "$4.70",
                    "$6.25"
                ],
                [
                    "Concession (Student/Senior) Compass",
                    "$2.10",
                    "$3.15",
                    "$4.25"
                ],
                [
                    "Concession Cash",
                    "$2.20",
                    "$3.25",
                    "$4.35"
                ],
                [
                    "Monthly Pass — 1 Zone",
                    "$104.90",
                    "—",
                    "—"
                ],
                [
                    "Monthly Pass — 2 Zone",
                    "—",
                    "$143.10",
                    "—"
                ],
                [
                    "Monthly Pass — 3 Zone",
                    "—",
                    "—",
                    "$189.45"
                ],
                [
                    "DayPass",
                    "$11.25",
                    "$11.25",
                    "$11.25"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s8q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "How much does an adult Compass Card fare cost to travel from Vancouver (Zone 1) to Surrey (Zone 3)?",
                    "options": [
                        "$3.15",
                        "$4.55",
                        "$6.05",
                        "$6.25"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s8q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "A commuter travels from Surrey to Vancouver at 7:00 PM on a Wednesday. How much do they pay with a Compass Card?",
                    "options": [
                        "$3.15 — the one-zone rate applies after 6:30 PM",
                        "$4.55 — the two-zone rate",
                        "$6.05 — the three-zone rate",
                        "$11.25 — they need a DayPass for evening travel"
                    ],
                    "answer": 0,
                    "explanation": ""
                },
                {
                    "id": "r2s8q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "How much would a senior save per trip by using a Compass Card instead of cash for a 2-zone trip?",
                    "options": [
                        "$0.05",
                        "$0.10",
                        "$0.15",
                        "$0.20"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s8q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "A family of two adults and a 4-year-old child travels from Burnaby to Vancouver. How much do they pay total with Compass Cards?",
                    "options": [
                        "$6.30 — two adult 1-zone fares",
                        "$9.10 — two adult 2-zone fares",
                        "$12.15 — two adult 2-zone fares plus one child fare",
                        "$4.55 — one 2-zone fare total"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s8q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "How long are transfers valid?",
                    "options": [
                        "60 minutes",
                        "75 minutes",
                        "90 minutes",
                        "120 minutes"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s8q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "A commuter makes two round trips per day, 5 days a week, across 2 zones. Would a monthly pass save them money?",
                    "options": [
                        "No, the individual trips are cheaper",
                        "Yes — 20 days × 4 trips × $4.55 = $364, versus $143.10 for the pass",
                        "It's about the same cost either way",
                        "There's not enough information to calculate"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s8q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "Which zones does Burnaby belong to?",
                    "options": [
                        "Zone 1",
                        "Zone 2",
                        "Zone 3",
                        "Zones 1 and 2"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s8q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "What does the DayPass offer that other fares don't?",
                    "options": [
                        "Free access to SeaBus only",
                        "Unlimited travel across all zones for one flat price",
                        "Priority seating on SkyTrain",
                        "Access to express bus routes"
                    ],
                    "answer": 1,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 9,
            "difficulty": "intermediate",
            "title": "Gym Membership Comparison",
            "passage": "Choosing the right gym membership can be confusing with so many options available. FitZone has three membership tiers designed to match different fitness goals and budgets. All memberships include access to cardio and weight equipment. Higher tiers unlock additional amenities.\n\nNew members receive a complimentary fitness assessment during their first week. Personal training sessions can be purchased separately at $55 per session or in packages of 10 for $450. Group fitness classes (yoga, spin, HIIT, Pilates) are included with the Premium and Elite memberships only.\n\nCancellation policy: Members may cancel with 30 days' written notice. An early termination fee of $99 applies if cancelling within the first 6 months of an annual contract. Month-to-month memberships can be cancelled at any time without penalty.\n\nAll memberships auto-renew unless cancelled in writing. Annual memberships paid upfront receive a 10% discount compared to monthly billing.",
            "visualType": "comparison_table",
            "visualTitle": "FitZone Membership Tiers",
            "visualData": [
                [
                    "Feature",
                    "Basic ($39.99/mo)",
                    "Premium ($59.99/mo)",
                    "Elite ($89.99/mo)"
                ],
                [
                    "Cardio & Weight Room",
                    "Yes",
                    "Yes",
                    "Yes"
                ],
                [
                    "Locker Room & Showers",
                    "Yes",
                    "Yes",
                    "Yes"
                ],
                [
                    "Group Fitness Classes",
                    "No",
                    "Yes (unlimited)",
                    "Yes (unlimited)"
                ],
                [
                    "Swimming Pool",
                    "No",
                    "No",
                    "Yes"
                ],
                [
                    "Sauna & Steam Room",
                    "No",
                    "No",
                    "Yes"
                ],
                [
                    "Towel Service",
                    "No",
                    "Yes",
                    "Yes"
                ],
                [
                    "Guest Passes",
                    "None",
                    "2 per month",
                    "4 per month"
                ],
                [
                    "Personal Locker",
                    "No",
                    "No",
                    "Yes (assigned)"
                ],
                [
                    "Operating Hours Access",
                    "6 AM – 10 PM",
                    "5 AM – 11 PM",
                    "24/7"
                ],
                [
                    "Free Parking",
                    "No",
                    "Yes",
                    "Yes"
                ],
                [
                    "Annual Price (paid upfront)",
                    "$431.89",
                    "$647.89",
                    "$971.89"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s9q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "A member wants to attend yoga classes. What is the minimum membership tier they need?",
                    "options": [
                        "Basic",
                        "Premium",
                        "Elite",
                        "Any tier — yoga is included in all memberships"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s9q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "How much would a Basic member pay per year if billed monthly?",
                    "options": [
                        "$431.89",
                        "$449.88",
                        "$479.88",
                        "$499.88"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s9q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "How much does a Basic member save by paying annually upfront versus monthly?",
                    "options": [
                        "$39.99",
                        "$47.99",
                        "$50.00",
                        "$59.99"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s9q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "Which membership tier offers 24/7 gym access?",
                    "options": [
                        "Basic",
                        "Premium",
                        "Elite",
                        "All tiers"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s9q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "A Premium member wants to buy 10 personal training sessions. How much will they pay?",
                    "options": [
                        "$450",
                        "$500",
                        "$550",
                        "$55 — personal training is included with Premium"
                    ],
                    "answer": 0,
                    "explanation": ""
                },
                {
                    "id": "r2s9q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "A member signed an annual contract 4 months ago and wants to cancel. What fee applies?",
                    "options": [
                        "No fee — cancellation is always free",
                        "$49 early termination fee",
                        "$99 early termination fee",
                        "They must pay the remaining 8 months"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s9q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "Which features are exclusive to the Elite tier?",
                    "options": [
                        "Group classes and towel service",
                        "Swimming pool, sauna, personal locker, and 24/7 access",
                        "Free parking and guest passes",
                        "Cardio equipment and showers"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s9q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "How many guest passes does a Premium member receive per month?",
                    "options": [
                        "None",
                        "1",
                        "2",
                        "4"
                    ],
                    "answer": 2,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 10,
            "difficulty": "intermediate",
            "title": "Condo Move-In and Move-Out Rules",
            "passage": "Lakeshore Condominiums has specific procedures for move-ins and move-outs to minimize disruption to other residents. All moves must be booked through the property management office at least 7 business days in advance.\n\nMoves are only permitted Monday through Saturday. No moves are allowed on Sundays or statutory holidays. The service elevator must be reserved for all moves — the passenger elevator is not to be used for transporting furniture or large items.\n\nA refundable damage deposit of $500 is required before the move. The deposit is returned within 10 business days if no damage to common areas is found during the post-move inspection. Any damage will be deducted from the deposit; if costs exceed $500, the resident will be billed for the difference.\n\nMoving trucks must use the loading dock at the rear of the building. Street-level parking in front of the building is not permitted for moving vehicles. The loading dock is available by reservation only.",
            "visualType": "schedule_table",
            "visualTitle": "Move-In / Move-Out Booking Schedule",
            "visualData": [
                [
                    "Day",
                    "Available Time Slots",
                    "Max Duration",
                    "Service Elevator Reserved"
                ],
                [
                    "Monday",
                    "9:00 AM – 12:00 PM, 1:00 PM – 5:00 PM",
                    "4 hours",
                    "Yes"
                ],
                [
                    "Tuesday",
                    "9:00 AM – 12:00 PM, 1:00 PM – 5:00 PM",
                    "4 hours",
                    "Yes"
                ],
                [
                    "Wednesday",
                    "9:00 AM – 12:00 PM, 1:00 PM – 5:00 PM",
                    "4 hours",
                    "Yes"
                ],
                [
                    "Thursday",
                    "9:00 AM – 12:00 PM, 1:00 PM – 5:00 PM",
                    "4 hours",
                    "Yes"
                ],
                [
                    "Friday",
                    "9:00 AM – 12:00 PM, 1:00 PM – 5:00 PM",
                    "4 hours",
                    "Yes"
                ],
                [
                    "Saturday",
                    "8:00 AM – 12:00 PM",
                    "4 hours",
                    "Yes"
                ],
                [
                    "Sunday",
                    "Not Available",
                    "—",
                    "—"
                ],
                [
                    "Statutory Holidays",
                    "Not Available",
                    "—",
                    "—"
                ]
            ],
            "visualNotes": "Only one move per time slot. Maximum one move per day on Saturdays.",
            "questions": [
                {
                    "id": "r2s10q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "A resident wants to move in on a Sunday. Is this possible?",
                    "options": [
                        "Yes, but only in the morning",
                        "Yes, with special permission from the property manager",
                        "No, moves are not permitted on Sundays",
                        "No, unless they pay a $200 surcharge"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s10q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "How far in advance must a move be booked?",
                    "options": [
                        "3 business days",
                        "5 business days",
                        "7 business days",
                        "14 business days"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s10q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "What is the earliest a move can start on a Saturday?",
                    "options": [
                        "7:00 AM",
                        "8:00 AM",
                        "9:00 AM",
                        "10:00 AM"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s10q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "A move causes $650 in damage to the hallway. How much will the resident owe beyond the deposit?",
                    "options": [
                        "Nothing — the deposit covers it",
                        "$150",
                        "$500",
                        "$650"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s10q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "Where must moving trucks park?",
                    "options": [
                        "In the visitor parking area",
                        "On the street in front of the building",
                        "At the loading dock at the rear of the building",
                        "In the underground garage on Level P1"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s10q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "How many move time slots are available on weekdays?",
                    "options": [
                        "One",
                        "Two",
                        "Three",
                        "Four"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s10q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "How long does it take to get the damage deposit back if no damage is found?",
                    "options": [
                        "5 business days",
                        "7 business days",
                        "10 business days",
                        "30 business days"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s10q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "Which elevator must be used for moving furniture?",
                    "options": [
                        "Either elevator is fine",
                        "The passenger elevator only",
                        "The service elevator only",
                        "The freight elevator on the loading dock level"
                    ],
                    "answer": 2,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 11,
            "difficulty": "intermediate",
            "title": "Hotel Room Comparison and Booking Policies",
            "passage": "The Harbourfront Inn is a waterfront hotel in Kingston, Ontario, offering four room types. All rooms include complimentary Wi-Fi, a flat-screen TV, and a coffee maker. Breakfast is included only with the Suite and Penthouse packages.\n\nCheck-in time is 3:00 PM and check-out is 11:00 AM. Early check-in (from 12:00 PM) is available for $30 if the room is ready. Late check-out (until 2:00 PM) is $25.\n\nCancellation policy: Reservations cancelled more than 48 hours before check-in receive a full refund. Cancellations within 48 hours are charged one night's stay. No-shows are charged the full reservation amount.\n\nPets are allowed in Standard and Deluxe rooms only, for a non-refundable fee of $40 per night. The hotel is a non-smoking property; a $250 cleaning fee applies if smoking is detected in any room.",
            "visualType": "room_comparison_table",
            "visualTitle": "Room Types and Rates (Per Night)",
            "visualData": [
                [
                    "Room Type",
                    "Rate (Weekday)",
                    "Rate (Weekend)",
                    "Max Guests",
                    "Size",
                    "Key Features"
                ],
                [
                    "Standard",
                    "$149",
                    "$179",
                    "2",
                    "280 sq ft",
                    "Queen bed, city view"
                ],
                [
                    "Deluxe",
                    "$189",
                    "$219",
                    "3",
                    "350 sq ft",
                    "King bed, harbour view, mini-fridge"
                ],
                [
                    "Suite",
                    "$269",
                    "$299",
                    "4",
                    "520 sq ft",
                    "King bed + pull-out sofa, living area, kitchenette, breakfast included"
                ],
                [
                    "Penthouse",
                    "$399",
                    "$449",
                    "4",
                    "750 sq ft",
                    "King bed, private balcony, jacuzzi tub, breakfast included, champagne on arrival"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s11q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "A couple travelling with their dog wants a harbour view. Which room should they book?",
                    "options": [
                        "Standard",
                        "Deluxe",
                        "Suite",
                        "Penthouse"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s11q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "A family of four needs a room with breakfast included. What is the cheapest weekday option?",
                    "options": [
                        "Deluxe at $189",
                        "Suite at $269",
                        "Penthouse at $399",
                        "Standard at $149 plus breakfast add-on"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s11q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "A guest cancels their reservation 24 hours before check-in. What are they charged?",
                    "options": [
                        "Nothing — full refund",
                        "50% of the total reservation",
                        "One night's stay",
                        "The full reservation amount"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s11q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "How much would a two-night weekend stay in a Deluxe room with a pet cost?",
                    "options": [
                        "$438",
                        "$478",
                        "$498",
                        "$518"
                    ],
                    "answer": 3,
                    "explanation": ""
                },
                {
                    "id": "r2s11q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "Which room type is the largest?",
                    "options": [
                        "Standard — 280 sq ft",
                        "Deluxe — 350 sq ft",
                        "Suite — 520 sq ft",
                        "Penthouse — 750 sq ft"
                    ],
                    "answer": 3,
                    "explanation": ""
                },
                {
                    "id": "r2s11q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "A guest wants early check-in and late check-out. What is the total extra cost?",
                    "options": [
                        "$25",
                        "$30",
                        "$50",
                        "$55"
                    ],
                    "answer": 3,
                    "explanation": ""
                },
                {
                    "id": "r2s11q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "Can a guest bring a pet to a Suite room?",
                    "options": [
                        "Yes, for a $40 per night fee",
                        "Yes, at no extra charge",
                        "No, pets are only allowed in Standard and Deluxe rooms",
                        "No, the hotel does not allow pets"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s11q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "What happens if smoking is detected in a room?",
                    "options": [
                        "The guest receives a verbal warning",
                        "A $250 cleaning fee is charged",
                        "The guest is asked to leave with no refund",
                        "The guest is moved to a smoking-designated floor"
                    ],
                    "answer": 1,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 12,
            "difficulty": "intermediate",
            "title": "Shipping Options Comparison",
            "passage": "NorthPost Express offers domestic shipping services across Canada. All shipments include online tracking and proof of delivery. Packages must not exceed 30 kg in weight or 150 cm in combined length and girth.\n\nInsurance is included up to $100 for all service levels. Additional insurance can be purchased at $2.50 per $100 of declared value. Signature confirmation is included with Priority and Express services; it can be added to Standard for $3.95.\n\nPick-up service is available in select urban areas for a flat fee of $5.00 per package. Alternatively, packages can be dropped off at any of our 1,200 NorthPost locations nationwide.\n\nSaturday delivery is available with Express service only, at an additional charge of $8.50. Deliveries to remote or northern communities may take an additional 3–5 business days beyond the standard delivery window.",
            "visualType": "shipping_table",
            "visualTitle": "NorthPost Express — Shipping Service Levels",
            "visualData": [
                [
                    "Service",
                    "Delivery Time",
                    "Base Rate (up to 5 kg)",
                    "Per Additional kg",
                    "Tracking",
                    "Signature"
                ],
                [
                    "Standard",
                    "5–8 business days",
                    "$12.95",
                    "$1.50",
                    "Yes",
                    "Add $3.95"
                ],
                [
                    "Priority",
                    "2–4 business days",
                    "$19.95",
                    "$2.25",
                    "Yes",
                    "Included"
                ],
                [
                    "Express",
                    "1–2 business days",
                    "$29.95",
                    "$3.50",
                    "Yes",
                    "Included"
                ],
                [
                    "Economy",
                    "8–12 business days",
                    "$8.95",
                    "$1.00",
                    "Yes (limited)",
                    "Not available"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s12q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "A customer needs to ship a 7 kg package via Priority. How much will it cost?",
                    "options": [
                        "$19.95",
                        "$22.20",
                        "$24.45",
                        "$26.70"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s12q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "Which service level is the only one offering Saturday delivery?",
                    "options": [
                        "Standard",
                        "Priority",
                        "Express",
                        "All service levels"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s12q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "A customer wants signature confirmation with Standard shipping. How much extra does it cost?",
                    "options": [
                        "Free — it's included",
                        "$2.50",
                        "$3.95",
                        "$5.00"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s12q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "A customer ships a $500 item via Express and wants full insurance coverage. How much additional insurance do they need to buy?",
                    "options": [
                        "$2.50 — for an extra $100 of coverage",
                        "$5.00 — for an extra $200 of coverage",
                        "$10.00 — for an extra $400 of coverage",
                        "$12.50 — for the full $500"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s12q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "What is the maximum package weight allowed?",
                    "options": [
                        "20 kg",
                        "25 kg",
                        "30 kg",
                        "50 kg"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s12q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "A customer in Toronto ships a 5 kg package Express to Whitehorse, Yukon. What is the minimum expected delivery time?",
                    "options": [
                        "1–2 business days",
                        "2–4 business days",
                        "4–7 business days",
                        "6–12 business days"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s12q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "Which service level does NOT offer signature confirmation?",
                    "options": [
                        "Standard",
                        "Priority",
                        "Express",
                        "Economy"
                    ],
                    "answer": 3,
                    "explanation": ""
                },
                {
                    "id": "r2s12q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "How much does pick-up service cost?",
                    "options": [
                        "Free for all service levels",
                        "$3.95 per package",
                        "$5.00 per package",
                        "$8.50 per package"
                    ],
                    "answer": 2,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 13,
            "difficulty": "advanced",
            "title": "Insurance Plan Comparison for Small Businesses",
            "passage": "Maple Shield Insurance offers three business insurance packages designed for small and medium enterprises in Ontario. All packages include general liability coverage and can be customized with optional add-ons.\n\nGeneral liability protects against third-party bodily injury and property damage claims. Professional liability (also known as errors and omissions) covers claims arising from professional advice or services. Cyber liability covers data breach response costs, notification expenses, and regulatory fines.\n\nDeductibles apply per claim, not per policy year. The deductible is the amount the business pays out of pocket before insurance coverage begins. Lower deductibles mean higher premiums, and vice versa.\n\nAll packages include a 24/7 claims hotline. Businesses with fewer than 10 employees qualify for a 5% small business discount. Businesses that have been claim-free for 3 or more consecutive years qualify for an additional 10% loyalty discount. Discounts can be combined.",
            "visualType": "insurance_comparison_table",
            "visualTitle": "Maple Shield — Business Insurance Packages",
            "visualData": [
                [
                    "Feature",
                    "Starter",
                    "Professional",
                    "Enterprise"
                ],
                [
                    "Annual Premium",
                    "$1,800",
                    "$3,200",
                    "$5,400"
                ],
                [
                    "General Liability Limit",
                    "$1 million",
                    "$2 million",
                    "$5 million"
                ],
                [
                    "Professional Liability",
                    "Not included",
                    "$1 million",
                    "$2 million"
                ],
                [
                    "Cyber Liability",
                    "Not included",
                    "Not included",
                    "$1 million"
                ],
                [
                    "Property Coverage",
                    "Up to $50,000",
                    "Up to $150,000",
                    "Up to $500,000"
                ],
                [
                    "Business Interruption",
                    "Not included",
                    "30 days coverage",
                    "90 days coverage"
                ],
                [
                    "Deductible (per claim)",
                    "$2,500",
                    "$1,500",
                    "$1,000"
                ],
                [
                    "Equipment Breakdown",
                    "Not included",
                    "Included",
                    "Included"
                ],
                [
                    "Employee Dishonesty",
                    "Not included",
                    "Not included",
                    "Up to $25,000"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s13q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "A software consulting firm needs professional liability coverage. What is the minimum package they should choose?",
                    "options": [
                        "Starter",
                        "Professional",
                        "Enterprise",
                        "Any package — all include professional liability"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s13q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "A business with 8 employees and no claims in the past 4 years chooses the Professional package. What is their discounted annual premium?",
                    "options": [
                        "$2,720",
                        "$2,560",
                        "$2,880",
                        "$2,448"
                    ],
                    "answer": 0,
                    "explanation": ""
                },
                {
                    "id": "r2s13q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "Which package is the only one that includes cyber liability coverage?",
                    "options": [
                        "Starter",
                        "Professional",
                        "Enterprise",
                        "All packages"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s13q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "A Starter package holder has a $4,000 liability claim. How much does the business pay?",
                    "options": [
                        "$0 — insurance covers everything",
                        "$1,500",
                        "$2,500",
                        "$4,000"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s13q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "A business experiences a fire and cannot operate for 60 days. Which packages would cover this interruption?",
                    "options": [
                        "Starter only",
                        "Professional only (covers 30 days)",
                        "Enterprise only (covers 90 days)",
                        "Both Professional (partial) and Enterprise (full)"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s13q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "What is the maximum property coverage under the Enterprise package?",
                    "options": [
                        "$50,000",
                        "$150,000",
                        "$250,000",
                        "$500,000"
                    ],
                    "answer": 3,
                    "explanation": ""
                },
                {
                    "id": "r2s13q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "A company with 12 employees qualifies for the loyalty discount only. What is their Enterprise premium?",
                    "options": [
                        "$4,590",
                        "$4,860",
                        "$5,130",
                        "$5,400"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s13q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "According to the passage, what does a deductible apply to?",
                    "options": [
                        "Each policy year",
                        "Each individual claim",
                        "The total annual premium",
                        "Only property damage claims"
                    ],
                    "answer": 1,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 14,
            "difficulty": "advanced",
            "title": "University Course Timetable and Registration Rules",
            "passage": "McMaster University's Department of Political Science has released the Winter 2026 course schedule. Students must register through Mosaic, the university's student portal, during their assigned registration window. Upper-year students (3rd and 4th year) register first, followed by 2nd-year students one week later.\n\nEach course has a maximum enrolment cap. Once full, students are placed on a waitlist. If a seat opens due to a drop, the first student on the waitlist is automatically enrolled and notified by email. Students have 24 hours to confirm or they lose the seat.\n\nStudents may take a maximum of 5 courses per term (15 units). A course overload (6th course) requires written approval from the Associate Dean. Full-time students must be enrolled in a minimum of 3 courses.\n\nLab and tutorial sections are separate from lectures. Students must register for BOTH a lecture and a corresponding lab/tutorial where required. Failure to register for a required lab component will result in being dropped from the course.",
            "visualType": "course_schedule_table",
            "visualTitle": "POLSCI — Winter 2026 Course Schedule",
            "visualData": [
                [
                    "Course Code",
                    "Course Title",
                    "Lecture Time",
                    "Tutorial/Lab",
                    "Instructor",
                    "Enrolment Cap",
                    "Prerequisite"
                ],
                [
                    "POLSCI 2I03",
                    "Intro to International Relations",
                    "Mon/Wed 10:30–11:20",
                    "Fri 9:30–10:20 (Tut)",
                    "Dr. Osei",
                    "120",
                    "None"
                ],
                [
                    "POLSCI 2O06",
                    "Canadian Government",
                    "Tue/Thu 1:30–2:20",
                    "Wed 3:30–4:20 (Tut)",
                    "Dr. Bhatt",
                    "90",
                    "None"
                ],
                [
                    "POLSCI 3E03",
                    "Environmental Politics",
                    "Mon/Wed 2:30–3:20",
                    "None",
                    "Dr. Chen",
                    "60",
                    "Any 2000-level POLSCI"
                ],
                [
                    "POLSCI 3G03",
                    "Gender and Politics",
                    "Tue/Thu 10:30–11:20",
                    "Thu 2:30–3:20 (Tut)",
                    "Dr. Santos",
                    "45",
                    "Any 2000-level POLSCI"
                ],
                [
                    "POLSCI 3NN3",
                    "Canadian Constitutional Law",
                    "Mon/Wed/Fri 11:30–12:20",
                    "None",
                    "Prof. Okonkwo",
                    "80",
                    "POLSCI 2O06"
                ],
                [
                    "POLSCI 4B06",
                    "Comparative Politics Seminar",
                    "Thu 6:30–9:20 PM",
                    "None",
                    "Dr. Volkov",
                    "25",
                    "3rd year standing + instructor permission"
                ],
                [
                    "POLSCI 4D03",
                    "Capstone Research Project",
                    "By arrangement",
                    "None",
                    "Various",
                    "20",
                    "4th year standing + 3.5 GPA"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s14q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "A 2nd-year student wants to take Canadian Constitutional Law. Can they register?",
                    "options": [
                        "Yes, it's open to all students",
                        "No, it requires POLSCI 2O06 as a prerequisite, which they may not have completed yet",
                        "No, it's restricted to 4th-year students only",
                        "Yes, but they need instructor permission"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s14q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "A student registers for Canadian Government but forgets to register for the tutorial. What happens?",
                    "options": [
                        "They attend the lecture only and receive partial credit",
                        "They are automatically assigned a tutorial section",
                        "They are dropped from the course entirely",
                        "They receive a warning but can still attend"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s14q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "Which course has the smallest class size?",
                    "options": [
                        "Gender and Politics (45)",
                        "Comparative Politics Seminar (25)",
                        "Capstone Research Project (20)",
                        "Environmental Politics (60)"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s14q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "A student wants to take Environmental Politics. What prerequisite must they have?",
                    "options": [
                        "POLSCI 2O06 specifically",
                        "Any 2000-level POLSCI course",
                        "3rd year standing",
                        "No prerequisite"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s14q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "A 3rd-year student with a 3.2 GPA wants to take the Capstone Research Project. Can they?",
                    "options": [
                        "Yes, they meet all the requirements",
                        "No, they need 4th year standing",
                        "No, they need 4th year standing AND a 3.5 GPA",
                        "Yes, but only with instructor approval"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s14q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "Which course meets in the evening?",
                    "options": [
                        "Environmental Politics",
                        "Canadian Constitutional Law",
                        "Comparative Politics Seminar",
                        "Gender and Politics"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s14q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "A student is on the waitlist and a seat opens. How long do they have to confirm?",
                    "options": [
                        "12 hours",
                        "24 hours",
                        "48 hours",
                        "One week"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s14q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "A student wants to take 6 courses this term. What do they need?",
                    "options": [
                        "A minimum GPA of 3.5",
                        "Written approval from the Associate Dean",
                        "Permission from each course instructor",
                        "Nothing — students can take up to 6 courses"
                    ],
                    "answer": 1,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 15,
            "difficulty": "advanced",
            "title": "Employee Benefits Comparison Between Two Job Offers",
            "passage": "Maria has received job offers from two companies and is comparing the total compensation packages. While Company A offers a higher base salary, Company B has more comprehensive benefits. Maria currently pays $180 per month for private health insurance and $300 per month for daycare, and she drives 40 km round trip to work daily.\n\nShe values work-life balance highly and is considering the full picture — not just salary. Her current rent is $1,800 per month and she has $18,000 in student loans at 5% interest. She is 29 years old, has one child (age 3), and plans to pursue her MBA part-time within the next two years.\n\nBoth companies are located in the Greater Toronto Area. Company A is in downtown Toronto (accessible by TTC). Company B is in Mississauga (requires driving).",
            "visualType": "comparison_table",
            "visualTitle": "Job Offer Comparison",
            "visualData": [
                [
                    "Feature",
                    "Company A (Toronto)",
                    "Company B (Mississauga)"
                ],
                [
                    "Base Salary",
                    "$72,000",
                    "$65,000"
                ],
                [
                    "Annual Bonus",
                    "Up to 10% (performance-based)",
                    "Guaranteed 5%"
                ],
                [
                    "Health & Dental",
                    "80% employer-paid (starts Day 1)",
                    "100% employer-paid (after 3 months)"
                ],
                [
                    "RRSP Matching",
                    "3% of salary",
                    "5% of salary"
                ],
                [
                    "Paid Vacation",
                    "2 weeks",
                    "3 weeks"
                ],
                [
                    "Sick Days",
                    "5 per year",
                    "Unlimited (manager discretion)"
                ],
                [
                    "Work Schedule",
                    "5 days in office",
                    "Hybrid — 3 in office, 2 remote"
                ],
                [
                    "Commute",
                    "TTC accessible, ~45 min each way",
                    "Driving required, ~25 min each way"
                ],
                [
                    "Parking",
                    "Not provided ($250/month downtown)",
                    "Free on-site parking"
                ],
                [
                    "Childcare Subsidy",
                    "None",
                    "$200/month toward daycare"
                ],
                [
                    "Tuition Reimbursement",
                    "None",
                    "Up to $5,000/year for approved programs"
                ],
                [
                    "Student Loan Assistance",
                    "None",
                    "$100/month toward student loans"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s15q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "What is the difference in base salary between the two offers?",
                    "options": [
                        "$5,000",
                        "$7,000",
                        "$8,000",
                        "$10,000"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s15q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "Maria plans to pursue an MBA. Which company would help with tuition?",
                    "options": [
                        "Company A — up to $3,000/year",
                        "Company B — up to $5,000/year",
                        "Both companies offer equal tuition support",
                        "Neither company offers tuition reimbursement"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s15q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "How much would Maria save per month on daycare at Company B compared to her current cost?",
                    "options": [
                        "$100",
                        "$150",
                        "$200",
                        "$300"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s15q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "If Maria takes Company A, approximately how much will parking cost her per year?",
                    "options": [
                        "$1,500",
                        "$2,000",
                        "$2,500",
                        "$3,000"
                    ],
                    "answer": 3,
                    "explanation": ""
                },
                {
                    "id": "r2s15q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "Company B's RRSP match on a $65,000 salary would be how much per year?",
                    "options": [
                        "$1,950",
                        "$2,160",
                        "$2,600",
                        "$3,250"
                    ],
                    "answer": 3,
                    "explanation": ""
                },
                {
                    "id": "r2s15q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "Which company offers more paid vacation time?",
                    "options": [
                        "Company A — 3 weeks",
                        "Company B — 3 weeks",
                        "Both offer the same amount",
                        "Company A — 2 weeks, but with more sick days"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s15q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "Which benefit does Company B offer that directly addresses Maria's student loans?",
                    "options": [
                        "A signing bonus of $1,200",
                        "$100/month toward student loans",
                        "A one-time loan forgiveness of $5,000",
                        "Company B does not offer student loan assistance"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s15q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "Considering all factors mentioned in the passage and table, which statement best describes the overall comparison?",
                    "options": [
                        "Company A is clearly better because of the higher salary and guaranteed bonus",
                        "Company B is clearly better because it pays more and has better hours",
                        "Company A has a higher salary, but Company B's benefits — including childcare, tuition, student loan help, and remote work — may offset the difference",
                        "The two offers are essentially identical when benefits are included"
                    ],
                    "answer": 2,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 16,
            "difficulty": "advanced",
            "title": "Electricity Bill Breakdown and Rate Structure",
            "passage": "Ontario electricity bills are based on Time-of-Use (TOU) pricing, which means the rate you pay depends on when you use electricity. There are three pricing periods: Off-Peak (cheapest), Mid-Peak, and On-Peak (most expensive). The goal is to encourage consumers to shift their usage to off-peak hours to reduce strain on the power grid.\n\nResidential customers can opt out of TOU pricing and instead choose a Tiered Rate plan, where you pay a lower rate for the first 1,000 kWh per month and a higher rate for any usage above that threshold. The Tiered plan is better for households that use electricity consistently throughout the day and cannot easily shift their usage.\n\nIn addition to the electricity rate, your bill includes a Delivery Charge ($0.0438/kWh), a Regulatory Charge ($0.0056/kWh), and a Debt Retirement Charge ($0.0007/kWh). These apply regardless of which pricing plan you choose. HST (13%) is applied to the total bill.\n\nThe Ontario Electricity Support Program (OESP) provides a monthly credit of $35 to $75 to eligible low-income households. To apply, visit ontarioelectricitysupport.ca with proof of household income.",
            "visualType": "rate_table",
            "visualTitle": "Ontario Electricity Rates — Effective November 1, 2025",
            "visualData": [
                [
                    "",
                    "Time-of-Use (TOU) Rates",
                    ""
                ],
                [
                    "Period",
                    "Hours",
                    "Rate per kWh"
                ],
                [
                    "Off-Peak",
                    "Weekdays 7 PM – 7 AM, All day weekends & holidays",
                    "$0.076"
                ],
                [
                    "Mid-Peak",
                    "Weekdays 11 AM – 5 PM",
                    "$0.122"
                ],
                [
                    "On-Peak",
                    "Weekdays 7 AM – 11 AM and 5 PM – 7 PM",
                    "$0.151"
                ],
                [
                    "",
                    "",
                    ""
                ],
                [
                    "",
                    "Tiered Rate Plan",
                    ""
                ],
                [
                    "Tier",
                    "Usage",
                    "Rate per kWh"
                ],
                [
                    "Tier 1",
                    "First 1,000 kWh/month",
                    "$0.103"
                ],
                [
                    "Tier 2",
                    "Above 1,000 kWh/month",
                    "$0.126"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s16q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "When is the cheapest time to run a dishwasher under TOU pricing?",
                    "options": [
                        "Weekdays between 11 AM and 5 PM",
                        "Weekdays between 7 PM and 7 AM",
                        "Weekdays between 7 AM and 11 AM",
                        "There is no difference — all times cost the same"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s16q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "A household uses 900 kWh in a month on the Tiered plan. What is their electricity charge before delivery and other fees?",
                    "options": [
                        "$69.48",
                        "$82.70",
                        "$92.70",
                        "$113.40"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s16q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "What is the On-Peak rate per kWh?",
                    "options": [
                        "$0.076",
                        "$0.103",
                        "$0.122",
                        "$0.151"
                    ],
                    "answer": 3,
                    "explanation": ""
                },
                {
                    "id": "r2s16q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "What is the total of the additional per-kWh charges (Delivery + Regulatory + Debt Retirement)?",
                    "options": [
                        "$0.0438",
                        "$0.0494",
                        "$0.0501",
                        "$0.0556"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s16q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "On a Saturday afternoon, what TOU rate would apply?",
                    "options": [
                        "Off-Peak ($0.076)",
                        "Mid-Peak ($0.122)",
                        "On-Peak ($0.151)",
                        "A special weekend rate not listed"
                    ],
                    "answer": 0,
                    "explanation": ""
                },
                {
                    "id": "r2s16q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "Which pricing plan is better for a household that cannot shift usage to off-peak hours?",
                    "options": [
                        "Time-of-Use",
                        "Tiered Rate",
                        "Both are the same",
                        "Neither — they should contact the utility for a custom plan"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s16q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "What is the maximum monthly OESP credit available?",
                    "options": [
                        "$25",
                        "$50",
                        "$75",
                        "$100"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s16q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "What percentage is HST applied at on the total bill?",
                    "options": [
                        "5%",
                        "8%",
                        "13%",
                        "15%"
                    ],
                    "answer": 2,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 17,
            "difficulty": "advanced",
            "title": "Rental Lease Agreement Summary",
            "passage": "Below is a summary of key terms from a standard Ontario residential lease agreement. Tenants should read the full lease carefully before signing. Under the Ontario Residential Tenancies Act (RTA), tenants have specific rights that cannot be overridden by the lease — for example, a landlord cannot require a tenant to pay a damage deposit (only a last month's rent deposit is permitted).\n\nRent increases are governed by the provincial rent guideline, which for 2026 is set at 2.5%. Landlords must provide 90 days' written notice before increasing rent, and can only increase rent once every 12 months. Buildings first occupied after November 15, 2018 are exempt from rent control.\n\nIf a tenant wishes to end their lease early, they must provide 60 days' notice to the landlord. However, tenants on a fixed-term lease cannot normally terminate early unless they and the landlord agree, or there are specific legal grounds (e.g., domestic violence, landlord failure to maintain the unit).\n\nThe landlord is responsible for all major repairs and maintenance. Tenants are responsible for keeping the unit clean and reporting maintenance issues promptly. Tenants may not alter the unit (painting, installing fixtures) without written landlord consent.",
            "visualType": "lease_summary_table",
            "visualTitle": "Lease Agreement Summary — Unit 4B, 210 Maple Drive, Oakville",
            "visualData": [
                [
                    "Term",
                    "Detail"
                ],
                [
                    "Tenant",
                    "Aisha Rahman"
                ],
                [
                    "Landlord",
                    "Greenfield Properties Inc."
                ],
                [
                    "Unit",
                    "4B — 2-bedroom, 850 sq ft"
                ],
                [
                    "Lease Term",
                    "Fixed — 12 months (June 1, 2026 – May 31, 2027)"
                ],
                [
                    "Monthly Rent",
                    "$2,100 (due on the 1st of each month)"
                ],
                [
                    "Last Month's Rent Deposit",
                    "$2,100 (collected at signing)"
                ],
                [
                    "Parking",
                    "1 outdoor spot included (Spot #22)"
                ],
                [
                    "Storage Locker",
                    "Locker B4 included"
                ],
                [
                    "Pet Policy",
                    "One cat or small dog (under 25 lbs) permitted with $0 additional deposit"
                ],
                [
                    "Utilities Included",
                    "Water and heating included; tenant pays hydro and internet"
                ],
                [
                    "Laundry",
                    "Shared coin-operated laundry on ground floor"
                ],
                [
                    "Building First Occupied",
                    "2015"
                ],
                [
                    "Rent Control Status",
                    "Subject to Ontario rent control guidelines"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s17q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "What is the maximum rent increase the landlord can apply for 2026?",
                    "options": [
                        "1.5%",
                        "2.0%",
                        "2.5%",
                        "3.0%"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s17q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "Can the landlord charge a damage deposit for this unit?",
                    "options": [
                        "Yes, up to one month's rent",
                        "Yes, but only for pet damage",
                        "No, Ontario law only allows a last month's rent deposit",
                        "No, unless the tenant has poor credit"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s17q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "Aisha wants to paint her bedroom. What does she need?",
                    "options": [
                        "Nothing — tenants can paint freely",
                        "Written consent from the landlord",
                        "Approval from the condo board",
                        "A professional painter's license"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s17q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "Is this unit subject to rent control?",
                    "options": [
                        "No, because it's a newer building",
                        "Yes, because the building was first occupied in 2015, before the November 2018 cutoff",
                        "No, because the landlord is a corporation",
                        "Yes, but only for the first year of the lease"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s17q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "Which utilities must Aisha pay for herself?",
                    "options": [
                        "Water and heating",
                        "Hydro and internet",
                        "All utilities",
                        "Internet only"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s17q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "If Aisha wants to leave before the lease ends, what must she do?",
                    "options": [
                        "Give 30 days' notice and pay a penalty",
                        "She cannot normally terminate a fixed-term lease early without agreement or legal grounds",
                        "Give 60 days' notice and she's free to go",
                        "Pay three months' rent as a breaking fee"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s17q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "Can Aisha have a 30-pound dog in the unit?",
                    "options": [
                        "Yes, any pet is allowed",
                        "No, the pet policy limits dogs to under 25 pounds",
                        "Yes, but she must pay a pet deposit",
                        "No, only cats are permitted"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s17q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "How much notice must the landlord give before raising the rent?",
                    "options": [
                        "30 days",
                        "60 days",
                        "90 days",
                        "120 days"
                    ],
                    "answer": 2,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 18,
            "difficulty": "advanced",
            "title": "Tax Return Summary and Credits",
            "passage": "Understanding your Canadian tax return can help you maximize your refund or reduce the amount you owe. The federal income tax system uses a progressive rate structure — you pay a higher rate on income above certain thresholds, not on all your income.\n\nIn addition to federal tax, Ontario residents pay provincial income tax. Several tax credits are available to reduce your total tax payable. Non-refundable credits reduce the tax you owe (but can't create a refund below zero). Refundable credits can result in money back even if you owe no tax.\n\nRRSP contributions reduce your taxable income dollar-for-dollar, up to your contribution limit (18% of previous year's earned income, to a maximum of $31,560 for 2025). Unused RRSP room carries forward.\n\nThe Canada Workers Benefit (CWB) is a refundable credit for low-income workers earning between $3,000 and approximately $33,000 (single) or $43,000 (family). The Climate Action Incentive Payment (CAIP) is paid quarterly to all residents in provinces with federal carbon pricing.",
            "visualType": "tax_bracket_table",
            "visualTitle": "2025 Federal Income Tax Brackets",
            "visualData": [
                [
                    "Taxable Income",
                    "Federal Tax Rate"
                ],
                [
                    "$0 – $55,867",
                    "15%"
                ],
                [
                    "$55,868 – $111,733",
                    "20.5%"
                ],
                [
                    "$111,734 – $154,906",
                    "26%"
                ],
                [
                    "$154,907 – $220,000",
                    "29%"
                ],
                [
                    "Over $220,000",
                    "33%"
                ],
                [
                    "",
                    ""
                ],
                [
                    "Key Credits",
                    "Type",
                    "Amount"
                ],
                [
                    "Basic Personal Amount",
                    "Non-refundable",
                    "$15,705 (no tax on first $15,705 of income)"
                ],
                [
                    "Canada Workers Benefit (single)",
                    "Refundable",
                    "Up to $1,428"
                ],
                [
                    "GST/HST Credit (single, no children)",
                    "Refundable",
                    "Up to $496/year"
                ],
                [
                    "Climate Action Incentive (Ontario, single)",
                    "Refundable",
                    "$140/quarter ($560/year)"
                ],
                [
                    "Medical Expense Credit",
                    "Non-refundable",
                    "Expenses exceeding 3% of net income or $2,635"
                ],
                [
                    "Tuition Credit",
                    "Non-refundable",
                    "15% of eligible tuition fees"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s18q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "A person earning $80,000 per year pays 20.5% on what portion of their income?",
                    "options": [
                        "All $80,000",
                        "Only the first $55,867",
                        "Only the amount between $55,868 and $80,000",
                        "Only the amount above $80,000"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s18q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "What is the maximum RRSP contribution for someone who earned $100,000 last year?",
                    "options": [
                        "$15,000",
                        "$18,000",
                        "$27,230",
                        "$31,560"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s18q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "The Basic Personal Amount means that a person pays no federal tax on what amount of income?",
                    "options": [
                        "$12,000",
                        "$14,398",
                        "$15,705",
                        "$20,000"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s18q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "Which of the following credits can result in money being paid to you even if you owe no tax?",
                    "options": [
                        "Basic Personal Amount",
                        "Tuition Credit",
                        "Canada Workers Benefit",
                        "Medical Expense Credit"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s18q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "How much is the annual Climate Action Incentive for an Ontario single resident?",
                    "options": [
                        "$140",
                        "$280",
                        "$420",
                        "$560"
                    ],
                    "answer": 3,
                    "explanation": ""
                },
                {
                    "id": "r2s18q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "A student pays $8,000 in tuition. How much is their tuition credit worth?",
                    "options": [
                        "$800",
                        "$1,200",
                        "$1,500",
                        "$8,000"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s18q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "What is the difference between a refundable and a non-refundable tax credit?",
                    "options": [
                        "Refundable credits are only for seniors; non-refundable are for everyone",
                        "Refundable credits can give you money back; non-refundable can only reduce tax owed to zero",
                        "Refundable credits apply to provincial tax only; non-refundable apply to federal",
                        "There is no practical difference between the two"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s18q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "A low-income single worker earning $28,000 may qualify for which special refundable credit?",
                    "options": [
                        "Tuition Credit",
                        "Medical Expense Credit",
                        "Canada Workers Benefit (up to $1,428)",
                        "Basic Personal Amount"
                    ],
                    "answer": 2,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 19,
            "difficulty": "advanced",
            "title": "Condominium Status Certificate Summary",
            "passage": "A Status Certificate is one of the most important documents a buyer reviews before purchasing a condominium in Ontario. It provides a snapshot of the financial health and legal standing of the condominium corporation. Under the Ontario Condominium Act, sellers must provide a status certificate within 10 days of a buyer's request.\n\nThe certificate includes information about the reserve fund, any pending lawsuits, outstanding common expense arrears, and the corporation's insurance coverage. A healthy reserve fund — one that aligns with or exceeds the recommendations in the most recent reserve fund study — is a positive indicator. A depleted reserve fund may signal upcoming special assessments, where owners are required to pay a one-time lump sum to cover major repairs.\n\nBuyers should pay close attention to the section on pending or anticipated expenditures. If the board has approved a major project (e.g., roof replacement, elevator modernization) but hasn't yet collected funds, the current owner may pass that cost to the new buyer.\n\nA real estate lawyer should always review the status certificate before the buyer finalizes the purchase.",
            "visualType": "status_certificate_summary",
            "visualTitle": "Status Certificate Summary — 450 Lakeshore Blvd, Unit 1207",
            "visualData": [
                [
                    "Item",
                    "Details"
                ],
                [
                    "Condo Corporation",
                    "TSCC #2485"
                ],
                [
                    "Monthly Common Expenses",
                    "$687.42 (includes water, heating, building insurance, reserve fund contribution)"
                ],
                [
                    "Reserve Fund Balance",
                    "$1,240,000 (as of December 31, 2025)"
                ],
                [
                    "Reserve Fund Study Recommendation",
                    "$1,800,000 minimum by December 2025"
                ],
                [
                    "Special Assessment",
                    "Approved: $3,500 per unit for elevator modernization (due July 1, 2026)"
                ],
                [
                    "Pending Lawsuits",
                    "One: Slip-and-fall claim in lobby ($150,000 — covered by insurance)"
                ],
                [
                    "Common Expense Arrears",
                    "$12,400 total across all units (3 units in arrears)"
                ],
                [
                    "Insurance Deductible",
                    "$100,000 for water damage claims"
                ],
                [
                    "Upcoming Major Project",
                    "Parking garage waterproofing — estimated $420,000 (Q3 2026)"
                ],
                [
                    "Management Company",
                    "Crossbridge Condominium Services"
                ],
                [
                    "Building Age",
                    "18 years (built 2008)"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s19q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "Is the reserve fund at the recommended level?",
                    "options": [
                        "Yes, it exceeds the recommendation",
                        "No, it is $560,000 below the recommended minimum",
                        "Yes, it exactly meets the recommendation",
                        "The recommendation has not been calculated yet"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s19q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "If a buyer purchases Unit 1207 before July 2026, what upcoming cost should they be aware of?",
                    "options": [
                        "A monthly rent increase of $100",
                        "A special assessment of $3,500 for elevator work",
                        "A new property tax levy",
                        "An increase in the insurance deductible"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s19q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "What does the pending lawsuit involve?",
                    "options": [
                        "A noise complaint from a tenant",
                        "A slip-and-fall claim in the lobby",
                        "A construction defect in the parking garage",
                        "A dispute with the management company"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s19q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "Why might a depleted reserve fund concern a buyer?",
                    "options": [
                        "It means the building is about to be demolished",
                        "It may lead to special assessments where owners pay lump sums for repairs",
                        "It means the building has no insurance",
                        "It means monthly fees will decrease"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s19q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "What is the insurance deductible for water damage?",
                    "options": [
                        "$25,000",
                        "$50,000",
                        "$75,000",
                        "$100,000"
                    ],
                    "answer": 3,
                    "explanation": ""
                },
                {
                    "id": "r2s19q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "How many units in the building have unpaid common expenses?",
                    "options": [
                        "1",
                        "2",
                        "3",
                        "5"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s19q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "According to the passage, who should review the status certificate?",
                    "options": [
                        "The buyer themselves — no professional needed",
                        "The real estate agent only",
                        "A real estate lawyer",
                        "The building's property manager"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s19q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "What major project is anticipated for Q3 2026?",
                    "options": [
                        "Elevator modernization",
                        "Lobby renovation",
                        "Parking garage waterproofing",
                        "Roof replacement"
                    ],
                    "answer": 2,
                    "explanation": ""
                }
            ]
        },
        {
            "setNumber": 20,
            "difficulty": "advanced",
            "title": "Government Grant Application Comparison",
            "passage": "The Ontario government offers several grant programs to help small businesses grow. Each program targets different types of businesses and has specific eligibility requirements and application processes. Applying to the wrong program wastes time and delays access to funding.\n\nAll programs require the business to be incorporated in Ontario and in good standing with the Canada Revenue Agency. Grant funds are typically disbursed in stages — an initial payment upon approval, a mid-project payment upon milestone verification, and a final payment upon project completion and submission of a final report.\n\nGrants are non-repayable, unlike loans. However, if a business fails to complete the project as described in the application, the grant may be partially or fully clawed back. Businesses that receive a grant must maintain detailed financial records and may be subject to a government audit within 3 years of receiving funds.\n\nOnly one grant per program per business per fiscal year is permitted. Businesses can apply to multiple different programs simultaneously.",
            "visualType": "grant_comparison_table",
            "visualTitle": "Ontario Small Business Grant Programs — 2026",
            "visualData": [
                [
                    "Program",
                    "Max Grant",
                    "Eligible Businesses",
                    "Eligible Expenses",
                    "Deadline",
                    "Match Required"
                ],
                [
                    "Ontario Innovation Fund (OIF)",
                    "$75,000",
                    "Tech companies with <50 employees",
                    "R&D, prototyping, IP development",
                    "June 30",
                    "50% match (business pays 50%)"
                ],
                [
                    "Main Street Revival Grant",
                    "$15,000",
                    "Retail/hospitality with <10 employees",
                    "Storefront renovation, signage, accessibility upgrades",
                    "Rolling (apply anytime)",
                    "25% match"
                ],
                [
                    "Export Market Development",
                    "$30,000",
                    "Manufacturers with export revenue <$1M",
                    "Trade shows, market research, export certifications",
                    "March 31 and Sept 30",
                    "30% match"
                ],
                [
                    "Digital Transformation Grant",
                    "$25,000",
                    "Any sector with <100 employees",
                    "Website, e-commerce, POS systems, cybersecurity",
                    "Rolling",
                    "No match required"
                ],
                [
                    "Green Business Incentive",
                    "$50,000",
                    "Any sector with <50 employees",
                    "Energy audits, solar panels, EV fleet, waste reduction",
                    "April 15 and Oct 15",
                    "40% match"
                ]
            ],
            "visualNotes": null,
            "questions": [
                {
                    "id": "r2s20q1",
                    "type": "mcq",
                    "num": 1,
                    "text": "A small bakery with 6 employees wants to renovate its storefront. Which grant should they apply for?",
                    "options": [
                        "Ontario Innovation Fund",
                        "Main Street Revival Grant",
                        "Digital Transformation Grant",
                        "Green Business Incentive"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s20q2",
                    "type": "mcq",
                    "num": 2,
                    "text": "A tech startup wants a $75,000 OIF grant. How much of their own money must they spend on the project?",
                    "options": [
                        "Nothing — the grant covers everything",
                        "$25,000 (25% match)",
                        "$37,500 (they pay 50% of total project cost)",
                        "$75,000 (matching dollar-for-dollar)"
                    ],
                    "answer": 3,
                    "explanation": ""
                },
                {
                    "id": "r2s20q3",
                    "type": "mcq",
                    "num": 3,
                    "text": "Which grant program has NO matching requirement?",
                    "options": [
                        "Ontario Innovation Fund",
                        "Export Market Development",
                        "Digital Transformation Grant",
                        "Green Business Incentive"
                    ],
                    "answer": 2,
                    "explanation": ""
                },
                {
                    "id": "r2s20q4",
                    "type": "mcq",
                    "num": 4,
                    "text": "A manufacturing company wants to attend an international trade show. When must they apply?",
                    "options": [
                        "Anytime — it's a rolling deadline",
                        "By March 31 or September 30",
                        "By June 30",
                        "By April 15 or October 15"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s20q5",
                    "type": "mcq",
                    "num": 5,
                    "text": "What happens if a business doesn't complete the project described in their grant application?",
                    "options": [
                        "Nothing — the grant is non-repayable",
                        "The grant may be partially or fully clawed back",
                        "The business is blacklisted from all future government programs",
                        "The business must donate the unused funds to charity"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s20q6",
                    "type": "mcq",
                    "num": 6,
                    "text": "Can a business apply to both the Digital Transformation Grant and the Green Business Incentive in the same year?",
                    "options": [
                        "No — only one grant per year is allowed",
                        "Yes — businesses can apply to multiple different programs simultaneously",
                        "Only if the total combined funding is under $50,000",
                        "Only with special permission from the government"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s20q7",
                    "type": "mcq",
                    "num": 7,
                    "text": "A restaurant owner wants to install a new POS system and build a website. Which grant covers this?",
                    "options": [
                        "Main Street Revival Grant",
                        "Digital Transformation Grant",
                        "Ontario Innovation Fund",
                        "Export Market Development"
                    ],
                    "answer": 1,
                    "explanation": ""
                },
                {
                    "id": "r2s20q8",
                    "type": "mcq",
                    "num": 8,
                    "text": "For how many years after receiving a grant can a business be audited by the government?",
                    "options": [
                        "1 year",
                        "2 years",
                        "3 years",
                        "5 years"
                    ],
                    "answer": 2,
                    "explanation": ""
                }
            ]
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
