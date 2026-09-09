// Import Firebase modules directly from the official CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your Firebase configuration details
const firebaseConfig = {
  apiKey: "AIzaSyByr1eMl8hQoJwY-Of2XLAUPM90RzwoOPQ",
  authDomain: "bdsm-calender.firebaseapp.com",
  projectId: "bdsm-calender",
  storageBucket: "bdsm-calender.firebasestorage.app",
  messagingSenderId: "775837531192",
  appId: "1:775837531192:web:cdc8cb4db8372ab0993acd",
  measurementId: "G-G5ZTLWRDFX"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get references to HTML elements
const loginSection = document.getElementById('loginSection');
const loginForm = document.getElementById('loginForm');
const nicknameInput = document.getElementById('nicknameInput');
const appSection = document.getElementById('appSection');
const displayUser = document.getElementById('displayUser');

const scheduleForm = document.getElementById('scheduleForm');
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const scheduleList = document.getElementById('scheduleList');

let currentUser = "";

// Handle Nickname-Only Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nickname = nicknameInput.value.trim().toLowerCase();

    // 1. DEFINE YOUR TWO ALLOWED NICKNAMES HERE (Must be lowercase)
    const allowedNicknames = ["herrer", "slave"];

    // 2. CHECK IF THE TYPED NICKNAME IS ON THE ALLOWED LIST
    if (!allowedNicknames.includes(nickname)) {
        alert("Access denied: This nickname is not authorized.");
        return; 
    }

    // If allowed, save user and show app
    currentUser = nickname;
    displayUser.textContent = currentUser;
    loginSection.classList.add('hidden');
    appSection.classList.remove('hidden');
});

// Real-time listener for tasks
const q = query(collection(db, "shared_schedule"), orderBy("date", "asc"));

onSnapshot(q, (snapshot) => {
    scheduleList.innerHTML = "";
    
    snapshot.forEach((doc) => {
        const item = doc.data();
        const li = document.createElement('li');
        li.textContent = `${item.date} - ${item.task} (by ${item.author || 'Anonymous'})`;
        scheduleList.appendChild(li);
    });
});

// Send data to Firebase when a task is submitted
scheduleForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        await addDoc(collection(db, "shared_schedule"), {
            task: taskInput.value,
            date: dateInput.value,
            author: currentUser
        });

        taskInput.value = "";
        dateInput.value = "";
    } catch (error) {
        console.error("Error adding document: ", error);
    }
});
