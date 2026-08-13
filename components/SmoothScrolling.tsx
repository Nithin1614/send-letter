'use client';

import React, { useEffect, useRef } from 'react';
import { ReactLenis, LenisRef } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrolling({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
  
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0, 0);
    
    const handleScroll = () => {
      ScrollTrigger.update();
    };

    if (lenisRef.current?.lenis) {
       lenisRef.current.lenis.on('scroll', handleScroll);
       ScrollTrigger.refresh();
    }

    return () => {
      gsap.ticker.remove(update);
      lenisRef.current?.lenis?.off('scroll', handleScroll);
    };
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        autoRaf: false,
        duration: 1.4,
        smoothWheel: true,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      }}
    >
      {children}
    </ReactLenis>
  );
}
