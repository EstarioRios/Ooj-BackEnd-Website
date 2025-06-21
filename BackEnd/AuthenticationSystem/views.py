from rest_framework.response import Response
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework_simplejwt.tokens import RefreshToken
from .models import (
    CustomUser,
    Ed_Class,
    Score,
)
from rest_framework import status
from .serializers import (
    ScoreSerializer,
    CustomUserListSerializer,
    CustomUserDetailSerializer,
    StudentCreateSerializer,
    TeacherCreateSerializer,
    EdClassSerializer,
)
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated


# Function to generate JWT tokens (access and refresh) for a given user
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user=user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


@api_view(["POST"])
def signup(request):
    # Extracting user details from request data
    id_code = request.data.get("id_code")
    password = request.data.get("password")
    first_name = request.data.get("first_name")
    last_name = request.data.get("last_name")
    user_type = request.data.get("user_type")

    # Checking if user_type is provided
    if user_type is None:
        return Response(
            {"error": "user_type is required"}, status=status.HTTP_400_BAD_REQUEST
        )
        # Handling customer registration

    # Ensuring all required fields are provided
    if not all([id_code, password, first_name, last_name, user_type]):
        return Response(
            {"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST
        )
    if user_type == "student":

        try:
            # Creating a new student user
            user = CustomUser.objects.create_student(
                id_code=id_code,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )
            # Generating JWT tokens for the newly created user
            tokens = get_tokens_for_user(user=user)
            return Response(
                {
                    "success": "Customer created successfully",
                    "tokens": tokens,
                    "user": CustomUserDetailSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    if user_type == "teacher":
        try:
            user = CustomUser.objects.create_teacher(
                id_code=id_code,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # Returning an error response for an invalid user type
    return Response({"error": "Invalid user type"}, status=status.HTTP_400_BAD_REQUEST)


def choose_dashboadrd(user_type):
    return Response({"user_type": user_type}, status=status.HTTP_200_OK)


def manual_login(request):
    user_password = request.data.get("password")
    user_id_code = request.data.get("id_code")
    try:
        target_user = CustomUser.objects.get(id_code=user_id_code)
        if target_user.check_password(user_password):
            return choose_dashboadrd(target_user.user_type)
        else:
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
def login(request):
    try:
        validated_user, _ = JWTAuthentication().authenticate(request)
        return choose_dashboadrd(validated_user.user_type)
    except AuthenticationFailed:
        return manual_login(request)
