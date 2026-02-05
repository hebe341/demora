/**
 * Featured Services Carousel Component
 * Showcases principais serviços com mais detalhes
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function FeaturedServices() {
  const [selectedService, setSelectedService] = useState(0)

  const services = [
    {
      id: 1,
      title: 'Limpeza Residencial',
      icon: '🏠',
      description: 'Limpeza completa para apartamentos e casas',
      details: 'Inclui sala, cozinha, quartos, banheiros e corredores com atenção a detalhes',
      price: 'A partir de R$ 160',
      features: ['Aspiração', 'Limpeza profunda', 'Organização', 'Desinfecção'],
      color: 'from-blue-500 to-blue-600',
      image: '/services/residential.jpg'
    },
    {
      id: 2,
      title: 'Limpeza Comercial',
      icon: '🏢',
      description: 'Escritórios, lojas e espaços corporativos',
      details: 'Serviços especializados para ambientes comerciais com horários flexíveis',
      price: 'Orçamento personalizado',
      features: ['Limpeza diária', 'Manutenção', 'Desinfecção', 'Áreas comuns'],
      color: 'from-cyan-500 to-cyan-600',
      image: '/services/commercial.jpg'
    },
    {
      id: 3,
      title: 'Limpeza Pós-Mudança',
      icon: '✨',
      description: 'Preparação completa de imóvel após mudança',
      details: 'Limpeza profunda de todos os ambientes, rodapés, arandelas e áreas altas',
      price: 'A partir de R$ 350',
      features: ['Limpeza total', 'Janelas', 'Rodapés', 'Áreas altas'],
      color: 'from-purple-500 to-purple-600',
      image: '/services/move-out.jpg'
    },
    {
      id: 4,
      title: 'Manutenção Periódica',
      icon: '🔄',
      description: 'Limpeza regular semanal ou mensal',
      details: 'Mantenha sua casa sempre impecável com serviços recorrentes personalizados',
      price: 'Pacotes a partir de R$ 599/mês',
      features: ['Semanal', 'Quinzenal', 'Mensal', 'Desconto especial'],
      color: 'from-green-500 to-green-600',
      image: '/services/maintenance.jpg'
    }
  ]

  const currentService = services[selectedService]

  return (
    <section className="py-20 sm:py-32 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Nossos Serviços em Destaque
          </motion.h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Soluções personalizadas para cada necessidade
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services List */}
          <div className="lg:col-span-1 space-y-4">
            {services.map((service, i) => (
              <motion.button
                key={service.id}
                onClick={() => setSelectedService(i)}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${
                  selectedService === i
                    ? `bg-gradient-to-r ${service.color} text-white border-transparent shadow-lg`
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-cyan-400'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-4xl mb-3">{service.icon}</div>
                <h3 className={`text-lg font-bold mb-2 ${selectedService !== i && 'text-gray-900 dark:text-white'}`}>
                  {service.title}
                </h3>
                <p className={`text-sm ${selectedService === i ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                  {service.description}
                </p>
              </motion.button>
            ))}
          </div>

          {/* Service Details */}
          <motion.div
            key={currentService.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-2"
          >
            {/* Main Card */}
            <div className={`bg-gradient-to-br ${currentService.color} text-white rounded-3xl p-8 mb-8 shadow-xl`}>
              <div className="text-7xl mb-6">{currentService.icon}</div>
              <h2 className="text-4xl font-bold mb-4">{currentService.title}</h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                {currentService.details}
              </p>

              {/* Price Highlight */}
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/30">
                <p className="text-white/80 text-sm mb-2">Valor estimado</p>
                <p className="text-3xl font-bold">{currentService.price}</p>
              </div>

              {/* CTA Button */}
              <Link href="/agendar">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  <span>📅</span>
                  Agendar Este Serviço
                  <span>→</span>
                </motion.div>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentService.features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 text-center"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {feature}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats under Services CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link href="/servicos">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 px-12 rounded-lg hover:shadow-lg transition cursor-pointer"
            >
              <span>📋</span>
              Explorar Todos os Serviços
              <span>→</span>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
