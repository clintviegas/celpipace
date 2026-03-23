#!/usr/bin/env python3
"""
Update all READING questions with their options from the static READING_SETS data
This reads the PracticeSetPage.jsx file and extracts the question options, then updates Supabase
"""

import os
import json
import urllib.request
import re

# Read env
env_path = '/Users/clintviegas/Desktop/React JS/CELPIP/.env'
env_vars = {}
with open(env_path, 'r') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            key, value = line.strip().split('=', 1)
            env_vars[key] = value

supabase_url = env_vars.get('VITE_SUPABASE_URL')
anon_key = env_vars.get('VITE_SUPABASE_ANON_KEY')

# All R1 questions with their options from PracticeSetPage.jsx
r1_data = [
    {
        "number": 1,
        "options": [
            "A) To complain about the high cost of the membership.",
            "B) To request information about the student discount and membership details.",
            "C) To cancel her fitness centre membership.",
            "D) To schedule a personal training session.",
        ]
    },
    {
        "number": 2,
        "options": [
            "A) CA$30",
            "B) CA$149",
            "C) CA$199",
            "D) CA$349"
        ]
    },
    {
        "number": 3,
        "options": [
            "A) Only a valid student ID card.",
            "B) Only a letter from her university registrar.",
            "C) Either a student ID or a dated letter from the registrar's office.",
            "D) A bank statement or proof of address."
        ]
    },
    {
        "number": 4,
        "options": [
            "A) Only on Monday, Wednesday, or Friday mornings.",
            "B) Only on Tuesday or Thursday evenings.",
            "C) Either Monday/Wednesday/Friday mornings or Tuesday/Thursday evenings.",
            "D) Any time during the week since yoga is offered daily."
        ]
    },
    {
        "number": 5,
        "options": [
            "A) CA$199",
            "B) CA$229",
            "C) CA$349",
            "D) CA$379"
        ]
    },
    {
        "number": 6,
        "options": [
            "A) To express concern that Sarah may be unhappy.",
            "B) To show genuine enthusiasm and make the customer feel welcomed.",
            "C) To indicate that most students do not join.",
            "D) To suggest Sarah should hurry before the offer expires."
        ]
    },
    {
        "number": 7,
        "options": [
            "A) He is suggesting Sarah should not join without visiting first.",
            "B) He is inviting Sarah to experience the facility to help her make an informed decision.",
            "C) He is discouraging her from joining online.",
            "D) He is implying the facility may not meet her expectations."
        ]
    },
    {
        "number": 8,
        "options": [
            "A) Unlimited yoga classes.",
            "B) Access to the swimming pool.",
            "C) Strength training.",
            "D) Sauna and massage therapy services."
        ]
    },
    {
        "number": 9,
        "options": [
            "A) To increase their revenue by charging for additional sessions.",
            "B) To help new members start safely and feel supported in their fitness journey.",
            "C) To demonstrate that their facilities are overcrowded with trainers.",
            "D) To replace the need for a gym orientation."
        ]
    },
    {
        "number": 10,
        "options": [
            "A) Dismissive and unhelpful.",
            "B) Professional yet overly formal and cold.",
            "C) Warm, helpful, and customer-focused.",
            "D) Skeptical and cautious."
        ]
    },
    {
        "number": 11,
        "options": [
            "A) Pay the CA$199 membership fee immediately online.",
            "B) Provide her student ID or a letter from her registrar's office and then visit the facility to complete the registration process.",
            "C) Contact Marcus to schedule a specific personal training session.",
            "D) Attend a mandatory orientation class before using the facilities."
        ]
    },
]

headers = {
    'apikey': anon_key,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

print("=== Updating R1 questions ===")
for item in r1_data:
    number = item['number']
    options = item['options']
    
    update_data = {
        "option_a": options[0],
        "option_b": options[1],
        "option_c": options[2],
        "option_d": options[3]
    }
    
    url = f"{supabase_url}/rest/v1/questions?section=eq.Reading&part=eq.R1&number=eq.{number}"
    
    try:
        data = json.dumps(update_data).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers, method='PATCH')
        with urllib.request.urlopen(req) as response:
            print(f"✓ R1 Q{number}: Updated")
    except Exception as e:
        print(f"✗ R1 Q{number}: Error - {e}")

print("\nDone!")
