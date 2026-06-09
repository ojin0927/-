import React, { useState } from "react";
import { Search, RefreshCw, FileText, ChevronRight, Sparkles, AlertCircle, BookOpen, ExternalLink } from "lucide-react";
import { Notice } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface NoticeListProps {
  notices: Notice[];
  selectedNotice: Notice | null;
  onSelectNotice: (notice: Notice) => void;
  isLoadingList: boolean;
  onRefreshList: () => void;
  onGenerate: (notice: Notice) => void;
  isGenerating: boolean;
  targetPlatform: "standard" | "youtube";
  onChangePlatform: (val: "standard" | "youtube") => void;
}

export default function NoticeList({
  notices,
  selectedNotice,
  onSelectNotice,
  isLoadingList,
  onRefreshList,
  onGenerate,
  isGenerating,
  targetPlatform,
  onChangePlatform
}: NoticeListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  // Filter logic
  const categories = ["전체", ...Array.from(new Set(notices.map((n) => n.category || "공지사항")))];

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (notice.content && notice.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "전체" || notice.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="notice-list-container" className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-sky-100/50 bg-sky-50/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 leading-tight">경기도 공익공지 채널</h2>
              <p className="text-[10px] text-sky-600 font-semibold mt-0.5">실시간 데이터 연동 중</p>
            </div>
          </div>
          <button
            onClick={onRefreshList}
            disabled={isLoadingList || isGenerating}
            className="p-1.5 rounded-lg bg-white border border-sky-100 text-sky-600 hover:bg-sky-50 hover:text-sky-700 transition-colors disabled:opacity-50"
            title="목록 새로고침"
            id="btn-refresh-notices"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mt-3">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="공지 제목 또는 핵심 단어 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-3xs rounded-xl border border-sky-100 bg-white placeholder-slate-400 text-slate-700 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-450 transition-all shadow-inner-sm"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex gap-1.5 overflow-x-auto mt-3 pb-1 no-scrollbar">
          {categories.slice(0, 7).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-4xs font-bold rounded-full shrink-0 transition-all ${
                selectedCategory === cat
                  ? "bg-sky-500 text-white shadow-xs"
                  : "bg-white text-slate-500 border border-sky-100/70 hover:bg-sky-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notice Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[480px] lg:max-h-none">
        {isLoadingList ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mb-3" />
            <p className="text-xs">공익 포털 공지사항 정보 파싱 중...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 border border-dashed border-sky-100 rounded-xl bg-slate-50/30">
            <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs">일치하는 공지사항이 없습니다.</p>
          </div>
        ) : (
          filteredNotices.map((notice) => {
            const isSelected = selectedNotice?.title === notice.title;
            return (
              <motion.div
                key={notice.id || notice.title}
                whileHover={{ scale: 1.01 }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-sky-50/70 border-sky-300 shadow-sm"
                    : "bg-white border-sky-100/70 hover:border-sky-200 hover:bg-slate-50/50"
                }`}
                onClick={() => onSelectNotice(notice)}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-2 py-0.5 text-3xs font-semibold rounded ${
                      notice.isScraped 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                        : "bg-sky-50 text-sky-600 border border-sky-100"
                    }`}>
                      {notice.category || "공지사항"}
                    </span>
                    <span className="text-3xs font-mono text-slate-400">{notice.date}</span>
                  </div>
                  <h3 className="text-xs font-medium text-slate-800 line-clamp-2 leading-relaxed mb-1">
                    {notice.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-dashed border-sky-50">
                  <div className="text-3xs text-slate-500 flex items-center">
                    <span className="mr-1">{notice.author || "관리자"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {notice.url && (
                      <a
                        href={notice.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded text-slate-400 hover:text-sky-500 hover:bg-sky-50/50 transition-colors"
                        title="원문 웹사이트 보기"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onGenerate(notice);
                      }}
                      disabled={isGenerating}
                      className={`px-2.5 py-1 rounded-lg text-2xs font-semibold flex items-center gap-1 transition-all ${
                        isSelected
                          ? "bg-sky-600 text-white hover:bg-sky-700 shadow-sm"
                          : "bg-sky-50 text-sky-600 hover:bg-sky-100"
                      } disabled:opacity-50`}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      숏폼 생성
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Notice Viewer Detail Drawer at bottom */}
      <AnimatePresence>
        {selectedNotice && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-sky-100 bg-sky-50/20 p-4 shrink-0 transition-all"
          >
            {/* Platform Target Selector */}
            <div className="mb-3.5">
              <span className="text-[9px] font-black text-slate-400 block mb-1.5 uppercase tracking-wider">
                🎯 숏폼 기획 타겟 매체 설정
              </span>
              <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => onChangePlatform("youtube")}
                  className={`flex-1 py-1 px-1.5 text-[10px] font-bold rounded-lg transition-all ${
                    targetPlatform === "youtube"
                      ? "bg-white text-rose-600 shadow-2xs border border-rose-150 font-black"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title="유튜브 쇼츠, 인스타 릴스, 틱톡에 맞는 고자극 호기심 유발 및 속도감 있는 캐주얼 톤앤매너로 대본 생성"
                >
                  🎬 유튜브 쇼츠 전용
                </button>
                <button
                  onClick={() => onChangePlatform("standard")}
                  className={`flex-1 py-1 px-1.5 text-[10px] font-bold rounded-lg transition-all ${
                    targetPlatform === "standard"
                      ? "bg-white text-sky-600 shadow-2xs border border-sky-150 font-black"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title="경기도 지원기관 공식 배포를 위한 유려하고 정보 전달력 높은 친근한 정보전달 톤앤매너로 대본 생성"
                >
                  📢 센터 공식 일반용
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <h4 className="text-2xs font-semibold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-sky-500" />
                공지 원문 세부 내용 요약
              </h4>
              <button
                onClick={() => onGenerate(selectedNotice)}
                disabled={isGenerating}
                className={`px-3 py-1 text-white rounded-lg text-2xs font-bold active:scale-95 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 ${
                  targetPlatform === "youtube" ? "bg-rose-500 hover:bg-rose-600" : "bg-sky-500 hover:bg-sky-600"
                }`}
              >
                {isGenerating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {targetPlatform === "youtube" ? "쇼츠 기획 시작!" : "일반 숏폼 기획 시작"}
              </button>
            </div>
            <div className="max-h-36 overflow-y-auto text-3xs text-slate-500 leading-relaxed bg-white border border-sky-100/50 rounded-lg p-2.5 font-sans whitespace-pre-line">
              {selectedNotice.content ? (
                selectedNotice.content
              ) : (
                <span className="text-slate-400 italic">
                  기본 분석 데이터는 실시간 공지사항 제목에서 지능적으로 요약됩니다. "기획 시작" 버튼을 터치하여 전체 5장면 기획을 시작하세요!
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
