// src/lib/site.ts
export const SITE = {
  name: "释迦佛国素食斋",
  tagline: "一个对外开放的寺庙素食空间。\n请以修行场所的秩序与安静来访。",

  address: "1820 Sharpless Dr, La Habra Heights, CA 90631",
  hours: "周一至周日 5:00 AM — 9:00 PM",

  // ✅ 以后所有页面都从这里读联系方式
  contact: "电话 / 微信：请到访前预约或现场咨询",
  phone: "+1XXXXXXXXXX", // 改成真实电话：+1 + 10位数字
  email: "contact@example.com", // 改成真实邮箱

  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=1820+Sharpless+Dr,+La+Habra+Heights,+CA+90631",

  nav: [
    { label: "素食斋", href: "/veggie" },
    { label: "到访", href: "/visit" },
    { label: "随喜", href: "/donation" },
    { label: "预约", href: "/book" },
    { label: "支付", href: "/pay" },
  ],
} as const;