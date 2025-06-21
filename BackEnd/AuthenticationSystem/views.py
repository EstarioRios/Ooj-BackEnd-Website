from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from .models import (
    CustomUser,
    Ed_Class,
    Score,
)
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
from rest_framework.decorators import authentication_classes, permission_classes


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
        return Response({"error": "user_type is required"}, status=400)
        # Handling customer registration

    # Ensuring all required fields are provided
    if not all([id_code, password, first_name, last_name, user_type]):
        return Response({"error": "All fields are required"}, status=400)
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
                status=201,
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

    if user_type == "teacher":
        try:
            user = CustomUser.objects.create_teacher()
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

    # Returning an error response for an invalid user type
    return Response({"error": "Invalid user type"}, status=400)


@api_view(["POST"])
def login(request):
    pass
