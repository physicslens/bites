# Bite Modules CMS

A minimal Next.js CMS for bite-sized learning modules.

Features:
- Teacher dashboard with module editing and student roster management
- Slide decks supporting text, images, embedded content, LaTeX, and MCQ slides
- Student login by email only
- Assigned modules per class and quiz response tracking

## Setup

1. Install dependencies

```bash
npm install
```

2. Run the development server

```bash
npm run dev
```

3. Open http://localhost:3000

## Pages

- `/` - landing page
- `/teacher` - teacher dashboard
- `/teacher/modules` - module editor
- `/teacher/students` - student roster and CSV upload
- `/login` - student login
- `/student` - student assigned modules

## Data storage

Module and student data are stored in `data/store.json`.
