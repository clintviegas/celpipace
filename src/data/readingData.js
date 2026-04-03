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
