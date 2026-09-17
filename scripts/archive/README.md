# Archive

One-off scripts that already did their job: initial content generation
(`gen-r*.mjs`, `convert-*.mjs`, `append-l5l6.mjs`), a completed backfill
(`backfill-*.mjs`), a finished retry (`retry-failed.mjs`), a superseded
upload path (`upload-r2-fast.mjs`), and a one-time asset/report generator
(`generate-audio.mjs`, `generate-audit-pdf.mjs`).

None of these are wired into `package.json`, a cron, or referenced by
current docs — confirmed by grep before moving them here. Kept for
reference (they show how the initial question bank was seeded) rather
than deleted outright. Safe to delete for real if that history stops
being useful.
