let currentType = "length";
let currentOperation = "add";

// JWT token from localStorage
const token = localStorage.getItem("token");
let userId = null;

// Decode JWT payload to get userId
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    userId = payload.userId;
  } catch (e) {
    console.warn("Invalid token");
  }
}

const units = {
  length: ["Feet", "Inches", "Yards", "Centimeters"],
  weight: ["Kilogram", "Pound", "Gram"],
  volume: ["Litre", "Gallon", "Millilitre"],
  temperature: ["Celsius", "Fahrenheit"]
};

/* SELECT QUANTITY */
function selectQuantity(type, el) {
  currentType = type;

  document.querySelectorAll("#quantityTabs .tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");

  loadUnits();

  const operationTabs = document.querySelectorAll("#operationTabs .tab");
  operationTabs.forEach(tab => {
    const op = tab.innerText.toLowerCase();
    if (type === "temperature") {
      tab.style.display = (op === "compare" || op === "convert") ? "block" : "none";
    } else {
      tab.style.display = "block";
    }
  });

  currentOperation = type === "temperature" ? "compare" : "add";
  document.querySelectorAll("#operationTabs .tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll("#operationTabs .tab").forEach(t => {
    if (t.innerText.toLowerCase() === currentOperation) t.classList.add("active");
  });

  handleVisibility();
}

/* SELECT OPERATION */
function selectOperation(op, el) {
  currentOperation = op;
  document.querySelectorAll("#operationTabs .tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  handleVisibility();
}

/*  LOAD UNITS */
function loadUnits() {
  const u1 = document.getElementById("unit1");
  const u2 = document.getElementById("unit2");

  u1.innerHTML = "";
  u2.innerHTML = "";

  units[currentType].forEach(u => {
    u1.innerHTML += `<option>${u}</option>`;
    u2.innerHTML += `<option>${u}</option>`;
  });
}

/*  HANDLE VISIBILITY */
function handleVisibility() {
  const v2 = document.getElementById("value2");
  const u2 = document.getElementById("unit2");

  v2.style.display = "block";
  u2.style.display = "block";

  if (currentOperation === "convert") v2.style.display = "none";
  if (currentType === "temperature" && currentOperation !== "compare") v2.style.display = "none";
}

/*  CALCULATE BUTTON */
async function calculate() {
  const value1El = document.getElementById("value1");
  const value2El = document.getElementById("value2");
  const unit1El = document.getElementById("unit1");
  const unit2El = document.getElementById("unit2");
  const resultEl = document.getElementById("result");

  try {
    let res;
    if (currentOperation === "convert") {
      const data = {
        quantityDTO: {
          value: parseFloat(value1El.value),
          unit: unit1El.value,
          measurementType: currentType
        },
        targetUnit: unit2El.value
      };
      res = await apiCall("/v1/quantities/convert", "POST", data, token);
      resultEl.innerText = `${res.value} ${res.unit}`;
    } else {
      const data = {
        thisQuantityDTO: {
          value: parseFloat(value1El.value),
          unit: unit1El.value,
          measurementType: currentType
        },
        thatQuantityDTO: {
          value: parseFloat(value2El.value),
          unit: unit2El.value,
          measurementType: currentType
        }
      };
      res = await apiCall(`/v1/quantities/${currentOperation}`, "POST", data, token);

      if (currentOperation === "compare") {
        resultEl.innerText = res.result === 1 ? "Both Equal" : "Not Equal";
      } else {
        resultEl.innerText = `${res.value} ${res.unit}`;
      }
    }

    // Refresh history automatically
    await loadHistory();

  } catch (err) {
    console.error("Calculation failed:", err);
    resultEl.innerText = "Error during calculation";
  }
}

/*  LOAD USER HISTORY */
async function loadHistory() {
  const tbody = document.querySelector("#history tbody");
  tbody.innerHTML = ""; // clear old rows

  if (!token) {
    tbody.innerHTML = `<tr><td colspan="7">No history yet</td></tr>`;
    return;
  }

  try {
    const res = await apiCall("/v1/quantities/history/all", "GET", null, token);
    const historyArray = Array.isArray(res.data) ? res.data : [];

    if (historyArray.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">No history yet</td></tr>`;
      return;
    }

    // Sort latest first
    historyArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    historyArray.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.firstValue}</td>
        <td>${item.firstUnit}</td>
        <td>${item.operation}</td>
        <td>${item.secondValue || ""}</td>
        <td>${item.secondUnit || ""}</td>
        <td>${item.result} ${item.resultUnit}</td>
        <td>${item.measurementType}</td>
        <td>${item.createdAt}</td>
      `;
     
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("Failed to load history:", err);
    tbody.innerHTML = `<tr><td colspan="7">Unable to fetch history</td></tr>`;
  }
}

      
/*  LOGOUT */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

/*  API CALL HELPER */
const API_BASE_URL = "http://localhost:5263/api"; // Change to your backend URL
async function apiCall(url, method = "GET", body = null, token = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(API_BASE_URL + url, options);
  if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  return response.json();
}

/* INIT */
loadUnits();
handleVisibility();
loadHistory();