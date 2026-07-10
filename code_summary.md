# main.js — Key Code Snippets (Short Reference)

Project: **Smart Tutor & Timetable Generator**
File: `main.js`

---

## 1. Global State Variables

```javascript
const days = ["Mon","Tue","Wed","Thu","Fri","Sat"];
const totalPeriods = 7;

let classSubjects    = {};  // subjects per semester
let assignments      = [];  // teacher-subject mappings
let teacherOccupancy = {};  // tracks busy slots per teacher
let teacherList      = [];  // all available teachers
```

---

## 2. Fetch Teachers from Backend

```javascript
async function fetchTeachers() {
    const res  = await fetch("api/get_teachers.php");
    const data = await res.json();
    teacherList = data || [];
    generateTeacherRows();   // rebuild UI dropdowns
}
```

---

## 3. Sync Subjects (with Fallback)

```javascript
async function syncSubjects() {
    const selectedSems = [...document.querySelectorAll(".sem-checkbox:checked")]
                         .map(cb => cb.value);

    for (const sem of selectedSems) {
        let data = [];
        try {
            const res = await fetch(`api/get_subjects.php?class_id=${sem}`);
            data = await res.json();
        } catch {
            data = fallbackSubjects[sem]; // use hardcoded data if API fails
        }
        classSubjects[sem] = data;
    }
    generateTeacherRows();
}
```

---

## 4. Generate Teacher Assignment Rows (UI)

```javascript
function generateTeacherRows() {
    selectedSems.forEach(sem => {
        classSubjects[sem].forEach(sub => {
            row.innerHTML = `
                <span>${sub.name}</span>
                <span>T:${sub.theoryLeft} P:${sub.practicalLeft}</span>
                <select class="teacher-select"
                    data-sem="${sem}"
                    data-subject="${sub.name}"
                    data-theory="${sub.theoryLeft}"
                    data-practical="${sub.practicalLeft}">
                    ...teacher options...
                </select>`;
        });
    });
}
```

---

## 5. Handle Generate Button Click

```javascript
function handleGenerate() {
    document.querySelectorAll(".teacher-select").forEach(sel => {
        if (sel.value) {
            assignments.push({
                className    : sel.dataset.sem,
                subject      : sel.dataset.subject,
                teacher      : sel.value,
                theoryLeft   : +sel.dataset.theory,
                practicalLeft: +sel.dataset.practical
            });
        }
    });

    if (assignments.length === 0) return showToast("Assign teachers first!", "error");
    generateTimetable(assignments, activeSemesters);
}
```

---

## 6. Timetable Generation Algorithm

```javascript
function generateTimetable(assignments, activeSemesters) {
    // Step 1: Init empty 6-day x 7-period grid per semester
    activeSemesters.forEach(c => {
        classSchedules[c] = Array.from({length:6}, () => Array(7).fill(null));
        for (let d = 0; d < 6; d++) classSchedules[c][d][4] = "LUNCH"; // period 4 = lunch
    });

    // Step 2: Fill each day x period slot
    for (let d = 0; d < 6; d++) {
        for (let p = 0; p < 7; p++) {
            if (p === 4) continue; // skip lunch

            const shuffled = [...activeSemesters].sort(() => Math.random() - 0.5);
            shuffled.forEach(cls => {
                // Priority: Theory → Practical → Relaxed Theory
                if (!tryAssign(cls, d, p, data, schedules, "T", usedToday))
                    if (!tryAssign(cls, d, p, data, schedules, "P"))
                        tryAssign(cls, d, p, data, schedules, "T", new Set());
            });
        }
    }
    displayTimetable(classSchedules, [...activeSemesters]);
}
```

---

## 7. Teacher Collision / Conflict Detection Logic

```javascript
function tryAssign(className, day, period, data, schedules, type, usedTheoryToday = new Set()) {
    let candidates = assignments.filter(a => {
        let sub = data[className]?.find(s => s.name === a.subject);
        return type === "T"
            ? (sub.theoryLeft > 0 && !usedTheoryToday.has(a.subject))  // no repeat today
            : sub.practicalLeft > 0;
    });

    for (let c of candidates) {
        let key = `${day}-${period}-${c.teacher}`;

        if (teacherOccupancy[key]) continue;  // COLLISION CHECK: teacher already busy

        if (type === "P") {
            let nextKey = `${day}-${period+1}-${c.teacher}`;
            // Practical = 2 consecutive free slots
            if (!teacherOccupancy[nextKey] && sub.practicalLeft >= 2) {
                schedules[className][day][period]   = { subject: c.subject, teacher: c.teacher, type: "P" };
                schedules[className][day][period+1] = { subject: c.subject, teacher: c.teacher, type: "P" };
                teacherOccupancy[key] = teacherOccupancy[nextKey] = true;
                sub.practicalLeft -= 2;
                return true;
            }
        } else {
            // Theory = single period
            schedules[className][day][period] = { subject: c.subject, teacher: c.teacher, type: "T" };
            teacherOccupancy[key] = true;
            sub.theoryLeft--;
            return true;
        }
    }
    return false; // no valid slot found
}
```

---

## 8. Display Timetable (HTML Table Rendering)

```javascript
function displayTimetable(schedules, activeSems) {
    activeSems.sort().forEach(sem => {
        schedules[sem][dIndex].forEach(val => {
            if (val === "LUNCH")
                html += `<td class="lunch-cell">LUNCH</td>`;
            else if (val?.subject)
                html += `<td class="${val.type === "P" ? "practical-cell" : "theory-cell"}">
                            ${val.subject} (${val.type} - ${val.teacher})
                         </td>`;
            else
                html += `<td>-</td>`;  // empty slot
        });
    });
}
```

---

## 9. PDF Download Function

```javascript
window.downloadPDF = async function() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("l", "pt", "a4");        // landscape A4
    const w   = pdf.internal.pageSize.getWidth();
    const h   = pdf.internal.pageSize.getHeight();

    const cards = document.querySelectorAll(".timetable-card");

    for (let i = 0; i < cards.length; i++) {
        if (i > 0) pdf.addPage();

        // Capture timetable card as image
        const canvas  = await html2canvas(cards[i], { scale: 2, backgroundColor: "#1e293b" });
        const imgData = canvas.toDataURL("image/png");

        // Scale image to fit the page
        const ratio = Math.min(w / canvas.width, h / canvas.height);
        const iw    = canvas.width  * ratio;
        const ih    = canvas.height * ratio;

        pdf.addImage(imgData, "PNG", (w-iw)/2, (h-ih)/2, iw, ih);
    }

    pdf.save("timetable.pdf");
    showToast("PDF downloaded!", "success");
};
```

---

## 10. Toast Notification System

```javascript
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;   // toast-success | toast-error | toast-info
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);   // remove after fade out
    }, 2500);
}
```

---

## Data Flow Summary

```
User selects Semesters
        |
        v
syncSubjects() -----> API call (get_subjects.php)
        |                   |-- success --> use DB data
        |                   |-- fail    --> use fallbackSubjects[]
        v
generateTeacherRows() --> dropdown UI for each subject
        |
        v
User assigns Teachers --> assignments[]
        |
        v
handleGenerate()
        |
        v
generateTimetable()
  |-- init 6x7 grid per semester
  |-- mark LUNCH at period 4
  |-- loop day x period
        |
        v
    tryAssign()
      |-- check teacherOccupancy[day-period-teacher]  <- COLLISION DETECTION
      |-- Theory: place in 1 slot, decrement theoryLeft
      |-- Practical: place in 2 consecutive slots, decrement practicalLeft
        |
        v
displayTimetable() --> HTML table rendered on screen
        |
        v
downloadPDF() --> html2canvas + jsPDF --> timetable.pdf saved
```

---

## Libraries Used

| Library       | Purpose                          |
|---------------|----------------------------------|
| `html2canvas` | Screenshot timetable card as PNG |
| `jsPDF`       | Convert PNG to downloadable PDF  |
| Vanilla JS    | All logic, DOM manipulation      |
| PHP API       | Fetch teachers & subjects from DB|
