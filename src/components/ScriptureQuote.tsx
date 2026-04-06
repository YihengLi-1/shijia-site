"use client";

import { useEffect, useMemo, useState } from "react";

type Quote = { text: string; source: string; meaning: string; en: string };
type Variant = "general" | "meal" | "compassion";

const GENERAL_QUOTES: Quote[] = [
  { text: "诸恶莫作，众善奉行，自净其意。", source: "《法句经》", meaning: "以止恶行善为修行根本，清净自心方能利益众生。", en: "Cease all evil, cultivate all good, purify the mind." },
  { text: "诸行无常，是生灭法；生灭灭已，寂灭为乐。", source: "《大般涅槃经》", meaning: "万法无常，放下执著方得安乐。一切生灭皆归寂静。", en: "All formations are impermanent. When arising and passing cease, stillness is joy." },
  { text: "诸法无我，涅槃寂静。", source: "《法句经》", meaning: "看透无我，心自宁静。执我是苦，离我是乐。", en: "All phenomena are without self. Nirvana is peace." },
  { text: "色即是空，空即是色。", source: "《般若心经》", meaning: "形相与空性不二，不执于有，亦不落于无。", en: "Form is emptiness, emptiness is form." },
  { text: "照见五蕴皆空。", source: "《般若心经》", meaning: "看透身心的五种构成皆无自性，执著自然消散。", en: "Perceiving that the five aggregates are all empty." },
  { text: "不生不灭，不垢不净，不增不减。", source: "《般若心经》", meaning: "真性超越一切对待，不随顺境逆境而转。", en: "No birth, no death; no purity, no defilement; no increase, no decrease." },
  { text: "心无挂碍，无有恐怖。", source: "《般若心经》", meaning: "放下挂碍，心自然安稳，恐惧不能入。", en: "With no obstructions in mind, there is no fear." },
  { text: "凡所有相，皆是虚妄。", source: "《金刚经》", meaning: "一切表相皆是暂时幻现，莫执其为真实。", en: "Whatever has form is illusory — see through it and find the true." },
  { text: "一切有为法，如梦幻泡影；如露亦如电，应作如是观。", source: "《金刚经》", meaning: "观照无常，不执一切造作，如此才能自在。", en: "All conditioned phenomena are like a dream, a bubble, a shadow, dew, lightning — see them thus." },
  { text: "应无所住而生其心。", source: "《金刚经》", meaning: "不住于任何相，心才真正清明活泼。", en: "Give rise to a mind that dwells nowhere." },
  { text: "若见诸相非相，即见如来。", source: "《金刚经》", meaning: "不被相缚，方见本心。本心即如来。", en: "If one sees all appearances as non-appearances, one sees the Tathagata." },
  { text: "过去心不可得，现在心不可得，未来心不可得。", source: "《金刚经》", meaning: "心不住三时，专注当下才是修行。", en: "The past mind cannot be grasped; the present mind cannot be grasped; the future mind cannot be grasped." },
  { text: "心净则国土净。", source: "《维摩诘经》", meaning: "心清净，所见世界亦清净。外境是内心的映射。", en: "When the mind is pure, the land is pure." },
  { text: "一切众生悉有佛性。", source: "《大般涅槃经》", meaning: "众生皆具觉性，无一例外，慈悲即由此生。", en: "All sentient beings possess the Buddha-nature." },
  { text: "因缘所生法，我说即是空。", source: "《中论》", meaning: "一切因缘和合，皆无自性，即是空义。", en: "Whatever arises from conditions, I say is empty." },
  { text: "若人欲了知，三世一切佛，应观法界性，一切唯心造。", source: "《华严经》", meaning: "心念所现，境随心转。了心即了佛。", en: "If one wishes to know all Buddhas of the three times, contemplate the nature of reality — all is mind-made." },
  { text: "心如工画师，能画诸世间。", source: "《华严经》", meaning: "心念能造境，宜守其净。善护一心，即善护世界。", en: "The mind is like a skilled painter — it can paint all worlds." },
  { text: "诸法从本来，常自寂灭相。", source: "《法华经》", meaning: "本性寂静，动静皆不离。所有纷扰皆自本寂。", en: "All phenomena, from the very beginning, are themselves the form of nirvanic stillness." },
  { text: "知足之人，虽卧地上，犹为安乐。", source: "《佛遗教经》", meaning: "知足即安，处处可乐。不知足者，虽居天宫亦不满足。", en: "One who knows contentment is at ease even sleeping on the ground." },
  { text: "少欲知足，身心自在。", source: "《佛遗教经》", meaning: "减欲则自在，贪多则苦多。简单即是富足。", en: "With few desires and contentment, body and mind are at ease." },
  { text: "菩提本无树，明镜亦非台。", source: "《六祖坛经》", meaning: "本性清净，不著尘相。觉悟不是从外得来的。", en: "Bodhi is originally no tree; the bright mirror has no stand." },
  { text: "本来无一物，何处惹尘埃。", source: "《六祖坛经》", meaning: "本性清净，原无一物可染。执着才生尘埃。", en: "Originally there is not a single thing — where could dust alight?" },
  { text: "若能转物，即同如来。", source: "《楞严经》", meaning: "不被境转，转境在心。心自主，即与如来无异。", en: "If you can turn things, you are the same as the Tathagata." },
  { text: "心为法本，心尊心使。", source: "《法句经》", meaning: "心作善恶之本，应善护之。心是一切法的根源。", en: "Mind is the forerunner of all actions; mind is chief, mind-made are they." },
  { text: "诸上善人俱会一处。", source: "《阿弥陀经》", meaning: "善缘相会，共成清净。有缘共处即是净土。", en: "All good people of the highest virtue gather together in one place." },
  { text: "平常心是道。", source: "《马祖语录》", meaning: "此刻的心就是修行的场所，不必他求。", en: "The ordinary mind is the Way." },
  { text: "饥来吃饭困来眠。", source: "祖师语", meaning: "日用平常皆是禅，不在别处。", en: "When hungry, eat; when tired, sleep." },
  { text: "万古长空，一朝风月。", source: "祖师语", meaning: "永恒与当下并不对立，此刻即含永恒。", en: "The vast sky of eternity — one morning's wind and moon." },
  { text: "青青翠竹，尽是法身；郁郁黄花，无非般若。", source: "祖师语", meaning: "万物皆显法性，无需另觅佛法。", en: "The green bamboo is the Dharma body; the yellow flowers are nothing but prajna." },
  { text: "身是菩提树，心如明镜台。时时勤拂拭，勿使惹尘埃。", source: "《六祖坛经》", meaning: "神秀偈语教导用功修行，时时保持清净。", en: "The body is a bodhi tree; the mind is a bright mirror stand. Polish it constantly — let no dust alight." },
  { text: "随缘消旧业，更莫造新殃。", source: "祖师语", meaning: "顺其自然处理旧业，小心不再造新业。", en: "Follow conditions to exhaust old karma; take care not to create new misfortune." },
  { text: "春有百花秋有月，夏有凉风冬有雪。若无闲事挂心头，便是人间好时节。", source: "无门慧开禅师", meaning: "四季皆是道场，心无挂碍，每天都是好日子。", en: "Spring flowers, autumn moon; summer breeze, winter snow. With no idle matters in mind, every season is a fine season." },
  { text: "坐亦禅，行亦禅，语默动静体安然。", source: "《永嘉证道歌》", meaning: "禅不分坐卧，动静皆可修行。", en: "Sitting is Chan, walking is Chan; in silence and motion, the body is at peace." },
  { text: "烦恼即菩提。", source: "祖师语", meaning: "烦恼不离菩提，转化才是关键。", en: "Affliction is itself awakening." },
  { text: "生死事大，无常迅速。", source: "祖师语", meaning: "生命短暂，要珍惜每一刻修行的机会。", en: "The matter of birth and death is great; impermanence is swift." },
  { text: "直心是道场。", source: "《维摩诘经》", meaning: "心若直，处处是道场，无需特别神圣之处。", en: "A straightforward mind is the place of practice." },
  { text: "不怕念起，只怕觉迟。", source: "祖师语", meaning: "妄念生起不可怕，关键是觉察要快。", en: "Don't fear thoughts arising — only fear slow awareness." },
  { text: "莫向外求，回光返照。", source: "祖师语", meaning: "一切答案都在内心，向外求只会迷失。", en: "Don't seek outwardly — turn the light around and look within." },
  { text: "此心本来清净，无一物可得。", source: "祖师语", meaning: "心的本质是清净的，无需添加什么。", en: "This mind is originally pure — there is not a single thing to be obtained." },
  { text: "勤修戒定慧，息灭贪瞋痴。", source: "《法华经》", meaning: "三学是对治三毒的良药，坚持修习是关键。", en: "Diligently cultivate precepts, concentration, and wisdom; extinguish greed, anger, and delusion." },
  { text: "发菩提心，行菩萨道。", source: "《华严经》", meaning: "上求佛道，下化众生，是菩萨的志向。", en: "Arouse the mind of awakening; walk the Bodhisattva path." },
  { text: "佛法在世间，不离世间觉。", source: "《六祖坛经》", meaning: "离开生活去找佛法，如同水中捞月。", en: "The Buddha-dharma is in the world; awakening is not apart from the world." },
  { text: "不可以身相见如来。", source: "《金刚经》", meaning: "真正的如来不在形相中，莫执着于外表。", en: "The Tathagata cannot be seen through physical form." },
  { text: "如人饮水，冷暖自知。", source: "祖师语", meaning: "修行的滋味只有自己能感受，无法代替。", en: "As a person drinking water knows whether it is warm or cool, so the practitioner alone knows the taste of practice." },
  { text: "一花一世界，一叶一菩提。", source: "《华严经》义理", meaning: "微小处见宏大，刹那中含永恒。", en: "One flower, one world; one leaf, one bodhi." },
  { text: "山河大地皆是如来。", source: "祖师语", meaning: "如来遍一切处，不只在佛像中。", en: "Mountains, rivers, and the great earth are all the Tathagata." },
  { text: "无上甚深微妙法，百千万劫难遭遇。我今见闻得受持，愿解如来真实义。", source: "《开经偈》", meaning: "佛法珍贵难得，闻法后应深入理解，不停于表面。", en: "The profound, wondrous Dharma is rarely encountered in a hundred thousand million kalpas. Having now heard and received it, may I truly understand the Tathagata's meaning." },
  { text: "放下屠刀，立地成佛。", source: "祖师语", meaning: "觉悟可在一念之间，不在形式。", en: "Lay down the butcher's knife and become a Buddha on the spot." },
  { text: "一念迷，众生；一念悟，佛。", source: "《六祖坛经》", meaning: "迷悟只在一念之差，佛与众生本无高下。", en: "One deluded thought — sentient being; one awakened thought — Buddha." },
  { text: "月落不离天，云散不离虚空。", source: "祖师语", meaning: "变化发生，但本性不失，如月落仍是天。", en: "The moon sets but never leaves the sky; clouds scatter but never leave empty space." },
  { text: "借境练心，因事磨性。", source: "祖师语", meaning: "逆境也是修行的好材料，不必逃避。", en: "Use circumstances to train the mind; use events to refine the nature." },
  { text: "善用其心，则获一切胜妙功德。", source: "《华严经》", meaning: "善用这颗心，是一切修行成就的关键。", en: "Use this mind well, and all supreme and wondrous merit will be gained." },
  { text: "一日不作，一日不食。", source: "百丈怀海禅师", meaning: "劳动是修行的一部分，禅者自给自足。", en: "A day without work is a day without eating." },
  { text: "随处作主，立处皆真。", source: "《临济录》", meaning: "内心自主，任何环境都能安住当下。", en: "Be master in every situation; wherever you stand is true." },
  { text: "大疑大悟，小疑小悟，不疑不悟。", source: "祖师语", meaning: "疑心是参禅的动力，疑得越深，悟得越彻。", en: "Great doubt, great awakening; small doubt, small awakening; no doubt, no awakening." },
  { text: "踏破铁鞋无觅处，得来全不费工夫。", source: "祖师语", meaning: "苦寻不得，放下时反而自然显现。", en: "Wearing out iron shoes in search — yet it comes effortlessly when you stop." },
  { text: "不忘初心，方得始终。", source: "祖师语", meaning: "修行贵在坚持最初的发心，不随境转。", en: "Never forget the original aspiration — only then can you see it through to the end." },
  { text: "此生不向今生度，更向何生度此身？", source: "祖师语", meaning: "修行不能等待，此生就是最好的时机。", en: "If you don't liberate yourself in this life, in which life will you do so?" },
  { text: "修行在自己，成就在因缘。", source: "祖师语", meaning: "努力在自己，结果随因缘，不必强求。", en: "Practice rests with oneself; accomplishment depends on conditions." },
  { text: "道心中有衣食，衣食中无道心。", source: "祖师语", meaning: "以道为先，物质自然具足；以物为先，道心反而失落。", en: "In the Dharma-mind there is food and clothing; in food and clothing there is no Dharma-mind." },
  { text: "觉而不迷，正而不邪，净而不染。", source: "《六祖坛经》", meaning: "觉正净三者，是修行的方向与归宿。", en: "Awakened and not confused; upright and not deviant; pure and undefiled." },
  { text: "行到水穷处，坐看云起时。", source: "王维《终南别业》", meaning: "到了尽头，放下执著，新的一切自然展开。", en: "Walking to where the water ends, sitting to watch the clouds arise." },
  { text: "问君何能尔，心远地自偏。", source: "陶渊明《饮酒》", meaning: "心若安静，身处闹市也是宁静之地。", en: "How can you be thus? With the heart far away, the place feels remote." },
  { text: "苟日新，日日新，又日新。", source: "《大学》", meaning: "每天都是新的开始，精进不退，日日更新。", en: "If you renew yourself daily, do so without ceasing — and each day renew again." },
  { text: "为学日益，为道日损，损之又损，以至于无为。", source: "《老子》", meaning: "修道是减法，去除执著，最终无为而无不为。", en: "In learning, every day something is acquired; in following the Way, every day something is dropped." },
  { text: "上善若水，水善利万物而不争。", source: "《老子》", meaning: "最高的善如水，润泽万物而不争，处众人之所恶。", en: "Highest good is like water — it benefits all things and does not compete." },
  { text: "知常曰明，不知常，妄作，凶。", source: "《老子》", meaning: "了知万物的本性，心才能真正明白，不轻举妄动。", en: "Knowing the constant is called illumination; not knowing it, one acts rashly — with misfortune." },
  { text: "为而不争，天之道也。", source: "《老子》", meaning: "做而不执，助益而不争，这是天道的方式。", en: "Act without contending — this is the way of heaven." },
  { text: "大直若屈，大巧若拙，大辩若讷。", source: "《老子》", meaning: "真正的智慧看起来平凡，不显于外。", en: "Great straightness seems bent; great skill seems clumsy; great eloquence seems speechless." },
  { text: "海纳百川，有容乃大。", source: "林则徐联语", meaning: "心量如海，包容万物，是修行的气度。", en: "The sea receives a hundred rivers — greatness lies in its capacity to contain." },
  { text: "处众人之所恶，故几于道。", source: "《老子》", meaning: "甘居低处，不与人争，反而接近道的本质。", en: "It dwells in the places people disdain — and thus it is close to the Way." },
  { text: "信言不美，美言不信。善者不辩，辩者不善。", source: "《老子》", meaning: "真诚的话不华丽，华丽的话不真诚。言行一致才是道。", en: "True words are not beautiful; beautiful words are not true. The good do not argue; those who argue are not good." },
  { text: "知人者智，自知者明；胜人者有力，自胜者强。", source: "《老子》", meaning: "了解自己比了解别人更重要，克服自己比征服他人更有力量。", en: "Knowing others is wisdom; knowing oneself is enlightenment. Overcoming others takes force; overcoming oneself takes true strength." },
];

const MEAL_QUOTES: Quote[] = [
  { text: "知足之人，虽卧地上，犹为安乐。", source: "《佛遗教经》", meaning: "一餐知足，心便安稳。用斋时放慢，感受每一口的因缘。", en: "One who knows contentment is at ease even sleeping on the ground." },
  { text: "少欲知足，身心自在。", source: "《佛遗教经》", meaning: "少欲即自在，斋食以清淡为上。简单的食物，清净的心。", en: "With few desires and contentment, body and mind are at ease." },
  { text: "心净则国土净。", source: "《维摩诘经》", meaning: "清净之心，清净之食。用斋即修行，心若清净，食亦清净。", en: "When the mind is pure, the land is pure." },
  { text: "诸行无常，是生灭法；生灭灭已，寂灭为乐。", source: "《大般涅槃经》", meaning: "知无常，心安住。此餐因缘即将消散，珍惜当下此刻。", en: "All formations are impermanent. When arising and passing cease, stillness is joy." },
  { text: "不生不灭，不垢不净，不增不减。", source: "《般若心经》", meaning: "心静则味亦清。不分别食物好坏，平等受用。", en: "No birth, no death; no purity, no defilement; no increase, no decrease." },
  { text: "心无挂碍，无有恐怖。", source: "《般若心经》", meaning: "无挂碍则安住。放下手机，放下念头，只是吃饭。", en: "With no obstructions in mind, there is no fear." },
  { text: "应无所住而生其心。", source: "《金刚经》", meaning: "不执一味，随缘而足。每一口都是新的，不用比较。", en: "Give rise to a mind that dwells nowhere." },
  { text: "凡所有相，皆是虚妄。", source: "《金刚经》", meaning: "食物的美丑皆是一时，只管安静地吃，感恩这一餐。", en: "Whatever has form is illusory — see through it and find the true." },
  { text: "一粒米中藏世界，半升锅里煮山河。", source: "祖师语", meaning: "这一碗饭包含了无数人的劳作与自然的恩赐。", en: "Within a grain of rice, the whole world; in half a pot, mountains and rivers." },
  { text: "吃茶去。", source: "《赵州录》", meaning: "赵州禅师的著名公案，日用事就是道。", en: "Go drink tea." },
  { text: "计功多少，量彼来处。", source: "《食存五观》", meaning: "这份食物来自多少人的辛劳？心存感恩。", en: "Consider how much effort went into this food and where it came from." },
  { text: "忖己德行，全缺应供。", source: "《食存五观》", meaning: "反思自己的修行是否配得上这份供养。", en: "Reflect on your own virtue — are you worthy of this offering?" },
  { text: "防心离过，贪等为宗。", source: "《食存五观》", meaning: "防止贪心生起，不执著于食物的好坏。", en: "Guard the mind against transgressions — greed is the chief one to avoid." },
  { text: "正事良药，为疗形枯。", source: "《食存五观》", meaning: "饮食是治疗饥饿的药，不是为了享受。", en: "Food is medicine for the body — taken to remedy weakness, not for pleasure." },
  { text: "为成道业，应受此食。", source: "《食存五观》", meaning: "受这份食物是为了修道，保持道心。", en: "I accept this food in order to accomplish the work of the Way." },
  { text: "受食当愿众生，禅悦为食，法喜充满。", source: "《华严经·净行品》", meaning: "受食时发愿，愿众生皆以法喜为食粮。", en: "When receiving food, may all beings be fed by meditative joy and filled with Dharma-bliss." },
  { text: "每一口饭，都是因缘聚合。", source: "祖师语", meaning: "农夫、阳光、雨水、土地——缺一不可。", en: "Every mouthful of food is the meeting of countless conditions." },
  { text: "吃饭时吃饭，睡觉时睡觉。", source: "祖师语", meaning: "专注当下，不分心，这就是修行。", en: "When eating, eat; when sleeping, sleep." },
  { text: "粒粒皆辛苦。", source: "李绅《悯农》", meaning: "每一粒粮食背后都有汗水，不可浪费。", en: "Every single grain cost someone sweat and toil." },
  { text: "惜福是修行的基础。", source: "祖师语", meaning: "不浪费、不挑食，惜用物资是修行功夫。", en: "Cherishing blessings is the foundation of practice." },
  { text: "素食清心，慈悲护生。", source: "祖师语", meaning: "素食不只是饮食选择，也是慈悲的体现。", en: "Vegetarian food purifies the mind and compassion protects life." },
  { text: "不杀生，慈心于一切众生。", source: "《梵网经》", meaning: "不杀生是慈悲最基本的体现，从饮食开始。", en: "Do not kill — hold a compassionate mind toward all sentient beings." },
  { text: "安食不言，专心咀嚼。", source: "《百丈清规》", meaning: "用斋时保持安静，专注在饮食本身。", en: "Eat in silence; chew with full attention." },
  { text: "此食色香味，上供十方佛。", source: "《供养偈》", meaning: "用斋之前先供佛，以感恩心受用食物。", en: "This food — its color, fragrance, and taste — is offered to the Buddhas of the ten directions." },
  { text: "三德六味，供佛及僧。", source: "《僧厨》", meaning: "烹饪时也是修行，以三德六味供养三宝。", en: "Three virtues and six flavors offered to the Buddha and Sangha." },
  { text: "食肉断大慈悲种。", source: "《楞严经》", meaning: "以慈悲为本，修行者应断绝肉食。", en: "Eating meat cuts off the seed of great compassion." },
  { text: "饥来开口笑，睡来合眼眠。", source: "祖师语", meaning: "顺应自然需求，饥时食，困时眠，自然而然。", en: "When hungry, open the mouth and smile; when tired, close the eyes and sleep." },
  { text: "一餐一饭，知恩报恩。", source: "祖师语", meaning: "每一餐饭都是众生的恩赐，受用时心存感恩。", en: "With each meal, know grace — and repay it." },
];

const COMPASSION_QUOTES: Quote[] = [
  { text: "诸恶莫作，众善奉行，自净其意。", source: "《法句经》", meaning: "慈悲先从止恶行善开始，护持是善行之一。", en: "Cease all evil, cultivate all good, purify the mind." },
  { text: "心净则国土净。", source: "《维摩诘经》", meaning: "心清净，所护持的世界亦清净。护持是净化内心的因缘。", en: "When the mind is pure, the land is pure." },
  { text: "若人欲了知，三世一切佛，应观法界性，一切唯心造。", source: "《华严经》", meaning: "转心即转境，护持由心。护持的意念本身已是修行。", en: "All is mind-made." },
  { text: "一切众生悉有佛性。", source: "《大般涅槃经》", meaning: "护持即护持众生觉性。你的支持让更多人有机会触碰清净。", en: "All sentient beings possess the Buddha-nature." },
  { text: "少欲知足，身心自在。", source: "《佛遗教经》", meaning: "护持不在多寡，贵在真心。随喜随力，皆是功德。", en: "With few desires and contentment, body and mind are at ease." },
  { text: "知足之人，虽卧地上，犹为安乐。", source: "《佛遗教经》", meaning: "少欲知足，福德自生。护持他人的清净，自身亦获安乐。", en: "One who knows contentment is at ease even sleeping on the ground." },
  { text: "众生无边誓愿度。", source: "《四弘誓愿》", meaning: "护持的心与菩萨誓愿相应，利益无量众生。", en: "Sentient beings are numberless — I vow to liberate them." },
  { text: "无缘大慈，同体大悲。", source: "祖师语", meaning: "不分亲疏，视一切众生为自身，真正的大慈悲。", en: "Great compassion without conditions; great mercy as one body." },
  { text: "慈悲为怀，方便为门。", source: "祖师语", meaning: "以慈悲心利益众生，以善巧方便接引有缘。", en: "Hold compassion in the heart; use skillful means as the gate." },
  { text: "菩萨畏因，众生畏果。", source: "祖师语", meaning: "护持是种善因，果报自然清净吉祥。", en: "Bodhisattvas fear causes; sentient beings fear results." },
  { text: "财布施得财富，法布施得智慧，无畏布施得健康。", source: "祖师语", meaning: "三种布施各有果报，护持是功德之门。", en: "Material giving brings wealth; Dharma giving brings wisdom; fearlessness giving brings health." },
  { text: "随喜功德，亦是修行。", source: "《华严经·普贤行愿品》", meaning: "见他人行善而随喜，自己也得功德。", en: "Rejoicing in others' merit is itself a form of practice." },
  { text: "布施如播种，福田由此生。", source: "《大宝积经》", meaning: "随喜护持，是在良田中播下善种。", en: "Giving is like planting seeds — a field of merit grows from it." },
  { text: "修福不修慧，大象披璎珞；修慧不修福，罗汉托空钵。", source: "祖师语", meaning: "福慧双修才是圆满，护持是修福的方式之一。", en: "Cultivating merit without wisdom is like an elephant draped in jewels; wisdom without merit is like an arhat with an empty bowl." },
  { text: "人人心中有佛，人人皆可成佛。", source: "祖师语", meaning: "护持是为了让更多人有机会找到内在的佛。", en: "Everyone carries a Buddha within; everyone can become a Buddha." },
  { text: "种善因，得善果，因果不虚。", source: "祖师语", meaning: "随喜护持是善因，善果必然而来。", en: "Plant good causes, reap good results — karma is infallible." },
  { text: "广种福田，不问收获。", source: "祖师语", meaning: "广泛布施，不执著于回报，才是真正的布施心。", en: "Sow merit broadly, without asking for the harvest." },
  { text: "处处皆道场，人人皆菩萨。", source: "祖师语", meaning: "护持这道场，就是在服务每一位来此的菩萨。", en: "Every place is a practice hall; every person is a bodhisattva." },
  { text: "独乐乐不如众乐乐。", source: "《孟子》", meaning: "让更多人享受清净修行的环境，是最大的喜悦。", en: "Joy alone is not as joyful as joy shared with all." },
  { text: "见贤思齐，见不贤而内自省。", source: "《论语》", meaning: "见他人行善而受到激励，自己也随之精进。", en: "On seeing the virtuous, aspire to be like them; on seeing the unvirtuous, reflect inward." },
];

const POOLS: Record<Variant, Quote[]> = {
  general: GENERAL_QUOTES,
  meal: MEAL_QUOTES,
  compassion: COMPASSION_QUOTES,
};

/** Pick today's verse index deterministically — changes at midnight local time */
function getDayIndex(length: number): number {
  const dayNumber = Math.floor(Date.now() / 86_400_000);
  return dayNumber % length;
}

/** Pick a different verse (offset from today's) */
function getOffsetIndex(base: number, offset: number, length: number): number {
  return ((base + offset) % length + length) % length;
}

export default function ScriptureQuote({
  className = "",
  compact = false,
  variant = "general",
}: {
  className?: string;
  compact?: boolean;
  variant?: Variant;
}) {
  const pool = useMemo(() => POOLS[variant] || GENERAL_QUOTES, [variant]);
  const [offset, setOffset] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const baseIdx = useMemo(() => getDayIndex(pool.length), [pool.length]);
  const idx = getOffsetIndex(baseIdx, offset, pool.length);
  const quote = pool[idx];

  function nextVerse(e: React.MouseEvent) {
    e.stopPropagation();
    setOffset((o) => o + 1);
    setShowMeaning(false);
  }

  if (!mounted) {
    // SSR placeholder — avoids hydration mismatch from Date.now()
    return (
      <div className={`rounded-2xl border border-zinc-200/50 bg-white/70 px-5 py-4 sutra-block ${className}`}>
        <div className={`border-l-2 border-stone-200 pl-4 font-serif ${compact ? "text-sm" : "text-base"} leading-7 text-zinc-700`}>
          {pool[0].text}
        </div>
        <div className="mt-2 text-xs text-zinc-500">{pool[0].source}</div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-zinc-200/50 bg-white/70 px-5 py-4 sutra-block ${className}`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <span className="eyebrow" style={{ fontSize: "9.5px", opacity: 0.5 }}>
          今日一偈
        </span>
        <button
          type="button"
          onClick={nextVerse}
          title="换一偈"
          className="text-[11px] text-[var(--muted)] hover:text-[var(--ink-2)] transition-colors flex items-center gap-1 focus:outline-none"
          style={{ letterSpacing: "0.06em" }}
        >
          换一偈 ↻
        </button>
      </div>

      {/* Verse — click to expand meaning */}
      <button
        type="button"
        onClick={() => setShowMeaning((v) => !v)}
        className="w-full text-left group quote-interactive"
        aria-expanded={showMeaning}
      >
        <div className="flex items-start justify-between gap-4">
          <div className={`border-l-2 border-stone-200 pl-4 font-serif ${compact ? "text-sm" : "text-base"} leading-7 text-zinc-700`}>
            {quote.text}
          </div>
          <span className={`ink-dot shrink-0 mt-1 ${showMeaning ? "ink-dot-active" : ""}`} aria-hidden="true" />
        </div>
        <div className="mt-2 text-xs text-zinc-500">{quote.source}</div>
      </button>

      {/* Expanded meaning */}
      {showMeaning && (
        <div className="mt-4 border-t border-zinc-100 pt-4 quote-meaning space-y-2">
          <p className="text-[13px] text-zinc-700 leading-[1.8]">{quote.meaning}</p>
          <p className="text-[11.5px] text-zinc-400 leading-[1.7] italic">{quote.en}</p>
        </div>
      )}
    </div>
  );
}
