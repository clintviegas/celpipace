import fs from 'fs';

function convertAnswer(letter) {
  return { A: 0, B: 1, C: 2, D: 3 }[letter];
}

function esc(str) {
  return str.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function formatSets(jsonPath, partId) {
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const lines = [];

  for (const s of raw.sets) {
    const diff = s.difficulty;
    lines.push(`    // ── Set ${s.set_number} (${diff}) ${'─'.repeat(30)}`);
    lines.push(`    {`);
    lines.push(`      setNumber: ${s.set_number},`);
    lines.push(`      partId: '${partId}',`);
    lines.push(`      difficulty: '${diff}',`);
    lines.push(`      title: \`${esc(s.title)}\`,`);
    lines.push(`      instruction: \`${esc(s.context)}\`,`);

    // speakers
    lines.push(`      speakers: [`);
    for (const sp of s.speakers) {
      const rolePart = sp.role ? `, role: '${sp.role}'` : '';
      lines.push(`        { id: '${sp.id}', name: '${sp.name}'${rolePart}, voice: '${sp.voice}' },`);
    }
    lines.push(`      ],`);

    // transcript
    lines.push(`      transcript: [`);
    for (const t of s.transcript) {
      lines.push(`        { speaker: '${t.speaker}', text: \`${esc(t.text)}\` },`);
    }
    lines.push(`      ],`);

    // questions
    lines.push(`      questions: [`);
    for (const q of s.questions) {
      lines.push(`        {`);
      lines.push(`          id: ${q.question_number},`);
      lines.push(`          difficulty: '${diff}',`);
      lines.push(`          questionType: '${q.skill_type || 'mcq'}',`);
      lines.push(`          text: \`${esc(q.question_text)}\`,`);
      lines.push(`          options: [`);
      for (const letter of ['A', 'B', 'C', 'D']) {
        lines.push(`            \`${esc(q.options[letter])}\`,`);
      }
      lines.push(`          ],`);
      lines.push(`          answer: ${convertAnswer(q.correct_answer)},`);
      lines.push(`          explanation: '',`);
      lines.push(`        },`);
    }
    lines.push(`      ],`);
    lines.push(`    },`);
  }

  return lines.join('\n');
}

const l5 = formatSets('/Users/clintviegas/Desktop/Celpipace/listening 2/L5_discussion.json', 'L5');
const l6 = formatSets('/Users/clintviegas/Desktop/Celpipace/listening 2/L6_viewpoints.json', 'L6');

const appendBlock = `\n  L5: [\n${l5}\n  ],\n\n  L6: [\n${l6}\n  ],\n`;

fs.writeFileSync('/tmp/l5l6_append.txt', appendBlock);
console.log('Written', (fs.statSync('/tmp/l5l6_append.txt').size / 1024).toFixed(1), 'KB');