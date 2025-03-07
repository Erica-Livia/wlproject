import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

// Create a new chat session
export const createChatSession = async (guideId, userId, userName, guideName, firstMessage) => {
  try {
    // Generate a unique chatId
    const chatId = `${guideId}_${userId}_${Date.now()}`;

    // Create a new chat session
    await addDoc(collection(db, "chatSessions"), {
      chatId,
      guideId,
      userId,
      userName,
      guideName,
      lastMessage: firstMessage,
      lastMessageTimestamp: serverTimestamp(),
      status: "active",
    });

    // Add the first message to the chats collection
    await addDoc(collection(db, "chats"), {
      chatId,
      sender: "user",
      message: firstMessage,
      timestamp: serverTimestamp(),
    });

    console.log("Chat session created successfully!");
  } catch (error) {
    console.error("Error creating chat session:", error);
  }
};

// Close a chat session
export const closeChatSession = async (chatId) => {
  try {
    const chatSessionRef = doc(db, "chatSessions", chatId);
    await updateDoc(chatSessionRef, {
      status: "closed",
    });

    console.log("Chat session closed successfully!");
  } catch (error) {
    console.error("Error closing chat session:", error);
  }
};