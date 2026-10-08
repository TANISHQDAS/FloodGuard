'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, ShieldAlert, Award, FileText, CheckCircle2, Waves, Radio } from 'lucide-react';

export default function DemoVideoPage() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  const audioContextRef = useRef<AudioContext | null>(null);

  const steps = [
    {
      time: '0:00 - 0:10',
      title: 'Phase 1: Project Title & Team Introduction',
      narration:
        'Welcome to the official demonstration of FloodGuard – Smart River Water Level Monitoring and Proactive Early Warning System. Developed by Tanishq Das (Reg. No: 23BAI10587) and Abhi Pandey (Reg. No: 23BAI10909), 4th-year scholars from VIT Bhopal University.',
      state: 'INIT',
      waterLevelCm: 0.0,
      waterPct: 0,
      slope: 0.0,
      rain: 'No Rain',
      alert: 'NORMAL',
      leds: { green: true, yellow: false, red: false },
      buzzer: false,
      oledText: 'FloodGuard IoT\nInit OK | 0.0cm\nStatus: NORMAL',
    },
    {
      time: '0:11 - 0:25',
      title: 'Phase 2: Baseline Calibration in Empty Container (Riverbed Datum)',
      narration:
        'The non-contact HC-SR04 ultrasonic sensor is mounted 40 cm above the riverbed. The firmware subtracts measured air-gap from calibrated datum. Green LED is solid, OLED confirms normal baseflow, and the cloud dashboard reports nominal capacity.',
      state: 'BASELINE',
      waterLevelCm: 6.2,
      waterPct: 15.5,
      slope: 0.1,
      rain: 'No Rain',
      alert: 'NORMAL',
      leds: { green: true, yellow: false, red: false },
      buzzer: false,
      oledText: 'FloodGuard\nLevel: 6.2cm (15%)\nStatus: NORMAL',
    },
    {
      time: '0:26 - 0:40',
      title: 'Phase 3: Catchment Rainfall Precipitation Detection',
      narration:
        'Water droplets reach the FC-37 serpentine rain sensor grid. The LM393 comparator pulls digital pin LOW, analog ADC drops below 2200, and both the OLED screen and Next.js cloud telemetry immediately update to "Moderate Rain".',
      state: 'RAIN',
      waterLevelCm: 14.5,
      waterPct: 36.2,
      slope: 1.2,
      rain: 'Moderate Rain',
      alert: 'NORMAL',
      leds: { green: true, yellow: false, red: false },
      buzzer: false,
      oledText: 'FloodGuard [WiFi:OK]\nLevel: 14.5cm (36%)\nRain: Moderate Rain',
    },
    {
      time: '0:41 - 0:55',
      title: 'Phase 4: Steady Rise Reaching Warning Threshold (60%)',
      narration:
        'As inflow accumulates, the water level reaches 24 cm, crossing our calibrated 60% warning mark. The green LED extinguishes, the yellow LED illuminates, and the incident table logs a warning advisory.',
      state: 'WARNING',
      waterLevelCm: 25.4,
      waterPct: 63.5,
      slope: 2.1,
      rain: 'Heavy Rain',
      alert: 'WARNING',
      leds: { green: false, yellow: true, red: false },
      buzzer: false,
      oledText: 'Level: 25.4cm (63%)\nStatus: WARNING\nRain: Heavy Rain',
    },
    {
      time: '0:56 - 1:15',
      title: 'Phase 5: Critical Innovation – Rate-of-Rise Surge Trigger (+6cm in 4s)',
      narration:
        'Simulating a sudden cloudburst surge, water is poured rapidly. Even though the level is only at 29 cm—well below the danger threshold—the slope exceeds 5.0 cm/min! FloodGuard instantly flags "RAPID RISE DETECTED", pulsing the yellow LED and sounding warning chirps!',
      state: 'RAPID_RISE',
      waterLevelCm: 29.8,
      waterPct: 74.5,
      slope: 14.2,
      rain: 'Heavy Rain',
      alert: 'WARNING',
      leds: { green: false, yellow: true, red: false, flash: true },
      buzzer: true,
      oledText: '>> RAPID RISE! <<\nSlope: +14.2 cm/m\nStatus: WARNING',
    },
    {
      time: '1:16 - 1:35',
      title: 'Phase 6: Critical Flood Danger Threshold Breach (85%) & Siren Alarm',
      narration:
        'Water reaches 35 cm, crossing the 85% critical danger threshold. The high-intensity red LED flashes at 2.5 Hz, the active piezo acoustic siren sounds an urgent 400ms alarm, and the cloud dashboard triggers red emergency banners.',
      state: 'DANGER',
      waterLevelCm: 36.4,
      waterPct: 91.0,
      slope: 3.5,
      rain: 'Heavy Rain',
      alert: 'DANGER',
      leds: { green: false, yellow: false, red: true, flash: true },
      buzzer: true,
      oledText: '!! DANGER !!\nLevel: 36.4cm (91%)\nEVACUATE AREA',
    },
    {
      time: '1:36 - 1:50',
      title: 'Phase 7: Sensor Disconnect & Hardware Reliability Trap',
      narration:
        'To demonstrate disaster reliability, the ultrasonic echo line is severed. Rather than displaying corrupt zeroes, FloodGuard immediately traps the fault and displays "SENSOR ERROR" on both the OLED and cloud dashboard.',
      state: 'SENSOR_ERROR',
      waterLevelCm: 0.0,
      waterPct: 0.0,
      slope: 0.0,
      rain: 'No Rain',
      alert: 'SENSOR_ERROR',
      leds: { green: false, yellow: true, red: true },
      buzzer: false,
      oledText: '!! SENSOR ERROR !!\nCheck HC-SR04 Pins\nEcho signal lost',
    },
    {
      time: '1:51 - 2:00',
      title: 'Phase 8: Conclusion & Open Hardware Submission',
      narration:
        'FloodGuard concludes its demonstration with 100% verified results: ±0.3 cm accuracy, sub-1.2 second alert latency, and reproducible open hardware for community resilience. Developed by Tanishq Das (Reg. No: 23BAI10587) and Abhi Pandey (Reg. No: 23BAI10909), 4th-year scholars at VIT Bhopal University.',
      state: 'CONCLUDED',
      waterLevelCm: 10.0,
      waterPct: 25.0,
      slope: 0.0,
      rain: 'No Rain',
      alert: 'NORMAL',
      leds: { green: true, yellow: false, red: false },
      buzzer: false,
      oledText: 'FloodGuard v2.0\nDemonstration PASS\nOpen Hardware',
    }
  ];

  // Sound tone generator
  const playTone = (freq: number) => {
    if (!audioEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.error(e);
    }
  };

  // Video playback loop timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          const next = prev + 1.25;
          const stepIndex = Math.min(steps.length - 1, Math.floor((next / 100) * steps.length));
          if (stepIndex !== currentStep) {
            setCurrentStep(stepIndex);
            if (steps[stepIndex].buzzer) {
              playTone(2500);
            }
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, audioEnabled]);

  const active = steps[currentStep];

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/report"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>IEEE Project Report</span>
            </Link>
            <Link
              href="/code"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              <span>Source Code</span>
            </Link>
          </div>
        </div>

        {/* Video Player Display Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Main 16:9 Interactive Video Stage */}
          <div className="aspect-video bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden border-b border-slate-800">
            
            {/* Overlay Watermark / Developer Byline */}
            <div className="flex items-center justify-between text-xs z-20">
              <div className="flex items-center space-x-2 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800">
                <ShieldAlert className="h-4 w-4 text-cyan-400" />
                <span className="font-bold text-white">FloodGuard Demo Video</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400 font-mono">{active.time}</span>
              </div>

              <div className="bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-right font-mono text-slate-300">
                <span>By: <strong>Tanishq Das</strong> (23BAI10587) &amp; <strong>Abhi Pandey</strong> (23BAI10909)</span>
                <span className="block text-slate-400 font-semibold">4th Year, VIT Bhopal University</span>
              </div>
            </div>

            {/* Central Animated Simulation Stage (Simulated Hardware Bench & Acrylic Tank) */}
            <div className="my-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-center z-10 py-4">
              
              {/* Left Column: Local Hardware (OLED Display, LEDs, Buzzer) */}
              <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl space-y-3">
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block">
                  On-Site Edge Node Hardware
                </span>

                {/* OLED Display 128x64 Simulation */}
                <div className="bg-blue-950/60 border border-cyan-500/60 p-3 rounded font-mono text-[11px] text-cyan-300 shadow-inner h-24 flex flex-col justify-between">
                  <div className="flex justify-between text-[9px] border-b border-cyan-800/80 pb-1">
                    <span>FLOODGUARD</span>
                    <span>[WiFi:OK]</span>
                  </div>
                  <pre className="text-[10px] font-bold text-white leading-tight">
                    {active.oledText}
                  </pre>
                  <div className="w-full bg-cyan-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full" style={{ width: `${active.waterPct}%` }} />
                  </div>
                </div>

                {/* Status LEDs & Buzzer indicators */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="text-center">
                      <div className={`h-4 w-4 rounded-full mx-auto ${active.leds.green ? 'bg-emerald-400 shadow-lg shadow-emerald-500/80' : 'bg-slate-800'}`} />
                      <span className="text-[9px] text-slate-500 block mt-1">Normal</span>
                    </div>
                    <div className="text-center">
                      <div className={`h-4 w-4 rounded-full mx-auto ${active.leds.yellow ? 'bg-amber-400 shadow-lg shadow-amber-500/80 animate-pulse' : 'bg-slate-800'}`} />
                      <span className="text-[9px] text-slate-500 block mt-1">Warn</span>
                    </div>
                    <div className="text-center">
                      <div className={`h-4 w-4 rounded-full mx-auto ${active.leds.red ? 'bg-rose-500 shadow-lg shadow-rose-500/80 animate-bounce' : 'bg-slate-800'}`} />
                      <span className="text-[9px] text-slate-500 block mt-1">Danger</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-mono px-2 py-1 rounded font-bold ${active.buzzer ? 'bg-rose-950 text-rose-300 border border-rose-700 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                      {active.buzzer ? 'SIREN ON' : 'BUZZER OFF'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Column: Calibrated Acrylic Test Tank Elevation */}
              <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl flex flex-col items-center">
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold mb-2">
                  Transparent River Tank (40cm Datum)
                </span>

                <div className="w-36 h-48 bg-slate-950 border-2 border-slate-700 rounded-lg relative overflow-hidden flex flex-col-reverse shadow-inner">
                  {/* Danger Line */}
                  <div className="absolute left-0 right-0 border-b border-dashed border-rose-500 z-20 pointer-events-none" style={{ bottom: '85%' }}>
                    <span className="text-[8px] bg-rose-950 text-rose-300 px-1 rounded absolute right-1 -top-2">85% DANGER</span>
                  </div>
                  {/* Warning Line */}
                  <div className="absolute left-0 right-0 border-b border-dashed border-amber-500 z-20 pointer-events-none" style={{ bottom: '60%' }}>
                    <span className="text-[8px] bg-amber-950 text-amber-300 px-1 rounded absolute right-1 -top-2">60% WARN</span>
                  </div>

                  {/* Water Fill */}
                  <div
                    className={`w-full transition-all duration-700 flex items-center justify-center ${
                      active.alert === 'DANGER'
                        ? 'bg-rose-600'
                        : active.alert === 'WARNING'
                        ? 'bg-amber-500'
                        : 'bg-cyan-500'
                    }`}
                    style={{ height: `${active.waterPct}%` }}
                  >
                    {active.waterPct > 10 && (
                      <span className="text-[10px] font-mono font-bold text-slate-950 bg-white/70 px-1 rounded">
                        {active.waterLevelCm.toFixed(1)}cm
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Telemetry Metrics */}
              <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl space-y-2 text-xs font-mono">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">
                  Cloud Telemetry Stream
                </span>

                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Water Elevation:</span>
                  <span className="font-bold text-cyan-400">{active.waterLevelCm.toFixed(1)} cm</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Capacity Percent:</span>
                  <span className="font-bold text-white">{active.waterPct.toFixed(1)} %</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Rate of Rise:</span>
                  <span className={`font-bold ${active.slope > 3 ? 'text-amber-400' : 'text-slate-300'}`}>
                    +{active.slope.toFixed(1)} cm/min
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Rain Moisture:</span>
                  <span className="text-blue-300 font-semibold">{active.rain}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">System Alert:</span>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                    active.alert === 'DANGER' ? 'bg-rose-950 text-rose-300' : active.alert === 'WARNING' ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
                  }`}>
                    {active.alert}
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom Narration Banner */}
            <div className="bg-slate-950/95 border border-slate-800 p-3.5 rounded-xl z-20">
              <div className="flex items-center space-x-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">{active.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{active.narration}</p>
            </div>

          </div>

          {/* Video Player Controls Bar */}
          <div className="p-4 bg-slate-900 flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-10 w-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center shadow transition-all"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>

              <button
                onClick={handleReset}
                className="h-10 w-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700 transition-all"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="h-10 w-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700 transition-all"
              >
                {audioEnabled ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
              </button>

              <div>
                <span className="text-xs font-bold text-white block">
                  {isPlaying ? 'Demonstration Running' : 'Demonstration Paused'}
                </span>
                <span className="text-[11px] text-slate-400">
                  Step {currentStep + 1} of {steps.length} &bull; {Math.round(progress)}% Complete
                </span>
              </div>
            </div>

            {/* Quick Scene Jumper Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {steps.map((st, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentStep(i);
                    setProgress((i / steps.length) * 100);
                  }}
                  className={`text-[10px] px-2.5 py-1 rounded font-mono transition-all ${
                    currentStep === i
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Phase {i + 1}
                </button>
              ))}
            </div>

          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950 h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

        </div>

      </div>
    </div>
  );
}
