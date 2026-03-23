# 📊 Google Sheet Structure Guide

## Column Headers (Row 1)

Your Google Sheet should have these **exact column names** in Row 1:

| Column | Purpose | Example |
|--------|---------|---------|
| **Section** | Always "Reading" | Reading |
| **Part** | R1, R2, R3, or R4 | R1 |
| **Number** | Question number within part | 1, 2, 3... |
| **Title** | Short question title | Email Inquiry |
| **Passage** | Full passage text | [Full passage content] |
| **Instruction** | Question instruction | What is the main topic? |
| **QuestionText** | The actual question | According to the passage... |
| **Type** | Question type | gist, detail, inference, vocab_context, tone_purpose, mcq |
| **CorrectAnswer** | Answer (for detail/inference/vocab) | The fitness centre manager |
| **OptionA** | (MCQ only) First option | Option text |
| **OptionB** | (MCQ only) Second option | Option text |
| **OptionC** | (MCQ only) Third option | Option text |
| **OptionD** | (MCQ only) Fourth option | Option text |
| **Explanation** | Why this is correct | Explanation text |
| **Difficulty** | easy, medium, hard | medium |

---

## Data Entry Format

### For Gist/Detail/Inference Questions:
```
Section: Reading
Part: R1
Number: 1
Title: Email Inquiry
Passage: [Full passage text]
Instruction: [Question instruction]
QuestionText: [The actual question]
Type: gist
CorrectAnswer: [Answer text]
OptionA: [Leave blank for non-MCQ]
OptionB: [Leave blank for non-MCQ]
OptionC: [Leave blank for non-MCQ]
OptionD: [Leave blank for non-MCQ]
Explanation: [Why this answer is correct]
Difficulty: easy
```

### For MCQ (Multiple Choice) Questions:
```
Section: Reading
Part: R1
Number: 2
Title: Fitness Options
Passage: [Full passage text]
Instruction: [Question instruction]
QuestionText: [The actual question]
Type: mcq
CorrectAnswer: A
OptionA: Option A text
OptionB: Option B text
OptionC: Option C text
OptionD: Option D text
Explanation: [Why option A is correct]
Difficulty: medium
```

### For Vocabulary Context Questions:
```
Section: Reading
Part: R1
Number: 3
Title: Word Meaning
Passage: [Full passage text]
Instruction: [Question instruction]
QuestionText: What does "accommodate" mean in this context?
Type: vocab_context
CorrectAnswer: Provide space or adapting to suit
OptionA: [Leave blank if not MCQ]
OptionB: [Leave blank if not MCQ]
OptionC: [Leave blank if not MCQ]
OptionD: [Leave blank if not MCQ]
Explanation: In this passage, accommodate means...
Difficulty: medium
```

---

## Reading R1 - Email Correspondence (11 Questions)

### Passage: Fitness Centre Membership Inquiry

```
From: sarah.mitchell@email.com
To: manager@fitnessdynamics.ca
Subject: Re: Membership Inquiry
Date: March 15, 2024

Dear Manager,

Thank you for your prompt response to my inquiry about your gymnasium 
facilities. I am very interested in your new classes, particularly the 
morning yoga and evening pilates sessions. However, before I commit to a 
membership, I would appreciate more information.

Specifically, I would like to know:
1. Are the facilities wheelchair accessible?
2. What is included in the premium membership package?
3. Can I pause my membership temporarily without penalty if I need to 
   travel for work?

I am also curious about your class scheduling. I notice from your website 
that most classes run in the evenings. Do you accommodate members who 
prefer early morning sessions? I typically wake at 5 AM and would be 
interested in classes before 8 AM.

Regarding payment, would you accept monthly automatic transfers from my 
bank account, or do you require credit card payments only?

I look forward to your detailed response. I have been searching for a 
suitable fitness facility in this area for quite some time.

Best regards,
Sarah Mitchell
```

### Questions to Add to Your Sheet:

| Number | Type | Question Text | Correct Answer | Options | Explanation |
|--------|------|---|---|---|---|
| 1 | gist | What is the main purpose of Sarah's email? | To request more information about membership options | N/A | Sarah is inquiring about specific details before joining |
| 2 | detail | What three specific pieces of information does Sarah want to know? | Accessibility, premium package details, and membership pause policy | N/A | Listed in points 1-3 of the email |
| 3 | inference | Why does Sarah mention she "wakes at 5 AM"? | To explain her preference for early morning fitness classes | N/A | She's asking if they offer morning sessions |
| 4 | vocab_context | What does "accommodate" mean in this passage? | To provide or make suitable for | A) Accept B) Provide C) Understand D) Schedule | Based on context: "Do you accommodate members..." |
| 5 | tone_purpose | What is the tone of this email? | Professional and courteous | A) Demanding B) Apologetic C) Polite and inquiry D) Angry | Uses "thank you," "please," formal structure |
| 6 | detail | Besides yoga and pilates, what does Sarah ask about the facility? | Wheelchair accessibility and payment methods | N/A | Mentioned separately in her questions |
| 7 | inference | Can we infer that Sarah has looked for fitness facilities before? | Yes, because she states she has been "searching for quite some time" | N/A | Direct quote in final paragraph |
| 8 | mcq | Which payment method is Sarah UNSURE about? | A) Credit card B) Monthly automatic transfers C) Debit card D) Cash | A) Credit card - she asks if they ONLY take credit cards |
| 9 | detail | What classes are specifically mentioned by Sarah as of interest? | Yoga and pilates | N/A | "morning yoga and evening pilates sessions" |
| 10 | inference | What can we infer about Sarah's work situation? | She may need to travel occasionally for work | N/A | She mentions possibility of needing to pause for work travel |
| 11 | tone_purpose | How would you describe Sarah's overall approach? | Thorough and professional | N/A | She lists specific requirements and uses formal language |

---

## How to Use This Guide

1. **Copy the column headers** (Section, Part, Number, Title, etc.) into Row 1 of your Google Sheet
2. **For each question**, fill in one row with the data format shown above
3. **Leave OptionA-D blank** for non-MCQ questions
4. **Use "mcq" type** only when you have 4 options and a single correct answer (A/B/C/D)
5. **Test with one row first**: Click "Celpip Sync" → "Sync to Celpip"
6. **Verify in Supabase**: Check if the question appeared in the database

---

## Common Mistakes to Avoid

❌ **Wrong**: Mixing column order  
✅ **Right**: Keep columns in exact order shown above

❌ **Wrong**: Leaving "Section" blank  
✅ **Right**: Always put "Reading" for reading section

❌ **Wrong**: Using "R-1" or "reading 1"  
✅ **Right**: Use exactly "R1", "R2", "R3", "R4"

❌ **Wrong**: Putting multiple answers in "CorrectAnswer"  
✅ **Right**: One answer per cell (or just "A", "B", "C", "D" for MCQ)

❌ **Wrong**: Empty "Passage" cells  
✅ **Right**: Every question must have the full passage text

---

## Next Steps

1. **Set up your sheet structure** with headers in Row 1
2. **Start with R1** - Add the 11 questions using the data above
3. **Test sync**: Click "Celpip Sync" → "Sync to Celpip"
4. **Check Supabase**: Verify questions appeared in the database
5. **Continue with R2, R3, R4**: Add remaining questions

Would you like me to create a pre-filled CSV file that you can import directly into your sheet?
