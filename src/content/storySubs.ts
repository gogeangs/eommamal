import type { LangId, Story } from './types';

/**
 * One-line story descriptions in the family's language (the shelf shows these instead of the Korean `sub`).
 * The category ("Korean folk tale" etc.) is already a tag on the card, so it is not repeated here.
 * Drafts for native review. A story added later without an entry falls back to its Korean line.
 */
const SUBS: Record<string, Record<LangId, string>> = {
  star: {
    ru: 'Кошка, которая проводила потерявшуюся звёздочку домой', mn: 'Төөрсөн одыг гэрт нь хүргэж өгсөн муур',
    vi: 'Chú mèo đưa ngôi sao lạc đường về nhà', uz: "Adashgan yulduzchani uyiga kuzatib qo'ygan mushuk",
    zh: '把迷路的小星星送回家的小猫', en: 'The cat who walked a lost star home',
  },
  umbrella: {
    ru: 'Друзья под маленьким зонтиком', mn: 'Жижиг шүхэр дор цугларсан найзууд',
    vi: 'Những người bạn dưới chiếc ô nhỏ', uz: "Kichkina soyabon ostida yig'ilgan do'stlar",
    zh: '小雨伞下的好朋友们', en: 'Friends under a little umbrella',
  },
  firstday: {
    ru: 'Первый день в детском саду: самые нужные слова', mn: 'Цэцэрлэгт анх очсон өдөр хэрэгтэй үгс',
    vi: 'Ngày đầu đến lớp mẫu giáo: những câu cần biết', uz: "Bog'chadagi birinchi kun: eng kerakli so'zlar",
    zh: '第一天上幼儿园要会说的话', en: "First day at kindergarten: words you'll need",
  },
  axe: {
    ru: 'Сказка о честном дровосеке', mn: 'Шударга модчин ахын үлгэр',
    vi: 'Câu chuyện về bác tiều phu thật thà', uz: "Halol o'tinchi haqida ertak",
    zh: '诚实的樵夫的故事', en: 'The tale of an honest woodcutter',
  },
  seollal: {
    ru: 'Новый год в Корее — и у нас дома', mn: 'Солонгосын шинэ жил, бас манай улсын шинэ жил',
    vi: 'Năm mới ở Hàn Quốc và năm mới ở quê mình', uz: 'Koreyadagi Yangi yil va bizning yurtimizdagi Yangi yil',
    zh: '韩国的新年，和我们国家的新年', en: 'New Year in Korea — and back home',
  },
  chuseok: {
    ru: 'Чхусок в Корее — и осень у нас дома', mn: 'Солонгосын Чусок, бас манай улсын намар',
    vi: 'Tết Trung thu Hàn Quốc và mùa thu ở quê mình', uz: 'Koreyadagi Chuseok va bizning yurtimizdagi kuz',
    zh: '韩国的中秋，和我们国家的秋天', en: 'Chuseok in Korea — and autumn back home',
  },
};

/** Category names that already appear as a tag; dropped from a Korean fallback line ("… · 한국 전래 동화"). */
const TAG_WORDS = ['한국 전래 동화', '문화 비교 카드', '유치원·학교 생활'];

export function storySub(s: Story, lang: LangId) {
  const mo = SUBS[s.id]?.[lang];
  if (mo) return { text: mo, lang };
  let ko = s.sub;
  for (const w of TAG_WORDS) ko = ko.replace(new RegExp(`\\s*·\\s*${w}`), '');
  return { text: ko, lang: 'ko' as const };
}
