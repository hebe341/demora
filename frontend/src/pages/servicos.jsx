import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

export default function Servicos() {
  const [loading, setLoading] = useState(false);
  const services = [
    {
      id: 1,
      name: 'Limpeza Padrão',
      price: 80,
      icon: '🧹',
      description: 'Limpeza completa: varredura, aspiração, limpeza de pisos, panos, banheiro.',
      duration: '2-3 horas',
      features: ['Pisos', 'Vidros', 'Móveis', 'Banheiro'],
    },
    {
      id: 2,
      name: 'Limpeza Profunda',
      price: 120,
      icon: '✨',
      description: 'Faxina completa com desinfeção, limpeza de armários, desodorização.',
      duration: '4-5 horas',
      features: ['Tudo da Padrão', 'Desodorização', 'Desinfeção', 'Armários'],
    },
    {
      id: 3,
      name: 'Limpeza de Mudança',
      price: 150,
      icon: '📦',
      description: 'Limpeza completa antes/após mudança. Cada canto impecável.',
      duration: '6+ horas',
      features: ['Casa Vazia', 'Completa', 'Desinfeção Total'],
    },
    {
      id: 4,
      name: 'Limpeza de Vidros',
      price: 30,
      icon: '🪟',
      description: 'Limpeza profissional de vidros internos e externos.',
      duration: '1 hora',
      features: ['Vidros Internos', 'Espelhos', 'Sem Manchas'],
    },
    {
      id: 5,
      name: 'Limpeza de Refrigerador',
      price: 25,
      icon: '❄️',
      description: 'Higienização completa do interior e exterior do refrigerador.',
      duration: '1-2 horas',
      features: ['Interior', 'Exterior', 'Prateleiras'],
    },
    {
      id: 6,
      name: 'Limpeza de Forno',
      price: 40,
      icon: '🔥',
      description: 'Limpeza profunda de forno, micro-ondas e fogão.',
      duration: '1-2 horas',
      features: ['Forno', 'Fogão', 'Micro-ondas'],
    },
  ];

  return (
      <>
        <Head>
          <title>Serviços de Limpeza - Leidy Cleaner</title>
          <meta name="description" content="Conheça todos os serviços de limpeza profissional. Preços transparentes e sem surpresas." />
        </Head>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container py-12">
            <div className="max-w-6xl mx-auto">
              <div className="mb-12">
                <div className="kicker">Nossos Serviços</div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3">Limpeza para Todas as Necessidades</h1>
                <p className="lead muted max-w-3xl">Escolha o serviço ideal para sua casa ou negócio. Todos incluem profissionais treinados e produtos de qualidade.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <div key={service.id} className="card hover:shadow-lg transition-all">
                    <div className="text-5xl mb-3">{service.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                    <p className="text-sm muted mb-4">{service.description}</p>
                    
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 mb-4">
                      <div className="text-2xl font-bold text-emerald-600">R$ {service.price.toFixed(2)}</div>
                      <div className="text-xs muted">⏱️ {service.duration}</div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-semibold muted mb-2">Inclui:</p>
                      <ul className="text-sm space-y-1">
                        {service.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="text-emerald-500">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <a href="/agendar" className="btn-primary w-full text-center block">Agendar</a>
                  </div>
                ))}
              </div>

              <div className="mt-16 card bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10">
                <h3 className="text-2xl font-bold mb-3">💡 Serviços Personalizados</h3>
                <p className="text-gray-700 mb-4">
                  Não encontrou o serviço que procura? Podemos criar um pacote personalizado de acordo com suas necessidades.
                  Fale conosco para mais informações!
                </p>
                <a href="https://wa.me/5551980303740" target="_blank" rel="noopener noreferrer" className="btn-primary inline-block">
                  💬 Fale Conosco no WhatsApp
                </a>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </>
    );
  }
