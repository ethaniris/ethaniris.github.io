import crypto from "crypto";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12;
const FIREBASE_DB_URL =
  process.env.FIREBASE_DB_URL ||
  "https://yaris-fc270-default-rtdb.asia-southeast1.firebasedatabase.app/";
const FIREBASE_SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.join(__dirname, "yaris-fc270-firebase-adminsdk-fbsvc-077b6fa9fd.json");
const FIREBASE_ADMIN_PATH = process.env.FIREBASE_ADMIN_PATH || "admin";
const DASHBOARD_SEED_USER = process.env.DASHBOARD_SEED_USER || "admin";
const DASHBOARD_SEED_PASS = process.env.DASHBOARD_SEED_PASS || "gryaris2026";

const sessions = new Map();
let firebaseDb = null;
let firebaseReady = false;
let firebaseInitError = "";

function readServiceAccount(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Firebase service account not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

async function ensureSeedAdmin() {
  const adminRef = firebaseDb.ref(FIREBASE_ADMIN_PATH);
  const snapshot = await adminRef.get();
  const existing = snapshot.val();

  if (
    snapshot.exists() &&
    existing &&
    typeof existing.username === "string" &&
    typeof existing.password === "string"
  ) {
    return;
  }

  await adminRef.set({
    username: DASHBOARD_SEED_USER,
    password: DASHBOARD_SEED_PASS,
    updatedAt: new Date().toISOString(),
  });
}

async function initializeFirebase() {
  try {
    const serviceAccount = readServiceAccount(FIREBASE_SERVICE_ACCOUNT_PATH);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: FIREBASE_DB_URL,
      });
    }
    firebaseDb = admin.database();
    await ensureSeedAdmin();
    firebaseReady = true;
    console.log(
      `Firebase connected: ${FIREBASE_DB_URL} (admin path: ${FIREBASE_ADMIN_PATH})`,
    );
  } catch (error) {
    firebaseInitError = error instanceof Error ? error.message : String(error);
    firebaseReady = false;
    console.error(`Firebase init failed: ${firebaseInitError}`);
  }
}

async function getDashboardAdminCredentials() {
  if (!firebaseReady || !firebaseDb) {
    throw new Error(firebaseInitError || "Firebase is not ready");
  }
  const snapshot = await firebaseDb.ref(FIREBASE_ADMIN_PATH).get();
  const payload = snapshot.val();
  if (
    !payload ||
    typeof payload.username !== "string" ||
    typeof payload.password !== "string"
  ) {
    throw new Error(`Invalid admin credential shape at ${FIREBASE_ADMIN_PATH}`);
  }
  return {
    username: payload.username.trim(),
    password: String(payload.password),
  };
}

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((acc, segment) => {
      const eqIndex = segment.indexOf("=");
      if (eqIndex < 0) return acc;
      const key = decodeURIComponent(segment.slice(0, eqIndex).trim());
      const value = decodeURIComponent(segment.slice(eqIndex + 1).trim());
      acc[key] = value;
      return acc;
    }, {});
}

function readAuthToken(req) {
  const authHeader = req.get("authorization") || "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  const cookies = parseCookies(req.get("cookie") || "");
  return cookies.dash_token || "";
}

function createSession(username) {
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  sessions.set(token, { username, expiresAt });
  return { token, expiresAt };
}

function getSession(req) {
  const token = readAuthToken(req);
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return { ...session, token };
}

function requireDashboardAuth(req, res, next) {
  const session = getSession(req);
  if (!session) {
    res.redirect("/dashboard");
    return;
  }
  req.dashboardSession = session;
  next();
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "backend", "dashboard-login.html"));
});

app.get("/dashboard/home", requireDashboardAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "backend", "dashboard-home.html"));
});

app.post("/api/dashboard/login", async (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  let adminCredentials;
  try {
    adminCredentials = await getDashboardAdminCredentials();
  } catch (error) {
    res.status(503).json({
      ok: false,
      message: "Firebase 連線中，請稍後再試。",
      detail: error instanceof Error ? error.message : String(error),
    });
    return;
  }

  if (
    username !== adminCredentials.username ||
    password !== adminCredentials.password
  ) {
    res.status(401).json({
      ok: false,
      message: "帳號或密碼錯誤，請再確認。",
    });
    return;
  }

  const session = createSession(username);
  res.cookie("dash_token", session.token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: TOKEN_TTL_MS,
    secure: false,
    path: "/",
  });
  res.json({
    ok: true,
    message: "登入成功",
    user: { username },
    expiresAt: session.expiresAt,
  });
});

app.get("/api/dashboard/session", (req, res) => {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ ok: false, message: "尚未登入" });
    return;
  }
  res.json({
    ok: true,
    user: { username: session.username },
    expiresAt: session.expiresAt,
  });
});

app.post("/api/dashboard/logout", (req, res) => {
  const token = readAuthToken(req);
  if (token) sessions.delete(token);
  res.clearCookie("dash_token", { path: "/" });
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Yaris server started on http://localhost:${PORT}`);
  initializeFirebase();
});
