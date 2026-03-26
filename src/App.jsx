import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import { Avatar } from './Avatar';
import { StarsBackground } from './BackgroundAndAnimations';
import StandeeUI from './StandeeUI';
import './index.css';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function useCompactLayout() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 600px)');
    const mqKioskPortrait = window.matchMedia('(max-width: 900px) and (min-height: 900px)');
    const mqHdPortrait = window.matchMedia('(min-width: 901px) and (max-width: 1100px) and (min-height: 1600px)');

    const update = () => {
      setIsCompact(Boolean(mqMobile.matches || mqKioskPortrait.matches || mqHdPortrait.matches));
    };

    update();
    mqMobile.addEventListener('change', update);
    mqKioskPortrait.addEventListener('change', update);
    mqHdPortrait.addEventListener('change', update);

    return () => {
      mqMobile.removeEventListener('change', update);
      mqKioskPortrait.removeEventListener('change', update);
      mqHdPortrait.removeEventListener('change', update);
    };
  }, []);

  return isCompact;
}

function useStandeeLayout() {
  const [isStandee, setIsStandee] = useState(false);

  useEffect(() => {
    // Original standee kiosk (1080×1920 / 1200×1920)
    const mqStandee = window.matchMedia(
      '(min-width: 1000px) and (max-width: 1200px) and (min-height: 1800px) and (max-height: 2000px) and (orientation: portrait)'
    );
    const mqExact = window.matchMedia(
      '(min-width: 1080px) and (max-width: 1080px) and (min-height: 1920px) and (max-height: 1920px)'
    );
    // Tablet portrait
    const mqTabP1 = window.matchMedia('(min-width: 750px) and (max-width: 850px) and (min-height: 1000px) and (max-height: 1100px) and (orientation: portrait)');
    const mqTabP2 = window.matchMedia('(min-width: 800px) and (max-width: 860px) and (min-height: 1150px) and (max-height: 1220px) and (orientation: portrait)');
    const mqTabP3 = window.matchMedia('(min-width: 780px) and (max-width: 830px) and (min-height: 1240px) and (max-height: 1330px) and (orientation: portrait)');
    const mqTabP4 = window.matchMedia('(min-width: 990px) and (max-width: 1060px) and (min-height: 1330px) and (max-height: 1420px) and (orientation: portrait)');
    const mqTabP5 = window.matchMedia('(min-width: 1150px) and (max-width: 1250px) and (min-height: 1880px) and (max-height: 2060px) and (orientation: portrait)');
    const mqTabP800x1165 = window.matchMedia('(min-width: 760px) and (max-width: 900px) and (min-height: 1050px) and (max-height: 1300px) and (orientation: portrait)');
    const mqSmallTabP684x964 = window.matchMedia(
      '(min-width: 650px) and (max-width: 720px) and (min-height: 900px) and (max-height: 1050px) and (orientation: portrait)'
    );
    // Tablet landscape
    const mqTabL1 = window.matchMedia('(min-width: 1000px) and (max-width: 1100px) and (min-height: 740px) and (max-height: 820px) and (orientation: landscape)');
    const mqTabL2 = window.matchMedia('(min-width: 1140px) and (max-width: 1220px) and (min-height: 790px) and (max-height: 860px) and (orientation: landscape)');
    const mqTabL3 = window.matchMedia('(min-width: 1230px) and (max-width: 1310px) and (min-height: 780px) and (max-height: 840px) and (orientation: landscape)');
    const mqTabL4 = window.matchMedia('(min-width: 1320px) and (max-width: 1420px) and (min-height: 990px) and (max-height: 1070px) and (orientation: landscape)');
    const mqTabL5 = window.matchMedia('(min-width: 1870px) and (max-width: 2060px) and (min-height: 1150px) and (max-height: 1260px) and (orientation: landscape)');
    const mqTabL6 = window.matchMedia('(min-width: 2500px) and (max-width: 2620px) and (min-height: 1550px) and (max-height: 1660px) and (orientation: landscape)');

    const mqTabletPortraitGeneric = window.matchMedia(
      '(hover: none) and (pointer: coarse) and (min-width: 700px) and (max-width: 2200px) and (min-height: 900px) and (max-height: 3000px) and (orientation: portrait)'
    );
    const mqTabletLandscapeGeneric = window.matchMedia(
      '(hover: none) and (pointer: coarse) and (min-width: 900px) and (max-width: 3000px) and (min-height: 600px) and (max-height: 2200px) and (orientation: landscape)'
    );

    const all = [
      mqStandee,
      mqExact,
      mqTabP1,
      mqTabP2,
      mqTabP3,
      mqTabP4,
      mqTabP5,
      mqTabP800x1165,
      mqSmallTabP684x964,
      mqTabL1,
      mqTabL2,
      mqTabL3,
      mqTabL4,
      mqTabL5,
      mqTabL6,
      mqTabletPortraitGeneric,
      mqTabletLandscapeGeneric,
    ];

    const update = () => setIsStandee(all.some(mq => mq.matches));
    update();
    all.forEach(mq => mq.addEventListener('change', update));

    return () => all.forEach(mq => mq.removeEventListener('change', update));
  }, []);

  return isStandee;
}

function CollapsibleCard({ ariaLabel, icon, title, subtitle, defaultOpen, isCompact }) {
  const [open, setOpen] = useState(Boolean(defaultOpen));

  useEffect(() => {
    if (!isCompact) {
      setOpen(true);
    }
  }, [isCompact]);

  const onToggle = useCallback(() => {
    if (!isCompact) return;
    setOpen((v) => !v);
  }, [isCompact]);

  return (
    <div
      className={`feature-card collapsible-card ${open ? 'is-open' : 'is-closed'}`}
      role="group"
      aria-label={ariaLabel}
    >
      <button className="card-close" type="button" aria-label="Close">×</button>
      <button
        className="card-toggle"
        type="button"
        aria-label={open ? 'Minimize' : 'Maximize'}
        aria-expanded={open}
        onClick={onToggle}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className="card-icon">{icon}</div>
      <div className="card-text">
        <div className="card-title">{title}</div>
        <div className={`collapsible-body ${open ? 'is-open' : 'is-closed'}`}>
          <div className="collapsible-inner">
            <div className="card-subtitle">{subtitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CameraFix() {
  const { camera } = useThree();

  useEffect(() => {
    const mqTabletPortrait = window.matchMedia(
      '(hover: none) and (pointer: coarse) and (min-width: 700px) and (max-width: 1100px) and (min-height: 900px) and (orientation: portrait)'
    );
    const mqTabP800x1165 = window.matchMedia(
      '(min-width: 760px) and (max-width: 900px) and (min-height: 1050px) and (max-height: 1300px) and (orientation: portrait)'
    );
    const mqTabP800x1110to1200 = window.matchMedia(
      '(min-width: 760px) and (max-width: 900px) and (min-height: 1110px) and (max-height: 1200px) and (orientation: portrait)'
    );
    const mqSmallTabP684x964 = window.matchMedia(
      '(min-width: 650px) and (max-width: 720px) and (min-height: 900px) and (max-height: 1050px) and (orientation: portrait)'
    );
    const mqTabletLandscape = window.matchMedia(
      '(hover: none) and (pointer: coarse) and (min-width: 900px) and (max-width: 1600px) and (min-height: 600px) and (orientation: landscape)'
    );

    const isTabP = mqTabletPortrait.matches;
    const isTabP800x1165 = mqTabP800x1165.matches;
    const isTabP800x1110to1200 = mqTabP800x1110to1200.matches;
    const isSmallTabP684x964 = mqSmallTabP684x964.matches;
    const isTabL = mqTabletLandscape.matches;

    const z = isTabP800x1110to1200
      ? 2.6
      : (isSmallTabP684x964 ? 2.9 : (isTabP800x1165 ? 2.7 : (isTabP ? 1.85 : (isTabL ? 2.05 : 2.7))));
    const fov = isTabP800x1110to1200
      ? 31
      : (isSmallTabP684x964 ? 34 : (isTabP800x1165 ? 32 : (isTabP ? 28 : (isTabL ? 30 : 36))));
    const y = isTabP800x1110to1200 ? 0.48 : (isSmallTabP684x964 ? 0.46 : (isTabP800x1165 ? 0.52 : 0.42));

    camera.fov = fov;
    camera.position.set(0, y, z);
    camera.lookAt(0, y, 0.12);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

function DynamicLights() {
  const keyRef = useRef(null);
  const rimRef = useRef(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (keyRef.current) {
      keyRef.current.position.x = 3 + Math.sin(t * 0.6) * 0.6;
      keyRef.current.position.y = 7 + Math.sin(t * 0.4) * 0.4;
      keyRef.current.intensity = 1.5 + Math.sin(t * 0.9) * 0.15;
    }
    if (rimRef.current) {
      rimRef.current.position.x = -2 + Math.cos(t * 0.5) * 0.8;
      rimRef.current.position.y = 5 + Math.cos(t * 0.35) * 0.5;
      rimRef.current.intensity = 1.25 + Math.cos(t * 0.8) * 0.12;
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} color="#eef" />
      <hemisphereLight intensity={0.35} color="#ffffff" groundColor="#2a1b6a" />
      <directionalLight ref={keyRef} position={[3, 7, 6]} intensity={1.6} color="#ffffff" />
      <directionalLight ref={rimRef} position={[-2, 5, -6]} intensity={1.25} color="#00C6FF" />
      <pointLight position={[-4, 2.5, 4]} intensity={1.1} color="#7B2FF7" />
    </>
  );
}

function LanguageDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const items = [
    { value: 'en', title: 'English', subtitle: 'English' },
    { value: 'ta', title: 'Tamil', subtitle: 'தமிழ்' },
    { value: 'hi', title: 'Hindi', subtitle: 'हिंदी' }
  ];

  const selected = items.find((i) => i.value === value) || items[0];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target)) setOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const toggle = () => setOpen((v) => !v);

  return (
    <div className={`language-dropdown ${open ? 'is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="language-selector"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
      >
        <span className="language-selector-value">
          <span className="language-selector-title">{selected.title}</span>
          <span className="language-selector-subtitle">{selected.subtitle}</span>
        </span>
        <span className="language-selector-chevron" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="language-dropdown-menu" role="listbox" aria-label="Language">
          {items.map((item) => {
            const isSelected = item.value === value;
            return (
              <button
                key={item.value}
                type="button"
                className={`language-dropdown-option ${isSelected ? 'is-selected' : ''}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
              >
                <span className="language-dropdown-option-text">
                  <span className="language-dropdown-option-title">{item.title}</span>
                  <span className="language-dropdown-option-subtitle">{item.subtitle}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function App() {
  const chatbotTitleRef = useRef(null);
  const chatHistoryRef = useRef(null);
  const isCompactLayout = useCompactLayout();
  const isStandeeLayout = useStandeeLayout();
  const isCompactRef = useRef(isCompactLayout);

  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState(() => {
    const mqMobile = window.matchMedia('(max-width: 600px)');
    const mqKioskPortrait = window.matchMedia('(max-width: 900px) and (min-height: 900px)');
    const mqHdPortrait = window.matchMedia('(min-width: 901px) and (max-width: 1100px) and (min-height: 1600px)');
    const isCompactInitial = Boolean(mqMobile.matches || mqKioskPortrait.matches || mqHdPortrait.matches);
    // Removed early return so initial greeting is always shown
    return [
      {
        role: 'ai',
        text: 'Hello, I\u2019m AIVA, your AI-powered college admission assistant. I can help you with courses, fees, admission steps, and more. How can I assist you today?'
      }
    ];
  });
  const [inputMode, setInputMode] = useState('voice');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);

  // ─── Language state ───
  const [language, setLanguage] = useState('en');

  const wsRef = useRef(null);
  const wsReadyRef = useRef(false);
  const pendingTextQueueRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const volumeRafRef = useRef(null);
  const currentSourceRef = useRef(null);
  // Abort token: incremented every time we stop audio; old chains check this and bail
  const playbackGenRef = useRef(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Buffer for incoming binary audio stream chunks
  const streamingAudioChunksRef = useRef([]);
  const isStreamingAudioRef = useRef(false);
  // Queue of ArrayBuffers waiting to be played sequentially
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    isCompactRef.current = isCompactLayout;
  }, [isCompactLayout]);

  useEffect(() => {
    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      wsReadyRef.current = false;

      ws.onopen = () => {
        wsReadyRef.current = true;
        const queued = pendingTextQueueRef.current;
        pendingTextQueueRef.current = [];
        for (const msg of queued) {
          try {
            ws.send(msg);
          } catch (e) {
            pendingTextQueueRef.current.push(msg);
          }
        }
      };

      ws.onmessage = async (evt) => {
        // ─── Handle binary audio stream frames ───
        if (evt.data instanceof Blob || evt.data instanceof ArrayBuffer) {
          const arrayBuf = evt.data instanceof Blob
            ? await evt.data.arrayBuffer()
            : evt.data;
          streamingAudioChunksRef.current.push(new Uint8Array(arrayBuf));
          return;
        }

        try {
          const data = JSON.parse(evt.data);
          const t = data?.type;

          if (t === 'streaming_status') {
            if (data?.input_text) setTranscript(data.input_text);
            return;
          }

          if (t === 'streaming_text_response') {
            const inputText = data?.input_text || '';
            const responseText = data?.response_text || '';
            if (inputText) setMessages((prev) => [...prev, { role: 'user', text: inputText }]);
            if (responseText) setMessages((prev) => [...prev, { role: 'ai', text: responseText }]);
            setTranscript('');
            return;
          }

          // ─── Binary audio stream lifecycle ───
          if (t === 'audio_stream_start') {
            streamingAudioChunksRef.current = [];
            isStreamingAudioRef.current = true;
            return;
          }

          if (t === 'audio_stream_end') {
            isStreamingAudioRef.current = false;
            // Merge all binary chunks and enqueue for playback
            const chunks = streamingAudioChunksRef.current;
            if (chunks.length > 0) {
              const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
              const merged = new Uint8Array(totalLen);
              let offset = 0;
              for (const c of chunks) {
                merged.set(c, offset);
                offset += c.length;
              }
              streamingAudioChunksRef.current = [];
              // enqueue — playback will call setIsProcessing(false) when done
              enqueueAudio(merged.buffer);
            } else {
              setIsProcessing(false);
            }
            return;
          }

          if (t === 'text_with_audio_response') {
            const responseText = data?.response || '';
            if (responseText) setMessages((prev) => [...prev, { role: 'ai', text: responseText }]);
            const audioBase64 = data?.audio_data;
            if (audioBase64) {
              await playAudioBase64(audioBase64);
            }
            return;
          }

          if (t === 'streaming_audio_chunk' || t === 'streaming_audio_response') {
            const audioBase64 = data?.audio_data;
            if (audioBase64) {
              await playAudioBase64(audioBase64);
            }
            return;
          }

          if (t === 'text_response') {
            const responseText = data?.response || '';
            if (responseText) setMessages((prev) => [...prev, { role: 'ai', text: responseText }]);
            return;
          }

          if (t === 'audio_conversation_response') {
            const inputText = data?.input_text || '';
            const responseText = data?.response_text || '';
            if (inputText) setMessages((prev) => [...prev, { role: 'user', text: inputText }]);
            if (responseText) setMessages((prev) => [...prev, { role: 'ai', text: responseText }]);
            setTranscript('');
            const audioBase64 = data?.audio_data;
            if (audioBase64) {
              await playAudioBase64(audioBase64);
            }
            return;
          }

          if (t === 'streaming_error' || t === 'streaming_audio_error' || t === 'error') {
            const errText = data?.error || data?.response || 'Backend error';
            setMessages((prev) => [...prev, { role: 'ai', text: errText }]);
          }
        } catch (e) {
          console.error('[WS] onmessage parse error', e);
        } finally {
          setIsProcessing(false);
        }
      };

      ws.onclose = () => {
        wsReadyRef.current = false;
        if (!isUnmounted) {
          setTimeout(connect, 750);
        }
      };

      ws.onerror = () => {
        wsReadyRef.current = false;
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      try {
        wsRef.current?.close();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    if (isCompactLayout && inputMode === 'chat' && isRecording) {
      toggleRecording();
    }
  }, [inputMode, isRecording, isCompactLayout]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages, transcript]);

  // ─── Stop any actively playing TTS audio ───
  const stopCurrentAudio = () => {
    // Bump generation so any in-flight playback chain self-terminates
    playbackGenRef.current += 1;
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch (_) {}
      currentSourceRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    streamingAudioChunksRef.current = [];
    isStreamingAudioRef.current = false;
    setIsSpeaking(false);
    setAudioVolume(0);
    stopVolumeLoop();
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      return;
    }

    // Stop any TTS that is currently playing before starting mic
    stopCurrentAudio();

    // Start recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg'
      ];
      const chosenMimeType = preferredMimeTypes.find((t) => window.MediaRecorder?.isTypeSupported?.(t));
      const mediaRecorder = chosenMimeType ? new MediaRecorder(stream, { mimeType: chosenMimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsRecording(false);
        setIsProcessing(true);
        setTranscript('Sending audio...');

        try {
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioBase64 = arrayBufferToBase64(arrayBuffer);
          sendWsJson({
            type: 'audio_base64',
            audio_data: audioBase64,
            language: language,
            input_language: language,
            output_language: language
          });
        } catch (err) {
          console.error(err);
          setTranscript('Error sending audio to backend.');
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscript("");
    } catch (err) {
      console.error(err);
      alert("Microphone access denied or not available.");
    }
  };

  const handleSend = async (queryOverride) => {
    const query = queryOverride || transcript;
    if (!query.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setTranscript("");
    setIsRecording(false);
    sendWsJson({
      type: 'text',
      query,
      language: language,
      enable_tts: true,
      tts_language: language
    });
    setIsProcessing(true);
  };

  const sendWsJson = (payload) => {
    const msg = JSON.stringify(payload);
    const ws = wsRef.current;
    if (ws && wsReadyRef.current && ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    } else {
      pendingTextQueueRef.current.push(msg);
    }
  };

  const ensureAudioContext = async () => {
    if (!audioContextRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new Ctx();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    if (!analyserRef.current) {
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      analyser.connect(audioContextRef.current.destination);
    }
  };

  const stopVolumeLoop = () => {
    if (volumeRafRef.current) {
      cancelAnimationFrame(volumeRafRef.current);
      volumeRafRef.current = null;
    }
  };

  const startVolumeLoop = () => {
    stopVolumeLoop();
    const analyser = analyserRef.current;
    if (!analyser) return;

    const data = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      // Use sqrt curve to boost quiet speech, higher multiplier for visible lip sync
      const boosted = Math.sqrt(rms) * 3.2;  // was 2.2 — more visible lip movement
      setAudioVolume(Math.min(1, boosted));
      volumeRafRef.current = requestAnimationFrame(tick);
    };

    volumeRafRef.current = requestAnimationFrame(tick);
  };

  // ─── Audio queue: plays buffers one-by-one, never cutting off mid-sentence ───
  const enqueueAudio = (arrayBuffer) => {
    audioQueueRef.current.push(arrayBuffer);
    if (!isPlayingRef.current) {
      _playNextInQueue(playbackGenRef.current);
    }
  };

  const _playNextInQueue = async (gen) => {
    // Bail out if a newer playback generation has started (audio was stopped)
    if (gen !== playbackGenRef.current) return;

    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      setAudioVolume(0);
      stopVolumeLoop();
      setIsProcessing(false);
      return;
    }

    isPlayingRef.current = true;
    const arrayBuffer = audioQueueRef.current.shift();
    await _playBufferNow(arrayBuffer, gen);
  };

  const _playBufferNow = async (arrayBuffer, gen) => {
    // Bail if audio was interrupted
    if (gen !== playbackGenRef.current) return;

    await ensureAudioContext();

    try {
      const ctx = audioContextRef.current;
      const analyser = analyserRef.current;
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

      // Bail again after async decode — user may have pressed mic
      if (gen !== playbackGenRef.current) return;

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      currentSourceRef.current = source;
      if (analyser) {
        source.connect(analyser);
      } else {
        source.connect(ctx.destination);
      }

      setIsSpeaking(true);
      startVolumeLoop();

      await new Promise((resolve) => {
        source.onended = () => {
          if (currentSourceRef.current === source) {
            currentSourceRef.current = null;
          }
          resolve();
        };
        source.start(0);
      });
    } catch (e) {
      console.error('[AUDIO] playback failed', e);
    }

    // Only continue chain if still in the same generation
    _playNextInQueue(gen);
  };

  const playAudioBuffer = async (arrayBuffer) => {
    enqueueAudio(arrayBuffer);
  };

  const playAudioBase64 = async (audioBase64) => {
    enqueueAudio(base64ToArrayBuffer(audioBase64));
  };

  const sendQuickAction = (action) => {
    handleSend(action);
  };

  const getMicStatusText = () => {
    if (isRecording) return "Listening...";
    if (isProcessing) return "Processing...";
    if (isSpeaking) return "Speaking...";
    return "Tap to Speak";
  };





  const handleStandeeChatTap = useCallback(() => {
    const inputEl = document.querySelector('.transcript-input');
    if (inputEl) inputEl.focus();
  }, []);

  /* ── Nav Wheel category → pre-filled chat message ── */
  const CATEGORY_MESSAGES = {
    'Explore Majors': 'What courses and degree programs are available at the college?',
    'Admission Req.': 'What are the admission requirements and eligibility criteria?',
    'Counseling': 'I need information about counseling and expert support services.',
    'Courses': 'Tell me about all the courses and programs offered at the college.',
    'Hostel': 'What hostel and campus facilities are available for students?',
    'Placements': 'Tell me about placement records and career opportunities.',
  };

  const handleCategorySelect = useCallback((categoryName) => {
    const message = CATEGORY_MESSAGES[categoryName];
    if (message) handleSend(message);
  }, [language]);

  const renderMessageText = (text) => {
    if (!text) return null;
    const parts = text.split('[DOC: AIVA_dataset]');
    if (parts.length === 1) return text;
    
    return (
      <React.Fragment>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="doc-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                AIVA_dataset
              </span>
            )}
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  };

  return (
    <div className="app-container">
      <div className="top-header">
        <button className="top-icon-btn" type="button" aria-label="Home">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 10v10h14V10" />
          </svg>
        </button>
        <div className="top-title">VIRTUAL COLLEGE ASSISTANT</div>
        <button className="top-icon-btn" type="button" aria-label="Star">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.7 6.9 7.3.6-5.6 4.7 1.8 7.1L12 17.9 5.8 21.3l1.8-7.1L2 9.5l7.3-.6L12 2z" />
          </svg>
        </button>
      </div>
      <StarsBackground />

      <div className="tab-advanced-title">
        <div className="tab-title-small">Sri Eshwar Virtual Assistant</div>
        <div className="tab-title-main">AIVA</div>
      </div>

      {/* Left Panel - Identity & Help */}
      <div className="left-panel">
        <div className="aiva-info-panel" role="group" aria-label="AIVA Information">
          <div className="aiva-info-brand">
            <div className="aiva-info-title">AIVA</div>
            <div className="aiva-info-subtitle">AI Virtual Assistant</div>
            <div className="aiva-info-founded">FOUNDED IN 2026 &bull; DEVELOPED BY FYMEN</div>
          </div>

          <div className="aiva-info-purpose">
            Helping parents and students explore college information effortlessly.
          </div>
          <ul className="aiva-info-list">
            <li>&rarr; Admission Guidance</li>
            <li>&rarr; Counseling &amp; Support</li>
            <li>&rarr; Courses &amp; Programs</li>
            <li>&rarr; Hostel &amp; Facilities</li>
            <li>&rarr; Placements &amp; Careers</li>
          </ul>
        </div>

        {!isCompactLayout && (
          <>
            <CollapsibleCard
              ariaLabel="Explore Majors"
              title="Explore Majors"
              subtitle="Information on various college majors and degrees."
              defaultOpen={!isCompactLayout}
              isCompact={isCompactLayout}
              icon={
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10 12 4 2 10l10 6 10-6Z" />
                  <path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5" />
                </svg>
              }
            />

            <CollapsibleCard
              ariaLabel="Admission Requirements"
              title="Admission Requirements"
              subtitle="Details on application process and eligibility criteria."
              defaultOpen={!isCompactLayout}
              isCompact={isCompactLayout}
              icon={
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                  <path d="M14 2v6h6" />
                  <path d="M8 13h8" />
                  <path d="M8 17h6" />
                </svg>
              }
            />

            <CollapsibleCard
              ariaLabel="Campus Life"
              title="Campus Life"
              subtitle="Learn about housing, clubs, student activities."
              defaultOpen={!isCompactLayout}
              isCompact={isCompactLayout}
              icon={
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21V9l9-6 9 6v12" />
                  <path d="M9 22V12h6v10" />
                </svg>
              }
            />
          </>
        )}
      </div>

      {isCompactLayout && (
        <div className="mode-toggle-container" role="group" aria-label="Input Mode">
          <div className="mode-toggle-group">
            <button
              type="button"
              className={`mode-btn ${inputMode === 'voice' ? 'active' : ''}`}
              onClick={() => setInputMode('voice')}
            >
              Voice
            </button>
            <button
              type="button"
              className={`mode-btn ${inputMode === 'chat' ? 'active' : ''}`}
              onClick={() => setInputMode('chat')}
            >
              Chat
            </button>
          </div>

          {inputMode === 'voice' && (
            <div className="voice-controls">
              <button
                type="button"
                className="voice-action-btn"
                onClick={toggleRecording}
                disabled={isProcessing}
                title={isRecording ? "Stop" : "Start"}
              >
                {isRecording ? 'Stop' : 'Start'}
              </button>
              <div className="voice-status-label">{getMicStatusText()}</div>
            </div>
          )}
        </div>
      )}

      {/* Avatar Center */}
      <div className="avatar-container">
        <Canvas camera={{ fov: 36 }}>
          <CameraFix />
          <Suspense fallback={null}>
            <Environment preset="city" />
          </Suspense>
          <ambientLight intensity={1.2} />
          <directionalLight position={[2, 5, 2]} intensity={1.5} />

          <Suspense fallback={null}>
            <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.25} floatingRange={[-0.02, 0.02]}>
              <Avatar isSpeaking={isSpeaking} isRecording={isRecording} isProcessing={isProcessing} audioVolume={audioVolume} />
            </Float>
          </Suspense>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
            target={[0, 0.42, 0.12]}
          />
        </Canvas>
      </div>

      <div className="popular-questions" role="group" aria-label="Popular Questions">
        <div className="popular-questions-title">POPULAR QUESTIONS</div>
        <ul className="popular-questions-list">
          <li>What are admissions deadlines?</li>
          <li>Tell me about financial aid and scholarships</li>
        </ul>
      </div>

      {/* Right Panel - Chat UI */}
      <div className="ui-section">
        <div className="chatbot-header">
          <h2 className="chatbot-title" ref={chatbotTitleRef}>AIVA Chatbot</h2>
        </div>

        <div className="chatbot-container">
          <div className="chat-history" ref={chatHistoryRef}>
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role}`}>
                {renderMessageText(m.text)}
              </div>
            ))}
            {isCompactLayout && transcript && (
              <div className="message user transcript-preview">
                {transcript}
              </div>
            )}
          </div>

          {!isStandeeLayout && (
            <div className="quick-actions">
              <button className="quick-btn" onClick={() => sendQuickAction("Admissions")}>Admissions</button>
              <button className="quick-btn" onClick={() => sendQuickAction("Fees")}>Fees</button>
              <button className="quick-btn" onClick={() => sendQuickAction("Courses")}>Courses</button>
              <button className="quick-btn" onClick={() => sendQuickAction("Hostel")}>Hostel</button>
            </div>
          )}

          <div className="chatbot-input-area">
            {/* Language Selector – hidden on standee (uses floating badge instead) */}
            {!isStandeeLayout && (
              <div className={`language-selector-wrapper ${isStandeeLayout ? 'is-standee' : ''}`}>
                <span className="language-selector-label">Language</span>
                <LanguageDropdown value={language} onChange={setLanguage} />
              </div>
            )}

            <textarea
              className="transcript-input"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && isStandeeLayout) {
                  e.preventDefault();
                  handleSend(null);
                }
              }}
              placeholder="Hi, I'm AIVA your college assistant"
              rows={2}
            />

            {/* Send button – compact layout */}
            {isCompactLayout && !isStandeeLayout && (
              <div className="chatbot-actions">
                <button
                  className={`orb-mic-button compact-mic ${isRecording ? 'recording' : ''} ${isSpeaking ? 'speaking' : ''}`}
                  onClick={toggleRecording}
                  title={isRecording ? "Tap to Stop" : "Tap to Speak"}
                >
                  {isRecording ? (
                    <div className="stop-icon" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="22" />
                    </svg>
                  )}
                </button>
                <button
                  className="send-orb-button"
                  onClick={() => handleSend(null)}
                  disabled={(!transcript.trim() && !isRecording) || isProcessing}
                >
                  Send
                </button>
              </div>
            )}

            {/* Send button – standee / tablet layout */}
            {isStandeeLayout && (
              <div className="chatbot-actions standee-send-row">
                <button
                  className="send-orb-button standee-send-btn"
                  onClick={() => handleSend(null)}
                  disabled={(!transcript.trim() && !isRecording) || isProcessing}
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hide the in-panel mic/tap-to-speak controls on standee/tablet – floating bar handles it */}
        {!isStandeeLayout && !isCompactLayout && (
          <div className="chatbot-controls">
            <div className="mic-wrapper">
              <button
                className={`orb-mic-button ${isRecording ? 'recording' : ''} ${isSpeaking ? 'speaking' : ''}`}
                onClick={toggleRecording}
                title={isRecording ? "Tap to Stop" : "Tap to Speak"}
              >
                {isRecording ? (
                  <div className="stop-icon" />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                )}
              </button>
              <span className="mic-status-label">{getMicStatusText()}</span>
            </div>

            <button
              className="send-orb-button"
              onClick={() => handleSend(null)}
              disabled={(!transcript.trim() && !isRecording) || isProcessing}
            >
              Send
            </button>
          </div>
        )}
      </div>

      {/* Standee + Tablet UI – visible on all standee/tablet dimensions */}
      {isStandeeLayout && (
        <StandeeUI
          isRecording={isRecording}
          isSpeaking={isSpeaking}
          isProcessing={isProcessing}
          onVoiceTap={toggleRecording}
          onChatTap={handleStandeeChatTap}
          onCategorySelect={handleCategorySelect}
          language={language}
          onLanguageChange={setLanguage}
        />
      )}


    </div>
  );
}

export default App;
