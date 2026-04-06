export type DailyCharEntry = {
  char: string;
  pinyin: string;
  meaning: string;
  quote: string;
  source: string;
  en: string;
};

export const DAILY_CHARS: DailyCharEntry[] = [
  {
    char: "空",
    pinyin: "kōng",
    meaning: "观缘起而不执著，心地自然宽明。",
    quote: "色即是空，空即是色。",
    source: "《心经》",
    en: "Form is emptiness, emptiness is form.",
  },
  {
    char: "净",
    pinyin: "jìng",
    meaning: "身心澄明时，所处之境也随之清净。",
    quote: "心净则国土净。",
    source: "《维摩诘经》",
    en: "When the mind is pure, the land is pure.",
  },
  {
    char: "慈",
    pinyin: "cí",
    meaning: "以温柔善意安乐众生。",
    quote: "慈能与乐，悲能拔苦。",
    source: "《大智度论》",
    en: "Compassion gives joy; mercy removes suffering.",
  },
  {
    char: "悲",
    pinyin: "bēi",
    meaning: "见苦知苦，发愿拔济一切。",
    quote: "同体大悲，无缘大慈。",
    source: "《梵网经》",
    en: "Great compassion embraces all as one body.",
  },
  {
    char: "喜",
    pinyin: "xǐ",
    meaning: "随顺正法而生欢喜光明。",
    quote: "法喜充满，禅悦为食。",
    source: "《无量寿经》",
    en: "Filled with the joy of Dharma, nourished by meditative bliss.",
  },
  {
    char: "舍",
    pinyin: "shě",
    meaning: "放下执取，得自在平等。",
    quote: "放下即自在，舍得即得。",
    source: "祖师语",
    en: "Let go — and freedom follows.",
  },
  {
    char: "觉",
    pinyin: "jué",
    meaning: "返照自心，离迷见真。",
    quote: "觉而不迷，正而不邪。",
    source: "《六祖坛经》",
    en: "Awakened and not confused; upright and not deviant.",
  },
  {
    char: "定",
    pinyin: "dìng",
    meaning: "外不逐境，内心安住。",
    quote: "外离相即禅，内不乱即定。",
    source: "《六祖坛经》",
    en: "Unattached outwardly is Chan; undisturbed inwardly is samadhi.",
  },
  {
    char: "忍",
    pinyin: "rěn",
    meaning: "以柔和定力承受逆境，不失本心。",
    quote: "忍辱波罗蜜，能除百种苦。",
    source: "《金刚经》",
    en: "The perfection of patience dispels a hundred sufferings.",
  },
  {
    char: "戒",
    pinyin: "jiè",
    meaning: "守护身口意，使道心有根。",
    quote: "戒为无上菩提本，应当具足持净戒。",
    source: "《梵网经》",
    en: "Precepts are the root of supreme awakening.",
  },
  {
    char: "念",
    pinyin: "niàn",
    meaning: "念念回光，常住当下清明。",
    quote: "念念不离心，心心皆是佛。",
    source: "祖师语",
    en: "Thought after thought, never apart from the mind — each mind is Buddha.",
  },
  {
    char: "善",
    pinyin: "shàn",
    meaning: "止恶行善，使心行端正。",
    quote: "诸恶莫作，众善奉行。",
    source: "《法句经》",
    en: "Refrain from all evil; practice all good.",
  },
];

export function getTodayChar(): DailyCharEntry {
  const index = Math.floor(Date.now() / 86_400_000) % DAILY_CHARS.length;
  return DAILY_CHARS[index];
}
