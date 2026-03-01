import { Course, SubscriptionPlan, Achievement, Profile, Purchase, Subscription, Discount } from "./types";

export const mockCourses: Course[] = [
    {
        id: "c-1",
        title: "Fundamentos de Jiu-Jitsu Brasileño",
        slug: "fundamentos-bjj",
        short_description: "Aprenda las posiciones base, escapes y sumisiones fundamentales para sobrevivir en el tatami.",
        full_description: "Este curso te enseñará...",
        bunny_video_id: "mock_vid_1",
        thumbnail_url: "/jiujitsu.svg",
        price: 49.99,
        is_free: false,
        included_in_subscription: true,
        is_published: true,
        category: "Jiu-Jitsu",
        order_index: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "c-2",
        title: "Striking para MMA: De Cero a Avanzado",
        slug: "striking-mma",
        short_description: "Domina el golpeo combinando boxeo, muay thai y kickboxing adaptado a las artes marciales mixtas.",
        full_description: "Descubre cómo conectar golpes efectivos...",
        bunny_video_id: "mock_vid_2",
        thumbnail_url: "/mma.svg",
        price: 0,
        is_free: true,
        included_in_subscription: true,
        is_published: true,
        category: "MMA",
        order_index: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "c-3",
        title: "Kempo Karate Cinta Blanca a Naranja",
        slug: "kempo-blanca-naranja",
        short_description: "Aprende el sistema de Kempo Karate, formas básicas y técnicas de defensa.",
        full_description: "Primer módulo de Kempo...",
        bunny_video_id: "mock_vid_3",
        thumbnail_url: "/kempo.svg",
        price: 39.99,
        is_free: false,
        included_in_subscription: true,
        is_published: true,
        category: "Kempo Karate",
        order_index: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "c-4",
        title: "Defensa Personal Urbana",
        slug: "defensa-personal-urbana",
        short_description: "Técnicas de supervivencia rápida y desescalada de conflictos reales.",
        full_description: "Este curso premium...",
        bunny_video_id: "mock_vid_4",
        thumbnail_url: "/hero-fist.jpg",
        price: 99.99,
        is_free: false,
        included_in_subscription: false, // NOT in standard sub
        is_published: true,
        category: "Defensa Personal",
        order_index: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];

export const mockUsers: Profile[] = [
    {
        id: "u-admin",
        role: "admin",
        email: "admin@zona-elite.com",
        name: "Administrador Zona",
        created_at: new Date().toISOString(),
    },
    {
        id: "u-student1",
        role: "user",
        email: "estudiante@demo.com",
        name: "Juan Estudiante",
        created_at: new Date().toISOString(),
    }
];

export const mockSubscriptionPlans: SubscriptionPlan[] = [
    {
        id: "sub-1",
        name: "Suscripción Mensual",
        description: "Acceso a todo el catálogo de cursos regulares y material de apoyo.",
        price: 19.99,
        duration_days: 30,
        is_active: true,
        features: ["Acceso a todos los cursos estándar", "Material descargable", "Comunidad exclusiva", "Soporte prioritario"],
        created_at: new Date().toISOString()
    },
    {
        id: "sub-2",
        name: "Pase Anual",
        description: "Ahorra dos meses pagando el año por adelantado.",
        price: 199.99,
        duration_days: 365,
        is_active: true,
        features: ["Todo lo del plan mensual", "Ahorro del 15%", "Insignia exclusiva de fundador", "1 Curso Premium anual de regalo"],
        created_at: new Date().toISOString()
    }
];

export const mockAchievements: Achievement[] = [
    {
        id: "ach-1",
        title: "Primer Paso",
        description: "Comienza tu primer curso.",
        icon_url: "🎯",
        condition_type: "start_course",
        condition_value: 1,
        created_at: new Date().toISOString()
    },
    {
        id: "ach-2",
        title: "Constancia de Hierro",
        description: "Completa 5 cursos al 100%.",
        icon_url: "⚔️",
        condition_type: "complete_courses",
        condition_value: 5,
        created_at: new Date().toISOString()
    }
];

// Helper to simulate DB check
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
