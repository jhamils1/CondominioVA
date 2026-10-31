// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from '../../auth/sessionContext.js';
import LoginForm from "./LoginForm";
import { useAuth } from "../../hooks/useAuth";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const { sessionNotice, setSessionNotice } = useSession();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSessionNotice('');
    const success = await login(username, password);  // login con tu hook
    if (success) {
      navigate("/admin/dashboard");
    }
  };

  return (
    <LoginForm
      username={username}
      password={password}
      setUsername={setUsername}
      setPassword={setPassword}
      onSubmit={handleSubmit}
      loading={loading}
      error={error || sessionNotice || ''}
    />
  );
};

export default LoginPage;
