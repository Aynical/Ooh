// src/components/CheckIn.js
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function CheckIn({ user }) {
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase
        .from("users")
        .select("last_checkin")
        .eq("id", user.id)
        .single();
      setLastCheckIn(data?.last_checkin);
    };
    fetchUser();
  }, [user]);

  const handleCheckIn = async () => {
    const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
    const lastDate = lastCheckIn?.split("T")[0];

    if (lastDate === today) {
      setMessage("You already checked in today!");
      return;
    }

    // Example reward: +100 currency
    await supabase
      .from("users")
      .update({ last_checkin: new Date(), currency: supabase.raw("currency + 100") })
      .eq("id", user.id);

    setLastCheckIn(new Date());
    setMessage("Checked in! You received 100 currency.");
  };

  return (
    <div>
      <h3>Daily Check-In</h3>
      <button onClick={handleCheckIn}>Check In</button>
      {message && <p>{message}</p>}
      {lastCheckIn && <p>Last Check-In: {new Date(lastCheckIn).toLocaleString()}</p>}
    </div>
  );
}
