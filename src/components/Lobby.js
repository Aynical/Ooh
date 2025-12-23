// src/components/Lobby.js
import React, { useState, useEffect, useRef } from "react";
import CheckIn from "./CheckIn";
import Characters from "./Characters";
import Navbar from "./Navbar";
import { supabase } from "../supabaseClient";
import Inventory from "./Inventory";
import Friends from "./Friends";
import GlobalChat from "./GlobalChat";

export default function Lobby({ user, setUser }) {
  const [usersMap, setUsersMap] = useState({}); // user_id → username
  const chatEndRef = useRef(null); // For auto-scroll in global chat

  // Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Fetch all users for friends and global chat
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("users").select("id, username");
      const map = {};
      data.forEach(u => (map[u.id] = u.username));
      setUsersMap(map);
    };
    fetchUsers();
  }, []);

  // Auto-scroll to bottom when chat updates
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      <Navbar logout={handleLogout} />
      <h1>Welcome to the Lobby, {user.email}</h1>
      <p>Your User ID: {user.id}</p>

      <CheckIn user={user} />
      <Characters user={user} />
      <Inventory user={user} />

      {/* Friends list with real-time updates */}
      <Friends user={user} />

      {/* Global Chat */}
      <div style={{ marginTop: "20px" }}>
        <GlobalChat user={user} usersMap={usersMap} />
        {/* Invisible div for auto-scroll */}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
