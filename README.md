<div align="center">

# 🌍 CultureBridge

### Professional Learning, Cultural Intelligence & Workplace Development Platform

**Learn Together. Bridge Cultures. Work Globally.**

A role-based learning platform designed to help organisations, employees and facilitators develop professional skills, understand workplace diversity and improve cross-cultural collaboration through interactive workshops and practical learning experiences.

[🚀 Live Website](https://culturebridge-one.vercel.app) · [📱 Android App](https://expo.dev/accounts/samarth7272/projects/culturebridge-mobile/builds/0a770050-3676-47a4-95a8-4637394bb2d4) · [💼 LinkedIn](https://www.linkedin.com/in/samarth-shukla-b72003293) · [🐙 GitHub](https://github.com/Samarth7272) · [📧 Contact](mailto:samarthworldwide@gmail.com)

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-API-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-Mobile-61DAFB?logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-Android_Application-000020?logo=expo)
![Status](https://img.shields.io/badge/Status-Working_Demo-brightgreen)

</div>

> ⚠️ **Demo notice:** CultureBridge is a working demonstration platform. Some users, workshops, learning activities and results may contain fictional sample data. Learning content is for educational demonstration and should not be treated as legal, HR or professional compliance advice.

---

## 📌 Project Overview

CultureBridge is a full-stack professional learning and development platform built to support organisations, multinational teams and professionals.

It brings together workshop management, employee learning, facilitator activities, assessments and performance tracking in one platform.

The platform follows a role-based architecture with three main user types:

- **Admin:** Manages workshops, users and platform activities.
- **Facilitator / Trainer:** Manages workshops, supports learners and records attendance.
- **Employee / Learner:** Enrols in programmes, completes assessments and tracks learning progress.

CultureBridge is designed to provide a connected learning experience through its web platform and Android mobile application.

## 🎯 Project Goals

- Improve workplace communication and cross-cultural understanding.
- Provide structured professional learning programmes.
- Help facilitators manage workshops and learner participation.
- Give employees interactive learning and assessment experiences.
- Track learning progress and performance.
- Provide administrators with a centralised management dashboard.
- Make professional development accessible through web and mobile platforms.

---

## 🌐 Live Applications

| Platform | Access |
| --- | --- |
| Web application | [Open CultureBridge](https://culturebridge-one.vercel.app) |
| Android application | [View Android APK build](https://expo.dev/accounts/samarth7272/projects/culturebridge-mobile/builds/0a770050-3676-47a4-95a8-4637394bb2d4) |
| GitHub repository | [View source code](https://github.com/Samarth7272/culturebridge) |

**Android installation:** Open the Expo build link, select the successful Android APK build and download the installation file. Install it on an Android device.

---

## ✨ Key Features

### 1. 🔐 Authentication & Account Management

- Email and password registration.
- Email and password login.
- Google Sign-In.
- Google Sign-Up.
- Google identity token verification through the backend.
- JWT-based authentication.
- Password hashing using bcrypt.
- Existing account recognition and Google account linking.
- Role-based access for learners, facilitators and administrators.
- Protected administrator access.

### 2. 👨‍💼 Admin Dashboard

Admin users can manage platform operations.

Features include:

- Dashboard statistics and activity overview.
- Workshop creation and management.
- Workshop publishing and unpublishing.
- Registration and completion tracking.
- Interactive charts and data visualisation.
- Upcoming workshop information.
- Workshop data export.
- User and organisation management, according to assigned permissions.

### 3. 🧑‍🏫 Facilitator / Trainer Workspace

Designed to help trainers manage professional learning sessions.

Features include:

- View available workshops.
- Manage workshop participation.
- Record learner attendance.
- Monitor participant progress.
- Support employee learning activities.

### 4. 🎓 Employee / Learner Dashboard

Employees can access learning programmes and monitor their development.

Features include:

- Browse and enrol in published workshops.
- Leave workshops where permitted.
- Complete pre-training assessments.
- Participate in interactive workplace scenarios.
- Receive feedback on assessment choices.
- Complete post-training assessments.
- Track learning progress.
- View achievement badges.
- Access printable learning certificates.

### 5. 🧠 Interactive Workplace Scenarios

The learning experience includes five practical workplace scenarios:

1. The Silent Stand-up
2. Direct Code Review Comment
3. Meeting at 7 a.m. for Half the Team
4. Talked Over on a Client Call
5. A Name That Keeps Being Shortened

Each scenario provides response options, outcome-based feedback and practical learning takeaways.

### 6. 📊 Learning & Assessment

- Pre-training and post-training assessments.
- Question-based scoring.
- Assessment review.
- Progress tracking.
- First-attempt score tracking.
- Score improvement comparison.
- Achievement badges.
- Printable certificates.

### 7. 📱 Android Mobile Application

CultureBridge also has a companion Android application developed using React Native and Expo.

Mobile capabilities include:

- Professional learning interface.
- Email and password authentication.
- Google account selection.
- Google Sign-In and Sign-Up.
- Learner and facilitator registration.
- Backend API integration.
- Role-based dashboard navigation.
- Light and dark theme support.

The mobile application uses the same CultureBridge authentication backend.

---

## 🛠️ Technology Stack

### Web Frontend

| Technology | Purpose |
| --- | --- |
| Next.js 14 | Web application framework |
| React | User interface development |
| TypeScript | Type-safe development |
| Tailwind CSS | Responsive styling |
| Recharts | Charts and data visualisation |
| Lucide React | Icons |

### Backend & Database

| Technology | Purpose |
| --- | --- |
| Node.js | Backend runtime |
| Express.js | REST API development |
| MongoDB | Database |
| Mongoose | Database modelling |
| JWT | Authentication and session tokens |
| bcryptjs | Password hashing |
| google-auth-library | Google identity token verification |
| dotenv | Environment configuration |
| CORS | Cross-origin request handling |

### Mobile Application

| Technology | Purpose |
| --- | --- |
| React Native | Cross-platform mobile development |
| Expo | Mobile development and builds |
| Expo Router | Mobile navigation |
| TypeScript | Type-safe mobile development |
| Google Sign-In | Google account authentication |

### Deployment & Development Tools

- **Vercel** – Web application deployment.
- **Render** – Backend API hosting.
- **Expo EAS** – Android application builds.
- **GitHub** – Version control and source code management.
- **VS Code** – Development environment.

---

## 🏗️ System Architecture

CultureBridge follows a client-server architecture.

```text
                 CULTUREBRIDGE
                       |
          +------------+------------+
          |                         |
      WEB APP                  ANDROID APP
      Next.js                 React Native
          |                         |
          +------------+------------+
                       |
                  REST API
                  Node.js
                  Express
                       |
          +------------+------------+
          |                         |
       MongoDB                Authentication
       Database                JWT / Google
```

The web and mobile applications communicate with the backend through API requests. The backend handles authentication, application logic and database operations.

---

## 🔑 Authentication Flow

### Email Authentication

1. User enters registration or login details.
2. Mobile or web client sends the request to the backend.
3. Backend validates the credentials.
4. Passwords are securely hashed and compared using bcrypt.
5. Backend issues a JWT after successful authentication.
6. The authenticated user continues to the appropriate workspace.

### Google Authentication

1. User selects Continue with Google.
2. Google account selection is displayed.
3. The mobile application obtains a Google ID token.
4. The token is sent to the CultureBridge backend.
5. Backend verifies the token using the configured Google Web Client ID.
6. Backend finds or creates the appropriate MongoDB user account.
7. Backend issues a CultureBridge JWT.
8. User is directed to the appropriate dashboard.

Public registration is restricted to learner and facilitator roles. Administrator access is managed separately.

---

## 📁 Project Structure

The repository contains the web application and backend API. The companion mobile application is maintained in a separate Expo project.

```text
culturebridge/
│
├── app/
│   ├── page.tsx
│   ├── admin/
│   ├── facilitator/
│   ├── learner/
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── Nav
│   ├── DashboardLayout
│   ├── Globe
│   └── Other UI Components
│
├── lib/
│   ├── data.ts
│   ├── score.ts
│   └── useStore.ts
│
├── backend/
│   ├── models/
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── workshops.js
│   │   ├── progress.js
│   │   ├── organisations.js
│   │   └── ai.js
│   │
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── public/
├── package.json
├── package-lock.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or newer.
- npm.
- MongoDB connection.
- Git.
- VS Code (recommended).

### 1. Clone the repository

```bash
git clone https://github.com/Samarth7272/culturebridge.git
cd culturebridge
```

### 2. Install web dependencies

```bash
npm install
```

### 3. Configure the web application

Create a `.env.local` file in the root directory if your web configuration requires environment variables.

Add the appropriate API URL:

```dotenv
NEXT_PUBLIC_API_URL=YOUR_BACKEND_API_URL
```

Use the actual backend URL configured for your deployment.

### 4. Start the web application

```bash
npm run dev
```

Open: `http://localhost:3000`

### 5. Configure the backend

Navigate to the backend folder:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory:

```dotenv
PORT=5000
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_SECRET_KEY
CLIENT_URL=YOUR_FRONTEND_URL
GOOGLE_WEB_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

Use your own credentials. Never commit `.env` files or secrets to GitHub.

### 6. Start the backend

```bash
npm start
```

The local API server should run on: `http://localhost:5000`

### 7. Mobile application

The React Native and Expo mobile application is maintained in the companion mobile project.

For its Android development build, follow the project's Expo configuration and environment setup.

The mobile project uses:

```dotenv
EXPO_PUBLIC_API_URL=YOUR_BACKEND_API_URL
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID
```

Native Google Sign-In requires an Android development or production build. Expo Go alone is not sufficient for this native Google Sign-In integration.

---

## 🔌 Main Authentication API

The backend provides the following authentication routes:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Register with email and password |
| POST | `/api/auth/login` | Login with email and password |
| POST | `/api/auth/google` | Google Sign-In and Sign-Up |

The Google endpoint supports two authentication intents:

- `signin` – Authenticate an existing CultureBridge user.
- `signup` – Create a new learner or facilitator account.

The backend verifies Google identity tokens before creating or authenticating a user.

---

## 🧪 Testing the Platform

The following activities can be used to evaluate the platform.

### Authentication

- Register using an email and password.
- Login using an existing account.
- Create an account using Google.
- Sign in using Google.
- Verify that an existing account is not duplicated.
- Test logout and subsequent login.

### Role-Based Dashboards

- Test administrator access.
- Test facilitator access.
- Test learner access.
- Verify that each account reaches the appropriate dashboard.

### Learning Journey

1. Open the learner workspace.
2. Enrol in a published workshop.
3. Complete the pre-training assessment.
4. Attempt the five workplace scenarios.
5. Review feedback for each selection.
6. Complete the post-training assessment.
7. Review progress and achievement badges.
8. Open and print the learning certificate.

---

## 🔒 Security & Privacy

Security is an important part of the CultureBridge architecture.

- Passwords are stored as bcrypt hashes.
- JWT is used for authenticated sessions.
- Google ID tokens are verified by the backend.
- Public registration cannot create administrator accounts.
- Existing user roles are preserved during Google Sign-In.
- MongoDB stores user and application records.
- Environment variables are used for credentials and configuration.
- Private keys, database connection strings and secrets must never be committed to GitHub.

> **Note:** A production deployment should additionally undergo security testing, monitoring and review of all role-based API permissions.

---

## 🚀 Deployment

| Component | Deployment Platform |
| --- | --- |
| Web frontend | Vercel |
| Backend API | Render |
| Database | MongoDB |
| Android app | Expo EAS |

The web frontend and backend are deployed independently. The mobile application communicates with the deployed backend API.

---

## 🗺️ Future Improvements

Potential areas for further development:

- [ ] More professional learning programmes and workshop categories.
- [ ] Advanced analytics for administrators.
- [ ] Expanded facilitator tools and reporting.
- [ ] Automated email and push notifications.
- [ ] More interactive learning assessments.
- [ ] Improved mobile application functionality.
- [ ] Automated unit and end-to-end testing.
- [ ] Production monitoring and performance optimisation.
- [ ] Google Play Store publication.

---

## 🌱 Project Vision

CultureBridge aims to make professional learning more accessible, interactive and practical.

The platform brings administrators, facilitators and employees together in a structured learning environment where professional development can be organised, delivered and evaluated.

The goal is to help people and organisations build stronger communication, better collaboration and more inclusive global workplaces.

---

## 👨‍💻 Developed By

**Samarth Shukla**

B.Tech Computer Science & Engineering

### Areas of Development

- Full-Stack Web Development
- Backend Development
- React Native Mobile Development
- REST API Integration
- Database Management
- Authentication & Application Security

### Connect with me

- 💼 [LinkedIn](https://www.linkedin.com/in/samarth-shukla-b72003293)
- 🐙 [GitHub](https://github.com/Samarth7272)
- 📧 [Email](mailto:samarthworldwide@gmail.com)
- 🌐 [CultureBridge Live Website](https://culturebridge-one.vercel.app)

---

<div align="center">

### 🌍 CultureBridge

**Learn Together · Bridge Cultures · Work Globally**

*Building a better-connected professional learning experience.*

</div>
