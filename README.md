
# 🎓 OOJ Backend Website

> A powerful, modular, and scalable Django RESTful API backend for managing an educational academy.

![OOJ Banner](https://media.giphy.com/media/26xBI73gWquCBBCDe/giphy.gif)

---

## 📚 Table of Contents

- [✨ Features](#-features)
- [📁 Project Structure](#-project-structure)
- [⚙️ Getting Started](#-getting-started)
- [🔐 Environment Variables](#-environment-variables)
- [📡 API Overview](#-api-overview)
- [🧪 Running Tests](#-running-tests)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

---

## ✨ Features

- 🔐 JWT-based Authentication System
- 👥 Role-based user management: `student`, `teacher`, `admin`
- 🏫 Class & Score management with permission validation
- ⚙️ Modular Django apps
- 🛡️ Protected endpoints for teachers and authenticated users
- 💾 SQLite support (easy to migrate to PostgreSQL)
- 📦 Clean serialization and validation
- ⚡ Easy to deploy

---

## 📁 Project Structure

```
Ooj-BackEnd-Website/
├── Academi/
│   ├── views.py               # Teacher-only endpoints
│   ├── urls.py                # API routes
│   └── models.py              # [empty for now]
│
├── AuthenticationSystem/
│   ├── models.py              # CustomUser, Ed_Class, Score
│   ├── views.py               # Register/Login logic
│   ├── urls.py                # Routes
│   └── serializers.py         # Validation and output
│
├── db.sqlite3                 # Dev DB
├── manage.py                  # Django CLI
├── python_packages.txt        # Dependencies
└── README.md
```

---

## ⚙️ Getting Started

### 🧰 Requirements

- Python 3.10+
- pip / pipenv
- Git

### 🚀 Installation

```bash
git clone https://github.com/EstarioRios/Ooj-BackEnd-Website.git
cd Ooj-BackEnd-Website

python -m venv venv
source venv/bin/activate

pip install -r python_packages.txt

python manage.py migrate
python manage.py createsuperuser

python manage.py runserver
```

Go to `http://localhost:8000`

---

## 🔐 Environment Variables

Use a `.env` file or OS variables:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

---

## 📡 API Overview

### 🔑 Authentication

- `POST /api/register/student/`
- `POST /api/register/teacher/`
- `POST /api/login/`
- `GET /api/logout/`

### 📝 Score

- `POST /api/score/submit/` – Submit score (teacher only)

---

## 🧪 Running Tests

```bash
python manage.py test
```

You can expand tests inside:
- `Academi/tests.py`
- `AuthenticationSystem/tests.py`

---

## 🤝 Contributing

1. 🍴 Fork this repository
2. 🌿 Create your branch: `git checkout -b feature/YourFeature`
3. ✅ Commit your changes: `git commit -am 'Add awesome feature'`
4. 📤 Push to the branch: `git push origin feature/YourFeature`
5. 📥 Create a pull request

---

## 📝 License

MIT © 2025 — EstarioRios

---

![Thanks](https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif)
