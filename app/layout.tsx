import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "추억을 다시, 영상으로 | AI 사진 영상 변환",
  description: "AI가 오래된 사진에 생명을 불어넣습니다",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/favicon/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/favicon/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/favicon/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${geist.className} antialiased`}>{children}</body>
    </html>
  )
}
