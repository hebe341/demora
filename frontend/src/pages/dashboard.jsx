import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('bookings')

  useEffect(() => {
    if (token) {
      fetchBookings()
    }
  }, [token])

  const fetchBookings = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const res = await fetch(`${API_URL}/api/bookings/${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings || mockBookings)
      } else {
        setBookings(mockBookings)
      }
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err)
      setBookings(mockBookings)
    } finally {
      setLoading(false)
    }
  }

  const mockBookings = [
    {
      id: 1,
      date: '2026-02-15',
      time: '14:00',
      service: 'Limpeza Residencial',
      address: 'Rua A, 123 - Porto Alegre, RS',
      status: 'confirmado',
      price: 120,
      professional: 'Leidy Silva',
      rating: 5,
    },
    {
      id: 2,
      date: '2026-02-08',
      time: '10:00',
      service: 'Limpeza Profunda',
      address: 'Rua B, 456 - Porto Alegre, RS',
      status: 'concluido',
      price: 180,
      professional: 'Maria Santos',
      rating: 5,
    },
    {
      id: 3,
      date: '2026-01-28',
      time: '16:00',
      service: 'Limpeza de Vidros',
      address: 'Rua C, 789 - Porto Alegre, RS',
      status: 'concluido',
      price: 100,
      professional: 'Ana Costa',
      rating: 4,
    },
  ]

  const getStatusBadge = (status) => {
    const badges = {
      confirmado: 'bg-blue-100 text-blue-800',
      concluido: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
      pendente: 'bg-yellow-100 text-yellow-800',
    }
    const statusLabels = {
      confirmado: '✓ Confirmado',
      concluido: '✓ Concluído',
      cancelado: '✗ Cancelado',
      pendente: '⏳ Pendente',
    }
    return `${badges[status] || ''} px-3 py-1 rounded-full text-sm font-semibold`
  }

  if (!user) {
    return (
      <>
        <Head>
          <title>Minha Conta - Leidy Cleaner</title>
        </Head>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow container py-12">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
              <p className="muted mb-6">Por favor, faça login para acessar seu dashboard.</p>
              <a href="/agendar" className="btn-primary">Agendar Agora</a>
            </div>
          </main>
          <Footer />
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Minha Conta - Leidy Cleaner</title>
        <meta name="description" content="Visualize seu histórico de agendamentos e gerenecie sua conta." />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Profile Summary */}
              <div className="card md:col-span-1">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <h3 className="font-bold text-lg">{user?.name || 'Usuário'}</h3>
                  <p className="text-sm muted">{user?.email}</p>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-2xl font-bold text-emerald-600">{bookings.length}</p>
                    <p className="text-xs muted">Agendamentos</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="md:col-span-3 grid grid-cols-3 gap-4">
                <div className="card text-center">
                  <p className="text-3xl font-bold text-emerald-600">
                    {bookings.filter(b => b.status === 'concluido').length}
                  </p>
                  <p className="text-sm muted">Concluídos</p>
                </div>
                <div className="card text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {bookings.filter(b => b.status === 'confirmado').length}
                  </p>
                  <p className="text-sm muted">Confirmados</p>
                </div>
                <div className="card text-center">
                  <p className="text-3xl font-bold text-emerald-600">
                    R$ {bookings.reduce((sum, b) => sum + (b.price || 0), 0)}
                  </p>
                  <p className="text-sm muted">Total Gasto</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setTab('bookings')}
                className={`pb-3 font-semibold transition ${
                  tab === 'bookings'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-muted hover:text-emerald-500'
                }`}
              >
                📅 Agendamentos
              </button>
              <button
                onClick={() => setTab('profile')}
                className={`pb-3 font-semibold transition ${
                  tab === 'profile'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-muted hover:text-emerald-500'
                }`}
              >
                👤 Perfil
              </button>
              <button
                onClick={() => setTab('settings')}
                className={`pb-3 font-semibold transition ${
                  tab === 'settings'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-muted hover:text-emerald-500'
                }`}
              >
                ⚙️ Configurações
              </button>
            </div>

            {/* Bookings Tab */}
            {tab === 'bookings' && (
              <div>
                {loading ? (
                  <p className="muted text-center py-8">Carregando agendamentos...</p>
                ) : bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="card">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold">{booking.service}</h4>
                              <span className={getStatusBadge(booking.status)}>
                                {booking.status === 'confirmado' && '✓ Confirmado'}
                                {booking.status === 'concluido' && '✓ Concluído'}
                                {booking.status === 'cancelado' && '✗ Cancelado'}
                                {booking.status === 'pendente' && '⏳ Pendente'}
                              </span>
                            </div>
                            <p className="text-sm muted mb-2">📅 {new Date(booking.date).toLocaleDateString('pt-BR')} às {booking.time}</p>
                            <p className="text-sm muted mb-2">📍 {booking.address}</p>
                            <p className="text-sm muted">👤 Profissional: <strong>{booking.professional}</strong></p>
                            {booking.rating && (
                              <p className="text-sm mt-2">⭐ Avaliação: {booking.rating}/5</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-600">R$ {booking.price}</p>
                            {booking.status === 'confirmado' && (
                              <button className="btn-outline mt-3 text-sm">Ver Detalhes</button>
                            )}
                            {booking.status === 'concluido' && !booking.rating && (
                              <button className="btn-outline mt-3 text-sm">Avaliar</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card text-center py-8">
                    <p className="muted mb-4">Você ainda não tem agendamentos</p>
                    <a href="/agendar" className="btn-primary">Agendar Agora</a>
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {tab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="font-bold mb-4">Informações Pessoais</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold muted">Nome</label>
                      <p className="font-semibold">{user?.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold muted">Email</label>
                      <p className="font-semibold">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold muted">Telefone</label>
                      <p className="font-semibold">{user?.phone || '+55 51 98030-3740'}</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-bold mb-4">Método de Pagamento</h3>
                  <div className="space-y-3">
                    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <p className="text-sm font-semibold">PIX</p>
                      <p className="text-xs muted">Chave Aleatória</p>
                    </div>
                    <button className="btn-outline w-full text-sm">Adicionar Cartão</button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {tab === 'settings' && (
              <div className="card max-w-2xl">
                <h3 className="font-bold mb-4">Preferências</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    <span className="text-sm">Receber lembretes por email</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    <span className="text-sm">Receber lembretes por SMS</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    <span className="text-sm">Receber notificações de promoções</span>
                  </label>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold mb-3">Zona de Perigo</h4>
                  <button className="btn-outline text-red-600 border-red-600">Sair da Conta</button>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
