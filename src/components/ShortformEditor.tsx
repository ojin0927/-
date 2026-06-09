import React, { useState, useEffect } from "react";
import { ShortformData, Scene } from "../types";
import { Copy, Check, Save, Sparkles, Volume2, Plus, Sliders, Smartphone, Image as ImageIcon, Clapperboard } from "lucide-react";
import { motion } from "motion/react";

interface ShortformEditorProps {
  data: ShortformData;
  onChangeData: (updatedData: ShortformData) => void;
  onSaveToArchive: () => void;
  isSaving: boolean;
}

export default function ShortformEditor({
  data,
  onChangeData,
  onSaveToArchive,
  isSaving
}: ShortformEditorProps) {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const activeScene = data.scenes.find((s) => s.sceneNumber === activeTab) || data.scenes[0];

  const handleFieldChange = (sceneNum: number, field: keyof Scene, value: any) => {
    const updatedScenes = data.scenes.map((scene) => {
      if (scene.sceneNumber === sceneNum) {
        return { ...scene, [field]: value };
      }
      return scene;
    });
    onChangeData({ ...data, scenes: updatedScenes });
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const handleCopyAllPrompts = () => {
    const formatted = data.scenes
      .map((s) => `[Scene ${s.sceneNumber} - ${s.title}]\n시간대: ${s.timeRange}\n자막: ${s.caption}\n나레이션: ${s.narration}\nDALL-E 3 프롬프트:\n${s.prompt}`)
      .join("\n\n========================================\n\n");
    navigator.clipboard.writeText(formatted);
    setSuccessMsg("전체 숏폼 5개 장면의 스크립트와 프롬프트가 클립보드에 복사되었습니다!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div id="shortform-editor-container" className="bg-white rounded-3xl border border-sky-100/80 shadow-sm p-6 flex flex-col h-full justify-between">
      <div>
        {/* Banner with Meta Info */}
        <div className="mb-4 p-4.5 bg-sky-50/50 rounded-2xl border border-sky-100/30 flex items-start gap-3">
          <Clapperboard className="w-5 h-5 text-sky-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="bg-sky-500 text-white w-5 h-5 rounded-md flex items-center justify-center text-3xs font-black italic">S</span>
              <h4 className="text-[10px] font-bold text-sky-600 tracking-widest uppercase">분석 결과 & 핵심 혜택</h4>
            </div>
            <h3 className="text-xs font-black text-slate-800 line-clamp-1 mt-1.5">{data.meta.title}</h3>
            <p className="text-3xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              핵심 혜택: {data.meta.coreBenefits}
            </p>
          </div>
        </div>

        {/* Audio Configuration Card */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50/60 border border-slate-100/75 rounded-2xl p-3 flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-sky-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">추천 인공지능 성우</p>
              <input
                type="text"
                value={data.recommendVoice}
                onChange={(e) => onChangeData({ ...data, recommendVoice: e.target.value })}
                className="text-3xs font-extrabold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none w-full"
              />
            </div>
          </div>
          <div className="bg-slate-50/60 border border-slate-100/75 rounded-2xl p-3 flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-sky-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">오디오 톤앤매너</p>
              <input
                type="text"
                value={data.tone}
                onChange={(e) => onChangeData({ ...data, tone: e.target.value })}
                className="text-3xs font-extrabold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* Scene Navigation Tabs */}
        <div className="flex border-b border-slate-100 pb-2 mb-4 overflow-x-auto no-scrollbar gap-1">
          {data.scenes.map((scene) => (
            <button
              key={scene.sceneNumber}
              onClick={() => setActiveTab(scene.sceneNumber)}
              className={`px-3.5 py-1.5 rounded-xl text-3xs font-extrabold transition-all shrink-0 ${
                activeTab === scene.sceneNumber
                  ? "bg-sky-500 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-850 hover:bg-slate-50"
              }`}
            >
              장면 {scene.sceneNumber}
              <span className="text-[9px] block font-medium opacity-85">{scene.timeRange}</span>
            </button>
          ))}
        </div>

        {/* Selected Scene Editor Block */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full">
              {activeScene.title} ({activeScene.timeRange})
            </span>
            <span className="text-3xs text-slate-400">장면별 약 3초 배정 (15초 가량)</span>
          </div>

          {/* Caption Input */}
          <div className="space-y-1.5">
            <label className="text-2xs font-semibold text-slate-700 flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              화면 자막 카피 (Caption)
            </label>
            <input
              type="text"
              value={activeScene.caption}
              onChange={(e) => handleFieldChange(activeScene.sceneNumber, "caption", e.target.value)}
              className="w-full p-2.5 text-xs text-slate-800 rounded-xl border border-sky-100 bg-slate-50/30 focus:outline-none focus:border-sky-400 focus:bg-white transition-all font-sans font-medium"
              placeholder="자막을 작성하세요..."
            />
            <div className="flex justify-between text-4xs text-slate-400 px-1">
              <span>MZ세대 이목 집중을 위한 간결한 구성 권장</span>
              <span>{activeScene.caption.length}자</span>
            </div>
          </div>

          {/* Narration Area */}
          <div className="space-y-1.5">
            <label className="text-2xs font-semibold text-slate-700 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              나레이션 대사 (Narration Script)
            </label>
            <textarea
              rows={2}
              value={activeScene.narration}
              onChange={(e) => handleFieldChange(activeScene.sceneNumber, "narration", e.target.value)}
              className="w-full p-2.5 text-xs text-slate-800 rounded-xl border border-sky-100 bg-slate-50/30 focus:outline-none focus:border-sky-400 focus:bg-white transition-all resize-none leading-relaxed"
              placeholder="성우 나레이션을 입력하세요..."
            />
          </div>

          {/* DALL-E Prompt Display & Editor */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-2xs font-semibold text-slate-700 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                DALL-E 3 영문 이미지 프롬프트
              </label>
              <button
                onClick={() => handleCopyText(activeScene.prompt, activeScene.sceneNumber)}
                className="text-4xs text-sky-600 bg-sky-50 border border-sky-100 px-2 py-1 rounded hover:bg-sky-100 transition-colors flex items-center gap-1 active:scale-95"
              >
                {copiedIndex === activeScene.sceneNumber ? (
                  <>
                    <Check className="w-2.5 h-2.5" /> 복사 완료!
                  </>
                ) : (
                  <>
                    <Copy className="w-2.5 h-2.5" /> 프롬프트 복사
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={3}
              value={activeScene.prompt}
              onChange={(e) => handleFieldChange(activeScene.sceneNumber, "prompt", e.target.value)}
              className="w-full p-2.5 text-[11px] text-slate-600 rounded-xl border border-sky-100 bg-slate-50/60 focus:outline-none focus:border-sky-400 focus:bg-white transition-all font-mono leading-normal"
              placeholder="영문 DALL-E 프롬프트를 작성하세요..."
            />
            {/* Visual concept subtitle */}
            <div className="p-2.5 bg-slate-50 rounded-lg text-3xs text-slate-500 leading-normal flex items-start gap-1">
              <span className="font-semibold text-sky-600 shrink-0">[시각 연출]</span>
              <span>{activeScene.visualConcept}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Button Action Bar */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
        {successMsg && (
          <div className="p-2.5 text-center text-3xs text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-100 animate-fade-in font-medium">
            {successMsg}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleCopyAllPrompts}
            className="flex-1 py-2.5 px-3 bg-white hover:bg-sky-50 text-sky-600 border border-sky-100 rounded-xl text-2xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Copy className="w-3.5 h-3.5" />
            전체 대본·프롬프트 복사
          </button>
          <button
            onClick={onSaveToArchive}
            disabled={isSaving}
            className="flex-1 py-2.5 px-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-2xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/10 hover:shadow-sky-500/20 active:scale-95 disabled:opacity-50"
            id="btn-save-shortform"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "보관소에 저장 중..." : "대시보드 보관소 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
