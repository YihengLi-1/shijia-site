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
];

const COMPASSION_QUOTES: Quote[] = [
  { text: "诸恶莫作，众善奉行，自净其意。", source: "《法句经》", meaning: "慈悲先从止恶行善开始，护持是善行之一。", en: "Cease all evil, cultivate all good, purify the mind." },
  { text: "心净则国土净。", source: "《维摩诘经》", meaning: "心清净，所护持的世界亦清净。护持是净化内心的因缘。", en: "When the mind is pure, the land is pure." },
  { text: "若人欲了知，三世一切佛，应观法界性，一切唯心造。", source: "《华严经》", meaning: "转心即转境，护持由心。护持的意念本身已是修行。", en: "All is mind-made." },
  { text: "一切众生悉有佛性。", source: "《大般涅槃经》", meaning: "护持即护持众生觉性。你的支持让更多人有机会触碰清净。", en: "All sentient beings possess the Buddha-nature." },
  { text: "少欲知足，身心自在。", source: "《佛遗教经》", meaning: "护持不在多寡，贵在真心。随喜随力，皆是功德。", en: "With few desires and contentment, body and mind are at ease." },
  { text: "知足之人，虽卧地上，犹为安乐。", source: "《佛遗教经》", meaning: "少欲知足，福德自生。护持他人的清净，自身亦获安乐。", en: "One who knows contentment is at ease even sleeping on the ground." },
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
