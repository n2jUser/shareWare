import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/layout/AuthProvider'

export const metadata: Metadata = {
  title: 'ShopWave — Modern Commerce',
  description: 'A modern e-commerce platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                borderRadius: '10px',
                background: '#0A0A0A',
                color: '#fff',
                border: '1px solid #2E2E2E',
              },
              success: { iconTheme: { primary: '#C8FF00', secondary: '#0A0A0A' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}