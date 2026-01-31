import React, { useState } from 'react';
import Link from 'next/link';
import ThemeSwitcher from '../UI/ThemeSwitcher'

export default function Header(){
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full sticky top-0 z-50 site-header">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <Link href="/">
            <a className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-md">LC</div>
              <div>
                <div className="text-lg logo-mark">Leidy Cleaner</div>
                <div className="text-xs muted hidden md:block">Limpeza profissional — Porto Alegre</div>
              </div>
            </a>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/"><a className="hover:text-blue-400">Home</a></Link>
          <Link href="/servicos"><a className="hover:text-blue-400">Serviços</a></Link>
          <Link href="/agendar"><a className="hover:text-blue-400">Agendar</a></Link>
          <Link href="/dashboard"><a className="hover:text-blue-400">Minha Conta</a></Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Link href="/agendar"><a className="btn-primary hidden md:inline-flex">Agendar</a></Link>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded bg-gray-100"
            aria-label="Abrir menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-sm">
          <Link href="/"><a className="block py-3 px-4">Home</a></Link>
          <Link href="/servicos"><a className="block py-3 px-4">Serviços</a></Link>
          <Link href="/agendar"><a className="block py-3 px-4">Agendar</a></Link>
          <Link href="/dashboard"><a className="block py-3 px-4">Minha Conta</a></Link>
        </div>
      )}
    </header>
  )
}
