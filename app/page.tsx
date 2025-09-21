import Link from "next/link"
import Image from "next/image"
import { PaymentIcon, BuildingIcon, RocketIcon, CheckIcon, ArrowRightIcon, CalendarIcon, UsersIcon, ChartIcon } from "@/components/icons"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="nav">
        <div className="container">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center animate-fade-in-up">
              <Image 
                src="/Padelyzer-Logo-Negro.png" 
                alt="Padelyzer" 
                width={160} 
                height={40}
                className="h-10 w-auto"
                priority
              />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <a href="#features" className="nav-item">
                Características
              </a>
              <a href="#pricing" className="nav-item">
                Precios
              </a>
              <a href="/demo" className="nav-item">
                Demo
              </a>
              <a href="/blog" className="nav-item">
                Blog
              </a>
            </nav>
            
            {/* CTA Buttons */}
            <div className="flex items-center space-x-3 animate-slide-in-right">
              <Link
                href="/login"
                className="btn btn-ghost btn-sm hidden sm:inline-flex"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register/club"
                className="btn btn-primary btn-sm group"
              >
                <span className="sm:hidden">Registro</span>
                <span className="hidden sm:inline">Registrar Club</span>
                <ArrowRightIcon size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="section-padding">
        <div className="container">
          {/* Hero Content */}
          <div className="text-center max-w-5xl mx-auto">
            <div className="animate-fade-in-up">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-success-50 text-success-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                30+ clubes ya confían en Padelyzer
              </div>
              
              <h1 className="text-display-2xl text-neutral-900 mb-6">
                La Plataforma <span className="text-gradient-brand">Inteligente</span> del Pádel Mexicano
              </h1>
              
              <p className="text-body-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
                Transforma tu club con <strong className="text-secondary-600">reservas gratis para siempre</strong>, 
                pagos divididos automáticos y un widget que multiplica tus ventas.
              </p>
              
              {/* Value Props */}
              <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm">
                <div className="flex items-center gap-2 text-neutral-600">
                  <CheckIcon size={16} className="text-success-500" />
                  Sin costos ocultos
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <CheckIcon size={16} className="text-success-500" />
                  Setup en 15 minutos
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <CheckIcon size={16} className="text-success-500" />
                  Soporte en español
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <CheckIcon size={16} className="text-success-500" />
                  Cancelable cuando quieras
                </div>
              </div>
            </div>
          
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-scale-in">
              <Link
                href="/register/club"
                className="btn btn-primary btn-xl group"
              >
                Registrar Mi Club GRATIS
                <ArrowRightIcon size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="btn btn-secondary btn-xl"
              >
                Ver Demostración
              </Link>
            </div>
            
            {/* Social Proof */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-8 px-8 py-4 bg-white/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">30+</div>
                  <div className="text-xs text-neutral-500">Clubes activos</div>
                </div>
                <div className="w-px h-8 bg-neutral-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary-600">1,000+</div>
                  <div className="text-xs text-neutral-500">Reservas/mes</div>
                </div>
                <div className="w-px h-8 bg-neutral-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600">$0</div>
                  <div className="text-xs text-neutral-500">Para siempre</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-32">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-display-lg text-neutral-900 mb-4">
                ¿Por qué <span className="text-gradient-primary">30+ clubes</span> eligieron Padelyzer?
              </h2>
              <p className="text-body-lg text-neutral-600 max-w-2xl mx-auto">
                Porque eliminamos el Excel, los papelitos y los problemas que te quitan tiempo y dinero.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card-elevated p-8 text-center group hover:scale-102 transition-all duration-200 animate-fade-in-up">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <PaymentIcon size={36} className="text-white" />
                </div>
                <h3 className="text-heading-xl text-neutral-900 mb-4">Pagos Divididos Automáticos</h3>
                <p className="text-body-base text-neutral-600 mb-6 leading-relaxed">
                  Cada jugador paga su parte por separado. Se acabaron los "papelitos" y las cuentas complicadas.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                    <CheckIcon size={14} className="text-success-500" />
                    4 jugadores, 4 pagos automáticos
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                    <CheckIcon size={14} className="text-success-500" />
                    Integración con Stripe
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                    <CheckIcon size={14} className="text-success-500" />
                    Comisión 0% para el club
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="card-elevated p-8 text-center group hover:scale-102 transition-all duration-200 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <BuildingIcon size={36} className="text-white" />
                </div>
                <h3 className="text-heading-xl text-neutral-900 mb-4">Widget Embebible</h3>
                <p className="text-body-base text-neutral-600 mb-6 leading-relaxed">
                  Tus clientes reservan directamente desde tu página web. Una línea de código, ventas infinitas.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                    <CheckIcon size={14} className="text-success-500" />
                    Setup en 5 minutos
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                    <CheckIcon size={14} className="text-success-500" />
                    Responsive y mobile-ready
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                    <CheckIcon size={14} className="text-success-500" />
                    Marca personalizada
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="card-elevated p-8 text-center group hover:scale-102 transition-all duration-200 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <RocketIcon size={36} className="text-white" />
                </div>
                <h3 className="text-heading-xl text-neutral-900 mb-4">Red Nacional</h3>
                <p className="text-body-base text-neutral-600 mb-6 leading-relaxed">
                  LA app donde están TODOS los clubes de México. Network effects que multiplican tus reservas.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                    <CheckIcon size={14} className="text-success-500" />
                    Visibilidad nacional
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                    <CheckIcon size={14} className="text-success-500" />
                    Jugadores de otros clubes
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                    <CheckIcon size={14} className="text-success-500" />
                    Marketing automático
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem vs Solution */}
        <section className="mt-32">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-display-lg text-neutral-900 mb-4">
                ¿Todavía <span className="text-gradient-brand">peleas con Excel</span> para reservas?
              </h2>
              <p className="text-body-lg text-neutral-600 max-w-2xl mx-auto">
                30 clubes en Puebla ya eliminaron el Excel y los papelitos. Es momento de modernizarte.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Problems */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-3xl border border-red-100">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-red-600">PROB</span>
                  </div>
                  <h3 className="text-heading-xl text-red-900 mb-2">Problemas del Excel</h3>
                  <p className="text-body-sm text-red-600">Lo que te cuesta dinero todos los días</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 mt-0.5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">×</span>
                    </div>
                    <div>
                      <div className="font-semibold text-red-800">45% revenue leakage</div>
                      <div className="text-sm text-red-600">No-shows, impagos y dobles reservas</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 mt-0.5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">×</span>
                    </div>
                    <div>
                      <div className="font-semibold text-red-800">1 FTE sólo para reservas</div>
                      <div className="text-sm text-red-600">Alguien actualiza Excel todo el día</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 mt-0.5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">×</span>
                    </div>
                    <div>
                      <div className="font-semibold text-red-800">Papelitos caóticos</div>
                      <div className="text-sm text-red-600">Dividir $800 entre 4 jugadores manualmente</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 mt-0.5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">×</span>
                    </div>
                    <div>
                      <div className="font-semibold text-red-800">Cero visibilidad online</div>
                      <div className="text-sm text-red-600">Pierdes clientes que buscan online</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Solutions */}
              <div className="bg-gradient-to-br from-success-50 to-emerald-50 p-8 rounded-3xl border border-success-100">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-success-100 rounded-2xl flex items-center justify-center">
                    <RocketIcon size={32} className="text-success-600" />
                  </div>
                  <h3 className="text-heading-xl text-success-900 mb-2">Con Padelyzer</h3>
                  <p className="text-body-sm text-success-600">Tecnología que genera más ingresos</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 mt-0.5 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckIcon size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-success-800">Reservas confirmadas 100%</div>
                      <div className="text-sm text-success-600">Pago garantizado antes del juego</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 mt-0.5 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckIcon size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-success-800">Automatización total</div>
                      <div className="text-sm text-success-600">Cero tiempo en administración manual</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 mt-0.5 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckIcon size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-success-800">Pagos divididos automáticos</div>
                      <div className="text-sm text-success-600">4 jugadores = 4 pagos instantáneos</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 mt-0.5 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckIcon size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-success-800">Multiplica tus reservas</div>
                      <div className="text-sm text-success-600">Widget + Red nacional = más ventas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="pricing" className="mt-32">
          <div className="container">
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 text-white text-center">
              <h2 className="text-display-md mb-6">
                Resultados <span className="text-secondary-200">Reales</span> de Clubes
              </h2>
              <p className="text-body-xl mb-12 opacity-90 max-w-2xl mx-auto">
                Datos promedio de clubes que migraron de Excel a Padelyzer en los últimos 6 meses:
              </p>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2 text-secondary-200">+285%</div>
                  <div className="text-lg font-medium mb-2">Reservas online</div>
                  <div className="text-sm opacity-75">vs. Excel + teléfono</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2 text-secondary-200">-67%</div>
                  <div className="text-lg font-medium mb-2">No-shows</div>
                  <div className="text-sm opacity-75">Pago anticipado = compromiso</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2 text-secondary-200">20hrs</div>
                  <div className="text-lg font-medium mb-2">Tiempo ahorrado/mes</div>
                  <div className="text-sm opacity-75">En administración manual</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Final CTA */}
        <section className="mt-32">
          <div className="container">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-display-lg text-neutral-900 mb-6">
                Únete a los <span className="text-gradient-brand">30+ clubes</span> que ya eliminaron Excel
              </h2>
              <p className="text-body-xl text-neutral-600 mb-10">
                Setup completo en 15 minutos. Tu primer reserva llega en menos de 24 horas.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link
                  href="/register/club"
                  className="btn btn-primary btn-xl group"
                >
                  Registrar Mi Club GRATIS
                  <ArrowRightIcon size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="text-sm text-neutral-500">
                  o
                </div>
                <Link
                  href="/demo"
                  className="btn btn-ghost btn-lg"
                >
                  Ver demo en vivo →
                </Link>
              </div>
              
              <div className="flex flex-wrap justify-center gap-8 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                  <CheckIcon size={16} className="text-success-500" />
                  Sin permanencia
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={16} className="text-success-500" />
                  Soporte en español
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={16} className="text-success-500" />
                  Setup incluido
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={16} className="text-success-500" />
                  GRATIS para siempre
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white mt-32">
        <div className="container py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <Image 
                  src="/Padelyzer-Logo-Blanco.png" 
                  alt="Padelyzer" 
                  width={160} 
                  height={40}
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-body-lg text-neutral-300 mb-6 max-w-md">
                La plataforma que está digitalizando el pádel mexicano. De Excel con papelitos a tecnología de clase mundial.
              </p>
              <div className="flex items-center gap-4">
                <div className="badge badge-success">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  30+ clubes activos
                </div>
                <div className="badge badge-primary">
                  1,000+ reservas/mes
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-heading-md text-white mb-6">Producto</h5>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-neutral-300 hover:text-white transition-colors flex items-center gap-2">
                    <CalendarIcon size={16} />
                    Reservas Gratis
                  </a>
                </li>
                <li>
                  <a href="#" className="text-neutral-300 hover:text-white transition-colors flex items-center gap-2">
                    <BuildingIcon size={16} />
                    Widget Embebible
                  </a>
                </li>
                <li>
                  <a href="#" className="text-neutral-300 hover:text-white transition-colors flex items-center gap-2">
                    <PaymentIcon size={16} />
                    Pagos Divididos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-neutral-300 hover:text-white transition-colors flex items-center gap-2">
                    <RocketIcon size={16} />
                    Red Nacional
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h5 className="text-heading-md text-white mb-6">¿Necesitas más?</h5>
              <p className="text-neutral-400 mb-4">
                Para torneos avanzados, finanzas detalladas y análisis con IA:
              </p>
              <a
                href="https://pro.padelyzer.com"
                target="_blank"
                className="btn btn-primary btn-sm group"
              >
                Padelyzer Pro
                <ArrowRightIcon size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <p className="text-xs text-neutral-500 mt-3">
                $2,000/mes • Facturación empresarial
              </p>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-neutral-400 text-sm">
                © 2024 Padelyzer. Hecho con amor en México para el pádel mexicano.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">Términos</a>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">Privacidad</a>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">Soporte</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
