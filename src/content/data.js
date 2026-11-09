// Story, vocabulary and culture content. Text in every supported language lives here.
/* eslint-disable */
import {classroom,ari,teacher,mom,door,toilet,shoes,blocks,mountain,axe,pond,woodcutter,spirit,neighbor,star,twinkles,night,hill,cat,glow,owl,rainBg,umbrella,girl,puppy,frog,bird,rainbow,tree,room,hanbokGirl,grandma,pouch,bowl,yut,yard,globe} from './art.js';

export const LANGS=[
 {id:'ru',name:'Русский',ko:'러시아어',tts:'ru-RU'},
 {id:'mn',name:'Монгол',ko:'몽골어',tts:'mn-MN'},
 {id:'vi',name:'Tiếng Việt',ko:'베트남어',tts:'vi-VN'},
 {id:'uz',name:"O'zbek",ko:'우즈베크어',tts:'uz-UZ'},
 {id:'zh',name:'中文',ko:'중국어',tts:'zh-CN'},
 {id:'en',name:'English',ko:'영어',tts:'en-US'},
];
export const UI={
 ru:{read:'Читать',listen:'Слушать',stop:'Стоп'},mn:{read:'Унших',listen:'Сонсох',stop:'Зогсоох'},
 vi:{read:'Đọc',listen:'Nghe',stop:'Dừng'},uz:{read:"O'qish",listen:'Tinglash',stop:"To'xtatish"},
 zh:{read:'阅读',listen:'听故事',stop:'停止'},en:{read:'Read',listen:'Listen',stop:'Stop'}
};

Object.assign(UI.ru,{lp:'Послушай и выбери картинку',sp:'Выбери слово по-корейски',ok:'Молодец!'});
Object.assign(UI.mn,{lp:'Сонсоод зургийг сонго',sp:'Солонгос үгийг сонго',ok:'Сайн байна!'});
Object.assign(UI.vi,{lp:'Nghe và chọn hình',sp:'Chọn từ tiếng Hàn',ok:'Giỏi lắm!'});
Object.assign(UI.uz,{lp:'Tinglab, rasmni tanla',sp:"Koreyscha so'zni tanla",ok:'Barakalla!'});
Object.assign(UI.zh,{lp:'听一听，选图片',sp:'选出韩语单词',ok:'真棒！'});
Object.assign(UI.en,{lp:'Listen and pick the picture',sp:'Pick the Korean word',ok:'Great job!'});

export const STORIES=[
{id:'star',
 title:{ko:'작은 별',ru:'Маленькая звёздочка',mn:'Бяцхан од',vi:'Ngôi sao nhỏ',uz:'Kichkina yulduz',zh:'小星星',en:'The Little Star'},
 sub:'길 잃은 별을 집에 데려다준 고양이',
 pages:[
 {art:()=>night(`<circle cx="262" cy="40" r="20" fill="#F7E7B0"/><path d="M60 30 L150 104" stroke="#FFD866" stroke-width="3" opacity=".5" stroke-linecap="round"/>${glow(156,108,10)}`)+hill('#2F4A3E'),
  ko:'밤하늘에서 작은 별 하나가 떨어졌어요.',ru:'С ночного неба упала маленькая звёздочка.',mn:'Шөнийн тэнгэрээс нэгэн бяцхан од унажээ.',vi:'Một ngôi sao nhỏ rơi xuống từ bầu trời đêm.',uz:'Tungi osmondan kichkina yulduz tushib ketdi.',zh:'一颗小星星从夜空中掉了下来。',en:'A little star fell from the night sky.'},
 {art:()=>night()+hill('#2F4A3E')+glow(196,160,9)+cat(140,166,1.1),
  ko:'고양이 나비가 반짝이는 별을 발견했어요.',ru:'Кошка Наби нашла сверкающую звёздочку.',mn:'Наби гэдэг муур гялалзсан одыг олжээ.',vi:'Mèo Nabi tìm thấy ngôi sao lấp lánh.',uz:'Nabi ismli mushuk yaltiroq yulduzni topib oldi.',zh:'小猫娜比发现了闪闪发光的星星。',en:'Nabi the cat found the shining star.'},
 {art:()=>night()+hill('#2F4A3E')+cat(150,160,1.5)+glow(196,118,12)+`<path d="M214 96 q24 -20 48 -6" stroke="#FFF6D6" stroke-width="2" fill="none" stroke-dasharray="4 5"/>${star(272,84,6,'#FFF6D6')}`,
  ko:'"집에 가고 싶어." 별이 작게 말했어요.',ru:'«Я хочу домой», — тихо сказала звёздочка.',mn:'«Би гэртээ харимаар байна» гэж од аяархан хэлэв.',vi:'"Tớ muốn về nhà," ngôi sao nói khẽ.',uz:'"Uyimga qaytgim keladi", dedi yulduz sekingina.',zh:'"我想回家。"星星小声地说。',en:'"I want to go home," the star said softly.'},
 {art:()=>night()+hill('#2F4A3E')+tree()+cat(206,92,.8)+glow(186,70,7),
  ko:'나비는 높은 나무에 올라갔어요. 하지만 하늘은 너무 멀었어요.',ru:'Наби забралась на высокое дерево. Но небо было слишком далеко.',mn:'Наби өндөр модонд авирав. Гэвч тэнгэр хэтэрхий хол байлаа.',vi:'Nabi trèo lên cây cao. Nhưng bầu trời còn xa quá.',uz:'Nabi baland daraxtga chiqdi. Lekin osmon juda uzoq edi.',zh:'娜比爬上了高高的树。可是天空太远了。',en:'Nabi climbed a tall tree. But the sky was too far away.'},
 {art:()=>night()+hill('#2F4A3E')+owl(160,90)+glow(160,58,8)+cat(80,170,.9),
  ko:'그때 부엉이가 날아왔어요. "내 등에 타렴!"',ru:'Тут прилетела сова. «Садись мне на спину!»',mn:'Тэр үед шар шувуу нисэн ирэв. «Миний нуруун дээр суу!»',vi:'Lúc ấy, bác cú mèo bay tới. "Lên lưng ta nào!"',uz:'Shu payt boyqush uchib keldi. "Orqamga chiq!"',zh:'这时，猫头鹰飞来了。"坐到我背上来吧！"',en:'Just then, an owl flew down. "Climb on my back!"'},
 {art:()=>night(`<circle cx="60" cy="44" r="18" fill="#F7E7B0"/>${glow(230,40,13)}`)+hill('#2F4A3E')+cat(170,166,1.1),
  ko:'별은 하늘로 돌아갔어요. 오늘 밤, 별이 나비에게 반짝 인사해요.',ru:'Звёздочка вернулась на небо. Сегодня ночью она мерцает для Наби.',mn:'Од тэнгэртээ буцжээ. Өнөө шөнө од Набид гялалзан мэндэлнэ.',vi:'Ngôi sao đã trở về bầu trời. Đêm nay, sao lấp lánh chào Nabi.',uz:'Yulduz osmonga qaytdi. Bu kecha u Nabiga jimirlab salom beradi.',zh:'星星回到了天上。今晚，它对娜比一闪一闪地打招呼。',en:'The star went back to the sky. Tonight, it twinkles hello to Nabi.'},
 ]},
{id:'umbrella',
 title:{ko:'노란 우산',ru:'Жёлтый зонтик',mn:'Шар шүхэр',vi:'Chiếc ô vàng',uz:'Sariq soyabon',zh:'黄色的雨伞',en:'The Yellow Umbrella'},
 sub:'작은 우산 아래 모인 친구들',
 pages:[
 {art:()=>rainBg()+girl(150,120)+umbrella(150,64,46),
  ko:'비가 와요. 미니는 노란 우산을 펼쳤어요.',ru:'Идёт дождь. Мини раскрыла жёлтый зонтик.',mn:'Бороо орж байна. Мини шар шүхрээ дэлгэв.',vi:'Trời mưa. Mini mở chiếc ô màu vàng.',uz:"Yomg'ir yog'yapti. Mini sariq soyabonini ochdi.",zh:'下雨了。米妮撑开了黄色的雨伞。',en:'It is raining. Mini opens her yellow umbrella.'},
 {art:()=>rainBg()+girl(110,120)+umbrella(110,64,46)+puppy(230,168,true),
  ko:'길에서 비에 젖은 강아지를 만났어요.',ru:'На дороге она встретила мокрого щенка.',mn:'Замдаа бороонд норсон гөлөгтэй таарав.',vi:'Trên đường, Mini gặp một chú cún ướt sũng.',uz:"Yo'lda yomg'irda ho'l bo'lgan kuchukchani uchratdi.",zh:'路上，她遇到了一只淋湿的小狗。',en:'On the way, she met a wet little puppy.'},
 {art:()=>rainBg()+girl(130,120)+puppy(196,168)+umbrella(160,62,58,14),
  ko:'"같이 쓰자!" 미니가 우산을 기울였어요.',ru:'«Давай вместе!» — Мини наклонила зонтик.',mn:'«Хамтдаа нөмөрье!» гэж Мини шүхрээ хазайлгав.',vi:'"Mình che chung nhé!" Mini nghiêng chiếc ô.',uz:'"Keling, birga panalaylik!" Mini soyabonni egdi.',zh:'"我们一起打伞吧！"米妮把伞斜了过去。',en:'"Let\'s share!" Mini tilted her umbrella.'},
 {art:()=>rainBg()+girl(130,120)+puppy(190,168)+frog(244,180)+bird(260,120)+umbrella(170,62,62,8),
  ko:'개구리도, 참새도 우산 아래로 들어왔어요.',ru:'Под зонтик забрались и лягушонок, и воробей.',mn:'Мэлхий ч, бор шувуу ч шүхэр дор оров.',vi:'Cả ếch con và chim sẻ cũng chui vào dưới ô.',uz:'Qurbaqa ham, chumchuq ham soyabon ostiga kirdi.',zh:'小青蛙和小麻雀也躲到了伞下。',en:'A frog and a sparrow came under too.'},
 {art:()=>rainBg(30)+girl(140,120)+puppy(196,170)+frog(108,182)+bird(170,104)+umbrella(150,60,70,0),
  ko:'우산은 작았지만, 모두 함께 들어갈 수 있었어요.',ru:'Зонтик был маленький, но места хватило всем.',mn:'Шүхэр жижиг байсан ч бүгд багтжээ.',vi:'Chiếc ô nhỏ thôi, nhưng ai cũng có chỗ.',uz:"Soyabon kichkina edi, ammo hammaga joy yetdi.",zh:'雨伞虽然很小，大家却都挤得下。',en:'The umbrella was small, but there was room for everyone.'},
 {art:()=>`<rect width="320" height="220" fill="#CFE6F2"/><circle cx="276" cy="40" r="20" fill="#F7DC6F"/>${rainbow()}<rect y="180" width="320" height="40" fill="#9CCB8E"/>`+girl(140,124)+puppy(196,172)+frog(96,186)+bird(240,150),
  ko:'비가 그치자 하늘에 무지개가 떴어요.',ru:'Дождь закончился, и в небе появилась радуга.',mn:'Бороо зогсож, тэнгэрт солонго татлаа.',vi:'Mưa tạnh, cầu vồng hiện lên trên trời.',uz:"Yomg'ir to'xtadi va osmonda kamalak paydo bo'ldi.",zh:'雨停了，天上出现了彩虹。',en:'The rain stopped, and a rainbow appeared in the sky.'},
 ]}
];

STORIES.push({id:'seollal',culture:true,
 title:{ko:'설날 아침',ru:'Утро Соллаля',mn:'Сөллалын өглөө',vi:'Sáng Tết Seollal',uz:'Sollal tongi',zh:'春节的早上',en:'Seollal Morning'},
 sub:'한국의 새해, 그리고 우리 나라의 새해',
 pages:[
 {art:()=>room()+hanbokGirl(180,104),
  ko:'설날 아침이에요. 미니는 고운 한복을 입었어요.',ru:'Утро Соллаля. Мини надела красивый ханбок.',mn:'Сөллалын өглөө боллоо. Мини гоё ханбок өмслөө.',vi:'Sáng Tết Seollal. Mini mặc bộ hanbok thật đẹp.',uz:'Sollal tongi. Mini chiroyli hanbok kiydi.',zh:'今天是春节的早上。米妮穿上了漂亮的韩服。',en:'It is Seollal morning. Mini put on a pretty hanbok.'},
 {art:()=>room()+grandma(230,112)+hanbokGirl(140,112,24),
  ko:'미니는 할머니께 세배를 했어요. "새해 복 많이 받으세요!"',ru:'Мини низко поклонилась бабушке. «С Новым годом, счастья вам!»',mn:'Мини эмээдээ ёслон мэндэллээ. «Шинэ оны мэнд хүргэе!»',vi:'Mini cúi lạy chúc Tết bà. "Chúc bà năm mới nhiều phúc lành ạ!"',uz:'Mini buvisiga ta\'zim qildi. "Yangi yilingiz muborak bo\'lsin!"',zh:'米妮给奶奶拜年。"新年快乐，福气多多！"',en:'Mini bowed deeply to Grandma. "Happy New Year! Many blessings!"'},
 {art:()=>room()+grandma(222,112)+hanbokGirl(118,104)+`<circle cx="170" cy="118" r="22" fill="#F7DC6F" opacity=".35"/>`+pouch(170,118,1.1),
  ko:'할머니가 웃으며 복주머니를 주셨어요.',ru:'Бабушка с улыбкой подарила ей мешочек на удачу.',mn:'Эмээ инээмсэглэн аз жаргалын уут бэлэглэв.',vi:'Bà mỉm cười tặng Mini một chiếc túi phúc.',uz:'Buvisi jilmayib, unga baxt xaltachasini berdi.',zh:'奶奶笑着送给她一个福袋。',en:'Grandma smiled and gave her a lucky pouch.'},
 {art:()=>room()+grandma(222,100)+hanbokGirl(110,94)+`<rect x="40" y="150" width="240" height="18" rx="4" fill="#8C5F33"/><rect x="56" y="168" width="10" height="26" fill="#6E4826"/><rect x="254" y="168" width="10" height="26" fill="#6E4826"/>`+bowl(110,138)+bowl(170,138)+bowl(222,138),
  ko:'모두 함께 떡국을 먹었어요. 떡국을 먹으면 한 살 더 먹는대요.',ru:'Все вместе ели суп ттоккук. Говорят, после него становишься на год старше.',mn:'Бүгдээрээ ттоггүг шөл идлээ. Үүнийг идвэл нэг нас нэмнэ гэдэг.',vi:'Cả nhà cùng ăn canh bánh gạo tteokguk. Người ta nói ăn xong sẽ lớn thêm một tuổi.',uz:'Hamma birga ttokguk sho\'rvasini ichdi. Uni ichsang, bir yoshga kattalashasan, deyishadi.',zh:'大家一起喝年糕汤。听说喝了年糕汤，就长大一岁了。',en:'Everyone ate tteokguk together. They say eating it makes you one year older.'},
 {art:()=>yard(`<rect x="70" y="168" width="180" height="40" rx="6" fill="#D9B676"/>`)+hanbokGirl(96,118)+grandma(250,128)+yut(170,66,1.1,1.6),
  ko:'마당에서 윷놀이를 했어요. 윷가락이 높이 날아올랐어요.',ru:'Во дворе играли в юннори. Палочки взлетели высоко-высоко.',mn:'Хашаандаа ютнори тоглов. Савханууд өндөр нисэв.',vi:'Ngoài sân, cả nhà chơi yutnori. Những que gỗ bay lên thật cao.',uz:'Hovlida yutnori o\'ynashdi. Tayoqchalar baland uchib ketdi.',zh:'大家在院子里玩掷柶游戏。木棍高高地飞了起来。',en:'In the yard, they played yunnori. The sticks flew high into the air.'},
 {art:()=>`<rect width="320" height="220" fill="#1E2A4A"/>${twinkles(30,7)}`+globe(200,104)+hanbokGirl(96,120)+`<path d="M120 80 q20 -24 40 -10" stroke="#F7DC6F" stroke-width="2" fill="none" stroke-dasharray="4 5"/>`,
  ko:'미니가 물었어요. "친구네 나라에서는 새해를 어떻게 보낼까?"',ru:'Мини спросила: «А как встречают Новый год в стране моего друга?»',mn:'Мини асуув: «Найзынхаа оронд шинэ жилийг яаж тэмдэглэдэг бол?»',vi:'Mini hỏi: "Ở đất nước của bạn mình, mọi người đón năm mới thế nào nhỉ?"',uz:'Mini so\'radi: "Do\'stimning yurtida Yangi yilni qanday kutib olishar ekan?"',zh:'米妮问："朋友的国家是怎么过新年的呢？"',en:'Mini asked, "How do people celebrate New Year in my friend\'s country?"'},
 ]});

export const V={
 star:{ko:'별',ru:'звезда',mn:'од',vi:'ngôi sao',uz:'yulduz',zh:'星星',en:'star',bg:'#1E2A4A'},
 night:{ko:'밤',ru:'ночь',mn:'шөнө',vi:'đêm',uz:'tun',zh:'夜晚',en:'night',bg:'#1E2A4A'},
 cat:{ko:'고양이',ru:'кошка',mn:'муур',vi:'con mèo',uz:'mushuk',zh:'猫',en:'cat',bg:'#2F4A3E'},
 tree:{ko:'나무',ru:'дерево',mn:'мод',vi:'cái cây',uz:'daraxt',zh:'树',en:'tree',bg:'#24345A'},
 sky:{ko:'하늘',ru:'небо',mn:'тэнгэр',vi:'bầu trời',uz:'osmon',zh:'天空',en:'sky',bg:'#7FB3DA'},
 owl:{ko:'부엉이',ru:'сова',mn:'шар шувуу',vi:'cú mèo',uz:'boyqush',zh:'猫头鹰',en:'owl',bg:'#24345A'},
 umbrella:{ko:'우산',ru:'зонтик',mn:'шүхэр',vi:'cái ô',uz:'soyabon',zh:'雨伞',en:'umbrella',bg:'#B9CBD8'},
 rain:{ko:'비',ru:'дождь',mn:'бороо',vi:'mưa',uz:"yomg'ir",zh:'雨',en:'rain',bg:'#8FA9BB'},
 puppy:{ko:'강아지',ru:'щенок',mn:'гөлөг',vi:'cún con',uz:'kuchukcha',zh:'小狗',en:'puppy',bg:'#B9CBD8'},
 frog:{ko:'개구리',ru:'лягушка',mn:'мэлхий',vi:'con ếch',uz:'qurbaqa',zh:'青蛙',en:'frog',bg:'#CFE6F2'},
 sparrow:{ko:'참새',ru:'воробей',mn:'бор шувуу',vi:'chim sẻ',uz:'chumchuq',zh:'麻雀',en:'sparrow',bg:'#CFE6F2'},
 rainbow:{ko:'무지개',ru:'радуга',mn:'солонго',vi:'cầu vồng',uz:'kamalak',zh:'彩虹',en:'rainbow',bg:'#CFE6F2'},
};
Object.assign(V,{
 seollal:{ko:'설날',ru:'Соллаль (Новый год)',mn:'Сөллал (шинэ жил)',vi:'Tết Hàn Quốc',uz:'Sollal (Yangi yil)',zh:'韩国春节',en:'Korean New Year',bg:'#F6EBD9'},
 hanbok:{ko:'한복',ru:'ханбок',mn:'ханбок',vi:'hanbok',uz:'hanbok',zh:'韩服',en:'hanbok',bg:'#F6EBD9'},
 grandma:{ko:'할머니',ru:'бабушка',mn:'эмээ',vi:'bà',uz:'buvi',zh:'奶奶',en:'grandma',bg:'#E9E2F2'},
 pouch:{ko:'복주머니',ru:'мешочек на удачу',mn:'аз жаргалын уут',vi:'túi phúc',uz:'baxt xaltachasi',zh:'福袋',en:'lucky pouch',bg:'#FBE7C2'},
 tteokguk:{ko:'떡국',ru:'суп ттоккук',mn:'ттоггүг шөл',vi:'canh bánh gạo',uz:'ttokguk sho‘rvasi',zh:'年糕汤',en:'rice cake soup',bg:'#E3C79C'},
 yut:{ko:'윷놀이',ru:'юннори',mn:'ютнори',vi:'yutnori',uz:'yutnori',zh:'掷柶游戏',en:'yunnori',bg:'#CFE6F2'},
});

export const ICON={
 star:[()=>star(0,0,22),'-30 -30 60 60'],
 night:[()=>`<circle r="18" fill="#F7E7B0"/><circle cx="9" cy="-6" r="16" fill="#1E2A4A"/>${star(18,14,4,'#FFF6D6')}${star(-18,-17,3,'#FFF6D6')}`,'-30 -30 60 60'],
 cat:[()=>cat(0,0),'-46 -44 92 72'],
 tree:[()=>tree(),'176 26 120 176'],
 sky:[()=>`<circle cx="16" cy="-12" r="9" fill="#F7DC6F"/><path d="M-20 12 a9 9 0 0 1 6 -14 a12 12 0 0 1 22 0 a9 9 0 0 1 8 14Z" fill="#FFFFFF"/>`,'-30 -30 60 60'],
 owl:[()=>owl(0,0),'-54 -36 108 70'],
 umbrella:[()=>umbrella(0,-8,36),'-44 -44 88 88'],
 rain:[()=>`<path d="M0 -20 C10 -6 14 2 14 8 a14 14 0 0 1 -28 0 C-14 2 -10 -6 0 -20Z" fill="#E8F2F8"/><line x1="-22" y1="-18" x2="-25" y2="-10" stroke="#fff" stroke-width="2"/><line x1="22" y1="-4" x2="19" y2="4" stroke="#fff" stroke-width="2"/>`,'-30 -30 60 60'],
 puppy:[()=>puppy(0,0),'-38 -26 68 54'],
 frog:[()=>frog(0,0),'-21 -15 42 34'],
 sparrow:[()=>bird(0,0),'-23 -17 40 30'],
 rainbow:[()=>rainbow(),'22 52 276 160'],
};
Object.assign(ICON,{
 seollal:[()=>`<path d="M-30 14 Q0 -4 30 14 V30 H-30Z" fill="#9CCB8E"/><circle cx="0" cy="4" r="12" fill="#E8603C"/><path d="M-30 14 Q0 -4 30 14 V30 H-30Z" fill="#9CCB8E"/>${pouch(16,-14,.5)}`,'-30 -30 60 60'],
 hanbok:[()=>hanbokGirl(0,0),'-30 -26 60 88'],
 grandma:[()=>grandma(0,0),'-36 -32 72 88'],
 pouch:[()=>pouch(0,0),'-26 -26 52 50'],
 tteokguk:[()=>bowl(0,0),'-26 -20 52 42'],
 yut:[()=>yut(0,0),'-32 -32 64 60'],
});

const PW={star:[['star','night'],['cat'],['star'],['tree','sky'],['owl'],['sky','star']],umbrella:[['rain','umbrella'],['puppy'],['umbrella'],['frog','sparrow'],['umbrella'],['rainbow']]};
PW.seollal=[['seollal','hanbok'],['grandma'],['pouch'],['tteokguk'],['yut'],['seollal']];
/* ---------- Korean folktale: 금도끼 은도끼 (public domain). Translations are drafts for native review. ---------- */
STORIES.push({id:'axe',folk:true,
 title:{ko:'금도끼 은도끼',ru:'Золотой топор, серебряный топор',mn:'Алтан сүх, мөнгөн сүх',vi:'Rìu vàng, rìu bạc',uz:'Oltin bolta, kumush bolta',zh:'金斧头银斧头',en:'The Golden Axe and the Silver Axe'},
 sub:'정직한 나무꾼 이야기 · 한국 전래 동화',
 pages:[
 {art:()=>mountain(woodcutter(140,120)+axe(176,140,'#9AA3AD',1,20)+tree()),
  ko:"옛날 옛날, 깊은 산골에 마음 착한 나무꾼이 살았어요. 나무꾼은 날마다 산에 올라 나무를 했어요.",ru:"Давным-давно в глухой горной деревне жил добрый дровосек. Каждый день он ходил в горы рубить дрова.",mn:"Эрт урьд цагт уулын гүнд сайхан сэтгэлтэй модчин амьдардаг байжээ. Тэр өдөр бүр ууланд гарч мод бэлтгэдэг байв.",vi:"Ngày xửa ngày xưa, trong núi sâu có một bác tiều phu tốt bụng. Ngày nào bác cũng lên núi đốn củi.",uz:"Qadim zamonda tog' qishlog'ida mehribon bir o'tinchi yashardi. U har kuni tog'ga chiqib o'tin yorardi.",zh:"很久很久以前，深山里住着一个善良的樵夫。他每天都上山砍柴。",en:"Long, long ago, a kind woodcutter lived deep in the mountains. Every day he went up the mountain to chop wood."},
 {art:()=>mountain(pond(170,170)+woodcutter(80,112)+axe(170,150,'#9AA3AD',1,140)),
  ko:"어느 날, 연못가에서 나무를 하다가 손이 미끄러졌어요. 도끼가 연못에 퐁당 빠지고 말았어요.",ru:"Однажды он рубил дерево у пруда, и рука соскользнула. Топор — плюх! — упал в пруд.",mn:"Нэг өдөр цөөрмийн дэргэд мод хагалж байтал гар нь хальтарчээ. Сүх нь цөөрөм рүү пал хийтэл унав.",vi:"Một hôm, bác đốn củi bên bờ ao thì trượt tay. Chiếc rìu rơi tõm xuống ao.",uz:"Bir kuni hovuz bo'yida o'tin yorayotganda qo'li sirpanib ketdi. Bolta hovuzga shalop etib tushdi.",zh:"有一天，他在池塘边砍柴时手一滑，斧头“扑通”一声掉进了池塘。",en:"One day, chopping wood by a pond, his hand slipped. The axe fell — splash! — into the pond."},
 {art:()=>mountain(pond(200,176)+woodcutter(110,112)),
  ko:"\"아이고, 내 도끼! 도끼가 없으면 나무를 할 수 없는데…\" 나무꾼은 연못가에 앉아 엉엉 울었어요.",ru:"«Ой, мой топор! Без топора я не смогу рубить дрова…» Дровосек сел у пруда и горько заплакал.",mn:"«Хөөх, миний сүх! Сүхгүй бол би мод хагалж чадахгүй…» Модчин цөөрмийн эрэгт суугаад уйлав.",vi:"\"Ôi, cái rìu của tôi! Không có rìu thì làm sao đốn củi được…\" Bác tiều phu ngồi bên ao khóc hu hu.",uz:"\"Voy, boltam! Boltasiz o'tin yorolmayman…\" O'tinchi hovuz bo'yida o'tirib yig'lab yubordi.",zh:"“哎呀，我的斧头！没有斧头就砍不了柴了……”樵夫坐在池塘边呜呜地哭了。",en:"\"Oh no, my axe! Without it I can't chop wood…\" The woodcutter sat by the pond and cried."},
 {art:()=>mountain(pond(170,176)+spirit(170,96)+woodcutter(70,112)),
  ko:"그때 연못이 반짝반짝 빛나더니, 하얀 수염의 산신령이 나타났어요. \"왜 그리 슬피 우느냐?\"",ru:"Вдруг пруд засверкал, и появился горный дух с белой бородой. «Почему ты так горько плачешь?»",mn:"Тэр үед цөөрөм гялалзаж, цагаан сахалтай уулын сүнс гарч ирэв. «Чи яагаад ингэж гашуудан уйлна вэ?»",vi:"Bỗng mặt ao lấp lánh, một ông tiên râu trắng hiện ra. \"Sao con khóc buồn thế?\"",uz:"Shu payt hovuz yaltirab, oq soqolli tog' ruhi paydo bo'ldi. \"Nega bunchalik qayg'urib yig'layapsan?\"",zh:"这时池塘闪闪发光，一位白胡子山神出现了。“你为什么哭得这么伤心？”",en:"Then the pond sparkled, and a mountain spirit with a white beard appeared. \"Why are you crying so?\""},
 {art:()=>mountain(pond(170,176)+spirit(190,96)+axe(150,92,'#F2B533',1.2,-20)+woodcutter(70,112)),
  ko:"산신령이 번쩍이는 금도끼를 들어 보였어요. \"이 금도끼가 네 도끼냐?\" \"아니요, 제 도끼가 아니에요.\"",ru:"Дух поднял сверкающий золотой топор. «Это твой золотой топор?» — «Нет, это не мой топор».",mn:"Уулын сүнс гялалзсан алтан сүх өргөж үзүүлэв. «Энэ алтан сүх чинийх үү?» «Үгүй ээ, энэ миний сүх биш».",vi:"Ông tiên giơ lên một chiếc rìu vàng sáng lấp lánh. \"Rìu vàng này có phải của con không?\" \"Thưa không, không phải rìu của con ạ.\"",uz:"Tog' ruhi yaltiroq oltin boltani ko'tarib ko'rsatdi. \"Bu oltin bolta seniki-mi?\" \"Yo'q, bu mening boltam emas.\"",zh:"山神举起一把闪闪发光的金斧头。“这把金斧头是你的吗？”“不是，这不是我的斧头。”",en:"The spirit held up a shining golden axe. \"Is this golden axe yours?\" \"No, that is not my axe.\""},
 {art:()=>mountain(pond(170,176)+spirit(190,96)+axe(150,92,'#D9DEE4',1.2,-20)+woodcutter(70,112)),
  ko:"이번에는 은도끼를 들어 보였어요. \"그럼 이 은도끼가 네 도끼냐?\" \"아니요, 그것도 제 도끼가 아니에요.\"",ru:"Теперь он поднял серебряный топор. «Тогда, может, этот серебряный топор твой?» — «Нет, и это не мой».",mn:"Энэ удаа мөнгөн сүх өргөв. «Тэгвэл энэ мөнгөн сүх чинийх үү?» «Үгүй ээ, энэ ч миний сүх биш».",vi:"Lần này ông giơ lên chiếc rìu bạc. \"Vậy rìu bạc này có phải của con không?\" \"Thưa không, cái đó cũng không phải của con ạ.\"",uz:"Bu safar kumush boltani ko'rsatdi. \"Unda bu kumush bolta seniki-mi?\" \"Yo'q, bu ham mening boltam emas.\"",zh:"这次他举起一把银斧头。“那这把银斧头是你的吗？”“不是，这也不是我的斧头。”",en:"Next he held up a silver axe. \"Then is this silver axe yours?\" \"No, that is not mine either.\""},
 {art:()=>mountain(pond(170,176)+spirit(190,96)+axe(150,92,'#9AA3AD',1.2,-20)+woodcutter(70,112)),
  ko:"마지막으로 낡은 쇠도끼를 들어 보였어요. \"그럼 이 쇠도끼가 네 도끼냐?\" \"네, 그게 바로 제 도끼예요!\"",ru:"Наконец он поднял старый железный топор. «А этот железный топор твой?» — «Да, это мой топор!»",mn:"Эцэст нь хуучин төмөр сүх өргөв. «Тэгвэл энэ төмөр сүх чинийх үү?» «Тийм ээ, яг миний сүх!»",vi:"Cuối cùng ông giơ lên chiếc rìu sắt cũ. \"Thế rìu sắt này có phải của con không?\" \"Dạ phải, đúng là rìu của con!\"",uz:"Oxirida eski temir boltani ko'rsatdi. \"Bu temir bolta seniki-mi?\" \"Ha, aynan mening boltam!\"",zh:"最后他举起一把旧铁斧头。“那这把铁斧头是你的吗？”“是的，这正是我的斧头！”",en:"At last he held up an old iron axe. \"Is this iron axe yours?\" \"Yes, that is my axe!\""},
 {art:()=>mountain(spirit(220,100)+woodcutter(110,112)+axe(70,140,'#F2B533',1,-15)+axe(150,150,'#D9DEE4',1,10)+axe(185,150,'#9AA3AD',1,20)),
  ko:"\"허허, 참으로 정직하구나! 상으로 금도끼와 은도끼도 주마.\" 나무꾼은 도끼 세 자루를 받았어요.",ru:"«Ха-ха, какой ты честный! В награду возьми и золотой, и серебряный топор». Дровосек получил три топора.",mn:"«Хэхэ, үнэхээр үнэнч юм аа! Шагнал болгож алтан, мөнгөн сүхийг ч өгье». Модчин гурван сүх авчээ.",vi:"\"Ha ha, con thật thà quá! Ta thưởng cho con cả rìu vàng và rìu bạc.\" Bác tiều phu nhận được ba chiếc rìu.",uz:"\"Ha-ha, naqadar rostgo'ysan! Mukofotga oltin va kumush boltani ham beraman.\" O'tinchi uchta bolta oldi.",zh:"“呵呵，你真诚实！就把金斧头和银斧头也赏给你吧。”樵夫得到了三把斧头。",en:"\"Ho ho, how honest you are! Take the golden and silver axes too, as a reward.\" The woodcutter got three axes."},
 {art:()=>mountain(pond(200,176)+neighbor(110,112)+axe(170,120,'#9AA3AD',1,60)),
  ko:"이 이야기를 들은 욕심쟁이 이웃이 연못으로 달려갔어요. 그리고 일부러 도끼를 퐁당 던졌어요.",ru:"Об этом услышал жадный сосед и побежал к пруду. Он нарочно бросил свой топор в воду — плюх!",mn:"Үүнийг сонссон шуналтай хөрш цөөрөм рүү гүйв. Тэгээд сүхээ зориуд пал хийтэл шидэв.",vi:"Người hàng xóm tham lam nghe chuyện liền chạy ra ao. Rồi ông cố tình ném tõm chiếc rìu xuống nước.",uz:"Buni eshitgan ochko'z qo'shni hovuzga yugurdi. Va boltasini ataylab shalop etib suvga otdi.",zh:"贪心的邻居听说了这件事，就跑到池塘边，故意把斧头“扑通”一声扔了进去。",en:"A greedy neighbor heard the story and ran to the pond. He threw his axe in — splash! — on purpose."},
 {art:()=>mountain(pond(170,176)+spirit(190,96)+axe(150,92,'#F2B533',1.2,-20)+neighbor(70,112)),
  ko:"산신령이 금도끼를 들고 나타나자 욕심쟁이가 소리쳤어요. \"네! 그 금도끼가 제 도끼예요!\"",ru:"Когда дух появился с золотым топором, жадина закричал: «Да! Этот золотой топор мой!»",mn:"Уулын сүнс алтан сүхтэй гарч ирэхэд шуналтай хөрш хашгирав. «Тийм! Тэр алтан сүх минийх!»",vi:"Ông tiên vừa hiện ra với chiếc rìu vàng, người tham lam đã kêu lên: \"Vâng! Rìu vàng đó là của tôi!\"",uz:"Tog' ruhi oltin bolta bilan chiqishi bilan ochko'z qichqirdi: \"Ha! O'sha oltin bolta meniki!\"",zh:"山神拿着金斧头一出现，贪心的邻居就大喊：“是的！那把金斧头是我的！”",en:"When the spirit appeared with a golden axe, the greedy man shouted, \"Yes! That golden axe is mine!\""},
 {art:()=>mountain(pond(170,176)+neighbor(90,112)),
  ko:"\"거짓말을 하는구나!\" 산신령은 금도끼도, 욕심쟁이의 쇠도끼도 돌려주지 않고 사라졌어요.",ru:"«Ты лжёшь!» Дух исчез и не отдал ни золотого топора, ни железного топора жадины.",mn:"«Чи худлаа ярьж байна!» Уулын сүнс алтан сүхийг ч, шуналтай хүний төмөр сүхийг ч өгөлгүй алга болов.",vi:"\"Con nói dối!\" Ông tiên biến mất, không trả rìu vàng mà cũng chẳng trả lại rìu sắt của người tham lam.",uz:"\"Yolg'on gapiryapsan!\" Tog' ruhi oltin boltani ham, ochko'zning temir boltasini ham bermay g'oyib bo'ldi.",zh:"“你在说谎！”山神既没有给金斧头，也没有还他的铁斧头，就消失了。",en:"\"You are lying!\" The spirit vanished, giving back neither the golden axe nor the greedy man's own iron axe."},
 {art:()=>mountain(woodcutter(110,112)+axe(150,140,'#F2B533',1,10)+'<circle cx="250" cy="50" r="22" fill="#F7DC6F"/>'),
  ko:"착한 나무꾼은 오래오래 행복하게 살았어요. 정직한 마음이 가장 소중하답니다.",ru:"А добрый дровосек жил долго и счастливо. Честное сердце дороже всего.",mn:"Сайхан сэтгэлтэй модчин урт удаан аз жаргалтай амьдарчээ. Үнэнч сэтгэл хамгаас эрхэм.",vi:"Bác tiều phu tốt bụng sống hạnh phúc mãi mãi. Tấm lòng thật thà là điều quý nhất.",uz:"Mehribon o'tinchi uzoq va baxtli yashadi. Rostgo'y qalb hammadan qimmat.",zh:"善良的樵夫从此过上了幸福的生活。诚实的心是最珍贵的。",en:"The kind woodcutter lived happily ever after. An honest heart matters most."},
 ]});
Object.assign(V,{
 woodcutter:{ko:'나무꾼',ru:'дровосек',mn:'модчин',vi:'tiều phu',uz:"o'tinchi",zh:'樵夫',en:'woodcutter',bg:'#DCEBDD'},
 mountain:{ko:'산',ru:'гора',mn:'уул',vi:'núi',uz:"tog'",zh:'山',en:'mountain',bg:'#DCEBDD'},
 axe:{ko:'도끼',ru:'топор',mn:'сүх',vi:'cái rìu',uz:'bolta',zh:'斧头',en:'axe',bg:'#F3E9DC'},
 pond:{ko:'연못',ru:'пруд',mn:'цөөрөм',vi:'cái ao',uz:'hovuz',zh:'池塘',en:'pond',bg:'#EAF2F7'},
 spirit:{ko:'산신령',ru:'горный дух',mn:'уулын сүнс',vi:'ông tiên núi',uz:"tog' ruhi",zh:'山神',en:'mountain spirit',bg:'#F4F1E8'},
 gold:{ko:'금',ru:'золото',mn:'алт',vi:'vàng',uz:'oltin',zh:'金子',en:'gold',bg:'#FFF1C7'},
});
Object.assign(ICON,{
 woodcutter:[()=>woodcutter(0,0),'-26 -24 52 84'],
 mountain:[()=>'<path d="M-30 20 L-8 -18 L4 0 L14 -12 L30 20Z" fill="#6E9F6A"/><path d="M-8 -18 L-2 -8 L-14 -8Z" fill="#FFFFFF"/>','-32 -30 64 56'],
 axe:[()=>axe(0,0,'#9AA3AD',1,15),'-32 -34 64 66'],
 pond:[()=>pond(0,0,26),'-30 -14 60 28'],
 spirit:[()=>spirit(0,0),'-30 -26 66 90'],
 gold:[()=>'<path d="M-22 10 L-14 -8 L14 -8 L22 10Z" fill="#F2B533"/><path d="M-10 -8 L-6 -16 L6 -16 L10 -8Z" fill="#F7D046"/>','-26 -22 52 38'],
});
PW.axe=[['woodcutter','mountain'],['axe','pond'],['woodcutter'],['spirit','pond'],['gold','axe'],['axe'],['axe'],['gold'],['axe','pond'],['gold'],['spirit'],['woodcutter']];

/* ---------- 첫날, 안녕! — first day at kindergarten. Translations are drafts for native review. ---------- */
STORIES.splice(2,0,{id:'firstday',life:true,
 title:{ko:'첫날, 안녕!',ru:'Первый день, привет!',mn:'Анхны өдөр, сайн уу!',vi:'Ngày đầu tiên, xin chào!',uz:'Birinchi kun, salom!',zh:'第一天，你好！',en:'Hello, First Day!'},
 sub:'유치원에 처음 간 날, 꼭 필요한 말',
 pages:[
 {art:()=>classroom(door(250,64))+mom(120,96)+ari(170,116),
  ko:"오늘은 아리가 유치원에 가는 첫날이에요. 아리는 엄마 손을 꼭 잡았어요.",ru:"Сегодня Ари первый день идёт в детский сад. Он крепко держит маму за руку.",mn:"Өнөөдөр Ари анх удаа цэцэрлэгт явах өдөр. Ари ээжийнхээ гарыг чанга атгав.",vi:"Hôm nay là ngày đầu tiên Ari đi mẫu giáo. Ari nắm chặt tay mẹ.",uz:"Bugun Ari birinchi marta bog'chaga boradigan kun. Ari onasining qo'lini mahkam ushladi.",zh:"今天是阿里第一天上幼儿园。阿里紧紧地牵着妈妈的手。",en:"Today is Ari's first day at kindergarten. Ari holds Mom's hand tight."},
 {art:()=>classroom()+teacher(200,96)+ari(110,116),
  ko:"선생님이 웃으며 말했어요. \"안녕! 만나서 반가워.\" 아리는 작은 목소리로 인사했어요. \"안녕하세요.\"",ru:"Учительница улыбнулась: «Привет! Рада с тобой познакомиться». Ари тихо поздоровался: «Здравствуйте».",mn:"Багш инээмсэглэн хэлэв: «Сайн уу! Танилцсандаа баяртай байна». Ари аяархан мэндлэв: «Сайн байна уу».",vi:"Cô giáo mỉm cười nói: \"Chào con! Cô rất vui được gặp con.\" Ari khẽ chào: \"Con chào cô ạ.\"",uz:"O'qituvchi jilmayib dedi: \"Salom! Tanishganimdan xursandman.\" Ari sekingina salomlashdi: \"Assalomu alaykum.\"",zh:"老师笑着说：\"你好！很高兴见到你。\"阿里小声地问好：\"老师好。\"",en:"The teacher smiled. \"Hello! Nice to meet you.\" Ari said softly, \"Hello.\""},
 {art:()=>classroom()+ari(160,112)+'<g opacity=".85">'+girl(70,130)+girl(250,130)+'</g>',
  ko:"\"제 이름은 아리예요.\" 아리가 말하자 친구들이 손뼉을 쳤어요.",ru:"«Меня зовут Ари», — сказал он, и друзья захлопали в ладоши.",mn:"«Миний нэрийг Ари гэдэг» гэж хэлэхэд найзууд нь алга ташив.",vi:"\"Mình tên là Ari.\" Ari vừa nói xong, các bạn liền vỗ tay.",uz:"\"Mening ismim Ari.\" Ari shunday deyishi bilan do'stlari qarsak chalishdi.",zh:"\"我叫阿里。\"阿里一说完，小朋友们就拍起了手。",en:"\"My name is Ari.\" When Ari said it, his new friends clapped."},
 {art:()=>classroom(blocks(250,170))+ari(90,116)+girl(180,120),
  ko:"놀이 시간에 아리는 혼자 서 있었어요. 그때 미니가 다가왔어요. \"같이 놀자!\"",ru:"Во время игр Ари стоял один. Тут к нему подошла Мини: «Давай играть вместе!»",mn:"Тоглоомын цагаар Ари ганцаараа зогсож байв. Тэр үед Мини ойртож ирэв. «Хамт тоглоё!»",vi:"Giờ chơi, Ari đứng một mình. Lúc ấy, Mini đi tới. \"Mình chơi cùng nhau nhé!\"",uz:"O'yin vaqtida Ari yolg'iz turardi. Shu payt Mini yaqinlashdi: \"Kel, birga o'ynaymiz!\"",zh:"游戏时间，阿里一个人站着。这时，米妮走了过来：\"我们一起玩吧！\"",en:"At playtime, Ari stood all alone. Then Mini came over. \"Let's play together!\""},
 {art:()=>classroom(toilet(270,150,1.1))+teacher(190,96)+ari(110,116),
  ko:"아리는 화장실에 가고 싶었어요. 아리는 용기를 내어 말했어요. \"선생님, 화장실 가고 싶어요.\"",ru:"Ари захотел в туалет. Он набрался смелости и сказал: «Учительница, можно мне в туалет?»",mn:"Ари бие засах газар орохыг хүсэв. Тэр зориг гарган хэлэв: «Багш аа, би бие засах газар орж болох уу?»",vi:"Ari muốn đi vệ sinh. Ari lấy hết can đảm nói: \"Thưa cô, con muốn đi vệ sinh ạ.\"",uz:"Arining hojatxonaga borgisi keldi. U jur'at qilib dedi: \"Ustoz, hojatxonaga borsam maylimi?\"",zh:"阿里想上厕所。他鼓起勇气说：\"老师，我想上厕所。\"",en:"Ari needed the bathroom. He was brave and said, \"Teacher, I need to go to the bathroom.\""},
 {art:()=>classroom('<rect x="40" y="150" width="240" height="16" rx="4" fill="#C8935A"/>'+bowl(120,140)+bowl(200,140))+ari(120,96)+girl(200,100),
  ko:"점심시간이에요. 따끈한 밥과 국이 나왔어요. \"잘 먹겠습니다!\"",ru:"Время обеда. Подали горячий рис и суп. «Спасибо, приятного аппетита!»",mn:"Үдийн хоолны цаг боллоо. Халуун будаа, шөл гарч ирэв. «Баярлалаа, хоолоо идье!»",vi:"Đến giờ ăn trưa. Cơm và canh nóng hổi được dọn ra. \"Con mời cô, mời các bạn ăn cơm!\"",uz:"Tushlik vaqti bo'ldi. Issiq guruch va sho'rva keltirildi. \"Rahmat, yoqimli ishtaha!\"",zh:"午饭时间到了。热乎乎的米饭和汤端上来了。\"谢谢，我要开始吃饭啦！\"",en:"It is lunchtime. Warm rice and soup are served. \"Thank you for the food!\""},
 {art:()=>classroom(door(270,64))+teacher(190,96)+ari(110,126,.9)+shoes(130,196,.8),
  ko:"집에 갈 시간, 아리는 혼자 신발을 신기가 어려웠어요. \"도와주세요.\" 선생님이 웃으며 도와주셨어요.",ru:"Пора домой, но Ари никак не мог сам надеть ботинки. «Помогите, пожалуйста». Учительница с улыбкой помогла.",mn:"Гэртээ харих цаг болов. Ари гутлаа ганцаараа өмсөж чадсангүй. «Туслаарай». Багш инээмсэглэн тусалжээ.",vi:"Đến giờ về, Ari không tự đi giày được. \"Cô giúp con với ạ.\" Cô giáo mỉm cười giúp Ari.",uz:"Uyga qaytish vaqti bo'ldi, ammo Ari oyoq kiyimini o'zi kiya olmadi. \"Yordam bering.\" O'qituvchi jilmayib yordam berdi.",zh:"该回家了，阿里自己穿不好鞋子。\"请帮帮我。\"老师笑着帮了他。",en:"Time to go home, but Ari could not put on his shoes by himself. \"Please help me.\" The teacher smiled and helped."},
 {art:()=>yard()+mom(250,110)+ari(190,128)+girl(80,130),
  ko:"엄마가 데리러 왔어요. 아리는 친구들에게 손을 흔들었어요. \"안녕, 내일 또 만나!\"",ru:"Мама пришла за Ари. Он помахал друзьям: «Пока, увидимся завтра!»",mn:"Ээж нь Арийг авахаар ирэв. Ари найзууддаа гар даллав. «Баяртай, маргааш уулзъя!»",vi:"Mẹ đến đón Ari. Ari vẫy tay chào các bạn. \"Tạm biệt, mai gặp lại nhé!\"",uz:"Onasi Arini olib ketgani keldi. Ari do'stlariga qo'l silkitdi: \"Xayr, ertaga ko'rishamiz!\"",zh:"妈妈来接阿里了。阿里向朋友们挥挥手：\"再见，明天见！\"",en:"Mom came to pick Ari up. Ari waved to his friends. \"Bye, see you tomorrow!\""},
 ]});
Object.assign(V,{
 teacher:{ko:'선생님',ru:'учитель',mn:'багш',vi:'cô giáo',uz:"o'qituvchi",zh:'老师',en:'teacher',bg:'#E6F0DF'},
 friend:{ko:'친구',ru:'друг',mn:'найз',vi:'bạn',uz:"do'st",zh:'朋友',en:'friend',bg:'#FCE8D4'},
 toilet:{ko:'화장실',ru:'туалет',mn:'бие засах газар',vi:'nhà vệ sinh',uz:'hojatxona',zh:'厕所',en:'bathroom',bg:'#EAF2F7'},
 rice:{ko:'밥',ru:'рис',mn:'будаа',vi:'cơm',uz:'guruch',zh:'米饭',en:'rice',bg:'#FFF6DA'},
});
Object.assign(ICON,{
 teacher:[()=>teacher(0,0),'-28 -28 56 96'],
 friend:[()=>ari(-14,0,.9)+girl(16,2),'-34 -26 68 88'],
 toilet:[()=>toilet(0,0,1.2),'-30 -36 60 64'],
 rice:[()=>bowl(0,0,1.2),'-28 -24 56 48'],
});
PW.firstday=[['teacher'],['teacher'],['friend'],['friend'],['toilet','teacher'],['rice'],['teacher'],['friend']];


export const CULTURE={
 ru:{place:'러시아',head:'Новый год в России',items:[['В России Новый год встречают 1 января.','러시아에서는 1월 1일에 새해를 맞아요.'],['В каждом доме наряжают ёлку.','집집마다 새해 나무 ‘욜카’를 꾸며요.'],['Дед Мороз приносит детям подарки.','‘마로스 할아버지’가 아이들에게 선물을 가져다줘요.']]},
 mn:{place:'몽골',head:'Монголын Цагаан сар',items:[['Монголын шинэ жилийг Цагаан сар гэдэг.','몽골의 설날은 ‘차강사르(하얀 달)’라고 해요.'],['Ахмад хүмүүстэйгээ золгож мэндэлдэг.','어른께 두 팔을 내밀어 ‘졸고흐’ 인사를 해요.'],['Бүгдээрээ бууз хийж иднэ.','온 가족이 만두 ‘보즈’를 빚어 먹어요.']]},
 vi:{place:'베트남',head:'Tết ở Việt Nam',items:[['Năm mới âm lịch ở Việt Nam gọi là Tết.','베트남의 설날은 ‘뗏(Tết)’이에요.'],['Mọi người gói và ăn bánh chưng.','네모난 떡 ‘반쯩’을 만들어 먹어요.'],['Trẻ em được nhận lì xì trong phong bao đỏ.','아이들은 빨간 봉투에 든 세뱃돈 ‘리시’를 받아요.']]},
 uz:{place:'우즈베키스탄',head:"O'zbekistonda Navro'z",items:[["O'zbekistonda bahor kelishini 21-mart kuni Navro'z bilan nishonlashadi.",'우즈베키스탄에서는 봄이 오는 3월 21일에 ‘나브루즈’를 맞아요.'],["Kechasi bilan birga aralashtirib, shirin sumalak pishirishadi.",'밤새 함께 저으며 달콤한 죽 ‘수말락’을 만들어요.'],["Qo'shnilar bilan taom ulashib, bayramni nishonlashadi.",'이웃과 음식을 나누며 함께 축하해요.']]},
 zh:{place:'중국',head:'中国的春节',items:[['中国的新年叫春节。','중국의 설날은 ‘춘절’이에요.'],['家家户户在门上贴红红的春联。','집집마다 문에 빨간 ‘춘련’을 붙여요.'],['孩子们会收到装着压岁钱的红包。','아이들은 세뱃돈이 든 빨간 봉투 ‘훙바오’를 받아요.']]},
 en:{place:'여러 나라',head:'New Year around the world',items:[['In many countries, New Year begins at midnight on January 1.','많은 나라에서 1월 1일 밤 12시에 새해가 시작돼요.'],['People count down together: ten, nine, eight…','다 같이 “십, 구, 팔…” 거꾸로 숫자를 세요.'],['Fireworks light up the night sky.','밤하늘에 불꽃놀이가 펼쳐져요.']]},
};
export const ASK={ru:'Как встречают Новый год в нашей семье? Спроси у мамы и папы!',mn:'Манай гэр бүл шинэ жилийг яаж угтдаг вэ? Ээж аавaасаа асуугаарай!',vi:'Nhà mình đón năm mới thế nào? Hãy hỏi bố mẹ nhé!',uz:"Bizning oilamiz Yangi yilni qanday kutib oladi? Ota-onangdan so'ra!",zh:'我们家怎么过新年？去问问爸爸妈妈吧！',en:'How does your family celebrate New Year? Ask your mom and dad!'};

// Finished illustrations (public/images/stories). Pages without one fall back to the drawn SVG.
/* Short phrases for sentence dictation (stage 2). w = the picture shown as a hint. */
const PHRASES={
 star:[['작은 별','star'],['별이 떨어졌어요','star'],['고양이 나비','cat'],['높은 나무','tree'],['부엉이가 날아왔어요','owl'],['하늘로 돌아갔어요','sky']],
 umbrella:[['비가 와요','rain'],['노란 우산','umbrella'],['같이 쓰자','umbrella'],['강아지를 만났어요','puppy'],['모두 함께','frog'],['무지개가 떴어요','rainbow']],
 seollal:[['설날 아침','seollal'],['고운 한복','hanbok'],['새해 복 많이 받으세요','grandma'],['복주머니를 주셨어요','pouch'],['떡국을 먹었어요','tteokguk'],['윷놀이를 했어요','yut']],
 firstday:[['안녕하세요','teacher'],['제 이름은 아리예요','friend'],['같이 놀자','friend'],['화장실 가고 싶어요','toilet'],['잘 먹겠습니다','rice'],['도와주세요','teacher']],
 axe:[['착한 나무꾼','woodcutter'],['도끼가 빠졌어요','axe'],['금도끼 은도끼','gold'],['제 도끼예요','axe'],['욕심쟁이 이웃','axe'],['정직한 마음','woodcutter']],
};
STORIES.forEach(s=>{if(PHRASES[s.id])s.phrases=PHRASES[s.id].map(([ko,w])=>({ko,w}));});
// Finished picture per page: a number = that many pages in order (id-01, id-02, …); a list maps each page to a file (null = still the drawn placeholder).
const IMAGES={star:6,umbrella:6,seollal:6,axe:['axe-01','axe-02','axe-new-03','axe-03','axe-04','axe-new-06','axe-new-07','axe-05','axe-new-09','axe-new-10','axe-new-11','axe-06']};
STORIES.forEach(s=>{const m=IMAGES[s.id];if(!m)return;s.pages.forEach((p,i)=>{const n=Array.isArray(m)?m[i]:`${s.id}-${String(i+1).padStart(2,'0')}`;if(n)p.img=`images/stories/${n}.webp`;});});

STORIES.forEach(s=>{s.pages.forEach((p,i)=>p.w=PW[s.id][i]);s.words=[...new Set(PW[s.id].flat())]});
