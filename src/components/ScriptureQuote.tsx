"use client";

import { useEffect, useMemo, useState } from "react";

type Quote = { text: string; source: string };
type Variant = "general" | "meal" | "compassion";

const GENERAL_QUOTES: Quote[] = [
  { text: "诸恶莫作，众善奉行，自净其意。", source: "《法句经》" },
  { text: "诸行无常，是生灭法；生灭灭已，寂灭为乐。", source: "《大般涅槃经》" },
  { text: "诸法无我，涅槃寂静。", source: "《法句经》" },
  { text: "一切行无常，一切法无我。", source: "《法句经》" },
  { text: "色即是空，空即是色。", source: "《般若心经》" },
  { text: "照见五蕴皆空。", source: "《般若心经》" },
  { text: "不生不灭，不垢不净，不增不减。", source: "《般若心经》" },
  { text: "心无挂碍，无有恐怖。", source: "《般若心经》" },
  { text: "凡所有相，皆是虚妄。", source: "《金刚经》" },
  { text: "一切有为法，如梦幻泡影；如露亦如电，应作如是观。", source: "《金刚经》" },
  { text: "应无所住而生其心。", source: "《金刚经》" },
  { text: "若见诸相非相，即见如来。", source: "《金刚经》" },
  { text: "过去心不可得，现在心不可得，未来心不可得。", source: "《金刚经》" },
  { text: "心净则国土净。", source: "《维摩诘经》" },
  { text: "一切众生悉有佛性。", source: "《大般涅槃经》" },
  { text: "因缘所生法，我说即是空。", source: "《中论》" },
  { text: "若人欲了知，三世一切佛，应观法界性，一切唯心造。", source: "《华严经》" },
  { text: "心如工画师，能画诸世间。", source: "《华严经》" },
  { text: "诸法从本来，常自寂灭相。", source: "《法华经》" },
  { text: "开示悟入佛之知见。", source: "《法华经》" },
  { text: "知足之人，虽卧地上，犹为安乐。", source: "《佛遗教经》" },
  { text: "少欲知足，身心自在。", source: "《佛遗教经》" },
  { text: "诸上善人俱会一处。", source: "《阿弥陀经》" },
  { text: "若能转物，即同如来。", source: "《楞严经》" },
  { text: "本来无一物，何处惹尘埃。", source: "《六祖坛经》" },
];

const MEAL_QUOTES: Quote[] = [
  { text: "粥有十利，饶益行人。", source: "《供养偈》" },
  { text: "果报无边，究竟常乐。", source: "《供养偈》" },
  { text: "三德六味，供佛及僧，法界有情，普同供养。", source: "《供养偈》" },
  { text: "若饭食时，当愿众生，禅悦为食，法喜充满。", source: "《供养偈》" },
  { text: "知足之人，虽卧地上，犹为安乐。", source: "《佛遗教经》" },
  { text: "少欲知足，身心自在。", source: "《佛遗教经》" },
  { text: "心净则国土净。", source: "《维摩诘经》" },
  { text: "诸恶莫作，众善奉行，自净其意。", source: "《法句经》" },
];

const COMPASSION_QUOTES: Quote[] = [
  { text: "愿以此功德，庄严佛净土；上报四重恩，下济三途苦。", source: "《回向偈》" },
  { text: "愿诸众生，离苦得乐。", source: "《回向偈》" },
  { text: "诸恶莫作，众善奉行，自净其意。", source: "《法句经》" },
  { text: "心净则国土净。", source: "《维摩诘经》" },
  { text: "若人欲了知，三世一切佛，应观法界性，一切唯心造。", source: "《华严经》" },
  { text: "一切众生悉有佛性。", source: "《大般涅槃经》" },
  { text: "知足之人，虽卧地上，犹为安乐。", source: "《佛遗教经》" },
  { text: "少欲知足，身心自在。", source: "《佛遗教经》" },
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

  useEffect(() => {
    setIdx(pickNextIndex(variant, pool.length));
  }, [pool.length, variant]);

  const quote = pool[idx] || pool[0];

  return (
    <div
      className={`rounded-2xl border border-zinc-200/50 bg-white/70 px-5 py-4 sutra-block ${className}`}
    >
      <div className={`border-l-2 border-stone-200 pl-4 font-serif ${compact ? "text-sm" : "text-base"} leading-7 text-zinc-700`}>
        {quote.text}
      </div>
      <div className="mt-2 text-xs text-zinc-500 text-right">{quote.source}</div>
    </div>
  );
}
