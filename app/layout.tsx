
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Syllabus2StudyPlan — Deluxe Edition',
  description: 'Upload syllabus/JD → ultra-fast parsing with smart augmentation → drag-drop edit → weighted weekly plan → .ics export. Vercel-only.',
  keywords: ['study planner','syllabus','learning plan','calendar export','Next.js','serverless','drag and drop'],
  openGraph: {
    title: 'Syllabus2StudyPlan — Deluxe Edition',
    description: 'Looks pro. Works fast. No external backend.',
    url: 'https://your-vercel-domain.vercel.app',
    siteName: 'Syllabus2StudyPlan',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Syllabus2StudyPlan — Deluxe', images: ['/og.png'] },
  icons: [{ rel: 'icon', url: '/favicon.ico' }]
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container py-8">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="badge">Syllabus2StudyPlan — Deluxe</div>
              <span className="hidden md:inline text-sm text-gray-500">Auto-Planner from Syllabus/JD</span>
            </div>
            <nav className="text-sm space-x-4">
              <a href="/" className="hover:underline">Home</a>
              <a href="/build" className="hover:underline">Builder</a>
            </nav>
          </header>
          {children}
          <footer className="mt-16 text-sm text-gray-500">Built for Karthik · Vercel-only · Pro UI</footer>
        </div>
      </body>
    </html>
  )
}
