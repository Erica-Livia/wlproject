import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// Send a message
export const sendMessage = async (chatId, sender, message) => {
  try {
    // Add the message to the chats collection
    await addDoc(collection(db, "chats"), {
      chatId,
      sender,
      message,
      timestamp: serverTimestamp(),
    });

    // Update the last message in the chat session
    const chatSessionRef = doc(db, "chatSessions", chatId);
    await updateDoc(chatSessionRef, {
      lastMessage: message,
      lastMessageTimestamp: serverTimestamp(),
    });

    console.log("Message sent successfully!");
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

// Fetch chat history
export const fetchChatHistory = (chatId, setMessages) => {
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

  return unsubscribe; // Return the unsubscribe function to clean up the listener
};