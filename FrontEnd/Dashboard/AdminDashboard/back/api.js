class APIManager {
    constructor(authManager) {
        this.auth = authManager;
        this.baseURL = '/api';
    }

    // درخواست عمومی
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // اضافه کردن توکن احراز هویت
        const authHeader = this.auth.getAuthHeader();
        if (authHeader) {
            config.headers['Authorization'] = authHeader;
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                // اگر 401 باشد، کاربر را خارج کن
                if (response.status === 401) {
                    this.auth.logout();
                    return { success: false, error: 'نیاز به ورود مجدد' };
                }
                
                const errorData = await response.json();
                throw new Error(errorData.error || `خطا ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data };

        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            return { success: false, error: error.message };
        }
    }

    // ثبت نمره
    async submitScore(studentId, scoreTitle, scoreValue) {
        return await this.makeRequest('/score/submit/', {
            method: 'POST',
            body: JSON.stringify({
                user_id_code: parseInt(studentId),
                score_title: scoreTitle,
                score_value: parseFloat(scoreValue)
            })
        });
    }

    // ویرایش نمره
    async editScore(studentId, scoreTitle, scoreValue) {
        return await this.makeRequest('/score/edit/', {
            method: 'PATCH',
            body: JSON.stringify({
                user_id_code: parseInt(studentId),
                score_title: scoreTitle,
                score_value: parseFloat(scoreValue)
            })
        });
    }

    // دریافت نمرات دانش‌آموز
    async getStudentScores(studentId = null) {
        const params = studentId ? `?student_id_code=${studentId}` : '';
        return await this.makeRequest(`/student/scores/${params}`);
    }

    // دریافت دانش‌آموزان کلاس
    async getClassStudents(className) {
        return await this.makeRequest(`/class/students/?ed_class_title=${encodeURIComponent(className)}`);
    }

    // حذف دانش‌آموز
    async removeStudent(studentId) {
        return await this.makeRequest(`/student/remove/?target_user_id_code=${studentId}`, {
            method: 'DELETE'
        });
    }

    // تغییر معلم کلاس
    async changeTeacher(className, teacherId) {
        return await this.makeRequest('/class/change-teacher/', {
            method: 'PATCH',
            body: JSON.stringify({
                ed_class_title: className,
                new_teacher_id_code: parseInt(teacherId)
            })
        });
    }

    // دریافت لیست معلمان
    async getTeachers() {
        return await this.makeRequest('/teachers/');
    }

    // دریافت پروفایل دانش‌آموز
    async getStudentProfile(studentId = null) {
        const params = studentId ? `?id_code=${studentId}` : '';
        return await this.makeRequest(`/student/profile/${params}`);
    }

    // دریافت پروفایل معلم
    async getTeacherProfile(teacherId = null) {
        const params = teacherId ? `?target_user_id_code=${teacherId}` : '';
        return await this.makeRequest(`/teacher/profile/${params}`);
    }

    // حذف معلم
    async removeTeacher(teacherId) {
        return await this.makeRequest('/teacher/remove/', {
            method: 'DELETE',
            body: JSON.stringify({
                teacher_id_code: teacherId
            })
        });
    }

    // تغییر کلاس دانش‌آموز
    async changeStudentClass(studentId, newClassName) {
        return await this.makeRequest('/student/change-class/', {
            method: 'PATCH',
            body: JSON.stringify({
                target_student_id_code: parseInt(studentId),
                new_class_title: newClassName
            })
        });
    }
}

// نمونه‌سازی
const api = new APIManager(auth);
