const storageKey = "daymark-tasks-v1";
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const formError = document.querySelector("#form-error");
const pendingList = document.querySelector("#pending-list");
const completedList = document.querySelector("#completed-list");
const pendingCount = document.querySelector("#pending-count");
const completedCount = document.querySelector("#completed-count");
const clearCompletedButton = document.querySelector("#clear-completed");

let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(saved) ? saved.filter((task) => task && typeof task.id === "string" && typeof task.text === "string") : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function readableDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function createTaskElement(task) {
  const item = document.createElement("article");
  item.className = "task-item";

  const check = document.createElement("button");
  check.className = `task-check${task.completed ? " done" : ""}`;
  check.type = "button";
  check.textContent = task.completed ? "✓" : "";
  check.setAttribute("aria-label", task.completed ? "Mark as pending" : "Mark complete");
  check.addEventListener("click", () => toggleTask(task.id));

  const content = document.createElement("div");
  content.className = "task-content";

  const text = document.createElement("div");
  text.className = "task-text";
  text.textContent = task.text;

  const time = document.createElement("div");
  time.className = "task-time";
  time.textContent = task.completed && task.completedAt
    ? `Added ${readableDate(task.createdAt)} · Completed ${readableDate(task.completedAt)}`
    : `Added ${readableDate(task.createdAt)}`;

  content.append(text, time);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  if (!task.completed) {
    const edit = document.createElement("button");
    edit.type = "button";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => editTask(task.id));
    actions.append(edit);
  }

  const remove = document.createElement("button");
  remove.type = "button";
  remove.textContent = "Delete";
  remove.addEventListener("click", () => deleteTask(task.id));
  actions.append(remove);

  item.append(check, content, actions);
  return item;
}

function renderList(element, items, emptyText) {
  element.replaceChildren();
  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = emptyText;
    element.append(empty);
    return;
  }
  items.forEach((task) => element.append(createTaskElement(task)));
}

function render() {
  const pending = tasks.filter((task) => !task.completed);
  const completed = tasks.filter((task) => task.completed);
  pendingCount.textContent = `${pending.length} pending`;
  completedCount.textContent = `${completed.length} completed`;
  renderList(pendingList, pending, "Nothing on the list yet. Add a task above to get started.");
  renderList(completedList, completed, "Your completed tasks will find a home here.");
}

function addTask(text) {
  tasks.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    text,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map((task) => task.id === id
    ? {...task, completed: !task.completed, completedAt: task.completed ? null : new Date().toISOString()}
    : task);
  saveTasks();
  render();
}

function editTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  const updated = window.prompt("Update your task", task.text);
  if (updated === null) return;
  const cleanText = updated.trim();
  if (!cleanText) {
    window.alert("A task needs a name.");
    return;
  }
  task.text = cleanText;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = taskInput.value.trim();
  if (!value) {
    formError.textContent = "Write a task before adding it.";
    taskInput.focus();
    return;
  }
  addTask(value);
  taskInput.value = "";
  formError.textContent = "";
  taskInput.focus();
});

taskInput.addEventListener("input", () => {
  formError.textContent = "";
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric"
}).format(new Date());

render();