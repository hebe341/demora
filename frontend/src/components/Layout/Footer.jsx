import React from 'react'

export default function Footer(){
  return (
    <footer className="w-full site-footer text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Leidy Cleaner</h3>
            <p className="text-gray-300">
              Limpeza profissional, rápida e confiável — agende online em minutos.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a href="#" className="p-2 rounded bg-white/10 hover:bg-white/20">Instagram</a>
              <a href="#" className="p-2 rounded bg-white/10 hover:bg-white/20">WhatsApp</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Navegação</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-white">Home</a></li>
              <li><a href="/servicos" className="hover:text-white">Serviços</a></li>
              <li><a href="/agendar" className="hover:text-white">Agendar</a></li>
              <li><a href="/dashboard" className="hover:text-white">Minha Conta</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contato</h4>
            <ul className="space-y-2 text-gray-300">
              <li>📞 +55 51 98030-3740</li>
              <li>📧 contato@leidycleaner.com</li>
              <li>📍 Porto Alegre, RS</li>
            </ul>
          </div>

          {/* Payment */}
          <div>
            <h4 className="font-bold mb-4">Pagamento</h4>
            <div className="space-y-2 text-gray-300">
              <p>PIX • Cartão • Mercado Pago</p>
              <p className="text-sm muted">Transações seguras e rápidas</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Leidy Cleaner. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
