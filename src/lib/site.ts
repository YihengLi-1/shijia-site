// src/lib/site.ts
export const SITE = {
  name: "释迦佛国素食斋",
  tagline: "一处清净供斋之所。\n愿你在此片刻，心归于静。",

  intro:
    "这里是寺院中的素斋空间，不是餐厅。我们以素食供斋，与诸有缘者相遇。愿你在此稍作停留，心念清明。",

  address: "1820 Sharpless Dr, La Habra Heights, CA 90631",
  hours: "周一至周日 5:00 AM — 9:00 PM",

  // ✅ 以后所有页面都从这里读联系方式
  contact: "电话 / 微信：请到访前预约或现场咨询",
  phone: "+1XXXXXXXXXX", // 改成真实电话：+1 + 10位数字
  email: "contact@example.com", // 改成真实邮箱

  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=1820+Sharpless+Dr,+La+Habra+Heights,+CA+90631",

  nav: [
    { label: "供斋", href: "/menu" },
    { label: "到访", href: "/visit" },
    { label: "随喜", href: "/donation" },
    { label: "预约", href: "/book" },
  ],
} as const;
