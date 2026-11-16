const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const keypad = document.querySelector(".keypad");

let current = "0";
let storedExpression = "";
let justEvaluated = false;

function updateDisplay() {
  display.textContent = current;
  expression.textContent = storedExpression || "Ready when you are";
}

function appendValue(value) {
  if (justEvaluated && /[0-9.]/.test(value)) {
    current = "0";
    storedExpression = "";
  }
  justEvaluated = false;

  if (/[0-9]/.test(value)) {
    current = current === "0" ? value : current + value;
  } else if (value === ".") {
    if (!current.includes(".")) current += ".";
  } else {
    if (current === "Error") return;
    if (/[+\-×÷]$/.test(current)) {
      current = current.slice(0, -1) + value;
    } else {
      current += value;
    }
  }
  updateDisplay();
}

function tokenize(source) {
  const tokens = source.match(/(?:\d+\.?\d*|\.\d+)|[+\-×÷]/g);
  if (!tokens || tokens.join("") !== source.replace(/\s/g, "")) throw new Error("Invalid expression");
  return tokens;
}

function calculate(source) {
  const tokens = tokenize(source);
  let position = 0;

  function parseFactor() {
    const token = tokens[position];
    if (token === "+" || token === "-") {
      position += 1;
      const value = parseFactor();
      return token === "-" ? -value : value;
    }
    if (token === undefined || !/^(?:\d+\.?\d*|\.\d+)$/.test(token)) throw new Error("Invalid expression");
    position += 1;
    return Number(token);
  }

  function parseTerm() {
    let value = parseFactor();
    while (tokens[position] === "×" || tokens[position] === "÷") {
      const operator = tokens[position++];
      const next = parseFactor();
      if (operator === "÷" && next === 0) throw new Error("Cannot divide by zero");
      value = operator === "×" ? value * next : value / next;
    }
    return value;
  }

  function parseExpression() {
    let value = parseTerm();
    while (tokens[position] === "+" || tokens[position] === "−" || tokens[position] === "-") {
      const operator = tokens[position++];
      const next = parseTerm();
      value = operator === "+" ? value + next : value - next;
    }
    return value;
  }

  const answer = parseExpression();
  if (position !== tokens.length || !Number.isFinite(answer)) throw new Error("Invalid expression");
  return Number(answer.toPrecision(12)).toString();
}

function evaluate() {
  const source = current.replace(/−/g, "-");
  try {
    const answer = calculate(source);
    storedExpression = `${current} =`;
    current = answer;
    justEvaluated = true;
  } catch (error) {
    storedExpression = error.message;
    current = "Error";
    justEvaluated = true;
  }
  updateDisplay();
}

function clear() {
  current = "0";
  storedExpression = "";
  justEvaluated = false;
  updateDisplay();
}

function backspace() {
  if (justEvaluated || current === "Error") {
    clear();
    return;
  }
  current = current.length > 1 ? current.slice(0, -1) : "0";
  if (current === "-") current = "0";
  updateDisplay();
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action === "clear") clear();
  else if (button.dataset.action === "backspace") backspace();
  else if (button.dataset.action === "equals") evaluate();
  else appendValue(button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9.]$/.test(event.key)) appendValue(event.key);
  else if (event.key === "+") appendValue("+");
  else if (event.key === "-") appendValue("−");
  else if (event.key === "*") appendValue("×");
  else if (event.key === "/") {
    event.preventDefault();
    appendValue("÷");
  } else if (event.key === "Enter" || event.key === "=") evaluate();
  else if (event.key === "Backspace") backspace();
  else if (event.key === "Escape") clear();
});

updateDisplay();