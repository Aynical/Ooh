// src/components/GlobalChat.js
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

export default function GlobalChat({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [usersMap, setUsersMap] = useState({});
  const chatEndRef = useRef(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("users").select("id, username");
      const map = {};
      data.forEach(u => (map[u.id] = u.username));
      setUsersMap(map);
    };
    fetchUsers();
  }, []);

  // Fetch messages & subscribe to new ones
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("global_messages")
        .select("*")
        .order("created_at", { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();

    const setupSubscription = async () => {
      const channel = supabase.channel("realtime-global-messages");
      await channel
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "global_messages" },
          (payload) => setMessages(prev => [...prev, payload.new])
        )
        .subscribe();
    };
    setupSubscription();

    return () => supabase.removeAllChannels();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    await supabase.from("global_messages").insert([
      { sender_id: user.id, message: newMessage.trim() }
    ]);
    setNewMessage("");
  };

  return (
    <div>
      <h3>Global Chat</h3>
      <div style={{ border: "1px solid gray", padding: "10px", height: "200px", overflowY: "scroll" }}>
        {messages.map((m, i) => (
          <p key={i}><strong>{usersMap[m.sender_id] || "Unknown"}:</strong> {m.message}</p>
        ))}
        <div ref={chatEndRef} />
      </div>
      <input
        placeholder="Type a message"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}
