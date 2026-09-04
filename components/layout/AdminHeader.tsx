'use client'

import { useState, useRef, useEffect } from 'react'
import { User, LogOut, ChevronDown, Menu } from 'lucide-react'

interface AdminHeaderProps {
  onMenuToggle?: () => void
}

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={onMenuToggle}
          className="lg:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex-1" />

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold">
              ادمین
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isUserMenuOpen && (
            <div className="absolute left-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
              <div className="py-1">
                <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <User className="h-4 w-4" />
                  <span>پروفایل</span>
                </button>

                <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="h-4 w-4" />
                  <span>خروج</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}