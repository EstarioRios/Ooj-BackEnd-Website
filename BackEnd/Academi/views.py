from AuthenticationSystem.models import (
    CustomUser,
    Ed_Class,
    Score,
)
from AuthenticationSystem.serializers import (
    ScoreSerializer,
    EdClassSerializer,
    StudentCreateSerializer,
    TeacherCreateSerializer,
    CustomUserListSerializer,
    CustomUserDetailSerializer,
)

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


@permission_classes([IsAuthenticated])
@api_view(["POST"])
def sub_score(request):
    user, _ = JWTAuthentication().authenticate(request)
    if user.user_type != "teacher":
        return Response(
            {"error": "You're not allowed"}, status=status.HTTP_403_FORBIDDEN
        )

    target_user_id_code = request.data.get("user_id_code")
    score_title = request.data.get("score_title")
    score_value = request.data.get("score_value")

    if not all(
        [
            target_user_id_code,
            score_title,
            score_value,
        ]
    ):
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
        target_student = CustomUser.objects.get(id_code=target_user_id_code)
    except CustomUser.DoesNotExist:
        return Response(
            {"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND
        )

    if target_student.user_type != "student":
        return Response(
            {"error": "Provided user_id_code does not belong to a student."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    score = Score.objects.create(
        student=target_student, title=score_title, value=score_value
    )

    return Response(
        {
            "message": "Score added successfully.",
            "score": ScoreSerializer(score).data,
        },
        status=status.HTTP_201_CREATED,
    )


@permission_classes([IsAuthenticated])
@api_view(["PATCH"])
def edit_score(request):
    user, _ = JWTAuthentication().authenticate(request)
    if user.user_type != "teacher":
        return Response(
            {"error": "You're not allowed"}, status=status.HTTP_403_FORBIDDEN
        )

    target_user_id_code = request.data.get("user_id_code")
    score_title = request.data.get("score_title")
    score_value = request.data.get("score_value")

    if not all(
        [
            target_user_id_code,
            score_title,
            score_value,
        ]
    ):
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
        target_student = CustomUser.objects.get(id_code=target_user_id_code)
    except CustomUser.DoesNotExist:
        return Response(
            {"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND
        )

    if target_student.user_type != "student":
        return Response(
            {"error": "Provided user_id_code does not belong to a student."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        target_score = Score.objects.get(
            student=target_student,
            title=score_title,
        )
    except Score.DoesNotExist:
        return Response({"error": "Score not found"}, status=status.HTTP_404_NOT_FOUND)

    target_score.value = score_value
    target_score.title = score_title
    target_score.save()
    return Response(
        {
            "message": "Score updated",
            "score": ScoreSerializer(target_score).data,
        },
        status=status.HTTP_200_OK,
    )


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def show_student_scores(request):
    user, _ = JWTAuthentication().authenticate(request)

    if user.user_type == "student":
        target_student = user

    elif (user.user_type == "teacher") or (user.user_type == "admin"):
        student_id_code = request.query_params.get("student_id_code")
        if not student_id_code:
            return Response(
                {"error": "student_id_code is required for teacher access."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            target_student = CustomUser.objects.get(id_code=student_id_code)
            if target_student.user_type != "student":
                return Response(
                    {"error": "Provided user is not a student."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Student not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
    else:
        return Response(
            {"error": "You're not allowed to view student scores."},
            status=status.HTTP_403_FORBIDDEN,
        )

    scores = Score.objects.filter(student=target_student)
    serialized_scores = ScoreSerializer(scores, many=True).data

    return Response(
        {
            "student": CustomUserDetailSerializer(target_student).data,
            "scores": serialized_scores,
        },
        status=status.HTTP_200_OK,
    )


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def show_student_class(request):
    user, _ = JWTAuthentication().authenticate(request)

    ed_class_title = request.query_params.get("ed_class_title")
    if not ed_class_title:
        return Response(
            {"error": "class title is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        target_ed_class = Ed_Class.objects.get(title=ed_class_title)
    except Ed_Class.DoesNotExist:
        return Response({"error": "Class not found"}, status=status.HTTP_404_NOT_FOUND)

    if user.user_type not in ("teacher", "admin"):
        return Response(
            {"error": "You are not allowed"}, status=status.HTTP_403_FORBIDDEN
        )

    students = target_ed_class.students.all()

    if not students.exists():
        return Response(
            {"error": "There are no students in this class"},
            status=status.HTTP_404_NOT_FOUND,
        )

    serialized_students = CustomUserListSerializer(students, many=True).data

    return Response({"students": serialized_students}, status=status.HTTP_200_OK)


@permission_classes([IsAuthenticated])
@api_view(["DELETE"])
def remove_student(request):
    user, _ = JWTAuthentication().authenticate(request)
    if user.user_type != "admin":
        return Response(
            {"error": "You are not allowed"},
            status=status.HTTP_403_FORBIDDEN,
        )

    target_user_id_code = request.query_params.get("target_user_id_code")
    if not target_user_id_code:
        return Response(
            {"error": "'target_user_id_code' is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        target_user = CustomUser.objects.get(id_code=target_user_id_code)
    except CustomUser.DoesNotExist:
        return Response(
            {"error": "Target user not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if target_user.user_type != "student":
        return Response(
            {"error": "Only student accounts can be removed."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    target_user.delete()

    return Response(
        {"message": "User removed successfully"},
        status=status.HTTP_200_OK,
    )


@permission_classes([IsAuthenticated])
@api_view([""])
def change_teacher(request):
    user, _ = JWTAuthentication().authenticate(request)

    if user.user_type != "admin":
        return Response(
            {"error": "you are not allowed"},
            status=status.HTTP_403_FORBIDDEN,
        )

    ed_class_title = request.data.get("ed_class_title")
    if not ed_class_title:
        return Response(
            {"error": "'ed_class_title' is requirment"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        target_ed_class = Ed_Class.objects.get(title=ed_class_title)
    except Ed_Class.DoesNotExist:
        return Response(
            {"error": "target class not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    new_teacher_id_code = request.data.get("new_teacher_id_code")
    if not new_teacher_id_code:
        return Response(
            {"error": "'new_teacher_id_code' is requirment"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        new_teacher = CustomUser.objects.get(id_code=new_teacher_id_code)
    except CustomUser.DoesNotExist:
        return Response(
            {"error": "'new_teacher' not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    if new_teacher.user_type != "teacher":
        return Response(
            {"error": "'new_teacher' is not teacher"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    teacher_target_ed_class = target_ed_class.teacher
    try:
        target_ed_class.teachere(teacher_target_ed_class)
    except ValueError as e:
        return Response(
            {"error": f"{e}"},
            status=status.HTTP_403_FORBIDDEN,
        )

    return Response(
        {
            "message": "Teacher of class updated",
            "class": EdClassSerializer(target_ed_class).data,
        },
        status=status.HTTP_200_OK,
    )
