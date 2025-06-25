import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Chat = () => {
  const { email: receiverEmail } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  const myEmail = localStorage.getItem("email");

  useEffect(() => {
    if (!receiverEmail || !myEmail) return;

    axios.get(`http://localhost:8080/api/chat/messages/${myEmail}/${receiverEmail}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error(err));
  }, [receiverEmail, myEmail]); // ✅ included myEmail to fix the warning

  const sendMessage = () => {
    if (!newMsg.trim()) return;

    axios.post("http://localhost:8080/api/chat/send", {
      senderEmail: myEmail,
      receiverEmail,
      message: newMsg,
    }).then(res => {
      setMessages(prev => [...prev, res.data]);
      setNewMsg("");
    });
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar (optional or can be replaced later) */}
      <div className="w-1/4 bg-gray-800 p-4">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        <p className="text-gray-400">Start chatting using the Message button on a user's profile.</p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-gray-800">Chat with {receiverEmail}</div>

        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`mb-2 flex ${msg.senderEmail === myEmail ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-lg max-w-md ${msg.senderEmail === myEmail ? 'bg-blue-600' : 'bg-gray-700'}`}>
                {msg.message}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gray-800 flex">
          <input
            className="flex-1 bg-gray-700 text-white p-2 rounded-l"
            placeholder="Type your message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
          />
          <button onClick={sendMessage} className="bg-blue-600 px-4 py-2 rounded-r">Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
