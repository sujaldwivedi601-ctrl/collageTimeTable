let subjects = [];

document.getElementById("more").addEventListener("click", createOptions);
document.getElementById("generate").addEventListener("click", generateTable);

// ==============================
// CREATE SUBJECT CHECKBOXES
// ==============================
function createOptions() {
  let input = document.getElementById("subjects").value;
  let optionDiv = document.querySelector(".option");

  optionDiv.innerHTML = "";

  subjects = input
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");

  subjects.forEach((sub) => {
    let div = document.createElement("div");

    let strong = document.createElement("strong");
    strong.textContent = sub;

    let theory = document.createElement("input");
    theory.type = "checkbox";
    theory.value = "theory";
    theory.name = sub;

    let practical = document.createElement("input");
    practical.type = "checkbox";
    practical.value = "practical";
    practical.name = sub;

    div.append(strong, "  Theory ", theory, "  Practical ", practical);

    optionDiv.appendChild(div);
  });
}

// ==============================
// GENERATE TIMETABLE
// ==============================
function generateTable() {
  let startTime = Number(document.getElementById("startTime").value);
  let theoryHours = Number(document.getElementById("theTime").value);
  let practicalHours = Number(document.getElementById("priTime").value);

  let thead = document.querySelector("#timeTable thead");
  let tbody = document.querySelector("#timeTable tbody");

  thead.innerHTML = "";
  tbody.innerHTML = "";

  let days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let totalPeriods = 6;

  // ---------- HEADER ----------
 let headerRow = document.createElement("tr");

let firstCell = document.createElement("th");
firstCell.textContent = "Day/Time";
headerRow.appendChild(firstCell);

// Get start time like "09:00"
let time = document.getElementById("startTime").value;
let [h, m] = time.split(":").map(Number);

// Time formatting function
function formatTime(H, M) {
  const ampm = H >= 12 ? "PM" : "AM";
  const displayH = H % 12 || 12;
  const minutes = M.toString().padStart(2, "0");
  return `${displayH}:${minutes} ${ampm}`;
}

for (let i = 0; i < totalPeriods; i++) {

  let th = document.createElement("th");

  let startH = h;
  let startM = m;

  let endH = (h + 1) % 24;   // always +1 hour
  let endM = m;

  th.textContent = `${formatTime(startH, startM)} - ${formatTime(endH, endM)}`;

  headerRow.appendChild(th);

  // move forward 1 hour
  h = endH;
}

thead.appendChild(headerRow);


  // ---------- SEPARATE SUBJECTS ----------
  let theorySubjects = [];
  let practicalSubjects = [];

  subjects.forEach((sub) => {
    let theory = document.querySelector(`input[name="${sub}"][value="theory"]`);
    let practical = document.querySelector(
      `input[name="${sub}"][value="practical"]`,
    );

    if (theory && theory.checked) {
      theorySubjects.push({
        name: sub,
        // remaining: theoryHours
      });
    }

    if (practical && practical.checked) {
      practicalSubjects.push({
        name: sub + " (P)",
        // remaining: practicalHours
      });
    }
  });

  // ==============================
  // FILL TABLE
  // ==============================

  let pIndex = 0;
  days.forEach((day) => {
    let tr = document.createElement("tr");

    let dayCell = document.createElement("td");
    dayCell.textContent = day;
    tr.appendChild(dayCell);

    let filled = 0;

    // 1️⃣ THEORY FIRST (once per subject per day)
    for (let i = 0; i < theorySubjects.length; i++) {
      if (filled >= totalPeriods) break;

      if (theoryHours > 0) {
        let td = document.createElement("td");
        td.textContent = theorySubjects[i].name;
        tr.appendChild(td);

        theoryHours--; // remaining is the theory that we have stored in are arr
        filled++;
      }else{ break } ;
    }

    // 2️⃣ PRACTICAL NEXT
    // let pIndex = 0;

    while (filled < totalPeriods && practicalSubjects.length > 0) {
      if (pIndex === practicalSubjects.length) pIndex = 0;

      if (practicalHours > 0) {
        let td = document.createElement("td");
        td.textContent = practicalSubjects[pIndex].name;
        tr.appendChild(td);

        practicalHours--;
        filled++;
      }else{
                let td = document.createElement("td");
               td.textContent = " ___?___";
               break ;
      }
      pIndex++;


  // // sare prectical ko ek ek bal print kran hai,  to jb sare ho jae to vapas 0 kr do pIndex ko 
  //     if (pIndex >= practicalSubjects.length) {
  //       pIndex = 0;
  //     }

      // stop if all practical finished
      // if (practicalSubjects.every((p) => p.remaining <= 0)) {
      //   break;
      // }
    }

    // 3️⃣ BLANK IF NOTHING LEFT
    while (filled < totalPeriods) {
      let td = document.createElement("td");
      td.textContent = "";
      tr.appendChild(td);
      filled++;
    }

    tbody.appendChild(tr);
  });
}
