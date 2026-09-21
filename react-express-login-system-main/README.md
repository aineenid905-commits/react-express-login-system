# **Login and Registration System**

A simple and efficient full-stack login and registration system built with **React**, **Express.js**, and **MongoDB**.

## Live Demo  
https://react-express-login.onrender.com    


---

## **Table of Contents**
1. [About the Project](#about-the-project)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
5. [Usage](#usage)
6. [License](#license)
7. [Contact](#contact)

---

## **About the Project**

This project provides a secure authentication system:
- A React-based frontend for user interaction.
- An Express.js backend with all routes defined in `server.js`.
- MongoDB for data storage, ensuring scalability.
- Security features like password encryption with `bcrypt` and input sanitization using `sanitize-html`.

---

## **Features**

- 🔒 Password encryption with `bcrypt`
- 🛡️ Input sanitization to prevent XSS attacks
- 📂 Session management with `express-sessions`
- 🌐 RESTful API for authentication
- 📊 MongoDB for data storage

---

## **Tech Stack**

### Frontend:
- React.js
- Axios (for HTTP requests)

### Backend:
- Node.js
- Express.js
- MongoDB (native driver)
- bcrypt (for password hashing)
- sanitize-html (for input sanitization)
- express-sessions (for session management)

---

## **Getting Started**

### Prerequisites

Ensure you have the following installed:
- Node.js (v16 or higher)
- MongoDB (running locally or via a cloud service like MongoDB Atlas)

### Installation

1. Clone the repository:
git clone https://github.com/owpji/react-express-login-system.git  
cd react-express-login-system


2. Install dependencies:  
npm install


3. Configure environment variables:
- Create a `.env` file in the backend folder with the following variables:
  ```
  MONGO_URI=YOUR-MONGODB-URL  
  SESSION_SECRET=YOUR-SESSION-SECRET
  ```

4. Start the application:  
cd backend  
npm start  
  
new terminal  
npm start


5. Open your browser and navigate to `http://localhost:5173`.

---

## **Usage**

### Registration:
1. Access the registration page.
2. Enter your details (name, email, password).
3. Submit the form to create an account.

### Login:
1. Access the login page.
2. Enter your credentials.
3. Upon successful login, access protected routes or features.

---  

## **License**

This project is licensed under the MIT License.

---

## **Contact**

For questions or feedback, feel free to reach out:

**Peter Isaac**  
- Linkedin: [https://www.linkedin.com/in/peter-joseph-isaac](https://www.linkedin.com/in/peter-joseph-isaac)
- GitHub: [https://github.com/peter-joseph-isaac](https://github.com/peter-joseph-isaac)
