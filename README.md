
# Syllabus2StudyPlan — Deluxe (Vercel-only)

This is the **pro** version: fast parsing + smart augmentation, drag-drop editor, weighted planning, .ics export, and polished UI.

## Local dev
```bash
npm install
npm run dev
```

## Deploy on Vercel
- Import this folder as a project (no env vars required)
- Click Deploy

### Features
- **Ultra-fast parsing:** Uses serverless Node functions. Reads a small slice for domain detection; augments topics from a curated library to avoid sparse results.
- **Doesn't look like fake data:** We start from your uploaded content and expand with relevant subtopics.
- **Editor:** drag-drop, delete, reorder.
- **Planning:** weeks/hours + sessions per week (Mon..Sat).
- **Export:** multi-session `.ics` calendar.
- **Pro UI:** animations, icons, gradients.
