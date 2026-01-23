"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Container from "@/components/Container";

export default function BookPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // 预留：先存，不发
  const [people, setPeople] = useState(1);

  const [date, setDate] = useState(() => {
    // 默认今天（yyyy-mm-dd，配合 <input type="date" />）
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const [time, setTime] = useState("12:00"); // HH:mm (24h)
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const canSubmit = useMemo(() => {
    return name.trim() && phone.trim() && people > 0 && date && time && !submitting;
  }, [name, phone, people, date, time, submitting]);

  async function onSubmit() {
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        people,
        date, // yyyy-mm-dd
        time, // HH:mm
        note: note.trim() || undefined,
      };

      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail ? `提交失败：${data.detail}` : `提交失败：${data?.error || "submit_failed"}`);
        setSubmitting(false);
        return;
      }

      router.push(`/pay?bookingId=${encodeURIComponent(data.bookingId)}`);
    } catch (e: any) {
      setError(`提交失败：${String(e?.message || e || "submit_failed")}`);
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-pink-200/60 text-zinc-900">
      <Header />
      <section className="py-16">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-5xl font-black tracking-tight">预约</h1>
            <p className="mt-4 text-zinc-700">
              先把预约信息提交到云端（Supabase）。提交成功后跳转到支付页。
            </p>

            <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold">姓名</label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="你的姓名"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">电话</label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="手机号"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">邮箱（可选，先预留）</label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold">日期</label>
                    <input
                      type="date"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold">人数</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
                      value={people}
                      onChange={(e) => setPeople(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold">时间</label>
                  <input
                    type="time"
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">备注（可选）</label>
                  <textarea
                    className="mt-2 h-28 w-full resize-none rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="比如：是否带小孩、是否需要安静角落等"
                  />
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  onClick={onSubmit}
                  disabled={!canSubmit}
                  className="w-full rounded-full bg-zinc-900 px-6 py-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "提交中..." : "提交预约 → 去支付"}
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}