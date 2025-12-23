// src/App.js
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";
import Register from "./components/Register";
import Lobby from "./components/Lobby";
import ResetPassword from "./components/ResetPassword";

function App() {
  const [user, setUser] = useState(null);

  // Get session and listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => setUser(session?.user || null)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Ensure user exists in "users" table
  useEffect(() => {
    if (!user) return;

    const ensureUserRow = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!data) {
          const { error: insertError } = await supabase.from("users").insert({
            id: user.id,
            username: user.email ? user.email.split("@")[0] : "Anonymous"
          });
          if (insertError) console.error("Insert failed:", insertError);
        }
      } catch (err) {
        console.error("Unexpected error ensuring user row:", err);
      }
    };

    ensureUserRow();
  }, [user]);

  if (!user)
    return (
      <div>
        <Login setUser={setUser} />
        <hr />
        <Register setUser={setUser} />
        <hr />
        <ResetPassword />
      </div>
    );

  return <Lobby user={user} setUser={setUser} />;
}

export default App;
