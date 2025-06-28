from AuthenticationSystem.models import CustomUser


admin_user = CustomUser.objects.create(
    first_name="Abolfazl",
    last_name="Khezri",
    id_code=12345678,
    user_type="admin",
)
admin_user.set_password("12345678m")
admin_user.save()
