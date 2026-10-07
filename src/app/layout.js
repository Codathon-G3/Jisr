import "./globals.css";

export const metadata = {
  title: "جسر",
  description: "خطوتك الأولى لطلب الدعم والمساعدة",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}