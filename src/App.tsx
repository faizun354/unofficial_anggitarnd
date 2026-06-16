import React, { useState, useEffect, useRef } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Heart,
  Sparkles,
  BookOpen,
  Laptop,
  Flower2,
  GraduationCap,
  Mail,
  MailOpen,
  Dumbbell,
  Trophy,
  Send,
  PartyPopper,
  X,
  Plus,
  ChevronRight,
  Trash2,
  Volume2,
  VolumeX,
  Award,
  Smile,
  Star,
  Music,
  Play,
  Pause
} from "lucide-react";
import audioEngine, { TRACKS } from "./utils/audio";

// Types
interface GuestbookMessage {
  id: string;
  sender: string;
  note: string;
  sticker: string; // '💖' | '🎓' | '✨' | '⭐' | '🎉'
  bgColor: string;
  createdAt: string;
  likes: number;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export default function App() {
  // Loading & Transition States
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(2022);
  const [loadingText, setLoadingText] = useState("2022 : memulai perjalanan");
  const [heartClicks, setHeartClicks] = useState(() => {
    const saved = localStorage.getItem("goy_clicks");
    return saved ? parseInt(saved) : 520;
  });

  // Music & Volume states
  const [audioMuted, setAudioMuted] = useState(false);
  const [activeTrackId, setActiveTrackId] = useState("hero");
  const [currentVolume, setCurrentVolume] = useState(0.45);
  const [showMusicMenu, setShowMusicMenu] = useState(false);

  // Theme Sparkles & floating hearts controls
  const [sparklesEnabled, setSparklesEnabled] = useState(true);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [customHeartsCount, setCustomHeartsCount] = useState(0);

  // Envelope Open State
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  // Stacked Cards Index
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Selected Photo Lightbox
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string; year: string } | null>(null);

  // Guestbook & Form States
  const [senderName, setSenderName] = useState("");
  const [loveNote, setLoveNote] = useState("");
  const [selectedSticker, setSelectedSticker] = useState("💖");
  const [selectedCardBg, setSelectedCardBg] = useState("bg-[#fff5f5]");
  const [messages, setMessages] = useState<GuestbookMessage[]>(() => {
    const saved = localStorage.getItem("goy_messages");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback below
      }
    }
    // Start with empty messages - users can add their own
    return [];
  });

  // Success Confetti Overlay
  const [showConfetti, setShowConfetti] = useState(false);

  // Register audio event listeners and try autoplay immediately
  useEffect(() => {
    audioEngine.onTrackChange = (trackId) => {
      setActiveTrackId(trackId);
    };
    audioEngine.setVolume(currentVolume);
    audioEngine.syncMute(false);
    audioEngine.startTrack("hero");

    // Fallback: Enable audio on first user interaction (browser autoplay policy)
    const enableAudioOnInteraction = () => {
      audioEngine.syncMute(false);
      audioEngine.startTrack("hero");
      document.removeEventListener("click", enableAudioOnInteraction);
      document.removeEventListener("scroll", enableAudioOnInteraction);
      window.removeEventListener("touchstart", enableAudioOnInteraction);
    };

    document.addEventListener("click", enableAudioOnInteraction, { once: true });
    document.addEventListener("scroll", enableAudioOnInteraction, { once: true });
    window.addEventListener("touchstart", enableAudioOnInteraction, { once: true });

    return () => {
      document.removeEventListener("click", enableAudioOnInteraction);
      document.removeEventListener("scroll", enableAudioOnInteraction);
      window.removeEventListener("touchstart", enableAudioOnInteraction);
    };
  }, []);

  // Sync volume with audioEngine
  useEffect(() => {
    audioEngine.setVolume(currentVolume);
  }, [currentVolume]);

  // Handle active section scrolling with high performance viewport targeting
  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      const options = {
        root: null,
        rootMargin: "-20% 0px -30% 0px",
        threshold: 0.1,
      };

      const callback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elId = entry.target.id;
            const trackId = elId.replace("sec-", "");
            if (TRACKS[trackId]) {
              audioEngine.startTrack(trackId);
            }
          }
        });
      };

      const observer = new IntersectionObserver(callback, options);
      const targetIds = ["sec-hero", "sec-journey", "sec-letter", "sec-encouragement", "sec-wall", "sec-celebration"];
      
      targetIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });

      return () => {
        observer.disconnect();
      };
    }, 800); // Small timeout to ensure fully mounted canvas & render nodes

    return () => clearTimeout(timer);
  }, [loading]);

  // Save guestbook messages to localStorage
  useEffect(() => {
    localStorage.setItem("goy_messages", JSON.stringify(messages));
  }, [messages]);

  // Loading Counter Logic
  useEffect(() => {
    if (!loading) return;
    
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 2026) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
          }, 1000);
          return 2026;
        }
        
        const next = prev + 1;
        if (next === 2023) {
          setLoadingText("2023 : belajar dan beradaptasi");
        } else if (next === 2024) {
          setLoadingText("2024 : berlatih dan berkembang");
        } else if (next === 2025) {
          setLoadingText("2025 : merasakan beratnya");
        } else if (next === 2026) {
          setLoadingText("2026 : yeayyy akhirnya berhasil");
        }
        return next;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [loading]);

  // Handle header heart click with interactive particle spawn
  const handleNavHeartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const updated = heartClicks + 1;
    setHeartClicks(updated);
    localStorage.setItem("goy_clicks", updated.toString());

    // Spawn floating heart particle
    const rect = e.currentTarget.getBoundingClientRect();
    const newHeart: FloatingHeart = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10, // random percent X
      y: 100, // starting bottom
      size: Math.random() * 20 + 15,
      delay: 0,
      duration: Math.random() * 2 + 2,
    };
    setFloatingHearts((prev) => [...prev, newHeart]);

    // Cleanup heart particle
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 4000);
  };

  // Auto-start music when loading finishes
  useEffect(() => {
    if (!loading && !audioMuted) {
      audioEngine.startTrack("hero");
    }
  }, [loading, audioMuted]);

  // Add custom random floating hearts for ambient atmosphere
  useEffect(() => {
    if (!sparklesEnabled) return;
    const interval = setInterval(() => {
      const newHeart: FloatingHeart = {
        id: Date.now() + Math.random(),
        x: Math.random() * 90 + 5, // random X screen percent
        y: 110,
        size: Math.random() * 16 + 10,
        delay: Math.random() * 2,
        duration: Math.random() * 3 + 3,
      };
      setFloatingHearts((prev) => [...prev.slice(-30), newHeart]); // Keep max 30 hearts
    }, 1500);

    return () => clearInterval(interval);
  }, [sparklesEnabled]);

  // Handle Note Submission
  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !loveNote.trim()) return;

    const newMessage: GuestbookMessage = {
      id: Date.now().toString(),
      sender: senderName.trim(),
      note: loveNote.trim(),
      sticker: selectedSticker,
      bgColor: selectedCardBg,
      createdAt: "Today",
      likes: 0
    };

    setMessages((prev) => [newMessage, ...prev]);
    setSenderName("");
    setLoveNote("");
    setShowConfetti(true);

    // Trigger explosive heart particles
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const explosionHeart: FloatingHeart = {
          id: Date.now() + Math.random(),
          x: Math.random() * 80 + 10,
          y: 90 - Math.random() * 40,
          size: Math.random() * 25 + 15,
          delay: 0,
          duration: Math.random() * 1.5 + 1.5,
        };
        setFloatingHearts((prev) => [...prev, explosionHeart]);
      }, i * 80);
    }

    // Auto-close confetti
    setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
  };

  const likeMessage = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m))
    );
  };

  const deleteMessage = (id: string, sender: string) => {
    if (sender === "Your Love") return; // Keep original primary love letter safe
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  // Timeline entries
  const timelineData = [
    {
      year: "2022",
      title: "Awal dari mimpi",
      desc: "Langkah awal yg masih bnyak keraguan, mulai berdamai dengan keadaan, dan mencoba mengenal dunia baru",
      icon: <BookOpen className="w-5 h-5 text-brand-primary" />,
      mainImg: "/ospek.png",
      alt: "Pondok studi pertama & buku riset awal"
    },
    {
      year: "2023",
      title: "Berani dan berkembang",
      desc: "Belajar banyak hal baru, mengenal lebih banyak orang, meski sempat di titik terendah, tapi ternyata masih bisa bangkit dan bertahan",
      icon: <Heart className="w-5 h-5 text-brand-primary" fill="currentColor" />,
      mainImg: "/sinau.png",
      alt: "Meja belajar penuh buku dan laptop"
    },
    {
      year: "2024",
      title: "Terhubung bersama",
      desc: "menemukan banyak hal yang ternyata bisa disyukuri, berbagi bahagia bersama yang ternyata membuat bahagia itu lebih bermakna",
      icon: <Laptop className="w-5 h-5 text-brand-primary" />,
      mainImg: "/volu.png",
      alt: "Latar jalan kampus yang indah berkilau"
    },
    {
      year: "2025",
      title: "Berjuang dan bertahan",
      desc: "Melangkah lebih jauh dengan menjawab semua tantangan, dan meski berat rasanya, tapi berhasil melewatinya dengan sempurna",
      icon: <Flower2 className="w-5 h-5 text-brand-primary" />,
      images: [
        "/pkl.jpg",
        "/pkl2.jpg",
        "/pkl3.jpg"
      ],
      alt: "Momen perjuangan dan keberhasilan riset"
    },
    {
      year: "2026",
      title: "Akhirnya..!",
      desc: "Ujung dari perjalanan ini ternyata sudah didepan mata, dan kamu bisa menaklukannya dengan hebat, selamattt banggaa bangettt",
      icon: <GraduationCap className="w-5 h-5 text-white" />,
      mainImg: "/sempro5.png",
      alt: "Topi toga, rangkaian bunga, dan gulungan ijazah kemenangan"
    }
  ];

  interface EncouragementCard {
    title: string;
    desc: string;
    images: string[];
    icon: React.ReactNode;
  }

  // Cards state data for stacked interactive block
  const encouragementCards: EncouragementCard[] = [
    {
      title:  "favoritku",
      desc: "Kudapati sepotong ingatan tentangmu, perlahan menjadi utuh. Nyatanya, ditempat ramai sekalipun, disaat aku berusaha menyelesaikan tugasku, isi pikiranku tetap fokus pada satu orang favorit yang bersemayam dipikiranku, ~kamu",
      images: [
        "/cantik.jpg",
        "/coban.jpg"
      ],
      icon: <Smile className="w-6 h-6 text-brand-primary" />,
    },
    {
      title:  "bersamamu",
      desc: "sejauh apa tentang kita pun tidak membuat rasa iini hilang, dan kerinduan yg kurasakan terus terperangkap dalam ruang gelap yang tidak pernah menemukan jalan keluar, karena tidak ada yang menuntunku untuk beranjak dari sana, yaitu kamu",
      images: [
        "/atas.jpg",
        "/bunga.jpg"
      ],
      icon: <Star className="w-6 h-6 text-brand-primary" />,
    },
    {
      title: "tentang namamu",
      desc: "namamu ku abadikan didalam skripsiku dan sudah kusematkan jg S.T nya wkwk, dan tanggal 0101 itu ku masukkan dalam project kerja pertamaku, karna kamu adalah harapan yang slalu ku semogakan di situasi apapun",
      images: [
        "/kuning.jpg",
        "/jatim.jpg"
      ],
      icon: <Award className="w-6 h-6 text-brand-primary" />,
    }
  ];

  const handleNextCard = () => {
    setActiveCardIndex((prev) => (prev + 1) % encouragementCards.length);
  };

  return (
    <div className="min-h-screen bg-brand-background text-brand-on-surface font-sans overflow-x-hidden selection:bg-brand-primary-container relative">
      <div id="graduation-joy-root" />

      {/* Floating Sparkles & Hearts Overlay Renderer */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        <AnimatePresence>
          {floatingHearts.map((heart) => (
            <motion.span
              key={heart.id}
              initial={{ y: "110dvh", x: `${heart.x}vw`, scale: 0.5, opacity: 0 }}
              animate={{ 
                y: "-10dvh", 
                x: `${heart.x + Math.sin(heart.id) * 10}vw`,
                scale: 1, 
                opacity: [0, 0.9, 0.9, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: heart.duration, ease: "easeOut", delay: heart.delay }}
              className="absolute text-brand-primary-container drop-shadow-md select-none"
              style={{ fontSize: heart.size }}
            >
              ❤️
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading Animation Screen */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            id="loading-screen"
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="fixed inset-0 z-[100] bg-brand-surface flex flex-col items-center justify-center text-center p-8 overflow-hidden"
          >
            <div className="relative flex flex-col items-center max-w-sm">
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="font-serif text-6xl md:text-7xl text-brand-primary italic font-bold tracking-tight mb-4"
              >
                {loadingProgress}
              </motion.div>

              <div className="flex justify-center items-center space-x-3 mb-8">
                <Sparkles className="w-6 h-6 text-brand-primary-container animate-pulse" />
                <Heart className="w-7 h-7 text-brand-primary animate-bounce" fill="currentColor" />
                <Sparkles className="w-6 h-6 text-brand-primary-container animate-pulse" />
              </div>

              <motion.p 
                key={loadingText}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-sans text-brand-on-surface-variant font-medium text-base leading-relaxed h-12"
              >
                {loadingText}
              </motion.p>
            </div>
            
            {/* Soft decorative cloud elements for loading */}
            <div className="absolute top-10 left-10 w-48 h-48 bg-brand-primary-container/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-brand-primary-container/15 rounded-full blur-3xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Shell */}
      <nav id="top-nav" className="fixed top-0 w-full z-50 bg-[#fff8f6]/50 backdrop-blur-xl border-b border-brand-primary-container/20 shadow-sm flex justify-between items-center px-6 md:px-12 py-4 transition-all duration-300">
        <span className="font-serif text-xl md:text-2xl italic font-bold text-brand-primary tracking-tight">
          Anggita Rindiyantana Assasaudia, S.T
        </span>
        <div className="flex items-center gap-3">
        </div>
      </nav>

      {/* Main Container */}
      <main className="pt-24 pb-20">
        
        {/* Hero Section */}
        <section id="sec-hero" className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 md:px-12 text-center overflow-hidden">
          {/* Floating background blobs */}
          <div className="absolute top-1/4 left-10 md:left-24 w-40 h-40 bg-brand-primary-container/15 rounded-full float-heart-slow blur-2xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-8 md:right-32 w-52 h-52 bg-[#f8d7da]/20 rounded-full float-heart blur-3xl pointer-events-none" />

          {/* Sparkle and flower shapes */}

          <div className="relative z-10 max-w-3xl space-y-8 px-2 md:px-6">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary-container/20 border border-brand-primary/15 text-brand-primary font-sans text-xs uppercase tracking-widest font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              UNOFFICIAL
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="font-serif text-4xl md:text-6xl font-bold text-brand-on-surface leading-tight"
            >
              Congratulations..<span className="italic text-brand-primary underline decoration-brand-primary-container/80 decoration-wavy underline-offset-4"></span>🤍
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="font-sans text-brand-on-surface-variant font-medium text-base md:text-lg max-w-xl mx-auto leading-relaxed"
            >
              yeayyy akhirnyaa.. selamatt yaa cantikkkk.. sebelum ku ucapin selamat lebih jauh, pencet love putih tunggu sampai audionya bunyi...
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="pt-6"
            >
              <div className="relative inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-brand-primary-container to-[#fdd5d9] text-brand-on-primary-container font-bold rounded-lg text-base md:text-lg shadow-lg">
                <span>Anggita Rindiyantana Assasaudia, S.T</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Photo Section with slanting polaroid framework */}
        <section className="py-16 px-4 md:px-12 bg-white/30 border-y border-brand-primary-container/10">
          <div className="relative max-w-md mx-auto">

            {/* Bottom Floating Heart Badge */}
            <button
              type="button"
              onClick={handleNavHeartClick}
              className="absolute -bottom-4 -right-2 bg-brand-primary-container p-3 rounded-full shadow-lg z-20 border-2 border-white scale-100 hover:scale-110 cursor-pointer active:scale-95 transition-all"
            >
              <Heart className="w-6 h-6 text-white" fill="currentColor" />
            </button>

            {/* Slanted polaroid card frame */}
            <div className="bg-white p-5 rounded-3xl shadow-xl shadow-brand-primary-container/15 transform rotate-1 hover:rotate-0 transition-transform duration-500 border border-brand-primary-container/10 select-none">
              <div 
                className="aspect-[4/5] rounded-2xl overflow-hidden mb-6 bg-brand-surface-low relative group cursor-zoom-in"
                onClick={() => setSelectedPhoto({
                  url: "/sempro2.jpg",
                  title: "Proud of You..",
                  year: "2026"
                })}
              >
                <img 
                  alt="A soft-focus, cinematic portrait of a joyous female graduate in academic regalia, smiling radiantly" 
                  className="w-full h-full object-cover transform duration-500 group-hover:scale-105" 
                  src="/sempro2.jpg"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-brand-primary/5 group-hover:bg-transparent duration-300" />
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] tracking-wider uppercase font-semibold">
                  Click to Expand
                </div>
              </div>
              <p className="font-serif font-medium text-brand-on-surface-variant text-center italic text-base md:text-lg leading-relaxed px-2">
                "seni indah dengan segala bentuk kesederhanaannya, proud of you"
              </p>
            </div>
          </div>
        </section>

        {/* Vertical Timeline of Journey */}
        <section id="sec-journey" className="py-24 bg-brand-surface-low/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary-container/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-0 w-80 h-80 bg-brand-secondary-container/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-brand-on-surface">Your Beautiful Journey</h2>
              <div className="w-16 h-1 bg-brand-primary-container mx-auto mt-4 rounded-full" />
              <p className="text-brand-on-surface-variant font-sans text-sm md:text-base mt-3">2022 - 2026</p>
            </div>

            <div className="relative">
              {/* Central Line */}
              <div className="absolute left-1/2 -translate-x-1/2 h-full w-[2px] bg-gradient-to-b from-brand-primary-container via-brand-primary to-brand-primary-container top-2" />

              <div className="space-y-16">
                {timelineData.map((item, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <div key={item.year} className={`flex flex-col md:flex-row items-center gap-6 md:gap-12 relative ${isEven ? "" : "md:flex-row-reverse"}`}>
                      
                      {/* Left Block: Content Box */}
                      <div className="flex-1 w-full md:w-1/2">
                        <motion.div 
                          whileHover={{ y: -4, transition: { duration: 0.2 } }}
                          className="bg-white p-6 rounded-2xl shadow-md border border-brand-primary-container/15 group relative overflow-hidden"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-serif font-bold text-xl md:text-2xl text-brand-primary">{item.year}</span>
                          </div>
                          
                          <h3 className="font-serif font-bold text-lg md:text-xl text-brand-on-surface mb-2">{item.title}</h3>
                          <p className="text-brand-on-surface-variant font-sans text-sm leading-relaxed mb-4">{item.desc}</p>
                          
                          {/* Image Render Section */}
                          {item.mainImg && (
                            <div 
                              className="aspect-[16/10] rounded-xl overflow-hidden border border-brand-primary-container/20 cursor-zoom-in relative group"
                              onClick={() => setSelectedPhoto({ url: item.mainImg || "", title: item.title, year: item.year })}
                            >
                              <img 
                                src={item.mainImg} 
                                alt={item.alt} 
                                className="w-full h-full object-cover transform duration-500 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-brand-primary/5 group-hover:bg-transparent duration-300" />
                              <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[9px] text-white">Zoom</div>
                            </div>
                          )}

                          {/* 2025 Multi-Image Flex row */}
                          {item.images && (
                            <div className="flex gap-2.5 overflow-x-auto scrollbar-none py-1">
                              {item.images.map((img, imgIdx) => (
                                <div 
                                  key={imgIdx} 
                                  className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden border border-brand-primary-container/30 shadow-sm cursor-zoom-in relative group"
                                  onClick={() => setSelectedPhoto({ url: img, title: `${item.title} - Aspect ${imgIdx + 1}`, year: item.year })}
                                >
                                  <img 
                                    src={img} 
                                    alt="Resilience Memory" 
                                    className="w-full h-full object-cover transform duration-500 group-hover:scale-105"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-brand-primary/5" />
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      </div>

                      {/* Middle Node Icon */}
                      <div className="relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border-2 border-brand-primary-container flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${item.year === "2026" ? "bg-brand-primary" : "bg-brand-primary-container/10"} flex items-center justify-center`}>
                          {item.icon}
                        </div>
                      </div>

                      {/* Right Empty Spacer block for Desktop matching */}
                      <div className="flex-1 hidden md:block w-1/2" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Envelope Love Letter Section */}
        <section id="sec-letter" className="py-24 px-4 md:px-12 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary-container/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-lg mx-auto">
            {/* Visual Envelope */}
            <div className={`bg-white rounded-3xl border-2 transition-all duration-700 relative overflow-hidden shadow-2xl ${
              envelopeOpen ? "border-brand-primary-container/80 ring-4 ring-brand-primary-container/20" : "border-brand-primary-container/30"
            }`}>
              
              {/* Envelope Header tab decorative flap */}
              <div className={`absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#fff2f2] to-white border-b border-brand-primary-container/20 transition-all duration-700 z-10 ${
                envelopeOpen ? "translate-y-[-100%]" : "translate-y-0"
              }`} />

              {/* Envelope content structure */}
              <div className="p-6 md:p-10 relative">
                
                {/* Physical Sealed state */}
                {!envelopeOpen ? (
                  <div className="py-12 flex flex-col items-center text-center space-y-6">
                    <div className="p-5 bg-brand-surface-low rounded-full border border-brand-primary-container shadow-md relative">
                      <Mail className="w-16 h-16 text-brand-primary animate-pulse" />
                      <div className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">
                        Sealed
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-serif text-2xl font-bold text-brand-primary">special for you</h3>
                      <p className="font-sans text-brand-on-surface-variant text-sm max-w-xs mx-auto">
                        kata yang ku rangkai, untuk keindahan tak terbatas, kamu
                      </p>
                    </div>

                    <button 
                      onClick={() => setEnvelopeOpen(true)}
                      className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                      <MailOpen className="w-4 h-4" />
                      <span>Buka Surat</span>
                    </button>
                  </div>
                ) : (
                  // Open Unfolded State with Animation
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6 text-brand-on-surface-variant text-base md:text-lg leading-relaxed text-center relative"
                  >
                    <div className="absolute -top-5 right-0">
                      <button 
                        onClick={() => setEnvelopeOpen(false)}
                        className="p-1 rounded-full text-brand-on-surface-variant/40 hover:text-brand-primary transition-colors hover:bg-gray-100"
                        title="Close letter"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex justify-center pb-2">
                      <span className="inline-flex p-3 bg-brand-primary-container/15 rounded-full border border-brand-primary-container/30">
                        <MailOpen className="w-8 h-8 text-brand-primary" />
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-2xl md:text-3xl text-brand-primary italic mb-6">Unofficial for Special Person,</h3>
                    
                    <p className="font-sans text-left text-sm md:text-base text-brand-on-surface-variant leading-relaxed mb-4">
                      Haii cantikkk, Selamat... Congratss.. bangga bangett akhirnya kamu sampai dititik ini, setelah semua yang terlewat, naik turunnya, susah senangnya, jatuh bangunnya, cape dan lelahnya, akhirnya satu gelar itu tersemat di akhir nama cantikmu
                    </p>
                    <p className="font-serif font-bold italic text-brand-primary pt-4 text-2xl leading-snug">
                      Anggita Assasaudia Rindiyantana, S.T
                    </p>
                    <p className="font-sans text-left text-sm md:text-base text-brand-on-surface-variant leading-relaxed mb-4">
                      Jangan lupa berterimakasih pada diri sendiri, yang sudah bertahan sejauh ini, meski yang terjadi seringkali tak sama dengan kehendak hati, kamu layak merayakan ini semua
                    </p>

                    <p className="font-sans text-left text-sm md:text-base text-brand-on-surface-variant leading-relaxed mb-4">
                      setiap moment yg kulewati, slalu ku selipkan tentangmu, di meeting keduaku dngn client, ada sesi aku curhat ke bapaknya, dan bapaknya pesen, sekarang waktunya mas mengumpulkan banyak cerita, untuk pertemuan berikutnya yang lebih bermakna, dan aku lakuin itu sekarang, ku buat semua cerita itu, untuk ku bagikan denganmu, nanti, aku sangat menunggu moment itu
                    </p>

                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Swipeable Stacked Announcement Card Section */}
        <section id="sec-encouragement" className="py-20 bg-brand-surface-high px-4 md:px-12 overflow-hidden relative">
          <div className="max-w-md mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-center font-bold mb-12">About You!</h2>
            
            {/* Cards Stage Container */}
            <div className="relative h-[420px] max-w-[340px] mx-auto flex items-center justify-center">
              
              <AnimatePresence mode="popLayout">
                {encouragementCards.map((card, idx) => {
                  // Only render the active top card and the one right below it for absolute gorgeous layout depth
                  const isActive = idx === activeCardIndex;
                  const isNext = idx === (activeCardIndex + 1) % encouragementCards.length;
                  
                  if (!isActive && !isNext) return null;

                  return (
                    <motion.div
                      key={card.title}
                      style={{ zIndex: isActive ? 30 : 20 }}
                      initial={isNext ? { scale: 0.95, y: 12, rotate: 2, opacity: 0.8 } : false}
                      animate={
                        isActive 
                          ? { scale: 1, y: 0, rotate: -2, opacity: 1 } 
                          : { scale: 0.94, y: 14, rotate: 4, opacity: 0.85 }
                      }
                      exit={{ 
                        x: 280, 
                        rotate: 15, 
                        opacity: 0, 
                        scale: 0.9,
                        transition: { duration: 0.4, ease: "easeInOut" } 
                      }}
                      className="absolute inset-0 bg-white rounded-3xl p-6 shadow-xl border border-brand-primary-container/35 flex flex-col justify-between select-none"
                    >
                      {/* Card Head */}
                      <div className="text-center">
                        <div className="flex justify-center mb-4">
                          <span className="p-3 bg-brand-primary-container/10 rounded-full">
                            {card.icon}
                          </span>
                        </div>
                        <span className="text-[10px] md:text-xs uppercase tracking-widest text-brand-secondary font-bold">
                          {card.subtitle}
                        </span>
                        <h3 className="font-serif font-bold text-xl md:text-2xl text-brand-on-surface mt-1">
                          {card.title}
                        </h3>
                      </div>

                      {/* Card Body */}
                      <p className="font-sans text-xs md:text-sm text-brand-on-surface-variant leading-relaxed text-center my-3 max-h-36 overflow-y-auto scrollbar-none">
                        {card.desc}
                      </p>

                      {/* Images Carousel Row */}
                      <div className="flex justify-center gap-2 overflow-hidden pb-1">
                        {card.images.map((img, imgIdx) => (
                          <div 
                            key={imgIdx} 
                            className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-xl overflow-hidden border border-brand-primary-container/30 cursor-zoom-in group relative"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPhoto({ url: img, title: `${card.title}` });
                            }}
                          >
                            <img src={img} alt="Card Preview" className="w-full h-full object-cover transform duration-300 group-hover:scale-110" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>

                      {/* Swipe Trigger overlay button inside card footer */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextCard();
                        }}
                        className="w-full py-2 border border-brand-primary-container/40 hover:bg-brand-primary-container/10 text-brand-primary-container text-xs font-bold rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        <span>Selanjutnya</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Quick Interactive tags */}
            <div className="text-center mt-12">
              <div className="inline-flex gap-2 p-2 bg-white/60 backdrop-blur-md rounded-full shadow-inner border border-brand-primary-container/20">
                <button 
                  onClick={() => {
                    const array = ["💖", "💗", "🎉", "🔥"];
                    array.forEach((sym, i) => {
                      setTimeout(() => {
                        const newHeart: FloatingHeart = {
                          id: Date.now() + Math.random(),
                          x: 20 + i * 15 + Math.random() * 10,
                          y: 100,
                          size: 24,
                          delay: 0,
                          duration: 2.5
                        };
                        setFloatingHearts((prev) => [...prev, newHeart]);
                      }, i * 100);
                    });
                  }}
                  className="px-4 py-2 bg-brand-primary text-white rounded-full font-sans text-xs uppercase tracking-wider font-bold transition-all transform hover:scale-105 active:scale-95"
                >
                  Smart
                </button>
                <button 
                  onClick={() => {
                    const array = ["💡", "⭐", "🎓", "🎓"];
                    array.forEach((sym, i) => {
                      setTimeout(() => {
                        const newHeart: FloatingHeart = {
                          id: Date.now() + Math.random(),
                          x: 30 + i * 12 + Math.random() * 10,
                          y: 100,
                          size: 26,
                          delay: 0,
                          duration: 3
                        };
                        setFloatingHearts((prev) => [...prev, newHeart]);
                      }, i * 120);
                    });
                  }}
                  className="px-4 py-2 bg-brand-primary-container text-brand-on-primary-container rounded-full font-sans text-xs uppercase tracking-wider font-bold transition-all transform hover:scale-105 active:scale-95"
                >
                  Capable
                </button>
                <button 
                  onClick={() => {
                    const array = ["🦁", "✨", "🌟", "🎇"];
                    array.forEach((sym, i) => {
                      setTimeout(() => {
                        const newHeart: FloatingHeart = {
                          id: Date.now() + Math.random(),
                          x: 40 + i * 15 + Math.random() * 10,
                          y: 100,
                          size: 25,
                          delay: 0,
                          duration: 2.7
                        };
                        setFloatingHearts((prev) => [...prev, newHeart]);
                      }, i * 80);
                    });
                  }}
                  className="px-4 py-2 bg-brand-secondary text-white rounded-full font-sans text-xs uppercase tracking-wider font-bold transition-all transform hover:scale-105 active:scale-95"
                >
                  Brave
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Guestbook Wall Section */}
        <section id="sec-wall" className="py-24 max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-brand-on-surface">Congratulations Cantik..</h2>
            <div className="w-16 h-1 bg-brand-primary-container mx-auto mt-4 rounded-full" />
            <p className="text-brand-on-surface-variant font-sans text-sm md:text-base mt-3">bunga cantik, untuk manusia tercantik</p>
          </div>

          <div className="flex justify-center">
            {/* Centered Photo */}
            <div className="bg-white p-4 rounded-3xl shadow-xl shadow-brand-primary-container/15 border border-brand-primary-container/10 select-none max-w-md w-full">
              <div 
                className="aspect-[4/5] rounded-2xl overflow-hidden bg-brand-surface-low relative group cursor-zoom-in"
                onClick={() => setSelectedPhoto({
                  url: "/bunga.png",
                  title: "bunga dengan namamu",
                  year: "2026"
                })}
              >
                <img 
                  alt="Graduate portrait" 
                  className="w-full h-full object-cover transform duration-500 group-hover:scale-105" 
                  src="/bunga.png"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-brand-primary/5 group-hover:bg-transparent duration-300" />
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] tracking-wider uppercase font-semibold">
                  Click to Expand
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Celebration Section with Heart Fountain action */}
        <section id="sec-celebration" className="py-24 bg-gradient-to-b from-[#fff2f2]/40 to-brand-primary-container/30 px-4 text-center relative overflow-hidden">
          <div className="absolute top-10 left-10 text-brand-primary/10 select-none pointer-events-none float-heart">
            <Heart className="w-24 h-24" fill="currentColor"/>
          </div>
          <div className="absolute bottom-10 right-10 text-brand-primary/10 select-none pointer-events-none float-heart-slow">
            <Heart className="w-32 h-32" fill="currentColor"/>
          </div>

          <div className="space-y-8 relative z-10 max-w-xl mx-auto">
            <span className="inline-block p-4 bg-white rounded-full shadow-lg">
              <PartyPopper className="w-10 h-10 text-brand-primary animate-bounce" />
            </span>
            <h2 className="font-serif text-3.5xl md:text-5xl font-bold text-brand-on-surface">The World is Yours!</h2>
            <p className="font-sans text-brand-on-surface-variant text-base md:text-lg">sekali lagi, selamat atas pencapaianmu cantik, semoga jalan ke depan semakin dimudahkan, banyak harapan terwujudkan, dan kebahagiaan berdatangan</p>
          </div>
        </section>

      </main>

      {/* Footer Section */}
      <footer className="w-full py-16 bg-brand-surface-lowest flex flex-col items-center justify-center gap-6 px-6 border-t border-brand-primary-container/20">
        <span className="font-serif text-2xl font-bold italic text-brand-secondary tracking-tight">Your Story</span>

        <div className="text-center space-y-1.5 text-xs text-brand-on-surface-variant/60">
          <p>from me, 301.</p>
          <p className="italic opacity-80">2022-2026</p>
        </div>
      </footer>

      {/* Lightbox Modal Overlay */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-4 max-w-xl w-full shadow-2xl overflow-hidden relative border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 bg-black/65 hover:bg-black p-2 rounded-full text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
                <img 
                  src={selectedPhoto.url} 
                  alt={selectedPhoto.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="pt-4 px-2 space-y-1">
                <div className="flex justify-between items-center text-xs text-brand-secondary font-bold uppercase tracking-wider">
                  <span>Year {selectedPhoto.year}</span>
                  <span className="text-[10px] bg-brand-primary-container/20 text-brand-on-primary-container px-2.5 py-0.5 rounded-full font-bold">Zoom Mode</span>
                </div>
                <h4 className="font-serif font-bold text-lg text-brand-on-surface">{selectedPhoto.title}</h4>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Confetti overlay indicator */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[99] flex items-center justify-center bg-transparent"
          >
            <div className="bg-white/85 shadow-2xl border border-brand-primary-container px-8 py-5 rounded-2xl flex items-center gap-3">
              <PartyPopper className="w-6 h-6 text-brand-primary animate-bounce" />
              <span className="font-sans text-brand-primary font-bold text-sm">Successfully sent notes! Check out the Wall 💖</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
