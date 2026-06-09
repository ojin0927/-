import React, { useState, useEffect, useRef } from "react";
import { ShortformData, Scene } from "../types";
import { Play, Pause, RotateCw, Volume2, VolumeX, Smartphone, MonitorPlay, Sparkles, Trophy, Calendar, Users, Layers, Activity, Palette } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VideoPlayerProps {
  data: ShortformData;
}

export default function VideoPlayer({ data }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in seconds, from 0 to 15
  const [isMuted, setIsMuted] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
  const [imgSeedOffset, setImgSeedOffset] = useState(0);

  // States for natural-sounding human TTS fine-tuning
  const [voiceRate, setVoiceRate] = useState(0.98); // 0.98 is a highly natural, breathing human rate
  const [voicePitch, setVoicePitch] = useState(1.05); // slightly elevated, happy friendly pitch
  const [systemVoiceList, setSystemVoiceList] = useState<SpeechSynthesisVoice[]>([]);
  const [chosenSystemVoiceName, setChosenSystemVoiceName] = useState("");
  const [isVoicePanelOpen, setIsVoicePanelOpen] = useState(false);

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

  // Asynchronously query and bind premium human-like neural voices available in the user's browser
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadAllVoices = () => {
        const list = window.speechSynthesis.getVoices();
        const koList = list.filter(v => v.lang.startsWith("ko"));
        
        const finalList = koList.length > 0 ? koList : list;
        setSystemVoiceList(finalList);

        if (koList.length > 0) {
          // Auto select premium natural sounding TTS engines
          const preferNatural = koList.find(
            v => v.name.includes("Google") || 
                 v.name.toLowerCase().includes("natural") || 
                 v.name.toLowerCase().includes("neural") ||
                 v.name.includes("Yuna") ||
                 v.name.includes("Siri")
          );
          if (preferNatural) {
            setChosenSystemVoiceName(preferNatural.name);
          } else {
            setChosenSystemVoiceName(koList[0].name);
          }
        } else if (list.length > 0) {
          setChosenSystemVoiceName(list[0].name);
        }
      };

      loadAllVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadAllVoices;
      }
    }
  }, []);

  // Sync state parameters when chosen persona character changes from shortform data recomendVoice
  useEffect(() => {
    const voiceChoice = data.recommendVoice || "";
    if (voiceChoice.includes("서아")) {
      setVoiceRate(1.0);
      setVoicePitch(1.15); // cheerful 20s college student voice
    } else if (voiceChoice.includes("민준")) {
      setVoiceRate(0.96);
      setVoicePitch(0.95); // calm and smart mentor style
    } else if (voiceChoice.includes("동우")) {
      setVoiceRate(1.1);
      setVoicePitch(1.05); // energetic 20s tempo
    } else if (voiceChoice.includes("지아")) {
      setVoiceRate(0.98);
      setVoicePitch(1.0);  // professional clean announcer speech
    } else if (voiceChoice.includes("은우")) {
      setVoiceRate(1.05);
      setVoicePitch(1.3);  // virtual mascot tone
    }
  }, [data.recommendVoice]);

  // Synchronize Narration via Web Speech API with rich custom voice features
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
      
      // Assign custom refined neural rate, pitch and volume for maximum natural breathing qualities
      utterance.rate = voiceRate;
      utterance.pitch = voicePitch;
      utterance.volume = isMuted ? 0 : 1.0;
      
      // Assign chosen natural target voice
      if (chosenSystemVoiceName) {
        const voices = window.speechSynthesis.getVoices();
        const matchedVoice = voices.find(v => v.name === chosenSystemVoiceName);
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }
      
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      
      lastActiveSceneRef.current = activeSceneIndex;
    }
  }, [activeSceneIndex, isPlaying, voiceEnabled, activeScene, chosenSystemVoiceName, voiceRate, voicePitch, isMuted]);

  const playVoicePreview = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Pick active scene's subtitle as a preview chunk so that it matches context beautifully
    const demo = activeScene.narration || "자연스럽고 부드러운 고음질 인공지능 나레이션 목소리입니다.";
    const utterance = new SpeechSynthesisUtterance(demo);
    utterance.lang = "ko-KR";
    utterance.rate = voiceRate;
    utterance.pitch = voicePitch;
    utterance.volume = 1.0;

    if (chosenSystemVoiceName) {
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => v.name === chosenSystemVoiceName);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  };

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

  // Custom visual components for each scene with dynamic illustrator-themed background images
  const renderVisualMock = () => {
    const sIndex = activeSceneIndex + 1;
    
    // Choose specific illust tags dynamically to render beautiful vector graphics
    let illustTag = "illustration,sky,blue";
    if (sIndex === 1) illustTag = "gift,award,success,smiling_youth";
    else if (sIndex === 2) illustTag = "design,workshop,laptop,cooperation";
    else if (sIndex === 3) illustTag = "friends,group,happy_students,community";
    else if (sIndex === 4) illustTag = "calendar,clock,deadline,notebook";
    else if (sIndex === 5) illustTag = "smartphone,click,touchscreen_illustration";

    const baseSeed = (sIndex * 13) + imgSeedOffset;
    const sceneImageUrl = `https://picsum.photos/seed/gongik_wiki_${illustTag}_${baseSeed}/300/533`;

    return (
      <div className="absolute inset-0 w-full h-full flex flex-col justify-between overflow-hidden">
        {/* Dynamic Image Layer */}
        <div className="absolute inset-0 w-full h-full z-0 bg-slate-100">
          <img 
            src={sceneImageUrl}
            alt={activeScene.visualConcept || "Scene Visual"}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
          />
          {/* Frosted and darkened gradient overlay mask to support premium typography readable edges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 z-10"></div>
        </div>

        {/* HUD Overlay Layer */}
        <div className="relative z-20 flex-1 flex flex-col justify-between p-4 pt-5 text-left h-full">
          {/* Header element */}
          <div className="w-full flex justify-between items-center bg-black/30 backdrop-blur-md border border-white/15 px-2 py-1 rounded-lg">
            <span className="text-[7.5px] text-sky-400 font-extrabold tracking-widest uppercase">
              ★ Scene {sIndex} ★
            </span>
            <span className="text-[7px] text-white/90 font-medium font-mono uppercase">
              {activeScene.timeRange}
            </span>
          </div>

          {/* Central graphic widget supporting visual concept */}
          <div className="my-auto flex flex-col items-center text-center">
            <motion.div
              animate={isPlaying ? { y: [0, -6, 0], scale: [1, 1.04, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="bg-black/35 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl shadow-lg mb-2 inline-flex items-center justify-center max-w-[130px]"
            >
              {sIndex === 1 && <Trophy className="w-8 h-8 text-sky-400" />}
              {sIndex === 2 && <Layers className="w-8 h-8 text-emerald-400" />}
              {sIndex === 3 && <Users className="w-8 h-8 text-yellow-400" />}
              {sIndex === 4 && <Calendar className="w-8 h-8 text-rose-450 text-rose-450 fill-rose-500/10" />}
              {sIndex === 5 && <Smartphone className="w-8 h-8 text-sky-400" />}
            </motion.div>
            
            <div className="bg-white/10 backdrop-blur-xs border border-white/5 py-0.5 px-2 rounded-md max-w-[155px]">
              <p className="text-[7.5px] font-bold text-white/90 leading-tight">
                {activeScene.visualConcept || "비주얼 연출 중"}
              </p>
            </div>
          </div>

          {/* Spacer to give room for bottom caption overlapping */}
          <div className="h-4"></div>
        </div>
      </div>
    );
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
        <div className="flex justify-between items-center mb-1.5">
          <p className="text-sky-400 text-[10px] font-mono flex items-center gap-1 font-bold">
            <Sparkles className="w-3 h-3 text-sky-400" />
            # 가상 이미지 스타일러 (장면 {activeScene.sceneNumber})
          </p>
          <button
            onClick={() => setImgSeedOffset((prev) => prev + 1)}
            className="px-2 py-0.5 rounded bg-sky-500/15 hover:bg-sky-500/35 text-[7.5px] font-extrabold text-sky-450 text-sky-400 border border-sky-400/40 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            title="다른 인공지능 스타일 및 무드로 이미지 즉시 교체"
          >
            <Palette className="w-2.5 h-2.5" />
            무드 다양화
          </button>
        </div>
        <p className="text-slate-300 text-3xs font-medium leading-relaxed line-clamp-2">
          {activeScene.prompt}
        </p>
      </div>

      {/* Collapsible Natural Voice Tuning Panel */}
      <div className="w-full mt-2 border border-slate-700/65 bg-slate-800/25 rounded-2xl p-2.5 text-left transition-all z-10">
        <button
          onClick={() => setIsVoicePanelOpen(!isVoicePanelOpen)}
          className="w-full flex justify-between items-center text-sky-400 hover:text-sky-350 text-3xs font-black tracking-wider uppercase cursor-pointer"
        >
          <span className="flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5" />
            🎙️ AI 목소리 세부조정 & 자연어 인코딩 {isVoicePanelOpen ? "▲" : "▼"}
          </span>
          <span className="text-[8px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">고품질 뉴럴 케어</span>
        </button>

        {isVoicePanelOpen && (
          <div className="mt-3.5 space-y-3 border-t border-slate-800/40 pt-2.5 animate-fade-in">
            {/* System Korean voice selection drop-down */}
            <div className="space-y-1">
              <label className="text-[8.5px] text-slate-350 font-bold flex justify-between">
                <span>컴퓨터 내장 자연어 성우 목록</span>
                <span className="text-sky-400 text-[7px] font-medium">Google/Siri 뉴럴 성우 권장</span>
              </label>
              <select
                value={chosenSystemVoiceName}
                onChange={(e) => setChosenSystemVoiceName(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-3xs font-extrabold text-slate-200 focus:outline-none focus:border-sky-500"
              >
                {systemVoiceList.length === 0 ? (
                  <option value="">(자동 감지 중...)</option>
                ) : (
                  systemVoiceList.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Speaking Rate and Pitch Slides */}
            <div className="grid grid-cols-2 gap-3 pb-1">
              {/* Rate slide */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                  <span>말하기 속도 (Speed)</span>
                  <span className="text-sky-450 text-sky-400 font-mono">{voiceRate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.02"
                  value={voiceRate}
                  onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg accent-sky-400 cursor-pointer"
                />
              </div>

              {/* Pitch slide */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                  <span>목소리 높낮이 (Pitch)</span>
                  <span className="text-sky-450 text-sky-400 font-mono">{voicePitch.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.02"
                  value={voicePitch}
                  onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg accent-sky-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Speaking Demo Preview trigger */}
            <button
              onClick={playVoicePreview}
              className="w-full py-1.5 px-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-400/20 rounded-xl text-3xs font-extrabold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              나레이션 음속 및 목소리 테스트하기
            </button>
          </div>
        )}
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
