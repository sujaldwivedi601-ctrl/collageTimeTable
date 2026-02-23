

// -------------------- BASIC SETTINGS --------------------

const classes = ["I", "III", "V"];
const days = 6;
const periods = 7; // 6 subjects + 1 lunch (5th position)

let classSubjects = {
  I: [],
  III: [],
  V: [],
};

let teachers = [];
let assignments = [];

// -------------------- SHUFFLE FUNCTION --------------------

function shuffle(arr) {
  let a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(H, M) {
  const ampm = H >= 12 ? "PM" : "AM";
  const displayH = H % 12 || 12;
  const minutes = M.toString().padStart(2, "0");
  return displayH + ":" + minutes + " " + ampm;
}

// -------------------- EVENT LISTENERS --------------------

document.getElementById("addSubjectBtn").addEventListener("click", addSubject);

document.getElementById("addTeacherBtn").addEventListener("click", addTeacher);

document
  .getElementById("assignTeacherBtn")
  .addEventListener("click", assignTeacher);

document
  .getElementById("generateBtn")
  .addEventListener("click", generateTimetable);

document
  .getElementById("assignClass")
  .addEventListener("change", updateSubjectDropdown);

// -------------------- FUNCTIONS --------------------

function addSubject() {
  let className = document.getElementById("subjectClass").value;
  const subjectNameInput = document.getElementById("subjectName");
  const theoryHoursInput = document.getElementById("theoryHours");
  const practicalHoursInput = document.getElementById("practicalHours");

  let name = subjectNameInput.value.trim();
  let theory = parseInt(theoryHoursInput.value) || 0;
  let practical = parseInt(practicalHoursInput.value) || 0;

  if (!name) return alert("Enter subject name");

  classSubjects[className].push({
    name,
    total: theory + practical,
  });

  const li = document.createElement("li");
  li.textContent = `Class ${className} - ${name} (${theory + practical} hrs)`;
  document.getElementById("subjectList").appendChild(li);

  updateSubjectDropdown();

  subjectNameInput.value = "";
  theoryHoursInput.value = "";
  practicalHoursInput.value = "";
}

function addTeacher() {
  const teacherNameInput = document.getElementById("teacherName");
  const name = teacherNameInput.value.trim();

  if (!name) return alert("Enter teacher name");

  teachers.push(name);

  const li = document.createElement("li");
  li.textContent = name;
  document.getElementById("teacherList").appendChild(li);

  updateTeacherDropdown();

  teacherNameInput.value = "";
}

function updateSubjectDropdown() {
  const className = document.getElementById("assignClass").value;
  const subjectSelect = document.getElementById("assignSubject");

  subjectSelect.innerHTML = "";

  classSubjects[className].forEach((s) => {
    const option = document.createElement("option");
    option.value = s.name;
    option.textContent = s.name;
    subjectSelect.appendChild(option);
  });
}

function updateTeacherDropdown() {
  const teacherSelect = document.getElementById("assignTeacher");
  teacherSelect.innerHTML = "";

  teachers.forEach((t) => {
    const option = document.createElement("option");
    option.value = t;
    option.textContent = t;
    teacherSelect.appendChild(option);
  });
}

function assignTeacher() {
  const className = document.getElementById("assignClass").value;
  const subject = document.getElementById("assignSubject").value;
  const teacher = document.getElementById("assignTeacher").value;

  if (!subject || !teacher) {
    return alert("Select subject and teacher");
  }

  assignments.push({ className, subject, teacher });

  const li = document.createElement("li");
  li.textContent = `Class ${className} - ${subject} -> ${teacher}`;
  document.getElementById("assignmentList").appendChild(li);
}

function createEmptyGrid() {
  return Array(days)
    .fill(null)
    .map(() => Array(periods).fill(null));
}

// -------------------- MAIN GENERATOR --------------------

function generateTimetable() {
  let classSchedules = {};
  let teacherSchedules = {};

  classes.forEach((c) => (classSchedules[c] = createEmptyGrid()));
  teachers.forEach((t) => (teacherSchedules[t] = createEmptyGrid()));

  assignments.forEach((assign) => {
    const subjectObj = classSubjects[assign.className].find(
      (s) => s.name === assign.subject,
    );

    if (!subjectObj) return;

    let hoursLeft = subjectObj.total;

    while (hoursLeft > 0) {
      let placed = false;

      // Shuffle days for better distribution
      let shuffledDays = shuffle([...Array(days).keys()]);

      for (let d of shuffledDays) {
        let shuffledPeriods = shuffle([...Array(periods).keys()]);

        for (let p of shuffledPeriods) {
          // Skip Lunch Slot (5th period = index 4)
          if (p === 4) continue;

          if (
            classSchedules[assign.className][d][p] === null &&
            teacherSchedules[assign.teacher][d][p] === null
          ) {
            classSchedules[assign.className][d][p] =
              `${assign.subject} (${assign.teacher})`;

            teacherSchedules[assign.teacher][d][p] = assign.className;

            hoursLeft--;
            placed = true;
            break;
          }
        }

        if (placed) break;
      }

      if (!placed) {
        alert("Not enough space without teacher collision.");
        return;
      }
    }
  });

  // Add Lunch After 4th Period
  classes.forEach((c) => {
    for (let d = 0; d < days; d++) {
      classSchedules[c][d][4] = "LUNCH";
    }
  });

  displayTimetable(classSchedules);}

// -------------------- DISPLAY FUNCTION --------------------

function displayTimetable(classSchedules) {
  const container = document.getElementById("timetableContainer");
  container.innerHTML = "";

  classes.forEach((c) => {
    container.innerHTML += `<h2>sem ${c}</h2>`;

    let h = 10;
    let m = 30;
    let totalPeriods = periods - 1;
    let lunchAfter = 4;

    let header = "<table border='1'><tr><th>Day/Time</th>";

    for (let i = 1; i <= totalPeriods; i++) {
      // Start time
      let startH = h;
      let startM = m;

      // Add 60 minutes
      m += 60;
      if (m >= 60) {
        h += Math.floor(m / 60);
        m %= 60;
      }

      let endH = h;
      let endM = m;

      header +=
        "<th>" +
        formatTime(startH, startM) +
        " - " +
        formatTime(endH, endM) +
        "</th>";

      // Insert Lunch
      if (i === lunchAfter) {
        let lunchStartH = h;
        let lunchStartM = m;

        m += 30; // 30 min lunch

        if (m >= 60) {
          h += 1;
          m -= 60;
        }

        header +=
          "<th>" +
          formatTime(lunchStartH, lunchStartM) +
          " - " +
          formatTime(h, m) +
          " </th>";
      }
    }

    header += "</tr>";

    header += "</tr>";

    // Build real <table> from header HTML string
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = header + "</table>";
    const tableEl = tempDiv.querySelector("table");
    const tbody =
      tableEl.tBodies[0] ||
      tableEl.appendChild(document.createElement("tbody"));

    const dayNames = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    dayNames.forEach((day, dIndex) => {
      let row = document.createElement("tr");

      // First cell: day name
      let tdDay = document.createElement("td");
      tdDay.textContent = day;
      row.appendChild(tdDay);

      let fill = 0;
      const dayRow = classSchedules[c][dIndex];

      // Fill up to 4 periods (skip original lunch index 4)
      for (let p = 0; p < periods && fill < 4; p++) {
        if (p === 4) continue; // lunch index from generator

        const val = dayRow[p];
        let td = document.createElement("td");
        td.textContent = val && val !== "LUNCH" ? val : "";
        row.appendChild(td);
        fill++;
      }

      // Insert lunch cell at logical position 4
      if (fill === 4) {
        let tdo = document.createElement("td");
        tdo.textContent = "lunch";
        row.appendChild(tdo);
        fill++;
      }

      // Fill remaining periods up to index 6 (again skipping original lunch index)
      let pIndex = 0;
      while (fill <= 6 && pIndex < periods) {
        if (fill === 4) {
          let tdo = document.createElement("td");
          tdo.textContent = "lunch";
          row.appendChild(tdo);
          fill++;
          continue;
        }

        if (pIndex === 4) {
          pIndex++;
          continue; // original lunch cell
        }

        const val = dayRow[pIndex];
        let td = document.createElement("td");
        td.textContent = val && val !== "LUNCH" ? val : "";
        row.appendChild(td);
        fill++;
        pIndex++;
      }












      // Pad remaining cells up to total periods
      while (fill < periods) {
        let td = document.createElement("td");
        td.textContent = "";
        row.appendChild(td);
        fill++;
      }

      tbody.appendChild(row);
    });

    container.appendChild(tableEl);
  });
}
//>>>>>>> REPLACE





//   days.forEach((day) => {

//     let row = document.createElement("tr");
//     let td = document.createElement("td");
//     td.textContent = day;
//     row.appendChild(td);

//     let fill = 0;
//     theoryArr.forEach((subj) => {
//       if (subj.Hh && fill<4 ) {
//         let td = document.createElement("td");
//         td.textContent = subj.name;
//         row.appendChild(td);
//         subj.Hh--;0
//         fill++;
//       }
//     });

// if (fill == 4) {
//     let tdo = document.createElement("td");
//         tdo.textContent = "lunch";
//         row.appendChild(tdo);
//         fill++ ;
// }
//   let i = 0;
// while (fill <= 6) {

//   if (fill == 4) {
//     let tdo = document.createElement("td");
//         tdo.textContent = "lunch";
//         row.appendChild(tdo);
//         fill++;
// }

//   // Check if any practical subject still has hours
//   let available = precticalArr.some(pri => pri.Hh > 0);
//   if (!available) {
//     break; // no more practical hours left
//   }

//   let pri = precticalArr[i];
//   if (pri.Hh > 0) {
//     let td = document.createElement("td");
//     td.textContent = pri.name + "(p)";
//     row.appendChild(td);

//     pri.Hh--;
//     fill++;
//   }
//   i = (i + 1) % precticalArr.length; // rotate index safely
// }


//    for(let i=fill; fill<7; i++){
//       let td = document.createElement("td");
//       td.textContent = "";
//       row.appendChild(td);
//       fill++;
//    }

//     tbody.appendChild(row);


//     theoryArr = shuffle(theoryArr);
//     precticalArr = shuffle(precticalArr) ;
  
//   });

//   table.appendChild(tbody);
//   container.appendChild(table);

// }
