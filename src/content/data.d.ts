import type { Lang, LangId, UiText, Story, Word, CultureSet } from './types';
export declare const LANGS: Lang[];
export declare const UI: Record<LangId, UiText>;
export declare const STORIES: Story[];
export declare const V: Record<string, Word>;
export declare const ICON: Record<string, [() => string, string]>;
export declare const CULTURE: Record<string, CultureSet>;
