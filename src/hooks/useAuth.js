import { useState, useEffect } from "react";

async function sendAuthRequest(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong. Is the API running?");
  }

  return data;
}

function useAuth() {
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          setUser(await response.json());
        }
      } catch {
        // API unreachable: treat the visitor as logged out
      } finally {
        setIsCheckingSession(false);
      }
    }

    checkSession();
  }, []);

  async function login(email, password) {
    setUser(await sendAuthRequest("/api/auth/login", { email, password }));
  }

  async function register(name, email, password) {
    setUser(await sendAuthRequest("/api/auth/register", { name, email, password }));
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  return { user, isCheckingSession, login, register, logout };
}

export default useAuth;