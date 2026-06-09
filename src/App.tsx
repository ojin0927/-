import React, { useState, useEffect } from "react";
import { Notice, ShortformData, SavedVideo } from "./types";
import NoticeList from "./components/NoticeList";
import ShortformEditor from "./components/ShortformEditor";
import VideoPlayer from "./components/VideoPlayer";
import ArchiveList from "./components/ArchiveList";
import { Sparkles, RefreshCw, Layers, Volume2, CalendarDays, MonitorPlay, Film, ArrowRight, Zap, AlertTriangle, Sparkle, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  
  // App states
  const [activeShortform, setActiveShortform] = useState<ShortformData | null>(null);
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  
  // Loadings & state variables
  const [targetPlatform, setTargetPlatform] = useState<"standard" | "youtube">("youtube");
  
  // Loading & Error states
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load notices and saved videos on startup
  useEffect(() => {
    fetchNotices();
    loadSavedArchives();
  }, []);

  const fetchNotices = async () => {
    setIsLoadingList(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/notices");
      const data = await res.json();
      if (data.success) {
        setNotices(data.data);
        // default select the first one if none selected
        if (data.data.length > 0 && !selectedNotice) {
          handleSelectNotice(data.data[0]);
        }
      } else {
        throw new Error(data.error || "공지목록 파싱 오류");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("경기도공익활동지원센터 웹서버 통신 중 일부 데이터 차단 수신으로 인해 예비 공지팩 데이터 세트로 전환 구동합시다.");
    } finally {
      setIsLoadingList(false);
    }
  };

  const loadSavedArchives = () => {
    try {
      const stored = localStorage.getItem("gggongik_shortforms_vault");
      if (stored) {
        setSavedVideos(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Local archive reading error:", e);
    }
  };

  const handleSelectNotice = async (notice: Notice) => {
    setSelectedNotice(notice);
    setErrorMsg("");
    
    // If we already have content, don't fetch again
    if (notice.content) return;

    // Fetch details from backend crawl
    try {
      const res = await fetch("/api/notice-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: notice.url, id: notice.id })
      });
      const data = await res.json();
      if (data.success) {
        setNotices((prev) =>
          prev.map((n) => (n.title === notice.title ? { ...n, content: data.data } : n))
        );
        setSelectedNotice((prev) => (prev ? { ...prev, content: data.data } : null));
      }
    } catch (err) {
      console.warn("Notice detail parsing error: ", err);
    }
  };

  const handleGenerateShortform = async (notice: Notice) => {
    // First ensure we have detailed content to send or use title
    let contentToAnalyze = notice.content || "";
    if (!contentToAnalyze) {
      try {
        setIsGenerating(true);
        const res = await fetch("/api/notice-detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: notice.url, id: notice.id })
        });
        const data = await res.json();
        if (data.success) {
          contentToAnalyze = data.data;
          // save it
          setNotices((prev) =>
            prev.map((n) => (n.title === notice.title ? { ...n, content: data.data } : n))
          );
        }
      } catch (err) {
        console.warn("Detail fetch failed, continuing with title-only prediction", err);
      }
    }

    setIsGenerating(true);
    setErrorMsg("");
    try {
      const response = await fetch("/api/generate-shortform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: notice.title, content: contentToAnalyze, targetPlatform })
      });
      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setActiveShortform(resJson.data);
        
        // Scroll to workspace with mild lag for elegance
        setTimeout(() => {
          document.getElementById("workspace-title")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else {
        throw new Error(resJson.error || "숏폼 자막 생성 오류");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Gemini 크롤러를 활용한 숏폼 전용 자막 추출 세션이 제한되었습니다. 잠시 후 재생성해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToArchive = () => {
    if (!activeShortform || !selectedNotice) return;
    setIsSaving(true);

    const now = new Date();
    const savedDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const savedTime = now.toTimeString().split(" ")[0]; // HH:MM:SS

    const newVideo: SavedVideo = {
      id: `saved-${Date.now()}`,
      noticeId: selectedNotice.id || "manual-id",
      noticeTitle: selectedNotice.title,
      noticeUrl: selectedNotice.url,
      savedDate,
      savedTime,
      data: activeShortform
    };

    const updated = [newVideo, ...savedVideos];
    setSavedVideos(updated);
    localStorage.setItem("gggongik_shortforms_vault", JSON.stringify(updated));

    // Display trigger completion
    setTimeout(() => {
      setIsSaving(false);
      // scroll to archives section
      document.getElementById("archives-section")?.scrollIntoView({ behavior: "smooth" });
    }, 500);
  };

  const handleLoadSavedVideo = (video: SavedVideo) => {
    // Replay a completed campaign
    const mockNotice: Notice = {
      id: video.noticeId,
      title: video.noticeTitle,
      url: video.noticeUrl || "",
      date: video.savedDate,
      category: video.data.scenes[0]?.caption.slice(0, 5) || "보관건",
      author: "보관함"
    };

    setSelectedNotice(mockNotice);
    setActiveShortform(video.data);
    
    // smooth scrolling up
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteVideo = (id: string) => {
    const updated = savedVideos.filter((v) => v.id !== id);
    setSavedVideos(updated);
    localStorage.setItem("gggongik_shortforms_vault", JSON.stringify(updated));
  };

  const handleUpdateShortformData = (updated: ShortformData) => {
    setActiveShortform(updated);
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff] text-slate-800 font-sans flex flex-col justify-between selection:bg-sky-100 selection:text-sky-700">
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-500/15 active:scale-95 transition-transform">
              <Film className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-slate-900 tracking-tight">공익 위키</h1>
                <span className="px-2 py-0.5 text-[9px] bg-sky-100 text-sky-600 font-bold rounded-md">
                  AI Content Director
                </span>
              </div>
              <p className="text-4xs text-slate-500 font-medium leading-tight">MZ세대 맞춤형 15초 홍보 숏폼 대본 기획 & 이미지 프롬프트 발전소</p>
            </div>
          </div>

          {/* Quick Stats indicators */}
          <div className="flex items-center gap-3.5">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">CAMPAIGN VAULT</span>
              <span className="text-xs font-extrabold text-slate-800 font-sans">{savedVideos.length}개 보관 완료</span>
            </div>
            <button
              onClick={fetchNotices}
              disabled={isLoadingList}
              className="py-1.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-100 rounded-lg text-3xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingList ? "animate-spin" : ""}`} />
              실시간 상태 동기화
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Executive App Grid Space */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error Notification Toast if any */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-800 shadow-inner-sm"
            >
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="text-xs font-medium">
                <span className="font-extrabold block">시스템 경고</span>
                {errorMsg}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Outer Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left Block: Notices Sideboard (Cols Span: 4, or full on desktop) */}
          <div className="lg:col-span-4 h-full">
            <NoticeList
              notices={notices}
              selectedNotice={selectedNotice}
              onSelectNotice={handleSelectNotice}
              isLoadingList={isLoadingList}
              onRefreshList={fetchNotices}
              onGenerate={handleGenerateShortform}
              isGenerating={isGenerating}
              targetPlatform={targetPlatform}
              onChangePlatform={setTargetPlatform}
            />
          </div>

          {/* Right Block: Dynamic Work Canvas (Cols Span: 8) */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                /* Glowing Gemini AI Generation screen */
                <motion.div
                  key="generating-ai"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white border border-sky-100 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-sm h-full min-h-[500px]"
                >
                  <div className="relative mb-6">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
                      className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center text-sky-500 border border-sky-200"
                    >
                      <Sparkles className="w-8 h-8 text-sky-500 animate-spin" />
                    </motion.div>
                    <div className="absolute top-0 right-0 w-4.5 h-4.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse"></div>
                  </div>
                  
                  <h3 className="text-sm font-bold text-slate-800 mb-2">공지사항 정밀 분석 및 15초 캠페인 자막 설계 중</h3>
                  <p className="text-xs text-sky-600/95 font-medium max-w-[340px] leading-relaxed">
                    공지사항 전문에서 MZ 대학생들이 매료될 <strong>리워드(지원비, 공간 지원, 역량 컨설팅)</strong>을 1초 HOOK으로 리포지셔닝하는 작업과 5장면 비주얼 일러스트 프롬프트 작성을 시작합니다.
                  </p>
                  
                  {/* Progress Line */}
                  <div className="w-[200px] h-1.5 bg-sky-50 rounded-full mt-6 overflow-hidden border border-sky-100">
                    <motion.div
                      className="h-full bg-sky-500 rounded-full"
                      animate={{ x: [-200, 200] }}
                      transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                    ></motion.div>
                  </div>
                </motion.div>
              ) : activeShortform ? (
                /* Completed Active Shorts Generation Dashboard */
                <motion.div
                  key="shortform-canvas"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Section Label */}
                  <h3 id="workspace-title" className="text-xs font-black text-sky-600 flex items-center gap-1.5 px-1 uppercase tracking-widest">
                    <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
                    실시간 생성 숏폼 워크스페이스
                  </h3>

                  {/* Dual Grid: Editor & Smartphone player side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                    <div className="md:col-span-7">
                      <ShortformEditor
                        data={activeShortform}
                        onChangeData={handleUpdateShortformData}
                        onSaveToArchive={handleSaveToArchive}
                        isSaving={isSaving}
                      />
                    </div>
                    <div className="md:col-span-5">
                      <VideoPlayer data={activeShortform} />
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* App Onboarding guide if no active workspace draft */
                <motion.div
                  key="onboarding-guide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-3xl border border-sky-100/80 p-8 flex flex-col justify-center text-center h-full min-h-[500px] shadow-sm"
                >
                  <div className="max-w-md mx-auto flex flex-col items-center">
                    <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mb-5 border border-sky-100">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    
                    <h3 className="text-base font-bold text-slate-800 mb-2">공지사항을 선택해 숏폼 기획을 실행하세요!</h3>
                    <p className="text-sky-600 font-semibold text-xs mb-6">
                      경기공익포털의 원본 소식을 1초만에 시선을 잡아채는 15초 영상 기획으로 전면 전환합니다.
                    </p>

                    {/* Step Timeline Indicator */}
                    <div className="w-full space-y-4 text-left">
                      <div className="flex items-start gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-3xs font-bold shrink-0 mt-0.5">1</span>
                        <div>
                          <h4 className="text-2xs font-extrabold text-slate-700">공익포털 채널 공지사항 선택</h4>
                          <p className="text-3xs text-slate-400 leading-snug">좌측 피드에서 홍보 대상 공지를 선택하거나 검색에서 키워드를 필터링합니다.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-3xs font-bold shrink-0 mt-0.5">2</span>
                        <div>
                          <h4 className="text-2xs font-extrabold text-slate-700">숏폼 자막 및 AI 생성 클릭</h4>
                          <span className="text-3xs text-slate-400 leading-snug">"숏폼 생성" 단추를 누르면 Gemini가 세련된 5장면 숏폼 자막 카피 및 DALL-E 프롬프트를 만듭니다.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-3xs font-bold shrink-0 mt-0.5">3</span>
                        <div>
                          <h4 className="text-2xs font-extrabold text-slate-700">가상 기기 프리뷰 시뮬레이션</h4>
                          <p className="text-3xs text-slate-400 leading-snug">자막 가사 싱크를 확인 및 성우 음성을 체크하고 정밀 가다듬은 후 날짜별 보관고에 저장합니다.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 3. Bottom persistent historical Archive grouped by Saved Date */}
        <ArchiveList
          savedVideos={savedVideos}
          onLoadVideo={handleLoadSavedVideo}
          onDeleteVideo={handleDeleteVideo}
        />
      </main>

      {/* 3. Footer Block */}
      <footer className="bg-white border-t border-sky-100 py-6 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-600">경기도공익활동지원센터 공익활동 홍보 에디터 보드</span>
          </div>
          <div className="text-4xs text-slate-400 font-medium">
            Designed for Gyeonggi Public Interest Community Support Center. All content is generated securely with server-side AI.
          </div>
        </div>
      </footer>
    </div>
  );
}
