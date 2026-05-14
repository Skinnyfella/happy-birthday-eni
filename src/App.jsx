import { useState, useEffect, useRef } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  CONFIG — edit these before deploying
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TEST_MODE = true;
const BIRTHDAY = new Date("2026-07-22T00:00:00");
const HER_NAME = "Eni";
const TYPING_MSG = "Happy Birthday to the most beautiful soul I've ever known...";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  BACKGROUND MUSIC
//  Drop a .mp3 into /public/ and set the path below
//  e.g. "/audio/song.mp3"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MUSIC_SRC = "/audio/song.mp3"; // ← replace with your song path

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MEMORY SPREADS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SPREADS = [
  {
    type: "image",
    src: "/images/memory1.jpeg",
    date: "📍 Surulere  •  November 2025",
    caption: "That sip and paint date ending with ice cream and your laugh? I think that was the moment I started seeing a beautiful future with you ❤️.",
  },
  {
    type: "video",
    src: "/images/memory2.mp4",
    date: "📍 Lekki  •  December 2025",
    caption: "You definitely didn’t enjoy the house music that much 😭 but somehow that night on the island still became one of my favorite memories with you.",
  },
  {
    type: "image",
    src: "/images/memory3.jpeg",
    date: "📍 Lagos Island  •  December 2025",
    caption: "The first time we went to the beach together, I held you close and every wave felt like it was taking my worries away with it 😫❤️.",
  },
  {
    type: "video",
    src: "/images/momory4.mp4",
    date: "📍 Yaba  •  January 2026",
    caption: "Our first cinema date felt different. Sitting there with you, I realized I finally had something worth holding on to 😌.",
  },
  {
    type: "video",
    src: "/images/memory5.mp4",
    date: "📍 Ikorodu  •  January 2026",
    caption: "The amala might not have been the best 😭 but watching you happily take me out made that moment perfect to me.",
  },
  {
    type: "image",
    src: "/images/memory6.jpeg",
    date: "📍 Ikeja GRA  •  April 2026",
    caption: "That dessert date was dangerously sweet… and honestly, I still don’t think I got enough of you that day 😂.",
  },
  {
    type: "image",
    src: "/images/memory7.jpeg",
    date: "📍 Lagos Island  •  May 2026",
    caption: "That calm beach day with the white wine, the conversations, and just us… I wanted time to slow down so badly.",
  },
  {
    type: "image",
    src: null,
    date: "📍 Every place  •  Every moment",
    caption: "I left this one blank because I’m still looking forward to all the beautiful memories we haven’t made yet. I love you loads iyawo eh ❤️",
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ROTS = [-2, 1.5, -1.2, 2.2, -0.8];

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  left: `${((i * 17.3 + 5.7) % 100).toFixed(1)}%`,
  dur: `${(4.5 + (i * 0.85) % 5).toFixed(1)}s`,
  delay: `${((i * 0.45) % 4.5).toFixed(1)}s`,
  sz: `${(1.5 + (i * 0.18) % 2).toFixed(1)}px`,
}));

// confetti colours
const CONFETTI_COLORS = ["#c9956c", "#f7f2e7", "#e8a598", "#d4b896", "#f0c080", "#e07070", "#a0c8e0"];

// balloons data — fixed so they don't re-randomise on re-render
const BALLOONS = Array.from({ length: 8 }, (_, i) => ({
  left: `${((i * 12.5 + 4) % 95).toFixed(0)}%`,
  dur: `${(7 + (i * 1.3) % 5).toFixed(1)}s`,
  delay: `${((i * 0.6) % 3).toFixed(1)}s`,
  color: ["#e07070","#c9956c","#d4b896","#a0c8e0","#e8a598","#f0c080","#c8a0e0","#98d4a0"][i % 8],
  size: `${(28 + (i * 5) % 20).toFixed(0)}px`,
  sway: `${(8 + (i * 3) % 12).toFixed(0)}px`,
}));

function getRealCountdown() {
  const now = new Date();
  const next = new Date(BIRTHDAY);
  next.setFullYear(now.getFullYear());
  if (next < now) next.setFullYear(now.getFullYear() + 1);
  const diff = next - now;
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

function getDriveImageUrl(src) {
  if (!src) return src;
  const match = src.match(/\/file\/d\/([A-Za-z0-9_-]+)/) || src.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (!match) return src;
  return `https://drive.google.com/uc?export=view&id=${match[1]}`;
}

function isDirectVideoUrl(src) {
  return typeof src === "string" && /\.(mp4|webm|mov|ogg)(?:\?|$)/i.test(src);
}

// ── Confetti canvas component
function Confetti() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: 6 + Math.random() * 8,
      h: 4 + Math.random() * 5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.12,
      vx: (Math.random() - 0.5) * 2.5,
      vy: 1.5 + Math.random() * 3,
      opacity: 0.85 + Math.random() * 0.15,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}
    />
  );
}

export default function App() {
  const [scene, setScene] = useState("countdown");
  const [testSecs, setTestSecs] = useState(3);
  const [realTime, setRealTime] = useState(getRealCountdown());
  const [typed, setTyped] = useState("");
  const [hideCursor, setHideCursor] = useState(false);
  const [si, setSi] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [showFinaleMsg, setShowFinaleMsg] = useState(false);
  const audioRef = useRef(null);
  const musicStarted = useRef(false);

  // ── Music: try autoplay immediately, fall back to first interaction
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.45;
    audio.loop = true;

    const tryPlay = () => {
      if (musicStarted.current) return;
      audio.play().then(() => { musicStarted.current = true; }).catch(() => {});
    };

    // try straight away (works on some browsers / if page was interacted with)
    tryPlay();

    // also hook first user interaction as fallback
    const onInteract = () => { tryPlay(); };
    window.addEventListener("click", onInteract, { once: true });
    window.addEventListener("touchstart", onInteract, { once: true });
    window.addEventListener("keydown", onInteract, { once: true });
    return () => {
      window.removeEventListener("click", onInteract);
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("keydown", onInteract);
    };
  }, []);

  // ── Countdown → typing
  useEffect(() => {
    if (scene !== "countdown") return;
    if (TEST_MODE) {
      if (testSecs <= 0) {
        const t = setTimeout(() => setScene("typing"), 700);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setTestSecs((s) => s - 1), 1000);
      return () => clearTimeout(t);
    } else {
      const tick = () => {
        const rt = getRealCountdown();
        if (!rt) { setScene("typing"); return; }
        setRealTime(rt);
      };
      tick();
      const t = setInterval(tick, 1000);
      return () => clearInterval(t);
    }
  }, [scene, testSecs]);

  // ── Typing → cover
  useEffect(() => {
    if (scene !== "typing") return;
    if (typed.length >= TYPING_MSG.length) {
      setHideCursor(true);
      const t = setTimeout(() => setScene("cover"), 2400);
      return () => clearTimeout(t);
    }
    const delay = typed.length === 0 ? 700 : 55;
    const t = setTimeout(() => setTyped(TYPING_MSG.slice(0, typed.length + 1)), delay);
    return () => clearTimeout(t);
  }, [scene, typed]);

  // ── Finale
  useEffect(() => {
    if (scene !== "finale") return;
    const t = setTimeout(() => setShowFinaleMsg(true), 1500);
    return () => clearTimeout(t);
  }, [scene]);

  const goNext = () => {
    if (flipping) return;
    if (si >= SPREADS.length - 1) { setScene("finale"); return; }
    setFlipping(true);
    setTimeout(() => { setSi((s) => s + 1); setFlipping(false); }, 900);
  };

  const goPrev = () => {
    if (flipping || si === 0) return;
    setFlipping(true);
    setTimeout(() => { setSi((s) => s - 1); setFlipping(false); }, 900);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0d0806", overflow: "hidden", position: "relative" }}>
      <style>{STYLES}</style>
      <div className="grain" />

      {/* hidden audio element */}
      <audio ref={audioRef} src={MUSIC_SRC} preload="auto" autoPlay />

      {/* ── COUNTDOWN */}
      {scene === "countdown" && (
        <div className="scene fade-in">
          {PARTICLES.map((p, i) => (
            <span key={i} className="particle" style={{ left: p.left, animationDuration: p.dur, animationDelay: p.delay, width: p.sz, height: p.sz }} />
          ))}
          <div className="cd-wrap">
            <div className="cd-label">she arrives in</div>
            {TEST_MODE ? (
              <div key={testSecs} className="cd-num">{testSecs}</div>
            ) : realTime ? (
              <div className="cd-real">
                {[["d", realTime.d], ["h", realTime.h], ["m", realTime.m], ["s", realTime.s]].map(([unit, val]) => (
                  <div key={unit} className="cd-unit">
                    <div className="cd-digit">{String(val).padStart(2, "0")}</div>
                    <div className="cd-unit-label">{unit}</div>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="cd-sub">✦ &nbsp; moments away &nbsp; ✦</div>
          </div>
        </div>
      )}

      {/* ── TYPING — with confetti + balloons */}
      {scene === "typing" && (
        <div className="scene fade-in" style={{ overflow: "hidden" }}>

          {/* confetti canvas */}
          <Confetti />

          {/* balloons */}
          {BALLOONS.map((b, i) => (
            <div
              key={i}
              className="balloon"
              style={{
                left: b.left,
                animationDuration: b.dur,
                animationDelay: b.delay,
                "--sway": b.sway,
              }}
            >
              <svg width={b.size} viewBox="0 0 40 55" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="20" cy="20" rx="16" ry="19" fill={b.color} opacity="0.88" />
                <ellipse cx="14" cy="14" rx="5" ry="4" fill="white" opacity="0.22" transform="rotate(-20 14 14)" />
                <polygon points="20,39 17,44 23,44" fill={b.color} opacity="0.7" />
                <line x1="20" y1="44" x2="20" y2="55" stroke={b.color} strokeWidth="1.2" opacity="0.5" />
              </svg>
            </div>
          ))}

          <div className="ty-wrap" style={{ position: "relative", zIndex: 20 }}>
            <div className="ty-text">
              {typed}
              {!hideCursor && <span className="cursor" />}
            </div>
          </div>
        </div>
      )}

      {/* ── COVER */}
      {scene === "cover" && (
        <div className="scene fade-in" onClick={() => setScene("book")}>
          <div className="front-cover">
            <div className="fc-inner">
              <div className="heart-wrap">
                <svg className="heart-svg" viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M100,170 C98,168 20,120 20,68 C20,40 40,22 62,22 C78,22 92,31 100,44 C108,31 122,22 138,22 C160,22 180,40 180,68 C180,120 102,168 100,170 Z"
                    fill="rgba(201,149,108,0.07)"
                    stroke="rgba(201,149,108,0.55)"
                    strokeWidth="1.5"
                  />
                </svg>
                <div className="heart-text">
                  <div className="fc-title">my beautiful<br />moments<br />with you</div>
                </div>
              </div>
              <div className="fc-sub">✦ &nbsp; a little book for Eni &nbsp; ✦</div>
              <div className="fc-hint">tap to open</div>
            </div>
          </div>
        </div>
      )}

      {/* ── BOOK */}
      {scene === "book" && (
        <div className="scene fade-in" style={{ background: "radial-gradient(ellipse at 50% 40%, #1c0f09 0%, #0d0806 70%)" }}>
          <div className="bk-outer">
            <button className="nav-btn" onClick={goPrev} disabled={si === 0 || flipping}>‹</button>

            <div>
              <div className="bk-persp">
                {si < SPREADS.length - 1 && (
                  <div className="book-spread" style={{ position: "absolute", inset: 0, zIndex: 1 }}>
                    <div className="page pg-left">
                      <MediaBox spread={SPREADS[si + 1]} n={si + 1} />
                      <span className="pg-num pn-l">{(si + 1) * 2 + 1}</span>
                    </div>
                    <div className="page pg-right">
                      <JournalBox data={SPREADS[si + 1]} />
                      <span className="pg-num pn-r">{(si + 1) * 2 + 2}</span>
                    </div>
                  </div>
                )}

                <div className="book-spread" style={{ position: "absolute", inset: 0, zIndex: 2 }}>
                  <div className="page pg-left">
                    <MediaBox spread={SPREADS[si]} n={si} />
                    <span className="pg-num pn-l">{si * 2 + 1}</span>
                  </div>
                  <div className="page pg-right" style={{ visibility: flipping ? "hidden" : "visible" }}>
                    <JournalBox data={SPREADS[si]} />
                    <span className="pg-num pn-r">{si * 2 + 2}</span>
                  </div>
                </div>

                {flipping && (
                  <div className="flip-wrap" style={{ zIndex: 5 }}>
                    <div className="flip-face ff-front page pg-right">
                      <JournalBox data={SPREADS[si]} />
                    </div>
                    <div className="flip-face ff-back page pg-left">
                      <MediaBox spread={SPREADS[si + 1]} n={si + 1} />
                    </div>
                  </div>
                )}
                <div className="spine-shadow" />
              </div>

              <div className="dots-row">
                {SPREADS.map((_, i) => (
                  <div key={i} className={`dot ${i === si ? "dot-on" : ""}`} />
                ))}
              </div>
            </div>

            <button className="nav-btn" onClick={goNext} disabled={flipping}>
              {si === SPREADS.length - 1 ? "✓" : "›"}
            </button>
          </div>
        </div>
      )}

      {/* ── FINALE */}
      {scene === "finale" && (
        <div className="scene fade-in">
          <div className="fin-wrap">
            <div className="closed-book">
              <div className="cb-text">our<br />story</div>
            </div>
            <div className={`fin-msg ${showFinaleMsg ? "fin-msg-on" : ""}`}>
              <div className="fin-writing">thank you for every beautiful moment.</div>
              <div className="fin-bday">Happy Birthday, {HER_NAME}. 🤍</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MediaBox({ spread, n }) {
  const rot = ROTS[n % ROTS.length];
  const isVideo = spread.type === "video";

  if (!spread.src) {
    return (
      <div className={`media-frame ${isVideo ? "frame-video" : "frame-image"}`} style={{ transform: `rotate(${rot}deg)` }}>
        <div className="media-placeholder">
          <div className="placeholder-icon">{isVideo ? "🎞️" : "📷"}</div>
          <div className="placeholder-label">{isVideo ? "add video here" : "add photo here"}</div>
        </div>
      </div>
    );
  }

  if (isVideo && isDirectVideoUrl(spread.src)) {
    return (
      <div className="media-frame frame-video" style={{ transform: `rotate(${rot}deg)` }}>
        <video src={spread.src} className="media-iframe" muted autoPlay playsInline loop controls={false} />
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="media-frame frame-video" style={{ transform: `rotate(${rot}deg)` }}>
        <iframe src={spread.src} className="media-iframe" allow="autoplay" allowFullScreen frameBorder="0" title="memory video" />
      </div>
    );
  }

  const imageSrc = getDriveImageUrl(spread.src);
  return (
    <div className="media-frame frame-image" style={{ transform: `rotate(${rot}deg)` }}>
      <img src={imageSrc} alt="memory" className="media-img" />
    </div>
  );
}

function JournalBox({ data }) {
  return (
    <div className="journal">
      <div className="j-date">{data.date}</div>
      <div className="j-cap">{data.caption}</div>
      <div className="j-heart">♡</div>
    </div>
  );
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Caveat:wght@400;600&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

.grain {
  position: fixed; inset: 0; pointer-events: none; z-index: 999; opacity: 0.022;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.scene {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center; background: #0d0806;
}
.fade-in { animation: fadeIn 0.9s ease forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.particle {
  position: absolute; border-radius: 50%; background: #c9956c; opacity: 0;
  animation: floatUp linear infinite;
}
@keyframes floatUp {
  0%   { transform: translateY(102vh); opacity: 0; }
  10%  { opacity: 0.28; }
  90%  { opacity: 0.28; }
  100% { transform: translateY(-40px); opacity: 0; }
}

/* ─── BALLOONS ───────────────────────────────── */
.balloon {
  position: absolute;
  bottom: -80px;
  animation: balloonRise linear infinite;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));
}
@keyframes balloonRise {
  0%   { transform: translateY(0) translateX(0); opacity: 0; }
  5%   { opacity: 1; }
  50%  { transform: translateY(-55vh) translateX(var(--sway, 10px)); }
  100% { transform: translateY(-110vh) translateX(0); opacity: 0; }
}

/* ─── COUNTDOWN ─────────────────────────────── */
.cd-wrap { text-align: center; }
.cd-label {
  font-family: 'Cormorant Garamond', serif; font-size: clamp(0.7rem, 1.5vw, 0.9rem);
  letter-spacing: 0.45em; color: #c9956c; text-transform: uppercase;
  margin-bottom: 1.5rem; opacity: 0.7;
}
.cd-num {
  font-family: 'Playfair Display', serif;
  font-size: clamp(7rem, 22vw, 15rem);
  color: #f7f2e7; line-height: 1;
  text-shadow: 0 0 80px rgba(201,149,108,0.28);
  animation: popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes popIn { from { transform: scale(1.3); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.cd-real {
  display: flex; gap: clamp(1rem, 3vw, 2.5rem); justify-content: center; margin-bottom: 0.5rem;
}
.cd-unit { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
.cd-digit {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.5rem, 8vw, 5.5rem); color: #f7f2e7; line-height: 1;
  text-shadow: 0 0 40px rgba(201,149,108,0.25);
}
.cd-unit-label {
  font-family: 'Cormorant Garamond', serif; font-size: clamp(0.6rem, 1.2vw, 0.75rem);
  letter-spacing: 0.3em; color: #c9956c; text-transform: uppercase; opacity: 0.6;
}
.cd-sub {
  font-family: 'Cormorant Garamond', serif; font-style: italic;
  font-size: clamp(0.7rem, 1.5vw, 0.95rem);
  color: #c9956c; margin-top: 1.5rem; opacity: 0.5; letter-spacing: 0.2em;
}

/* ─── TYPING ─────────────────────────────────── */
.ty-wrap { max-width: min(680px, 85vw); text-align: center; padding: 2rem; }
.ty-text {
  font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300;
  font-size: clamp(1.6rem, 4vw, 2.8rem); color: #f7f2e7; line-height: 1.7;
}
.cursor {
  display: inline-block; width: 2px; height: 0.85em;
  background: #c9956c; margin-left: 3px; vertical-align: middle;
  animation: blink 0.8s ease infinite;
}
@keyframes blink { 0%,49%{ opacity: 1; } 50%,100%{ opacity: 0; } }

/* ─── FRONT COVER ────────────────────────────── */
.front-cover {
  width: clamp(160px, 26vw, 240px); height: clamp(220px, 38vw, 340px);
  background: linear-gradient(145deg, #5a2525, #3a1a1a);
  border-radius: 3px 12px 12px 3px;
  box-shadow: -4px 0 0 #2a1010, -8px 4px 30px rgba(0,0,0,0.6), 12px 12px 60px rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  animation: bookAppear 1.2s cubic-bezier(0.34, 1.3, 0.64, 1) forwards;
  cursor: pointer; transition: transform 0.3s;
}
.front-cover:hover { transform: rotate(1deg) scale(1.03); }
.fc-inner {
  text-align: center; padding: 1.2rem;
  display: flex; flex-direction: column; gap: 0.8rem; align-items: center;
}
.heart-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
.heart-svg {
  width: clamp(110px, 18vw, 155px); height: auto;
  filter: drop-shadow(0 0 6px rgba(201,149,108,0.2));
}
.heart-text {
  position: absolute; text-align: center;
  width: 72%; top: 44%; transform: translateY(-50%);
}
.fc-title {
  font-family: 'Cormorant Garamond', serif; font-style: italic;
  font-size: clamp(0.72rem, 1.8vw, 0.95rem);
  color: rgba(247,242,231,0.88); line-height: 1.75; letter-spacing: 0.03em;
}
.fc-sub {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(0.42rem, 1vw, 0.55rem);
  color: #c9956c; letter-spacing: 0.22em; text-transform: uppercase; opacity: 0.6;
}
.fc-hint {
  font-family: 'Cormorant Garamond', serif; font-style: italic;
  font-size: clamp(0.48rem, 0.9vw, 0.6rem);
  color: rgba(247,242,231,0.2); letter-spacing: 0.15em;
  animation: blink 2s ease infinite;
}

/* ─── BOOK ───────────────────────────────────── */
.bk-outer { display: flex; align-items: center; gap: clamp(0.7rem, 2.5vw, 2rem); }

.bk-persp {
  position: relative;
  width: min(700px, 90vw);
  height: min(450px, 58vw);
  min-height: 260px;
  perspective: 2000px;
  box-shadow: 0 35px 100px rgba(0,0,0,0.8), 0 5px 20px rgba(0,0,0,0.5);
}

.book-spread { display: flex; width: 100%; height: 100%; }
.page { flex: 1; position: relative; overflow: hidden; }
.pg-left {
  background: linear-gradient(to right, #e6dcc5, #ece4d0);
  border-right: 1px solid #d5cbb4;
  display: flex; align-items: center; justify-content: center;
  padding: clamp(0.6rem, 1.5vw, 1.2rem);
}
.pg-right {
  background: linear-gradient(to left, #e6dcc5, #ece4d0);
  padding: clamp(1rem, 2.5vw, 2.2rem) clamp(0.8rem, 2vw, 1.8rem);
  display: flex; align-items: center;
}

.spine-shadow {
  position: absolute; left: 50%; top: 0; bottom: 0; width: 22px;
  transform: translateX(-50%);
  background: linear-gradient(to right, rgba(0,0,0,0.14), rgba(0,0,0,0.02), rgba(0,0,0,0.02), rgba(0,0,0,0.14));
  pointer-events: none; z-index: 10;
}

/* ─── MEDIA FRAME ─────────────────────────────── */
.media-frame {
  border: 7px solid #f4efe4;
  box-shadow: 3px 4px 18px rgba(0,0,0,0.25), 0 0 0 1px #cdc3ae;
  overflow: hidden;
  background: #1a1a1a;
}
.frame-image { width: 90%; max-width: 240px; aspect-ratio: 3/4; }
.frame-video { width: 90%; max-width: 240px; aspect-ratio: 3/4; }
.media-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.media-iframe { width: 100%; height: 100%; display: block; border: none; }
.media-placeholder {
  width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: #ccc0a7; gap: 0.4rem;
}
.placeholder-icon { font-size: clamp(1.2rem, 2.5vw, 1.8rem); opacity: 0.28; }
.placeholder-label {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(0.5rem, 1.1vw, 0.65rem);
  color: #8a7a60; letter-spacing: 0.12em; text-transform: uppercase;
}

/* ─── JOURNAL ─────────────────────────────────── */
.journal { width: 100%; display: flex; flex-direction: column; height: 100%; justify-content: center; gap: 0.7rem; }
.j-date {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(0.52rem, 1.2vw, 0.7rem);
  letter-spacing: 0.12em; color: #a87050;
  text-transform: uppercase; border-bottom: 1px solid #cec3ab; padding-bottom: 0.6rem;
}
.j-cap {
  font-family: 'Caveat', cursive;
  font-size: clamp(0.88rem, 2.1vw, 1.18rem);
  color: #261208; line-height: 1.95;
}
.j-heart { font-family: 'Cormorant Garamond', serif; color: #c9956c; font-size: 1rem; opacity: 0.5; margin-top: auto; padding-top: 0.4rem; }

.pg-num {
  position: absolute; bottom: 0.75rem;
  font-family: 'Cormorant Garamond', serif; font-size: 0.6rem; color: #b0a088; letter-spacing: 0.1em;
}
.pn-l { left: 1rem; } .pn-r { right: 1rem; }

/* ─── FLIP ────────────────────────────────────── */
.flip-wrap {
  position: absolute; top: 0; left: 50%; width: 50%; height: 100%;
  transform-origin: left center; transform-style: preserve-3d;
  animation: doFlip 0.9s cubic-bezier(0.45, 0, 0.55, 1) forwards;
}
@keyframes doFlip { from { transform: rotateY(0deg); } to { transform: rotateY(-180deg); } }
.flip-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.ff-back { transform: rotateY(180deg); }

/* ─── NAV ─────────────────────────────────────── */
.nav-btn {
  width: clamp(40px, 5vw, 46px); height: clamp(40px, 5vw, 46px);
  border-radius: 50%; border: 1px solid rgba(201,149,108,0.6);
  background: rgba(201,149,108,0.15); color: #c9956c;
  font-size: clamp(1.3rem, 2.5vw, 1.4rem); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s; flex-shrink: 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.4);
}
.nav-btn:hover:not(:disabled) { background: rgba(201,149,108,0.25); border-color: #c9956c; }
.nav-btn:disabled { opacity: 0.15; cursor: default; }

.dots-row { display: flex; justify-content: center; gap: 6px; margin-top: 1.2rem; }
.dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(201,149,108,0.22); transition: all 0.3s; }
.dot-on { background: #c9956c; transform: scale(1.5); }

/* ─── FINALE ─────────────────────────────────── */
.fin-wrap {
  display: flex; align-items: center; justify-content: center;
  gap: clamp(2rem, 6vw, 5rem); flex-wrap: wrap; padding: 2rem;
}
.closed-book {
  width: clamp(100px, 16vw, 150px); height: clamp(140px, 23vw, 210px);
  background: linear-gradient(145deg, #5a2525, #3a1a1a);
  border-radius: 3px 10px 10px 3px;
  box-shadow: -4px 0 0 #2a1010, -8px 4px 30px rgba(0,0,0,0.6), 10px 10px 50px rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  animation: bookAppear 1.2s cubic-bezier(0.34, 1.3, 0.64, 1) forwards; flex-shrink: 0;
}
@keyframes bookAppear {
  from { transform: scale(0.55) rotate(-4deg); opacity: 0; }
  to   { transform: scale(1) rotate(2deg); opacity: 1; }
}
.cb-text {
  font-family: 'Cormorant Garamond', serif; font-style: italic;
  font-size: clamp(0.75rem, 1.8vw, 0.95rem);
  color: rgba(247,242,231,0.38); text-align: center; letter-spacing: 0.1em; line-height: 1.9;
}
.fin-msg {
  opacity: 0; transform: translateX(28px);
  transition: opacity 1.3s ease, transform 1.3s ease;
  max-width: clamp(220px, 40vw, 380px);
}
.fin-msg-on { opacity: 1; transform: translateX(0); }
.fin-writing {
  font-family: 'Caveat', cursive;
  font-size: clamp(1.2rem, 3vw, 1.85rem); color: #f7f2e7; line-height: 1.75;
}
.fin-bday {
  font-family: 'Cormorant Garamond', serif; font-style: italic;
  font-size: clamp(1rem, 2.5vw, 1.4rem); color: #c9956c; margin-top: 1rem; letter-spacing: 0.04em;
}
`;