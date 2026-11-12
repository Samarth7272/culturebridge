<div align="center">

# 🌍 CultureBridge

### Corporate Diversity, Equity & Global Etiquette Workshop Platform

*Plan workshops, practise real engineering situations, and measure what changed. Built for multinational and shared-service teams.*



![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)




![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)




![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)




![Recharts](https://img.shields.io/badge/Recharts-2-22b5bf)




![Status](https://img.shields.io/badge/Status-Working%20demo-brightgreen)



[🚀 Live Demo](https://culturebridge-one.vercel.app) · [💼 LinkedIn](https://linkedin.com/in/samarth-shukla-b72003293) · [🐙 GitHub](https://github.com/Samarth7272) · [📧 Hire Me](mailto:samarthworldwide@gmail.com)

</div>

> ⚠️ **Demo notice:** All users, workshops and results are fictional sample data. Learning content is for demonstration and is not legal or HR advice.

---

## 📌 TL;DR (for recruiters)

- **What:** A role-based web platform with Admin, Trainer and Employee dashboards that covers the full workshop cycle: create workshop → enrol → pre-quiz → scenarios → post-quiz → certificate.
- **Why it matters:** It goes beyond a static UI. Quiz scoring, learning progress, badges and certificates are real logic and persist between visits.
- **Built from a PRD:** Scope, user flows and success measures come from a written Product Requirements Document with competitor research.
- **Deliberate design:** Scenarios give outcome-specific feedback and describe cultural patterns as context, never as rules about a person.
- **Stack:** Next.js 14 · React · TypeScript · Tailwind CSS · Recharts · Lucide icons.
- **Try it in 2 minutes:** Open the [live demo](https://culturebridge-one.vercel.app), go to **Employee**, and take the pre-quiz.

---

## ✨ Features

### 👩‍💼 Admin dashboard (`/admin`)
- Stat cards for workshops, registrations and completion rate
- Interactive charts: registrations over time, registered vs completed
- Create, publish/unpublish and delete workshops with validated form fields
- Upcoming workshop list sorted by date
- One-click **CSV export** of workshop data

### 🧑‍🏫 Trainer workspace (`/facilitator`)
- Pick a published workshop and mark attendance per participant
- Live present count, saved between visits

### 🎓 Employee learning (`/learner`)
- Enrol in or leave published workshops
- **Pre-training quiz** (5 questions, one attempt) sets a baseline
- **5 workplace scenarios** with feedback on every choice, a takeaway and retry
- **Post-training quiz** that unlocks after the pre-quiz and all scenarios, with retake
- Scoring with per-question review and correct answers
- Progress bar, first-try score and score change (pre vs post)
- **6 achievement badges** that unlock from real progress
- **Printable certificate** with editable name, both scores and issue date
- Reset button to test the journey again

### 🏠 Landing page (`/`)
- Animated global network illustration, impact stats, workshop categories and clearly labelled demo testimonials

---

## 🧠 The five scenarios

1. The silent stand-up
2. Direct code review comment
3. Meeting at 7 a.m. for half the team
4. Talked over on a client call
5. A name that keeps being shortened

Each scenario has three responses, outcome-specific feedback and a practical takeaway.

---

## 🛠️ Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, custom glassmorphism CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Data | Fictional seed data, saved in browser `localStorage` |

---

## 🚀 Getting started

Requires **Node 18.17+**.

```bash
git clone https://github.com/Samarth7272/culturebridge.git
cd culturebridge
npm install
npm run dev
```

Open http://localhost:3000. To check a production build, run `npm run build`.

---

## 🧪 How to test the learning flow

1. Open `/learner` and enrol in a workshop (the "First enrolment" badge unlocks).
2. Submit the pre-quiz with a blank answer to see validation, then complete it.
3. Choose a wrong scenario answer, read the feedback, and use **Try again**.
4. Complete all five scenarios. The post-quiz unlocks.
5. Take the post-quiz and check the score change and badges.
6. Open the certificate, edit the name and print it.
7. Refresh the page to confirm progress is saved, then use **Reset my progress**.

---

## 📁 Project structure

```
culturebridge/
├── app/
│   ├── page.tsx            # Landing page
│   ├── admin/page.tsx      # Admin dashboard
│   ├── facilitator/page.tsx# Trainer workspace
│   ├── learner/page.tsx    # Employee learning journey
│   ├── layout.tsx
│   └── globals.css
├── components/             # Nav, Globe illustration, Quiz
├── lib/
│   ├── data.ts             # Workshops, scenarios, quiz questions
│   ├── score.ts            # Scoring, progress, badges, certificate rules
│   └── useStore.ts         # localStorage persistence hook
└── package.json
```

---

## 🗺️ Roadmap

This is a front-end demo. These items from the PRD are **not built yet**:

- [ ] Backend with PostgreSQL and Prisma
- [ ] Real sign-in and server-side role checks
- [ ] Quiz results in the Admin dashboard and CSV
- [ ] Trainer learning materials and assessment results
- [ ] Edit-workshop screen
- [ ] Email reminders
- [ ] Automated tests (Vitest, Playwright)

---

## 🔒 Content safeguards

- Cultural patterns are described as possible context, not rules about every person.
- No personality scoring or ranking of individuals.
- Feedback explains behaviours and outcomes instead of judging identity.

---

## 👤 Author

**Samarth Shukla**,
[LinkedIn](https://linkedin.com/in/samarth-shukla-b72003293) · [GitHub](https://github.com/Samarth7272) · samarthworldwide@gmail.com
