// src/components/Characters.js
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Characters({ user }) {
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    const fetchCharacters = async () => {
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id);
      if (error) console.error(error);
      else setCharacters(data);
    };
    fetchCharacters();
  }, [user]);

  return (
    <div>
      <h3>Your Characters</h3>
      {characters.length === 0 ? (
        <p>No characters yet.</p>
      ) : (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {characters.map((char) => (
            <div key={char.id} style={{ border: "1px solid gray", padding: "10px" }}>
              <img src={char.image || "https://via.placeholder.com/100"} alt={char.name} />
              <h4>{char.name}</h4>
              <p>Attack: {char.attack}</p>
              <p>Defense: {char.defense}</p>
              <p>Speed: {char.speed}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
