from django.urls import path
from .views import login, signup
from Academi.views import enCode_accessToken

urlpatterns = [
    # POST /api/login/
    # Description: Login using JWT token (if already exists) or with id_code and password.
    # Request body (if JWT not used):
    # {
    #   "id_code": 123456,
    #   "password": "your_password",
    #   "remember":"True ro False"
    # }
    # Response (200 OK):
    # {
    #   "user_type": "student",
    #   "success": "Login successful",
    #   "tokens": { "access": "...", "refresh": "..." },
    #   "user": { ... }  # serialized user data
    # }
    path("login/", login, name="login"),
    # POST /api/signup/
    # Description: Create a new user (admin-only access via JWT)
    # Headers:
    #   Authorization: Bearer <admin_access_token>
    # Request body (for teacher):
    # {
    #   "user_type": "teacher",
    #   "id_code": 123456,
    #   "password": "your_password",
    #   "first_name": "Ali",
    #   "last_name": "Ahmadi"
    # }
    # Request body (for student):
    # {
    #   "user_type": "student",
    #   "id_code": 654321,
    #   "password": "your_password",
    #   "first_name": "Sara",
    #   "last_name": "Hosseini",
    #   "student_class": "Grade 8-A"
    # }
    # Response (201 Created or 200 OK):
    # {
    #   "user_type": "student",
    #   "success": "User created successfully",
    #   "tokens": { "access": "...", "refresh": "..." },
    #   "user": { ... }  # serialized user data
    # }
    path("signup/", signup, name="signup"),
    # GET /api/login/access-token/
    # Everyone
    path("login/access-token/", enCode_accessToken, name="encode_access_token"),
]
