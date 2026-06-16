// Tailwind CLI / VS Code IntelliSense 共用設定
module.exports = {
  theme: {
    // 斷點（max-width，桌面優先）— 放在 theme 直屬層才能完全取代預設 min-width 斷點
    screens: {
      xl: { max: "1440px" }, // ≤ 1440px 時生效
      lg: { max: "921px" }, // ≤ 921px 時生效
      md: { max: "768px" }, // ≤ 768px 時生效
      sm: { max: "480px" }, // ≤ 480px 時生效
    },
    extend: {
      // 字型
      fontFamily: {
        sans: ["Noto Sans TC", "Inter", "sans-serif"],
        inter: ["Inter", "Noto Sans TC", "sans-serif"],
        tc: ["Noto Sans TC", "sans-serif"],
      },
      // 色彩
      colors: {
        primary: "#185EAA",
        purple: "#332784",
        dark: "#101215",
        innov: "#493276",
        green: "#A7AAC6",
        brand: "#3B4E8A",
        district: "#ECEDEE",
        insight: "#2261A4",
        gray1: "#22272C",
        gray2: "#37393B",
        alert: "#D9534F",
      },
      // 最大寬度 token
      maxWidth: {
        canvas: "1920px",
        layout: "1440px",
        content: "1200px",
      },
      // 間距補充（lr = 左右各留 1/6 版面寬）
      spacing: {
        lr: "8.333%",
        "2lr": "16.666%",
        18: "4.5rem",
        22: "5.5rem",
      },
    },
  },
};
