# Smart Task Manager

A minimal task manager app that helps users stay productive by organizing tasks, setting deadlines, and receiving reminders.

## How to Run the Project

### 🔧 Backend (Express.js)

1. **Install dependencies**

```bash
cd backend
npm install or npm i
```

2. **Set up environment variables** Create a `.env` file in the `backend/` directory:

```
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
```

3. **Start the server**

```bash
node server.js 
```

### 🌐 Frontend (React.js with Tailwind CSS)

1. **Install dependencies**

```bash
cd frontend
npm install
```

2. **Run the app**

```bash
npm start
```

The app will run on: `http://localhost:3000` (frontend) and `http://localhost:5000` (backend)

## Assumptions Made

* A background cron job is scheduled to run every hour to check for upcoming task deadlines and send email reminders
* User authentication (JWT-based) is basic and used for protecting routes.
* Sync across devices is assumed to work once the user logs in—localStorage is used when not logged in.

## If I Had More Time (Possible Improvements)

* **Better Email Scheduling**: Integrate with cron jobs or a scheduler like **agenda.js** to queue and send emails precisely.
* **Progress Tracker**: Add % completion or sub-tasks for better productivity tracking.
* **Push Notifications**: Use web push or mobile push notifications for deadline reminders.
* **Offline Support**: Add Service Workers for full offline functionality.
* **Mobile App**: Extend this with React Native for mobile versions.
* **UI Polish**: Apply animations, loaders, and better color accessibility.

## Built with:

* **Frontend**: React.js + Tailwind CSS
* **Backend**: Express.js (Node.js) + MongoDB
* **Scheduling**: Node-cron Npm Package 
* **Auth**: JWT-based
* **Email**: Nodemailer (test setup)
* **Version Control**: Git + GitHub

---
