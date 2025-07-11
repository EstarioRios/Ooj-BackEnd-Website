class AuthManager {
    constructor() {
        this.baseURL = '/api'; // آدرس API شما
        this.currentUser = null;
        this.accessToken = localStorage.getItem('access_token');
        this.refreshToken = localStorage.getItem('refresh_token');
        
        // بررسی اولیه توکن
        this.checkAuthStatus();
    }

    // بررسی وضعیت احراز هویت
    async checkAuthStatus() {
        if (this.accessToken) {
            try {
                const response = await fetch(`${this.baseURL}/auth/verify/`, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    this.currentUser = userData.user;
                    return true;
                }
            } catch (error) {
                console.log('Token verification failed:', error);
            }
        }
        return false;
    }

    // ورود کاربر (مطابق با کد موجود شما)
    async login(idCode, password, remember = false) {
        try {
            const response = await fetch(`${this.baseURL}/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_code: idCode,
                    password: password,
                    remember: remember
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'ورود ناموفق');
            }

            const result = await response.json();
            const { user_type, tokens, user } = result;

            // ذخیره توکن‌ها
            if (tokens) {
                this.accessToken = tokens.access;
                this.refreshToken = tokens.refresh_token;
                localStorage.setItem('access_token', tokens.access);
                localStorage.setItem('refresh_token', tokens.refresh_token);
            }

            // ذخیره اطلاعات کاربر
            this.currentUser = { ...user, user_type };
            localStorage.setItem('user_data', JSON.stringify(this.currentUser));

            return {
                success: true,
                user_type: user_type,
                user: user
            };

        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ورود با توکن موجود
    async loginWithToken(token) {
        try {
            const response = await fetch(`${this.baseURL}/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'توکن نامعتبر است');
            }

            const result = await response.json();
            return {
                success: true,
                data: result
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // خروج کاربر
    logout() {
        this.accessToken = null;
        this.refreshToken = null;
        this.currentUser = null;
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        
        window.location.href = '/login/';
    }

    // بررسی ورود کاربر
    isAuthenticated() {
        return this.accessToken !== null;
    }

    // دریافت نوع کاربر
    getUserType() {
        return this.currentUser?.user_type || null;
    }

    // دریافت اطلاعات کاربر
    getUser() {
        return this.currentUser;
    }

    // دریافت توکن برای درخواست‌ها
    getAuthHeader() {
        return this.accessToken ? `Bearer ${this.accessToken}` : null;
    }

    // هدایت کاربر بر اساس نوع
    redirectUserByType() {
        const userType = this.getUserType();
        
        switch (userType) {
            case 'student':
                window.location.href = '/Dashboard/StudentDashboard/';
                break;
            case 'teacher':
                window.location.href = '/Dashboard/TeacherDashboard/';
                break;
            case 'admin':
                window.location.href = '/Dashboard/AdminDashboard/';
                break;
            default:
                this.logout();
        }
    }
}

// نمونه‌سازی یکتا
const auth = new AuthManager();
