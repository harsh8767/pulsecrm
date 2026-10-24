import { useState } from "react";

function AuthPage({ onLogin, onRegister }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegisterMode = mode === "register";

  function handleSwitchMode() {
    setMode(isRegisterMode ? "login" : "register");
    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        await onRegister(name, email, password);
      } else {
        await onLogin(email, password);
      }
    } catch (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12h4l3-8 4 16 3-8h4" />
            </svg>
          </span>
          <h2 className="sidebar-logo">PulseCRM</h2>
        </div>

        <h1 className="auth-title">
          {isRegisterMode ? "Create your account" : "Log in to PulseCRM"}
        </h1>
        <p className="auth-hint">
          {isRegisterMode
            ? "Every new account starts with four sample customers to explore."
            : "Welcome back. Enter your details to continue."}
        </p>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegisterMode && (
            <label>
              Name
              <input
                className="search-input"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
          )}

          <label>
            Email
            <input
              className="search-input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            Password
            <input
              className="search-input"
              type="password"
              autoComplete={isRegisterMode ? "new-password" : "current-password"}
              required
              minLength={isRegisterMode ? 8 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait..."
              : isRegisterMode
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegisterMode ? "Already have an account? " : "New here? "}
          <button className="link-button" type="button" onClick={handleSwitchMode}>
            {isRegisterMode ? "Log in" : "Create an account"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;