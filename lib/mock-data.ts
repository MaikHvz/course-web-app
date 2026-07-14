import { Course, SubscriptionPlan, Achievement, Profile, Purchase, Subscription, Discount, CourseTimestamp, LearningPath, LearningPathCourse, CourseComment, Download, CourseProgress, UserAchievement } from "./types";

// ==================== USERS ====================
export const mockUsers: Profile[] = [
    {
        id: "u-admin",
        role: "admin",
        email: "admin@zona-elite.com",
        name: "Administrador Zona",
        created_at: "2025-01-15T10:00:00Z",
    },
    {
        id: "u-student1",
        role: "user",
        email: "estudiante@demo.com",
        name: "Juan Estudiante",
        created_at: "2025-03-20T14:30:00Z",
    },
    {
        id: "u-student2",
        role: "user",
        email: "maria@demo.com",
        name: "Maria Garcia",
        created_at: "2025-05-10T09:15:00Z",
    }
];

// ==================== COURSES ====================
export const mockCourses: Course[] = [
    {
        id: "c-1",
        title: "Fundamentos de Jiu-Jitsu Brasileño",
        slug: "fundamentos-bjj",
        short_description: "Aprenda las posiciones base, escapes y sumisiones fundamentales para sobrevivir en el tatami.",
        full_description: "Este curso te enseñará las bases del Jiu-Jitsu Brasileño desde cero. Aprenderás posiciones como guard, mount, side control y back control. Desarrollarás escapes efectivos y sumisiones básicas como armbar, triangle y kimura. Ideal para principiantes que quieren iniciar en el mundo del grappling.",
        bunny_video_id: "mock_vid_1",
        thumbnail_url: "/jiujitsu.svg",
        price: 49.99,
        is_free: false,
        included_in_subscription: true,
        is_published: true,
        category: "Jiu-Jitsu",
        order_index: 1,
        featured: true,
        created_at: "2025-01-10T08:00:00Z",
        updated_at: "2025-01-10T08:00:00Z",
    },
    {
        id: "c-2",
        title: "Striking para MMA: De Cero a Avanzado",
        slug: "striking-mma",
        short_description: "Domina el golpeo combinando boxeo, muay thai y kickboxing adaptado a las artes marciales mixtas.",
        full_description: "Descubre cómo conectar golpes efectivos en distancias mixtas. Este curso cubre fundamentos de boxeo, patadas de muay thai, rodillazos, codazos y combinaciones específicas para MMA. Incluye drills de sparring y trabajo de pies.",
        bunny_video_id: "mock_vid_2",
        thumbnail_url: "/mma.svg",
        price: 0,
        is_free: true,
        included_in_subscription: true,
        is_published: true,
        category: "MMA",
        order_index: 2,
        featured: false,
        created_at: "2025-02-05T10:00:00Z",
        updated_at: "2025-02-05T10:00:00Z",
    },
    {
        id: "c-3",
        title: "Kempo Karate Cinta Blanca a Naranja",
        slug: "kempo-blanca-naranja",
        short_description: "Aprende el sistema de Kempo Karate, formas básicas y técnicas de defensa.",
        full_description: "Primer módulo de Kempo Karate. Aprenderás las formas básicas (kata), técnicas de golpeo y defensa personal fundamentales. Incluye ejercicios de coordinación, equilibrio y trabajo en parejas.",
        bunny_video_id: "mock_vid_3",
        thumbnail_url: "/kempo.svg",
        price: 39.99,
        is_free: false,
        included_in_subscription: true,
        is_published: true,
        category: "Kempo Karate",
        order_index: 3,
        featured: false,
        created_at: "2025-03-01T12:00:00Z",
        updated_at: "2025-03-01T12:00:00Z",
    },
    {
        id: "c-4",
        title: "Defensa Personal Urbana",
        slug: "defensa-personal-urbana",
        short_description: "Técnicas de supervivencia rápida y desescalada de conflictos reales.",
        full_description: "Este curso premium enseña técnicas de defensa personal para situaciones reales. Aprenderás a reconocer amenazas, usar el entorno a tu favor, y técnicas de desescalada. Incluye escenarios de simulación y trabajo con armas improvisadas.",
        bunny_video_id: "mock_vid_4",
        thumbnail_url: "/hero-fist.jpg",
        price: 99.99,
        is_free: false,
        included_in_subscription: false,
        is_published: true,
        category: "Defensa Personal",
        order_index: 4,
        featured: false,
        created_at: "2025-04-15T14:00:00Z",
        updated_at: "2025-04-15T14:00:00Z",
    },
];

// ==================== COURSE TIMESTAMPS ====================
export const mockCourseTimestamps: CourseTimestamp[] = [
    { id: "ct-1", course_id: "c-1", minute_mark: 0, description: "Introducción al Jiu-Jitsu" },
    { id: "ct-2", course_id: "c-1", minute_mark: 5, description: "Posición de Guard" },
    { id: "ct-3", course_id: "c-1", minute_mark: 15, description: "Mount y Side Control" },
    { id: "ct-4", course_id: "c-1", minute_mark: 25, description: "Escapes Fundamentales" },
    { id: "ct-5", course_id: "c-2", minute_mark: 0, description: "Fundamentos del Boxeo" },
    { id: "ct-6", course_id: "c-2", minute_mark: 10, description: "Patadas de Muay Thai" },
    { id: "ct-7", course_id: "c-2", minute_mark: 20, description: "Combinaciones para MMA" },
    { id: "ct-8", course_id: "c-3", minute_mark: 0, description: "Historia del Kempo" },
    { id: "ct-9", course_id: "c-3", minute_mark: 8, description: "Formas Básicas (Kata)" },
    { id: "ct-10", course_id: "c-4", minute_mark: 0, description: "Reconocimiento de Amenazas" },
    { id: "ct-11", course_id: "c-4", minute_mark: 12, description: "Técnicas de Desescalada" },
];

// ==================== COURSE DOWNLOADS ====================
export const mockCourseDownloads: Download[] = [
    { id: "cd-1", course_id: "c-1", title: "Guía de Posiciones BJJ (PDF)", file_url: "/downloads/guia-bjj.pdf", type: "pdf", created_at: "2025-01-10T08:00:00Z" },
    { id: "cd-2", course_id: "c-1", title: "Certificado de Finalización", file_url: "/downloads/cert-bjj.pdf", type: "certificate", created_at: "2025-01-10T08:00:00Z" },
    { id: "cd-3", course_id: "c-2", title: "Plan de Entrenamiento Striking", file_url: "/downloads/plan-striking.pdf", type: "pdf", created_at: "2025-02-05T10:00:00Z" },
    { id: "cd-4", course_id: "c-3", title: "Manual Kempo Cinta Blanca", file_url: "/downloads/manual-kempo.pdf", type: "pdf", created_at: "2025-03-01T12:00:00Z" },
    { id: "cd-5", course_id: "c-4", title: "Guía de Defensa Personal", file_url: "/downloads/guia-defensa.pdf", type: "pdf", created_at: "2025-04-15T14:00:00Z" },
];

// ==================== COURSE COMMENTS ====================
export const mockCourseComments: CourseComment[] = [
    { id: "cc-1", course_id: "c-1", user_id: "u-student1", content: "Excelente curso, muy bien explicado. Los escapes me han funcionado en sparring.", created_at: "2025-06-01T10:00:00Z", is_deleted: false, user_name: "Juan Estudiante" },
    { id: "cc-2", course_id: "c-1", user_id: "u-student2", content: "Me encantó la sección de mount. ¿Habrá un curso avanzado?", created_at: "2025-06-05T14:30:00Z", is_deleted: false, user_name: "Maria Garcia" },
    { id: "cc-3", course_id: "c-2", user_id: "u-student1", content: "Muy completo para ser gratuito. Las combinaciones son muy útiles.", created_at: "2025-06-10T09:00:00Z", is_deleted: false, user_name: "Juan Estudiante" },
    { id: "cc-4", course_id: "c-3", user_id: "u-student2", content: "ElSensei explica muy bien. Las formas de kenta son claras.", created_at: "2025-06-15T11:00:00Z", is_deleted: false, user_name: "Maria Garcia" },
];

// ==================== LEARNING PATHS ====================
export const mockLearningPaths: LearningPath[] = [
    { id: "lp-1", title: "Camino del Luchador MMA", description: "Domina striking, grappling y MMA con esta ruta completa de aprendizaje.", created_at: "2025-02-01T10:00:00Z" },
    { id: "lp-2", title: "Defensa Personal Total", description: "Aprende técnicas de supervivencia para situaciones reales.", created_at: "2025-04-01T10:00:00Z" },
];

export const mockLearningPathCourses: LearningPathCourse[] = [
    { id: "lpc-1", learning_path_id: "lp-1", course_id: "c-2", order_index: 1 },
    { id: "lpc-2", learning_path_id: "lp-1", course_id: "c-1", order_index: 2 },
    { id: "lpc-3", learning_path_id: "lp-2", course_id: "c-4", order_index: 1 },
    { id: "lpc-4", learning_path_id: "lp-2", course_id: "c-3", order_index: 2 },
];

// ==================== SUBSCRIPTION PLANS ====================
export const mockSubscriptionPlans: SubscriptionPlan[] = [
    {
        id: "sub-1",
        name: "Suscripción Mensual",
        description: "Acceso a todo el catálogo de cursos regulares y material de apoyo.",
        price: 19.99,
        duration_days: 30,
        is_active: true,
        features: ["Acceso a todos los cursos estándar", "Material descargable", "Comunidad exclusiva", "Soporte prioritario"],
        created_at: "2025-01-01T00:00:00Z"
    },
    {
        id: "sub-2",
        name: "Pase Anual",
        description: "Ahorra dos meses pagando el año por adelantado.",
        price: 199.99,
        duration_days: 365,
        is_active: true,
        features: ["Todo lo del plan mensual", "Ahorro del 15%", "Insignia exclusiva de fundador", "1 Curso Premium anual de regalo"],
        created_at: "2025-01-01T00:00:00Z"
    }
];

// ==================== SUBSCRIPTIONS ====================
export const mockSubscriptions: Subscription[] = [
    {
        id: "s-1",
        user_id: "u-student1",
        plan_id: "sub-1",
        start_date: "2025-06-01T00:00:00Z",
        end_date: "2025-12-31T23:59:59Z",
        status: "active",
        created_at: "2025-06-01T00:00:00Z",
        plan: mockSubscriptionPlans[0]
    },
    {
        id: "s-2",
        user_id: "u-student2",
        plan_id: "sub-2",
        start_date: "2025-03-01T00:00:00Z",
        end_date: "2025-06-01T00:00:00Z",
        status: "expired",
        created_at: "2025-03-01T00:00:00Z",
        plan: mockSubscriptionPlans[1]
    }
];

// ==================== PURCHASES ====================
export const mockPurchases: Purchase[] = [
    {
        id: "p-1",
        user_id: "u-student1",
        course_id: "c-1",
        amount_paid: 49.99,
        currency: "USD",
        status: "paid",
        transaction_id: "txn_mock_1",
        expires_at: "2099-12-31T23:59:59Z",
        gifted_by_admin_id: null,
        created_at: "2025-06-01T10:00:00Z",
        updated_at: "2025-06-01T10:00:00Z",
        course: mockCourses[0]
    },
    {
        id: "p-2",
        user_id: "u-student1",
        course_id: "c-3",
        amount_paid: 39.99,
        currency: "USD",
        status: "paid",
        transaction_id: "txn_mock_2",
        expires_at: "2099-12-31T23:59:59Z",
        gifted_by_admin_id: null,
        created_at: "2025-06-15T14:00:00Z",
        updated_at: "2025-06-15T14:00:00Z",
        course: mockCourses[2]
    },
    {
        id: "p-3",
        user_id: "u-student2",
        course_id: "c-4",
        amount_paid: 99.99,
        currency: "USD",
        status: "paid",
        transaction_id: "txn_mock_3",
        expires_at: "2099-12-31T23:59:59Z",
        gifted_by_admin_id: null,
        created_at: "2025-05-10T09:00:00Z",
        updated_at: "2025-05-10T09:00:00Z",
        course: mockCourses[3]
    }
];

// ==================== COURSE PROGRESS ====================
export const mockCourseProgress: CourseProgress[] = [
    { id: "cp-1", user_id: "u-student1", course_id: "c-1", watch_percentage: 65, completed: false, completed_at: null },
    { id: "cp-2", user_id: "u-student1", course_id: "c-3", watch_percentage: 100, completed: true, completed_at: "2025-06-20T10:00:00Z" },
    { id: "cp-3", user_id: "u-student2", course_id: "c-4", watch_percentage: 30, completed: false, completed_at: null },
];

// ==================== ACHIEVEMENTS ====================
export const mockAchievements: Achievement[] = [
    {
        id: "ach-1",
        title: "Primer Paso",
        description: "Comienza tu primer curso.",
        icon_url: "IconTarget",
        condition_type: "purchases",
        condition_value: 1,
        hex_color: "#3b82f6",
        created_at: "2025-01-01T00:00:00Z"
    },
    {
        id: "ach-2",
        title: "Constancia de Hierro",
        description: "Completa 5 cursos al 100%.",
        icon_url: "IconFlame",
        condition_type: "completions",
        condition_value: 5,
        hex_color: "#f97316",
        created_at: "2025-01-01T00:00:00Z"
    },
    {
        id: "ach-3",
        title: "Guerrero Activo",
        description: "Mantén una suscripción activa por más de 30 días.",
        icon_url: "IconTrophy",
        condition_type: "subscription_active",
        condition_value: 1,
        hex_color: "#10b981",
        created_at: "2025-01-01T00:00:00Z"
    },
    {
        id: "ach-4",
        title: "Maestro del Katana",
        description: "Compra 3 cursos diferentes.",
        icon_url: "IconSword",
        condition_type: "purchases",
        condition_value: 3,
        hex_color: "#8b5cf6",
        created_at: "2025-01-01T00:00:00Z"
    }
];

// ==================== USER ACHIEVEMENTS ====================
export const mockUserAchievements: UserAchievement[] = [
    { id: "ua-1", user_id: "u-student1", achievement_id: "ach-1", unlocked_at: "2025-06-01T10:00:00Z" },
    { id: "ua-2", user_id: "u-student1", achievement_id: "ach-4", unlocked_at: "2025-06-15T14:00:00Z" },
    { id: "ua-3", user_id: "u-student2", achievement_id: "ach-1", unlocked_at: "2025-05-10T09:00:00Z" },
];

// ==================== DISCOUNTS ====================
export const mockDiscounts: Discount[] = [
    {
        id: "d-1",
        code: "VERANO2025",
        type: "percentage",
        value: 20,
        expires_at: "2025-09-30T23:59:59Z",
        max_uses: 100,
        used_count: 15,
        applicable_course_id: null,
        is_active: true,
    },
    {
        id: "d-2",
        code: "BIENVENIDO10",
        type: "fixed",
        value: 10,
        expires_at: "2025-12-31T23:59:59Z",
        max_uses: 50,
        used_count: 8,
        applicable_course_id: "c-1",
        is_active: true,
    }
];

// ==================== HELPER ====================
export function canUserAccessCourse(course: Course, activeSubs: Subscription[], purchases: Purchase[]): boolean {
    if (course.is_free) return true;

    const hasPaid = purchases.some(p => p.course_id === course.id && (p.status === "paid" || p.status === "gifted"));
    if (hasPaid) return true;

    if (course.included_in_subscription) {
        const hasActiveSub = activeSubs.some(s => s.status === "active" && new Date(s.end_date) > new Date());
        if (hasActiveSub) return true;
    }

    return false;
}
