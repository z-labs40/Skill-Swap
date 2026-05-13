import './globals.css'
import React from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>SkillBridge | Exchange Skills. Learn Anything.</title>
        <meta name="description" content="Teach what you know. Learn what you love. Join 50,000+ users exchanging skills without spending a dime." />
      </head>
      <body>
        <div id="root-layout">
          {children}
        </div>
      </body>
    </html>
  )
}
