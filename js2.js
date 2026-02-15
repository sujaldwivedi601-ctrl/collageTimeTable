document.getElementById("createBtn").addEventListener("click", createSubjects);
document
  .getElementById("generateBtn")
  .addEventListener("click", generateTimetable);

function createSubjects() {
  let input = document.getElementById("subjectsInput").value;
  const subjects = input.split(",").map((s) => s.trim());

  let container = document.getElementById("subjectSection"); //__________________________________________________
  container.innerHTML = "";

  subjects.forEach((sub) => {
    let card = document.createElement("div"); //______________________________________________
    card.className = "subjectCard";

    card.innerHTML = `
            <h3>${sub}</h3>

            <div class="optionRow">
                <input type="checkbox" class="theoryCheck">
                Theory
                <input type="number" class="theoryHours" min="0" value="0" disabled>
            </div>

            <div class="optionRow">
                <input type="checkbox" class="practicalCheck">
                Practical
                <input type="number" class="practicalHours" min="0" value="0" disabled>
            </div>
         `;

    let theoryCheck = card.querySelector(".theoryCheck");
    let theoryInput = card.querySelector(".theoryHours");

    let practicalCheck = card.querySelector(".practicalCheck");
    let practicalInput = card.querySelector(".practicalHours");

    theoryCheck.addEventListener("change", () => {
      theoryInput.disabled = !theoryCheck.checked;
      if (!theoryCheck.checked) theoryInput.value = 0;
    });

    practicalCheck.addEventListener("change", () => {
      practicalInput.disabled = !practicalCheck.checked;
      if (!practicalCheck.checked) practicalInput.value = 0;
    });

    container.appendChild(card);
  });
}

function generateTimetable() {
  let subjectCards = document.querySelectorAll(".subjectCard");
  let theoryArr = [];
  let precticalArr = [];

  subjectCards.forEach((card) => {
    let name = card.querySelector("h3").innerText;
    let theoryChecked = card.querySelector(".theoryCheck").checked;
    let practicalChecked = card.querySelector(".practicalCheck").checked;

    let theoryHours = parseInt(card.querySelector(".theoryHours").value) || 0;
    let practicalHours =
      parseInt(card.querySelector(".practicalHours").value) || 0;

    if (theoryChecked) {
      theoryArr.push({ name: name, Hh: theoryHours });
    }

    if (practicalChecked) {
      precticalArr.push({ name: name, Hh: practicalHours });
    }
  });

  let days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let container = document.getElementById("tableContainer");
  container.innerHTML = "";
  let table = document.createElement("table");

  //-------------------------------------------------------------------------------------------
  let header = "<tr>";
  header += "<th>Day/Time</th>";

  // Get starting time from input
  let time = document.getElementById("startTime").value;

  // Validation
  if (!time) {
    alert("Please select a starting time!");
    return;
  }

  // Convert "HH:MM" into numbers
  let [h, m] = time.split(":").map(Number);

  // Function to format time into AM/PM
  function formatTime(H, M) {
    const ampm = H >= 12 ? "PM" : "AM";
    const displayH = H % 12 || 12;
    const minutes = M.toString().padStart(2, "0");
    return displayH + ":" + minutes + " " + ampm;
  }

  // Number of periods (keep same as your project)
  let totalPeriods = 6;

  // Generate time headers
  for (let i = 1; i <= totalPeriods; i++) {
    let startH = h;
    let startM = m;

    let endH = (h + 1) % 24; // +1 hour duration
    let endM = m;

    header +=
      "<th>" +
      formatTime(startH, startM) +
      " - " +
      formatTime(endH, endM) +
      "</th>";

    h = endH; // move time forward
  }

  header += "</tr>";

  // Print header in table
  table.innerHTML = header; //-----------------------------------------------------------------------

  let tbody = document.createElement("tbody");
  days.forEach((day) => {
    let row = document.createElement("tr");

    let td = document.createElement("td");
    td.textContent = day;
    row.appendChild(td);

    let fill = 0;

    theoryArr.forEach((subj) => {
      if (subj.Hh && fill<4 ) {
        let td = document.createElement("td");
        td.textContent = subj.name;
        row.appendChild(td);
        subj.Hh--;
        fill++;
      }
    });

  let i = 0;
while (fill < 6) {

  // Check if any practical subject still has hours
  let available = precticalArr.some(pri => pri.Hh > 0);
  if (!available) {
    break; // no more practical hours left
  }

  let pri = precticalArr[i];
  if (pri.Hh > 0) {
    let td = document.createElement("td");
    td.textContent = pri.name + "(p)";
    row.appendChild(td);

    pri.Hh--;
    fill++;
  }
  i = (i + 1) % precticalArr.length; // rotate index safely
}


   for(let i=fill; fill<6; i++){
      let td = document.createElement("td");
      td.textContent = "";
      row.appendChild(td);
      fill++;
   }

    tbody.appendChild(row);

  });

  table.appendChild(tbody);
  container.appendChild(table);

}
