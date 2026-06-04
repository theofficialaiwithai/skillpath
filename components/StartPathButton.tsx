'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import UpgradeModal from './UpgradeModal'

export default function StartPathButton() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/paths/check-limit')
      const data = await res.json()
      if (data.atLimit && !data.isSubscribed) {
        setShowModal(true)
      } else {
        router.push('/onboarding')
      }
    } catch (e) {
      router.push('/onboarding')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-[#FF4D2E] text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
      >
        {loading ? 'Checking...' : '+ Start a new path'}
      </button>
      <UpgradeModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}
