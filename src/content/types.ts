export type LangId = 'ru' | 'mn' | 'vi' | 'uz' | 'zh' | 'en';
export type Text = Record<LangId, string> & { ko: string };

export interface Lang { id: LangId; name: string; ko: string; tts: string }
export interface UiText { read: string; listen: string; stop: string; lp: string; sp: string; ok: string }
export interface Page extends Text { art: () => string; w: string[] }
export interface Story {
  id: string;
  title: Text;
  sub: string;
  pages: Page[];
  words: string[];
  culture?: boolean;
}
export interface Word extends Text { bg: string }
export interface CultureCard { place: string; head: string; items: [string, string][] }
