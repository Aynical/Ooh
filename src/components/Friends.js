// src/components/Friends.js
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Friends({ user }) {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [usernameToAdd, setUsernameToAdd] = useState("");
  const [usersMap, setUsersMap] = useState({});
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]); // Autocomplete suggestions

  // Fetch all users for username lookup
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("users").select("id, username");
      const map = {};
      data.forEach(u => (map[u.id] = u.username));
      setUsersMap(map);
    };
    fetchUsers();
  }, []);

  // Fetch friends and pending requests
  const fetchFriends = async () => {
    const { data } = await supabase
      .from("friends")
      .select("*")
      .or(
        `and(user_id.eq.${user.id},status.eq.accepted),and(friend_id.eq.${user.id},status.eq.accepted)`
      );
    setFriends(data || []);
  };

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("friends")
      .select("*")
      .eq("friend_id", user.id)
      .eq("status", "pending");
    setRequests(data || []);
  };

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, [user]);

  // Realtime: friend requests and updates
  useEffect(() => {
    const subscription = supabase
      .channel("public:friends")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friends",
          filter: `friend_id.eq.${user.id}`
        },
        payload => {
          const senderName = usersMap[payload.new.user_id] || payload.new.user_id;
          alert(`New friend request from ${senderName}`);
          setRequests(prev => [...prev, payload.new]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "friends",
          filter: `or(user_id.eq.${user.id},friend_id.eq.${user.id})`
        },
        payload => {
          fetchFriends();
          fetchRequests();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [user, usersMap]);

  // Autocomplete: update filtered users based on input
  useEffect(() => {
    if (!usernameToAdd) {
      setFilteredUsers([]);
      return;
    }
    const matches = Object.values(usersMap)
      .filter(name => name.toLowerCase().includes(usernameToAdd.toLowerCase()))
      .slice(0, 5);
    setFilteredUsers(matches);
  }, [usernameToAdd, usersMap]);

  // Send friend request
  const handleSendRequest = async () => {
    if (!usernameToAdd) return;
    const { data: userToAdd } = await supabase
      .from("users")
      .select("id")
      .eq("username", usernameToAdd)
      .single();

    if (!userToAdd) return alert("User not found");
    if (userToAdd.id === user.id) return alert("You cannot add yourself");

    await supabase.from("friends").insert([
      { user_id: user.id, friend_id: userToAdd.id, status: "pending" }
    ]);
    setUsernameToAdd("");
    setFilteredUsers([]);
    alert("Friend request sent!");
  };

  // Accept friend request
  const handleAcceptRequest = async requestId => {
    await supabase.from("friends").update({ status: "accepted" }).eq("id", requestId);
    fetchFriends();
    fetchRequests();
  };

  // Chat messages
  useEffect(() => {
    if (!selectedFriend) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${selectedFriend})` +
            `,and(sender_id.eq.${selectedFriend},recipient_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();

    const subscription = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`
        },
        payload => {
          const m = payload.new;
          if (m.sender_id === selectedFriend || m.recipient_id === selectedFriend) {
            setMessages(prev => [...prev, m]);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [selectedFriend, user.id]);

  const handleSendMessage = async () => {
    if (!newMessage || !selectedFriend) return;
    await supabase.from("messages").insert([
      { sender_id: user.id, recipient_id: selectedFriend, message: newMessage }
    ]);
    setNewMessage("");
  };

  return (
    <div>
      <h3>Friends</h3>
      <div style={{ position: "relative" }}>
        <input
          placeholder="Username to add"
          value={usernameToAdd}
          onChange={e => setUsernameToAdd(e.target.value)}
        />
        <button onClick={handleSendRequest}>Send Friend Request</button>

        {filteredUsers.length > 0 && (
          <ul
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              border: "1px solid gray",
              backgroundColor: "white",
              zIndex: 10,
              listStyle: "none",
              margin: 0,
              padding: "5px 0",
              maxHeight: "150px",
              overflowY: "auto"
            }}
          >
            {filteredUsers.map(name => (
              <li
                key={name}
                style={{ padding: "5px", cursor: "pointer" }}
                onClick={() => {
                  setUsernameToAdd(name);
                  setFilteredUsers([]);
                }}
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <h4>Pending Friend Requests</h4>
      <ul>
        {requests.map(r => {
          const senderName = usersMap[r.user_id] || r.user_id;
          return (
            <li key={r.id}>
              {senderName}
              <button onClick={() => handleAcceptRequest(r.id)}>Accept</button>
            </li>
          );
        })}
      </ul>

      <h4>Friends List</h4>
      <ul>
        {friends.map(f => {
          const friendId = f.user_id === user.id ? f.friend_id : f.user_id;
          return (
            <li key={friendId}>
              {usersMap[friendId]}
              <button onClick={() => setSelectedFriend(friendId)}>Chat</button>
            </li>
          );
        })}
      </ul>

      {selectedFriend && (
        <div>
          <h4>Chat with {usersMap[selectedFriend]}</h4>
          <div
            style={{
              border: "1px solid gray",
              padding: "10px",
              height: "200px",
              overflowY: "scroll"
            }}
          >
            {messages.map((m, i) => (
              <p
                key={i}
                style={{ textAlign: m.sender_id === user.id ? "right" : "left" }}
              >
                {m.message}
              </p>
            ))}
          </div>
          <input
            placeholder="Type a message"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}
