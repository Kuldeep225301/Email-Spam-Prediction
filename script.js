// ============================================================
// Config
// ============================================================
const API_BASE_URL = "https://email-spam-prediction-1m3d.onrender.com/";
const PREDICT_ENDPOINT = `${API_BASE_URL}/predict`;

const SAMPLE_TEXT =
  "Congratulations! You have been selected to receive a $1,000 Walmart gift card. " +
  "Click the link below within 24 hours to claim your prize before it expires. " +
  "Verify your account now: http://claim-your-prize-now.example.com";

// ============================================================
// Elements
// ============================================================
const emailText = document.getElementById("emailText");
const charCount = document.getElementById("charCount");
const scanBtn = document.getElementById("scanBtn");
const scanBtnLabel = scanBtn.querySelector(".scan-btn__label");
const scanBtnSpinner = scanBtn.querySelector(".scan-btn__spinner");
const clearBtn = document.getElementById("clearBtn");
const sampleBtn = document.getElementById("sampleBtn");
const errorMsg = document.getElementById("errorMsg");

const resultEmpty = document.getElementById("resultEmpty");
const resultCard = document.getElementById("resultCard");
const verdictBadge = document.getElementById("verdictBadge");
const verdictSub = document.getElementById("verdictSub");
const meterFill = document.getElementById("meterFill");
const meterNeedle = document.getElementById("meterNeedle");
const probValue = document.getElementById("probValue");
const processedText = document.getElementById("processedText");

const apiStatusDot = document.querySelector("#apiStatus .status-dot");
const apiStatusText = document.querySelector("#apiStatus .status-text");
const endpointLabel = document.getElementById("endpointLabel");

endpointLabel.textContent = API_BASE_URL;

// ============================================================
// Helpers
// ============================================================
function updateCharCount() {
  const len = emailText.value.length;
  charCount.textContent = `${len} character${len === 1 ? "" : "s"}`;
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.hidden = false;
}

function hideError() {
  errorMsg.hidden = true;
  errorMsg.textContent = "";
}

function setLoading(isLoading) {
  scanBtn.disabled = isLoading;
  scanBtnSpinner.hidden = !isLoading;
  scanBtnLabel.textContent = isLoading ? "Scanning…" : "Run scan";
}

function parseProbability(spamProbabilityStr) {
  // Backend returns something like "82.35%"
  const numeric = parseFloat(String(spamProbabilityStr).replace("%", ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function renderResult(data) {
  const isSpam = Boolean(data.is_spam);
  const probability = parseProbability(data.spam_probability);

  verdictBadge.textContent = data.result || (isSpam ? "Spam" : "Not Spam");
  verdictBadge.dataset.verdict = isSpam ? "spam" : "safe";
  verdictSub.textContent = isSpam
    ? "Flagged — this reads like spam."
    : "Looks safe to deliver.";

  probValue.textContent = `${probability}%`;
  probValue.style.color = isSpam ? "var(--danger)" : "var(--safe)";

  // Defer so the transition actually animates from 0
  meterFill.style.width = "0%";
  meterNeedle.style.left = "0%";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const clamped = Math.max(0, Math.min(100, probability));
      meterFill.style.width = `${clamped}%`;
      meterNeedle.style.left = `${clamped}%`;
    });
  });

  processedText.textContent = data.processed_text || emailText.value;

  resultEmpty.hidden = true;
  resultCard.hidden = false;
}

// ============================================================
// API status check (GET /)
// ============================================================
async function checkApiStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/`, { method: "GET" });
    if (!res.ok) throw new Error("Non-200 response");
    apiStatusDot.dataset.state = "online";
    apiStatusText.textContent = "backend online";
  } catch (err) {
    apiStatusDot.dataset.state = "offline";
    apiStatusText.textContent = "backend unreachable";
  }
}

// ============================================================
// Predict
// ============================================================
async function runScan() {
  hideError();

  const text = emailText.value.trim();
  if (!text) {
    showError("Paste some email text before running a scan.");
    emailText.focus();
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(PREDICT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (_) {
      // response had no JSON body
    }

    if (!response.ok) {
      const detail =
        (payload && (payload.detail || payload.message)) ||
        `Request failed with status ${response.status}.`;
      throw new Error(
        typeof detail === "string" ? detail : JSON.stringify(detail)
      );
    }

    renderResult(payload);
  } catch (err) {
    if (err instanceof TypeError) {
      // fetch network-level failure (server down, CORS, etc.)
      showError(
        `Couldn't reach the API at ${API_BASE_URL}. Make sure "uvicorn main:app --reload" is running.`
      );
    } else {
      showError(err.message || "Something went wrong while scanning.");
    }
  } finally {
    setLoading(false);
  }
}

// ============================================================
// Events
// ============================================================
emailText.addEventListener("input", updateCharCount);

clearBtn.addEventListener("click", () => {
  emailText.value = "";
  updateCharCount();
  hideError();
  emailText.focus();
});

sampleBtn.addEventListener("click", () => {
  emailText.value = SAMPLE_TEXT;
  updateCharCount();
  hideError();
});

scanBtn.addEventListener("click", runScan);

emailText.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    runScan();
  }
});

// ============================================================
// Init
// ============================================================
updateCharCount();
checkApiStatus();
