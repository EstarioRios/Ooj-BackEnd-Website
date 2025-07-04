document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector("form");
  const submitBtn = loginForm.querySelector("button[type='submit']");

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const idCode = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const remember = document.getElementById("remember_me").checked;

    if (!idCode || !password) {
      alert("لطفاً تمام فیلدها را پر کنید.");
      return;
    }

    const data = {
      id_code: idCode,
      password: password,
      remember: remember,
    };

    submitBtn.disabled = true;
    submitBtn.innerText = "در حال ورود...";

    const access_token = localStorage.getItem("access_token");
    try {
      const response = await fetch("/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();

        console.log("✅ ورود موفق:", result.success);
        console.log("👤 نوع کاربر:", result.user_type);
        console.log("🔐 توکن‌ها:", result.tokens);

        if (remember) {
          localStorage.setItem("access_token", result.tokens.access);
          localStorage.setItem("refresh_token", result.tokens.refresh);
        } else {
          sessionStorage.setItem("access_token", result.tokens.access);
          sessionStorage.setItem("refresh_token", result.tokens.refresh);
        }

        if (result.user_type === "student") {
          window.location.href = "/FrontEnd/Dashboard/index.html";
        } else if (result.user_type === "teacher") {
          window.location.href = "/FrontEnd/Dashboard/index.html";
        } else if (result.user_type === "admin") {
          window.location.href = "/FrontEnd/Dashboard/index.html";
        }
      } else {
        const error = await response.json();
        alert("❌ خطا در ورود: " + (error.detail || "اطلاعات اشتباه است"));
      }
    } catch (err) {
      console.error("⛔ خطا در ارسال درخواست:", err);
      alert("ارتباط با سرور ممکن نیست. لطفاً بعداً تلاش کنید.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = "ورود";
    }
  });
});
