import type { LangId } from '../content';

/** Short child-facing interface strings. Korean remains visible as a secondary label. */
type Terms = {
  books:string; play:string; words:string; next:string; back:string; listen:string;
  retry:string; hint:string; choose:string; write:string; wellDone:string;
  home:string; continue:string; newStories:string; parent:string; settings:string;
  trace:string; dictation:string; storyPrompt:string; sentence:string;
};
const TERMS: Record<LangId,Terms> = {
  ru:{books:'Истории',play:'Играть',words:'Мои слова',next:'Дальше',back:'Назад',listen:'Слушать',retry:'Ещё раз',hint:'Подсказка',choose:'Выбери картинку',write:'Составь слово',wellDone:'Молодец!',home:'К историям',continue:'Читать дальше',newStories:'Другие истории',parent:'Для родителей',settings:'Настройки',trace:"Обводить",dictation:"Писать на слух",storyPrompt:"Какую историю почитаем?",sentence:'Писать фразы'},
  mn:{books:'Үлгэр',play:'Тоглох',words:'Миний үгс',next:'Дараах',back:'Буцах',listen:'Сонсох',retry:'Дахин',hint:'Тусламж',choose:'Зураг сонго',write:'Үг бүтээ',wellDone:'Сайн байна!',home:'Үлгэрүүд',continue:'Үргэлжлүүлэх',newStories:'Бусад үлгэр',parent:'Эцэг эхэд',settings:'Тохиргоо',trace:"Дагуулж бичих",dictation:"Сонсож бичих",storyPrompt:"Ямар үлгэр унших вэ?",sentence:'Өгүүлбэр бичих'},
  vi:{books:'Truyện',play:'Chơi',words:'Từ của em',next:'Tiếp',back:'Quay lại',listen:'Nghe',retry:'Thử lại',hint:'Gợi ý',choose:'Chọn hình',write:'Ghép chữ',wellDone:'Giỏi lắm!',home:'Về truyện',continue:'Đọc tiếp',newStories:'Truyện khác',parent:'Phụ huynh',settings:'Cài đặt',trace:"Tập viết",dictation:"Nghe và viết",storyPrompt:"Hôm nay đọc truyện gì?",sentence:'Viết câu'},
  uz:{books:'Ertaklar',play:"O'ynash",words:"So'zlarim",next:'Keyingi',back:'Orqaga',listen:'Tinglash',retry:'Yana',hint:'Yordam',choose:'Rasmni tanla',write:"So'z tuz",wellDone:'Barakalla!',home:'Ertaklar',continue:"Davom etish",newStories:'Boshqa ertaklar',parent:'Ota-onalar',settings:'Sozlamalar',trace:"Izidan yozish",dictation:"Eshitib yozish",storyPrompt:"Qaysi ertakni o'qiymiz?",sentence:'Gap yozish'},
  zh:{books:'故事',play:'游戏',words:'我的词语',next:'下一步',back:'返回',listen:'听一听',retry:'再试一次',hint:'提示',choose:'选图片',write:'拼词语',wellDone:'真棒！',home:'故事',continue:'继续阅读',newStories:'更多故事',parent:'家长专区',settings:'设置',trace:"描红",dictation:"听写",storyPrompt:"今天读什么故事？",sentence:'写句子'},
  en:{books:'Stories',play:'Play',words:'My words',next:'Next',back:'Back',listen:'Listen',retry:'Try again',hint:'Hint',choose:'Pick a picture',write:'Build the word',wellDone:'Great job!',home:'Stories',continue:'Keep reading',newStories:'More stories',parent:'For parents',settings:'Settings',trace:"Trace",dictation:"Spell",storyPrompt:"Which story today?",sentence:'Write phrases'}
};
export const t = (lang:LangId,key:keyof Terms) => TERMS[lang][key];
