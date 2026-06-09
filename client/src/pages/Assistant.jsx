import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import API from '../api/auth';

export default function Assistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  const suggestions = [
    'How do I apply for a PPS number?',
    'What documents do I need for an IRP card?',
    'How do I register with Revenue for tax?',
    'Am I eligible for a medical card?',
    'How do I convert my driving licence?',
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/assistant/history');
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (question) => {
    const text = question || input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '...',
      isLoading: true
    }]);

    try {
      const res = await API.post('/assistant/chat', { question: text });
      setMessages(prev => [
        ...prev.filter(m => !m.isLoading),
        {
          role: 'assistant',
          content: res.data.answer,
          sources: res.data.sources,
        },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev.filter(m => !m.isLoading),
        {
          role: 'assistant',
          content: 'Sorry, I could not get an answer right now. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Fáilte 🇮🇪</h2>
          <p className="text-sm text-gray-500">Your Irish relocation assistant</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Back to Roadmap
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">

        {loadingHistory && (
          <div className="text-center text-sm text-gray-400">
            Loading conversation...
          </div>
        )}

        {!loadingHistory && messages.length === 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-emerald-50 rounded-2xl p-6 mb-6 text-center">
              <div className="text-3xl mb-2">🇮🇪</div>
              <h3 className="font-medium text-gray-800 mb-1">
                Céad Míle Fáilte!
              </h3>
              <p className="text-sm text-gray-500">
                I'm Fáilte, your Irish relocation assistant.
                I can answer questions about PPS numbers, IRP cards,
                tax, health services and more — all from official
                Irish government sources.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-400 text-center mb-3">Try asking:</p>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left text-sm px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-gray-600"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-lg">
                <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${msg.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-700'
                    }`}>
                    {msg.role === 'user' ? 'U' : 'F'}
                  </div>

                  {/* Message bubble */}
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-sm'
                      : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm'
                    }`}>
                    {msg.isLoading ? (
                      <div className="flex gap-1 items-center py-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : msg.role === 'assistant' ? (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                          li: ({ children }) => <li className="text-sm">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>

                {/* Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 ml-9">
                    <p className="text-xs text-gray-400 mb-1">Sources:</p>
                    {msg.sources.map((src, j) => (
                      <p key={j} className="text-xs text-emerald-600 truncate">
                        {src}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Fáilte anything about relocating to Ireland..."
            disabled={loading}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Fáilte — powered by official Irish government sources
        </p>
      </div>

    </div>
  );
}