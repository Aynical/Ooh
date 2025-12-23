// src/components/Navbar.js
import React from "react";
import { supabase } from "../supabaseClient"; // <-- import supabase if needed

export default function Navbar({ logout }) {
  return (
    <nav style={{ marginBottom: "20px" }}>
      <button onClick={logout}>Logout</button>
      {/* Later: Inventory, Friends, Shop buttons */}
    </nav>
  );
}
