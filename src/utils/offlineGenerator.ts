import { ShortformData } from "../types";

export function generateOfflinePlayerHTML(data: ShortformData): string {
  const titleEscaped = data.meta.title.replace(/"/g, '&quot;');
  const benefitsEscaped = data.meta.coreBenefits.replace(/"/g, '&quot;');
  const scenesJson = JSON.stringify(data.scenes).replace(/'/g, "\\'");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleEscaped} - 15s 홍보 숏폼 시뮬레이터</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=Space+Grotesk:wght@500;700&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      background: radial-gradient(circle at top, #1e293b, #0f172a);
    }
  </style>
</head>
<body class="text-slate-100 flex flex-col items-center justify-center min-h-screen p-4 overflow-x-hidden select-none">

  <!-- Header Branding -->
  <div class="text-center mb-6 max-w-md">
    <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold mb-2">
      <span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
      공익 위키 오프라인 플레이어
    </div>
    <h1 class="text-lg font-black text-white tracking-tight leading-snug">${titleEscaped}</h1>
    <p class="text-xs text-slate-400 mt-1">이 파일은 언제든 더블 클릭하여 재생 가능한 독립형 시뮬레이터입니다.</p>
  </div>

  <!-- SmartPhone Simulator Frame -->
  <div class="relative w-[310px] h-[550px] bg-slate-950 rounded-[48px] border-[10px] border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between">
    
    <!-- Camera Island Notch -->
    <div class="absolute top-0 inset-x-0 h-5 bg-slate-950 z-30 flex justify-center items-center">
      <div class="w-20 h-3 bg-slate-900 rounded-full"></div>
    </div>

    <!-- Active Stage -->
    <div id="video-stage" class="relative flex-1 bg-slate-900 flex items-center justify-center overflow-hidden">
      
      <!-- Video Slides Content -->
      <div id="image-layer" class="absolute inset-0 z-0 transition-all duration-700">
        <img id="scene-image" src="" alt="scene image" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/40 z-10"></div>
      </div>

      <!-- Live Layout Overlays -->
      <div class="absolute inset-0 z-20 flex flex-col justify-between p-5 pt-7">
        
        <!-- Top Title Panel -->
        <div class="flex justify-between items-center bg-black/45 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl">
          <span id="scene-label" class="text-[9px] text-sky-400 font-extrabold tracking-widest uppercase">★ Scene 1 ★</span>
          <span id="scene-timer-label" class="text-[8px] text-white/90 font-mono">0~3s</span>
        </div>

        <!-- Central Decorative Widget -->
        <div class="my-auto flex flex-col items-center text-center">
          <div id="scene-icon-box" class="bg-black/40 backdrop-blur-md border border-white/15 p-3 rounded-2xl shadow-lg mb-2 text-sky-400">
             <!-- SVG path changes dynamically -->
             <svg id="stage-svg" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
             </svg>
          </div>
          <div class="bg-white/10 backdrop-blur-sm border border-white/5 py-0.5 px-2.5 rounded-md max-w-[220px]">
            <p id="visual-concept-text" class="text-[9px] font-bold text-white leading-normal">로딩 중...</p>
          </div>
        </div>

        <!-- Bottom Captions Panel -->
        <div id="caption-wrapper" class="text-center pb-2">
          <p id="caption-text" class="inline-block bg-black/80 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg border border-white/5 shadow-2xl leading-relaxed">
            로딩 중...
          </p>
        </div>

      </div>

      <!-- Time Stamp Indicator -->
      <div id="hud-timer" class="absolute top-6 right-5 bg-black/75 px-2 py-0.5 rounded-md text-[9px] font-mono tracking-wider z-30">
        0.0s
      </div>

    </div>

    <!-- Live progress tracker line -->
    <div class="h-1 bg-slate-800 w-full relative z-30">
      <div id="progress-bar" class="h-full bg-sky-500 w-0 transition-all duration-100"></div>
    </div>

    <!-- Offline Controller Bar -->
    <div class="bg-slate-900 border-t border-slate-800 p-4 px-5 z-30">
      
      <!-- Timing controller slider -->
      <input 
        type="range" 
        id="timeline-slider" 
        min="0" 
        max="15" 
        step="0.1" 
        value="0" 
        class="w-full accent-sky-500 h-1 bg-slate-700 rounded-lg cursor-pointer mb-3"
      />

      <div class="flex items-center justify-between">
        <div class="flex flex-col text-left">
          <span id="active-scene-title" class="text-[10px] text-sky-400 font-extrabold">HOOK 장면</span>
          <span class="text-[8px] text-slate-500 font-mono">0.0s / 15.0s</span>
        </div>

        <!-- Main Controls -->
        <div class="flex items-center gap-3">
          <button id="btn-reset" class="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
            </svg>
          </button>

          <button id="btn-play" class="p-2.5 rounded-full bg-sky-505 bg-sky-500 text-white hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20 active:scale-95">
            <svg id="play-icon" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          <button id="btn-sound" class="p-1.5 rounded-full bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors">
            <svg id="sound-icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- Campaign Benefits Banner -->
  <div class="mt-6 bg-slate-900/60 p-4 rounded-3xl border border-slate-850 max-w-sm w-full text-left">
    <p class="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      핵심 타겟 리워드
    </p>
    <p class="text-xs text-slate-300">${benefitsEscaped}</p>
  </div>

  <script>
    const scenes = ${scenesJson};
    let isPlaying = false;
    let currentTime = 0;
    let voiceEnabled = true;
    let intervalId = null;

    // Elements
    const imgEl = document.getElementById('scene-image');
    const labelEl = document.getElementById('scene-label');
    const timerLabelEl = document.getElementById('scene-timer-label');
    const captionEl = document.getElementById('caption-text');
    const conceptEl = document.getElementById('visual-concept-text');
    const hudTimerEl = document.getElementById('hud-timer');
    const progressBarEl = document.getElementById('progress-bar');
    const activeTitleEl = document.getElementById('active-scene-title');
    const timeLabelEl = document.querySelector('.font-mono');
    const timelineEl = document.getElementById('timeline-slider');
    
    const playBtn = document.getElementById('btn-play');
    const resetBtn = document.getElementById('btn-reset');
    const soundBtn = document.getElementById('btn-sound');
    
    const playIcon = document.getElementById('play-icon');
    const soundIcon = document.getElementById('sound-icon');
    const stageSvg = document.getElementById('stage-svg');

    // SVG designs for scenes
    const svgs = [
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />', // Award/Idea
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />',       // Creative
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />', // Group
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />', // Deadline
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />' // Mobile
    ];

    let lastKnownSceneIndex = -1;

    function render() {
      const activeIndex = Math.min(Math.floor(currentTime / 3), 4);
      const scene = scenes[activeIndex];

      // Update Labels
      labelEl.innerText = '★ Scene ' + (activeIndex + 1) + ' ★';
      timerLabelEl.innerText = scene.timeRange;
      conceptEl.innerText = scene.visualConcept;
      captionEl.innerText = scene.caption;
      activeTitleEl.innerText = scene.title;
      hudTimerEl.innerText = currentTime.toFixed(1) + 's';
      
      // Update Image
      const baseSeed = (activeIndex + 1) * 13;
      imgEl.src = 'https://picsum.photos/seed/gongik_wiki_illustration_' + baseSeed + '/300/533';

      // Update Icons
      stageSvg.innerHTML = svgs[activeIndex];

      // Progress line
      const percentage = (currentTime / 15) * 100;
      progressBarEl.style.width = percentage + '%';

      // Meta labels
      timeLabelEl.innerText = currentTime.toFixed(1) + 's / 15.0s';
      timelineEl.value = currentTime;

      // TTS Trigger
      if (isPlaying && voiceEnabled && activeIndex !== lastKnownSceneIndex) {
        speakNarration(scene.narration);
        lastKnownSceneIndex = activeIndex;
      }
    }

    function speakNarration(text) {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.0;
      utterance.pitch = 1.1;

      // Try Google voice or natural voice for premium synthesis
      try {
        const voices = window.speechSynthesis.getVoices();
        const koVoices = voices.filter(v => v.lang.startsWith('ko'));
        if (koVoices.length > 0) {
          const premium = koVoices.find(v => v.name.includes('Google') || v.name.includes('Natural'));
          utterance.voice = premium ? premium : koVoices[0];
        }
      } catch(e) {}

      window.speechSynthesis.speak(utterance);
    }

    function play() {
      if (isPlaying) {
        clearInterval(intervalId);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        playIcon.innerHTML = '<path d="M8 5v14l11-7z" />';
        isPlaying = false;
      } else {
        lastKnownSceneIndex = -1;
        intervalId = setInterval(() => {
          currentTime += 0.1;
          if (currentTime >= 15.0) {
            currentTime = 0;
            lastKnownSceneIndex = -1;
          }
          render();
        }, 100);
        playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />';
        isPlaying = true;
      }
    }

    function reset() {
      clearInterval(intervalId);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      isPlaying = false;
      currentTime = 0;
      lastKnownSceneIndex = -1;
      playIcon.innerHTML = '<path d="M8 5v14l11-7z" />';
      render();
    }

    // Toggle voice synthesizer sound
    soundBtn.addEventListener('click', () => {
      voiceEnabled = !voiceEnabled;
      if (voiceEnabled) {
        soundBtn.className = 'p-1.5 rounded-full bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors';
        soundIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z" />';
        
        // speak immediately if playing
        if (isPlaying) {
          const activeIndex = Math.min(Math.floor(currentTime / 3), 4);
          speakNarration(scenes[activeIndex].narration);
        }
      } else {
        soundBtn.className = 'p-1.5 rounded-full bg-slate-800 text-slate-500 hover:bg-slate-700 transition-colors';
        soundIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />';
        if (window.speechSynthesis) window.speechSynthesis.cancel();
      }
    });

    timelineEl.addEventListener('input', (e) => {
      currentTime = parseFloat(e.target.value);
      lastKnownSceneIndex = -1;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      render();
    });

    playBtn.addEventListener('click', play);
    resetBtn.addEventListener('click', reset);

    // Initial Render
    render();
    
    // Voice load triggers
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      if (typeof window.speechSynthesis.addEventListener === 'function') {
        window.speechSynthesis.addEventListener('voiceschanged', render);
      }
    }
  </script>
</body>
</html>`;
}
