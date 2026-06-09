import React, { useState, useEffect, useRef } from "react";
import { ShortformData, Scene } from "../types";
import { Play, Pause, RotateCw, Volume2, VolumeX, Smartphone, MonitorPlay, Sparkles, Trophy, Calendar, Users, Layers, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VideoPlayerProps {
  data: ShortformData;
}

export default function VideoPlayer({ data }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in seconds, from 0 to 15
  const [isMuted, setIsMuted] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastActiveSceneRef = useRef<number>(-1);

  const scenes = data.scenes;
  const totalDuration = 15; // 15 seconds

  // Determine current active scene
  const activeSceneIndex = Math.min(
    Math.floor(currentTime / 3),
    scenes.length - 1
  );
  const activeScene = scenes[activeSceneIndex] || scenes[0];

  // Tick the timer
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 100; // tick every 100ms
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration - 0.1) {
            // Loop back
            return 0;
          }
          return parseFloat((prev + 0.1).toFixed(1));
        });
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying]);

  // Synchronize Narration via Web Speech API (Optional & Fun!)
  useEffect(() => {
    if (!isPlaying) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    // Trigger speech only when the scene changes to prevent continuous re-speech
    if (voiceEnabled && activeSceneIndex !== lastActiveSceneRef.current && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // stop previous
      
      const utterance = new SpeechSynthesisUtterance(activeScene.narration);
      utterance.lang = "ko-KR";
      utterance.rate = 1.1; // Slightly fast for 15s rhythm
      
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      
      lastActiveSceneRef.current = activeSceneIndex;
    }
  }, [activeSceneIndex, isPlaying, voiceEnabled, activeScene]);

  const handlePlayToggle = () => {
    // If we're starting or pausing, reset speech trackers
    if (!isPlaying) {
      lastActiveSceneRef.current = -1;
    } else {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setCurrentTime(0);
    lastActiveSceneRef.current = -1;
    setIsPlaying(false);
  };

  const handleTimeScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    lastActiveSceneRef.current = -1;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const progressPercentage = (currentTime / totalDuration) * 100;

  // Custom visual components for each scene to simulate original animations
  const renderVisualMock = () => {
    const sIndex = activeSceneIndex + 1;
    switch (sIndex) {
      case 1:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-sky-100/50 to-white">
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center border-2 border-sky-300 shadow-md mb-4"
            >
              <Trophy className="w-10 h-10 text-sky-500" />
            </motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/80 backdrop-blur-sm border border-sky-100 px-3 py-1.5 rounded-full shadow-inner-sm mb-2"
            >
              <span className="text-4xs font-bold text-sky-600 tracking-wide uppercase">★ Scene 1 [HOOK] ★</span>
            </motion.div>
            <h3 className="text-sm font-extrabold text-slate-800 leading-snug drop-shadow-sm px-4">
              {data.meta.coreBenefits || "상상도 몰랐던 압도적 혜택!"}
            </h3>
            {/* background bubbles */}
            <div className="absolute w-2.5 h-2.5 bg-sky-200 rounded-full top-20 left-10 animate-ping"></div>
            <div className="absolute w-4 h-4 bg-sky-300/60 rounded-full bottom-20 right-10 animate-bounce"></div>
          </div>
        );
      case 2:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-50 to-sky-50">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="w-18 h-18 rounded-2xl bg-white border border-sky-200 flex items-center justify-center shadow-md mb-4"
            >
              <Layers className="w-9 h-9 text-sky-500" />
            </motion.div>
            <motion.div
              className="bg-sky-500 px-2.5 py-1 rounded-md mb-2 shadow-sm"
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <span className="text-5xs font-mono font-bold text-white uppercase tracking-wider">ACTIVITY LAUNCH</span>
            </motion.div>
            <h3 className="text-xs font-semibold text-slate-700 max-w-[180px] leading-relaxed">
              실무형 공익 기획 & 디지털 솔루션 역량 강화 워크숍
            </h3>
            {/* static laptop sketch icon decorator */}
            <div className="w-24 h-1.5 bg-slate-300 rounded-full mt-4 flex items-center justify-center opacity-70">
              <div className="w-6 h-1 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-sky-50/20">
            {/* Animated avatars ring */}
            <div className="relative w-28 h-28 flex items-center justify-center mb-4">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                className="absolute inset-0 border border-dashed border-sky-300 rounded-full"
              ></motion.div>
              <Users className="w-10 h-10 text-sky-500 bg-white p-2 rounded-full border border-sky-100 shadow-sm" />
              {/* orbiting dots */}
              <div className="absolute top-0 w-3 h-3 rounded-full bg-sky-400 border border-white"></div>
              <div className="absolute bottom-1 right-2 w-3.5 h-3.5 rounded-full bg-emerald-400 border border-white"></div>
              <div className="absolute left-1 bottom-4 w-3.5 h-3.5 rounded-full bg-orange-300 border border-white"></div>
            </div>
            <span className="text-[10px] font-bold text-sky-600 block mb-1">■ 모집 대상 ■</span>
            <p className="text-[11px] font-medium text-slate-700 px-4 leading-normal">
              글쓰기, 기획, 소셜 활동에 관심 가득한 경기도 청년·대학생 누구나!
            </p>
          </div>
        );
      case 4:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white">
            <motion.div
              animate={{ scale: [1, 0.93, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="bg-rose-50 border border-rose-100 px-3 py-1 rounded-full text-rose-600 text-5xs font-bold mb-3 tracking-wider"
            >
              ⚠ 마감 임박 / CLOSE SOON ⚠
            </motion.div>
            <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center border border-sky-200 mb-3 text-sky-500">
              <Calendar className="w-8 h-8" />
            </div>
            <p className="text-3xs text-slate-400">접수 기한 준수</p>
            <h4 className="text-xs font-bold text-slate-800 leading-tight mt-1">
              경기도 공익활동지원포털 간편 구글폼 및 신청서 이메일 제출
            </h4>
          </div>
        );
      case 5:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-t from-sky-100/40 via-white to-white">
            <motion.div
              animate={{ scale: [1, 1.08, 1], y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="w-16 h-16 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-600 mb-4 border border-sky-200 shadow-inner"
            >
              <Smartphone className="w-8 h-8 text-sky-500" />
            </motion.div>
            <div className="bg-sky-500 text-white font-extrabold text-3xs px-4 py-1.5 rounded-full shadow-md tracking-wider flex items-center gap-1.5 hover:bg-sky-600 cursor-pointer pointer-events-auto">
              <Sparkles className="w-3 h-3 animate-pulse" />
              프로필 링크 클릭 (공익 위키)
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-3.5 leading-snug">
              지금 바로 프로필 링크를 터치하고<br />상세 혜택 꿀정보 공지 확인!
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div id="video-player-container" className="flex flex-col justify-between bg-[#1e293b] rounded-3xl p-6 shadow-xl relative overflow-hidden h-full border border-slate-800">
      
      {/* Circle decorator like the Bento Design HTML */}
      <div className="absolute -top-6 -right-6 p-8 opacity-10 pointer-events-none">
        <div className="w-32 h-32 border-4 border-sky-400 rounded-full"></div>
      </div>

      <div className="w-full flex items-center justify-between mb-4 z-10 relative">
        <h2 className="text-2xs font-extrabold text-sky-400 flex items-center gap-1.5 tracking-wider uppercase">
          <MonitorPlay className="w-4 h-4 text-sky-400" />
          15초 비주얼 시뮬레이터
        </h2>
        
        {/* Web Speech Prompt Voice Toggle */}
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`px-2.5 py-1 rounded-full text-5xs font-black flex items-center gap-1 transition-all ${
            voiceEnabled
              ? "bg-sky-500 text-white border border-sky-400 shadow-sm"
              : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
          }`}
          title="성우 음성 나레이션 시뮬레이션 토글"
        >
          <Volume2 className="w-2.5 h-2.5" />
          AI 음성 나레이션 {voiceEnabled ? "켜짐" : "꺼짐"}
        </button>
      </div>

      {/* Simulated Smartphone Housing */}
      <div className="relative w-[190px] h-[330px] bg-slate-950 rounded-[28px] border-4 border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between mx-auto z-10 shrink-0">
        {/* Camera Notch and top indicators */}
        <div className="absolute top-0 inset-x-0 h-3 bg-slate-950 z-30 flex justify-center items-center">
          <div className="w-10 h-1.5 bg-slate-800 rounded-full"></div>
        </div>

        {/* Dynamic Video Stage */}
        <div className="relative flex-1 bg-white flex items-center justify-center overflow-hidden pt-3">
          {renderVisualMock()}

          {/* Time & Scene Overlay HUD at top right */}
          <div className="absolute top-4 right-3 bg-black/60 text-white px-1.5 py-0.5 rounded text-[8px] font-mono tracking-wider z-20">
            {currentTime.toFixed(1)}s
          </div>

          {/* Subtitles Overlay Panel at bottom */}
          <div className="absolute bottom-5 inset-x-0 px-2.5 z-20 text-center pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.p
                key={activeScene.sceneNumber + activeScene.caption}
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -7 }}
                transition={{ duration: 0.2 }}
                className="inline-block bg-black/75 text-white text-[9px] font-extrabold px-2 py-1 rounded-md leading-relaxed shadow-lg border border-white/5"
              >
                {activeScene.caption}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Glowing Equalizer Bar during playback */}
          {isPlaying && (
            <div className="absolute bottom-1.5 left-2.5 flex gap-0.5 items-end h-2.5 opacity-60 z-20">
              <div className="w-0.5 bg-sky-400 h-1.5 animate-bounce"></div>
              <div className="w-0.5 bg-sky-400 h-2 animate-pulse"></div>
              <div className="w-0.5 bg-sky-400 h-1 animate-bounce"></div>
              <div className="w-0.5 bg-sky-400 h-2 animate-pulse"></div>
            </div>
          )}
        </div>

        {/* ProgressBar element */}
        <div className="h-1 bg-slate-850 w-full relative z-25">
          <div 
            className="h-full bg-sky-500 transition-all duration-100"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Visual Prompt Builder Card mirroring the Bento spec */}
      <div className="w-full mt-3 bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50 z-10 text-left">
        <p className="text-sky-400 text-[10px] font-mono mb-1 flex items-center gap-1 font-bold">
          <Sparkles className="w-3 h-3 text-sky-400" />
          # Visual Prompt Builder (장면 {activeScene.sceneNumber})
        </p>
        <p className="text-slate-300 text-3xs font-medium leading-relaxed line-clamp-2">
          {activeScene.prompt}
        </p>
      </div>

      {/* Playback & Seek Deck */}
      <div className="w-full mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2.5 z-10">
        {/* Current Info Panel */}
        <div className="flex justify-between items-center text-5xs font-bold text-slate-400">
          <span className="text-sky-400">{activeScene.title}</span>
          <span className="font-mono text-slate-500">{currentTime.toFixed(1)}s / {totalDuration}.0s</span>
        </div>

        {/* Timeline Slider */}
        <input
          type="range"
          min={0}
          max={totalDuration}
          step={0.1}
          value={currentTime}
          onChange={handleTimeScrub}
          className="w-full accent-sky-500 h-1 rounded-lg cursor-pointer bg-slate-800 opacity-90 hover:opacity-100 transition-opacity"
        />

        {/* Controls block */}
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={handleReset}
            className="p-1.5 rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white active:scale-95 transition-all"
            title="처음부터 다시"
          >
            <RotateCw className="w-3 h-3" />
          </button>
          
          <button
            onClick={handlePlayToggle}
            className="p-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white shadow-md active:scale-90 transition-all font-black"
            title={isPlaying ? "일시정지" : "재생"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded-full border transition-all ${
              !isMuted 
                ? "border-sky-500 bg-sky-500/10 text-sky-400" 
                : "border-slate-750 bg-slate-800 text-slate-400"
            }`}
            title="효과음 재생 시뮬레이션 토글"
          >
            {!isMuted ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
}
