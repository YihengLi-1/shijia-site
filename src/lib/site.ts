// src/lib/site.ts
export const SITE = {
  name: "释迦佛国素食斋",
  tagline: "供斋，不止于食。\n愿此一餐，心有清凉。",

  intro:
    "这里是寺院的一隅素斋，不喧哗、不繁复。以素食供斋，与诸有缘者同坐片刻，心念清明。",

  address: "1820 Sharpless Dr, La Habra Heights, CA 90631",
  hours: "周一至周日 5:00 AM — 9:00 PM",

  // ✅ 以后所有页面都从这里读联系方式
  contact: "电话 / 微信：请到访前预约或现场咨询",
  phone: "+1XXXXXXXXXX", // 改成真实电话：+1 + 10位数字
  email: "contact@example.com", // 改成真实邮箱

  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=1820+Sharpless+Dr,+La+Habra+Heights,+CA+90631",

  url: "https://shijiafoo.com",

  nav: [
    { label: "供斋", href: "/menu" },
    { label: "到访", href: "/visit" },
    { label: "随喜", href: "/donation" },
  ],
} as const;
