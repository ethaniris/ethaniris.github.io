const form = document.getElementById("dashboard-login-form");
const statusLine = document.getElementById("login-status");
const submitButton = document.getElementById("login-submit");

function setStatus(text, type = "") {
  statusLine.textContent = text;
  statusLine.classList.remove("error", "success");
  if (type) statusLine.classList.add(type);
}

async function checkExistingSession() {
  try {
    const res = await fetch("/api/dashboard/session", {
      credentials: "include",
    });
    if (!res.ok) return;
    window.location.href = "/dashboard/home";
  } catch (_error) {
    // silent: session check failure should not block login UI
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("驗證中...");
  submitButton.disabled = true;

  const formData = new FormData(form);
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  try {
    const res = await fetch("/api/dashboard/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const payload = await res.json();
    if (!res.ok || !payload.ok) {
      setStatus(payload.message || "登入失敗，請稍後重試。", "error");
      return;
    }
    setStatus("登入成功，正在進入後台...", "success");
    window.setTimeout(() => {
      window.location.href = "/dashboard/home";
    }, 450);
  } catch (_error) {
    setStatus("連線異常，請稍後再試。", "error");
  } finally {
    submitButton.disabled = false;
  }
});

checkExistingSession();
