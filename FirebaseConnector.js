// Import Firebase modules directly from the official CDN
import { initializeApp } from "https://gstatic.com";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://gstatic.com";

// 1. Paste YOUR own Firebase configuration details here from your Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyByr1eMl8hQoJwY-Of2XLAUPM90RzwoOPQ",
  authDomain: "bdsm-calender.firebaseapp.com",
  projectId: "bdsm-calender",
  storageBucket: "bdsm-calender.firebasestorage.app",
  messagingSenderId: "775837531192",
  appId: "1:775837531192:web:cdc8cb4db8372ab0993acd",
  measurementId: "G-G5ZTLWRDFX"
};

// Initialize Firebase and Firestore database
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get references to HTML elements
const scheduleForm = document.getElementById('scheduleForm');
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const scheduleList = document.getElementById('scheduleList');

// 2. LISTEN FOR REAL-TIME UPDATES (The magic part)
// This code runs automatically whenever you OR the other person changes the database
const q = query(collection(db, "shared_schedule"), orderBy("date", "asc"));

onSnapshot(q, (snapshot) => {
    // Clear the list before rebuilding it with new data
    scheduleList.innerHTML = "";
    
    // Loop through every document in your database collection
    snapshot.forEach((doc) => {
        const item = doc.data();
        
        // Create a new list item for the screen
        const li = document.createElement('li');
        li.textContent = `${item.date} - ${item.task}`;
        scheduleList.appendChild(li);
    });
});

// 3. SEND DATA TO FIREBASE (When you click 'Add to Schedule')
scheduleForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop the webpage from refreshing

    try {
        // Add a new document to the "shared_schedule" collection
        await addDoc(collection(db, "shared_schedule"), {
            task: taskInput.value,
            date: dateInput.value
        });

        // Clear the input fields for the next entry
        taskInput.value = "";
        dateInput.value = "";
    } catch (error) {
        console.error("Error adding document: ", error);
    }
});
