// Story, vocabulary and culture content. Text in every supported language lives here.
/* eslint-disable */
import {star,twinkles,night,hill,cat,glow,owl,rainBg,umbrella,girl,puppy,frog,bird,rainbow,tree,room,hanbokGirl,grandma,pouch,bowl,yut,yard,globe} from './art.js';

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
const IMAGES={star:6,umbrella:6};
STORIES.forEach(s=>{if(IMAGES[s.id])s.pages.forEach((p,i)=>{p.img=`images/stories/${s.id}-${String(i+1).padStart(2,'0')}.webp`});});

STORIES.forEach(s=>{s.pages.forEach((p,i)=>p.w=PW[s.id][i]);s.words=[...new Set(PW[s.id].flat())]});
