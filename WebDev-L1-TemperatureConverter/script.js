const form = document.querySelector("#converter-form");
const input = document.querySelector("#temperature");
const unitSelect = document.querySelector("#unit");
const errorMessage = document.querySelector("#error-message");
const resultStatus = document.querySelector("#result-status");

const outputFields = {
  C: document.querySelector("#celsius-result"),
  F: document.querySelector("#fahrenheit-result"),
  K: document.querySelector("#kelvin-result")
};

function formatValue(value) {
  return Number(value.toFixed(4)).toLocaleString("en-US", {
    maximumFractionDigits: 4
  });
}

function toCelsius(value, unit) {
  if (unit === "C") return value;
  if (unit === "F") return (value - 32) * 5 / 9;
  return value - 273.15;
}

function showError(message) {
  errorMessage.textContent = message;
  resultStatus.textContent = "CHECK YOUR INPUT";
  Object.values(outputFields).forEach((field) => {
    field.textContent = "—";
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorMessage.textContent = "";

  const rawValue = input.value.trim();
  const value = Number(rawValue);
  const unit = unitSelect.value;

  if (rawValue === "" || !Number.isFinite(value)) {
    showError("Enter a valid numeric temperature to continue.");
    return;
  }

  const absoluteZeroLimits = {
    C: -273.15,
    F: -459.67,
    K: 0
  };

  if (value < absoluteZeroLimits[unit]) {
    showError(`The temperature cannot be below absolute zero (${absoluteZeroLimits[unit]}${unit === "K" ? " K" : `°${unit}`}).`);
    return;
  }

  const celsius = toCelsius(value, unit);
  const fahrenheit = celsius * 9 / 5 + 32;
  const kelvin = celsius + 273.15;

  outputFields.C.textContent = formatValue(celsius);
  outputFields.F.textContent = formatValue(fahrenheit);
  outputFields.K.textContent = formatValue(kelvin);
  resultStatus.textContent = "CONVERSION COMPLETE";
});

input.addEventListener("input", () => {
  if (errorMessage.textContent) {
    errorMessage.textContent = "";
    resultStatus.textContent = "WAITING FOR INPUT";
  }
});