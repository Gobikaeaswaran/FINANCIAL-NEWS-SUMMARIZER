import React, { useState } from 'react';
import { 
  TrendingUp, 
  Search, 
  FileText, 
  Link as LinkIcon, 
  ChevronRight, 
  Cpu, 
  Database,
  Terminal,
  AlertCircle
} from 'lucide-react';
import './index.css';

const API_BASE = "http://localhost:8001";

function App() {
  const [inputMode, setInputMode] = useState('text'); // 'text' | 'url'
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [summary, setSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const handleSummarize = async () => {
    setIsLoading(true);
    setError('');
    setSummary([]);
    
    try {
      const payload = inputMode === 'text' 
        ? { text: inputText, num_sentences: 4 }
        : { url: inputUrl, num_sentences: 4 };

      const response = await fetch(`${API_BASE}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
      setStats({
        original: data.original_length,
        points: data.summary_points
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header Section */}
      <header style={{ marginBottom: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#00E676', fontWeight: 'bold', marginBottom: '0.5rem' }}>
             <TrendingUp size={24} />
             <span>ALPHA SIGNAL v2.0</span>
          </div>
          <h1>Financial Intelligence <br/> Summarizer</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
             High-density extractive summarization using FinBERT. Replicating the core "Alpha" signal extraction for modern financial analysts.
          </p>
        </div>
        
        <div className="glass-pane" style={{ padding: '1.5rem', display: 'flex', gap: '2rem' }}>
           <div>
             <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>MODEL</div>
             <div style={{ fontWeight: 'bold' }}>FinBERT-v2</div>
           </div>
           <div>
             <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>STATUS</div>
             <div style={{ fontWeight: 'bold', color: '#00E676' }}>ONLINE</div>
           </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="main-grid">
        
        {/* Left Column: Input */}
        <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
             <button 
               className={inputMode === 'text' ? 'active-mode' : 'inactive-mode'} 
               onClick={() => setInputMode('text')}
               style={{ background: inputMode === 'text' ? 'var(--accent-primary)' : 'transparent', color: inputMode === 'text' ? 'black' : 'white' }}
             >
               <FileText size={18} /> Text
             </button>
             <button 
               className={inputMode === 'url' ? 'active-mode' : 'inactive-mode'} 
               onClick={() => setInputMode('url')}
               style={{ background: inputMode === 'url' ? 'var(--accent-primary)' : 'transparent', color: inputMode === 'url' ? 'black' : 'white' }}
             >
               <Search size={18} /> URL
             </button>
          </div>

          <div style={{ flex: 1 }}>
            {inputMode === 'text' ? (
              <textarea 
                placeholder="Paste financial transcript, SEC filings, or news text here..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{ height: '300px', resize: 'none' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                   <LinkIcon size={18} style={{ position: 'absolute', left: '1rem', top: '1.1rem', color: 'var(--text-secondary)' }} />
                   <input 
                     type="url" 
                     placeholder="https://www.reuters.com/business/..." 
                     value={inputUrl}
                     onChange={(e) => setInputUrl(e.target.value)}
                     style={{ paddingLeft: '3rem' }}
                   />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '1rem', background: 'rgba(255,179,0,0.05)', borderRadius: '8px', borderLeft: '3px solid var(--accent-amber)' }}>
                   Supports Reuters, Bloomberg, and CNBC URLs for automatic content extraction.
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleSummarize} 
            disabled={isLoading || (inputMode === 'text' && !inputText) || (inputMode === 'url' && !inputUrl)}
            style={{ width: '100%', justifyContent: 'center', height: '3.5rem' }}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div> 
                SCRENNING SIGNAL...
              </>
            ) : (
              <>
                PROCESS ANALYTICS <ChevronRight size={18} />
              </>
            )}
          </button>
          
          {error && (
            <div style={{ color: '#FF5252', padding: '1rem', borderRadius: '8px', background: 'rgba(255,82,82,0.1)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}
        </section>

        {/* Right Column: Output */}
        <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', minHeight: '400px' }}>
          
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Executive Briefing</h3>
            {stats && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                 <div className="glass-pane" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                    {stats.points} POINTS EXTRACTED
                 </div>
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            {!summary.length && !isLoading && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
                <Terminal size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>Awaiting Financial Input...<br/>Ready for Signal Extraction.</p>
              </div>
            )}

            {isLoading && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[1,2,3,4].map(i => (
                  <div key={i} className="skeleton-line" style={{ width: i % 2 === 0 ? '90%' : '100%' }}></div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {summary.map((sent, idx) => (
                <div key={idx} className="summary-p" style={{ borderLeft: '2px solid var(--accent-primary)', paddingLeft: '1.5rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-10px', top: '0', background: 'var(--bg-color)', padding: '2px', color: 'var(--accent-primary)' }}>
                    <div style={{ border: '1px solid var(--accent-primary)', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {idx + 1}
                    </div>
                  </div>
                  <p style={{ lineHeight: '1.6', fontSize: '1.05rem', color: '#fff' }}>
                    {highlightFinancialTerms(sent)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '2rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
               <Database size={14} /> Reuters-21578 Engine
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
               <Cpu size={14} /> MMR Redundancy Filter
             </div>
          </div>

        </section>
      </div>
      
      <footer style={{ marginTop: '6rem', padding: '2rem 0', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
         &copy; 2026 ALPHA SIGNAL - Pro-Grade Financial Intelligence Systems
      </footer>

      {/* Embedded CSS for specific elements */}
      <style>{`
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(0,0,0,0.1);
          border-top: 2px solid #000;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .skeleton-line {
          height: 1.2rem;
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 200% 100%;
          border-radius: 4px;
          animation: loading 1.5s infinite;
        }
        @keyframes loading { from { background-position: 200% 0; } to { background-position: -200% 0; } }

        .summary-p {
          animation: slideUp 0.5s ease-out forwards;
          opacity: 0;
        }
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Utility to wrap tickers and monetary values in styled spans
function highlightFinancialTerms(text) {
  const tickerRegex = /(\$[A-Z]+)/g;
  const monetaryRegex = /(\$?\d+(?:\.\d+)?\s*(?:billion|million|trillion|m|b|k)?)/gi;
  
  const parts = text.split(/(?<=\$)|\s+/); // Simple split, could be improved
  
  // For simplicity in this demo, we'll return the text but in a production app 
  // you would use a more robust regex-based react-string-replace
  return text.split(/(\$[A-Z]+|\$?\d+(?:\.\d+)?\s*(?:billion|million|trillion|m|b|k)?)/gi).map((part, i) => {
    if (part.match(/^\$[A-Z]+$/)) {
      return <span key={i} className="ticker">{part}</span>;
    }
    if (part.match(/^\$?\d/)) {
        return <span key={i} style={{ color: 'var(--accent-amber)', fontWeight: '600' }}>{part}</span>;
    }
    return part;
  });
}

export default App;
