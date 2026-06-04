'use client'
import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function Confetti() {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      colors: ['#FF4D2E', '#7C3AED', '#F59E0B', '#ffffff'],
      origin: { y: 0.6 }
    })
  }, [])
  return null
}
