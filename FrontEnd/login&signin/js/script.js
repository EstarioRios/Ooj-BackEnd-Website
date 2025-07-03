document.addEventListener("DOMContentLoaded", function () {
  // گرفتن فرم ورود با استفاده از ID یا کلاس
  const loginForm = document.querySelector("form");

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const idCode = document.getElementById("email").value.trim(); // همان id_code
    const password = document.getElementById("password").value;
    const remember = document.getElementById("remember_me").checked;

    const data = {
      id_code: idCode,
      password: password,
      remember: remember.toString() // باید "True" یا "False" باشه
    };

    try {
      const response = await fetch("/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();

        // نمایش پیام موفقیت در کنسول
        console.log("✅ ورود موفق:", result.success);
        console.log("👤 نوع کاربر:", result.user_type);
        console.log("🔐 توکن‌ها:", result.tokens);

        // ذخیره توکن‌ها
        if (remember) {
          localStorage.setItem("access_token", result.tokens.access);
          localStorage.setItem("refresh_token", result.tokens.refresh);
        } else {
          sessionStorage.setItem("access_token", result.tokens.access);
          sessionStorage.setItem("refresh_token", result.tokens.refresh);
        }

        // هدایت کاربر به صفحه داشبورد مثلاً:
        if (result.user_type === "student") {
          window.location.href = "/dashboard/student/";
        } else if (result.user_type === "teacher") {
          window.location.href = "/dashboard/teacher/";
        }

      } else {
        const error = await response.json();
        alert("❌ خطا در ورود: " + (error.detail || "اطلاعات اشتباه است"));
      }

    } catch (err) {
      console.error("⛔ خطا در ارسال درخواست:", err);
      alert("ارتباط با سرور ممکن نیست. لطفاً بعداً تلاش کنید.");
    }
  });
});
