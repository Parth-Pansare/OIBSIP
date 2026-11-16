const usersKey = "northstar-users-v1";
const sessionKey = "northstar-session-v1";
const authForm = document.querySelector("#auth-form");
const loginTab = document.querySelector("#login-tab");
const registerTab = document.querySelector("#register-tab");
const nameField = document.querySelector("#name-field");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const formTitle = document.querySelector("#form-title");
const formSubtitle = document.querySelector("#form-subtitle");
const submitButton = document.querySelector("#submit-button");
const formMessage = document.querySelector("#form-message");
const authView = document.querySelector("#auth-view");
const dashboardView = document.querySelector("#dashboard-view");
const accountName = document.querySelector("#account-name");
const accountEmail = document.querySelector("#account-email");
const logoutButton = document.querySelector("#logout-button");

let mode = "login";

function readUsers() {
  try {
    const value = JSON.parse(localStorage.getItem(usersKey) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(usersKey, JSON.stringify(users));
}

async function hashPassword(password) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error("Secure password hashing is unavailable. Open this project through localhost or a secure connection.");
  }
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function setMode(nextMode) {
  mode = nextMode;
  const registering = mode === "register";
  loginTab.classList.toggle("active", !registering);
  registerTab.classList.toggle("active", registering);
  loginTab.setAttribute("aria-selected", String(!registering));
  registerTab.setAttribute("aria-selected", String(registering));
  nameField.hidden = !registering;
  formTitle.textContent = registering ? "Create your account." : "Sign in to continue.";
  formSubtitle.textContent = registering
    ? "A few details and your personal space is ready."
    : "Enter your details to access your personal space.";
  submitButton.innerHTML = registering ? 'Create account <span>→</span>' : 'Sign in <span>→</span>';
  passwordInput.autocomplete = registering ? "new-password" : "current-password";
  formMessage.textContent = "";
}

function showDashboard(user) {
  authView.hidden = true;
  dashboardView.hidden = false;
  accountName.textContent = user.name;
  accountEmail.textContent = user.email;
}

function showAuth() {
  dashboardView.hidden = true;
  authView.hidden = false;
  setMode("login");
}

loginTab.addEventListener("click", () => setMode("login"));
registerTab.addEventListener("click", () => setMode("register"));

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "";

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const name = nameInput.value.trim();

  if (!email || !password || (mode === "register" && !name)) {
    formMessage.textContent = "Please complete all required fields.";
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    formMessage.textContent = "Enter a valid email address.";
    return;
  }

  if (mode === "register" && (password.length < 8 || !/\d/.test(password))) {
    formMessage.textContent = "Use at least 8 characters and include at least one number.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Please wait...";

  try {
    const users = readUsers();
    const existingUser = users.find((user) => user.email === email);

    if (mode === "register") {
      if (existingUser) {
        formMessage.textContent = "An account with these details already exists.";
        return;
      }
      const passwordHash = await hashPassword(password);
      const newUser = {id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), name, email, passwordHash};
      users.push(newUser);
      writeUsers(users);
      localStorage.setItem(sessionKey, newUser.id);
      showDashboard(newUser);
      authForm.reset();
      return;
    }

    const passwordHash = await hashPassword(password);
    if (!existingUser || existingUser.passwordHash !== passwordHash) {
      formMessage.textContent = "The email or password is incorrect.";
      return;
    }

    localStorage.setItem(sessionKey, existingUser.id);
    showDashboard(existingUser);
    authForm.reset();
  } catch (error) {
    formMessage.textContent = error.message || "Something went wrong. Please try again.";
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = mode === "register" ? 'Create account <span>→</span>' : 'Sign in <span>→</span>';
  }
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem(sessionKey);
  showAuth();
});

function restoreSession() {
  const sessionId = localStorage.getItem(sessionKey);
  if (!sessionId) return;
  const user = readUsers().find((item) => item.id === sessionId);
  if (user) showDashboard(user);
  else localStorage.removeItem(sessionKey);
}

restoreSession();