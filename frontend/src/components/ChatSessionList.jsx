import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";

function ChatSessionList({ role }) {
  const [user] = useAuthState(auth);
  const [chatSessions, setChatSessions] = useState([]);
  const navigate = useNavigate();

  // Fetch chat sessions
  useEffect(() => {
    if (!user?.uid) return;

    const sessionsQuery = query(
      collection(db, "chatSessions"),
      where(role === "guide" ? "guideId" : "userId", "==", user.uid),
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      const sessions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChatSessions(sessions);
    });

    return () => unsubscribe();
  }, [user, role]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Active Chats</h2>
      {chatSessions.length > 0 ? (
        chatSessions.map((session) => (
          <div
            key={session.id}
            onClick={() => navigate(`/chat/${session.id}`)}
            className="p-4 hover:bg-gray-100 cursor-pointer"
          >
            <p className="font-semibold">
              {role === "guide" ? session.userName : session.guideName}
            </p>
            <p className="text-sm text-gray-500">{session.lastMessage}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No active chats.</p>
      )}
    </div>
  );
}

export default ChatSessionList;