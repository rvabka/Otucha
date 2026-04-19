import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundAura from '../components/BackgroundAura';
import GlassPanel from '../components/GlassPanel';
import Icon from '../components/Icon';
import CharacterSwiper from '../components/CharacterSwiper';
import CharacterStage from '../components/CharacterStage';
import { CHARACTERS, getCharacter } from '../data/characters';
import { tokens } from '../api/client';

const API_BASE = import.meta.env.VITE_API_URL || 'https://vps-5af91b90.vps.ovh.net';
const WS_BASE = API_BASE.replace(/^http/, 'ws');

const CRISIS_PATTERNS = [
  /\bzab(ij|ić|iję|ije|iłbym|ilabym|iłabym)\s+si(ę|e)\b/i,
  /\bsamob(ój|oj)/i,
  /\bodebr(ać|ac)\s+sobie\s+życie\b/i,
  /\bnie\s+chc(ę|e)\s+(już\s+)?(żyć|zyc|istnieć)\b/i,
  /\bchc(ę|e)\s+(umrzeć|umrzec|zniknąć|zniknac|skończyć|skonczyc)\b/i,
  /\b(zrobi(ć|c)|robi(ć|c))\s+sobie\s+krzywd(ę|e)\b/i,
  /\bkrzywd(a|y|zić|zic)\s+siebie\b/i,
  /\b(tn(ę|e)|pociąć|pociac|ciąć|ciac)\s+si(ę|e)\b/i,
  /\bsamookalecz/i,
  /\bnienawidz(ę|e)\s+siebie\b/i,
  /\bnie\s+warto\s+żyć\b/i,
  /\blepiej\s+(gdyby)?\s*mnie\s+nie\s+było\b/i,
  /\bsuicid/i,
  /\bkill\s+myself\b/i,
  /\bend\s+my\s+life\b/i,
  /\bself[-\s]?harm/i,
];

function detectCrisis(text) {
  if (!text) return false;
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

function renderFormattedText(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-rpg-quest">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function Chat() {
  const { agentId } = useParams();
  const navigate = useNavigate();

  const [selectedAgent, setSelectedAgent] = useState(agentId || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [crisisFlag, setCrisisFlag] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showSwiper, setShowSwiper] = useState(!agentId);
  const [crisisHelpOpen, setCrisisHelpOpen] = useState(false);

  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const assistantBufferRef = useRef('');
  const assistantMessageIdRef = useRef(null);
  const messageIdRef = useRef(0);
  const audioRef = useRef(null);
  const ttsAbortRef = useRef(null);
  const listeningRef = useRef(false);
  const startListeningRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animFrameRef = useRef(null);

  const character = selectedAgent ? getCharacter(selectedAgent) : null;
  const accessToken = tokens.access;

  const speakText = useCallback(async (text) => {
    if (!voiceEnabled || !text) return;
    const cleanText = text.replace(/\*\*/g, '');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    mediaRecorderRef.current = null;
    listeningRef.current = false;
    setIsListening(false);

    if (ttsAbortRef.current) { try { ttsAbortRef.current.abort(); } catch {} }
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch {}
      try { URL.revokeObjectURL(audioRef.current.src); } catch {}
      audioRef.current = null;
    }

    const abort = new AbortController();
    ttsAbortRef.current = abort;

    const canStream =
      typeof window !== 'undefined' &&
      'MediaSource' in window &&
      window.MediaSource.isTypeSupported('audio/mpeg');

    try {
      setIsSpeaking(true);
      const res = await fetch(`${API_BASE}/rag/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, agent_id: selectedAgent }),
        signal: abort.signal,
      });
      if (!res.ok) throw new Error(`TTS failed: ${res.status}`);

      if (!canStream || !res.body) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
        audio.onerror = () => setIsSpeaking(false);
        await audio.play();
        return;
      }

      const mediaSource = new MediaSource();
      const mediaUrl = URL.createObjectURL(mediaSource);
      const audio = new Audio();
      audio.src = mediaUrl;
      audio.preload = 'auto';
      audioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(mediaUrl); };
      audio.onerror = () => setIsSpeaking(false);

      mediaSource.addEventListener('sourceopen', () => {
        let sourceBuffer;
        try {
          sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
        } catch (e) {
          console.error('[TTS] addSourceBuffer failed', e);
          setIsSpeaking(false);
          return;
        }

        const queue = [];
        let streamEnded = false;
        let playStarted = false;

        const flush = () => {
          if (sourceBuffer.updating || queue.length === 0) return;
          try {
            sourceBuffer.appendBuffer(queue.shift());
          } catch (e) {
            console.warn('[TTS] appendBuffer', e);
          }
        };

        sourceBuffer.addEventListener('updateend', () => {
          if (!playStarted) {
            playStarted = true;
            audio.play().catch((e) => console.warn('[TTS] play', e));
          }
          if (queue.length > 0) {
            flush();
          } else if (streamEnded && mediaSource.readyState === 'open') {
            try { mediaSource.endOfStream(); } catch {}
          }
        });

        (async () => {
          const reader = res.body.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) { streamEnded = true; break; }
              queue.push(value);
              flush();
            }
            if (!sourceBuffer.updating && queue.length === 0 && mediaSource.readyState === 'open') {
              try { mediaSource.endOfStream(); } catch {}
            }
          } catch (err) {
            if (err.name !== 'AbortError') console.error('[TTS] read error', err);
          }
        })();
      }, { once: true });
    } catch (err) {
      if (err.name !== 'AbortError') console.error('[TTS] Error:', err);
      setIsSpeaking(false);
    }
  }, [voiceEnabled, selectedAgent]);

  useEffect(() => {
    if (!selectedAgent) return;
    assistantBufferRef.current = '';
    assistantMessageIdRef.current = null;
    setMessages([]);
    setIsConnected(false);
    const tokenQuery = accessToken ? `?token=${encodeURIComponent(accessToken)}` : '';
    const ws = new WebSocket(`${WS_BASE}/rag/ws/chat/${selectedAgent}${tokenQuery}`);
    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'crisis') { setCrisisFlag(true); return; }
      if (data.type === 'token') {
        assistantBufferRef.current += data.content;
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant' && last.streaming) {
            updated[updated.length - 1] = { ...last, content: assistantBufferRef.current };
          } else {
            const nextId = `msg-${messageIdRef.current += 1}`;
            assistantMessageIdRef.current = nextId;
            updated.push({ id: nextId, role: 'assistant', content: assistantBufferRef.current, crisis: crisisFlag, streaming: true });
          }
          return updated;
        });
      }
      if (data.type === 'done') {
        const finalText = assistantBufferRef.current;
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, streaming: false };
          }
          return updated;
        });
        assistantBufferRef.current = '';
        assistantMessageIdRef.current = null;
        setCrisisFlag(false);
        setIsLoading(false);
        speakText(finalText);
      }
    };
    wsRef.current = ws;
    return () => {
      ws.close();
    };
  }, [selectedAgent, speakText, accessToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const silenceTimerRef = useRef(null);
  const audioChunksRef = useRef([]);
  const analyserRef = useRef(null);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    mediaRecorderRef.current = null;
    listeningRef.current = false;
    setIsListening(false);
  }, []);

  const sendAudioToWhisper = useCallback(async (chunks) => {
    if (chunks.length === 0) return;
    const blob = new Blob(chunks, { type: 'audio/webm' });
    if (blob.size < 1000) return;
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');
    try {
      const res = await fetch(`${API_BASE}/rag/stt`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('STT failed');
      const data = await res.json();
      const text = data.text?.trim();
      if (text && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        if (detectCrisis(text)) setCrisisHelpOpen(true);
        setMessages((prev) => [...prev, { id: `msg-${messageIdRef.current += 1}`, role: 'user', content: text }]);
        wsRef.current.send(JSON.stringify({ message: text }));
        setInput('');
        setIsLoading(true);
      }
    } catch (err) {
      console.warn('[STT] Whisper error:', err);
    }
  }, []);

  const startListening = useCallback(async () => {
    if (listeningRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const chunks = audioChunksRef.current;
        audioChunksRef.current = [];
        sendAudioToWhisper(chunks);
      };
      recorder.start(250);
      listeningRef.current = true;
      setIsListening(true);
      setInput('');
      const SILENCE_THRESHOLD = 15;
      const SILENCE_TIMEOUT = 1000;
      let lastSoundTime = Date.now();
      const checkSilence = () => {
        if (!listeningRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        if (avg > SILENCE_THRESHOLD) lastSoundTime = Date.now();
        if (Date.now() - lastSoundTime > SILENCE_TIMEOUT) { stopListening(); return; }
        animFrameRef.current = requestAnimationFrame(checkSilence);
      };
      animFrameRef.current = requestAnimationFrame(checkSilence);
    } catch (err) {
      console.warn('[STT] Mic error:', err);
      alert('Nie udało się uzyskać dostępu do mikrofonu.');
      listeningRef.current = false;
      setIsListening(false);
    }
  }, [sendAudioToWhisper, stopListening]);

  useEffect(() => { startListeningRef.current = startListening; }, [startListening]);

  useEffect(() => {
    if (chatEnded) stopListening();
    return () => stopListening();
  }, [chatEnded, stopListening]);

  useEffect(() => {
    return () => {
      if (ttsAbortRef.current) { try { ttsAbortRef.current.abort(); } catch {} }
      if (audioRef.current) {
        audioRef.current.pause();
        try { URL.revokeObjectURL(audioRef.current.src); } catch {}
        audioRef.current.src = '';
        audioRef.current = null;
      }
      setIsSpeaking(false);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
        wsRef.current = null;
      }
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (detectCrisis(trimmed)) setCrisisHelpOpen(true);
    setMessages((prev) => [...prev, { id: `msg-${messageIdRef.current += 1}`, role: 'user', content: trimmed }]);
    wsRef.current.send(JSON.stringify({ message: trimmed }));
    setInput('');
    setIsLoading(true);
  };

  const handleConfirmCharacter = (char) => {
    if (ttsAbortRef.current) { try { ttsAbortRef.current.abort(); } catch {} }
    if (audioRef.current) { audioRef.current.pause(); }
    setIsSpeaking(false);
    stopListening();
    setSelectedAgent(char.agentId);
    navigate(`/chat/${char.agentId}`, { replace: true });
    setShowSwiper(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-body text-ink-900">
      <BackgroundAura />

      <AnimatePresence>
        {crisisHelpOpen && (
          <CrisisHelpModal onClose={() => setCrisisHelpOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSwiper && (
          <CharacterSwiper
            initialAgentId={selectedAgent}
            onConfirm={handleConfirmCharacter}
            onCancel={() => {
              if (selectedAgent) setShowSwiper(false);
              else navigate('/app');
            }}
            confirmLabel={selectedAgent ? 'Zmień postać' : 'Rozpocznij rozmowę'}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('/app')}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white/55 text-ink-700 backdrop-blur-md transition hover:scale-105 hover:bg-white/80"
            aria-label="Wróć"
          >
            <Icon name="arrow" size={18} className="rotate-180" />
          </button>

          <div className="flex items-center gap-2">
            {!chatEnded && (
              <button
                onClick={() => setShowSwiper(true)}
                className="flex items-center gap-2 rounded-full bg-white/55 px-4 py-2 text-sm font-semibold text-ink-700 backdrop-blur-md transition hover:scale-105 hover:bg-white/80"
              >
                <Icon name="sparkle" size={14} className="text-rpg-quest" />
                Zmień postać
              </button>
            )}
            {messages.length > 0 && !chatEnded && (
              <button
                onClick={() => {
                  setChatEnded(true);
                  if (wsRef.current) wsRef.current.close();
                }}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(125,211,184,0.9)]"
                style={{
                  background: 'linear-gradient(135deg, #7dd3b8 0%, #a8e8d2 100%)',
                }}
              >
                Zakończ czat 💛
              </button>
            )}
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:max-h-[calc(100vh-9rem)]">
          {/* LEFT: Big elegant portrait */}
          <div className="relative flex flex-col gap-3">
            {character && (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isConnected ? 'bg-rpg-sage' : 'bg-rpg-hp'
                    }`}
                    style={{
                      boxShadow: isConnected
                        ? '0 0 10px #7dd3b8'
                        : '0 0 10px #ff8fa3',
                    }}
                  />
                  <span className="text-xs font-semibold text-ink-500">
                    {isConnected ? 'połączono' : 'łączenie…'}
                  </span>
                </div>
                <CharacterDots
                  activeId={character.agentId}
                  onPick={(id) => {
                    const c = CHARACTERS.find((x) => x.agentId === id);
                    if (c) handleConfirmCharacter(c);
                  }}
                />
              </div>
            )}

            <div className="relative flex min-h-[520px] flex-1 lg:min-h-0">
              {character ? (
                <CharacterStage
                  character={character}
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                />
              ) : (
                <GlassPanel className="flex w-full items-center justify-center text-ink-500">
                  Wybierz przewodnika…
                </GlassPanel>
              )}
            </div>
          </div>

          {/* RIGHT: Chat */}
          <GlassPanel className="flex h-full min-h-[520px] flex-col p-0">
            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
              {messages.length === 0 && character && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto mt-10 max-w-sm text-center"
                >
                  <div
                    className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl text-2xl"
                    style={{ background: character.gradient }}
                  >
                    <Icon name="sparkle" size={20} className="text-white" />
                  </div>
                  <p className="font-display text-xl text-ink-900">
                    Cześć! Jestem {character.name}.
                  </p>
                  <p className="mt-2 text-sm text-ink-500">
                    Napisz coś albo kliknij mikrofon — porozmawiamy.
                  </p>
                </motion.div>
              )}

              <div className="flex flex-col gap-3">
                <AnimatePresence initial={false} mode="popLayout">
                  {messages.map((msg, i) => (
                    <MessageBubble
                      key={msg.id || i}
                      msg={msg}
                      character={character}
                    />
                  ))}
                </AnimatePresence>
                {isLoading && character && <TypingDots character={character} />}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {chatEnded ? (
              <div
                className="rounded-b-[2.5rem] px-6 py-5 text-center font-display text-base font-semibold text-rpg-sage"
                style={{ background: 'rgba(125, 211, 184, 0.15)' }}
              >
                Dzięki za rozmowę! Dbaj o siebie 💛
              </div>
            ) : (
              <form
                onSubmit={sendMessage}
                className="flex items-center gap-2 border-t border-white/50 px-4 py-4 sm:px-6"
              >
                <button
                  type="button"
                  onClick={() => setVoiceEnabled((v) => !v)}
                  className={`grid h-11 w-11 place-items-center rounded-2xl text-lg transition ${
                    voiceEnabled
                      ? 'bg-rpg-quest/15 text-rpg-quest hover:bg-rpg-quest/25'
                      : 'bg-white/50 text-ink-300 hover:bg-white/70'
                  }`}
                  title={voiceEnabled ? 'Głos WŁ' : 'Głos WYŁ'}
                >
                  {voiceEnabled ? '🔊' : '🔇'}
                </button>

                <button
                  type="button"
                  onClick={() => (isListening ? stopListening() : startListening())}
                  className={`relative grid h-11 w-11 place-items-center rounded-2xl text-lg transition ${
                    isListening
                      ? 'bg-rpg-hp/20 text-rpg-hp'
                      : 'bg-white/55 text-ink-700 hover:bg-white/80'
                  }`}
                  title={isListening ? 'Słucham…' : 'Mikrofon'}
                >
                  🎤
                  {isListening && (
                    <motion.span
                      className="absolute -inset-0.5 rounded-2xl border-2 border-rpg-hp"
                      animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.06, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  )}
                </button>

                <input
                  className="flex-1 rounded-2xl border border-white/60 bg-white/65 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-300 outline-none backdrop-blur-md transition focus:border-rpg-quest/40 focus:bg-white/85 focus:ring-2 focus:ring-rpg-quest/20"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? 'Nagrywam…' : 'Napisz wiadomość…'}
                  disabled={!isConnected || isLoading}
                />

                <button
                  type="submit"
                  disabled={!isConnected || isLoading || !input.trim()}
                  className="flex h-11 items-center gap-1 rounded-2xl px-5 font-display text-sm font-semibold text-white shadow-[0_14px_30px_-14px_rgba(124,109,245,0.9)] transition hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                  style={{
                    background:
                      'linear-gradient(135deg, #7c6df5 0%, #c48cff 55%, #ff8fa3 100%)',
                  }}
                >
                  Wyślij
                  <span>→</span>
                </button>
              </form>
            )}
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

function CrisisHelpModal({ onClose }) {
  const helplines = [
    {
      name: 'Telefon Zaufania dla Dzieci i Młodzieży',
      number: '116 111',
      hours: 'czynny całodobowo, bezpłatny',
      href: 'tel:116111',
    },
    {
      name: 'Centrum Wsparcia dla osób w stanie kryzysu',
      number: '800 70 2222',
      hours: '24/7, bezpłatny',
      href: 'tel:800702222',
    },
    {
      name: 'Numer alarmowy',
      number: '112',
      hours: 'w sytuacji bezpośredniego zagrożenia',
      href: 'tel:112',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(28, 24, 60, 0.55)', backdropFilter: 'blur(10px)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md overflow-hidden rounded-[2rem] p-7 text-ink-900"
        style={{
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 40px 80px -30px rgba(124,109,245,0.55), 0 0 0 2px rgba(255,143,163,0.35)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,143,163,0.45), transparent 70%)',
          }}
        />
        <div className="relative">
          <div
            className="mb-4 grid h-14 w-14 place-items-center rounded-2xl text-2xl"
            style={{
              background: 'linear-gradient(135deg, #ff8fa3 0%, #c48cff 100%)',
              boxShadow: '0 18px 40px -18px rgba(255,143,163,0.9)',
            }}
          >
            <Icon name="heart" size={24} className="text-white" />
          </div>

          <h2 className="font-display text-2xl font-bold leading-tight text-ink-900">
            Hej, jesteś dla nas ważna/ważny.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-700">
            To, co czujesz, brzmi poważnie. Proszę — nie rób sobie krzywdy.
            Porozmawiaj z kimś, kto może realnie pomóc <strong>teraz</strong>.
            Rozmowy są bezpłatne i anonimowe.
          </p>

          <div className="mt-5 flex flex-col gap-2.5">
            {helplines.map((h) => (
              <a
                key={h.number}
                href={h.href}
                className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,143,163,0.15), rgba(196,140,255,0.15))',
                  border: '1px solid rgba(255,255,255,0.8)',
                }}
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold uppercase tracking-wider text-ink-500">
                    {h.name}
                  </div>
                  <div className="mt-0.5 font-display text-xl font-bold text-rpg-quest tabular-nums">
                    {h.number}
                  </div>
                  <div className="text-xs text-ink-500">{h.hours}</div>
                </div>
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #7c6df5 0%, #ff8fa3 100%)',
                    color: '#fff',
                    boxShadow: '0 10px 24px -12px rgba(124,109,245,0.8)',
                  }}
                >
                  📞
                </div>
              </a>
            ))}
          </div>

          <p className="mt-5 text-xs leading-relaxed text-ink-500">
            Jeśli komuś w pobliżu dzieje się krzywda lub jesteś w bezpośrednim
            zagrożeniu — zadzwoń pod <strong>112</strong>. Nie jesteś sam/sama.
          </p>

          <button
            onClick={onClose}
            className="mt-5 w-full rounded-2xl py-3 font-display text-sm font-semibold text-white shadow-[0_14px_30px_-14px_rgba(124,109,245,0.9)] transition hover:scale-[1.02] active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #7c6df5 0%, #c48cff 55%, #ff8fa3 100%)',
            }}
          >
            Rozumiem, dziękuję
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CharacterDots({ activeId, onPick }) {
  return (
    <div className="flex items-center gap-1.5">
      {CHARACTERS.map((c) => (
        <button
          key={c.agentId}
          onClick={() => onPick(c.agentId)}
          className="h-2.5 rounded-full transition-all"
          style={{
            width: c.agentId === activeId ? 22 : 8,
            background:
              c.agentId === activeId
                ? c.accent
                : 'rgba(255,255,255,0.55)',
            boxShadow:
              c.agentId === activeId ? `0 0 12px ${c.halo}` : 'none',
          }}
          aria-label={c.name}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg, character }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      layout
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
          msg.crisis ? 'ring-2 ring-rpg-hp shadow-[0_0_20px_rgba(255,143,163,0.45)]' : ''
        }`}
        style={
          isUser
            ? {
                color: '#fff',
                background:
                  'linear-gradient(135deg, #7c6df5 0%, #c48cff 100%)',
                borderBottomRightRadius: 8,
                boxShadow: '0 14px 30px -14px rgba(124,109,245,0.6)',
              }
            : {
                background: 'rgba(255,255,255,0.78)',
                color: '#1a1a3a',
                borderBottomLeftRadius: 8,
                border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 10px 26px -16px rgba(76,60,140,0.25)',
              }
        }
      >
        {!isUser && character && (
          <div
            className="mb-1 text-[10px] font-bold uppercase tracking-wider"
            style={{ color: character.accent }}
          >
            {character.name}
          </div>
        )}
        <div className="whitespace-pre-wrap">
          {isUser ? msg.content : renderFormattedText(msg.content)}
        </div>
      </div>
    </motion.div>
  );
}

function TypingDots({ character }) {
  return (
    <div className="flex items-center gap-1.5 self-start rounded-3xl bg-white/75 px-4 py-3 shadow-[0_10px_26px_-16px_rgba(76,60,140,0.25)]">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full"
          style={{ background: character.accent }}
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default Chat;
