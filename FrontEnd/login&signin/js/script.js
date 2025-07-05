document.addEventListener("DOMContentLoaded", async function () {
  const loginForm = document.querySelector("form");
  const submitBtn = loginForm.querySelector("button[type='submit']");

  async function okHandler(response) {
    const result = await response.json();
    const { user_type, tokens, user } = result;

    console.log("user:", user);

    if (tokens) {
      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh_token);
    }

    if (user_type === "student") {
      window.location.href = "../../Dashboard/StudentDashboard";
    } else if (user_type === "teacher") {
      window.location.href = "../../Dashboard/TeacherDashboard";
    } else if (user_type === "admin") {
      window.location.href = "../../Dashboard/AdminDashboard";
    } else {
      alert("نقش کاربر نامشخص است.");
    }
  }

  async function tryLoginWithToken(token) {
    try {
      const response = await fetch("/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token.toString(),
        },
      });

      if (!response.ok) {
        const result = await response.json();
        return { error: result.error || "توکن نامعتبر است", response: null };
      }

      return { error: null, response };
    } catch (err) {
      return { error: err.message, response: null };
    }
  }

  async function tryLoginManual(data) {
    try {
      const response = await fetch("/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        return { error: result.error || "ورود ناموفق", response: null };
      }

      return { error: null, response };
    } catch (err) {
      return { error: err.message, response: null };
    }
  }

  const access_token = localStorage.getItem("access_token");

  if (access_token) {
    const { error, response } = await tryLoginWithToken(access_token);
    if (response) {
      await okHandler(response);
      return;
    }
  }

  loginForm.style.display = "block";

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const idCode = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const remember = document.getElementById("remember_me").checked;

    if (!idCode || !password) {
      alert("لطفاً تمام فیلدها را پر کنید.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "در حال ورود...";

    const data = {
      id_code: idCode,
      password: password,
      remember: remember,
    };

    const { error, response } = await tryLoginManual(data);

    if (response) {
      await okHandler(response);
    } else {
      console.error("Login error:", error);
      alert("خطا در ورود: " + error);
      submitBtn.disabled = false;
      submitBtn.innerText = "ورود";
    }
  });
});
