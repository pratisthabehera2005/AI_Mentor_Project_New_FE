import axios from "axios";
import {
  mockProjects,
  mockTasks,
  mockAIInteractions,
} from "../data/mockData";

// Base configuration for the future FastAPI backend.
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// When true the app uses mock data; when false it calls the real backend.
const useMock =
  String(import.meta.env.VITE_USE_MOCK_DATA ?? "false").toLowerCase() === "true";

const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Helper to simulate network latency for mock responses.
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// In-memory stores so mock CRUD stays consistent during a session.
let projects = [...mockProjects];
let tasks = [...mockTasks];
let interactions = [...mockAIInteractions];

const nextId = (list) => (list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1);

function normalizeProject(project) {
  return {
    id: project.project_id ?? project.id,
    name: project.project_name ?? project.name,
    description: project.description,
    techStack: Array.isArray(project.technology_stack)
      ? project.technology_stack
      : String(project.technology_stack ?? project.techStack ?? "")
          .split(",")
          .map((technology) => technology.trim())
          .filter(Boolean),
    createdAt: project.created_at?.slice(0, 10) ?? project.createdAt,
  };
}

function serializeProject(project) {
  return {
    project_name: project.name,
    description: project.description,
    technology_stack: Array.isArray(project.techStack)
      ? project.techStack.join(", ")
      : project.techStack,
  };
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
export async function checkBackendHealth() {
  if (useMock) {
    await delay(150);
    return { status: "ok", mock: true };
  }
  const { data } = await apiClient.get("/api/health");
  return data;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export async function getDashboardStatistics() {
  if (useMock) {
    await delay();
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const pending = tasks.filter((t) => t.status === "Pending").length;
    return {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      pendingTasks: pending,
      inProgressTasks: inProgress,
      completedTasks: completed,
    };
  }
  const { data } = await apiClient.get("/api/dashboard");
  return data;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export async function getProjects() {
  if (useMock) {
    await delay();
    return [...projects];
  }
  const { data } = await apiClient.get("/api/projects");
  return data.map(normalizeProject);
}

export async function getProjectById(projectId) {
  if (useMock) {
    await delay();
    return projects.find((p) => p.id === Number(projectId)) || null;
  }
  const { data } = await apiClient.get(`/api/projects/${projectId}`);
  return normalizeProject(data);
}

export async function createProject(projectData) {
  if (useMock) {
    await delay();
    const project = {
      id: nextId(projects),
      createdAt: new Date().toISOString().slice(0, 10),
      ...projectData,
    };
    projects = [...projects, project];
    return project;
  }
  const { data } = await apiClient.post(
    "/api/projects",
    serializeProject(projectData)
  );
  return normalizeProject(data);
}

export async function updateProject(projectId, projectData) {
  if (useMock) {
    await delay();
    projects = projects.map((p) =>
      p.id === Number(projectId) ? { ...p, ...projectData } : p
    );
    return projects.find((p) => p.id === Number(projectId));
  }
  const { data } = await apiClient.put(
    `/api/projects/${projectId}`,
    serializeProject(projectData)
  );
  return normalizeProject(data);
}

export async function deleteProject(projectId) {
  if (useMock) {
    await delay();
    projects = projects.filter((p) => p.id !== Number(projectId));
    tasks = tasks.filter((t) => t.projectId !== Number(projectId));
    return { success: true };
  }
  await apiClient.delete(`/api/projects/${projectId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
export async function getTasks() {
  if (useMock) {
    await delay();
    return [...tasks];
  }
  const { data } = await apiClient.get("/api/tasks");
  return data;
}

export async function createTask(taskData) {
  if (useMock) {
    await delay();
    const task = {
      id: nextId(tasks),
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      ...taskData,
    };
    tasks = [...tasks, task];
    return task;
  }
  const { data } = await apiClient.post("/api/tasks", taskData);
  return data;
}

export async function updateTask(taskId, taskData) {
  if (useMock) {
    await delay();
    tasks = tasks.map((t) =>
      t.id === Number(taskId)
        ? { ...t, ...taskData, updatedAt: new Date().toISOString().slice(0, 10) }
        : t
    );
    return tasks.find((t) => t.id === Number(taskId));
  }
  const { data } = await apiClient.put(`/api/tasks/${taskId}`, taskData);
  return data;
}

export async function updateTaskStatus(taskId, status) {
  if (useMock) {
    await delay(150);
    tasks = tasks.map((t) =>
      t.id === Number(taskId)
        ? { ...t, status, updatedAt: new Date().toISOString().slice(0, 10) }
        : t
    );
    return tasks.find((t) => t.id === Number(taskId));
  }
  const { data } = await apiClient.patch(`/api/tasks/${taskId}/status`, { status });
  return data;
}

export async function deleteTask(taskId) {
  if (useMock) {
    await delay();
    tasks = tasks.filter((t) => t.id !== Number(taskId));
    return { success: true };
  }
  await apiClient.delete(`/api/tasks/${taskId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// AI
// ---------------------------------------------------------------------------
export async function generateAIPlan(requestData) {
  if (useMock) {
    await delay(900);
    return buildMockAIResponse(requestData);
  }
  const { data } = await apiClient.post("/api/ai/plan", requestData);
  return data;
}

export async function getAIHistory(projectId) {
  if (useMock) {
    await delay();
    if (projectId) {
      return interactions.filter((i) => i.projectId === Number(projectId));
    }
    return [...interactions];
  }
  const url = projectId
    ? `/api/ai/history/${projectId}`
    : "/api/ai/history";
  const { data } = await apiClient.get(url);
  return data;
}

export async function deleteAIInteraction(interactionId) {
  if (useMock) {
    await delay();
    interactions = interactions.filter((i) => i.id !== Number(interactionId));
    return { success: true };
  }
  await apiClient.delete(`/api/ai/history/${interactionId}`);
  return { success: true };
}

export async function saveAIInteraction(interaction) {
  if (useMock) {
    await delay();
    const record = {
      id: nextId(interactions),
      createdAt: new Date().toISOString().slice(0, 10),
      modelName: "GPT-OSS",
      ...interaction,
    };
    interactions = [record, ...interactions];
    return record;
  }
  const { data } = await apiClient.post("/api/ai/history", interaction);
  return data;
}

// ---------------------------------------------------------------------------
// Mock AI response generator (frontend-only placeholder)
// ---------------------------------------------------------------------------
function buildMockAIResponse({ aiTaskType, requirement, projectName }) {
  const label = aiTaskType || "Break Requirement into Tasks";
  return {
    requirementUnderstanding: `For the "${projectName || "selected"}" project, the AI mentor interpreted the request as: ${requirement || "general project guidance"}. Task type: ${label}.`,
    frontendTasks: [
      "Create a responsive page for the requested feature.",
      "Add form validation and loading states.",
      "Display success and error messages to the user.",
    ],
    backendTasks: [
      "Add a FastAPI endpoint with input validation.",
      "Return structured JSON the frontend can render.",
      "Log errors for debugging.",
    ],
    databaseTasks: [
      "Create the required table with primary key.",
      "Add indexes for frequently queried columns.",
      "Use parameterised queries to prevent SQL injection.",
    ],
    testingSteps: [
      "Write unit tests for the endpoint.",
      "Test the form with empty and invalid input.",
      "Verify the feature works end to end in the browser.",
    ],
    possibleBlockers: [
      "Backend may not be running during development.",
      "Database schema may still be changing.",
      "AI model responses can vary between calls.",
    ],
    recommendedNextAction:
      "Start with the backend endpoint, then build the frontend form, and finish with tests.",
  };
}

export { useMock };
