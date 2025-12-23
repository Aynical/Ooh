// src/components/Login.js
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMsg("Username and password are required.");
      return;
    }

    try {
      const email = `${username}@example.com`; // same trick as register
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setUser(data.user);
      setErrorMsg("");
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 16,
      }}
    >
      <div
        style={{
          width: 340,
          padding: 24,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          borderRadius: 8,
          background: "#fff",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 12 }}>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: 8, margin: "6px 0" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 8, margin: "6px 0" }}
        />
        <button
          onClick={handleLogin}
          style={{ width: "100%", padding: 10, marginTop: 8 }}
        >
          Login
        </button>
        {errorMsg && (
          <p style={{ color: "red", marginTop: 8 }}>{errorMsg}</p>
        )}
      </div>
    </div>
  );
}
