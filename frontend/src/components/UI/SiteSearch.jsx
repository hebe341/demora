import React, { useState } from 'react'
import { Search } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/router'

export default function SiteSearch({ className = '' }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const onSubmit = (e) => {
    e && e.preventDefault()
    if (!q || q.trim().length === 0) {
      setOpen(false)
      return
    }
    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
    setOpen(false)
  }

  return (
    <>
      {/* Desktop inline search */}
      <form onSubmit={onSubmit} className={`relative hidden md:flex items-center ${className}`}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Image src="/icon-brand.jpg" alt="logo" width={20} height={20} className="rounded-full" />
        </div>
        <input
          aria-label="Buscar no site"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar serviços, dúvidas ou artigos..."
          className="pl-10 pr-10 py-2 rounded-full border border-slate-200 bg-white text-sm w-72 focus:ring-2 focus:ring-primary-300 focus:outline-none"
        />
        <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 rounded-full bg-primary-600 text-white hidden sm:inline-flex items-center gap-2">
          <Search className="w-4 h-4" />
        </button>
      </form>

      {/* Mobile button + modal */}
      <div className="md:hidden">
        <button onClick={() => setOpen(true)} aria-label="Abrir busca" className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
          <Search className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>

        {open && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-start pt-24 px-4">
            <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xl">
              <form onSubmit={onSubmit} className="flex items-center gap-3">
                <img src="/icon-brand.jpg" alt="logo" className="w-8 h-8 rounded-full" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar serviços, dúvidas ou artigos..."
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
                <button type="button" onClick={() => { setQ(''); setOpen(false) }} className="px-3 py-2 rounded-md text-sm">Cancelar</button>
              </form>
              <div className="mt-4 text-sm text-slate-600">Dica: busque por "faxina", "preço" ou "serviço 1".</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
