const usernameNode = document.getElementById("dashboard-username");
const logoutButton = document.getElementById("logout-button");

async function loadSession() {
  try {
    const res = await fetch("/api/dashboard/session", {
      credentials: "include",
    });
    if (!res.ok) {
      window.location.href = "/dashboard";
      return;
    }
    const payload = await res.json();
    usernameNode.textContent = payload.user?.username || "admin";
  } catch (_error) {
    window.location.href = "/dashboard";
  }
}

logoutButton.addEventListener("click", async () => {
  try {
    await fetch("/api/dashboard/logout", {
      method: "POST",
      credentials: "include",
    });
  } finally {
    window.location.href = "/dashboard";
  }
});

loadSession();
