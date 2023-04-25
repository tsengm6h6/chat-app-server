# Realtime Chat App with MERN stack (Backend)

### Introduction
This repo consists of the **Backend** part of a Realtime Chat Application built with the MERN stack. I built it when I was trying to learn React and the stack for the first time.
You can find the frontend repo [here](https://github.com/tsengm6h6/chat-app-client-v2).

### Feature
- JWT Authentication
- One-on-one **Private Chat** where users can chat with others privately.
- Create a room and start a **Room Chat** for users who want to broadcast messages to a specific group of users.
- Real-time updates to conversation messages, user online/ offline, read/ unread status, user join/leave room to notify, etc.
- Support both RWD and different themes with light and dark mode

### Technologies
- database - MongoDB
- backend - Express.js & Node.js
- frontend - React.js (with styled-components)
- Real-time messages - Socket.io

### Deploy
- database: MongoDB Atlas
- backend: Render
- frontend: Netlify

### Live Demo
https://sweet-bombolone-176d6a.netlify.app

### Testing Account
username: Lenny Connolly  
password: 12345678  

username: Rachael Holloway  
password: 12345678  

### How to use
1. Clone the repo
    ```
    git clone https://github.com/tsengm6h6/chat-app-server.git
    ```
2. Enter the directory
    ```
    cd chat-app-server
    ```
3. Install dependencies
    ```
    yarn install
    ```
4. Change .env.example file
   - change file name to .env
   - go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) to create a cluster and change the MONGO_URI  
     (Follow [this video](https://www.youtube.com/watch?v=K8YELRmUb5o&t=920s) if you need help on this step)
   - change the CLIENT_URL to your local client port (ex. http://localhost:3000 for client running on port 3000)
   - generate random token for ACCESS/REFRESH_TOKEN_SECRET and also COOKIE_SIGNATURE

5. Run the app   
    ```
    yarn dev
    ```
    When you see "App is listening to port `YOUR_PORT` DB connection Success", you can run the client side.
