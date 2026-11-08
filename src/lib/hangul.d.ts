export type Pt = [number, number];
/** Strokes (in a 0..100 box) for one Hangul syllable, in standard stroke order; null if unsupported. */
export declare function strokesFor(ch: string): Pt[][] | null;
export declare function partial(p: Pt[], t: number): Pt[];
/** True when a traced path starts near, follows and roughly covers the reference stroke. */
export declare function matches(user: Pt[], ref: Pt[]): boolean;
