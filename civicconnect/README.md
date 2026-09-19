# CivicConnect

CivicConnect is a comprehensive, centralized complaint reporting and tracking system designed to bridge the gap between citizens and municipal authorities. It provides an efficient platform for reporting civic issues, assigning tasks to workers, and managing the resolution process with full transparency.

## Problem Statement
Municipal authorities often struggle with managing, tracking, and resolving civic complaints efficiently due to fragmented reporting channels. Citizens face lack of transparency regarding the status of their complaints, leading to frustration and distrust in local governance.

## Proposed Solution
CivicConnect streamlines the process by offering three dedicated portals:
1. **Citizen Portal:** Report issues with geo-location, photos, and track resolution status in real-time.
2. **Worker/Inspector Portal:** Receive assigned tasks, upload inspection/resolution proof, and manage workload.
3. **Admin Dashboard:** Oversee all complaints, assign tasks, prioritize urgent issues, and review final resolutions.

## Features
- **Role-Based Access Control:** Distinct interfaces for Citizens, Workers, and Admins.
- **Geo-Tagged Reporting:** Citizens can drop a pin on the map to pinpoint the exact location of an issue.
- **Real-Time Tracking & Timeline:** Citizens and admins can view the step-by-step progress of a complaint.
- **AI-Powered Assistance:** Smart categorization and details extraction using AI.
- **Evidence Uploads:** Attach "Before" and "After" photos to ensure accountability.
- **Workload Management:** Admins can see worker capacity before assigning tasks.

## Technology Stack
- **Frontend/Framework:** Next.js (React), Tailwind CSS
- **Backend/API:** Next.js API Routes (Node.js)
- **Database:** MongoDB (via Mongoose)
- **Authentication & Storage:** Firebase Auth & Firebase Storage
- **AI Integration:** Google Gemini API
- **Maps:** Leaflet & React-Leaflet

## System Architecture
The application follows a standard Next.js App Router architecture. 
- **Client Side:** Renders UI and interacts with users. Handles state and mapping (Leaflet).
- **Server Side (API Routes):** Processes requests, enforces business logic, and interacts with MongoDB.
- **External Services:** Firebase handles user authentication and media storage. Gemini provides AI features.

## APIs & Third-Party Services
- **Firebase:** Used for Authentication and Cloud Storage.
- **Google Gemini API:** Used for intelligent issue analysis and auto-filling forms.
- **Leaflet / OpenStreetMap:** Used for map rendering and geocoding.

## Database
We use **MongoDB** as our primary database, structured with the following core collections:
- `users`: Stores Citizen, Worker, and Admin profiles with their roles.
- `issues`: Stores complaint details, status timelines, assigned workers, and resolution notes.
- `notifications`: Stores alerts and updates for users.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally or a MongoDB Atlas URI
- Firebase Project with Auth and Storage enabled
- Google Gemini API Key

### 2. Environment Variables
Copy the provided `.env.example` file to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```
*(Ensure all Firebase, MongoDB, and Gemini keys are properly set. Never commit your `.env.local` file.)*

### 3. Database Setup
To seed the database and create necessary collections, run the provided setup scripts:
```bash
node create-mongodb-collections.mjs
node seedWorkers.mjs
```

### 4. How to Run the Project
Install the dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to access CivicConnect.

## Working Prototype & Demonstration
The `main` branch contains the functional MVP of CivicConnect. The core features (reporting, assigning, and resolving issues) are fully demonstrable by running the project locally using the steps above.
