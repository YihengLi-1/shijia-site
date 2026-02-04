"use client";

import { useState } from "react";

const QUOTES = [
  { text: "诸恶莫作，众善奉行，自净其意。", source: "《法句经》" },
  { text: "凡所有相，皆是虚妄。", source: "《金刚经》" },
  { text: "应无所住而生其心。", source: "《金刚经》" },
  { text: "若见诸相非相，即见如来。", source: "《金刚经》" },
  { text: "一切有为法，如梦幻泡影；如露亦如电，应作如是观。", source: "《金刚经》" },
  { text: "过去心不可得，现在心不可得，未来心不可得。", source: "《金刚经》" },
  { text: "若以色见我，以音声求我，是人行邪道，不能见如来。", source: "《金刚经》" },
  { text: "若菩萨有我相、人相、众生相、寿者相，即非菩萨。", source: "《金刚经》" },
  { text: "色即是空，空即是色。", source: "《般若心经》" },
  { text: "心无挂碍，无有恐怖。", source: "《般若心经》" },
  { text: "照见五蕴皆空。", source: "《般若心经》" },
  { text: "不生不灭，不垢不净，不增不减。", source: "《般若心经》" },
  { text: "远离颠倒梦想，究竟涅槃。", source: "《般若心经》" },
  { text: "心净则国土净。", source: "《维摩诘经》" },
  { text: "若人欲了知，三世一切佛，应观法界性，一切唯心造。", source: "《华严经》" },
  { text: "心如工画师，能画诸世间。", source: "《华严经》" },
  { text: "一切众生悉有如来智慧德相。", source: "《华严经》" },
  { text: "一切众生悉有佛性。", source: "《大般涅槃经》" },
  { text: "诸行无常，是生灭法；生灭灭已，寂灭为乐。", source: "《大般涅槃经》" },
  { text: "诸法从本来，常自寂灭相。", source: "《法华经》" },
  { text: "诸佛世尊唯以一大事因缘故出现于世。", source: "《法华经》" },
  { text: "开示悟入佛之知见。", source: "《法华经》" },
  { text: "若能转物，即同如来。", source: "《楞严经》" },
  { text: "诸上善人俱会一处。", source: "《阿弥陀经》" },
  { text: "地狱未空，誓不成佛。", source: "《地藏菩萨本愿经》" },
  { text: "本来无一物，何处惹尘埃。", source: "《六祖坛经》" },
  { text: "菩提本无树，明镜亦非台。", source: "《六祖坛经》" },
  { text: "何期自性，本自清净。", source: "《六祖坛经》" },
  { text: "何期自性，本不生灭。", source: "《六祖坛经》" },
  { text: "何期自性，本自具足。", source: "《六祖坛经》" },
  { text: "何期自性，本无动摇。", source: "《六祖坛经》" },
  { text: "何期自性，能生万法。", source: "《六祖坛经》" },
];

function pickNextIndex() {
  const key = "scripture_quote_index_v2";
  const usedKey = "scripture_quote_used_v2";
  const raw = typeof window !== "undefined" ? window.sessionStorage.getItem(key) : null;
  const last = raw ? Number(raw) : -1;
  let next = Number.isFinite(last) && last >= 0 ? (last + 1) % QUOTES.length : -1;
  if (next < 0) next = Math.floor(Math.random() * QUOTES.length);

  if (typeof window === "undefined") return next;

  const usedRaw = window.sessionStorage.getItem(usedKey);
  let used = new Set<string>((usedRaw ? usedRaw.split(",") : []).filter(Boolean));

  if (used.size >= Math.max(3, Math.floor(QUOTES.length * 0.7))) {
    used = new Set<string>();
  }

  let guard = 0;
  while (used.has(String(next)) && guard < QUOTES.length) {
    next = (next + 1) % QUOTES.length;
    guard += 1;
  }

  used.add(String(next));
  window.sessionStorage.setItem(usedKey, Array.from(used).join(","));
  window.sessionStorage.setItem(key, String(next));
  return next;
}

export default function ScriptureQuote({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const [idx] = useState(() => pickNextIndex());

  const quote = QUOTES[idx] || QUOTES[0];

  return (
    <div
      className={`rounded-2xl border border-zinc-200/70 bg-white/85 px-5 py-4 shadow-sm soft-card sutra-panel ${className}`}
    >
      <div className={`${compact ? "text-sm" : "text-base"} leading-7 text-zinc-700`}>
        {quote.text}
      </div>
      <div className="mt-2 text-xs text-zinc-500">{quote.source}</div>
    </div>
  );
}
