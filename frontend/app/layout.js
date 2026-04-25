import { Inter, JetBrains_Mono } from "next/font/google";
import Toast from "@/components/Toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata = {
  title: "SkillSprint 2026 — Your AI Placement Partner",
  description:
    "Not a Notion tracker. An autonomous AI coach that pulls the 2026 batch through placement season — fighting skill obsolescence, application fatigue, and burnout.",
  openGraph: {
    title: "SkillSprint 2026",
    description: "An autonomous AI coach for the 2026 placement batch.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body>
        {children}
        <Toast />
      </body>
    </html>
  );
}
