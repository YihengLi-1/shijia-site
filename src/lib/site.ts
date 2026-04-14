// src/lib/site.ts
export const SITE = {
  name: "释迦佛国素食斋",
  nameEn: "Shijia Vegetarian Sanctuary",

  tagline: "供斋，不止于食。\n愿此一餐，心有清凉。",
  taglineEn: "An offering beyond food.\nMay this meal bring stillness.",

  intro: "这里是寺院的一隅素斋，不喧哗、不繁复。以素食供斋，与诸有缘者同坐片刻，心念清明。",
  introEn: "A quiet corner of the temple. Simple, unhurried. Vegetarian meals offered in stillness, shared with all who find their way here.",

  address: "1820 Sharpless Dr, La Habra Heights, CA 90631",
  hours: "周一至周日 6:00 AM — 9:00 PM",
  hoursEn: "Daily 6:00 AM — 9:00 PM",

  contact: "电话 / 微信：请到访前预约或现场咨询",
  contactEn: "Please call or reserve before visiting",
  phone: "+1XXXXXXXXXX",   // 改成真实电话
  email: "contact@example.com", // 改成真实邮箱

  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=1820+Sharpless+Dr,+La+Habra+Heights,+CA+90631",

  mapEmbedUrl:
    "https://maps.google.com/maps?q=1820+Sharpless+Dr,+La+Habra+Heights,+CA+90631&z=15&output=embed",

  url: "https://shijiafoo.com",

  nav: [
    { label: "供斋", labelEn: "Dining", href: "/menu" },
    { label: "到访", labelEn: "Visit",  href: "/visit" },
    { label: "随喜", labelEn: "Donate", href: "/donation" },
    { label: "关于", labelEn: "About",  href: "/about" },
  ],
} as const;
