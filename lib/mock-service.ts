import {
    mockCourses, mockUsers, mockSubscriptionPlans, mockSubscriptions,
    mockPurchases, mockAchievements, mockUserAchievements, mockDiscounts,
    mockLearningPaths, mockLearningPathCourses, mockCourseTimestamps,
    mockCourseDownloads, mockCourseComments, mockCourseProgress
} from "./mock-data";
import {
    Course, Profile, SubscriptionPlan, Subscription, Purchase,
    Achievement, UserAchievement, Discount, LearningPath,
    LearningPathCourse, CourseTimestamp, Download, CourseComment, CourseProgress
} from "./types";

// ==================== IN-MEMORY STORE ====================
const store = {
    courses: [...mockCourses],
    users: [...mockUsers],
    subscriptionPlans: [...mockSubscriptionPlans],
    subscriptions: [...mockSubscriptions],
    purchases: [...mockPurchases],
    achievements: [...mockAchievements],
    userAchievements: [...mockUserAchievements],
    discounts: [...mockDiscounts],
    learningPaths: [...mockLearningPaths],
    learningPathCourses: [...mockLearningPathCourses],
    courseTimestamps: [...mockCourseTimestamps],
    courseDownloads: [...mockCourseDownloads],
    courseComments: [...mockCourseComments],
    courseProgress: [...mockCourseProgress],
};

let currentUser: Profile | null = null;
let authStateListeners: Array<(event: string, session: any) => void> = [];

function delay(ms = 50) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateId() {
    return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ==================== QUERY BUILDER ====================
type TableName = keyof typeof store;
type QueryMode = "select" | "insert" | "update" | "delete";

class MockQueryBuilder<T> {
    private tableName: TableName;
    private filters: Array<{ field: string; op: string; value: any }> = [];
    private orderByField: string | null = null;
    private orderAsc: boolean = true;
    private limitCount: number | null = null;
    private singleResult: boolean = false;
    private maybeSingleResult: boolean = false;
    private joinedTables: string[] = [];
    private mode: QueryMode = "select";
    private updateData: Partial<T> | null = null;
    private insertRecords: Partial<T>[] | null = null;
    private countExact: boolean = false;

    constructor(tableName: TableName) {
        this.tableName = tableName;
    }

    select(fields: string = "*", options?: { count?: string; head?: boolean }): this {
        this.mode = "select";
        if (options?.count) this.countExact = true;
        const joinPattern = /(\w+):\w+\(\*\)/g;
        let match;
        while ((match = joinPattern.exec(fields)) !== null) {
            this.joinedTables.push(match[1]);
        }
        return this;
    }

    eq(field: string, value: any): this {
        this.filters.push({ field, op: "eq", value });
        return this;
    }

    order(field: string, options?: { ascending?: boolean }): this {
        this.orderByField = field;
        this.orderAsc = options?.ascending ?? true;
        return this;
    }

    limit(count: number): this {
        this.limitCount = count;
        return this;
    }

    single(): this {
        this.singleResult = true;
        return this;
    }

    maybeSingle(): this {
        this.maybeSingleResult = true;
        return this;
    }

    update(data: Partial<T>): this {
        this.mode = "update";
        this.updateData = data;
        return this;
    }

    insert(records: Partial<T>[]): this {
        this.mode = "insert";
        this.insertRecords = records;
        return this;
    }

    delete(): this {
        this.mode = "delete";
        return this;
    }

    private applyFilters(data: any[]): any[] {
        return data.filter(item => {
            return this.filters.every(f => {
                if (f.op === "eq") return item[f.field] === f.value;
                if (f.op === "neq") return item[f.field] !== f.value;
                return true;
            });
        });
    }

    private applyJoins(data: any[]): any[] {
        return data.map(item => {
            const result = { ...item };
            if (this.tableName === "subscriptions" && this.joinedTables.includes("plan")) {
                result.plan = store.subscriptionPlans.find(p => p.id === item.plan_id) || null;
            }
            if (this.tableName === "purchases" && this.joinedTables.includes("courses")) {
                result.courses = store.courses.find(c => c.id === item.course_id) || null;
            }
            if (this.tableName === "purchases" && this.joinedTables.includes("course")) {
                result.course = store.courses.find(c => c.id === item.course_id) || null;
            }
            if (this.tableName === "purchases" && this.joinedTables.includes("profiles")) {
                result.profiles = store.users.find(u => u.id === item.user_id) || null;
            }
            if ((this.tableName as any) === "learning_paths" && this.joinedTables.includes("learning_path_courses")) {
                const relatedCourses = store.learningPathCourses.filter(lpc => lpc.learning_path_id === item.id);
                result.learning_path_courses = [{ count: relatedCourses.length }];
            }
            return result;
        });
    }

    private async executeOperation(): Promise<{ data: any; count?: number; error: any }> {
        await delay();

        if (this.mode === "insert") {
            const newRecords = (this.insertRecords || []).map(r => ({
                id: generateId(),
                created_at: new Date().toISOString(),
                ...r,
            }));
            (store[this.tableName] as any[]).push(...newRecords);
            return { data: newRecords, error: null };
        }

        if (this.mode === "update") {
            const items = store[this.tableName] as any[];
            items.forEach((item, index) => {
                const matches = this.filters.every(f => item[f.field] === f.value);
                if (matches) {
                    items[index] = { ...item, ...this.updateData };
                }
            });
            return { data: null, error: null };
        }

        if (this.mode === "delete") {
            const items = store[this.tableName] as any[];
            const remaining = items.filter(item => {
                return !this.filters.every(f => item[f.field] === f.value);
            });
            (store[this.tableName] as any[]).length = 0;
            (store[this.tableName] as any[]).push(...remaining);
            return { data: null, error: null };
        }

        // SELECT mode
        let data: any[] = [...(store[this.tableName] as any[])];
        data = this.applyFilters(data);
        data = this.applyJoins(data);

        if (this.countExact) {
            return { data: null, count: data.length, error: null };
        }

        if (this.orderByField) {
            data.sort((a, b) => {
                const aVal = a[this.orderByField!];
                const bVal = b[this.orderByField!];
                if (aVal < bVal) return this.orderAsc ? -1 : 1;
                if (aVal > bVal) return this.orderAsc ? 1 : -1;
                return 0;
            });
        }

        if (this.limitCount) {
            data = data.slice(0, this.limitCount);
        }

        if (this.maybeSingleResult) {
            return { data: data[0] || null, error: null };
        }

        if (this.singleResult) {
            if (data.length === 0) return { data: null, error: { message: "No rows found" } };
            return { data: data[0], error: null };
        }

        return { data, error: null };
    }

    then<TResult1 = any, TResult2 = never>(
        onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2> {
        return this.executeOperation().then(onfulfilled, onrejected);
    }
}

// ==================== AUTH ====================
class MockAuth {
    private getStoredSession(): Profile | null {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("mock_session");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    return store.users.find(u => u.id === parsed.userId) || null;
                } catch { return null; }
            }
        }
        return currentUser;
    }

    private setStoredSession(user: Profile | null) {
        if (typeof window !== "undefined") {
            if (user) {
                localStorage.setItem("mock_session", JSON.stringify({ userId: user.id }));
            } else {
                localStorage.removeItem("mock_session");
            }
        }
        currentUser = user;
    }

    async getSession() {
        const user = this.getStoredSession();
        return {
            data: {
                session: user ? { user: { id: user.id, email: user.email } } : null
            },
            error: null
        };
    }

    async getUser() {
        const user = this.getStoredSession();
        return {
            data: { user: user ? { id: user.id, email: user.email } : null },
            error: null
        };
    }

    async signInWithPassword({ email, password }: { email: string; password: string }) {
        await delay();
        const user = store.users.find(u => u.email === email);
        if (!user) {
            return { data: { user: null, session: null }, error: { message: "Invalid login credentials" } };
        }
        this.setStoredSession(user);
        authStateListeners.forEach(cb => cb("SIGNED_IN", { user: { id: user.id, email: user.email } }));
        return {
            data: { user: { id: user.id, email: user.email }, session: { user: { id: user.id } } },
            error: null
        };
    }

    async signInWithOAuth({ provider, options }: { provider: string; options?: any }) {
        await delay();
        if (typeof window !== "undefined") {
            window.location.href = options?.redirectTo || "/mis-cursos";
        }
        return { data: { url: options?.redirectTo || "/mis-cursos" }, error: null };
    }

    async signUp({ email, password, options }: { email: string; password: string; options?: any }) {
        await delay();
        const exists = store.users.find(u => u.email === email);
        if (exists) {
            return { data: { user: null, session: null }, error: { message: "User already registered" } };
        }
        const newUser: Profile = {
            id: generateId(),
            role: "user",
            email,
            name: options?.data?.name || "Usuario",
            created_at: new Date().toISOString(),
        };
        store.users.push(newUser);
        this.setStoredSession(newUser);
        authStateListeners.forEach(cb => cb("SIGNED_IN", { user: { id: newUser.id, email: newUser.email } }));
        return {
            data: { user: { id: newUser.id, email: newUser.email }, session: { user: { id: newUser.id } } },
            error: null
        };
    }

    async signOut() {
        this.setStoredSession(null);
        authStateListeners.forEach(cb => cb("SIGNED_OUT", null));
        return { error: null };
    }

    async updateUser({ password }: { password?: string }): Promise<{ data: { user: Profile | null }; error: { message: string } | null }> {
        await delay();
        return { data: { user: currentUser }, error: null };
    }

    onAuthStateChange(callback: (event: string, session: any) => void) {
        authStateListeners.push(callback);
        const user = this.getStoredSession();
        setTimeout(() => {
            callback(user ? "INITIAL_SESSION" : "SIGNED_OUT", user ? { user: { id: user.id, email: user.email } } : null);
        }, 10);
        return {
            data: { subscription: { unsubscribe: () => {
                authStateListeners = authStateListeners.filter(cb => cb !== callback);
            }}}
        };
    }

    async exchangeCodeForSession(code: string) {
        return { error: null };
    }
}

// ==================== MAIN SERVICE ====================
class MockSupabaseService {
    auth = new MockAuth();

    from(table: string): MockQueryBuilder<any> {
        return new MockQueryBuilder(table as TableName);
    }
}

let _instance: MockSupabaseService | null = null;

export function createSupabaseBrowserClient(): MockSupabaseService {
    if (!_instance) {
        _instance = new MockSupabaseService();
    }
    return _instance;
}

export function createSupabaseServerClient(): MockSupabaseService {
    return new MockSupabaseService();
}
