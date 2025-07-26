function accessTokenFinder() {
  const accesstokenStorage = localStorage.getItem("access_token");
  const accesstokenSession = sessionStorage.getItem("access_token");
  if (accesstokenStorage) {
    return { accessToken: accesstokenStorage, error: null };
  } else if (accesstokenSession) {
    return { accessToken: accesstokenSession, error: null };
  } else {
    return { accessToken: null, error: "no_authenticated".toString() };
  }
}

async function subScore(user_id_code, score_title, score_value) {
  const { accessToken, error } = accessTokenFinder();
  if (error) {
    return { error: error, msg: null };
  }
  const params = [user_id_code, score_title, score_value];
  if (!params.every()) {
    return { error: "no_params", msg: null, status: result.status };
  }
  const body = {
    user_id_code: user_id_code,
    score_title: score_title,
    score_value: score_value,
  };

  const response = await fetch("/api/score/submit/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken.toString(),
    },
    body: JSON.stringify(body),
  });
  const result = response.json();
  if (!response.ok) {
    return { error: result.error, msg: null, status: result.status };
  } else {
    return {
      error: null,
      msg: result.message.toString(),
      status: result.status,
    };
  }
}

async function editScore(
  user_id_code,
  score_title,
  score_value,
  score_new_title,
  score_new_value
) {
  const { accessToken, error } = accessTokenFinder();
  if (error) {
    return { error: error, msg: null };
  }
  const params = [
    user_id_code,
    score_title,
    score_value,
    score_new_title,
    score_new_value,
  ];
  if (!params.every()) {
    return { error: "no_params", msg: null, status: result.status };
  }
  const body = {
    user_id_code: user_id_code,
    score_title: score_title,
    score_value: score_value,
    score_new_title: score_new_title,
    score_new_value: score_new_value,
  };

  const response = await fetch("/api/score/edit/", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken.toString(),
    },
    body: JSON.stringify(body),
  });
  const result = response.json();
  if (!response.ok) {
    return { error: result.error, msg: null, status: result.status };
  } else {
    return {
      error: null,
      msg: result.message.toString(),
      status: result.status,
    };
  }
}

async function show_student_scores(student_id_code) {
  const { accessToken, error } = accessTokenFinder();
  if (error) {
    return { error: error, msg: null };
  }
  const params = [student_id_code];
  if (!params.every()) {
    return { error: "no_params", msg: null, status: result.status };
  }

  const response = await fetch(
    "/api/student/scores/?" + student_id_code.toString(),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken.toString(),
      },
    }
  );
  const result = response.json();
  if (!response.ok) {
    return { error: result.error, msg: null, status: result.status };
  } else {
    return {
      error: null,
      scores: result.scores,
      student: result.student,
      status: result.status,
    };
  }
}

async function show_student_class(ed_class_title) {
  const { accessToken, error } = accessTokenFinder();
  if (error) {
    return { error: error, msg: null };
  }
  const params = [ed_class_title];
  if (!params.every()) {
    return { error: "no_params", msg: null, status: result.status };
  }

  const response = await fetch(
    "/api/class/students/?ed_class_title=" + ed_class_title.toString(),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken.toString(),
      },
    }
  );
  const result = response.json();
  if (!response.ok) {
    return { error: result.error, msg: null, status: result.status };
  } else {
    return { error: null, students: result.students, status: result.status };
  }
}

async function remove_student(target_user_id_code) {
  const { accessToken, error } = accessTokenFinder();
  if (error) {
    return { error: error, msg: null };
  }
  const params = [target_user_id_code];
  if (!params.every()) {
    return { error: "no_params", msg: null, status: result.status };
  }

  const response = await fetch(
    "/api/student/remove/?target_user_id_code=" +
      target_user_id_code.toString(),
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken.toString(),
      },
    }
  );
  const result = response.json();
  if (!response.ok) {
    return { error: result.error.toString(), msg: null, status: result.status };
  }
  return { error: null, msg: result.message.toString(), status: result.status };
}

async function change_teacher(ed_class_title) {
  const { accessToken, error } = accessTokenFinder();
  if (error) {
    return { error: error, msg: null };
  }

  const params = [ed_class_title];
  if (!params.every()) {
    return { error: "no_params", msg: null, status: result.status };
  }

  const body = {
    ed_class_title: ed_class_title,
    new_teacher_id_code: new_teacher_id_code,
  };
  const response = await fetch("/api/class/change-teacher/", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken.toString(),
    },
    body: JSON.stringify(body),
  });
  const result = response.json();
  if (!response.ok) {
    return { error: result.error, msg: null, status: result.status };
  }

  return {
    error: null,
    msg: result.message.toString(),
    class: result.class,
    status: result.status,
  };
}

async function show_teachers() {
  const { accessToken, error } = accessTokenFinder();
  if (error) {
    return { error: error, msg: null };
  }

  const response = await fetch("/api/teachers/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken.toString(),
    },
  });
  const result = response.json();
  if (!response.ok) {
    return { error: result.error, msg: null, status: result.status };
  }

  return { error: null, teachers: result.teachers, status: result.status };
}

async function show_student_profile(id_code) {
  const { accessToken, error } = accessTokenFinder();
  if (error) {
    return { error: error, msg: null };
  }
  const params = [id_code];
  if (!params.every()) {
    return { error: "no_params", msg: null, status: result.status };
  }

  const response = await fetch(
    "/api/student/profile/?id_code=" + id_code.toString(),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken.toString(),
      },
    }
  );
  const result = response.json();
  if (!response.ok) {
    return { error: result.error, msg: null, status: result.status };
  } else {
    return {
      error: null,
      msg: result.message,
      user: result.user_data,
      status: result.status,
    };
  }
}

async function show_teacher_profile(target_user_id_code) {
  const { accessToken, error } = accessTokenFinder();
  if (error) {
    return { error: error, msg: null };
  }
  const params = [target_user_id_code];
  if (!params.every()) {
    return { error: "no_params", msg: null, status: result.status };
  }

  const response = await fetch(
    "/api/teacher/profile/?target_user_id_code" +
      target_user_id_code.toString(),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken.toString(),
      },
    }
  );
  const result = response.json();
  if (!response.ok) {
    return { error: result.error, msg: null, status: result.status };
  } else {
    return {
      error: null,
      msg: result.message,
      user: result.user,
      status: result.status,
    };
  }
}

async function remove_teacher(teacher_id_code) {
  const { accessToken, error } = accessTokenFinder();
  if (error) {
    return { error: error, msg: null };
  }
  const params = [teacher_id_code];
  if (!params.every()) {
    return { error: "no_params", msg: null, status: result.status };
  }

  const response = await fetch(
    "/api/student/remove/?teacher_id_code=" + teacher_id_code.toString(),
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken.toString(),
      },
    }
  );
  const result = response.json();
  if (!response.ok) {
    return { error: result.error.toString(), msg: null, status: result.status };
  }
  return { error: null, msg: result.message.toString(), status: result.status };
}

async function enCode_accessToken() {
  const { accessToken, error } = accessTokenFinder();
  if (error) {
    return { error: error, msg: null };
  }

  const response = await fetch("/api/login/access-token/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken.toString(),
    },
  });
  const result = response.json();
  if (!response.ok) {
    return { error: result.error, msg: null, status: result.status };
  } else {
    return { error: null, user: result.user_userType, status: result.status };
  }
}
