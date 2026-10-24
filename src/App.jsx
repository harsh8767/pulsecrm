import useAuth from "./hooks/useAuth";
import AuthPage from "./pages/AuthPage";
import Workspace from "./Workspace";

function App() {
  const { user, isCheckingSession, login, register, logout } = useAuth();

  if (isCheckingSession) {
    return <p className="session-loading">Loading...</p>;
  }

  if (!user) {
    return <AuthPage onLogin={login} onRegister={register} />;
  }

  return <Workspace user={user} onLogout={logout} />;
}

export default App;