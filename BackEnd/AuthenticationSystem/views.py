from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import CustomUser
from .serializers import CustomUserDetailSerializer


# Generate JWT access and refresh tokens for a user
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user=user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


# Dashboard Response Generator
def choose_dashboard(user, tokens, msg="Login successful"):
    return Response(
        {
            "user_type": user.user_type,
            "success": msg,
            "tokens": tokens,
            "user": CustomUserDetailSerializer(user).data,
        },
        status=status.HTTP_200_OK,
    )


# Admin-only signup view
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def signup(request):
    user, _ = JWTAuthentication().authenticate(request)
    if user.user_type != "admin":
        return Response(
            {"error": "You're not allowed"}, status=status.HTTP_403_FORBIDDEN
        )

    # Extract new user data
    user_user_type = request.data.get("user_type")
    user_id_code = request.data.get("id_code")
    user_password = request.data.get("password")
    user_first_name = request.data.get("first_name")
    user_last_name = request.data.get("last_name")

    # Check for required fields
    if not all(
        [user_user_type, user_id_code, user_password, user_first_name, user_last_name]
    ):
        return Response(
            {
                "error": "All fields (user_type, id_code, password, first_name, last_name) are required."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        if user_user_type == "teacher":
            new_user = CustomUser.objects.create_teacher(
                id_code=user_id_code,
                password=user_password,
                first_name=user_first_name,
                last_name=user_last_name,
            )
        elif user_user_type == "student":
            new_user = CustomUser.objects.create_student(
                id_code=user_id_code,
                password=user_password,
                first_name=user_first_name,
                last_name=user_last_name,
            )
        else:
            return Response(
                {"error": "Invalid user_type. Must be 'student' or 'teacher'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tokens = get_tokens_for_user(new_user)
        return choose_dashboard(new_user, tokens, msg="User created successfully")

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# Manual login if JWT not present
def manual_login(request):
    user_id_code = request.data.get("id_code")
    user_password = request.data.get("password")

    if not user_id_code or not user_password:
        return Response(
            {"error": "id_code and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = CustomUser.objects.get(id_code=user_id_code)
        if user.check_password(user_password):
            return choose_dashboard(user, tokens=get_tokens_for_user(user))
        else:
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


# Login view: prefer JWT, fallback to manual login
@api_view(["POST"])
def login(request):
    try:
        user, _ = JWTAuthentication().authenticate(request)
        return choose_dashboard(user, tokens=get_tokens_for_user(user))
    except AuthenticationFailed:
        return manual_login(request)
