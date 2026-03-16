import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

// ─── PALABRAS CLAVE PRINCIPALES ─────────────────────────────────────────────
// 🥇 Keyword principal : "cursos de artes marciales online"
// 🥈 Keywords secundarias:
//   - "academia de MMA online"
//   - "clases de jiujitsu online"
//   - "curso de defensa personal online"
//   - "aprender kempo karate online"
//   - "entrenamiento deportivo de contacto online Chile"
//   - "comprar curso de artes marciales"
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Sobre Nosotros | Zona Elite — Academia de Artes Marciales Online',
  description:
    'Zona Elite es la academia online líder en artes marciales y deportes de contacto en Chile. Cursos de MMA, Jiujitsu, Kempo Karate y Defensa Personal dictados por instructores profesionales. Aprende a tu ritmo, desde cualquier lugar.',
  keywords: [
    'cursos de artes marciales online',
    'academia de MMA online',
    'clases de jiujitsu online Chile',
    'curso defensa personal online',
    'kempo karate online',
    'entrenamiento deportes de contacto online',
    'academia deportiva virtual Chile',
    'cursos de fight online',
    'aprender MMA desde casa',
    'Zona Elite academia',
  ],
  alternates: {
    canonical: 'https://www.zonaelite.cl/sobre-nosotros',
  },
  openGraph: {
    title: 'Zona Elite — Cursos de Artes Marciales y Defensa Personal Online',
    description:
      'Aprende MMA, Jiujitsu, Kempo Karate y Defensa Personal con instructores de élite, 100% online, a tu propio ritmo. Únete a la academia deportiva más completa de Chile.',
    type: 'website',
    url: 'https://www.zonaelite.cl/sobre-nosotros',
    siteName: 'Zona Elite',
    locale: 'es_CL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zona Elite — Academia de Artes Marciales Online',
    description: 'Cursos de MMA, Jiujitsu, Kempo Karate y Defensa Personal 100% online. Entrena cuando quieras, desde donde estés.',
  },
};

// JSON-LD Schema para organización educativa
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Zona Elite",
  "description": "Academia online de artes marciales y deportes de contacto. Cursos de MMA, Jiujitsu Brasileño, Kempo Karate y Defensa Personal dictados por instructores profesionales.",
  "url": "https://www.zonaelite.cl",
  "sameAs": [],
  "knowsAbout": [
    "MMA (Artes Marciales Mixtas)",
    "Jiujitsu Brasileño",
    "Kempo Karate",
    "Defensa Personal",
    "Deportes de Contacto",
    "Entrenamiento Físico Deportivo"
  ],
  "teaches": "Artes marciales, deportes de contacto y defensa personal",
  "educationalCredentialAwarded": "Certificado de participación",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Cursos de Artes Marciales Online",
    "itemListElement": [
      { "@type": "Course", "name": "Curso de MMA Online", "url": "https://www.zonaelite.cl/cursos" },
      { "@type": "Course", "name": "Clases de Jiujitsu Online", "url": "https://www.zonaelite.cl/cursos" },
      { "@type": "Course", "name": "Kempo Karate Online", "url": "https://www.zonaelite.cl/cursos" },
      { "@type": "Course", "name": "Defensa Personal Online", "url": "https://www.zonaelite.cl/cursos" },
    ]
  }
};

// JSON-LD Schema BreadcrumbList para navegación
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.zonaelite.cl" },
    { "@type": "ListItem", "position": 2, "name": "Sobre Nosotros", "item": "https://www.zonaelite.cl/sobre-nosotros" }
  ]
};

export default function SobreNosotrosPage() {
  return (
    <>
      {/* Schema.org structured data */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gray-900 text-white selection:bg-blue-500/30">
        
        {/* Breadcrumb accesible + SEO */}
        <nav aria-label="Miga de pan" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-gray-300 transition-colors">Inicio</Link></li>
            <li aria-hidden="true"><span>/</span></li>
            <li className="text-gray-300" aria-current="page">Sobre Nosotros</li>
          </ol>
        </nav>

        {/* ── Hero Section ─────────────────────────────────────────────────── */}
        <section className="relative py-24 sm:py-32 overflow-hidden" aria-labelledby="hero-heading">
          <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" aria-hidden="true" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-4">
              Academia de Artes Marciales Online
            </p>
            <h1 id="hero-heading" className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
              La Academia de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Artes Marciales Online
              </span>{' '}
              más Completa de Chile
            </h1>
            <p className="mt-4 text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto font-light">
              En <strong className="text-white font-bold">Zona Elite</strong> ofrecemos{' '}
              <strong className="text-white">cursos de MMA, Jiujitsu, Kempo Karate y Defensa Personal</strong>{' '}
              100% online, dictados por instructores profesionales. Entrena cuando y donde quieras.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mt-10 text-sm">
              {['MMA Online', 'Jiujitsu Online', 'Kempo Karate Online', 'Defensa Personal Online'].map(tag => (
                <span key={tag} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full border border-gray-700 hover:border-blue-500 hover:text-blue-400 transition-colors cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Estadísticas / Números ───────────────────────────────────────── */}
        <section className="py-12 border-y border-gray-800" aria-label="Datos de la academia">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '4', label: 'Disciplinas Deportivas', unit: '+' },
                { value: '100', label: 'Clases disponibles', unit: '%' },
                { value: '24/7', label: 'Acceso a contenido', unit: '' },
                { value: '100', label: 'Online, sin horarios', unit: '%' },
              ].map(stat => (
                <div key={stat.label} className="p-4">
                  <dt className="text-sm text-gray-500 mb-1">{stat.label}</dt>
                  <dd className="text-4xl font-black text-white">
                    {stat.value}<span className="text-blue-400">{stat.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Misión y Visión ─────────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 bg-gray-800/50" aria-labelledby="mision-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="mision-heading" className="sr-only">Misión y Visión de Zona Elite</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16">
              
              <article className="bg-gray-800 p-8 sm:p-10 rounded-3xl border border-gray-700 shadow-xl transition-transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20" aria-hidden="true">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-4">Nuestra Misión</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  Democratizar el acceso al <strong className="text-white">entrenamiento en artes marciales y deportes de contacto</strong>.
                  Que cualquier persona, sin importar su ubicación geográfica, pueda comprar un{' '}
                  <strong className="text-white">curso de MMA, Jiujitsu o Defensa Personal online</strong>{' '}
                  y aprender de instructores de primer nivel con metodología probada.
                </p>
              </article>

              <article className="bg-gray-800 p-8 sm:p-10 rounded-3xl border border-gray-700 shadow-xl transition-transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-cyan-600/20 text-cyan-400 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20" aria-hidden="true">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-4">Nuestra Visión</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  Convertirnos en el <strong className="text-white">referente número uno en cursos deportivos de contacto online en Latinoamérica</strong>.
                  Ser reconocidos como la academia donde nacen atletas, se perfeccionan técnicas y se construye
                  confianza a través de la formación en <strong className="text-white">Kempo Karate, MMA y Jiujitsu</strong>.
                </p>
              </article>

            </div>
          </div>
        </section>

        {/* ── Disciplinas (SEO: contenido denso en keywords) ───────────────── */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="disciplinas-heading">
          <div className="text-center mb-16">
            <h2 id="disciplinas-heading" className="text-3xl sm:text-4xl font-bold mb-4">
              Disciplinas que Enseñamos Online
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Cada curso está diseñado por expertos en su disciplina, con contenido progresivo y aplicable desde el primer día.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                emoji: '🥊',
                title: 'MMA Online',
                desc: 'Domina las artes marciales mixtas aprendiendo técnicas de golpeo, clinch y suelo. Nuestros cursos de MMA online van desde principiante hasta competidor avanzado.',
                color: 'red',
              },
              {
                emoji: '🤼',
                title: 'Jiujitsu Online',
                desc: 'Aprende Jiujitsu Brasileño con clases online estructuradas. Desde posiciones básicas hasta triángulos y barridos. Técnica depurada a tu propio ritmo.',
                color: 'blue',
              },
              {
                emoji: '🥋',
                title: 'Kempo Karate Online',
                desc: 'El sistema de combate más completo. Golpes, patadas, bloqueos y defensa personal integrados en un solo programa online pensado para todos los niveles.',
                color: 'purple',
              },
              {
                emoji: '🛡️',
                title: 'Defensa Personal Online',
                desc: 'Sin experiencia previa requerida. Aprende a protegerte en situaciones reales con técnicas simples y efectivas avaladas por instructores con experiencia en seguridad.',
                color: 'green',
              },
            ].map((item) => (
              <article
                key={item.title}
                className="p-8 bg-gray-800/50 rounded-2xl border border-gray-700/50 flex flex-col items-center text-center hover:border-gray-600 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mb-6" aria-hidden="true">
                  <span className="text-3xl" role="img" aria-label={item.title}>{item.emoji}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Por qué elegirnos ───────────────────────────────────────────── */}
        <section className="py-20 bg-gray-800/30 border-y border-gray-800" aria-labelledby="ventajas-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="ventajas-heading" className="text-3xl sm:text-4xl font-bold mb-4">
                ¿Por qué comprar un curso en Zona Elite?
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Somos la plataforma de cursos deportivos online diseñada pensando en personas que quieren resultados reales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🥇',
                  title: 'Instructores Profesionales',
                  text: 'Aprende directamente de atletas y entrenadores con trayectoria en competencia y docencia. No solo teoría: técnica aplicada, videocorracciones y progresión real.',
                },
                {
                  icon: '📱',
                  title: 'Acceso 24/7, en Cualquier Dispositivo',
                  text: 'Compra tu curso una vez y tenlo de por vida. Estudia desde tu celular, tablet o PC. Pausa, repite y analiza cuadro por cuadro cuando más lo necesites.',
                },
                {
                  icon: '🎯',
                  title: 'Sistema de Progresión Real',
                  text: 'Cada curso sigue una ruta de aprendizaje clara, de lo básico a lo avanzado. Evaluaciones prácticas y hitos para saber exactamente dónde estás y hacia dónde vas.',
                },
              ].map((item) => (
                <article key={item.title} className="p-8 bg-gray-800/50 rounded-2xl border border-gray-700/50 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-900/50 border border-blue-500/30 flex items-center justify-center mb-6" aria-hidden="true">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                  <p className="text-gray-400">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Preguntas frecuentes / FAQ (SEO + Featured Snippets) ─────────── */}
        <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-3xl font-bold text-center mb-12">
            Preguntas Frecuentes sobre Nuestros Cursos
          </h2>
          <dl className="space-y-6">
            {[
              {
                q: '¿Necesito experiencia previa para comprar un curso de artes marciales online?',
                a: 'No. Nuestros cursos tienen niveles para principiantes absolutos. Puedes comenzar con Defensa Personal básica o con los módulos introductorios de MMA o Jiujitsu sin ningún conocimiento previo.',
              },
              {
                q: '¿Cuánto duran los cursos de Zona Elite?',
                a: 'Depende del plan que elijas. Puedes comprar un curso individual con acceso de por vida, o suscribirte a uno de nuestros planes de membresía (mensual, trimestral o vitalicio) para acceder a todo el contenido.',
              },
              {
                q: '¿Puedo ver los cursos desde Chile y otros países de Latinoamérica?',
                a: 'Sí, 100%. La plataforma está disponible para todo el mundo hispanohablante. El contenido es accesible desde cualquier dispositivo con conexión a internet.',
              },
              {
                q: '¿Cómo funciona el pago de los cursos?',
                a: 'Puedes pagar de forma segura usando Webpay Plus (Transbank) con tarjeta de crédito o débito. El acceso al curso se activa de forma inmediata tras la confirmación del pago.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
                <dt className="text-lg font-bold text-white mb-3">{q}</dt>
                <dd className="text-gray-400 leading-relaxed">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── CTA final ───────────────────────────────────────────────────── */}
        <section className="py-20 bg-blue-600 relative overflow-hidden" aria-labelledby="cta-heading">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 id="cta-heading" className="text-3xl sm:text-5xl font-bold text-white mb-6">
              Empieza Hoy tu Formación en Artes Marciales
            </h2>
            <p className="text-blue-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
              Únete a <strong>Zona Elite</strong> y accede a los mejores cursos de MMA, Jiujitsu, Kempo Karate y Defensa Personal online.
              Sin excusas, sin horarios, con resultados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cursos"
                className="px-8 py-4 bg-white text-blue-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
                aria-label="Ver todos los cursos de artes marciales online"
              >
                Explorar Cursos
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-blue-800 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-colors border border-blue-500"
                aria-label="Crear cuenta gratis en Zona Elite"
              >
                Crear Cuenta Gratis
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
