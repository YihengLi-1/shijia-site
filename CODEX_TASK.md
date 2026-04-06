# Codex Task — Content Expansion: 今日一字 & 今日一偈

## Goal
Dramatically expand both content pools so users don't see repeats for months.
- 今日一字: 12 chars → ~52 chars (cycles every ~7 weeks)
- 今日一偈: general 24 → 72, meal 8 → 28, compassion 6 → 20

---

## Task 1 — 今日一字: graceful fallback + expand to 52 chars

### 1a. Modify `src/components/DailyChar.tsx`

The `CHAR_PATHS` record currently only has 12 entries. Many new characters won't have SVG paths defined. Update the SVG rendering block so that:
- If `CHAR_PATHS[entry.char]` exists → render stroke animation as now
- If it does **not** exist → render a simple fade-in of the character as a `<text>` SVG element

Replace the `<svg>` block inside the overlay with this:

```tsx
<svg
  key={openCount}
  viewBox="0 0 100 100"
  width="180"
  height="180"
  aria-hidden="true"
  className="text-[var(--bg)]"
>
  {CHAR_PATHS[entry.char] ? (
    CHAR_PATHS[entry.char].map((path, index) => (
      <path
        key={`${entry.char}-${index}`}
        d={path.d}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: path.length,
          strokeDashoffset: path.length,
          animation: "draw-stroke 0.85s ease forwards",
          animationDelay: `${index * 0.3}s`,
        }}
      />
    ))
  ) : (
    <text
      x="50"
      y="72"
      textAnchor="middle"
      fontSize="72"
      fontFamily="serif"
      fill="currentColor"
      style={{
        animation: "daily-char-copy 0.9s ease forwards",
        opacity: 0,
      }}
    >
      {entry.char}
    </text>
  )}
</svg>
```

### 1b. Expand `src/lib/dailyChar.ts`

Keep all existing 12 entries. Append the following 40 new entries to the `DAILY_CHARS` array so it has 52 entries total.

```ts
  {
    char: "慧",
    pinyin: "huì",
    meaning: "观照实相，明辨是非，不为迷惑所转。",
    quote: "戒定慧三学，是佛道根本。",
    source: "《法句经》",
    en: "Precepts, concentration, and wisdom are the root of the Buddhist path.",
  },
  {
    char: "禅",
    pinyin: "chán",
    meaning: "静坐观心，直指本来面目。",
    quote: "禅者，佛之心也。",
    source: "《马祖语录》",
    en: "Chan is the mind of Buddha.",
  },
  {
    char: "悟",
    pinyin: "wù",
    meaning: "一念回光，顿见本心，迷云自散。",
    quote: "迷时师度，悟了自度。",
    source: "《六祖坛经》",
    en: "When confused, the teacher ferries you; when awakened, you ferry yourself.",
  },
  {
    char: "法",
    pinyin: "fǎ",
    meaning: "宇宙万象的运行规律，也是离苦得乐的道路。",
    quote: "法尚应舍，何况非法。",
    source: "《金刚经》",
    en: "Even the Dharma should be let go of — how much more so what is not Dharma.",
  },
  {
    char: "心",
    pinyin: "xīn",
    meaning: "万法根本，一切苦乐皆由此生，亦由此灭。",
    quote: "三界唯心，万法唯识。",
    source: "《华严经》",
    en: "The three realms are only mind; the ten thousand dharmas are only consciousness.",
  },
  {
    char: "明",
    pinyin: "míng",
    meaning: "无明散尽，心光自显，如日出云开。",
    quote: "明心见性，见性成佛。",
    source: "《六祖坛经》",
    en: "Illuminate the mind, see the nature — seeing the nature is Buddhahood.",
  },
  {
    char: "真",
    pinyin: "zhēn",
    meaning: "不假不虚，本来如此，超越一切造作。",
    quote: "真如自性，无来无去。",
    source: "《楞严经》",
    en: "True suchness — neither coming nor going.",
  },
  {
    char: "如",
    pinyin: "rú",
    meaning: "如其所是，不增不减，平等无别。",
    quote: "如如不动，了了常知。",
    source: "祖师语",
    en: "Unmoved in suchness, yet vividly aware.",
  },
  {
    char: "性",
    pinyin: "xìng",
    meaning: "本来清净，不生不灭，是万法的根源。",
    quote: "自性本自清净，自性能生万法。",
    source: "《六祖坛经》",
    en: "The self-nature is originally pure; it can give rise to all phenomena.",
  },
  {
    char: "圆",
    pinyin: "yuán",
    meaning: "圆满无缺，不偏不倚，遍照十方。",
    quote: "一月普现一切水，一切水月一月摄。",
    source: "《永嘉证道歌》",
    en: "One moon is reflected in all waters; all water-moons are contained in one moon.",
  },
  {
    char: "寂",
    pinyin: "jì",
    meaning: "动静自如，不被外境所扰，安住本然。",
    quote: "寂而常照，照而常寂。",
    source: "祖师语",
    en: "Still yet ever illuminating; illuminating yet ever still.",
  },
  {
    char: "智",
    pinyin: "zhì",
    meaning: "照了实相，善辨善恶，能断无明烦恼。",
    quote: "般若如大火，能烧一切烦恼薪。",
    source: "《大智度论》",
    en: "Prajna is like a great fire — it burns all the fuel of affliction.",
  },
  {
    char: "精",
    pinyin: "jīng",
    meaning: "精勤不懈，不退不散，道业由此成就。",
    quote: "精进勤修，如救头燃。",
    source: "《佛遗教经》",
    en: "Practice diligently, as if your head were on fire.",
  },
  {
    char: "进",
    pinyin: "jìn",
    meaning: "不停歇地向善向上，一步一步走向解脱。",
    quote: "若勤精进，则事无难者。",
    source: "《佛遗教经》",
    en: "If you practice diligently, nothing is too difficult.",
  },
  {
    char: "施",
    pinyin: "shī",
    meaning: "以欢喜心给予，不求回报，广结善缘。",
    quote: "布施如播种，福田由此生。",
    source: "《大宝积经》",
    en: "Giving is like planting seeds — a field of merit grows from it.",
  },
  {
    char: "度",
    pinyin: "dù",
    meaning: "从此岸渡至彼岸，从苦到乐，从迷到悟。",
    quote: "自度度人，自觉觉他。",
    source: "《梵网经》",
    en: "First liberate yourself, then liberate others; first awaken, then awaken others.",
  },
  {
    char: "缘",
    pinyin: "yuán",
    meaning: "万法因缘和合而生，无一独立存在。",
    quote: "此有故彼有，此生故彼生。",
    source: "《杂阿含经》",
    en: "This being, that is; this arising, that arises.",
  },
  {
    char: "因",
    pinyin: "yīn",
    meaning: "种善因得善果，一切结果皆有其根源。",
    quote: "欲知过去因，今生受者是；欲知未来果，今生作者是。",
    source: "《三世因果经》",
    en: "To know past causes, look at present results; to know future results, look at present actions.",
  },
  {
    char: "果",
    pinyin: "guǒ",
    meaning: "善有善报，因果不虚，应慎护三业。",
    quote: "假使百千劫，所作业不亡；因缘会遇时，果报还自受。",
    source: "《大宝积经》",
    en: "Though a thousand eons pass, deeds do not perish — when conditions meet, results are received.",
  },
  {
    char: "福",
    pinyin: "fú",
    meaning: "行善积德，福德自然随之而来。",
    quote: "福由心造，祸由心生。",
    source: "《地藏经》",
    en: "Blessings are created by the mind; misfortune is also born from the mind.",
  },
  {
    char: "德",
    pinyin: "dé",
    meaning: "内在的品质与修为，是真正的财富。",
    quote: "积善之家，必有余庆。",
    source: "《易经》",
    en: "A family that accumulates goodness will surely have abundant blessings.",
  },
  {
    char: "苦",
    pinyin: "kǔ",
    meaning: "了知苦的真相，才能生起出离与悲悯之心。",
    quote: "苦集灭道，是为四谛。",
    source: "《转法轮经》",
    en: "Suffering, its origin, its cessation, the path — these are the Four Noble Truths.",
  },
  {
    char: "乐",
    pinyin: "lè",
    meaning: "真正的快乐来自内心清净，而非外境满足。",
    quote: "知足常乐，以道自娱。",
    source: "《佛遗教经》",
    en: "Contentment is lasting joy; find delight in the Way itself.",
  },
  {
    char: "无",
    pinyin: "wú",
    meaning: "不执有无，超越二边，体会无所不包的开阔。",
    quote: "无无明，亦无无明尽。",
    source: "《般若心经》",
    en: "No ignorance, and also no ending of ignorance.",
  },
  {
    char: "安",
    pinyin: "ān",
    meaning: "安于当下，不求不扰，心自得其所。",
    quote: "平常心是道。",
    source: "《马祖语录》",
    en: "The ordinary mind is the Way.",
  },
  {
    char: "住",
    pinyin: "zhù",
    meaning: "安住正念，不被妄想牵引。",
    quote: "应无所住而生其心。",
    source: "《金刚经》",
    en: "Give rise to a mind that dwells nowhere.",
  },
  {
    char: "转",
    pinyin: "zhuǎn",
    meaning: "转烦恼为菩提，化逆境为助缘。",
    quote: "若能转物，即同如来。",
    source: "《楞严经》",
    en: "If you can turn things, you are the same as the Tathagata.",
  },
  {
    char: "归",
    pinyin: "guī",
    meaning: "回归本心，一切道路终将回到原点。",
    quote: "万法归一，一归何处？",
    source: "祖师语",
    en: "Ten thousand things return to one — where does the one return?",
  },
  {
    char: "信",
    pinyin: "xìn",
    meaning: "信为道源功德母，发心修行的第一步。",
    quote: "信为道元功德母，长养一切诸善法。",
    source: "《华严经》",
    en: "Faith is the source of the path and mother of virtue, nurturing all wholesome dharmas.",
  },
  {
    char: "愿",
    pinyin: "yuàn",
    meaning: "发宏愿度化众生，愿力是修行最深的动力。",
    quote: "众生无边誓愿度，烦恼无尽誓愿断。",
    source: "《四弘誓愿》",
    en: "Sentient beings are numberless — I vow to liberate them all.",
  },
  {
    char: "行",
    pinyin: "xíng",
    meaning: "解行并重，知而不行非真知。",
    quote: "空谈无益，力行乃道。",
    source: "祖师语",
    en: "Empty talk is worthless — the Way lies in practice.",
  },
  {
    char: "持",
    pinyin: "chí",
    meaning: "受持正法，守护戒律，不令散失。",
    quote: "受持读诵，为人演说。",
    source: "《金刚经》",
    en: "Receive, uphold, read, recite, and expound it to others.",
  },
  {
    char: "光",
    pinyin: "guāng",
    meaning: "智慧之光照破无明，不灭不增。",
    quote: "无量光，无量寿，光明遍照十方。",
    source: "《阿弥陀经》",
    en: "Boundless light, boundless life — illuminating all the ten directions.",
  },
  {
    char: "道",
    pinyin: "dào",
    meaning: "通向解脱的路，也是万物运行的规律。",
    quote: "平常心是道，行住坐卧皆道场。",
    source: "《马祖语录》",
    en: "The ordinary mind is the Way — walking, standing, sitting, lying — all are practice.",
  },
  {
    char: "悦",
    pinyin: "yuè",
    meaning: "修行之中自有喜悦，非外求所得。",
    quote: "法喜充满，禅悦为食。",
    source: "《无量寿经》",
    en: "Filled with the joy of Dharma, nourished by meditative bliss.",
  },
  {
    char: "清",
    pinyin: "qīng",
    meaning: "心地清明，一尘不染，自然自在。",
    quote: "清净心中常寂照，如月映千江。",
    source: "祖师语",
    en: "In a pure mind there is constant still illumination — like the moon reflected in a thousand rivers.",
  },
  {
    char: "息",
    pinyin: "xī",
    meaning: "妄念息处，本心显现，呼吸即是道场。",
    quote: "息心即是道，何须更觅佛。",
    source: "祖师语",
    en: "Where the mind rests, that is the Way — why search further for Buddha?",
  },
  {
    char: "本",
    pinyin: "běn",
    meaning: "追根究底，回到最初清净的本来面目。",
    quote: "本来面目，父母未生前是什么？",
    source: "祖师语",
    en: "What was your original face before your parents were born?",
  },
  {
    char: "了",
    pinyin: "liǎo",
    meaning: "了然通透，无所障碍，彻见实相。",
    quote: "了即业障本来空，未了应须还宿债。",
    source: "《永嘉证道歌》",
    en: "When awakened, karmic obstacles are originally empty; not yet awakened, one must repay old debts.",
  },
  {
    char: "照",
    pinyin: "zhào",
    meaning: "以觉照观察内心，不被妄念遮蔽。",
    quote: "照见五蕴皆空，度一切苦厄。",
    source: "《般若心经》",
    en: "Illuminating and perceiving that the five aggregates are empty, one transcends all suffering.",
  },
  {
    char: "观",
    pinyin: "guān",
    meaning: "如实观察身心，不逃避，不执著。",
    quote: "观自在菩萨，行深般若波罗蜜多时。",
    source: "《般若心经》",
    en: "The Bodhisattva Avalokiteshvara, practicing deep prajna-paramita...",
  },
```

---

## Task 2 — 今日一偈: expand ScriptureQuote content pools

File: `src/components/ScriptureQuote.tsx`

### Expand GENERAL_QUOTES: add 48 more entries (24 → 72 total)

Append these to the existing `GENERAL_QUOTES` array:

```ts
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
```

### Expand MEAL_QUOTES: add 20 more entries (8 → 28 total)

Append these to the existing `MEAL_QUOTES` array:

```ts
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
```

### Expand COMPASSION_QUOTES: add 14 more entries (6 → 20 total)

Append these to the existing `COMPASSION_QUOTES` array:

```ts
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
```

---

## Quality Checklist

- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] All new `DailyCharEntry` objects have all 6 fields: `char`, `pinyin`, `meaning`, `quote`, `source`, `en`
- [ ] All new `Quote` objects have all 4 fields: `text`, `source`, `meaning`, `en`
- [ ] No duplicate `char` values in `DAILY_CHARS`
- [ ] SVG fallback `<text>` element renders when `CHAR_PATHS[entry.char]` is undefined
- [ ] `npm run build` completes with 0 errors
- [ ] Commit: `git add -A && git commit -m "content: expand 今日一字 to 52 chars + 今日一偈 pools to 72/28/20"`

## Do NOT change
- The `getTodayChar()` function logic
- The `getDayIndex()` / `getOffsetIndex()` logic in ScriptureQuote
- Any CSS, animation, or component structure not explicitly listed above
- Any other files not mentioned in this spec
