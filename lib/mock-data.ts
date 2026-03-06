import { Course, SubscriptionPlan, Achievement, Profile, Purchase, Subscription, Discount } from "./types";

const MOCK_CATEGORIES = {
    MMA: { id: "cat-1", name: "MMA", created_at: new Date().toISOString() },
    JiuJitsu: { id: "cat-2", name: "Jiu-Jitsu", created_at: new Date().toISOString() },
    Kempo: { id: "cat-3", name: "Kempo Karate", created_at: new Date().toISOString() },
    DefensaPersonal: { id: "cat-4", name: "Defensa Personal", created_at: new Date().toISOString() },
};

export const MOCK_COURSES: Course[] = [
    {
        id: "1",
        title: "Fundamentos de MMA",
        slug: "fundamentos-mma",
        short_description: "Domina las bases de las artes marciales mixtas.",
        full_description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
        bunny_video_id: "vid-1",
        thumbnail_url: "/mma.svg",
        price: 49.99,
        is_free: false,
        included_in_subscription: true,
        is_published: true,
        category_id: MOCK_CATEGORIES.MMA.id,
        category: MOCK_CATEGORIES.MMA,
        order_index: 0,
        featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "2",
        title: "Jiu-Jitsu para Principiantes",
        slug: "jiujitsu-principiantes",
        short_description: "Aprende el arte de la sumisión desde cero.",
        full_description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
        bunny_video_id: "vid-2",
        thumbnail_url: "/jiujitsu.svg",
        price: 39.99,
        is_free: false,
        included_in_subscription: true,
        is_published: true,
        category_id: MOCK_CATEGORIES.JiuJitsu.id,
        category: MOCK_CATEGORIES.JiuJitsu,
        order_index: 1,
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "3",
        title: "Defensa Personal Urbana",
        slug: "defensa-personal-urbana",
        short_description: "Técnicas efectivas para situaciones reales.",
        full_description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
        bunny_video_id: "vid-3",
        thumbnail_url: "/mma.svg",
        price: 0,
        is_free: true,
        included_in_subscription: false,
        is_published: true,
        category_id: MOCK_CATEGORIES.DefensaPersonal.id,
        category: MOCK_CATEGORIES.DefensaPersonal,
        order_index: 2,
        featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "4",
        title: "Kempo Karate: Cinturón Blanco",
        slug: "kempo-karate-blanco",
        short_description: "Inicia tu camino en el Kempo Karate.",
        full_description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
        bunny_video_id: "vid-4",
        thumbnail_url: "/kempo.svg",
        price: 29.99,
        is_free: false,
        included_in_subscription: true,
        is_published: true,
        category_id: MOCK_CATEGORIES.Kempo.id,
        category: MOCK_CATEGORIES.Kempo,
        order_index: 3,
        featured: false,
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
        hex_color: "#3b82f6",
        created_at: new Date().toISOString()
    },
    {
        id: "ach-2",
        title: "Constancia de Hierro",
        description: "Completa 5 cursos al 100%.",
        icon_url: "⚔️",
        condition_type: "complete_courses",
        condition_value: 5,
        hex_color: "#f59e0b",
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
