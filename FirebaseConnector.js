import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyByr1eMl8hQoJwY-Of2XLAUPM90RzwoOPQ",
  authDomain: "bdsm-calender.firebaseapp.com",
  projectId: "bdsm-calender",
  storageBucket: "bdsm-calender.firebasestorage.app",
  messagingSenderId: "775837531192",
  appId: "1:775837531192:web:cdc8cb4db8372ab0993acd",
  measurementId: "G-G5ZTLWRDFX"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Allowed Usernames
const allowedUser1 = "Daddy";
const allowedUser2 = "Daddys lille køter";

// DOM Elements
const loginSection = document.getElementById('loginSection');
const loginForm = document.getElementById('loginForm');
const nicknameInput = document.getElementById('nicknameInput');
const appSection = document.getElementById('appSection');
const displayUser = document.getElementById('displayUser');

const scheduleForm = document.getElementById('scheduleForm');
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const typeSelect = document.getElementById('typeSelect');
const calendarGrid = document.getElementById('calendarGrid');
const monthYearHeading = document.getElementById('currentMonthYear');

// State Variables
let currentUser = "";
let allTasks = [];
let displayedDate = new Date();

// Handle Login with Role-Based Permissions
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const enteredName = nicknameInput.value.trim();

    if (enteredName.toLowerCase() === allowedUser1.toLowerCase()) {
        currentUser = allowedUser1;
        typeSelect?.classList.remove('hidden'); // Show event/task selector for User 1
    } else if (enteredName.toLowerCase() === allowedUser2.toLowerCase()) {
        currentUser = allowedUser2;
        typeSelect?.classList.add('hidden');    // Hide selector for User 2 (events only)
    } else {
        alert("Adgang nægtet: Du skal indtaste et gyldigt brugernavn.");
        return;
    }

    displayUser.textContent = currentUser;
    loginSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    renderCalendar();
});

// Navigation Buttons
document.getElementById('prevMonth')?.addEventListener('click', () => {
    displayedDate.setMonth(displayedDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth')?.addEventListener('click', () => {
    displayedDate.setMonth(displayedDate.getMonth() + 1);
    renderCalendar();
});

// Real-Time Firebase Listener
try {
    const q = query(collection(db, "shared_schedule"), orderBy("date", "asc"));
    onSnapshot(q, (snapshot) => {
        allTasks = [];
        snapshot.forEach((documentItem) => {
            allTasks.push({
                id: documentItem.id,
                ...documentItem.data()
            });
        });
        renderCalendar();
    }, (error) => {
        console.error("Firebase Snapshot Error:", error);
    });
} catch (err) {
    console.error("Firebase Connection Error:", err);
}

// Add New Document to Firestore
scheduleForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Default to "event" if the dropdown is hidden or unavailable
    const isTypeSelectorVisible = typeSelect && !typeSelect.classList.contains('hidden');
    const entryType = isTypeSelectorVisible ? typeSelect.value : "event";

    try {
        await addDoc(collection(db, "shared_schedule"), {
            task: taskInput.value,
            date: dateInput.value,
            author: currentUser,
            type: entryType
        });
        taskInput.value = "";
        dateInput.value = "";
    } catch (error) {
        console.error("Fejl ved gemning: ", error);
    }
});

// Calendar Rendering Logic
function renderCalendar() {
    if (!calendarGrid || !monthYearHeading) return;

    calendarGrid.innerHTML = "";
    
    const year = displayedDate.getFullYear();
    const month = displayedDate.getMonth();

    const monthNames = ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"];
    monthYearHeading.textContent = `${monthNames[month]} ${year}`;

    const daysOfWeek = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });

    const firstDayIndex = new Date(year, month, 1).getDay();
    const adjustedFirstDay = (firstDayIndex === 0 ? 6 : firstDayIndex - 1);
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    // Padding Cells for Previous Month
    for (let i = 0; i < adjustedFirstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell other-month';
        calendarGrid.appendChild(emptyCell);
    }

    // Days with Entries
    for (let day = 1; day <= totalDaysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell';

        const numLabel = document.createElement('div');
        numLabel.className = 'day-number';
        numLabel.textContent = day;
        dayCell.appendChild(numLabel);

        const formattedMonth = String(month + 1).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        const dateKey = `${year}-${formattedMonth}-${formattedDay}`;

        const daysTasks = allTasks.filter(t => t.date === dateKey);
        daysTasks.forEach(t => {
            const badge = document.createElement('div');
            const isTask = t.type === "task";

            // Apply red task styling if entry type is 'task'
            badge.className = `event-badge ${isTask ? 'task-badge' : ''}`;
            
            badge.innerHTML = `
                <span>${isTask ? '📌 ' : ''}${t.task} (${t.author || 'Anonym'})</span>
                <button class="delete-btn" title="Slet">✕</button>
            `;

            // Delete Event Listener
            const deleteBtn = badge.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`Vil du slette "${t.task}"?`)) {
                    try {
                        await deleteDoc(doc(db, "shared_schedule", t.id));
                    } catch (error) {
                        console.error("Fejl ved sletning: ", error);
                        alert("Kunne ikke slette aftalen. Tjek dine Firebase-regler.");
                    }
                }
            });

            dayCell.appendChild(badge);
        });

        calendarGrid.appendChild(dayCell);
    }
}
