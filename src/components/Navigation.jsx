import React, { useState, useEffect } from 'react'
import { Menu, X, ChevronDown, Zap, Shield, Network } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#datadao', label: 'DataDAO' },
    { href: '#programs', label: 'Programs' },
    { href: '#partners', label: 'Partners' },
    { href: '#contact', label: 'Contact' }
  ]

  const scrollToSection = (href) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-black/90 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-50 web3-neon-glow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 web3-gradient-primary rounded-xl flex items-center justify-center web3-neon-glow group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold web3-neon-text group-hover:web3-gradient-primary bg-clip-text text-transparent transition-all duration-300">
              KoData
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-gray-300 hover:text-purple-400 font-medium transition-all duration-300 hover:web3-neon-text"
              >
                {item.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              className="web3-gradient-primary text-white web3-button-glow hover:scale-105 transition-all duration-300"
              onClick={() => scrollToSection('#datadao')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Join DataDAO
            </Button>
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-300 hover:text-purple-400 hover:bg-white/10 transition-colors duration-200 web3-neon-text-hover"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-500/30">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="text-left px-4 py-2 text-gray-300 hover:text-purple-400 hover:bg-white/5 rounded-md transition-all duration-300 web3-neon-text-hover"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
