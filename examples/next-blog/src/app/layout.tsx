import "./globals.css";

export const metadata = {
  title: "Notion ATS Next Blog",
  description: "Example app rendering Notion content via @notion-ats."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="page">{children}</div>
      </body>
    </html>
  );
}
