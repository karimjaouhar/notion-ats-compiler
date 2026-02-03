import "./globals.css";
import { Inter, Source_Serif_4 } from "next/font/google";

const bodyFont = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-body"
});

const uiFont = Inter({
  subsets: ["latin"],
  variable: "--font-ui"
});

export const metadata = {
  title: "Notion ATS Next Blog",
  description: "Example app rendering Notion content via @notion-ats."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${uiFont.variable}`}>
        <div className="page">{children}</div>
      </body>
    </html>
  );
}
