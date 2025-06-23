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


@permission_classes(IsAuthenticated)
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


@permission_classes(IsAuthenticated)
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
