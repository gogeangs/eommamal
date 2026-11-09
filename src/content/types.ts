export type LangId = 'ru' | 'mn' | 'vi' | 'uz' | 'zh' | 'en';
export type Text = Record<LangId, string> & { ko: string };

export interface Lang { id: LangId; name: string; ko: string; tts: string }
export interface UiText { read: string; listen: string; stop: string; lp: string; sp: string; ok: string }
export interface Page extends Text {
  art: () => string;
  /** finished illustration under public/, if one exists */
  img?: string;
  w: string[];
}
export interface Story {
  id: string;
  title: Text;
  sub: string;
  pages: Page[];
  words: string[];
  culture?: boolean;
  /** everyday life at kindergarten or school */
  life?: boolean;
  /** a Korean folktale */
  folk?: boolean;
  /** short phrases for sentence dictation; w = hint picture */
  phrases?: { ko: string; w: string }[];
  /** kept but not shown on the shelf */
  hidden?: boolean;
}
export interface Word extends Text { bg: string }
export interface CultureCard { place: string; head: string; items: [string, string][] }
/** One culture story's comparison card in every language. */
export interface CultureSet {
  /** picture file prefix under images/culture/ ('' → images/culture/ru.webp) */
  img: string;
  /** Korean lead after the place name, e.g. '의 새해는 어떨까요?' */
  lead: string;
  askKo: string;
  ask: Record<LangId, string>;
  cards: Record<LangId, CultureCard>;
}
