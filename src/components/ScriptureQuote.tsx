"use client";

import { useEffect, useMemo, useState } from "react";

type Quote = { text: string; source: string; meaning: string };
type Variant = "general" | "meal" | "compassion";

const GENERAL_QUOTES: Quote[] = [
  { text: "诸恶莫作，众善奉行，自净其意。", source: "《法句经》", meaning: "以止恶行善为修行根本。" },
  { text: "诸行无常，是生灭法；生灭灭已，寂灭为乐。", source: "《大般涅槃经》", meaning: "万法无常，放下执著方得安乐。" },
  { text: "诸法无我，涅槃寂静。", source: "《法句经》", meaning: "看透无我，心自宁静。" },
  { text: "一切行无常，一切法无我。", source: "《法句经》", meaning: "万事皆变，莫执著于我相。" },
  { text: "色即是空，空即是色。", source: "《般若心经》", meaning: "形相与空性不二。" },
  { text: "照见五蕴皆空。", source: "《般若心经》", meaning: "看透身心构成，放下分别。" },
  { text: "不生不灭，不垢不净，不增不减。", source: "《般若心经》", meaning: "真性不随境转。" },
  { text: "心无挂碍，无有恐怖。", source: "《般若心经》", meaning: "放下挂碍，心自然安稳。" },
  { text: "凡所有相，皆是虚妄。", source: "《金刚经》", meaning: "别执著于表相。" },
  { text: "一切有为法，如梦幻泡影；如露亦如电，应作如是观。", source: "《金刚经》", meaning: "观照无常，不执一切造作。" },
  { text: "应无所住而生其心。", source: "《金刚经》", meaning: "不住于相，心才清明。" },
  { text: "若见诸相非相，即见如来。", source: "《金刚经》", meaning: "不被相缚，方见本心。" },
  { text: "过去心不可得，现在心不可得，未来心不可得。", source: "《金刚经》", meaning: "心不住三时，专注当下。" },
  { text: "心净则国土净。", source: "《维摩诘经》", meaning: "心清净，所见世界亦清净。" },
  { text: "一切众生悉有佛性。", source: "《大般涅槃经》", meaning: "众生皆具觉性。" },
  { text: "因缘所生法，我说即是空。", source: "《中论》", meaning: "一切因缘和合，皆无自性。" },
  { text: "若人欲了知，三世一切佛，应观法界性，一切唯心造。", source: "《华严经》", meaning: "心念所现，境随心转。" },
  { text: "心如工画师，能画诸世间。", source: "《华严经》", meaning: "心念能造境，宜守其净。" },
  { text: "诸法从本来，常自寂灭相。", source: "《法华经》", meaning: "本性寂静，动静皆不离。" },
  { text: "开示悟入佛之知见。", source: "《法华经》", meaning: "引人觉悟本具智慧。" },
  { text: "知足之人，虽卧地上，犹为安乐。", source: "《佛遗教经》", meaning: "知足即安，处处可乐。" },
  { text: "少欲知足，身心自在。", source: "《佛遗教经》", meaning: "减欲则自在。" },
  { text: "诸上善人俱会一处。", source: "《阿弥陀经》", meaning: "善缘相会，共成清净。" },
  { text: "若能转物，即同如来。", source: "《楞严经》", meaning: "不被境转，心自明净。" },
  { text: "本来无一物，何处惹尘埃。", source: "《六祖坛经》", meaning: "本性清净，不著尘相。" },
];

const MEAL_QUOTES: Quote[] = [
  { text: "知足之人，虽卧地上，犹为安乐。", source: "《佛遗教经》", meaning: "一餐知足，心便安稳。" },
  { text: "少欲知足，身心自在。", source: "《佛遗教经》", meaning: "少欲即自在。" },
  { text: "心净则国土净。", source: "《维摩诘经》", meaning: "清净之心，清净之食。" },
  { text: "诸恶莫作，众善奉行，自净其意。", source: "《法句经》", meaning: "以自净其意为根本。" },
  { text: "诸行无常，是生灭法；生灭灭已，寂灭为乐。", source: "《大般涅槃经》", meaning: "知无常，心安住。" },
  { text: "不生不灭，不垢不净，不增不减。", source: "《般若心经》", meaning: "心静则味亦清。" },
  { text: "心无挂碍，无有恐怖。", source: "《般若心经》", meaning: "无挂碍则安住。" },
  { text: "应无所住而生其心。", source: "《金刚经》", meaning: "不执一味，随缘而足。" },
];

const COMPASSION_QUOTES: Quote[] = [
  { text: "诸恶莫作，众善奉行，自净其意。", source: "《法句经》", meaning: "慈悲先从止恶行善开始。" },
  { text: "心净则国土净。", source: "《维摩诘经》", meaning: "心清净，所护持的世界亦清净。" },
  { text: "若人欲了知，三世一切佛，应观法界性，一切唯心造。", source: "《华严经》", meaning: "转心即转境，护持由心。" },
  { text: "一切众生悉有佛性。", source: "《大般涅槃经》", meaning: "护持即护持众生觉性。" },
  { text: "知足之人，虽卧地上，犹为安乐。", source: "《佛遗教经》", meaning: "少欲知足，福德自生。" },
  { text: "少欲知足，身心自在。", source: "《佛遗教经》", meaning: "护持不在多寡，贵在真心。" },
];

const POOLS: Record<Variant, Quote[]> = {
  general: GENERAL_QUOTES,
  meal: MEAL_QUOTES,
  compassion: COMPASSION_QUOTES,
};

function randomFloat() {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 2 ** 32;
  }
  return Math.random();
}

function pickNextIndex(variant: Variant, length: number) {
  if (typeof window === "undefined") return 0;
  const recentKey = `scripture_quote_recent_${variant}_v5`;
  const rawRecent = window.sessionStorage.getItem(recentKey);
  const recent = rawRecent ? rawRecent.split(",").filter(Boolean) : [];

  let next = Math.floor(randomFloat() * length);
  let guard = 0;
  while (recent.includes(String(next)) && guard < length) {
    next = Math.floor(randomFloat() * length);
    guard += 1;
  }

  const updated = [String(next), ...recent].slice(0, 4);
  window.sessionStorage.setItem(recentKey, updated.join(","));
  return next;
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
  const [idx, setIdx] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);

  useEffect(() => {
    setIdx(pickNextIndex(variant, pool.length));
    setShowMeaning(false);
  }, [pool.length, variant]);

  const quote = pool[idx] || pool[0];

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={showMeaning}
      onClick={() => setShowMeaning((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setShowMeaning((v) => !v);
        }
      }}
      className={`rounded-2xl border border-zinc-200/50 bg-white/70 px-5 py-4 sutra-block quote-interactive ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`border-l-2 border-stone-200 pl-4 font-serif ${compact ? "text-sm" : "text-base"} leading-7 text-zinc-700`}
        >
          {quote.text}
        </div>
        <span className={`ink-dot ${showMeaning ? "ink-dot-active" : ""}`} aria-hidden="true" />
      </div>
      <div className="mt-2 text-xs text-zinc-500">{quote.source}</div>
      {showMeaning ? (
        <div className="mt-3 text-xs text-zinc-600 leading-6 soft-rise">
          意解：{quote.meaning}
        </div>
      ) : null}
    </div>
  );
}
