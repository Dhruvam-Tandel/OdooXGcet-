<img width="1899" height="906" alt="Screenshot 2026-01-03 162220" src="https://github.com/user-attachments/assets/a75c7d68-2b5d-4ba2-9ab4-efc564eb3da5" /># Dayflow - HRMS & Employee Management System

Dayflow is a modern, full-stack Human Resource Management System (HRMS) designed to streamline employee attendance, payroll, and profile management. Built with the MERN stack (MongoDB, Express, React, Node.js), it offers a sleek, dark-themed UI/UX for both Administrators and Employees.

## 🚀 Features

### For Employees
*   **Smart Dashboard**: View real-time attendance stats, consistency scores, and activity heatmaps.
*   **One-Click Attendance**: Easy Check-In and Check-Out with visual confirmations.
*   **Profile Management**: Manage personal details, bank information, and skills.
*   **Salary Insights**: View detailed salary breakdowns including basic, HRA, bonuses, and PF.

### For Administrators
*   **Employee Management**: Add new employees, view lists, and manage profiles.
*   **Salary Configuration**: Define and structure employee salaries with auto-balancing allowances.
*   **Attendance Monitoring**: Track employee check-in times and statuses (Present/Absent/On Leave).

## 📸 Screenshots

### Employee Dashboard
Real-time insights into your work habits and attendance consistency.
![Employee Dashboard](screenshots/employee_dashboard.png)

### Admin Dashboard
Manage your workforce efficiently.
![Admin Dashboard](screenshots/admin_dashboard.png)

### Salary Management (Admin)
Detailed, auto-calculating salary structure configuration.
![Salary Management](screenshots/salary_management.png)

## 🛠️ Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide React
*   **Backend**: Node.js, Express.js, MongoDB (Mongoose)
*   **Authentication**: JWT (JSON Web Tokens)
*   **Tools**: Axios, Multer (File Uploads)

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Dhruvam-Tandel/OdooXGcet-.git
    cd OdooXGcet-
    ```

2.  **Setup Backend**
    ```bash
    cd server
    npm install
    # Create a .env file with:
    # PORT=5000
    # MONGO_URI=your_mongodb_uri
    # JWT_SECRET=your_jwt_secret
    npm run dev
    ```

3.  **Setup Frontend**
    ```bash
    cd client
    npm install
    npm run dev
    ```


