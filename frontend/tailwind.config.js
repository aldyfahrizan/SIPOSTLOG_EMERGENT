module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "sans-serif"],
        body: ['"Manrope"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        ink: { 950: "#0B1120", 900: "#0F172A", 800: "#1E293B", 700: "#334155", 600: "#475569" },
        amber: { brand: "#F59E0B" },
        paper: "#F8FAFC",
        brand: { blue: "#1E3A8A", orange: "#C2410C" },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(245,158,11,0.35), 0 12px 40px -12px rgba(245,158,11,0.35)",
        card: "0 1px 2px rgba(15,23,42,0.06), 0 8px 24px -12px rgba(15,23,42,0.18)",
      },
      keyframes: {
        rise: { "0%": { opacity: 0, transform: "translateY(14px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        pulseDot: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.35 } },
      },
      animation: {
        rise: "rise 0.55s cubic-bezier(0.22,1,0.36,1) both",
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
