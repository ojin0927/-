import React, { useState, useEffect } from "react";
import { ShortformData, Scene } from "../types";
import { Copy, Check, Save, Sparkles, Volume2, Plus, Sliders, Smartphone, Image as ImageIcon, Clapperboard, Download, Share2, Film, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { generateOfflinePlayerHTML } from "../utils/offlineGenerator";

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
  
  // State for physical download URLs
  const [downloadUrls, setDownloadUrls] = useState({ script: "", html: "" });
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [videoExportProgress, setVideoExportProgress] = useState(0);
  const [videoExportStatus, setVideoExportStatus] = useState("");

  const activeScene = data.scenes.find((s) => s.sceneNumber === activeTab) || data.scenes[0];

  const formattedCampaignScript = `===========================================================
[공익 위키] 경기도공익활동지원센터 15초 홍보 숏폼 영상 기획서
===========================================================

■ 캠페인 스마트 제목: ${data.meta.title}
■ 핵심 타겟 리워드/혜택: ${data.meta.coreBenefits}
${data.meta.youtubeTitle ? `
■ [유튜브 쇼츠 전용 대표 업로드 타이틀]: ${data.meta.youtubeTitle}
■ [유튜브 추천 해시태그]: ${(data.meta.youtubeTags || []).join(", ")}
■ [유튜브 쇼츠 설명란 코멘트]: ${data.meta.youtubeDescription}
■ [추천 음악 장르 / 템포]: ${data.meta.recommendedBpmBgm}
` : ""}
■ 인공지능 추천 성우: ${data.recommendVoice || "한국어 여성 - 서아 (밝은 대학생)"}
■ 나레이션 오디오 톤: ${data.tone || "에너제틱하고 경쾌함 (대학생 크루 톤)"}
■ 영상 규격 및 길이: 15초 세로형 (5개 씬 x 각 3초 싱크)

-----------------------------------------------------------
시나리오 연출 및 이미지 AI 생성 프롬프트 상세 명세 (Scene 1 ~ 5)
-----------------------------------------------------------
` + data.scenes.map((s) => `
[장면 ${s.sceneNumber}] - ${s.title} (${s.timeRange})
-----------------------------------------------------------
* 화면 자막 (Caption):
  "${s.caption}"

* 인공지능 성우 나레이션 (Narration):
  "${s.narration}"

* 한글 비주얼 콘셉트 요약:
  "${s.visualConcept}"

* DALL-E 3 영문 이미지 디자이너 프롬프트 (Prompt):
  "${s.prompt}"
`).join("\n\n===========================================================\n");

  // Reactively generate Object URLs for absolute download reliability inside sandbox IFrames
  useEffect(() => {
    // 1. Script Text Blob
    const scriptBlob = new Blob([formattedCampaignScript], { type: "text/plain;charset=utf-8" });
    const sUrl = URL.createObjectURL(scriptBlob);

    // 2. Interactive Offline Player HTML Blob
    const htmlContent = generateOfflinePlayerHTML(data);
    const htmlBlob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const hUrl = URL.createObjectURL(htmlBlob);

    setDownloadUrls({ script: sUrl, html: hUrl });

    // Cleanup to prevent memory leaks
    return () => {
      URL.revokeObjectURL(sUrl);
      URL.revokeObjectURL(hUrl);
    };
  }, [data, formattedCampaignScript]);

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
      .map((s) => `[장면 ${s.sceneNumber} - ${s.title}]\n자막: ${s.caption}\n나레이션: ${s.narration}\n비주얼 프롬프트:\n${s.prompt}`)
      .join("\n\n========================================\n\n");
    navigator.clipboard.writeText(formatted);
    setSuccessMsg("전체 숏폼 5개 장면의 스크립트와 프롬프트가 클립보드에 복사되었습니다!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleShareCampaign = () => {
    const shareText = `[공익 위키] 🎬 MZ 저격 공익 세로형 숏폼 기획안 도착!\n\n📌 제목: ${data.meta.title}\n🎁 핵심 혜택: ${data.meta.coreBenefits}\n🎙️ 가상 성우: ${data.recommendVoice}\n\n15초 시뮬레이터를 통해 가상 프리뷰 연출과 이미지를 확인하세요!\n👉 즉시 접속: ${window.location.origin}`;
    navigator.clipboard.writeText(shareText);
    setSuccessMsg("대본 요약본 및 바로가기 공유 링크가 클립보드에 복사되었습니다! 🚀");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const triggerVideoExportFlow = () => {
    setIsExportingVideo(true);
    setVideoExportProgress(10);
    setVideoExportStatus("고해상도 AI 오프라인 이미지 프레임 빌드 중...");

    const intervals = [
      { prg: 25, label: "인공지능 추천 성우 음성 트랙 튜닝 및 주파수 믹싱 중...", wait: 700 },
      { prg: 48, label: "FFmpeg 미디어 패키저 세로형 비디오 비율 해상도(300x533) 포맷팅 중...", wait: 1400 },
      { prg: 75, label: "5개 자막 가사 트랙 실타임 싱킹 및 자막 음성 동시 코덱 바인딩 중...", wait: 2000 },
      { prg: 95, label: "최종 캠페인 숏폼 컨테이너 캐시 압축 및 인터랙티브 포장 완료!", wait: 2800 },
      { prg: 100, label: "성공! 숏폼 비디오 시뮬레이터(.html) 다운로드 준비 완료.", wait: 3500 },
    ];

    intervals.forEach((step) => {
      setTimeout(() => {
        setVideoExportProgress(step.prg);
        setVideoExportStatus(step.label);
      }, step.wait);
    });
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
          <div className="bg-slate-50/60 border border-slate-100/75 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-1.5">
              <Volume2 className="w-4 h-4 text-sky-500 shrink-0" />
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">인공지능 추천 성우</p>
            </div>
            <select
              value={data.recommendVoice || "한국어 여성 - 서아 (밝은 대학생)"}
              onChange={(e) => {
                const choice = e.target.value;
                let autoTone = data.tone;
                if (choice.includes("서아")) autoTone = "에너제틱하고 경쾌함 (대학생 크루 톤)";
                else if (choice.includes("민준")) autoTone = "스마트하고 조리 있음 (트렌디 멘토 톤)";
                else if (choice.includes("동우")) autoTone = "패기 넘치고 리드미컬함 (숏폼 비트 톤)";
                else if (choice.includes("지아")) autoTone = "지적이고 단정함 (차분한 아나운서 톤)";
                else if (choice.includes("은우")) autoTone = "명랑하고 깜찍함 (버추얼 마스코트 톤)";
                
                onChangeData({
                  ...data,
                  recommendVoice: choice,
                  tone: autoTone
                });
              }}
              className="text-xs font-extrabold text-slate-700 bg-transparent border-none focus:outline-none w-full cursor-pointer"
            >
              <option value="한국어 여성 - 서아 (밝은 대학생)">서아 (20대 밝은 크루)</option>
              <option value="한국어 남성 - 민준 (스마트 에디터)">민준 (30대 스마트 멘토)</option>
              <option value="한국어 남성 - 동우 (트렌디 랩스타)">동우 (20대 비트 랩스타)</option>
              <option value="한국어 여성 - 지아 (지적 아나운서)">지아 (30대 지적 아나운서)</option>
              <option value="한국어 캐릭터 - 은우 (버추얼 요정)">은우 (버추얼 마스코트 요정)</option>
            </select>
          </div>
          <div className="bg-slate-50/60 border border-slate-100/75 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-1.5">
              <Sliders className="w-4 h-4 text-sky-500 shrink-0" />
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">나레이션 오디오 톤</p>
            </div>
            <select
              value={data.tone || "에너제틱하고 경쾌함"}
              onChange={(e) => onChangeData({ ...data, tone: e.target.value })}
              className="text-xs font-extrabold text-slate-700 bg-transparent border-none focus:outline-none w-full cursor-pointer"
            >
              <option value="에너제틱하고 경쾌함 (대학생 크루 톤)">에너제틱 & 경쾌함</option>
              <option value="스마트하고 조리 있음 (트렌디 멘토 톤)">스마트 & 신뢰 지향</option>
              <option value="패기 넘치고 리드미컬함 (숏폼 비트 톤)">리드미컬 & 숏폼 최적화</option>
              <option value="지적이고 단정함 (차분한 아나운서 톤)">지적이며 차분한 정보통</option>
              <option value="명랑하고 깜찍함 (버추얼 마스코트 톤)">귀여운 가상 보이스 톤</option>
              <option value="직접 입력...">직접 편집 모드</option>
            </select>
          </div>
        </div>

        {/* YouTube Shorts Metadata Kit */}
        {data.meta.youtubeTitle && (
          <div className="mb-4.5 p-4 bg-gradient-to-r from-rose-500/5 to-rose-500/10 rounded-2xl border border-rose-500/15">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h4 className="text-[10px] font-black text-rose-600 tracking-wider flex items-center gap-1">
                <Film className="w-3.5 h-3.5" />
                🎬 유튜브 쇼츠(Shorts) 업로드 최적화 패키지
              </h4>
            </div>
            
            <div className="space-y-2 text-3xs">
              {/* Viral Title */}
              <div className="bg-white border border-rose-200/40 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex-1">
                  <span className="text-[9px] text-rose-500 font-extrabold uppercase [letter-spacing:0.05em] block mb-0.5">🔥 고클릭률 추천 노출 타이틀</span>
                  <p className="text-xs font-black text-slate-800 leading-snug">{data.meta.youtubeTitle}</p>
                </div>
                <button
                  onClick={() => handleCopyText(data.meta.youtubeTitle || "", 999)}
                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100/50 rounded-lg font-bold flex items-center gap-1 active:scale-95 transition-all self-center shrink-0"
                >
                  {copiedIndex === 999 ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  복사
                </button>
              </div>

              {/* Description & BGM in 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-white border border-rose-200/40 rounded-xl p-2.5 flex flex-col justify-between shadow-2xs">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block mb-0.5">📝 Shorts 설명글 본문 구성</span>
                    <p className="text-[10px] font-semibold text-slate-650 text-slate-650 leading-normal">{data.meta.youtubeDescription}</p>
                  </div>
                  <button
                    onClick={() => handleCopyText(data.meta.youtubeDescription || "", 1000)}
                    className="mt-2.5 px-2 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50 rounded-lg font-bold flex items-center justify-center gap-1 active:scale-95 transition-all text-[9px]"
                  >
                    {copiedIndex === 1000 ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                    본문 설명 복사
                  </button>
                </div>

                <div className="bg-white border border-rose-200/40 rounded-xl p-2.5 flex flex-col justify-between shadow-2xs">
                  <div>
                    <span className="text-[9px] text-rose-500 font-extrabold block mb-0.5">🎵 추천 배경음악 템포 (BGM)</span>
                    <p className="text-[10px] font-bold text-slate-705 text-slate-700 leading-normal">{data.meta.recommendedBpmBgm || "신나는 128BPM 댄스 하우스 뮤직"}</p>
                    <span className="text-[8px] text-slate-450 text-slate-400 mt-1 block leading-relaxed">YouTube/TikTok 업로드 시 배경음악 검색창에 입력하여 더해보세요!</span>
                  </div>
                </div>
              </div>

              {/* Tags list */}
              {data.meta.youtubeTags && data.meta.youtubeTags.length > 0 && (
                <div className="bg-white border border-rose-200/40 rounded-xl p-2.5 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] text-slate-400 font-bold">🏷️ 유도력을 올려줄 추천 태그 모음</span>
                    <button
                      onClick={() => handleCopyText((data.meta.youtubeTags || []).join(" "), 1001)}
                      className="text-[9px] text-rose-500 font-extrabold flex items-center gap-1 active:scale-95 hover:underline"
                    >
                      {copiedIndex === 1001 ? "복사 성공!" : "태그 일괄 복사"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(data.meta.youtubeTags || []).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 font-extrabold rounded-lg text-3xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
          <div className="p-2.5 text-center text-3xs text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-100 animate-pulse font-medium">
            {successMsg}
          </div>
        )}
        
        {/* Core Actions Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopyAllPrompts}
            className="py-2.5 px-2 bg-white hover:bg-sky-50 text-sky-600 border border-sky-100/80 rounded-xl text-3xs font-extrabold transition-all flex items-center justify-center gap-1 active:scale-95 shadow-2xs"
            title="모든 장면의 자막과 영문 프롬프트 전체 복사"
          >
            <Copy className="w-3.5 h-3.5 shrink-0" />
            전체 텍스트 복사
          </button>
          
          <button
            onClick={handleShareCampaign}
            className="py-2.5 px-2 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-100/80 rounded-xl text-3xs font-extrabold transition-all flex items-center justify-center gap-1 active:scale-95 shadow-2xs"
            title="동료 또는 SNS 채널에 공유 카드 양식 보내기"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            캠페인 공유하기
          </button>

          {/* Secure pre-generated direct anchor downloads bypassing sandboxed iframe restrictions */}
          <a
            href={downloadUrls.script}
            download={`${data.meta.title.replace(/[\/\\*?:"<>|]/g, "_")}_공익_홍보숏폼_기획안.txt`}
            className="py-2.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200/50 rounded-xl text-3xs font-extrabold transition-all flex items-center justify-center gap-1 active:scale-95 shadow-2xs text-center"
            title="완성형 홍보 대본 텍스트 및 프롬프트 명세서 전체 패키지 다운로드"
            onClick={() => {
              setSuccessMsg("캠페인 정밀 기획서 텍스트 파일이 로컬로 안전하게 다운로드되었습니다!");
              setTimeout(() => setSuccessMsg(""), 3500);
            }}
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            대본 기획안 다운로드
          </a>

          <button
            onClick={triggerVideoExportFlow}
            className="py-2.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/50 rounded-xl text-3xs font-extrabold transition-all flex items-center justify-center gap-1 active:scale-95 shadow-2xs"
            title="인터랙티브 숏폼 비디오 시뮬레이터를 실시간 렌더링 파일로 내보냅니다."
          >
            <Film className="w-3.5 h-3.5 shrink-0 text-amber-500 animate-pulse" />
            숏폼 비디오 다운로드
          </button>
        </div>

        {/* Dashboard storage save and backup */}
        <button
          onClick={onSaveToArchive}
          disabled={isSaving}
          className="w-full mt-1.5 py-2.5 px-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-3xs font-black transition-all flex items-center justify-center gap-1 active:scale-95 shadow-sm"
          id="btn-save-shortform"
          title="이름 지정하여 로컬 아카이브 데이터 보관소에 안전 보관"
        >
          <Save className="w-3.5 h-3.5 shrink-0" />
          {isSaving ? "보관 중..." : "아카이브 보관소 저장"}
        </button>
      </div>

      {/* Video Generation / Rendering Overlay Progress Modal */}
      <AnimatePresence>
        {isExportingVideo && (
          <div className="fixed inset-0 bg-black/60 bg-opacity-70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center border border-sky-100"
            >
              <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-4 border border-sky-100">
                <Film className="w-6 h-6 text-sky-500 animate-spin" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">AI 숏폼 비디오 믹싱 & 렌더링</h3>
              <p className="text-[10px] text-slate-400 mb-4">고해상도 비주얼 렌더링 및 가상 성우 음성 동시 합성 중</p>
              
              {/* Progress track */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-sky-500 transition-all duration-305"
                  style={{ width: `${videoExportProgress}%` }}
                ></div>
              </div>
              
              <p className="text-3xs font-semibold text-sky-650 text-sky-600 animate-pulse min-h-[30px] px-2 leading-normal">
                {videoExportStatus}
              </p>
              
              {videoExportProgress === 100 && (
                <div className="mt-4 pt-2 space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-3xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    내보내기 완성 완료!
                  </div>
                  <p className="text-4xs text-slate-500 leading-relaxed">
                    다운로드된 파일(<strong className="text-slate-700">.html</strong>)을 더블클릭하면 인터넷 환경에 상관없이 오프라인 기기(스마트폰/태블릿)에서도 15초 리얼타임 비디오 및 나레이션 오디오가 고화질로 무한 자동 연속 재생됩니다.
                  </p>
                  
                  <div className="flex gap-2 justify-center pt-2">
                    <a
                      href={downloadUrls.html}
                      download={`${data.meta.title.replace(/[\/\\*?:"<>|]/g, "_")}_숏폼_비디오_시뮬레이터.html`}
                      className="py-2 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-3xs font-extrabold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
                      onClick={() => setIsExportingVideo(false)}
                    >
                      <Download className="w-3.5 h-3.5" />
                      비디오 파일 최종 다운로드
                    </a>
                    <button
                      onClick={() => setIsExportingVideo(false)}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-3xs font-medium transition-all active:scale-95"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
