export interface Scene {
  sceneNumber: number;
  title: string; // e.g. "Scene 1 [HOOK - 혜택 강조]"
  timeRange: string; // e.g. "0~3s"
  caption: string;
  narration: string;
  prompt: string;
  visualConcept: string;
}

export interface ShortformData {
  recommendVoice: string;
  tone: string;
  scenes: Scene[];
  meta: {
    title: string;
    coreBenefits: string;
    youtubeTitle?: string;
    youtubeTags?: string[];
    youtubeDescription?: string;
    recommendedBpmBgm?: string;
  };
}

export interface SavedVideo {
  id: string;
  noticeId: string;
  noticeTitle: string;
  noticeUrl?: string;
  savedDate: string; // Format: YYYY-MM-DD
  savedTime: string; // Format: HH:MM:SS
  data: ShortformData;
}

export interface Notice {
  id: string;
  title: string;
  url: string;
  date: string;
  category: string;
  author: string;
  content?: string;
  isScraped?: boolean;
}
