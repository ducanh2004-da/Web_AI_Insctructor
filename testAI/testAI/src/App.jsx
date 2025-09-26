import { useState, useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const GRAPHQL_ENDPOINT = "http://localhost:10000/graphql";

function App() {
  const [messages, setMessages] = useState([]); // {id, role, text}
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [file, setFile] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [statusText, setStatusText] = useState("");
    const controllerRef = useRef({ cancelled: false });
    const playRef = useRef(false);
    const messagesRef = useRef(messages);
    messagesRef.current = messages;
  
    // helper: convert File -> base64
    function fileToBase64(file) {
      return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          // data:[<mediatype>][;base64],<data>
          const base64 = dataUrl.split(",")[1];
          resolve(base64);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    }
  
    // Parse SSE-like returned string and extract ordered events
    function parseSSEAggregated(aggStr) {
      // Each event is separated by double newline. Lines that start with "data:" contain JSON
      const rawEvents = aggStr.split(/\n\n+/).map(s => s.trim()).filter(Boolean);
      const events = [];
      for (const ev of rawEvents) {
        // find lines starting with "data:"
        const lines = ev.split(/\n/).map(l => l.replace(/^data:\s?/, "").trim()).filter(Boolean);
        // join in case event spanned multiple data lines
        const joined = lines.join('\n');
        // some events may be plain tokens like "done"
        try {
          const obj = JSON.parse(joined);
          events.push(obj);
        } catch (err) {
          // if not JSON, push raw
          events.push({ type: 'raw', raw: joined });
        }
      }
      return events;
    }
  
    // take an array of chunk events and animate char-by-char
    async function playChunksSequentially(chunkEvents, { charDelay = 18, betweenChunksDelay = 120 } = {}) {
      controllerRef.current.cancelled = false;
      setIsStreaming(true);
      playRef.current = true;
  
      // add an empty assistant message to append to
      const messageId = Date.now() + Math.random();
      setMessages(prev => [...prev, { id: messageId, role: 'assistant', text: '' }]);
  
      for (const evt of chunkEvents) {
        if (controllerRef.current.cancelled) break;
        if (evt.type === 'chunk' && evt.response) {
          const text = evt.response;
          // append each character
          for (let i = 0; i < text.length; i++) {
            if (controllerRef.current.cancelled) break;
            const char = text[i];
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: m.text + char } : m));
            // small delay per char
            // eslint-disable-next-line no-await-in-loop
            await new Promise(res => setTimeout(res, charDelay));
          }
          // small pause between chunk segments
          // eslint-disable-next-line no-await-in-loop
          await new Promise(res => setTimeout(res, betweenChunksDelay));
        } else if (evt.type === 'status') {
          setStatusText(`agent: ${evt.agent || 'unknown'} | status`);
        } else if (evt.type === 'done' || evt.type === 'end') {
          break;
        }
      }
  
      setIsStreaming(false);
      playRef.current = false;
      setStatusText('');
    }
  
    // Sends GraphQL mutation and processes returned aggregated stream text
    async function handleSend(e) {
      e && e.preventDefault();
      if (!input && !file) return;
      controllerRef.current.cancelled = false;
      setStatusText('sending...');
  
      const fileBase64 = await fileToBase64(file);
      const filename = file ? file.name : null;
  
      // Add user message locally
      setMessages(prev => [...prev, { id: Date.now() + Math.random(), role: 'user', text: input }]);
      setInput("");
  
      const query = `mutation CreateMessage($data: CreateMessageInput!) {\n  createMessage(data: $data) {\n    type\n    message\n    response\n    agent\n  }\n}`;
  
      const variables = {
        data: {
          message: input || null,
          sessionId: sessionId || null,
          fileBase64: fileBase64 || null,
          filename: filename || null,
        },
      };
  
      try {
        const res = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, variables }),
        });
  
        const json = await res.json();
        if (json.errors) {
          console.error('GraphQL errors', json.errors);
          setStatusText('Error from server. See console.');
          return;
        }
  
        const payload = json.data?.createMessage;
        if (!payload) {
          setStatusText('No payload returned');
          return;
        }
  
        // payload.response contains the SSE-like aggregated string
        const agg = payload.response || '';
        const events = parseSSEAggregated(agg);
  
        // Filter for chunk events in original order
        const chunkEvents = events.filter(e => e && (e.type === 'chunk' || e.type === 'status' || e.type === 'done' || e.type === 'end'));
  
        // Play them sequentially
        await playChunksSequentially(chunkEvents, { charDelay: 14, betweenChunksDelay: 90 });
  
        setStatusText('done');
      } catch (err) {
        console.error(err);
        setStatusText('Network / unexpected error');
      }
    }
  
    function handleStop() {
      controllerRef.current.cancelled = true;
      setIsStreaming(false);
      setStatusText('stopped');
    }
  
    function handleClear() {
      setMessages([]);
      setStatusText('');
    }
  
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white shadow-md rounded-2xl overflow-hidden border">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">AI Chatbot</h3>
            <div className="text-sm text-slate-500">{isStreaming ? 'Streaming...' : statusText || 'idle'}</div>
          </div>
  
          <div className="p-4 h-96 overflow-y-auto bg-slate-50" id="chat-window">
            {messages.map((m) => (
              <div key={m.id} className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${m.role === 'user' ? 'bg-blue-500 text-white rounded-2xl rounded-br-none px-4 py-2' : 'bg-white border rounded-2xl rounded-bl-none px-4 py-2 shadow-sm'}`}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                </div>
              </div>
            ))}
          </div>
  
          <form onSubmit={handleSend} className="p-4 border-t bg-white flex gap-2 items-end">
            <div className="flex-1">
              <textarea
                placeholder="Viết câu hỏi..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                className="w-full resize-none border rounded-md p-2"
              />
              <div className="flex gap-2 mt-2 items-center text-sm">
                <input
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="sessionId (tuỳ chọn)"
                  className="border rounded px-2 py-1"
                />
  
                <label className="flex items-center gap-2 text-xs">
                  <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
  
            <div className="flex flex-col gap-2">
              {!isStreaming ? (
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:opacity-90">Gửi</button>
              ) : (
                <button type="button" onClick={handleStop} className="bg-red-500 text-white px-4 py-2 rounded">Dừng</button>
              )}
  
              <button type="button" onClick={handleClear} className="border px-3 py-2 rounded">Xoá</button>
            </div>
          </form>
        </div>
  
        <div className="text-xs text-slate-500 mt-2">
          <div>Ghi chú:</div>
          <ul className="list-disc list-inside">
            <li>Đổi GRAPHQL_ENDPOINT biến ở đầu file thành URL GraphQL server của bạn (ví dụ: http://localhost:3000/graphql).</li>
            <li>Nếu server của bạn trả lỗi CORS, cần cấu hình server hoặc chạy frontend qua proxy.</li>
            <li>Component này giả định backend đã gom toàn bộ SSE stream thành một string (như ví dụ bạn gửi). Nó sẽ parse các dòng bắt đầu bằng "data:" và lấy các object JSON bên trong.</li>
          </ul>
        </div>
      </div>
    );
}

export default App
