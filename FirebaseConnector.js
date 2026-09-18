import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyByr1eMl8hQoJwY-Of2XLAUPM90RzwoOPQ",
  authDomain: "bdsm-calender.firebaseapp.com",
  projectId: "bdsm-calender",
  storageBucket: "bdsm-calender.firebasestorage.app",
  messagingSenderId: "775837531192",
  appId: "1:775837531192:web:cdc8cb4db8372ab0993acd",
  measurementId: "G-G5ZTLWRDFX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const loginSection = document.getElementById('loginSection');
const loginForm = document.getElementById('loginForm');
const nicknameInput = document.getElementById('nicknameInput');
const appSection = document.getElementById('appSection');
const displayUser = document.getElementById('displayUser');

const scheduleForm = document.getElementById('scheduleForm');
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const calendarGrid = document.getElementById('calendarGrid');
const monthYearHeading = document.getElementById('currentMonthYear');

let currentUser = "";
let allTasks = [];
let displayedDate = new Date();

// Handle login
// List of allowed usernames
const allowedUsers = ["Herrer", "Herres lille grissebasse"];

// Handle login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const enteredName = nicknameInput.value.trim();
    
    // Check if the entered name matches one of the allowed usernames (case-insensitive)
    const validUser = allowedUsers.find(
        user => user.toLowerCase() === enteredName.toLowerCase()
    );

    if (!validUser) {
        alert("Adgang nægtet: Du skal indtaste et gyldigt brugernavn.");
        return;
    }

    currentUser = validUser;
    displayUser.textContent = currentUser;
    loginSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    renderCalendar();
});

// Navigation buttons
document.getElementById('prevMonth')?.addEventListener('click', () => {
    displayedDate.setMonth(displayedDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth')?.addEventListener('click', () => {
    displayedDate.setMonth(displayedDate.getMonth() + 1);
    renderCalendar();
});

// Firebase Real-time Listener (Stores document IDs)
try {
    const q = query(collection(db, "shared_schedule"), orderBy("date", "asc"));
    onSnapshot(q, (snapshot) => {
        allTasks = [];
        snapshot.forEach((documentItem) => {
            allTasks.push({
                id: documentItem.id, // Grab Firebase document ID
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

// Add new event
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

// Calendar Grid Generation
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

    // Padding cells
    for (let i = 0; i < adjustedFirstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell other-month';
        calendarGrid.appendChild(emptyCell);
    }

    // Days with tasks
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
            badge.className = 'event-badge';
            badge.innerHTML = `
                <span>${t.task} (${t.author || 'Anonym'})</span>
                <button class="delete-btn" title="Slet aftale">✕</button>
            `;

            // Delete event handler
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
