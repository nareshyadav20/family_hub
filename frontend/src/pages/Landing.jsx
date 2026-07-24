import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Image as ImageIcon, Users, Calendar, MessageSquare, Heart, Phone, Mail, ArrowRight, MessageCircle, Eye, EyeOff, Lock, User, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import '../landing.css';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1`;

export default function Home() {
  const navigate = useNavigate();
  const timelineRef = useRef(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [galleryTab, setGalleryTab] = useState('All');

  const scrollTimeline = (direction) => {
    if (timelineRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      timelineRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const allGalleryItems = [
    { id: 1, category: 'Family', src: "https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=600&q=80", title: "Family Reunion", span: "md:col-span-1 md:row-span-2 min-h-[240px]" },
    { id: 2, category: 'Events', src: "https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&w=800&q=80", title: "Birthday Party", span: "md:col-span-2 h-[220px]" },
    { id: 3, category: 'Trips', src: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=500&q=80", title: "Beach Vacation", span: "h-[220px]" },
    { id: 4, category: 'Celebrations', src: "https://images.unsplash.com/photo-1540479859555-17af45c78602?auto=format&fit=crop&w=500&q=80", title: "Anniversary", span: "h-[220px]" },
    { id: 5, category: 'Family', src: "https://images.unsplash.com/photo-1574027542338-98e75acfd385?auto=format&fit=crop&w=500&q=80", title: "Sunday Dinner", span: "h-[220px]" },
    { id: 6, category: 'Events', src: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=500&q=80", title: "Holiday Celebration", span: "h-[220px]" },
  ];

  const filteredGallery = galleryTab === 'All' 
    ? allGalleryItems 
    : allGalleryItems.filter(item => item.category === galleryTab);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, loginForm);
      if (res.data.requirePasswordChange) {
        localStorage.setItem('tempToken', res.data.token);
        navigate('/login');
      } else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        const role = res.data.user?.role?.toUpperCase();
        if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'FAMILY_ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/member/dashboard');
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Family gathering photos for hero mosaic
  const familyPhotos = [
    "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1540479859555-17af45c78602?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1574027542338-98e75acfd385?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1529156069898-49953eb1b5e4?w=600&h=600&fit=crop",
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-[#111827] font-sans relative overflow-x-hidden selection:bg-purple-200">

      {/* ─── HEADER ─── */}
      <header className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-5 flex justify-between items-center relative z-30">
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img src="/logo.png" alt="FamilyHub" className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg" />
          <span className="font-black text-[19px] sm:text-[22px] text-[#2E1E6B] tracking-tight">Family<span className="text-[#7C5CFC]">Hub</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-semibold text-[14px] text-gray-500">
          <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-[#7C5CFC] transition-colors">Features</a>
          <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-[#7C5CFC] transition-colors">About</a>
          <a href="#gallery" onClick={(e) => scrollToSection(e, 'gallery')} className="hover:text-[#7C5CFC] transition-colors">Gallery</a>
          <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="hover:text-[#7C5CFC] transition-colors">Contact</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login" className="text-[#3C1053] hover:text-[#7C5CFC] font-bold text-[13px] sm:text-[14px] px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-[12px] border border-[#E9E5F8] hover:bg-purple-50 transition-all">
            Login
          </Link>
          <a href="#login-section" onClick={(e) => scrollToSection(e, 'login-section')} className="bg-[#7C5CFC] text-white px-4 sm:px-7 py-2 sm:py-2.5 rounded-[12px] text-[13px] sm:text-[14px] font-bold hover:bg-[#6B49F6] shadow-md shadow-purple-500/20 transition-all hover:-translate-y-0.5 whitespace-nowrap">
            Get Started
          </a>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-4 sm:pt-8 pb-12 sm:pb-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">

        {/* Left: Text */}
        <div className="w-full lg:w-[48%] space-y-4 sm:space-y-6 z-10 text-left">
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 text-[#7C5CFC] px-3.5 py-1.5 rounded-full text-[12px] sm:text-[13px] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#7C5CFC] animate-pulse"></span>
            Your Family, All In One Place
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-black text-[#1F2430] leading-[1.1] tracking-tight">
            Every Family<br/>Has A Story.
          </h1>
          <h2 className="text-xl sm:text-2xl lg:text-[32px] font-semibold text-gray-400 leading-tight">
            Let's Preserve Yours.
          </h2>
          <p className="text-gray-500 text-[14px] sm:text-[16px] font-medium max-w-[400px] leading-relaxed">
            Connect. Celebrate. Cherish.<br/>All in one beautiful space.
          </p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
            <a href="#login-section" onClick={(e) => scrollToSection(e, 'login-section')} className="bg-[#7C5CFC] text-white px-7 sm:px-8 py-3.5 sm:py-4 rounded-[16px] text-[14px] sm:text-[15px] font-bold hover:bg-[#6B49F6] shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-1">
              Start Free
            </a>
            <button className="flex items-center gap-3 text-[#1F2430] font-bold text-[14px] sm:text-[15px] hover:text-[#7C5CFC] transition-colors group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-purple-100 flex items-center justify-center text-[#7C5CFC] group-hover:scale-110 transition-transform shadow-sm">
                <Play size={16} fill="currentColor" className="ml-1" />
              </div>
              Watch Demo
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4 pt-2 sm:pt-4">
            <div className="flex -space-x-3">
              {familyPhotos.slice(0, 4).map((src, i) => (
                <img key={i} src={src} alt="" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white object-cover shadow-sm" />
              ))}
            </div>
            <div>
              <div className="flex text-amber-400 text-xs sm:text-sm">{'★★★★★'}</div>
              <p className="text-gray-500 text-[11px] sm:text-[12px] font-semibold">Trusted by 500+ families</p>
            </div>
          </div>
        </div>

        {/* Right: Family Tree Visual (With Gentle Sway, Glow & Floating Badges) */}
        <div className="w-full lg:w-[52%] relative flex items-center justify-center">
          {/* Animated Ambient Glow Backdrop behind the tree card */}
          <div className="absolute -inset-2 bg-gradient-to-tr from-purple-400/25 via-pink-300/20 to-amber-200/25 rounded-[38px] blur-xl animate-pulse-glow z-0"></div>

          <div className="relative w-full h-[360px] sm:h-[460px] lg:h-[520px] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(124,92,252,0.14)] border border-purple-100 group bg-white flex items-center justify-center p-2 sm:p-3 z-10 hover:border-purple-300 hover:shadow-[0_25px_60px_rgba(124,92,252,0.22)] transition-all duration-500">
            {/* Animated Floating Tree Image */}
            <img
              src="/hero-tree.jpg"
              alt="Family Tree"
              className="w-full h-full object-contain rounded-[20px] sm:rounded-[24px] block animate-tree-sway transition-transform duration-700 group-hover:scale-[1.03]"
            />

            {/* Glowing Sparkle Dots Overlaying Tree Branches */}
            <div className="absolute top-[25%] left-[22%] w-2.5 h-2.5 rounded-full bg-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-sparkle-1 pointer-events-none z-20"></div>
            <div className="absolute top-[18%] right-[28%] w-3 h-3 rounded-full bg-purple-400/80 shadow-[0_0_12px_rgba(168,85,247,0.9)] animate-sparkle-2 pointer-events-none z-20"></div>
            <div className="absolute bottom-[35%] left-[32%] w-2 h-2 rounded-full bg-rose-400/80 shadow-[0_0_8px_rgba(251,113,133,0.9)] animate-sparkle-3 pointer-events-none z-20"></div>
            <div className="absolute bottom-[38%] right-[24%] w-2.5 h-2.5 rounded-full bg-amber-300/80 shadow-[0_0_10px_rgba(252,211,77,0.9)] animate-sparkle-1 pointer-events-none z-20"></div>

            {/* Floating badge top-right */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-[#7C5CFC] text-white rounded-xl sm:rounded-2xl shadow-lg shadow-purple-500/25 px-3 py-2 sm:px-4 sm:py-2.5 z-20 border border-purple-400/30 animate-float-badge-top">
              <p className="font-black text-[12px] sm:text-[13px]">10,000+</p>
              <p className="text-purple-200 text-[10px] sm:text-[11px] font-medium">Memories saved</p>
            </div>

            {/* Floating badge bottom-left */}
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg px-3 py-2 sm:px-4 sm:py-2.5 flex items-center gap-2.5 sm:gap-3 border border-gray-200 z-20 animate-float-badge-bottom">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0 animate-pulse">
                <Heart size={14} className="text-[#7C5CFC]" fill="#7C5CFC" />
              </div>
              <div>
                <p className="font-black text-[#1F2430] text-[12px] sm:text-[13px]">500+ Families</p>
                <p className="text-gray-400 text-[10px] sm:text-[11px] font-medium">Connected globally</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURE CARDS ─── */}
      <section id="features" className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { icon: <ImageIcon size={22} className="text-[#7C5CFC]" />, title: 'Share Memories', desc: 'Securely store and organize your precious moments in one beautiful place.' },
            { icon: <Users size={22} className="text-[#7C5CFC]" />, title: 'Family Tree', desc: 'Build your tree and explore your family connections visually and intuitively.' },
            { icon: <Calendar size={22} className="text-[#7C5CFC]" />, title: 'Events', desc: 'Celebrate birthdays and family milestones together without ever missing a date.' },
            { icon: <MessageSquare size={22} className="text-[#7C5CFC]" />, title: 'Private Chat', desc: 'Chat privately with your family members in a secure and dedicated hub.' },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-[24px] sm:rounded-[28px] p-6 sm:p-7 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-gray-100 hover:border-[#7C5CFC] hover:shadow-[0_0_0_2px_rgba(124,92,252,0.25),0_8px_30px_rgba(124,92,252,0.15)] hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] bg-gray-50 border border-gray-100 flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-purple-50 group-hover:border-purple-200 transition-all duration-300">
                {card.icon}
              </div>
              <h3 className="text-[16px] font-bold text-[#1F2430] mb-2">{card.title}</h3>
              <p className="text-gray-400 text-[13px] leading-relaxed font-medium">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TIMELINE (With < > scroll control buttons & scrollbar hidden) ─── */}
      <section id="timeline" className="w-full bg-[#FAF8FF] py-12 sm:py-20 border-y border-[#E9E5F8]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="w-full lg:w-[35%] text-left">
            <h2 className="text-3xl sm:text-4xl font-black text-[#1F2430] leading-tight mb-3 sm:mb-4 tracking-tight">
              Relive Moments<br/>Through Time
            </h2>
            <p className="text-gray-500 font-medium mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
              Your family's journey beautifully organised in an interactive timeline.
            </p>
            <div className="flex items-center gap-4">
              <button className="bg-[#7C5CFC] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-[14px] text-[14px] sm:text-[15px] font-bold hover:bg-[#6B49F6] shadow-md shadow-purple-500/20 transition-all hover:-translate-y-0.5">
                Explore Timeline
              </button>

              {/* < > Left / Right Scroll Buttons (VISIBLE ONLY ON MOBILE & TABLET, HIDDEN ON WEB DESKTOP) */}
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={() => scrollTimeline('left')}
                  className="w-10 h-10 rounded-full bg-white border border-purple-200 text-[#7C5CFC] shadow-sm hover:bg-[#7C5CFC] hover:text-white transition-all flex items-center justify-center cursor-pointer"
                  title="Scroll Left"
                  aria-label="Scroll Left"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scrollTimeline('right')}
                  className="w-10 h-10 rounded-full bg-white border border-purple-200 text-[#7C5CFC] shadow-sm hover:bg-[#7C5CFC] hover:text-white transition-all flex items-center justify-center cursor-pointer"
                  title="Scroll Right"
                  aria-label="Scroll Right"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Timeline Visual (Hidden scrollbars, items locked in perfect straight line) */}
          <div
            ref={timelineRef}
            className="w-full lg:w-[65%] relative overflow-x-auto pb-4 pt-2 no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="min-w-[620px] relative px-2 sm:px-4 pt-4 pb-4">

              {/* Horizontal Connecting Line perfectly centered behind dots */}
              <div className="absolute top-[144px] left-[35px] right-[35px] h-[3px] bg-gradient-to-r from-purple-200 via-[#7C5CFC] to-purple-200 rounded-full z-0"></div>

              {/* Timeline Items (Strictly locked to a straight line) */}
              <div className="flex justify-between items-start relative z-10">
                {[
                  { year: 2018, title: "Grand Reunion", src: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=300&q=80" },
                  { year: 2019, title: "Summer Trip", src: "https://images.unsplash.com/photo-1542037104857-ffbb0b9152fb?auto=format&fit=crop&w=300&q=80" },
                  { year: 2020, title: "Family House", src: "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&w=300&q=80" },
                  { year: 2021, title: "Celebration", src: "https://images.unsplash.com/photo-1581952976147-5a2d15560349?auto=format&fit=crop&w=300&q=80" },
                  { year: 2022, title: "Holiday Gathering", src: "https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=300&q=80" },
                  { year: 2023, title: "New Generation", src: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=300&q=80" },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center group cursor-pointer w-20 sm:w-24 shrink-0">
                    {/* Fixed Height Photo Card */}
                    <div className="w-18 h-22 sm:w-20 sm:h-24 rounded-[16px] sm:rounded-[18px] overflow-hidden border-3 sm:border-4 border-white shadow-[0_8px_20px_rgba(124,92,252,0.18)] group-hover:-translate-y-2 group-hover:border-[#7C5CFC] transition-all duration-300 bg-purple-50 shrink-0">
                      <img
                        src={item.src}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 block"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=300&q=80";
                        }}
                      />
                    </div>

                    {/* Stem line linking photo to dot */}
                    <div className="w-0.5 h-5 sm:h-6 bg-gradient-to-b from-purple-300 to-[#7C5CFC] my-1 shrink-0"></div>

                    {/* Dot on line */}
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#7C5CFC] border-2 border-white shadow-[0_0_10px_rgba(124,92,252,0.6)] group-hover:scale-125 transition-transform duration-300 shrink-0"></div>

                    {/* Year Label cleanly below dot */}
                    <span className="mt-2.5 sm:mt-3 font-extrabold text-[13px] sm:text-[14px] text-gray-600 group-hover:text-[#7C5CFC] transition-colors tracking-tight shrink-0">
                      {item.year}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ABOUT US SECTION (NEW DEDICATED ABOUT SECTION) ─── */}
      <section id="about" className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-24 border-b border-[#E9E5F8]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left: About Content */}
          <div className="space-y-5 text-left">
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 text-[#7C5CFC] px-4 py-1.5 rounded-full text-xs font-bold">
              <Heart size={14} fill="#7C5CFC" />
              About FamilyHub
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1F2430] leading-tight tracking-tight">
              Preserving Family Legacies Across Generations.
            </h2>
            <p className="text-gray-500 font-medium text-base sm:text-lg leading-relaxed">
              FamilyHub was created with a single core belief: every family has an extraordinary story that deserves to be remembered, celebrated, and passed down.
            </p>
            <p className="text-gray-400 font-medium text-sm sm:text-base leading-relaxed">
              Our platform brings families together from around the globe to build interactive family trees, archive treasured photographs, coordinate events, and chat privately in a secure space.
            </p>

            {/* Stats / Highlights */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4">
                <p className="text-2xl sm:text-3xl font-black text-[#7C5CFC]">100%</p>
                <p className="text-xs font-bold text-gray-600 mt-1">Private & Encrypted</p>
              </div>
              <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4">
                <p className="text-2xl sm:text-3xl font-black text-[#7C5CFC]">500+</p>
                <p className="text-xs font-bold text-gray-600 mt-1">Global Families</p>
              </div>
            </div>
          </div>

          {/* Right: Feature Highlights Card */}
          <div className="relative">
            <div className="bg-gradient-to-br from-[#FAF8FF] to-purple-50/80 rounded-[32px] p-8 sm:p-10 border border-purple-100 shadow-xl shadow-purple-500/5 relative overflow-hidden text-left">
              <div className="w-14 h-14 rounded-2xl bg-[#7C5CFC] text-white flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                <Users size={28} />
              </div>
              <h3 className="text-2xl font-bold text-[#1F2430] mb-3">Our Mission</h3>
              <p className="text-gray-500 font-medium text-sm sm:text-base leading-relaxed mb-6">
                "To bridge generational distance and ensure no family memory, photo, or story is ever lost to time."
              </p>

              <div className="space-y-3 pt-4 border-t border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">✓</div>
                  <span className="text-sm font-semibold text-gray-700">Multi-generational family tree mapping</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">✓</div>
                  <span className="text-sm font-semibold text-gray-700">Real-time memory & event sharing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">✓</div>
                  <span className="text-sm font-semibold text-gray-700">Strict admin-controlled privacy settings</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── GALLERY (With Category Filters & Mobile Responsive Grid) ─── */}
      <section id="gallery" className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1F2430] tracking-tight">Beautiful Memories Gallery</h2>
            <p className="text-gray-400 text-xs sm:text-sm font-semibold mt-1">Filter by category to explore family moments</p>
          </div>
          <button
            onClick={() => setGalleryTab('All')}
            className="bg-white border border-gray-200 text-gray-600 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm hover:bg-gray-50 transition-all shadow-sm"
          >
            View All ({allGalleryItems.length})
          </button>
        </div>

        {/* Working Category Filter Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          {['All', 'Family', 'Events', 'Trips', 'Celebrations'].map((tag) => (
            <button
              key={tag}
              onClick={() => setGalleryTab(tag)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all border cursor-pointer ${
                galleryTab === tag
                  ? 'bg-[#7C5CFC] text-white border-[#7C5CFC] shadow-md shadow-purple-500/25 scale-105'
                  : 'bg-white border-purple-100 text-gray-600 hover:bg-purple-50 hover:border-purple-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Dynamic Gallery Grid (1 col on small phones, 2 on tablet, 3 on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 min-h-[260px]">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-[20px] sm:rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#7C5CFC]/40 transition-all duration-300 h-[220px] sm:h-[240px] bg-purple-50 cursor-pointer"
            >
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=600&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 sm:p-5">
                <div>
                  <span className="inline-block bg-[#7C5CFC] text-white text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full mb-1">{item.category}</span>
                  <h4 className="text-white font-bold text-[15px] sm:text-[16px]">{item.title}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── LOGIN SECTION (Mobile responsive clean style) ─── */}
      <section id="login-section" className="w-full bg-[#FAF8FF] py-12 sm:py-24 border-t border-[#E9E5F8]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">

          {/* Left Panel — Clean white background */}
          <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 p-6 sm:p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center gap-2.5 sm:gap-3 mb-6 sm:mb-8">
                <img src="/logo.png" alt="FamilyHub" className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl" />
                <span className="font-black text-[20px] sm:text-[22px] text-[#2E1E6B] tracking-tight">Family<span className="text-[#7C5CFC]">Hub</span></span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1F2430] leading-tight mb-3 sm:mb-4">
                Welcome back to<br/>your family.
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed text-[14px] sm:text-[15px] max-w-sm">
                Sign in to reconnect with your loved ones, browse memories, and stay up to date with family events.
              </p>
            </div>

            {/* Features list */}
            <div className="space-y-3.5 sm:space-y-4 mt-6 sm:mt-8">
              {[
                { icon: <Heart size={16} fill="#7C5CFC" className="text-[#7C5CFC]" />, text: 'Cherish every memory together' },
                { icon: <Users size={16} className="text-[#7C5CFC]" />, text: 'Your family tree, beautifully mapped' },
                { icon: <Shield size={16} className="text-[#7C5CFC]" />, text: 'Private & secure family space' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">{item.icon}</div>
                  <p className="text-gray-700 font-bold text-[13px] sm:text-[14px]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel — Login Form */}
          <div className="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 p-8 lg:p-10 w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-[26px] font-black text-[#1F2430] tracking-tight mb-1.5">Welcome back</h3>
              <p className="text-gray-400 text-sm font-semibold">Enter your details to sign in.</p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-red-700 text-xs font-bold">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleLogin} autoComplete="off" className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F2430] ml-1">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={loginForm.email}
                    onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] text-sm text-[#1F2430] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 focus:border-[#7C5CFC] transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F2430] ml-1 flex justify-between">
                  Password
                  <Link to="/login" className="text-[#7C5CFC] hover:text-[#6B49F6] transition-colors font-bold">Forgot?</Link>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] text-sm text-[#1F2430] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 focus:border-[#7C5CFC] transition-all font-semibold"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7C5CFC] transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 bg-[#7C5CFC] hover:bg-[#6B49F6] text-white font-bold text-[15px] rounded-xl shadow-md shadow-purple-500/30 transition-all outline-none disabled:opacity-70 hover:-translate-y-0.5"
              >
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>

              <div className="text-center pt-2">
                <span className="text-[13px] font-semibold text-gray-400">Don't have an account? </span>
                <Link to="/login" className="text-[13px] font-bold text-[#7C5CFC] hover:text-[#6B49F6] transition-colors">Register here</Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ─── CONTACT / FOOTER (Contact details arranged HORIZONTALLY) ─── */}
      <footer id="contact" className="w-full bg-white border-t border-gray-100 pt-16 pb-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-10">

          {/* Top Row: Brand & Horizontal Contact Info Cards */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-10 border-b border-gray-100">
            
            {/* Brand Info */}
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="FamilyHub" className="w-9 h-9 object-contain rounded-xl" />
                <span className="font-black text-[22px] text-[#2E1E6B]">Family<span className="text-[#7C5CFC]">Hub</span></span>
              </div>
              <p className="text-gray-400 text-sm max-w-sm leading-relaxed font-medium">
                Preserving family stories and memories for generations to come.
              </p>
            </div>

            {/* Horizontal Contact Info Cards */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full lg:w-auto">
              {/* Contact 1 */}
              <div className="flex items-center gap-3 bg-[#FAF8FF] border border-[#E9E5F8] px-5 py-3 rounded-2xl hover:border-[#7C5CFC] transition-all">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#7C5CFC] shrink-0">
                  <MessageCircle size={18} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Support</p>
                  <p className="text-sm font-extrabold text-[#1F2430]">24/7 Live Chat</p>
                </div>
              </div>

              {/* Contact 2 */}
              <div className="flex items-center gap-3 bg-[#FAF8FF] border border-[#E9E5F8] px-5 py-3 rounded-2xl hover:border-[#7C5CFC] transition-all">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Phone size={18} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-extrabold text-[#1F2430]">+91 97875 43210</p>
                </div>
              </div>

              {/* Contact 3 */}
              <div className="flex items-center gap-3 bg-[#FAF8FF] border border-[#E9E5F8] px-5 py-3 rounded-2xl hover:border-[#7C5CFC] transition-all">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Mail size={18} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-extrabold text-[#1F2430]">support@familyhub.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Legal Links */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm font-medium text-gray-400">
            <p>© {new Date().getFullYear()} FamilyHub Systems Inc. All rights reserved.</p>
            <div className="flex gap-6 font-bold">
              <a href="#" className="hover:text-[#7C5CFC] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#7C5CFC] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#7C5CFC] transition-colors">Security</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
