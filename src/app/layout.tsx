// src/app/layout.tsx
import { Inter } from 'next/font/google'
import './globals.css'
import { MainLayout } from '@/components/MainLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Family Planner',
  description: 'A daily planner for families with young children',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}