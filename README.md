# Blog Website Project

A modern, full-stack blog publishing platform designed for high performance, clean aesthetics, and interactive community engagement.

##  Overview

BlogHub is a production-grade blogging application built with React and Firebase. It provides a seamless experience for readers to discover stories and for authors to share their creative writing with a global audience.

##  Key Features

### **Content Management**
*   **Create & Publish**: Powerful author interface to write and publish stories.
*   **Rich Media Support**: Integration for featured images and modern layouts.
*   **Edit & Delete**: Full control for authors over their published content.
*   **Search & Discovery**: Efficient search functionality to find stories by title or content.

### **Interactive Community**
*   **Like System**: Real-time "like" functionality with atomic counters.
*   **Discussions**: Robust comment section for every post to foster community interaction.
*   **User Profiles**: Dedicated profiles showing user details and contribution history.
*   **Sharing**: One-click sharing via the Web Share API or clipboard.

### **Security & Auth**
*   **Secure Authentication**: Multi-method login including Email/Password and Google Sign-In.
*   **Password Recovery**: Integrated password reset flow.
*   **Admin Dashboard**: Advanced control center for site administrators to manage users and moderate content.
*   **Secure Data**: Multi-layered Firestore Security Rules ensuring data integrity and user privacy.

##  Technology Stack

### **Frontend**
*   **React 19**: Modern UI library using functional components and hooks.
*   **TypeScript**: Ensuring full type safety across the application.
*   **Vite**: Next-generation frontend tooling for fast builds.
*   **Tailwind CSS 4**: Utility-first styling for a distinctive and responsive design.
*   **Framer Motion**: Fluid animations and interactive transitions.
*   **Lucide React**: Clean and consistent iconography.

### **Backend (Firebase)**
*   **Firestore**: Real-time NoSQL database for structured data storage.
*   **Firebase Auth**: Secure user identity management.
*   **Hosting**: High-performance distribution on Google's global edge network.

##  Database Architecture

The application utilizes a structured document-collection model in Cloud Firestore:

*   **`profiles`**: Stores user identity, roles (user/admin), and metadata.
*   **`posts`**: Core blog content including titles, content, metrics, and author links.
*   **`comments`**: Threaded metadata linked to specific posts.
*   **`likes`**: Relational mapping between users and posts to support engagement.

##  Security

Security is foundational to this project:
*   **Schema Validation**: All writes are validated against strict schemas in Firestore Rules.
*   **Identity Guard**: Permission filters ensure users can only modify their own content.
*   **PII Protection**: Personally Identifiable Information (like emails) is isolated and restricted.

##  Getting Started

1.  **Environment Setup**: Configure `.env` with your Firebase credentials as defined in `.env.example`.
2.  **Dependencies**: Run `npm install` to set up the local environment.
3.  **Development**: Start the dev server with `npm run dev`.
4.  **Security**: Ensure `firestore.rules` are deployed to your Firebase project.

---