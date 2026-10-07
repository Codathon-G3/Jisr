import "./globals.css";

export const metadata = {
  title: "جسر | Jisr",
  description: "جسر لطيف نحو شخص تثق به",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}