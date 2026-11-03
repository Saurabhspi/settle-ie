<div align="center">

# Setup Ireland

### Your Ireland setup, made simple.

An AI-powered relocation assistant that gives people moving to Ireland a personalised step-by-step roadmap, answers their questions from official Irish government sources, and keeps their important documents in one place.

[**Live app**](https://setupireland.vercel.app) · [**Backend health check**](https://settle-ie.onrender.com/api/health)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Pinecone](https://img.shields.io/badge/Vector_DB-Pinecone-1C1C1C)
![Groq](https://img.shields.io/badge/LLM-Llama_3.1_via_Groq-F55036)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)

</div>

---

## Why I built this

I moved from India to Ireland and spent a lot of time working out the order of things: PPS number, IRP card, bank account, tax registration, GP, Leap card. The information was spread across many government websites, and the right order depended on my nationality, visa and situation.

Setup Ireland puts all of that in one place. You answer a short quiz, and the app builds a checklist that fits your situation, tracks your deadlines, and lets you ask questions in plain English.

---

## Features

| Feature | What it does |
|---|---|
| **Personalised roadmap** | A 4-step onboarding quiz (nationality, visa, employment, arrival date, family) generates only the steps that apply to you, in a sensible order |
| **Deadline tracking** | Time-limited steps, such as registering for an IRP card within 90 days of arrival, get an automatic due date |
| **Fáilte, the AI assistant** | Answers questions about Irish bureaucracy using retrieval-augmented generation (RAG) over official government pages, with source links on every answer |
| **Document vault** | Upload and manage passport, proof of address, employment letter and more, stored in the cloud |
| **Community tips** | Users share and like practical advice by category (housing, tax, banking, and so on) |
| **Email reminders** | A daily scheduled job emails users as their deadlines get close |
| **Installable app** | Works as a Progressive Web App, so it can be added to a phone's home screen and opens full screen |

---

## Screenshots

> Add your screenshots to `docs/screenshots/` and they will appear here.

| Landing page | Roadmap dashboard |
|---|---|
| ![Landing](docs/screenshots/landing.png) | ![Roadmap](docs/screenshots/roadmap.png) |

| Fáilte AI assistant | Document vault |
|---|---|
| ![Assistant](docs/screenshots/assistant.png) | ![Documents](docs/screenshots/documents.png) |

---

## How the AI assistant works

Fáilte does not answer from memory. It looks things up first, then writes an answer using only what it found. This is called **retrieval-augmented generation (RAG)**, and it is what keeps the answers grounded in real sources rather than guesses.

```
          ┌──────────────── Done once (ingestion) ────────────────┐
          │                                                        │
  Irish government pages → split into ~500-word chunks → convert   │
  each chunk to numbers (embedding) → store in Pinecone            │
          └────────────────────────────────────────────────────────┘

          ┌──────────────── On every question ─────────────────────┐
          │                                                         │
  User question → convert to numbers (same embedding model)         │
        → Pinecone finds the 5 closest chunks                       │
        → chunks + question + recent chat sent to Llama 3.1         │
        → answer returned with source URLs                          │
          └─────────────────────────────────────────────────────────┘
```

- **Embeddings:** `Xenova/all-MiniLM-L6-v2`, run locally on the server (384 dimensions, no API cost)
- **Vector search:** Pinecone, cosine similarity, top 5 matches
- **Generation:** `llama-3.1-8b-instant` through Groq, with a system prompt that tells the model to answer only from the retrieved context
- **Knowledge base:** citizensinformation.ie pages covering PPS numbers, IRP registration, tax, medical cards, driving licences and school enrolment

---

## How the roadmap engine works

Every possible step lives in one config file with a rule describing who needs it. When a user finishes the quiz, the engine filters the list against their answers and saves only the matching steps.

```js
{
  key: 'irp_card',
  title: 'Register for your IRP card',
  due_days_from_arrival: 90,
  appliesTo: { nationalities: ['non-eu'] },   // EU citizens never see this step
}
```

Adding a new step means adding one object to the file. No database migration is needed.

---

## Architecture

```
┌──────────────┐     HTTPS      ┌──────────────────┐
│  React app   │ ─────────────► │  Express API     │
│  (Vercel)    │                │  (Render)        │
└──────────────┘                └────────┬─────────┘
                                         │
        ┌───────────────┬────────────────┼───────────────┬──────────────┐
        ▼               ▼                ▼               ▼              ▼
  ┌──────────┐   ┌────────────┐   ┌────────────┐  ┌────────────┐  ┌──────────┐
  │ Neon     │   │ Pinecone   │   │ Groq       │  │ Cloudinary │  │ Email    │
  │ Postgres │   │ vectors    │   │ Llama 3.1  │  │ documents  │  │ service  │
  └──────────┘   └────────────┘   └────────────┘  └────────────┘  └──────────┘
```

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | React, React Router, Tailwind CSS, Framer Motion | Vercel |
| Backend | Node.js, Express, JWT, bcrypt, multer, node-cron | Render |
| Database | PostgreSQL | Neon |
| AI | Xenova embeddings, Pinecone, Groq (Llama 3.1) | Pinecone and Groq cloud |
| Files | Cloudinary | Cloudinary |

Deployment is automatic: pushing to `main` redeploys both Vercel and Render.

---

## Project structure

```
setup-ireland/
├── client/                     React frontend
│   ├── public/                 manifest.json, icons (PWA)
│   └── src/
│       ├── api/                Axios instance with JWT interceptor
│       ├── components/         PageTransition, InstallPrompt
│       ├── context/            AuthContext (global login state)
│       └── pages/              Landing, Login, Register, Onboarding,
│                               Dashboard, Assistant, Documents, Community
└── server/                     Express backend
    └── src/
        ├── ai/                 scraper, ingest, ragService
        ├── config/             steps catalogue, Cloudinary setup
        ├── cron/               daily deadline reminder job
        ├── db/                 connection pool and SQL migrations
        ├── middleware/         JWT auth guard
        ├── routes/             auth, roadmap, assistant, documents, community
        └── services/           roadmap engine, email service
```

---

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in, returns a JWT |
| GET | `/api/auth/verify-email` | Confirm an email address |
| POST | `/api/roadmap/onboard` | Save quiz answers and generate the roadmap |
| GET | `/api/roadmap` | Fetch the user's roadmap |
| GET | `/api/roadmap/progress` | Completion percentage |
| PATCH | `/api/roadmap/:stepId` | Update a step's status |
| POST | `/api/assistant/chat` | Ask Fáilte a question |
| GET | `/api/assistant/history` | Previous conversation |
| POST | `/api/documents/upload` | Upload a document |
| GET / DELETE | `/api/documents` | List or remove documents |
| GET / POST | `/api/community` | Read or share tips |
| POST | `/api/community/:tipId/like` | Like or unlike a tip |

Everything except register, login and email verification requires a valid JWT.

---

## Security notes

- Passwords are hashed with bcrypt and never stored in plain text
- Login returns the same error for a wrong email and a wrong password, so attackers cannot discover which emails are registered
- All database queries are parameterised, which prevents SQL injection
- Update and delete routes check both the record ID and the user ID, so one user cannot modify another user's data
- File uploads are limited to JPG, PNG and PDF, up to 5 MB, validated on the server
- Secrets live in environment variables and are excluded from Git

---

## Run it locally

**Prerequisites:** Node.js 18+, PostgreSQL, and free accounts on Pinecone, Groq and Cloudinary.

```bash
# 1. Clone
git clone https://github.com/Saurabhspi/settle-ie.git
cd settle-ie

# 2. Backend
cd server
npm install
# create a database called settle_ie and run the SQL files in src/db/migrations/
cp .env.example .env     # then fill in your own values
npm run ingest           # one-off: scrape and embed the knowledge base
npm run dev

# 3. Frontend (new terminal)
cd client
npm install
npm start
```

**Server environment variables** (`server/.env`)

```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/settle_ie
JWT_SECRET=<long random string>
CLIENT_URL=http://localhost:3000
PINECONE_API_KEY=
PINECONE_INDEX=settle-ie
GROQ_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
# plus the credentials for whichever email provider you configure
```

**Client environment variable** (`client/.env`)

```
REACT_APP_API_URL=http://localhost:5000/api
```

> The Pinecone index must be created with **384 dimensions** and the **cosine** metric to match the embedding model.

---

## Known limitations and next steps

I would rather be upfront about what is unfinished:

- **Email verification is in progress.** Verification emails work in local testing, but delivery from the hosted backend is not reliable yet because the free hosting tier blocks the mail connection I first used. Unverified users can currently still sign in. The fix is to move to an email provider that sends over HTTPS and then require verification before access.
- **Cold starts.** The backend runs on a free tier that sleeps after inactivity, so the first request after a quiet period can take up to a minute.
- **CORS is open to all origins.** Fine for a portfolio demo; a production version should restrict it to the Vercel domain.
- **Knowledge base is six government pages.** Broader coverage (housing, driving, social welfare) would make Fáilte more useful.

**Planned**

- [ ] Finish email verification and resend-link flow
- [ ] Google sign-in (OAuth)
- [ ] User profile page
- [ ] Export roadmap as PDF
- [ ] Support for more destination countries
- [ ] Automated tests and a CI pipeline
- [ ] Restrict CORS to the production domain

---

## What I learned

- Designing a RAG pipeline end to end: scraping, chunking with overlap, embeddings, vector search and prompt grounding
- Separating configuration (the step catalogue) from user data (their progress) so content can change without migrations
- Deploying a split architecture across Vercel, Render and Neon, and debugging real production problems such as CORS, environment variables and blocked SMTP
- Turning a React app into an installable PWA
- Renaming a live product, including its domain, logo and install icon, without breaking existing links

---

## Author

**Saurabh Anand**, full-stack developer, MSc Computer Science (University College Dublin)

[GitHub](https://github.com/Saurabhspi) · [LinkedIn](#) · saurabhanand808@gmail.com

---

<div align="center">

*Céad Míle Fáilte: a hundred thousand welcomes.* 🇮🇪

</div>
