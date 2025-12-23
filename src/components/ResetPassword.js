// src/components/ResetPassword.js
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function ResetPassword() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    if (!username) {
      setMessage("Please enter your username.");
      return;
    }

    const email = `${username}@example.com`; // same as login/register
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin // user clicks link and returns to this page
    });

    if (error) setMessage(error.message);
    else setMessage("Password reset email sent! Check your inbox.");
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <button onClick={handleReset}>Send Reset Email</button>
      {message && <p>{message}</p>}
    </div>
  );
}
