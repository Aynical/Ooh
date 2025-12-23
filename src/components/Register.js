// src/components/Register.js
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Register({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async () => {
    if (!username || !password) {
      setErrorMsg("Username and password are required.");
      return;
    }

    try {
      // Supabase requires an email, so we fake one using username
      const email = `${username}@example.com`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // Insert username into 'users' table
      const { error: insertError } = await supabase
        .from("users")
        .insert([{ username }]);

      if (insertError) {
        setErrorMsg(insertError.message);
        return;
      }

      setUser(data.user);
      setErrorMsg("");
      alert("Registered successfully!");
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
    </div>
  );
}
