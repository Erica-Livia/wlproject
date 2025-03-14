# Wanderlust
### Revolutionizing Tourism in Burundi: Exploring the Impact of a Digital Platform for Local Travel

## 1. Description:
Wanderlust WebApp is a tourism platform designed to showcase Burundi's travel destinations and connect visitors with local guides. The platform provides role-based access to three user types:
- **Visitors**: Explore destinations, read and leave reviews, take an educational quiz.
- **Guides**: Manage tour listings, update details, and communicate with clients.
- **Administrators**: Oversee content, manage users, and monitor platform activity.

The application includes interactive features such as a chatbot for answering user queries and a quiz game to educate users about Burundi's culture and landmarks.

## 2. Github Repository: 
[Wanderlust GitHub Repository](https://github.com/Erica-Livia/wlproject.git)

## 3. Env and Project Set Up:
### Prerequisites
- **Node.js**
- **Firebase CLI**
- **Git**
- **Package manager (npm or yarn)**

### Clone the Repository
```sh
git clone https://github.com/Erica-Livia/wlproject.git
cd wlproject
```

### Backend Set Up (Firebase Functions)
1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up Firebase project:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable **Firestore Database** and **Authentication** (Email/Google Sign-in)
   - Copy and configure the `.env` file with Firebase credentials
4. Deploy Firebase functions (optional for local testing):
   ```sh
   firebase deploy --only functions
   ```
### Frontend Setup (React.js)
1. Navigate to the frontend folder:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
   The app should be accessible at `http://localhost:5173/`.

## 3. Video Demo
https://youtu.be/Zk1BfmTl8QE

## 4. Link to deployed prototype

https://wanderlust-82d86.web.app/

## 5. MVP Demo Analysis
For an in-depth analysis of the MVP, including achievements, challenges, and future improvements, refer to the  [MVP Demo Analysis](./Mvp_Demo_Analysis.md).
