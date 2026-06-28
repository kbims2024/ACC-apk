import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { motion } from 'motion/react';

export default function PromoBanner() {
  const [promoSettings, setPromoSettings] = useState<{ 
    flashInfoEnabled: boolean; 
    flashInfoBgColor: string;
    flashInfos: {text: string, priority: number}[];
    timerEnabled: boolean;
    timerBgColor: string;
    timerEndDate: string;
    timerTitle: string;
  }>({
    flashInfoEnabled: false,
    flashInfoBgColor: '#E11D48',
    flashInfos: [],
    timerEnabled: false,
    timerBgColor: '#BE123C',
    timerEndDate: '',
    timerTitle: 'Expire dans :'
  });
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setPromoSettings({
          flashInfoEnabled: data.flashInfoEnabled || false,
          flashInfoBgColor: data.flashInfoBgColor || '#E11D48',
          flashInfos: (data.flashInfos || []).sort((a: any, b: any) => b.priority - a.priority),
          timerEnabled: data.timerEnabled || false,
          timerBgColor: data.timerBgColor || '#BE123C',
          timerEndDate: data.timerEndDate || '',
          timerTitle: data.timerTitle || 'Expire dans :'
        });
      })
      .catch(err => console.error("Could not load settings:", err));
  }, []);

  useEffect(() => {
    if (!promoSettings.timerEnabled || !promoSettings.timerEndDate) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(promoSettings.timerEndDate).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [promoSettings.timerEnabled, promoSettings.timerEndDate]);

  if (!promoSettings.flashInfoEnabled && !promoSettings.timerEnabled) return null;

  return (
    <div className="w-full flex flex-col sticky top-20 z-40 pointer-events-none">
      {/* Top Main Banner (Flash Info) */}
      {promoSettings.flashInfoEnabled && promoSettings.flashInfos.length > 0 && (
        <div className="w-full text-white flex items-stretch shadow-md pointer-events-auto" style={{ backgroundColor: promoSettings.flashInfoBgColor }}>
          {/* Fixed Left Part: Info Box */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 shrink-0 z-10 whitespace-nowrap shadow-[2px_0_10px_rgba(0,0,0,0.1)] border-b bg-red-600 border-red-700">
            <Timer className="w-3.5 h-3.5 animate-pulse text-white" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white">
              <span className="sm:hidden">INFO</span>
              <span className="hidden sm:inline">FLASH INFO</span>
            </span>
          </div>
          
          {/* Scrolling text area */}
          <div className="flex-1 overflow-hidden relative flex items-center border-b" style={{ backgroundColor: promoSettings.flashInfoBgColor, borderColor: 'rgba(0,0,0,0.15)' }}>
            {/* Fade masks */}
            <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-8 z-10 pointer-events-none" style={{ background: `linear-gradient(to right, ${promoSettings.flashInfoBgColor}, transparent)` }}></div>
            <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-8 z-10 pointer-events-none" style={{ background: `linear-gradient(to left, ${promoSettings.flashInfoBgColor}, transparent)` }}></div>
            
            <motion.div 
              className="flex whitespace-nowrap items-center shrink-0"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: Math.max(80, promoSettings.flashInfos.length * 60), repeat: Infinity }}
            >
                {/* Double the array for seamless infinite looping */}
                {[...promoSettings.flashInfos, ...promoSettings.flashInfos].map((info, i) => (
                  <div key={i} className="flex items-center gap-6 shrink-0 pr-8">
                    <span className="text-white/90 text-[12px] sm:text-[13px] ml-4 font-medium">
                      {info.text}
                    </span>
                    {/* Tiny separator bullet */}
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30 ml-4 hidden sm:block"></div>
                  </div>
                ))}
            </motion.div>
          </div>
        </div>
      )}
      
      {/* Timer Below - Rangé à droite, limité sur le texte, position absolue pour ne pas pousser le reste de la page */}
      {promoSettings.timerEnabled && timeLeft && (
        <div className="absolute right-0 top-full text-white/90 flex justify-center items-center py-0.5 px-2 sm:py-1.5 sm:px-3 shadow-md rounded-bl-xl border-b border-l pointer-events-auto" style={{ backgroundColor: promoSettings.timerBgColor, borderColor: 'rgba(0,0,0,0.2)' }}>
          <span className="font-bold uppercase tracking-wider mr-1 sm:mr-2 text-[9px] sm:text-[10px]">{promoSettings.timerTitle}</span>
          <span className="font-mono font-bold text-[10px] sm:text-[11px] text-white tabular-nums bg-black/20 px-1 sm:px-2 py-0.5 rounded shadow-inner border border-white/10">
            {timeLeft.days}J {timeLeft.hours}H {timeLeft.minutes}M {timeLeft.seconds}S
          </span>
        </div>
      )}
    </div>
  );
}
