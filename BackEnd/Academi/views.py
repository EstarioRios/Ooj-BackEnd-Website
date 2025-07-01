from AuthenticationSystem.models import CustomUser, Ed_Class, Score
from AuthenticationSystem.serializers import (
    ScoreSerializer,
    EdClassSerializer,
    CustomUserListSerializer,
    CustomUserDetailSerializer,
    CusomUserDetailSerializerTeacher,
)

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


def get_authenticated_user(request):
    user_auth = JWTAuthentication().authenticate(request)
    if not user_auth:
        return None, Response(
            {"error": "your JWT is not fine"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return user_auth


# POST /api/score/submit/
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def sub_score(request):
    user_auth = get_authenticated_user(request)
    if isinstance(user_auth[1], Response):
        return user_auth[1]
    user, _ = user_auth

    if user.user_type != "teacher":
        return Response(
            {"error": "You're not allowed"}, status=status.HTTP_403_FORBIDDEN
        )

    target_user_id_code = request.data.get("user_id_code")
    score_title = request.data.get("score_title")
    score_value = request.data.get("score_value")

    if not all([target_user_id_code, score_title, score_value]):
        return Response(
            {
                "error": "All fields (user_id_code, score_title, score_value) are required."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        score_value = float(score_value)
    except ValueError:
        return Response(
            {"error": "score_value must be a number"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        target_student = CustomUser.objects.get(
            id_code=target_user_id_code, user_type="student"
        )
    except CustomUser.DoesNotExist:
        return Response(
            {"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND
        )

    score = Score.objects.create(
        student=target_student, title=score_title, value=score_value
    )
    return Response(
        {"message": "Score added successfully.", "score": ScoreSerializer(score).data},
        status=status.HTTP_201_CREATED,
    )


# PATCH /api/score/edit/
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def edit_score(request):
    user_auth = get_authenticated_user(request)
    if isinstance(user_auth[1], Response):
        return user_auth[1]
    user, _ = user_auth

    if user.user_type != "teacher":
        return Response(
            {"error": "You're not allowed"}, status=status.HTTP_403_FORBIDDEN
        )

    target_user_id_code = request.data.get("user_id_code")
    score_title = request.data.get("score_title")
    score_value = request.data.get("score_value")

    if not all([target_user_id_code, score_title, score_value]):
        return Response(
            {
                "error": "All fields (user_id_code, score_title, score_value) are required."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        score_value = float(score_value)
    except ValueError:
        return Response(
            {"error": "score_value must be a number"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        target_student = CustomUser.objects.get(
            id_code=target_user_id_code, user_type="student"
        )
    except CustomUser.DoesNotExist:
        return Response(
            {"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND
        )

    try:
        target_score = Score.objects.get(student=target_student, title=score_title)
    except Score.DoesNotExist:
        return Response({"error": "Score not found"}, status=status.HTTP_404_NOT_FOUND)

    target_score.value = score_value
    target_score.save()

    return Response(
        {"message": "Score updated", "score": ScoreSerializer(target_score).data},
        status=status.HTTP_200_OK,
    )


# GET /api/student/scores/
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def show_student_scores(request):
    user_auth = get_authenticated_user(request)
    if isinstance(user_auth[1], Response):
        return user_auth[1]
    user, _ = user_auth

    if user.user_type == "student":
        target_student = user
    elif user.user_type in ("teacher", "admin"):
        student_id_code = request.query_params.get("student_id_code")
        if not student_id_code:
            return Response(
                {"error": "student_id_code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            target_student = CustomUser.objects.get(
                id_code=student_id_code, user_type="student"
            )
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND
            )
    else:
        return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

    scores = Score.objects.filter(student=target_student)
    return Response(
        {
            "student": CustomUserDetailSerializer(target_student).data,
            "scores": ScoreSerializer(scores, many=True).data,
        },
        status=status.HTTP_200_OK,
    )


# GET /api/class/students/
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def show_student_class(request):
    user_auth = get_authenticated_user(request)
    if isinstance(user_auth[1], Response):
        return user_auth[1]
    user, _ = user_auth

    if user.user_type not in ("teacher", "admin"):
        return Response(
            {"error": "You are not allowed"}, status=status.HTTP_403_FORBIDDEN
        )

    ed_class_title = request.query_params.get("ed_class_title")
    if not ed_class_title:
        return Response(
            {"error": "class title is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        target_ed_class = Ed_Class.objects.get(title=ed_class_title)
    except Ed_Class.DoesNotExist:
        return Response({"error": "Class not found"}, status=status.HTTP_404_NOT_FOUND)

    students = target_ed_class.students.all()
    return Response(
        {"students": CustomUserListSerializer(students, many=True).data},
        status=status.HTTP_200_OK,
    )


# DELETE /api/student/remove/
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_student(request):
    user_auth = get_authenticated_user(request)
    if isinstance(user_auth[1], Response):
        return user_auth[1]
    user, _ = user_auth

    if user.user_type != "admin":
        return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

    target_id_code = request.data.get("target_user_id_code")
    if not target_id_code:
        return Response(
            {"error": "'target_user_id_code' is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        target_user = CustomUser.objects.get(
            id_code=target_id_code, user_type="student"
        )
        target_user.delete()
    except CustomUser.DoesNotExist:
        return Response(
            {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
        )

    return Response({"message": "Student removed"}, status=status.HTTP_200_OK)


# DELETE /api/teacher/remove/
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_teacher(request):
    user_auth = get_authenticated_user(request)
    if isinstance(user_auth[1], Response):
        return user_auth[1]
    user, _ = user_auth

    if user.user_type != "admin":
        return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

    teacher_id_code = request.data.get("teacher_id_code")
    if not teacher_id_code:
        return Response(
            {"error": "teacher_id_code is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        teacher = CustomUser.objects.get(id_code=teacher_id_code, user_type="teacher")
        teacher.delete()
    except CustomUser.DoesNotExist:
        return Response(
            {"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND
        )

    return Response(
        {"message": "Teacher deleted successfully"}, status=status.HTTP_200_OK
    )


# GET /api/teachers/
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def show_teachers(request):
    user_auth = get_authenticated_user(request)
    if isinstance(user_auth[1], Response):
        return user_auth[1]
    user, _ = user_auth

    if user.user_type != "admin":
        return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

    teachers = CustomUser.objects.filter(user_type="teacher")
    return Response({"teachers": CustomUserListSerializer(teachers, many=True).data})


# GET /api/student/profile/
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def show_student_profile(request):
    user_auth = get_authenticated_user(request)
    if isinstance(user_auth[1], Response):
        return user_auth[1]
    user, _ = user_auth

    if user.user_type == "student":
        target_user = user
    else:
        id_code = request.query_params.get("id_code")
        if not id_code:
            return Response(
                {"error": "id_code is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            target_user = CustomUser.objects.get(id_code=id_code, user_type="student")
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )

    return Response(
        {
            "message": "Success",
            "user_data": CustomUserDetailSerializer(target_user).data,
        },
        status=status.HTTP_200_OK,
    )


# GET /api/teacher/profile/
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def show_teacher_profile(request):
    user_auth = get_authenticated_user(request)
    if isinstance(user_auth[1], Response):
        return user_auth[1]
    user, _ = user_auth

    if user.user_type == "teacher":
        target_user = user
    elif user.user_type == "admin":
        id_code = request.query_params.get("target_user_id_code")
        if not id_code:
            return Response(
                {"error": "target_user_id_code is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            target_user = CustomUser.objects.get(id_code=id_code, user_type="teacher")
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND
            )
    else:
        return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

    return Response(
        {
            "message": "Success",
            "user": CusomUserDetailSerializerTeacher(target_user).data,
        },
        status=status.HTTP_200_OK,
    )


# PATCH /api/student/change-class/
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def change_student_class(request):
    user_auth = get_authenticated_user(request)
    if isinstance(user_auth[1], Response):
        return user_auth[1]
    user, _ = user_auth

    if user.user_type != "admin":
        return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

    student_id_code = request.data.get("target_student_id_code")
    class_title = request.data.get("new_class_title")

    if not all([student_id_code, class_title]):
        return Response(
            {"error": "Both target_student_id_code and new_class_title are required"},
            status=400,
        )

    try:
        student = CustomUser.objects.get(id_code=student_id_code, user_type="student")
        new_class = Ed_Class.objects.get(title=class_title)
    except (CustomUser.DoesNotExist, Ed_Class.DoesNotExist):
        return Response(
            {"error": "Student or class not found"}, status=status.HTTP_404_NOT_FOUND
        )

    student.ed_class = new_class
    student.save()

    return Response({"message": "Student class updated"}, status=status.HTTP_200_OK)
