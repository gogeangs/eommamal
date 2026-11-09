import type { LangId } from '../content';

/** Parent-screen headings in the family's language. Korean is always shown next to them. Drafts for native review. */
type Key =
  | 'title' | 'week' | 'books' | 'words' | 'written' | 'sentences'
  | 'hard' | 'hardTip' | 'noHard' | 'learnedList' | 'done' | 'reading' | 'notYet'
  | 'children' | 'privacy';

export const KO: Record<Key, string> = {
  title: '우리 아이 기록',
  week: '최근 7일 동안 공부한 날',
  books: '읽은 책',
  words: '익힌 낱말',
  written: '받아쓴 낱말',
  sentences: '받아쓴 문장',
  hard: '자주 틀리는 낱말',
  hardTip: '집에서 모국어로 뜻을 말해 주고, 한국어로 함께 말해 보세요. 다음에 한 번에 맞히면 목록에서 줄어들어요.',
  noHard: '아직 틀린 낱말이 없어요.',
  learnedList: '익힌 낱말 모두 보기',
  done: '다 읽음',
  reading: '읽는 중',
  notYet: '아직',
  children: '아이 관리',
  privacy: '기록은 이 기기에만 저장되고, 어디에도 보내지 않아요.',
};

const MO: Record<LangId, Record<Key, string>> = {
  ru: {
    title: 'Успехи ребёнка', week: 'Дни занятий за последние 7 дней', books: 'Прочитанные книги', words: 'Выученные слова',
    written: 'Написанные слова', sentences: 'Написанные фразы', hard: 'Трудные слова',
    hardTip: 'Объясните значение на родном языке, а потом скажите слово по-корейски вместе.',
    noHard: 'Пока ошибок нет.', learnedList: 'Все выученные слова', done: 'Прочитано', reading: 'Читает', notYet: 'Ещё нет',
    children: 'Дети', privacy: 'Записи хранятся только на этом устройстве и никуда не отправляются.',
  },
  mn: {
    title: 'Хүүхдийн ахиц', week: 'Сүүлийн 7 хоногт хичээллэсэн өдөр', books: 'Уншсан ном', words: 'Сурсан үг',
    written: 'Бичсэн үг', sentences: 'Бичсэн өгүүлбэр', hard: 'Байнга алддаг үг',
    hardTip: 'Утгыг нь эх хэлээрээ тайлбарлаад, солонгосоор хамт хэлээрэй.',
    noHard: 'Одоогоор алдсан үг алга.', learnedList: 'Сурсан бүх үг', done: 'Уншсан', reading: 'Уншиж байна', notYet: 'Хараахан',
    children: 'Хүүхдүүд', privacy: 'Тэмдэглэл зөвхөн энэ төхөөрөмжид хадгалагдана, хаашаа ч илгээгдэхгүй.',
  },
  vi: {
    title: 'Kết quả học của con', week: 'Số ngày học trong 7 ngày qua', books: 'Truyện đã đọc', words: 'Từ đã học',
    written: 'Từ đã viết', sentences: 'Câu đã viết', hard: 'Từ con hay nhầm',
    hardTip: 'Hãy giải thích nghĩa bằng tiếng mẹ đẻ, rồi cùng con nói bằng tiếng Hàn.',
    noHard: 'Chưa có từ nào sai.', learnedList: 'Xem tất cả từ đã học', done: 'Đã đọc xong', reading: 'Đang đọc', notYet: 'Chưa đọc',
    children: 'Các con', privacy: 'Dữ liệu chỉ lưu trên máy này và không gửi đi đâu.',
  },
  uz: {
    title: 'Farzandim natijalari', week: "So'nggi 7 kunda o'qigan kunlar", books: "O'qilgan ertaklar", words: "O'rganilgan so'zlar",
    written: "Yozilgan so'zlar", sentences: 'Yozilgan gaplar', hard: "Ko'p adashadigan so'zlar",
    hardTip: "Ma'nosini ona tilida tushuntiring, keyin koreyschada birga ayting.",
    noHard: "Hozircha xato so'z yo'q.", learnedList: "Barcha o'rganilgan so'zlar", done: "O'qildi", reading: "O'qiyapti", notYet: 'Hali emas',
    children: 'Farzandlar', privacy: "Ma'lumotlar faqat shu qurilmada saqlanadi va hech qayerga yuborilmaydi.",
  },
  zh: {
    title: '孩子的学习记录', week: '最近7天的学习天数', books: '读过的故事', words: '学会的词语',
    written: '会写的词语', sentences: '会写的句子', hard: '常错的词语',
    hardTip: '先用母语讲讲意思，再和孩子一起用韩语说一说。',
    noHard: '还没有答错的词语。', learnedList: '查看全部学会的词语', done: '读完了', reading: '在读', notYet: '还没读',
    children: '孩子', privacy: '记录只保存在这台设备上，不会发送到任何地方。',
  },
  en: {
    title: "Your child's progress", week: 'Days practiced in the last 7 days', books: 'Stories read', words: 'Words learned',
    written: 'Words spelled', sentences: 'Phrases written', hard: 'Tricky words',
    hardTip: 'Explain the meaning in your language, then say the word together in Korean.',
    noHard: 'No tricky words yet.', learnedList: 'See all learned words', done: 'Finished', reading: 'Reading', notYet: 'Not yet',
    children: 'Children', privacy: 'Records stay on this device and are never sent anywhere.',
  },
};

export const pt = (lang: LangId, key: Key) => MO[lang][key];
