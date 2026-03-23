import React, { useState, useCallback } from 'react';
import './standee.css';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   NAV WHEEL – Radial category navigation (standee only)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const CATEGORIES = [
  { icon: '🗺️', name: 'Explore Majors',     desc: 'Degrees & programs' },
  { icon: '📋', name: 'Admission Req.',     desc: 'Eligibility criteria' },
  { icon: '💬', name: 'Counseling',          desc: 'Expert support' },
  { icon: '📚', name: 'Courses',             desc: 'All programs' },
  { icon: '🏠', name: 'Hostel',              desc: 'Campus facilities' },
  { icon: '💼', name: 'Placements',          desc: 'Career records' },
];

const NODE_COUNT = CATEGORIES.length;
const WHEEL_RADIUS = 190;
const WHEEL_CENTER = 240; // CX and CY  (half of 480px disc)

function NavWheel({ onCategorySelect }) {
  const [rotation, setRotation] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);

  const selectCat = useCallback((idx) => {
    setActiveIdx(idx);
    // Fire the message immediately when a category is tapped
    if (onCategorySelect) onCategorySelect(CATEGORIES[idx].name);
  }, [onCategorySelect]);

  const rotateWheel = useCallback((dir) => {
    const step = 360 / NODE_COUNT;
    setRotation(prev => prev - dir * step);
    setTimeout(() => {
      setActiveIdx(prev => {
        const next = (((prev + dir) % NODE_COUNT) + NODE_COUNT) % NODE_COUNT;
        return next;
      });
    }, 280);
  }, []);

  // Calculate node positions
  const nodes = CATEGORIES.map((cat, i) => {
    const deg = (i / NODE_COUNT) * 360 - 90;
    const rad = (deg * Math.PI) / 180;
    const x = WHEEL_CENTER + WHEEL_RADIUS * Math.cos(rad) - 40;
    const y = WHEEL_CENTER + WHEEL_RADIUS * Math.sin(rad) - 40;
    return { ...cat, x, y, index: i };
  });

  return (
    <div className="standee-wheel-host">
      <div
        className="standee-wheel-disc"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="standee-wheel-ring" />

        {nodes.map((node) => (
          <div
            key={node.index}
            className={`standee-wn ${node.index === activeIdx ? 'standee-wn-active' : ''}`}
            style={{ left: `${node.x}px`, top: `${node.y}px` }}
            onClick={() => selectCat(node.index)}
          >
            <div
              className="standee-wn-inner"
              style={{ transform: `rotate(${-rotation}deg)` }}
            >
              <span className="standee-wn-icon">{node.icon}</span>
              <span className="standee-wn-lbl">
                {node.name.split(' ').slice(0, 2).join(' ')}
              </span>
            </div>
          </div>
        ))}

        {/* Center hub with up/down arrows */}
        <div className="standee-wheel-hub">
          <button
            className="standee-hub-arrow"
            onClick={(e) => { e.stopPropagation(); rotateWheel(-1); }}
            title="Previous"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button
            className="standee-hub-arrow"
            onClick={(e) => { e.stopPropagation(); rotateWheel(1); }}
            title="Next"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Active category label strip */}
      <div className="standee-wlabel-strip">
        <div className="standee-wls-name">{CATEGORIES[activeIdx].name}</div>
        <div className="standee-wls-desc">{CATEGORIES[activeIdx].desc}</div>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STANDEE LANGUAGE BADGE – Floating pill top-right
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', short: 'EN', native: 'English', tag: 'DEFAULT' },
  { code: 'ta', flag: '🇮🇳', short: 'TA', native: 'தமிழ்', tag: 'REGIONAL' },
  { code: 'hi', flag: '🇮🇳', short: 'HI', native: 'हिन्दी', tag: 'NATIONAL' },
];

function StandeeLangBadge({ language, onLanguageChange, variant = 'floating' }) {
  const [open, setOpen] = useState(false);
  const selected = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const toggle = useCallback(() => setOpen(v => !v), []);

  const select = useCallback((lang) => {
    onLanguageChange(lang.code);
    setTimeout(() => setOpen(false), 180);
  }, [onLanguageChange]);

  return (
    <div className={`standee-lang-badge ${variant === 'inline' ? 'standee-lang-badge-inline' : ''}`}>
      <button
        className={`standee-lb-pill ${open ? 'standee-lb-open' : ''}`}
        onClick={toggle}
        type="button"
      >
        <span className="standee-lbp-flag">{selected.flag}</span>
        <span className="standee-lbp-text">
          <span className="standee-lbp-name">{selected.short}</span>
          <span className="standee-lbp-nat">{selected.native}</span>
        </span>
        <svg className="standee-lbp-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className={`standee-lb-dropdown ${open ? 'standee-lb-dropdown-open' : ''}`}>
        {LANGUAGES.map((lang) => {
          const isSelected = lang.code === language;
          return (
            <button
              key={lang.code}
              className={`standee-lbd-opt ${isSelected ? 'standee-lbd-sel' : ''}`}
              onClick={() => select(lang)}
              type="button"
            >
              <span className="standee-lbd-flag">{lang.flag}</span>
              <span className="standee-lbd-info">
                <span className="standee-lbd-name">{lang.native}</span>
                <span className="standee-lbd-nat">{lang.short}</span>
              </span>
              {isSelected && (
                <svg className="standee-lbd-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────── FLOATING INTERACTION BAR ──────────────────── */
function FloatingInteractionBar({ isRecording, isSpeaking, isProcessing, onVoiceTap, onChatTap }) {
  return (
    <div className="standee-interaction-bar" role="group" aria-label="Interaction Controls">
      {/* Voice Button */}
      <div className="interaction-btn-wrapper">
        <button
          className={`standee-voice-btn ${isRecording ? 'is-recording' : ''} ${isSpeaking ? 'is-speaking' : ''}`}
          onClick={onVoiceTap}
          disabled={isProcessing}
          aria-label="Tap to Speak"
        >
          {isRecording && (
            <>
              <span className="voice-pulse-ring ring-1" />
              <span className="voice-pulse-ring ring-2" />
              <span className="voice-pulse-ring ring-3" />
            </>
          )}
          {isRecording && (
            <div className="voice-waveform">
              {[1,2,3,4,5].map(n => (
                <span key={n} className={`wave-bar bar-${n}`} />
              ))}
            </div>
          )}
          {isRecording ? (
            <div className="standee-stop-icon" />
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          )}
        </button>
        {!isRecording && <span className="standee-btn-label">Tap to Speak</span>}
      </div>

      {/* Chat Button */}
      <div className="interaction-btn-wrapper">
        <button
          className="standee-chat-btn"
          onClick={onChatTap}
          aria-label="Tap to Chat"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
        <span className="standee-btn-label">Tap to Chat</span>
      </div>
    </div>
  );
}

/* ──────────────────── STANDEE UI WRAPPER ──────────────────── */
export default function StandeeUI({
  isRecording,
  isSpeaking,
  isProcessing,
  onVoiceTap,
  onChatTap,
  onCategorySelect,
  language,
  onLanguageChange,
}) {
  return (
    <div className="standee-overlay">
      <div className="standee-top-stack">
        <div className="standee-lang-below">
          <StandeeLangBadge language={language} onLanguageChange={onLanguageChange} variant="inline" />
        </div>
      </div>

      <NavWheel onCategorySelect={onCategorySelect} />

      <FloatingInteractionBar
        isRecording={isRecording}
        isSpeaking={isSpeaking}
        isProcessing={isProcessing}
        onVoiceTap={onVoiceTap}
        onChatTap={onChatTap}
      />
    </div>
  );
}
