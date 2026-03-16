# Documentación del Proyecto: Plataforma de Cursos Automotrices (Academia Web Platform)

Este documento es una guía profunda sobre la arquitectura actual de la aplicación web, el esquema de la base de datos, las reglas de negocio implementadas y una hoja de ruta con todo lo que falta por implementar para alcanzar un estado óptimo para producción.

Este documento es "vivo" y **debe ser actualizado** cada vez que se realicen cambios significativos en el código, base de datos o lógica de negocio.

---

## SECCIÓN 1: ESTADO ACTUAL (Web, BD y Reglas de Negocio)

### 1.1 Arquitectura Web (Frontend y Backend)
- **Framework Principal:** Next.js 16 (App Router) usando React 19.
- **Estilos:** Tailwind CSS v4 configurado con un diseño dinámico, modo oscuro, paleta de colores curada y animaciones fluidas.
- **Autenticación y Base de Datos:** Supabase (Auth para Email/Password y Google OAuth; Database en PostgreSQL).
- **Estructura de Carpetas:**
  - `app/(auth)/`: Flujos de autenticación (Login, Registro, Recuperar Contraseña, Restablecer Contraseña).
  - `app/(site)/`: Páginas públicas (Landing Page, Catálogo de Cursos, Sobre Nosotros, Login/Registro).
  - `app/(dashboard)/`: Panel del Estudiante (Rutas protegidas para ver sus cursos, logros y perfil).
  - `app/admin/`: Panel de Administración (Gestión de usuarios, cursos, suscripciones, categorías, logros, rutas de aprendizaje y descuentos).
  - `app/api/`: Rutas de servidor y webhooks (ej. integraciones con Bunny y pre-Stripe).
  - `lib/`: Configuraciones de Supabase en SSR, utilidades y definiciones de tipos (`types.ts`).

### 1.2 Esquema de la Base de Datos (Supabase)
Basado en las interfaces definidas en la plataforma, las tablas principales y sus relaciones son:

1. **Usuarios (`Profile`):**
   - Campos: `id`, `role` ("user" | "admin"), `email`, `name`, `created_at`.
2. **Cursos y Contenido (`Category`, `Course`, `CourseTimestamp`, `Download`):**
   - Un Curso pertenece a una Categoría. Contiene detalles visuales (`thumbnail_url`), de video (`bunny_video_id`), precio, descriptores y booleanos de acceso (`is_free`, `included_in_subscription`, `is_published`).
   - El contenido adicional como marcas de tiempo de video y recursos descargables (PDF, certificados) están vinculados al ID del curso con su tabla relacional respectiva.
3. **Rutas de Aprendizaje (`LearningPath`, `LearningPathCourse`):**
   - Agrupación estructurada de múltiples cursos con un orden específico (`order_index`).
4. **Progreso y Logros (`CourseProgress`, `Achievement`, `UserAchievement`):**
   - `CourseProgress` registra el porcentaje de visualización de un video por un usuario y si fue completado.
   - `Achievement` define metas con condiciones numéricas o eventos. `UserAchievement` une a un usuario con el logro alcanzado.
5. **Monetización (`SubscriptionPlan`, `Subscription`, `Purchase`, `Discount`):**
   - Los Usuarios pueden adquirir **Membresías** (`Subscription`) atadas a un `SubscriptionPlan` (duración en días, precio, características).
   - O pueden realizar **Compras Únicas** (`Purchase`) de un curso por su precio normal.
   - Existen Códigos de Descuento (`Discount`) aplicables como porcentaje o valor fijo, con límites de uso (`max_uses`).
6. **Interacción (`CourseComment`):**
   - Los usuarios pueden dejar comentarios en los cursos vinculados a su perfil.

### 1.3 Reglas de Negocio Implementadas

- **Niveles de Acceso (CourseAccessStatus):**
  - `"free"`: Sin costo, requiere solo registro.
  - `"purchased"`: Curso adquirido mediante pago único de por vida.
  - `"subscription"`: Curso (`included_in_subscription: true`) desbloqueado temporalmente mientras el usuario tenga una membresía activa.
  - `"locked"`: Curso sin acceso actual.
- **Estado de Transacciones:**
  - `PurchaseStatus`: "initiated", "paid", "failed", "expired", "gifted" (Regalado por admin).
  - `SubscriptionStatus`: "initiated", "active", "expired", "failed". Los fallos de pago no desactivan los planes sino que los marcan como 'failed'.
- **Protección de Rutas (Middleware):**
  - Cualquier ruta bajo `/admin` requiere estrictamente que el usuario autenticado en Supabase tenga el rol `admin`.
  - Rutas bajo `/(dashboard)` requieren estar logueado como `user` o `admin`.
- **Experiencia de Usuario (UI/UX):**
  - No hay alertas feas del navegador; se usan componentes web personalizados.
  - Si un usuario no autenticado intenta comprar, es redirigido a login y retornado al contexto tras completarlo.

---

## SECCIÓN 2: LO QUE FALTA PARA LLEGAR A PRODUCCIÓN

Aunque el andamiaje principal de la lógica "Mock/Local" y el UI está maduro, faltan integrar y asegurar varios módulos del sistema real.

### 2.1 Pasarela de Pagos Real (Stripe)
- [ ] **Sustituir Pagos Simulados:** Cambiar los botones de "Comprar" y "Suscribirse" para generar sesiones de Checkout en Stripe.
- [ ] **Webhooks de Stripe:** Crear la ruta `app/api/webhooks/stripe/route.ts` para escuchar asíncronamente eventos como `checkout.session.completed`, `invoice.payment_succeeded`, y `customer.subscription.deleted`.
- [ ] **Sincronización de Estado:** El Webhook debe ser la **única fuente de verdad** que actualice los estados `PurchaseStatus` y `SubscriptionStatus` en Supabase.
- [ ] **Portal de Cliente de Stripe:** Permitir a los usuarios cancelar o actualizar su tarjeta de crédito.

### 2.2 Integración Real de Video (Bunny.net y Progreso)
- [ ] **Player Oficial y Seguridad:** Usar la API y Player V2 de Bunny.net. Implementar tokens temporales URL para evitar que los videos se descarguen o pirateen fuera del dominio autorizado.
- [ ] **Trackeo de Progreso:** Sustituir la simulación de `watch_percentage` por eventos reales del reproductor de Bunny (e.g. `onTimeUpdate` o webhooks de visualización) para marcar cursos como completados e insertar en `CourseProgress`.

### 2.3 Seguridad en Base de Datos (Row Level Security - RLS)
- [ ] **Políticas RESTRICTIVAS en Supabase:**
  - Los usuarios normales (`Profile`) solo deben poder leer la información y ver solo **sus propios** datos (`CourseProgress`, `Purchases`, `Subscriptions`).
  - Los Admins deben tener permisos completos (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) validados por RLS.
  - Cursos o Lecciones deben verificar sub-queries relacionales para cerciorarse de que el usuario tiene acceso pago/suscrito antes de devolver la URL o ID del video protegido.

### 2.4 Automatización de Correos Electrónicos (Email Flow)
- [ ] **Proveedor Transaccional:** Integrar Resend o SendGrid.
- [ ] **Emails Esenciales:**
  - Bienvenida al registrarse.
  - Confirmación de Compra o Suscripción con recibo de pago.
  - Aviso de "Pago Fallido" o "Suscripción por Expirar".

### 2.5 SEO, Analíticas y Deployment
- [ ] **SEO Técnico y Metadatos:** Configurar los `metadata` de Next.js (OpenGraph tags, Twitter Cards, Sitemap dinámico y `robot.txt`) para el directorio `app/(site)`.
- [ ] **Rendimiento:** Asegurarse de que las peticiones a base de datos de cursos públicos (ej. catálogo) tengan revalidación o caché adecuada (`Next ISR`).
- [ ] **Analytics y Errores:** Añadir Google Analytics o Posthog, y Sentry para monitoreo de errores de UI/Backend en producción.
- [ ] **Pruebas (E2E y Unitarias):** Preparar Playwright para pruebas E2E críticas (Flujo de Login y Flujo de Checkout en Test Mode) antes de lanzar.

---

_Nota: Si se realizan cambios importantes en la arquitectura, componentes core, o se migran módulos a integración real, este documento será modificado con la herramienta de IA correspondiente._
