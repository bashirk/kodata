import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Coins, ArrowUp } from 'lucide-react'

export function FloatingActionButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }

      if (window.pageYOffset > 1000) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const scrollToDataDAO = () => {
    const element = document.querySelector('#datadao')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
      
      <Button
        onClick={scrollToDataDAO}
        className="bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3 rounded-full font-semibold"
      >
        <Coins className="mr-2 h-5 w-5" />
        Earn MAD
      </Button>
    </div>
  )
}
