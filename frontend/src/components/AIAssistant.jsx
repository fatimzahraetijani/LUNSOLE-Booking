import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Compass, MapPin, Star, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Marhaban! I am your LUNSOLE Virtual Concierge. I can scan our exclusive database to match your exact stays. Try asking me:\n\n"I want a luxury hotel in Rabat for 2 people under 1500 MAD."',
      accommodations: []
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query.trim();
    setQuery('');
    
    // Add user message
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: userText })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '_ai',
          sender: 'ai',
          text: data.message,
          accommodations: data.accommodations || []
        }]);
      } else {
        throw new Error(data.message || 'Unable to scan recommendations.');
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '_err',
        sender: 'ai',
        text: 'Apologies, my concierge link is experiencing issues. I can recommend browsing our listings page directly.',
        accommodations: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: 'var(--accent)',
          border: '1px solid var(--accent)',
          boxShadow: '0 8px 32px rgba(18,19,26,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 999,
          transition: 'transform 0.3s ease, background-color 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08) rotate(5deg)';
          e.currentTarget.style.backgroundColor = '#1e202b';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1.0) rotate(0deg)';
          e.currentTarget.style.backgroundColor = 'var(--primary)';
        }}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} className="sparkles-anim" />}
      </button>

      {/* Floating Chat Drawer Container */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '96px',
          right: '24px',
          width: '380px',
          height: '520px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 999,
          animation: 'slideUp 0.3s ease'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: 'var(--primary)',
            color: '#fff',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                color: 'var(--accent)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Sparkles size={16} />
              </div>
              <div>
                <strong style={{ color: '#fff', fontSize: '0.95rem', display: 'block' }}>LUNSOLE Concierge</strong>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Online AI Assistant</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flexGrow: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: '#faf9f6'
          }}>
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div 
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isAi ? 'flex-start' : 'flex-end',
                    maxWidth: '100%'
                  }}
                >
                  <div style={{
                    backgroundColor: isAi ? '#fff' : 'var(--primary)',
                    color: isAi ? 'var(--text-main)' : '#fff',
                    padding: '12px 16px',
                    borderRadius: isAi ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
                    border: isAi ? '1px solid var(--border-color)' : 'none',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-line',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}>
                    {msg.text}
                  </div>

                  {/* Recommendations */}
                  {isAi && msg.accommodations && msg.accommodations.length > 0 && (
                    <div style={{
                      marginTop: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      width: '100%'
                    }}>
                      {msg.accommodations.map((acc) => (
                        <div 
                          key={acc.id}
                          style={{
                            display: 'flex',
                            backgroundColor: '#fff',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <img 
                            src={acc.image_url} 
                            alt={acc.name} 
                            style={{ width: '80px', height: '80px', objectFit: 'cover' }} 
                          />
                          <div style={{ padding: '10px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <h5 style={{ fontSize: '0.85rem', margin: '0 0 2px 0', fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>
                                {acc.name}
                              </h5>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <MapPin size={10} />
                                <span>{acc.city}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                                ${Math.round(acc.min_price || acc.price || 120)}/n
                              </span>
                              <Link 
                                to={`/accommodations/${acc.id}`} 
                                onClick={() => setIsOpen(false)}
                                style={{
                                  fontSize: '0.75rem',
                                  textDecoration: 'none',
                                  color: 'var(--primary)',
                                  fontWeight: 'bold',
                                  borderBottom: '1px solid var(--primary)'
                                }}
                              >
                                View stay &rarr;
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ backgroundColor: '#fff', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: '12px 12px 12px 2px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Scanning stays...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input Area */}
          <form 
            onSubmit={handleSendMessage}
            style={{
              padding: '12px 16px',
              backgroundColor: '#fff',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input 
              type="text" 
              placeholder="Ask for a riad in Marrakech..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flexGrow: 1,
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.85rem',
                outline: 'none',
                backgroundColor: 'var(--bg-main)'
              }}
            />
            <button 
              type="submit"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--accent)',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes sparklesGlow {
          0% { transform: scale(1.0); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 4px var(--accent)); }
          100% { transform: scale(1.0); }
        }
        .sparkles-anim {
          animation: sparklesGlow 3s infinite ease-in-out;
        }
      `}</style>
    </>
  );
};
