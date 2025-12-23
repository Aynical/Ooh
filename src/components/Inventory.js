// src/components/Inventory.js
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Inventory({ user }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("user_id", user.id);
      if (error) console.error(error);
      else setItems(data);
    };
    fetchItems();
  }, [user]);

  return (
    <div>
      <h3>Your Inventory</h3>
      {items.length === 0 ? (
        <p>No items yet.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.item_name} x {item.quantity}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
