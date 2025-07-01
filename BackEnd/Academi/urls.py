from django.urls import path
from .views import (
    sub_score,
    edit_score,
    show_student_scores,
    show_student_class,
    remove_student,
    change_teacher,
    show_teachers,
    show_student_profile,
    show_teacher_profile,
    change_student_class,
    remove_teacher,
)

urlpatterns = [
    # POST /api/score/submit/
    # Only teachers
    # Body: { "user_id_code": int, "score_title": str, "score_value": float }
    path("score/submit/", sub_score, name="submit_score"),
    # PATCH /api/score/edit/
    # Only teachers
    # Body: { "user_id_code": int, "score_title": str, "score_value": float }
    path("score/edit/", edit_score, name="edit_score"),
    # GET /api/student/scores/?student_id_code=123
    # Students can view their own scores
    # Teachers/admins must pass ?student_id_code
    path("student/scores/", show_student_scores, name="student_scores"),
    # GET /api/class/students/?ed_class_title=Grade 8-A
    # Teachers/admins only
    path("class/students/", show_student_class, name="show_student_class"),
    # DELETE /api/student/remove/?target_user_id_code=123
    # Admin only
    path("student/remove/", remove_student, name="remove_student"),
    # PATCH /api/class/change-teacher/
    # Admin only
    # Body: { "ed_class_title": str, "new_teacher_id_code": int }
    path("class/change-teacher/", change_teacher, name="change_teacher"),
    # GET /api/teachers/
    # Admin only
    path("teachers/", show_teachers, name="show_teachers"),
    # GET /api/student/profile/?id_code=123
    # Students: see their own profile
    # Admin/teacher: pass ?id_code
    path("student/profile/", show_student_profile, name="student_profile"),
    # GET /api/teacher/profile/?target_user_id_code=123
    # Teachers: see their own profile
    # Admins: must pass ?target_user_id_code
    path("teacher/profile/", show_teacher_profile, name="teacher_profile"),
    # DELETE /api/teacher/remove/
    # Admin only
    # Body: { "teacher_id_code": int }
    path("teacher/remove/", remove_teacher, name="remove_teacher"),
    # PATCH /api/student/change-class/
    # Admin only
    # Body: { "target_student_id_code": int, "new_class_title": str }
    path("student/change-class/", change_student_class, name="change_student_class"),
]
