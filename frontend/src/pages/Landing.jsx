import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Shield, Users, Calendar, Image as ImageIcon, FileText, Share2, Heart, Globe, ArrowRight } from 'lucide-react';
import '../landing.css';

export default function Home() {
  
  // Smooth scroll helper
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-[#111827] font-sans relative overflow-x-hidden selection:bg-blue-200">
      
      {/* 1. SUBTLE GEOMETRIC BACKGROUND */}
      <div 
        className="absolute inset-0 z-0 opacity-5 pointer-events-none" 
        style={{ 
          backgroundImage: `url('data:image/svg+xml;utf8,<svg width="40" height="69.28" viewBox="0 0 40 69.28" xmlns="http://www.w3.org/2000/svg"><path d="M20 0l20 11.55v23.1L20 46.2 0 34.65V11.55L20 0z" fill="none" stroke="%23000" stroke-width="1.5"/></svg>')`,
          backgroundSize: '80px 138.56px'
        }}
      ></div>

      {/* 3. HEADER NAV */}
      <header className="w-full max-w-[1500px] mx-auto px-6 lg:px-12 py-6 flex justify-between items-center relative z-30">
         <Link to="/" onClick={(e) => { window.scrollTo({top: 0, behavior: 'smooth'}) }} className="flex items-center gap-2 outline-none group hover:opacity-90 transition-opacity cursor-pointer">
            <div className="w-9 h-9 bg-[#1E40FF] rounded-full flex items-center justify-center relative shadow-lg shadow-blue-600/30">
               <div className="w-3 h-3 bg-[#FFD600] border-[2.5px] border-white rounded-full absolute -top-1 -left-1"></div>
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <span className="text-[24px] font-black tracking-tight text-[#111827]">Family<span className="text-[#1E40FF]">Hub</span></span>
         </Link>

         <nav className="hidden lg:flex items-center gap-10 font-bold text-[13.5px] text-gray-500 bg-white px-8 py-3 rounded-full shadow-sm border border-gray-100">
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="text-[#111827] relative hover:text-blue-700 transition-colors">
               Home
               <span className="absolute -bottom-[14px] left-0 right-0 h-[2.5px] bg-[#1E40FF] rounded-t-full"></span>
            </a>
            {[
               { name: 'About Us', id: 'about-us' },
               { name: 'Features', id: 'features' },
               { name: 'Members', id: 'members' },
               { name: 'Events', id: 'events' },
               { name: 'Contact Us', id: 'contact-us' },
            ].map(link => (
               <a key={link.name} href={`#${link.id}`} onClick={(e) => scrollToSection(e, link.id)} className="hover:text-[#111827] transition-colors cursor-pointer">{link.name}</a>
            ))}
         </nav>

         <div className="hidden lg:flex items-center gap-6">
            <Link to="/login" className="text-[#111827] font-bold text-[13px] hover:text-[#1E40FF] transition-colors bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md">
               Login to Family
            </Link>
            <a href="#contact-us" onClick={(e) => scrollToSection(e, 'contact-us')} className="bg-[#111827] text-white px-6 py-2.5 rounded-full text-[13px] font-bold hover:bg-[#1E40FF] shadow-lg shadow-gray-200 transition-colors hidden xl:block">Get Started</a>
         </div>
      </header>

      {/* 4. MAIN HERO CONTENT */}
      <div className="relative z-20 w-full max-w-[1500px] mx-auto flex flex-col lg:flex-row px-6 lg:px-12 pt-[40px] pb-10">
         
         {/* Sidebar (Left Contact Info) */}
         <aside className="hidden lg:flex w-[160px] shrink-0 flex-col pt-[30px] mr-10 cursor-default">
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 hover:border-blue-200 transition-colors">
               <div className="flex items-center gap-3 text-[#111827] mb-2 text-[#1E40FF]">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><MapPin size={16} strokeWidth={2.2} /></div>
                  <span className="font-bold text-[13px] text-gray-900">Location</span>
               </div>
               <p className="text-[11px] text-gray-500 font-medium leading-tight">Hyderabad,<br/>India</p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 hover:border-blue-200 transition-colors">
               <div className="flex items-center gap-3 text-[#111827] mb-2 text-[#1E40FF]">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><Phone size={16} strokeWidth={2.2} /></div>
                  <span className="font-bold text-[13px] text-gray-900">Phone</span>
               </div>
               <p className="text-[11px] text-gray-500 font-medium leading-tight">+91 7569383323</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
               <div className="flex items-center gap-3 text-[#111827] mb-2 text-[#1E40FF]">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><Mail size={16} strokeWidth={2.2} /></div>
                  <span className="font-bold text-[13px] text-gray-900">Email</span>
               </div>
               <p className="text-[11px] text-gray-500 font-medium leading-tight truncate w-full" title="info@familyhub.com">info@familyhub.com</p>
            </div>

         </aside>

         {/* Hero Split Layout */}
         <main className="flex-1 flex flex-col lg:flex-row gap-0 lg:gap-[60px] relative mt-4">
            
            {/* Safe Image Embed */}
            <div className="w-full lg:w-[45%] xl:w-[48%] relative mb-12 lg:mb-0 h-[380px] lg:h-[600px] overflow-visible">
               
               {/* Decorative background blocks behind image */}
               <div className="absolute top-4 -left-4 w-full h-full bg-[#1E40FF] rounded-3xl opacity-10 blur-2xl"></div>
               <div className="absolute -bottom-8 -right-8 w-[200px] h-[200px] bg-[#FFD600] rounded-full opacity-20 blur-3xl z-[-1]"></div>
               
               <img 
                  src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1600&q=100&fit=crop" 
                  alt="Happy Family" 
                  className="w-full h-full object-cover rounded-3xl shadow-2xl relative z-10 border-[6px] border-white"
               />
            </div>

            {/* Right Text Block */}
            <div className="w-full lg:w-[55%] xl:w-[52%] flex flex-col justify-center pb-8 pt-4 lg:pt-0">
               
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] tracking-wider uppercase mb-4 self-start">
                  Hey There,
               </div>
               
               <h1 className="text-[52px] md:text-[68px] lg:text-[72px] font-black leading-[1.05] tracking-tight text-[#111827] mb-[28px]">
                  Welcome to<br/>
                  Family<span className="text-[#1E40FF]">Hub</span>
               </h1>
               
               <div className="relative mb-8 inline-block w-full max-w-xl">
                  {/* Clean rounded yellow highlight box */}
                  <div className="absolute inset-0 bg-[#FFD600] rounded-xl transform -skew-x-3 -rotate-1 z-0 shadow-sm"></div>
                  <h2 className="text-[20px] lg:text-[23px] font-black text-[#111827] py-[12px] px-[20px] relative z-10">
                     Your Family. Connected Forever.
                  </h2>
               </div>
               
               <p className="text-[16px] text-gray-500 max-w-[430px] leading-[1.7] font-medium mb-[40px]">
                  A secure digital home to manage your family, cherish memories, and build a lasting legacy across generations.
               </p>

               <div className="mb-14">
                  <a href="#contact-us" onClick={(e) => scrollToSection(e, 'contact-us')} className="inline-flex items-center gap-[10px] bg-[#1E40FF] hover:bg-blue-800 text-white font-bold px-[32px] py-[16px] rounded-full text-[14px] shadow-lg shadow-blue-500/30 hover:-translate-y-1 transition-all cursor-pointer">
                     <Phone size={16} fill="currentColor" stroke="none" className="rotate-[15deg]" />
                     Schedule a Call
                  </a>
               </div>

               {/* Updates Section mapped inside the right grid */}
               <div className="w-full">
                  <div className="flex justify-between items-end mb-4 pr-4 border-b border-gray-200 pb-2">
                     <h3 className="font-bold text-[14px] text-[#111827] uppercase tracking-wide">Latest Updates</h3>
                     <a href="#events" onClick={(e) => scrollToSection(e, 'events')} className="text-[#1E40FF] font-bold text-[12px] flex items-center hover:underline group cursor-pointer">
                        View All <span className="text-[12px] ml-1 mt-[1px] group-hover:translate-x-1 transition-transform">&rarr;</span>
                     </a>
                  </div>
                  
                  {/* Swiper Layout */}
                  <div className="flex gap-[16px] overflow-x-auto pb-6 pr-1 snap-x scrollbar-hide -mx-2 px-2 pt-2">
                     
                     {/* 1. Family Tree Card */}
                     <a href="#members" onClick={(e) => scrollToSection(e, 'members')} className="snap-start shrink-0 w-[180px] bg-white rounded-2xl shadow-[0_5px_25px_rgb(0,0,0,0.06)] border border-gray-100 p-5 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                           <p className="font-bold text-[12px] text-gray-800">Family Tree</p>
                           <Share2 size={12} className="text-gray-400" />
                        </div>
                        <div className="w-full flex justify-center items-center">
                           <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-1"><Users size={14} className="text-emerald-600"/></div>
                              <div className="w-px h-3 bg-gray-200"></div>
                              <div className="w-[100px] h-px bg-gray-200"></div>
                              <div className="flex justify-between w-[110px] mt-2 relative">
                                 <div className="absolute top-[-8px] left-[13px] w-px h-2 bg-gray-200"></div>
                                 <div className="absolute top-[-8px] left-[55px] w-px h-2 bg-gray-200"></div>
                                 <div className="absolute top-[-8px] right-[13px] w-px h-2 bg-gray-200"></div>
                                 <div className="w-[26px] h-[26px] rounded-full bg-blue-100"><img src="https://i.pravatar.cc/32?img=11" className="w-full h-full rounded-full" alt="dp" /></div>
                                 <div className="w-[26px] h-[26px] rounded-full bg-rose-100"><img src="https://i.pravatar.cc/32?img=5" className="w-full h-full rounded-full" alt="dp" /></div>
                                 <div className="w-[26px] h-[26px] rounded-full bg-yellow-100"><img src="https://i.pravatar.cc/32?img=12" className="w-full h-full rounded-full" alt="dp" /></div>
                              </div>
                           </div>
                        </div>
                     </a>

                     {/* 2. Events Card */}
                     <a href="#events" onClick={(e) => scrollToSection(e, 'events')} className="snap-start shrink-0 w-[180px] bg-white rounded-2xl shadow-[0_5px_25px_rgb(0,0,0,0.06)] border border-gray-100 p-5 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                           <p className="font-bold text-[12px] text-gray-800">Events</p>
                           <Calendar size={12} className="text-gray-400" />
                        </div>
                        <div className="flex flex-col gap-3.5">
                           <div className="flex gap-[12px] items-center">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-[#1E40FF] flex justify-center items-center text-[11px] font-black shrink-0">12</div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-[11px] font-bold text-gray-800 truncate">Family Reunion</p>
                                 <p className="text-[9px] text-gray-400">12 Jun, 2026</p>
                              </div>
                           </div>
                           <div className="flex gap-[12px] items-center">
                              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex justify-center items-center text-[11px] font-black shrink-0">18</div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-[11px] font-bold text-gray-800 truncate">Birthday Party</p>
                                 <p className="text-[9px] text-gray-400">18 Jun, 2026</p>
                              </div>
                           </div>
                        </div>
                     </a>

                     {/* 3. Photo Gallery */}
                     <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="snap-start shrink-0 w-[180px] bg-white rounded-2xl shadow-[0_5px_25px_rgb(0,0,0,0.06)] border border-gray-100 p-5 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                           <p className="font-bold text-[12px] text-gray-800">Gallery</p>
                           <ImageIcon size={12} className="text-gray-400" />
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 h-[70px]">
                           {/* Clean solid color blocks instead of broken URLs */}
                           <div className="w-full h-full bg-blue-100 rounded-[4px]"></div>
                           <div className="w-full h-full bg-emerald-100 rounded-[4px]"></div>
                           <div className="w-full h-full bg-amber-100 rounded-[4px]"></div>
                           <div className="w-full h-full bg-rose-100 rounded-[4px]"></div>
                           <div className="w-full h-full bg-purple-100 rounded-[4px]"></div>
                           <div className="w-full h-full bg-cyan-100 rounded-[4px]"></div>
                           <div className="w-full h-full bg-indigo-100 rounded-[4px]"></div>
                           <div className="w-full h-full bg-orange-100 rounded-[4px]"></div>
                           <div className="w-full h-full bg-teal-100 rounded-[4px]"></div>
                        </div>
                     </a>

                  </div>
               </div>
            </div>
         </main>
      </div>

      {/* 5. FEATURE HIGHLIGHTS GRID (ID: features) */}
      <section id="features" className="w-full max-w-[1500px] mx-auto px-6 lg:px-12 pb-24 pt-12 z-20 relative scroll-mt-24">
         <div className="w-full bg-white rounded-[32px] shadow-[0_15px_60px_rgb(0,0,0,0.06)] border border-gray-100 flex overflow-x-auto scrollbar-hide divide-x divide-gray-100">
            
            <div className="px-8 py-8 shrink-0 md:flex-1 cursor-default hover:bg-slate-50 transition-colors flex flex-col justify-center gap-3 min-w-[200px] lg:min-w-0">
               <Shield className="text-yellow-400 w-7 h-7" strokeWidth={2} />
               <div>
                  <h4 className="font-bold text-[13px] text-gray-900 mb-[4px]">Secure & Private</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed max-w-[160px]">Your family data is encrypted and 100% secure.</p>
               </div>
            </div>
            
            <div className="px-8 py-8 shrink-0 md:flex-1 cursor-default hover:bg-slate-50 transition-colors flex flex-col justify-center gap-3 min-w-[200px] lg:min-w-0">
               <Users className="text-blue-600 w-7 h-7" strokeWidth={2} />
               <div>
                  <h4 className="font-bold text-[13px] text-gray-900 mb-[4px]">Family Members</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed max-w-[160px]">Manage all your family members in one place.</p>
               </div>
            </div>

            <div className="px-8 py-8 shrink-0 md:flex-1 cursor-default hover:bg-slate-50 transition-colors flex flex-col justify-center gap-3 min-w-[200px] lg:min-w-0">
               <Calendar className="text-emerald-500 w-7 h-7" strokeWidth={2} />
               <div>
                  <h4 className="font-bold text-[13px] text-gray-900 mb-[4px]">Events & Calendar</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed max-w-[160px]">Organize events and never miss important dates.</p>
               </div>
            </div>

            <div className="px-8 py-8 shrink-0 md:flex-1 cursor-default hover:bg-slate-50 transition-colors flex flex-col justify-center gap-3 min-w-[200px] lg:min-w-0">
               <ImageIcon className="text-purple-500 w-7 h-7" strokeWidth={2} />
               <div>
                  <h4 className="font-bold text-[13px] text-gray-900 mb-[4px]">Photos & Memories</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed max-w-[160px]">Store and share your beautiful moments.</p>
               </div>
            </div>
         </div>
      </section>

      <div className="w-full bg-white py-1 border-t border-gray-100">
          
          {/* 6. ABOUT US SECTION (ID: about-us) */}
          <section id="about-us" className="w-full max-w-[1300px] mx-auto px-6 lg:px-12 py-24 scroll-mt-20">
             <div className="flex flex-col lg:flex-row gap-16 items-center">
                <div className="w-full lg:w-1/2 relative group">
                   <div className="absolute -inset-4 bg-yellow-400 rounded-3xl opacity-10 blur-xl group-hover:opacity-20 transition-opacity"></div>
                   <img src="https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=800&q=80&fit=crop" alt="About Us" className="w-full h-[450px] object-cover rounded-[32px] shadow-2xl relative z-10" />
                   <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl z-20 flex items-center gap-4 border border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Globe size={24} /></div>
                      <div>
                         <h4 className="font-black text-xl text-gray-900">5+</h4>
                         <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Continents Connected</p>
                      </div>
                   </div>
                </div>
                <div className="w-full lg:w-1/2">
                   <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] tracking-wider uppercase mb-6">
                      <Heart size={14} fill="currentColor" /> Our Story
                   </div>
                   <h2 className="text-[36px] md:text-[45px] font-black leading-[1.1] text-[#111827] mb-6">
                      Bringing Generations <br/><span className="text-[#1E40FF]">Together.</span>
                   </h2>
                   <p className="text-[15px] text-gray-500 leading-[1.8] font-medium mb-10">
                      FamilyHub started as a passion project to bridge the gap between extended families spread across the globe. We believe that distance shouldn't mean disconnection. Our platform is designed specifically to help families build, share, and cherish their unified digital legacy securely.
                   </p>
                   <div className="flex gap-12">
                      <div className="border-l-4 border-blue-500 pl-4">
                         <h4 className="text-[36px] font-black text-[#111827] mb-1">10k+</h4>
                         <p className="text-[12px] text-gray-500 font-bold uppercase tracking-wider">Families</p>
                      </div>
                      <div className="border-l-4 border-[#FFD600] pl-4">
                         <h4 className="text-[36px] font-black text-[#111827] mb-1">5M+</h4>
                         <p className="text-[12px] text-gray-500 font-bold uppercase tracking-wider">Photos Shared</p>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* 7. MEMBERS MOCK SECTION (ID: members) */}
          <section id="members" className="w-full max-w-[1300px] mx-auto px-6 lg:px-12 py-24 scroll-mt-20">
             <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] tracking-wider uppercase mb-5">
                   <Users size={14} /> Global Network
                </div>
                <h2 className="text-[36px] font-black text-[#111827]">Meet the <span className="text-[#FFD600]">Members</span></h2>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: 'Arun Sharma', role: 'Grandfather', img: 'https://i.pravatar.cc/150?img=11' },
                  { name: 'Priya Mehta', role: 'Aunt', img: 'https://i.pravatar.cc/150?img=5' },
                  { name: 'Rohan Kumar', role: 'Brother', img: 'https://i.pravatar.cc/150?img=12' },
                  { name: 'Anita Desai', role: 'Sister', img: 'https://i.pravatar.cc/150?img=9' }
                ].map(member => (
                   <div key={member.name} className="bg-slate-50 p-6 rounded-[24px] shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 text-center border border-gray-100 group cursor-pointer">
                      <img src={member.img} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-5 object-cover shadow-md border-4 border-white group-hover:border-blue-100 transition-colors" />
                      <h4 className="font-bold text-gray-900 text-[16px] mb-1">{member.name}</h4>
                      <div className="inline-block px-3 py-1 bg-blue-100/50 text-blue-700 rounded-lg text-[11px] font-bold">{member.role}</div>
                   </div>
                ))}
             </div>
          </section>

          {/* 8. EVENTS SECTION (ID: events) */}
          <section id="events" className="w-full max-w-[1300px] mx-auto px-6 lg:px-12 py-24 scroll-mt-20">
             <div className="bg-[#0f172a] rounded-[40px] p-12 lg:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">
                {/* Background glow effects */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/30 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-500/10 rounded-full blur-[100px]"></div>
                
                <div className="w-full md:w-1/2 relative z-10">
                   <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/50 border border-blue-800 text-blue-300 font-bold text-[11px] tracking-wider uppercase mb-6">
                      <Calendar size={14} /> Upcoming Calendar
                   </div>
                   <h2 className="text-[36px] md:text-[45px] font-black text-white leading-[1.1] mb-6">Never Miss a <br/>Family <span className="text-[#FFD600]">Milestone.</span></h2>
                   <p className="text-gray-400 font-medium mb-10 leading-relaxed text-[15px]">Birthdays, anniversaries, reunions—keep track of everything in one beautifully organized, synchronized timeline.</p>
                   <Link to="/login" className="bg-white text-gray-900 px-6 py-3.5 rounded-xl font-bold text-[13px] hover:bg-gray-100 transition-colors inline-flex items-center gap-2 shadow-lg shadow-white/10">Explore Calendar <ArrowRight size={16} /></Link>
                </div>

                <div className="w-full md:w-1/2 relative z-10 flex flex-col gap-5">
                   {/* Mock Event Blocks */}
                   <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex gap-5 items-center hover:bg-white/15 transition-all hover:scale-[1.02] cursor-pointer shadow-xl">
                      <div className="w-16 h-16 rounded-[14px] bg-blue-500 flex flex-col items-center justify-center shrink-0">
                         <span className="text-blue-100 text-[11px] font-bold uppercase tracking-wider mb-0.5">Jun</span>
                         <span className="text-white text-[20px] font-black leading-none">12</span>
                      </div>
                      <div>
                         <h4 className="text-white font-bold text-[16px] mb-1.5">Annual Family Reunion</h4>
                         <p className="text-gray-400 text-[12px] flex items-center gap-2"><MapPin size={12}/> Grand Hotel, Mumbai</p>
                      </div>
                   </div>
                   
                   <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex gap-5 items-center hover:bg-white/15 transition-all hover:scale-[1.02] cursor-pointer shadow-xl">
                      <div className="w-16 h-16 rounded-[14px] bg-[#FFD600] flex flex-col items-center justify-center shrink-0 text-[#111827]">
                         <span className="text-yellow-800 text-[11px] font-bold uppercase tracking-wider mb-0.5">Aug</span>
                         <span className="text-[#111827] text-[20px] font-black leading-none">05</span>
                      </div>
                      <div>
                         <h4 className="text-white font-bold text-[16px] mb-1.5">Grandpa's 80th Birthday</h4>
                         <p className="text-gray-400 text-[12px] flex items-center gap-2"><MapPin size={12}/> The Heritage Villa</p>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* 9. CONTACT US SECTION (ID: contact-us) */}
          <section id="contact-us" className="w-full max-w-[1300px] mx-auto px-6 lg:px-12 py-24 pb-32 scroll-mt-20">
             <div className="text-center mb-16">
                <h2 className="text-[36px] font-black text-[#111827] mb-4">Let's Get in <span className="text-[#1E40FF]">Touch</span></h2>
                <p className="text-gray-500 font-medium">Have questions? We'd love to hear from you. Send us a message.</p>
             </div>

             <div className="max-w-2xl mx-auto bg-white rounded-[32px] p-8 lg:p-12 shadow-[0_15px_60px_rgb(0,0,0,0.08)] border border-gray-100 relative">
                 <div className="absolute -top-6 -right-6 w-24 h-24 bg-[radial-gradient(#1E40FF_2px,transparent_2px)] [background-size:12px_12px] rounded-full z-[-1] opacity-20"></div>
                 
                 <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); alert("Thanks! This is a mock form."); }}>
                    <div className="flex flex-col md:flex-row gap-6">
                       <div className="w-full">
                          <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">First Name</label>
                          <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-[14px] outline-none focus:border-blue-500 focus:bg-white transition-colors focus:ring-4 ring-blue-500/10" placeholder="John" />
                       </div>
                       <div className="w-full">
                          <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Last Name</label>
                          <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-[14px] outline-none focus:border-blue-500 focus:bg-white transition-colors focus:ring-4 ring-blue-500/10" placeholder="Doe" />
                       </div>
                    </div>
                    <div>
                       <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Email Address</label>
                       <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-[14px] outline-none focus:border-blue-500 focus:bg-white transition-colors focus:ring-4 ring-blue-500/10" placeholder="hello@example.com" />
                    </div>
                    <div>
                       <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Message</label>
                       <textarea rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-[14px] outline-none focus:border-blue-500 focus:bg-white transition-colors focus:ring-4 ring-blue-500/10 resize-none" placeholder="How can we help you?"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-[#111827] hover:bg-[#1E40FF] text-white font-bold text-[14px] py-4 rounded-xl transition-colors mt-2 shadow-lg shadow-gray-200">Send Message</button>
                 </form>
             </div>
          </section>

      </div>
    </div>
  );
}
