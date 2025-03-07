import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

function ChatWindow({ chatId }) {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch chat messages
  useEffect(() => {
    if (!chatId) return;

    const messagesQuery = query(
      collection(db, "chats"),
      where("chatId", "==", chatId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [chatId]);

  // Send a new message
  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, "chats"), {
        chatId,
        sender: user.uid,
        message: newMessage,
        timestamp: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 ${
              msg.sender === user?.uid ? "text-right" : "text-left"
            }`}
          >
            <p
              className={`inline-block p-2 rounded-lg ${
                msg.sender === user?.uid
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
              }`}
            >
              {msg.message}
            </p>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;