"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { Send, X, Sparkles } from "lucide-react";

export default function ChatWindow({ chatId, currentUserId, recipientName, onClose }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!chatId) return;

        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
            setTimeout(scrollToBottom, 100);
        });

        return () => unsubscribe();
    }, [chatId]);

    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            // Only fetch suggestions if the last message was from the OTHER person
            if (lastMessage.senderId !== currentUserId) {
                // Debounce a bit or check if we already have suggestions for this message?
                // For simplicity, just fetch.
                fetchSmartReplies();
            } else {
                setSuggestions([]);
            }
        }
    }, [messages, currentUserId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchSmartReplies = async () => {
        setIsLoadingSuggestions(true);
        try {
            const contextMessages = messages.slice(-5).map(m => ({
                text: m.text,
                senderId: m.senderId === currentUserId ? 'me' : 'other'
            }));

            const res = await fetch('/api/smart_reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: contextMessages }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.suggestions && Array.isArray(data.suggestions)) {
                    setSuggestions(data.suggestions);
                }
            }
        } catch (error) {
            console.error("Error fetching smart replies:", error);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim()) return;

        const messageToSend = newMessage;
        setNewMessage(""); // Clear immediately
        setSuggestions([]); // Clear suggestions

        try {
            await addDoc(collection(db, "chats", chatId, "messages"), {
                text: messageToSend,
                senderId: currentUserId,
                createdAt: serverTimestamp()
            });

            await updateDoc(doc(db, "chats", chatId), {
                lastMessage: messageToSend,
                lastMessageTime: serverTimestamp()
            });

        } catch (error) {
            console.error("Error sending message:", error);
            // Optionally restore message if failed
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setNewMessage(suggestion);
        // Optional: auto-send or just populate? Populating is safer.
    };

    return (
        <div className="flex flex-col h-[500px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-pink-600 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold">{recipientName}</h3>
                <button onClick={onClose} className="hover:bg-pink-700 p-1 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] px-4 py-2 rounded-xl ${isMe
                                ? "bg-pink-600 text-white rounded-br-none"
                                : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                                }`}>
                                <p className="text-sm">{msg.text}</p>
                                <span className={`text-[10px] block text-right mt-1 ${isMe ? "text-pink-200" : "text-gray-400"}`}>
                                    {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Smart Replies */}
            {suggestions.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 flex gap-2 overflow-x-auto no-scrollbar">
                    <div className="flex items-center text-pink-600 mr-1">
                        <Sparkles size={16} />
                    </div>
                    {suggestions.map((suggestion, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="whitespace-nowrap px-3 py-1 bg-white border border-pink-200 text-pink-700 rounded-full text-xs hover:bg-pink-50 transition-colors shadow-sm"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-pink-600 text-white p-2 rounded-full hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}
