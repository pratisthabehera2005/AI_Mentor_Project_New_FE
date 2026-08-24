# AI Project Mentor

## Application objective

AI Project Mentor is a beginner-friendly full-stack training application where users can:

- Create and manage software projects.
- Add development tasks to a project.
- Update task priorities and statuses.
- View project progress through a dashboard.
- Ask an AI mentor to break requirements into development tasks.
- View previous AI interactions.

This repository contains the **frontend only**, built with React and Vite. It uses realistic mock data and is prepared for future integration with a Python + FastAPI backend.

## Technology stack

- HTML5, CSS3, JavaScript ES6+
- React.js (functional components and hooks)
- Vite (React build tool)
- React Router DOM (navigation)
- Axios (prepared for future API calls)
- lucide-react (icons)

## Current frontend features

- Responsive sidebar and header layout
- Dashboard with summary cards, project progress, recent tasks, and AI recommendation
- Projects page with create, edit, delete, and view actions
- Project details page with task management
- Tasks page with filters, search, status changes, and CRUD
- AI Mentor page with structured mock AI response
- AI History page with filters and full response viewer
- Reusable UI components (LoadingSpinner, ErrorMessage, SuccessMessage, EmptyState, ConfirmDialog, Modal)
- Form validation with inline error messages
- Confirmation dialogs before deletes
- Mobile-friendly responsive design

## Planned backend technologies

- Python
- FastAPI REST APIs
- SQL Server database
- Ollama Cloud API using a GPT-OSS model

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Folder structure

```
src/
  components/
    Layout/        App shell, sidebar, header
    Dashboard/      Stat card
    Projects/       Project form
    Tasks/          Task form
    AI/             (reserved for future AI components)
    Common/         Reusable UI: Modal, ConfirmDialog, badges, etc.
  context/          DataContext (shared state + CRUD)
  data/             mockData.js (projects, tasks, AI interactions)
  pages/            DashboardPage, ProjectsPage, ProjectDetailsPage,
                    TasksPage, AIMentorPage, AIHistoryPage, NotFoundPage
  services/         api.js (Axios service with mock fallback)
  styles/           global.css
  App.jsx           Routes
  main.jsx          Entry point
```

## Environment variables

Copy `.env.example` to `.env` and adjust as needed:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_USE_MOCK_DATA=false
```

- `VITE_API_BASE_URL`: The base URL of the future FastAPI backend.
- `VITE_USE_MOCK_DATA`: When `true`, the app uses local mock data. Set to `false` to call the real backend.

AI API keys, database credentials, and connection strings belong only in the Python backend and are never stored in the frontend.

## Future FastAPI integration plan

The frontend is prepared to consume these endpoints:

```
GET    /api/health
GET    /api/dashboard
GET    /api/projects
POST   /api/projects
GET    /api/projects/{project_id}
PUT    /api/projects/{project_id}
DELETE /api/projects/{project_id}
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/{task_id}
PUT    /api/tasks/{task_id}
PATCH  /api/tasks/{task_id}/status
DELETE /api/tasks/{task_id}
POST   /api/ai/plan
POST   /api/ai/next-task
GET    /api/ai/history/{project_id}
```

To switch from mock data to the real backend:

1. Start the FastAPI server at the URL in `VITE_API_BASE_URL`.
2. Set `VITE_USE_MOCK_DATA=false` in `.env`.
3. The Axios service in `src/services/api.js` will automatically call the real endpoints.
