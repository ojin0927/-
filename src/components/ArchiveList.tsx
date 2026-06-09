import React, { useState } from "react";
import { SavedVideo } from "../types";
import { CalendarDays, Play, Trash2, Search, FileText, Sparkles, FolderHeart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ArchiveListProps {
  savedVideos: SavedVideo[];
  onLoadVideo: (video: SavedVideo) => void;
  onDeleteVideo: (id: string) => void;
}

export default function ArchiveList({
  savedVideos,
  onLoadVideo,
  onDeleteVideo
}: ArchiveListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVideos = savedVideos.filter((video) =>
    video.noticeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.data.meta.coreBenefits.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by Date
  const groupedVideos: { [date: string]: SavedVideo[] } = {};
  filteredVideos.forEach((video) => {
    const d = video.savedDate;
    if (!groupedVideos[d]) {
      groupedVideos[d] = [];
    }
    groupedVideos[d].push(video);
  });

  const sortedDates = Object.keys(groupedVideos).sort((a, b) => b.localeCompare(a));

  return (
    <div id="archives-section" className="bg-white rounded-3xl border border-sky-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-sky-100/50 pb-4 mb-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
            <FolderHeart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-800">완성된 숏폼 아카이브 (보관함)</h2>
            <p className="text-3xs text-slate-500">지금까지 생성하고 다듬은 홍보 숏폼 영상들이 날짜별로 보관됩니다.</p>
          </div>
        </div>

        {/* Local Search inside Archive */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="보관소 제목, 혜택 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-3xs rounded-xl border border-sky-100 bg-slate-50/50 placeholder-slate-400 text-slate-700 focus:outline-none focus:border-sky-400 focus:bg-white transition-all shadow-inner-sm"
          />
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 border border-dashed border-sky-100 rounded-xl bg-slate-50/30">
          <CalendarDays className="w-10 h-10 text-slate-300 mb-2.5" />
          <h3 className="text-xs font-semibold text-slate-600 mb-1">저장된 숏폼 영상이 없습니다.</h3>
          <p className="text-3xs text-slate-400 px-10 text-center">
            공익 공지사항 목록에서 공지를 고르고 우측의 <strong>숏폼 생성</strong> 버튼을 누른 후, 에디터 하단의 <strong>대시보드 보관소 저장</strong> 버튼을 터치하여 첫 숏폼 영상 기획안을 등록해보세요!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date} className="space-y-2.5">
              {/* Date Group Header */}
              <div className="flex items-center gap-2 text-slate-700 font-sans">
                <CalendarDays className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-black tracking-wide bg-sky-50 text-sky-600 px-3 py-0.5 rounded-full border border-sky-100">
                  {date}
                </span>
                <span className="text-4xs text-slate-400 font-medium">총 {groupedVideos[date].length}개 홍보 시안</span>
              </div>

              {/* Items under this date */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <AnimatePresence>
                  {groupedVideos[date].map((video) => (
                    <motion.div
                      key={video.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -3 }}
                      className="bg-white border border-sky-100/90 hover:border-sky-300 hover:shadow-sm rounded-2xl p-4 flex flex-col justify-between transition-all"
                    >
                      <div>
                        {/* Meta Category and Time */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-5xs bg-sky-500 text-white font-bold px-2 py-0.5 rounded">
                            {video.data.recommendVoice.split(" ")[0] || "20대 여성"}
                          </span>
                          <span className="text-5xs text-slate-400 font-mono font-medium">{video.savedTime}</span>
                        </div>

                        {/* Title of original announcement */}
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-sky-600">
                          {video.noticeTitle}
                        </h4>

                        {/* Extracted Core Benefit */}
                        <p className="text-3xs font-medium text-emerald-600 mt-1 lines-clamp-2 bg-emerald-50/50 p-1.5 rounded border border-emerald-100/30">
                          🎯 혜택: {video.data.meta.coreBenefits}
                        </p>

                        {/* Summary of 15s scenes */}
                        <div className="mt-3.5 pt-3 border-t border-dashed border-slate-100 space-y-1">
                          <div className="text-[10px] text-slate-400 font-bold">5개 장면 구성 카피 프리뷰</div>
                          {video.data.scenes.slice(0, 3).map((s) => (
                            <div key={s.sceneNumber} className="flex items-center gap-1.5 text-3xs text-slate-500">
                              <span className="text-sky-500 font-extrabold w-3">{s.sceneNumber}</span>
                              <span className="truncate flex-1">{s.caption}</span>
                            </div>
                          ))}
                          <div className="text-5xs text-slate-400 italic text-right">외 2장면 더보기...</div>
                        </div>
                      </div>

                      {/* Load & play actions */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => onLoadVideo(video)}
                          className="flex-1 py-1.5 bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white rounded-lg text-3xs font-black transition-all flex items-center justify-center gap-1 active:scale-95 border border-sky-100"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          가상 재생 & 내역 편집
                        </button>
                        <button
                          onClick={() => onDeleteVideo(video.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
