"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") || "/admin/orders";

  function submit() {
    if (!key) {
      setError("请输入 ADMIN_KEY");
      return;
    }

    // 写 cookie（和 middleware 里读的是同一个）
    document.cookie = `admin_key=${key}; path=/;`;

    router.replace(next);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8e8ef",
      }}
    >
      <div
        style={{
          width: 360,
          padding: 24,
          borderRadius: 12,
          background: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,.1)",
        }}
      >
        <h1 style={{ fontSize: 22, marginBottom: 12 }}>管理员登录</h1>

        <input
          type="password"
          placeholder="ADMIN_KEY"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: 14,
            borderRadius: 8,
            border: "1px solid #ddd",
            marginBottom: 10,
          }}
        />

        {error && (
          <div style={{ color: "red", fontSize: 13, marginBottom: 10 }}>
            {error}
          </div>
        )}

        <button
          onClick={submit}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            background: "#111",
            color: "#fff",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          登录
        </button>
      </div>
    </main>
  );
}