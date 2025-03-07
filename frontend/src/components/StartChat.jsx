import React, { useState } from "react";
import { createChatSession } from "../chatSession";

function StartChat({ guideId, userId, userName, guideName }) {
  const [firstMessage, setFirstMessage] = useState("");

  const handleStartChat = async () => {
    await createChatSession(guideId, userId, userName, guideName, firstMessage);
    setFirstMessage("");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Start a New Chat</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={firstMessage}
          onChange={(e) => setFirstMessage(e.target.value)}
          className="w-full p-2 border rounded-lg"
          placeholder="Type your first message..."
        />
        <button
          onClick={handleStartChat}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Start Chat
        </button>
      </div>
    </div>
  );
}

export default StartChat;