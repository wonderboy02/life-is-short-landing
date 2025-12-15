import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "추억을 다시, 영상으로 | AI 사진 영상 변환",
  description: "AI가 오래된 사진에 생명을 불어넣습니다",
  generator: "v0.app",
  icons: {
    icon: "/favicon/favicon_v4.svg",
    apple: "/favicon/favicon_v4.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  )
}
