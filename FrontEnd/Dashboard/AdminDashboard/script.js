// Global Variables
let currentEditId = null;
let currentEditType = null;
let chart = null;

// DOM Elements
const menuItems = document.querySelectorAll('.sidebar-nav a');
const contentSections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('page-title');

// Sample Data
const sampleData = {
    students: [
        { id: '1001', firstName: 'علی', lastName: 'احمدی', class: 'هشتم الف', average: 18.5 },
        { id: '1002', firstName: 'فاطمه', lastName: 'حسینی', class: 'هشتم ب', average: 19.2 },
        { id: '1003', firstName: 'محمد', lastName: 'کریمی', class: 'نهم الف', average: 17.8 },
        { id: '1004', firstName: 'زهرا', lastName: 'محمدی', class: 'نهم ب', average: 18.9 },
        { id: '1005', firstName: 'حسن', lastName: 'رضایی', class: 'هشتم الف', average: 16.7 }
    ],
    teachers: [
        { id: 'T001', firstName: 'احمد', lastName: 'مرادی', phone: '09123456789', subject: 'ریاضی' },
        { id: 'T002', firstName: 'سارا', lastName: 'نوری', phone: '09187654321', subject: 'زبان فارسی' },
        { id: 'T003', firstName: 'علی', lastName: 'صادقی', phone: '09156789012', subject: 'فیزیک' },
        { id: 'T004', firstName: 'مریم', lastName: 'حسنی', phone: '09134567890', subject: 'شیمی' }
    ],
    classes: [
        { name: 'هشتم الف', teacher: 'احمد مرادی', studentCount: 25, average: 17.8 },
        { name: 'هشتم ب', teacher: 'سارا نوری', studentCount: 23, average: 18.3 },
        { name: 'نهم الف', teacher: 'علی صادقی', studentCount: 27, average: 18.1 },
        { name: 'نهم ب', teacher: 'مریم حسنی', studentCount: 24, average: 18.6 }
    ],
    activities: [
        { title: 'ثبت نمره جدید', description: 'نمره ریاضی برای علی احمدی ثبت شد', time: '2 ساعت پیش' },
        { title: 'اضافه شدن دانش‌آموز', description: 'دانش‌آموز جدید به کلاس هشتم الف اضافه شد', time: '4 ساعت پیش' },
        { title: 'تغییر معلم', description: 'معلم کلاس نهم ب تغییر کرد', time: '1 روز پیش' },
        { title: 'گزارش ماهانه', description: 'گزارش نمرات ماه گذشته آماده شد', time: '2 روز پیش' }
    ]
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    updateDashboard();
    loadTeachers();
    loadStudents();
    loadClasses();
    loadActivities();
    initializeChart();
    populateClassTeacherDropdown();
}

function setupEventListeners() {
    // Menu navigation
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            if (this.classList.contains('logout')) {
                handleLogout();
                return;
            }
            
            const section = this.dataset.section;
            switchSection(section);
        });
    });

    // Search functionality
    document.getElementById('teacher-search').addEventListener('input', searchTeachers);
    document.getElementById('student-search').addEventListener('input', searchStudents);
    document.getElementById('class-search').addEventListener('input', searchClasses);

    // Form submissions
    document.getElementById('add-teacher-form').addEventListener('submit', addTeacher);
    document.getElementById('add-student-form').addEventListener('submit', addStudent);
    document.getElementById('add-class-form').addEventListener('submit', addClass);
    document.getElementById('password-form').addEventListener('submit', changePassword);
    document.getElementById('edit-form').addEventListener('submit', handleEdit);

    // Modal close on outside click
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
}

function switchSection(sectionName) {
    // Update active menu item
    menuItems.forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Update content sections
    contentSections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionName).classList.add('active');
    
    // Update page title
    const titles = {
        dashboard: 'داشبورد',
        teachers: 'مدیریت معلمان',
        students: 'مدیریت دانش‌آموزان',
        classes: 'مدیریت کلاس‌ها',
        settings: 'تنظیمات'
    };
    pageTitle.textContent = titles[sectionName];
}

function updateDashboard() {
    document.getElementById('total-students').textContent = sampleData.students.length;
    document.getElementById('total-teachers').textContent = sampleData.teachers.length;
    document.getElementById('total-classes').textContent = sampleData.classes.length;
}

function loadTeachers() {
    const tbody = document.getElementById('teachers-table-body');
    tbody.innerHTML = '';
    
    sampleData.teachers.forEach(teacher => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${teacher.id}</td>
            <td>${teacher.firstName} ${teacher.lastName}</td>
            <td>${teacher.phone}</td>
            <td>${teacher.subject}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewTeacher('${teacher.id}')">
                    <i class="fas fa-eye"></i> مشاهده
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editTeacher('${teacher.id}')">
                    <i class="fas fa-edit"></i> ویرایش
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteTeacher('${teacher.id}')">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadStudents() {
    const tbody = document.getElementById('students-table-body');
    tbody.innerHTML = '';
    
    sampleData.students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.class}</td>
            <td>${student.average.toFixed(1)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewStudent('${student.id}')">
                    <i class="fas fa-eye"></i> مشاهده
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editStudent('${student.id}')">
                    <i class="fas fa-edit"></i> ویرایش
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student.id}')">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadClasses() {
    const tbody = document.getElementById('classes-table-body');
    tbody.innerHTML = '';
    
    sampleData.classes.forEach(classItem => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${classItem.name}</td>
            <td>${classItem.teacher}</td>
            <td>${classItem.studentCount}</td>
            <td>${classItem.average.toFixed(1)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewClass('${classItem.name}')">
                    <i class="fas fa-eye"></i> مشاهده
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editClass('${classItem.name}')">
                    <i class="fas fa-edit"></i> ویرایش
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteClass('${classItem.name}')">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadActivities() {
    const activitiesList = document.getElementById('activities-list');
    activitiesList.innerHTML = '';
    
    sampleData.activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-description">${activity.description}</div>
            </div>
            <div class="activity-time">${activity.time}</div>
        `;
        activitiesList.appendChild(item);
    });
}

function initializeChart() {
    const ctx = document.getElementById('gradesChart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
            datasets: [{
                label: 'میانگین نمرات',
                data: [17.2, 17.8, 18.1, 17.9, 18.3, 18.5],
                borderColor: 'rgb(52, 152, 219)',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'rgb(52, 152, 219)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgb(52, 152, 219)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 15,
                    max: 20,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#7f8c8d',
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#7f8c8d',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.4
                }
            }
        }
    });
}

function updateChartPeriod(period) {
    const buttons = document.querySelectorAll('.chart-controls .btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    let labels, data;
    
    switch(period) {
        case 'day':
            labels = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
            data = [18.2, 18.1, 18.4, 18.0, 18.3, 18.5, 18.1];
            break;
        case 'week':
            labels = ['هفته 1', 'هفته 2', 'هفته 3', 'هفته 4'];
            data = [17.8, 18.1, 18.3, 18.5];
            break;
        case 'month':
            labels = ['مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
            data = [17.2, 17.8, 18.1, 17.9, 18.3, 18.5];
            break;
    }
    
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

function populateClassTeacherDropdown() {
    const select = document.getElementById('class-teacher');
    select.innerHTML = '<option value="">انتخاب کنید</option>';
    
    sampleData.teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = `${teacher.firstName} ${teacher.lastName}`;
        option.textContent = `${teacher.firstName} ${teacher.lastName}`;
        select.appendChild(option);
    });
}

// Search functions
function searchTeachers() {
    const searchTerm = document.getElementById('teacher-search').value.toLowerCase();
    const rows = document.querySelectorAll('#teachers-table-body tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function searchStudents() {
    const searchTerm = document.getElementById('student-search').value.toLowerCase();
    const rows = document.querySelectorAll('#students-table-body tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function searchClasses() {
    const searchTerm = document.getElementById('class-search').value.toLowerCase();
    const rows = document.querySelectorAll('#classes-table-body tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hide');
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('show', 'hide');
        document.body.style.overflow = 'auto';
    }, 300);
}

// View functions
function viewTeacher(teacherId) {
    const teacher = sampleData.teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    
    document.getElementById('details-title').textContent = 'مشخصات معلم';
    document.getElementById('details-content').innerHTML = `
        <div class="detail-card">
            <div class="detail-header">
                <div class="detail-avatar">
                    ${teacher.firstName.charAt(0)}
                </div>
                <div class="detail-info">
                    <h4>${teacher.firstName} ${teacher.lastName}</h4>
                    <p>معلم ${teacher.subject}</p>
                </div>
            </div>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>کد پرسنلی:</strong>
                    <span>${teacher.id}</span>
                </div>
                <div class="detail-item">
                    <strong>نام:</strong>
                    <span>${teacher.firstName}</span>
                </div>
                <div class="detail-item">
                    <strong>نام خانوادگی:</strong>
                    <span>${teacher.lastName}</span>
                </div>
                <div class="detail-item">
                    <strong>شماره تماس:</strong>
                    <span>${teacher.phone}</span>
                </div>
                <div class="detail-item">
                    <strong>تخصص:</strong>
                    <span>${teacher.subject}</span>
                </div>
                <div class="detail-item">
                    <strong>وضعیت:</strong>
                    <span style="color: #27ae60; font-weight: bold;">فعال</span>
                </div>
            </div>
        </div>
    `;
    showModal('details-modal');
}

function viewStudent(studentId) {
    const student = sampleData.students.find(s => s.id === studentId);
    if (!student) return;
    
    document.getElementById('details-title').textContent = 'مشخصات دانش‌آموز';
    document.getElementById('details-content').innerHTML = `
        <div class="detail-card">
            <div class="detail-header">
                <div class="detail-avatar">
                    ${student.firstName.charAt(0)}
                </div>
                <div class="detail-info">
                    <h4>${student.firstName} ${student.lastName}</h4>
                    <p>دانش‌آموز کلاس ${student.class}</p>
                </div>
            </div>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>کد دانش‌آموزی:</strong>
                    <span>${student.id}</span>
                </div>
                <div class="detail-item">
                    <strong>نام:</strong>
                    <span>${student.firstName}</span>
                </div>
                <div class="detail-item">
                    <strong>نام خانوادگی:</strong>
                    <span>${student.lastName}</span>
                </div>
                <div class="detail-item">
                    <strong>کلاس:</strong>
                    <span>${student.class}</span>
                </div>
                <div class="detail-item">
                    <strong>معدل:</strong>
                    <span style="color: #3498db; font-weight: bold;">${student.average.toFixed(1)}</span>
                </div>
                <div class="detail-item">
                    <strong>وضعیت تحصیلی:</strong>
                    <span style="color: ${student.average >= 17 ? '#27ae60' : student.average >= 15 ? '#f39c12' : '#e74c3c'}; font-weight: bold;">
                        ${student.average >= 17 ? 'عالی' : student.average >= 15 ? 'متوسط' : 'نیاز به بهبود'}
                    </span>
                </div>
            </div>
        </div>
    `;
    showModal('details-modal');
}

function viewClass(className) {
    const classItem = sampleData.classes.find(c => c.name === className);
    if (!classItem) return;
    
    document.getElementById('details-title').textContent = 'مشخصات کلاس';
    document.getElementById('details-content').innerHTML = `
        <div class="detail-card">
            <div class="detail-header">
                <div class="detail-avatar">
                    ${className.charAt(0)}
                </div>
                <div class="detail-info">
                    <h4>کلاس ${classItem.name}</h4>
                    <p>معلم: ${classItem.teacher}</p>
                </div>
            </div>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>نام کلاس:</strong>
                    <span>${classItem.name}</span>
                </div>
                <div class="detail-item">
                    <strong>معلم مسئول:</strong>
                    <span>${classItem.teacher}</span>
                </div>
                <div class="detail-item">
                    <strong>تعداد دانش‌آموز:</strong>
                    <span>${classItem.studentCount} نفر</span>
                </div>
                <div class="detail-item">
                    <strong>میانگین کلاس:</strong>
                    <span style="color: #3498db; font-weight: bold;">${classItem.average.toFixed(1)}</span>
                </div>
                <div class="detail-item">
                    <strong>ظرفیت:</strong>
                    <span>30 نفر</span>
                </div>
                <div class="detail-item">
                    <strong>وضعیت:</strong>
                    <span style="color: #27ae60; font-weight: bold;">فعال</span>
                </div>
            </div>
        </div>
    `;
    showModal('details-modal');
}

// Edit functions
function editTeacher(teacherId) {
    const teacher = sampleData.teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    
    currentEditId = teacherId;
    currentEditType = 'teacher';
    
    document.getElementById('edit-title').textContent = 'ویرایش مشخصات معلم';
    document.getElementById('edit-form-content').innerHTML = `
        <div class="form-group">
            <label>نام:</label>
            <input type="text" id="edit-first-name" value="${teacher.firstName}" required>
        </div>
        <div class="form-group">
            <label>نام خانوادگی:</label>
            <input type="text" id="edit-last-name" value="${teacher.lastName}" required>
        </div>
        <div class="form-group">
            <label>کد پرسنلی:</label>
            <input type="text" id="edit-id" value="${teacher.id}" required>
        </div>
        <div class="form-group">
            <label>شماره تماس:</label>
            <input type="tel" id="edit-phone" value="${teacher.phone}" required>
        </div>
        <div class="form-group">
            <label>تخصص:</label>
            <select id="edit-subject" required>
                <option value="">انتخاب کنید</option>
                <option value="ریاضی" ${teacher.subject === 'ریاضی' ? 'selected' : ''}>ریاضی</option>
                <option value="فیزیک" ${teacher.subject === 'فیزیک' ? 'selected' : ''}>فیزیک</option>
                <option value="شیمی" ${teacher.subject === 'شیمی' ? 'selected' : ''}>شیمی</option>
                <option value="زبان فارسی" ${teacher.subject === 'زبان فارسی' ? 'selected' : ''}>زبان فارسی</option>
                <option value="زبان انگلیسی" ${teacher.subject === 'زبان انگلیسی' ? 'selected' : ''}>زبان انگلیسی</option>
                <option value="تاریخ" ${teacher.subject === 'تاریخ' ? 'selected' : ''}>تاریخ</option>
                <option value="جغرافیا" ${teacher.subject === 'جغرافیا' ? 'selected' : ''}>جغرافیا</option>
            </select>
        </div>
    `;
    showModal('edit-modal');
}

function editStudent(studentId) {
    const student = sampleData.students.find(s => s.id === studentId);
    if (!student) return;
    
    currentEditId = studentId;
    currentEditType = 'student';
    
    document.getElementById('edit-title').textContent = 'ویرایش مشخصات دانش‌آموز';
    document.getElementById('edit-form-content').innerHTML = `
        <div class="form-group">
            <label>نام:</label>
            <input type="text" id="edit-first-name" value="${student.firstName}" required>
        </div>
        <div class="form-group">
            <label>نام خانوادگی:</label>
            <input type="text" id="edit-last-name" value="${student.lastName}" required>
        </div>
        <div class="form-group">
            <label>کد دانش‌آموزی:</label>
            <input type="text" id="edit-id" value="${student.id}" required>
        </div>
        <div class="form-group">
            <label>کلاس:</label>
            <select id="edit-class" required>
                <option value="">انتخاب کنید</option>
                <option value="هشتم الف" ${student.class === 'هشتم الف' ? 'selected' : ''}>هشتم الف</option>
                <option value="هشتم ب" ${student.class === 'هشتم ب' ? 'selected' : ''}>هشتم ب</option>
                <option value="نهم الف" ${student.class === 'نهم الف' ? 'selected' : ''}>نهم الف</option>
                <option value="نهم ب" ${student.class === 'نهم ب' ? 'selected' : ''}>نهم ب</option>
            </select>
        </div>
        <div class="form-group">
            <label>معدل:</label>
            <input type="number" id="edit-average" value="${student.average}" step="0.1" min="0" max="20" required>
        </div>
    `;
    showModal('edit-modal');
}

function editClass(className) {
    const classItem = sampleData.classes.find(c => c.name === className);
    if (!classItem) return;
    
    currentEditId = className;
    currentEditType = 'class';
    
    document.getElementById('edit-title').textContent = 'ویرایش مشخصات کلاس';
    document.getElementById('edit-form-content').innerHTML = `
        <div class="form-group">
            <label>نام کلاس:</label>
            <input type="text" id="edit-class-name" value="${classItem.name}" required>
        </div>
        <div class="form-group">
            <label>معلم کلاس:</label>
            <select id="edit-class-teacher" required>
                <option value="">انتخاب کنید</option>
                ${sampleData.teachers.map(teacher => 
                    `<option value="${teacher.firstName} ${teacher.lastName}" ${classItem.teacher === `${teacher.firstName} ${teacher.lastName}` ? 'selected' : ''}>${teacher.firstName} ${teacher.lastName}</option>`
                ).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>تعداد دانش‌آموز:</label>
            <input type="number" id="edit-student-count" value="${classItem.studentCount}" min="1" max="50" required>
        </div>
        <div class="form-group">
            <label>میانگین کلاس:</label>
            <input type="number" id="edit-class-average" value="${classItem.average}" step="0.1" min="0" max="20" required>
        </div>
    `;
    showModal('edit-modal');
}

function handleEdit(e) {
    e.preventDefault();
    
    switch(currentEditType) {
        case 'teacher':
            const teacherIndex = sampleData.teachers.findIndex(t => t.id === currentEditId);
            if (teacherIndex !== -1) {
                sampleData.teachers[teacherIndex] = {
                    id: document.getElementById('edit-id').value,
                    firstName: document.getElementById('edit-first-name').value,
                    lastName: document.getElementById('edit-last-name').value,
                    phone: document.getElementById('edit-phone').value,
                    subject: document.getElementById('edit-subject').value
                };
                loadTeachers();
                populateClassTeacherDropdown();
                showNotification('مشخصات معلم با موفقیت ویرایش شد', 'success');
            }
            break;
            
        case 'student':
            const studentIndex = sampleData.students.findIndex(s => s.id === currentEditId);
            if (studentIndex !== -1) {
                sampleData.students[studentIndex] = {
                    id: document.getElementById('edit-id').value,
                    firstName: document.getElementById('edit-first-name').value,
                    lastName: document.getElementById('edit-last-name').value,
                    class: document.getElementById('edit-class').value,
                    average: parseFloat(document.getElementById('edit-average').value)
                };
                loadStudents();
                updateDashboard();
                showNotification('مشخصات دانش‌آموز با موفقیت ویرایش شد', 'success');
            }
            break;
            
        case 'class':
            const classIndex = sampleData.classes.findIndex(c => c.name === currentEditId);
            if (classIndex !== -1) {
                sampleData.classes[classIndex] = {
                    name: document.getElementById('edit-class-name').value,
                    teacher: document.getElementById('edit-class-teacher').value,
                    studentCount: parseInt(document.getElementById('edit-student-count').value),
                    average: parseFloat(document.getElementById('edit-class-average').value)
                };
                loadClasses();
                updateDashboard();
                showNotification('مشخصات کلاس با موفقیت ویرایش شد', 'success');
            }
            break;
    }
    
    closeModal('edit-modal');
}

// Form handlers
function addTeacher(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('teacher-first-name').value;
    const lastName = document.getElementById('teacher-last-name').value;
    const id = document.getElementById('teacher-id').value;
    const phone = document.getElementById('teacher-phone').value;
    const subject = document.getElementById('teacher-class').value;
    
    // Check if ID already exists
    if (sampleData.teachers.find(t => t.id === id)) {
        showNotification('کد پرسنلی تکراری است', 'error');
        return;
    }
    
    const newTeacher = {
        id: id,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        subject: subject
    };
    
    sampleData.teachers.push(newTeacher);
    loadTeachers();
    populateClassTeacherDropdown();
    closeModal('add-teacher-modal');
    
    // Reset form
    document.getElementById('add-teacher-form').reset();
    
    // Show success message
    showNotification('معلم با موفقیت اضافه شد', 'success');
}

function addStudent(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('student-first-name').value;
    const lastName = document.getElementById('student-last-name').value;
    const id = document.getElementById('student-id').value;
    const className = document.getElementById('student-class').value;
    
    // Check if ID already exists
    if (sampleData.students.find(s => s.id === id)) {
        showNotification('کد دانش‌آموزی تکراری است', 'error');
        return;
    }
    
    const newStudent = {
        id: id,
        firstName: firstName,
        lastName: lastName,
        class: className,
        average: 0
    };
    
    sampleData.students.push(newStudent);
    loadStudents();
    updateDashboard();
    closeModal('add-student-modal');
    
    // Reset form
    document.getElementById('add-student-form').reset();
    
    // Show success message
    showNotification('دانش‌آموز با موفقیت اضافه شد', 'success');
}

function addClass(e) {
    e.preventDefault();
    
    const name = document.getElementById('class-name').value;
    const teacher = document.getElementById('class-teacher').value;
    const capacity = parseInt(document.getElementById('class-capacity').value);
    
    // Check if class already exists
    if (sampleData.classes.find(c => c.name === name)) {
        showNotification('کلاس با این نام قبلاً وجود دارد', 'error');
        return;
    }
    
    const newClass = {
        name: name,
        teacher: teacher,
        studentCount: 0,
        average: 0
    };
    
    sampleData.classes.push(newClass);
    loadClasses();
    updateDashboard();
    closeModal('add-class-modal');
    
    // Reset form
    document.getElementById('add-class-form').reset();
    
    // Show success message
    showNotification('کلاس با موفقیت اضافه شد', 'success');
}

function changePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword !== confirmPassword) {
        showNotification('رمز عبور جدید و تکرار آن یکسان نیست', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('رمز عبور باید حداقل 6 کاراکتر باشد', 'error');
        return;
    }
    
    // Simulate password change
    showNotification('رمز عبور با موفقیت تغییر کرد', 'success');
    document.getElementById('password-form').reset();
}

// Delete functions
function deleteTeacher(teacherId) {
    if (confirm('آیا از حذف این معلم اطمینان دارید؟')) {
        sampleData.teachers = sampleData.teachers.filter(t => t.id !== teacherId);
        loadTeachers();
        populateClassTeacherDropdown();
        updateDashboard();
        showNotification('معلم با موفقیت حذف شد', 'success');
    }
}

function deleteStudent(studentId) {
    if (confirm('آیا از حذف این دانش‌آموز اطمینان دارید؟')) {
        sampleData.students = sampleData.students.filter(s => s.id !== studentId);
        loadStudents();
        updateDashboard();
        showNotification('دانش‌آموز با موفقیت حذف شد', 'success');
    }
}

function deleteClass(className) {
    if (confirm('آیا از حذف این کلاس اطمینان دارید؟')) {
        sampleData.classes = sampleData.classes.filter(c => c.name !== className);
        loadClasses();
        updateDashboard();
        showNotification('کلاس با موفقیت حذف شد', 'success');
    }
}

function handleLogout() {
    if (confirm('آیا می‌خواهید از سیستم خارج شوید؟')) {
        showNotification('در حال خروج از سیستم...', 'info');
        setTimeout(() => {
            alert('شما از سیستم خارج شدید');
            // در نسخه واقعی، استفاده بشه
        }, 1000);
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// API simulation functions (for future integration)
const API = {
    async submitScore(data) {
        console.log('Submitting score:', data);
        return { success: true };
    },
    
    async editScore(data) {
        console.log('Editing score:', data);
        return { success: true };
    },
    
    async getStudentScores(studentId) {
        console.log('Getting student scores:', studentId);
        return { scores: [] };
    },
    
    async getClassStudents(className) {
        console.log('Getting class students:', className);
        return { students: [] };
    },
    
    async removeStudent(studentId) {
        console.log('Removing student:', studentId);
        return { success: true };
    },
    
    async changeTeacher(data) {
        console.log('Changing teacher:', data);
        return { success: true };
    },
    
    async getTeachers() {
        console.log('Getting teachers');
        return { teachers: sampleData.teachers };
    },
    
    async getStudentProfile(studentId) {
        console.log('Getting student profile:', studentId);
        return { profile: {} };
    },
    
    async getTeacherProfile(teacherId) {
        console.log('Getting teacher profile:', teacherId);
        return { profile: {} };
    },
    
    async removeTeacher(teacherId) {
        console.log('Removing teacher:', teacherId);
        return { success: true };
    },
    
    async changeStudentClass(data) {
        console.log('Changing student class:', data);
        return { success: true };
    }
};

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // جلوگیری از اسکرول صفحه وقتی منو باز است
    if (sidebar.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// بستن منو با کلید Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeSidebar();
    }
});

// بستن منو وقتی روی لینک‌های سایدبار کلیک می‌شود (اختیاری)
document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', function() {
        // فقط در موبایل و تبلت landscape منو را ببند
        if (window.innerWidth <= 767 || 
            (window.innerWidth <= 1024 && window.innerHeight < window.innerWidth)) {
            closeSidebar();
        }
    });
});

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // جلوگیری از اسکرول صفحه
    if (sidebar.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// بستن منو با کلید Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeSidebar();
    }
});

// بستن منو وقتی روی لینک‌ها کلیک می‌شود (در تبلت و موبایل)
document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', function() {
        if (window.innerWidth <= 1024) {
            closeSidebar();
        }
    });
});

