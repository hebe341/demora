import React from 'react'
import Head from 'next/head'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'

export default function Home(){
  return (
    <>
      <Head>
        <title>Leidy Cleaner - Limpeza Profissional em Porto Alegre</title>
        <meta name="description" content="Agende limpeza profissional online. Preços transparentes, profissionais verificados e suporte 24/7." />
      </Head>
      <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container py-12">
        <div className="max-w-5xl mx-auto">
          <div className="card grid grid-cols-1 md:grid-cols-2 items-center gap-10">
            <div className="space-y-4">
              <div className="kicker">Serviço Premium</div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">Casa limpa. Vida leve.</h1>
              <p className="lead muted">Agende uma limpeza profissional rápida e personalizável. Profissionais verificados, preços transparentes e lembretes automáticos.</p>
              <div className="flex items-center gap-3 mt-3">
                <a href="/agendar" className="btn-primary">Agendar Agora</a>
                <a href="/servicos" className="btn-outline">Ver serviços</a>
              </div>
              <div className="mt-4 text-sm muted">Atendimento em Porto Alegre • Suporte 24/7</div>
            </div>

            <div className="flex justify-center items-center">
              <div className="w-56 h-56 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M3 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V7z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 7h6v9a1 1 0 01-1 1H10a1 1 0 01-1-1V7z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 11h2v2h-2z" fill="rgba(255,255,255,0.9)"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      </div>
    </>
  )
}
