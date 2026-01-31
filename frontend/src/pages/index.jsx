import React from 'react'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import PersonalizationPanel from '../components/UI/PersonalizationPanel'

export default function Home(){
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="card grid grid-cols-1 md:grid-cols-2 items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Leidy Cleaner</h1>
              <p className="muted mb-4">Agende serviços de limpeza com facilidade. Atendimento rápido, profissionais treinados e pagamentos seguros.</p>
              <div className="mt-4">
                <a href="/agendar" className="btn-primary">Agendar Agora</a>
              </div>
            </div>
            <div className="hidden md:block">
              <PersonalizationPanel />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
