import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import NavBar from "../components/NavBar";

function ChatPage({ theme, toggleTheme }) {
  const { guideId } = useParams(); // Get guideId from URL
  const navigate = useNavigate();
  const [user] = useAuthState(auth); // Get authenticated user
  const [messages, setMessages] = useState([]); // Store chat messages
  const [newMessage, setNewMessage] = useState(""); // Store new message input
  const [chattedGuides, setChattedGuides] = useState([]); // Store guides the user has chatted with
  const [selectedGuide, setSelectedGuide] = useState(null); // Store the currently selected guide

  // Fetch messages for the selected guide
  useEffect(() => {
    if (!guideId || !user?.uid) return;

    const messagesQuery = query(
      collection(db, "chats"),
      where("guideId", "==", guideId),
      where("userId", "==", user.uid), // Ensure messages belong to the current user
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const fetchedMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched Messages:", fetchedMessages); // Debugging
        setMessages(fetchedMessages);
      },
      (error) => {
        console.error("Error fetching messages:", error);
      }
    );

    return () => unsubscribe();
  }, [guideId, user]);

  // Fetch the list of guides the user has chatted with
  useEffect(() => {
    if (!user?.uid) return;

    const fetchChattedGuides = async () => {
      const chatsQuery = query(
        collection(db, "chats"),
        where("userId", "==", user.uid)
      );

      const unsubscribe = onSnapshot(
        chatsQuery,
        async (snapshot) => {
          const uniqueGuides = new Set();
          snapshot.docs.forEach((doc) => {
            uniqueGuides.add(doc.data().guideId);
          });

          const guidePromises = Array.from(uniqueGuides).map(async (id) => {
            const guideDoc = await getDoc(doc(db, "guides", id));
            if (guideDoc.exists()) {
              return {
                id: guideDoc.id,
                ...guideDoc.data(),
              };
            }
            return null;
          });

          const guides = await Promise.all(guidePromises);
          console.log("Fetched Chatted Guides:", guides); // Debugging
          setChattedGuides(guides.filter((guide) => guide !== null));
        },
        (error) => {
          console.error("Error fetching chatted guides:", error);
        }
      );

      return () => unsubscribe();
    };

    fetchChattedGuides();
  }, [user]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!user || !newMessage.trim() || !guideId) return;

    try {
      await addDoc(collection(db, "chats"), {
        guideId,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        message: newMessage,
        timestamp: serverTimestamp(),
      });

      setNewMessage(""); // Clear input after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle clicking on a guide in the list
  const handleSelectGuide = (id) => {
    navigate(`/chat/${id}`);
  };

  // Set the selected guide when guideId changes
  useEffect(() => {
    if (guideId) {
      const guide = chattedGuides.find((g) => g.id === guideId);
      setSelectedGuide(guide || null);
    } else {
      setSelectedGuide(null);
    }
  }, [guideId, chattedGuides]);

  return (
    <>
    <div className="h-screen">
      <NavBar theme={theme} toggleTheme={toggleTheme} />
      <div className="flex h-full bg-gray-100">
        {/* Left Side: List of Guides */}
        <div className="w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
          <h2 className="text-xl font-bold py-2 px-4 border-b border-gray-200">Chats</h2>
          <div>
            {chattedGuides.length > 0 ? (
              chattedGuides.map((guide) => (
                <div
                  key={guide.id}
                  onClick={() => handleSelectGuide(guide.id)}
                  className={`p-4 hover:bg-gray-100 cursor-pointer ${
                    guideId === guide.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <img
                      src={guide.profilePictureUrl || "https://via.placeholder.com/150"}
                      alt={guide.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-semibold">{guide.name}</p>
                      <p className="text-sm text-gray-500">{guide.category}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-gray-500">No chats found.</p>
            )}
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          {selectedGuide ? (
            <div className="px-2 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-bold">{selectedGuide.name}</h2>
              <p className="text-sm text-gray-500">{selectedGuide.category}</p>
            </div>
          ) : (
            <div className="p-4">
              <h2 className="text-xl font-bold"></h2>
            </div>
          )}

          {/* Chat Messages */}
          {selectedGuide && (
            <div className="flex-1 overflow-y-auto p-4 h-min">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-3 ${
                      msg.userId === user?.uid ? "text-right" : "text-left"
                    }`}
                  >
                    <p className="text-sm text-gray-400">{msg.userName}</p>
                    <p
                      className={`inline-block p-2 rounded-lg ${
                        msg.userId === user?.uid
                          ? "bg-khaki text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      {msg.message}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              )}
            </div>
          )}

          {/* Message Input */}
          {selectedGuide && (
            <div className="py-2 mr-2 border-t border-gray-200 bg-white">
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
                  className="bg-khaki text-white px-4 py-2 rounded-lg"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}

export default ChatPage;