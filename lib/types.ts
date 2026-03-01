export type Role = "user" | "admin";
export type CourseAccessStatus = "free" | "purchased" | "subscription" | "locked";
export type PurchaseStatus = "initiated" | "paid" | "failed" | "expired" | "gifted";
export type SubscriptionStatus = "initiated" | "active" | "expired" | "failed";
export type DiscountType = "percentage" | "fixed";
export type DownloadType = "pdf" | "certificate";

export interface Profile {
    id: string;
    role: Role;
    email: string;
    name: string;
    created_at: string;
}

export interface Course {
    id: string;
    title: string;
    slug: string;
    short_description: string;
    full_description: string;
    bunny_video_id: string;
    thumbnail_url: string;
    price: number;
    is_free: boolean;
    included_in_subscription: boolean;
    is_published: boolean;
    category: "MMA" | "Jiu-Jitsu" | "Kempo Karate" | "Defensa Personal"; // Added for UI filtering
    order_index: number;
    featured: boolean;
    created_at: string;
    updated_at: string;
}

export interface CourseTimestamp {
    id: string;
    course_id: string;
    minute_mark: number;
    description: string;
}

export interface LearningPath {
    id: string;
    title: string;
    description: string;
    created_at: string;
}

export interface LearningPathCourse {
    id: string;
    learning_path_id: string;
    course_id: string;
    order_index: number;
}

export interface CourseComment {
    id: string;
    course_id: string;
    user_id: string;
    content: string;
    created_at: string;
    is_deleted: boolean;
    user_name?: string; // Appended for UI
}

export interface Download {
    id: string;
    course_id: string;
    title: string;
    file_url: string;
    type: DownloadType;
    created_at: string;
}

export interface CourseProgress {
    id: string;
    user_id: string;
    course_id: string;
    watch_percentage: number;
    completed: boolean;
    completed_at: string | null;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon_url: string;
    condition_type: string;
    condition_value: number;
    hex_color: string;
    created_at: string;
}

export interface UserAchievement {
    id: string;
    user_id: string;
    achievement_id: string;
    unlocked_at: string;
    achievement?: Achievement; // For relations
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    duration_days: number;
    is_active: boolean;
    features: string[]; // UI extra
    created_at: string;
}

export interface Subscription {
    id: string;
    user_id: string;
    plan_id: string;
    start_date: string;
    end_date: string;
    status: SubscriptionStatus;
    created_at: string;
    plan?: SubscriptionPlan; // Appended for UI
}

export interface Purchase {
    id: string;
    user_id: string;
    course_id: string;
    amount_paid: number;
    currency: string;
    status: PurchaseStatus;
    transaction_id: string;
    expires_at: string;
    gifted_by_admin_id: string | null;
    created_at: string;
    updated_at: string;
    course?: Course; // Appended for relations
}

export interface Discount {
    id: string;
    code: string;
    type: DiscountType;
    value: number;
    expires_at: string;
    max_uses: number;
    used_count: number;
    applicable_course_id: string | null;
    is_active: boolean;
}
