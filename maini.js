const classes = ["1", "2", "3", "4", "5", "6"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const totalPeriods = 7;

let classSubjects = { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] };
let assignments = [];
let teacherOccupancy = {};
let teacherList = [];

let elements = {};

window.toggleSemester = function (card, semValue) {
    const checkbox = card.querySelector(".sem-checkbox");
    const statusText = card.querySelector(".status-text");

    checkbox.checked = !checkbox.checked;

    if (checkbox.checked) {
        card.classList.add("active");
        statusText.textContent = "Selected";
    } else {
        card.classList.remove("active");
        statusText.textContent = "Not Selected";
    }

    syncSubjects();
};

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Loaded, initializing...");

    elements = {
        semSelectionContainer: document.getElementById("semSelectionContainer"),
        subjectCheckboxContainer: document.getElementById("subjectCheckboxContainer"),
        teacherListContainer: document.getElementById("teacherListContainer"),
        generateBtn: document.getElementById("generateBtn"),
        timetableContainer: document.getElementById("timetableContainer"),
        downloadBtn: document.getElementById("downloadBtn")
    };

    fetchTeachers();

    const style = document.createElement("style");
    style.textContent = `
        .toast { position: fixed; bottom: 30px; right: 30px; padding: 16px 24px; border-radius: 12px; background: #1e293b; border: 1px solid #334155; color: #f1f5f9; font-size: 14px; font-weight: 500; transform: translateY(100px); opacity: 0; transition: all 0.3s ease; z-index: 9999; box-shadow: 0 10px 40px rgba(0,0,0,0.4); }
        .toast.show { transform: translateY(0); opacity: 1; }
        .toast-success { border-left: 4px solid #10b981; }
        .toast-error { border-left: 4px solid #ef4444; }
        .toast-info { border-left: 4px solid #6366f1; }
        .loading-state { text-align: center; padding: 30px; color: #94a3b8; }
        .loading-spinner { display: inline-block; width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #6366f1; animation: spin 0.8s linear infinite; margin-right: 10px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .teacher-section-header { font-size: 14px; font-weight: 700; color: #818cf8; margin: 20px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #6366f1; }
    `;
    document.head.appendChild(style);

    if (elements.generateBtn) {
        elements.generateBtn.addEventListener("click", handleGenerate);
    }

    if (elements.downloadBtn) {
        elements.downloadBtn.addEventListener("click", downloadPDF);
    }
});

function handleGenerate() {
    const dropdowns = document.querySelectorAll(".teacher-select");
    assignments = [];
    let activeSemesters = new Set();

    dropdowns.forEach(sel => {
        if (sel.value) {
            activeSemesters.add(sel.dataset.sem);
            assignments.push({
                className: sel.dataset.sem,
                subject: sel.dataset.subject,
                teacher: sel.value,
                theoryLeft: parseInt(sel.dataset.theory) || 0,
                practicalLeft: parseInt(sel.dataset.practical) || 0
            });
        }
    });

    if (assignments.length === 0) {
        showToast("Please assign teachers to subjects first!", "error");
        return;
    }

    const originalText = elements.generateBtn.innerHTML;
    elements.generateBtn.innerHTML = '<span class="loading-spinner"></span> Generating...';
    elements.generateBtn.disabled = true;

    setTimeout(() => {
        generateTimetable(assignments, activeSemesters);
        elements.generateBtn.innerHTML = originalText;
        elements.generateBtn.disabled = false;
    }, 100);
}

function showToast(message, type = "info") {
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

async function fetchTeachers() {
    try {
        const response = await fetch("api/get_teachers.php");
        if (!response.ok) throw new Error("Network error");

        const data = await response.json();
        teacherList = data || [];
        generateTeacherRows();
    } catch (err) {
        console.error("Error fetching teachers:", err);
        teacherList = [];
        generateTeacherRows();
    }
}

async function syncSubjects() {
    const container = elements.subjectCheckboxContainer;
    const selectedSems = Array.from(
        document.querySelectorAll(".sem-checkbox:checked")
    ).map(cb => cb.value);

    if (selectedSems.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Select semesters above to see subjects</p></div>';
        elements.teacherListContainer.innerHTML = '<div class="empty-state"><p>Select a semester first</p></div>';
        return;
    }

    container.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Loading subjects...</p></div>';

    classSubjects = { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] };

    const fallbackSubjects = {
        "1": [{ name: "Mathematics", theory: 3, practical: 1 }, { name: "Physics", theory: 3, practical: 2 }, { name: "Chemistry", theory: 3, practical: 2 }, { name: "English", theory: 2, practical: 0 }],
        "2": [{ name: "Mathematics", theory: 3, practical: 1 }, { name: "Physics", theory: 3, practical: 2 }, { name: "C++", theory: 3, practical: 2 }, { name: "English", theory: 2, practical: 0 }],
        "3": [{ name: "Java", theory: 3, practical: 2 }, { name: "Data Structures", theory: 3, practical: 2 }, { name: "DLD", theory: 3, practical: 1 }, { name: "COA", theory: 3, practical: 1 }],
        "4": [{ name: "Algorithms", theory: 3, practical: 2 }, { name: "Database", theory: 3, practical: 2 }, { name: "OS", theory: 3, practical: 1 }, { name: "CN", theory: 3, practical: 1 }],
        "5": [{ name: "Web Tech", theory: 3, practical: 2 }, { name: "AI", theory: 3, practical: 2 }, { name: "Cloud", theory: 2, practical: 1 }, { name: "Project", theory: 0, practical: 4 }],
        "6": [{ name: "Project", theory: 0, practical: 6 }, { name: "Seminar", theory: 2, practical: 0 }, { name: "Cloud", theory: 2, practical: 1 }]
    };

    let allHtml = "";

    for (const sem of selectedSems) {
        let data = [];
        try {
            const response = await fetch(`api/get_subjects.php?class_id=${sem}`);
            if (!response.ok) throw new Error("Network error");

            const text = await response.text();
            if (text) {
                data = JSON.parse(text);
            }
        } catch (err) {
            console.log(`Using fallback data for SEM ${sem}`);
        }

        if (data.length === 0) {
            data = fallbackSubjects[sem] || [];
        }

        classSubjects[sem] = data.map(sub => ({
            name: sub.name || sub.subject_name,
            theoryLeft: parseInt(sub.theory || sub.theory_hours) || 0,
            practicalLeft: parseInt(sub.practical || sub.practical_hours) || 0
        }));

        allHtml += `
            <div class="sem-group">
                <strong>SEM ${sem}</strong>
                <div class="subject-tags">
                    ${classSubjects[sem].map(s => `<span class="subject-tag">${s.name}</span>`).join("")}
                </div>
            </div>`;
    }

    container.innerHTML = allHtml || '<div class="empty-state"><p>No subjects found</p></div>';
    generateTeacherRows();
}

function generateTeacherRows() {
    const container = elements.teacherListContainer;
    container.innerHTML = "";

    const selectedSems = Array.from(
        document.querySelectorAll(".sem-checkbox:checked")
    ).map(cb => cb.value);

    if (selectedSems.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Select semesters in Step 1 first</p></div>';
        return;
    }

    let hasContent = false;
    selectedSems.forEach(sem => {
        if (!classSubjects[sem] || classSubjects[sem].length === 0) return;
        hasContent = true;

        const semHeader = document.createElement("div");
        semHeader.className = "teacher-section-header";
        semHeader.textContent = `Semester ${sem} Assignments`;
        container.appendChild(semHeader);

        classSubjects[sem].forEach((sub) => {
            const row = document.createElement("div");
            row.className = "teacher-row";

            let options = `<option value="">-- Select Teacher --</option>`;
            teacherList.forEach(t => options += `<option value="${t}">${t}</option>`);

            row.innerHTML = `
                <div class="subject-info">
                    <span class="subject-name">${sub.name}</span>
                    <span class="subject-hours">T: ${sub.theoryLeft} - P: ${sub.practicalLeft}</span>
                </div>
                <select class="teacher-select" data-sem="${sem}" data-subject="${sub.name}" data-theory="${sub.theoryLeft}" data-practical="${sub.practicalLeft}">
                    ${options}
                </select>
            `;
            container.appendChild(row);
        });
    });

    if (!hasContent) {
        container.innerHTML = '<div class="empty-state"><p>No subjects available</p></div>';
    }
}



function generateTimetable(assignments, activeSemesters) {
    let bestSchedules = null;
    let minRemainingHours = Infinity;
    const maxAttempts = 500;

    const isLateSubject = name => /library|liberary|sports|recovery|visits/i.test(name);
    const canScheduleLate = (d, cell) => cell > 3 && d >= 2;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        let classSchedules = {};
        let currentTeacherOccupancy = {};
        let workingSubjects = {};
        let usedPracticalToday = {};
        let usedSubjectToday = {};
        let teacherDailyClassCount = {};
        let teacherLastPeriod = {};

        activeSemesters.forEach(c => {
            workingSubjects[c] = assignments
                .filter(a => a.className === c)
                .map(a => ({
                    name: a.subject,
                    teacher: a.teacher,
                    theoryLeft: a.theoryLeft,
                    practicalLeft: a.practicalLeft
                }));

            classSchedules[c] = Array.from({ length: 6 }, () => Array(totalPeriods).fill(null));
            for (let d = 0; d < 6; d++) classSchedules[c][d][4] = "LUNCH";

            usedPracticalToday[c] = Array.from({ length: 6 }, () => new Set());
            usedSubjectToday[c] = Array.from({ length: 6 }, () => new Set());
            teacherDailyClassCount[c] = Array.from({ length: 6 }, () => ({}));
            teacherLastPeriod[c] = Array.from({ length: 6 }, () => ({}));
        });

        // ═══════════════════════════════════════════════════════════════
        // Sequential Generation: Process one full semester before moving to the next.
        // Compare teacher availability dynamically against previously generated semesters.
        // ═══════════════════════════════════════════════════════════════
        const semestersToProcess = Array.from(activeSemesters).sort(() => Math.random() - 0.5);

        semestersToProcess.forEach(className => {
            for (let d = 0; d < 6; d++) {
                let cell = 0;

                // --- THEORY LOOP ---
                // (First we will put all the theory subjects)
                while (cell <= 3) {
                    let totalTheoryHours = workingSubjects[className].reduce((sum, s) => sum + s.theoryLeft, 0);
                    if (totalTheoryHours <= 0) break; // Break out early, move to practicals

                    let candidates = workingSubjects[className].filter(s =>
                        s.theoryLeft > 0 &&
                        !usedSubjectToday[className][d].has(s.name) &&
                        !currentTeacherOccupancy[`${d}-${cell}-${s.teacher}`] &&
                        (!isLateSubject(s.name) || canScheduleLate(d, cell))
                    );
                    candidates.sort((a, b) => b.theoryLeft - a.theoryLeft);

                    if (candidates.length > 0) {
                        let candidate = candidates[0];
                        classSchedules[className][d][cell] = { subject: candidate.name, teacher: candidate.teacher, type: "T" };
                        currentTeacherOccupancy[`${d}-${cell}-${candidate.teacher}`] = true;
                        usedSubjectToday[className][d].add(candidate.name);
                        candidate.theoryLeft--;
                    }
                    cell++;
                }

                // --- PRACTICAL LOOP ---
                // (After lunch we will put remaining slots with practical subjects)
                while (cell <= 6) {
                    if (cell === 4) {
                        cell++;
                        continue; // Skip lunch
                    }

                    let totalPracticalHours = workingSubjects[className].reduce((sum, s) => sum + s.practicalLeft, 0);
                    if (totalPracticalHours <= 0) break;

                    // PASS 1: Prefer subjects whose teacher is free in BOTH this cell AND the next cell (safe 2-block placement)
                    let candidates = workingSubjects[className].filter(s => {
                        if (s.practicalLeft <= 0) return false;
                        if (currentTeacherOccupancy[`${d}-${cell}-${s.teacher}`]) return false;
                        if (isLateSubject(s.name) && !canScheduleLate(d, cell)) return false;

                        // For subjects with >= 2 hours left, check if the next slot is also free
                        let nextCell = cell + 1;
                        if (s.practicalLeft >= 2 && nextCell <= 6 && nextCell !== 4) {
                            if (currentTeacherOccupancy[`${d}-${nextCell}-${s.teacher}`]) {
                                return false; // Not safe for a continuous 2-hour block
                            }
                        }
                        return true;
                    });

                    // PASS 2 FALLBACK: If no safe candidate found, place ANY subject that is available
                    // right now (even if it only has 1 hour left). This prevents empty gaps.
                    if (candidates.length === 0) {
                        candidates = workingSubjects[className].filter(s =>
                            s.practicalLeft > 0 &&
                            !currentTeacherOccupancy[`${d}-${cell}-${s.teacher}`] &&
                            (!isLateSubject(s.name) || canScheduleLate(d, cell))
                        );
                    }

                    // Prioritize late subjects in their allowed slots so they don't get starved by regular practicals
                    candidates.sort((a, b) => {
                        let aIsLate = isLateSubject(a.name) ? 1 : 0;
                        let bIsLate = isLateSubject(b.name) ? 1 : 0;
                        if (canScheduleLate(d, cell)) {
                            if (aIsLate !== bIsLate) return bIsLate - aIsLate;
                        }
                        return b.practicalLeft - a.practicalLeft;
                    });

                    if (candidates.length > 0) {
                        let candidate = candidates[0];
                        classSchedules[className][d][cell] = { subject: candidate.name, teacher: candidate.teacher, type: "P" };
                        currentTeacherOccupancy[`${d}-${cell}-${candidate.teacher}`] = true;
                        candidate.practicalLeft--;
                    }
                    cell++;
                }
            }
        });

        // Score this attempt — fewer remaining hours = better
        let remainingHours = 0;
        activeSemesters.forEach(c => {
            workingSubjects[c].forEach(s => {
                remainingHours += s.theoryLeft + s.practicalLeft;
            });
        });

        if (remainingHours < minRemainingHours) {
            minRemainingHours = remainingHours;
            bestSchedules = classSchedules;
            teacherOccupancy = currentTeacherOccupancy;
        }

        if (minRemainingHours === 0) break;
    }

    displayTimetable(bestSchedules, Array.from(activeSemesters));
    showToast("Timetable generated successfully!", "success");
}

function displayTimetable(schedules, activeSems) {
    const container = elements.timetableContainer;
    container.innerHTML = "";

    const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const timeSlots = ["10:30-11:30", "11:30-12:30", "12:30-1:30", "1:30-2:30", "2:30-3:00", "3:00-4:00", "4:00-5:00"];

    activeSems.sort().forEach((sem, index) => {
        const card = document.createElement("div");
        card.className = "timetable-card";
        card.style.animationDelay = `${index * 0.1}s`;

        let html = `
            <div class="timetable-header">
                <h3>Semester ${sem} Timetable</h3>
                <span class="timetable-badge">Generated</span>
            </div>
            <div class="timetable-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Day</th>
                            ${timeSlots.map(t => `<th>${t}</th>`).join("")}
                        </tr>
                    </thead>
                    <tbody>`;

        dayLabels.forEach((dayName, dIndex) => {
            html += `<tr><td>${dayName}</td>`;

            if (schedules[sem] && schedules[sem][dIndex]) {
                schedules[sem][dIndex].forEach((val) => {
                    if (val === "LUNCH") {
                        html += `<td class="lunch-cell">LUNCH</td>`;
                    } else if (val && val.subject) {
                        const typeClass = val.type === "P" ? "practical-cell" : "theory-cell";
                        html += `<td class="${typeClass}">
                            <div class="cell-content">
                                <span class="cell-subject">${val.subject}</span>
                                <span class="cell-teacher">(${val.type}-${val.teacher})</span>
                            </div>
                        </td>`;
                    } else {
                        html += `<td>-</td>`;
                    }
                });
            }
            html += `</tr>`;
        });

        html += `</tbody></table></div>`;
        card.innerHTML = html;
        container.appendChild(card);
    });
}

window.downloadPDF = async function () {
    if (typeof html2canvas === "undefined" || typeof window.jspdf === "undefined") {
        showToast("PDF library failed to load", "error");
        return;
    }

    const btn = elements.downloadBtn;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="loading-spinner"></span> Downloading...';
    btn.disabled = true;

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("l", "pt", "a4");
        const w = pdf.internal.pageSize.getWidth();
        const h = pdf.internal.pageSize.getHeight();

        const timetables = elements.timetableContainer.querySelectorAll(".timetable-card");

        if (timetables.length === 0) {
            showToast("Please generate a timetable first!", "error");
            return;
        }

        for (let i = 0; i < timetables.length; i++) {
            if (i > 0) pdf.addPage();

            const card = timetables[i];
            const canvas = await html2canvas(card, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#1e293b"
            });

            const imgData = canvas.toDataURL("image/png");
            const props = pdf.getImageProperties(imgData);
            const ratio = Math.min(w / props.width, h / props.height);
            const width = props.width * ratio;
            const height = props.height * ratio;

            const x = (w - width) / 2;
            const y = (h - height) / 2;

            pdf.addImage(imgData, "PNG", x, y, width, height);
        }

        pdf.save("timetable.pdf");
        showToast("PDF downloaded!", "success");
    } catch (err) {
        console.error("PDF Error:", err);
        showToast("Failed to generate PDF", "error");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};