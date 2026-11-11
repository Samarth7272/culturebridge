# CultureBridge

Workshop platform for global etiquette, diversity and inclusion training. Built from the PRD v0.1 with Next.js 14, React, TypeScript, Tailwind CSS, Lucide and Recharts.

## Run
```
npm install
npm run dev
```
Open http://localhost:3000. Requires Node 18.17+.

## Pages
- `/` landing page
- `/admin` stats, charts, create/publish/delete workshops (validated form), CSV export
- `/facilitator` attendance roster per workshop
- `/learner` enrolment, 3 scenarios with feedback, badges, certificate

Demo data is fictional and saved in the browser (localStorage). There is no backend or sign-in yet; see PRD sections 6 and 10 for the planned database, auth and role checks.
