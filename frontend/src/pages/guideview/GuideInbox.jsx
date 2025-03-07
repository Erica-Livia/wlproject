import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { Link } from "react-router-dom";
import GuideNav from "../../components/GuideNav";

function GuideInbox() {
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch chat sessions for the current guide
  useEffect(() => {
    const fetchChatSessions = async () => {
      const guideId = auth.currentUser?.uid; // Get the current guide's ID
      if (!guideId) return;

      try {
        const chatSessionsQuery = query(
          collection(db, "chatSessions"),
          where("guideId", "==", guideId)
        );
        const chatSessionsSnapshot = await getDocs(chatSessionsQuery);
        const fetchedChatSessions = chatSessionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChatSessions(fetchedChatSessions);
      } catch (error) {
        console.error("Error fetching chat sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatSessions();
  }, []);

  if (loading) {
    return <p className="text-center p-6">Loading messages...</p>;
  }

  return (
    <>
    <div className="flex flex-row bg-white">
        {/* Guide Navigation (Left Side) */}
        <div className="w-2/4">
          <GuideNav />
        </div>
        <div className="flex flex-row bg-white w-full mx-10">
            {/* <h1 className="text-3xl font-bold mb-8">Your Inbox</h1> */}
      {chatSessions.length === 0 ? (
        <p className="text-gray-500">No messages yet.</p>
      ) : (
        <div className="space-y-6 w-2/5">
          {chatSessions.map((session) => (
            <Link
              key={session.id}
              to={`/chat/${session.id}`}
              className="block bg-white p-6 rounded-lg shadow-md hover:bg-gray-50 transition"
            >
              <h2 className="text-xl font-semibold">{session.userName}</h2>
              <p className="text-gray-600">{session.lastMessage}</p>
              <p className="text-sm text-gray-500 mt-4">
                Last message: {new Date(session.lastMessageTimestamp?.toDate()).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}
        </div>
      
    </div>
    
    </>
  );
}

export default GuideInbox;