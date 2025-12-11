
// ================================
// Populate college select
// ================================
function populateCollegeSelect() {
  const collegeSelect = document.getElementById("collegeSelect");
  collegeSelect.innerHTML = `<option value="">-- Select Program --</option>`;

  Object.keys(subjectDB).forEach(col => {
    const opt = new Option(col, col);
    collegeSelect.appendChild(opt);
  });

  document.getElementById("yearSelect").disabled = true;
  document.getElementById("semSelect").disabled = true;
}

// ================================
// Update all subject dropdowns dynamically
// ================================
function updateAllMainSelects() {
    const filteredSubjects = getFilteredSubjects();

    document.querySelectorAll('.main-group').forEach(group => {
        const mainSelect  = group.querySelector('select:first-child');
        const gradeSelect = group.querySelector('select:nth-child(2)');
        const unitSelect  = group.querySelector('select:nth-child(3)');

        const prevSubject = mainSelect.value;

        // Build subject dropdown
        mainSelect.innerHTML = "";
        mainSelect.appendChild(new Option("--Select subject--", "", true, true));
        filteredSubjects.forEach(s => {
            mainSelect.appendChild(new Option(s.name, s.name, false, s.name === prevSubject));
        });

        // 🔥 RESET THE GRADE SELECT HERE
        gradeSelect.value = "";              // reset to "Enter Grade"
        gradeSelect.selectedIndex = 0;       // force dropdown to show placeholder

        // 🔥 OPTIONAL: if dropdown's first option must be disabled again
        gradeSelect.options[0].disabled = true;

        // Update unit dynamically
        const subjectData = filteredSubjects.find(s => s.name === mainSelect.value);
        if (subjectData) {
            unitSelect.value = subjectData.units;
        } else {
            unitSelect.value = "";
        }
    });

    updateTotalUnits();
    updateTotalUnitsEntered();
    document.getElementById("resultContainer").textContent = "GWA Result: __";
}


// ================================
// Filter subjects based on selectors
// ================================
function getFilteredSubjects() {
  const college = document.getElementById("collegeSelect").value;
  const year    = document.getElementById("yearSelect").value;
  const sem     = document.getElementById("semSelect").value;

  if (!college) 
    return Object.values(subjectDB).flatMap(c => Object.values(c).flat());

  if (college && !year && !sem)
    return Object.values(subjectDB[college]).flat();

  if (college && year && !sem)
    return Object.entries(subjectDB[college])
      .filter(([k]) => k.startsWith(year + "-"))
      .flatMap(([_, v]) => v);

  if (college && year && sem)
    return subjectDB[college][`${year}-${sem}`] || [];

  return [];
}

// ================================
// Disable first option
// ================================
function disableFirstOption(id) {
  const select = document.getElementById(id);
  if (select.options.length > 0) select.options[0].disabled = true;
}

// ================================
// College → Year → Sem logic
// ================================
document.getElementById("collegeSelect").addEventListener("change", () => {
  const college = document.getElementById("collegeSelect").value;
  const yearSelect = document.getElementById("yearSelect");
  const semSelect  = document.getElementById("semSelect");

  yearSelect.innerHTML = `<option value="">-- Select Year --</option>`;
  semSelect.innerHTML  = `<option value="">-- Select Semester --</option>`;
  semSelect.disabled = true;

  if (!college) {
    yearSelect.disabled = true;
    updateAllMainSelects();
    return;
  }

  disableFirstOption("collegeSelect");

  const years = new Set(Object.keys(subjectDB[college]).map(k => k.split("-")[0]));
  years.forEach(y => yearSelect.appendChild(new Option(`Year ${y}`, y)));

  yearSelect.disabled = false;
  updateAllMainSelects();
});

document.getElementById("yearSelect").addEventListener("change", () => {
  const college = document.getElementById("collegeSelect").value;
  const year    = document.getElementById("yearSelect").value;
  const semSelect = document.getElementById("semSelect");

  semSelect.innerHTML = `<option value="">-- Select Semester --</option>`;

  if (!year) {
    semSelect.disabled = true;
    updateAllMainSelects();
    return;
  }

  disableFirstOption("yearSelect");

  const semesters = new Set(
    Object.keys(subjectDB[college])
      .filter(k => k.startsWith(year + "-"))
      .map(k => k.split("-")[1])
  );

  semesters.forEach(s => semSelect.appendChild(new Option(`Semester ${s}`, s)));

  semSelect.disabled = false;
  updateAllMainSelects();
});

document.getElementById("semSelect").addEventListener("change", () => {
  disableFirstOption("semSelect");
  updateAllMainSelects();
});

// ================================
// Load subjects button
// ================================
document.getElementById("loadSubjectsBtn").addEventListener("click", () => {
  const college = document.getElementById("collegeSelect").value;
  const year    = document.getElementById("yearSelect").value;
  const sem     = document.getElementById("semSelect").value;

  if (!college || !year || !sem) {
    alert("Please select College, Year, and Semester.");
    return;
  }

  const subjects = subjectDB[college][`${year}-${sem}`];
  if (!subjects) {
    alert("No subjects found.");
    return;
  }

  document.querySelectorAll(".main-group").forEach(g => g.remove());
  subjects.forEach(s => createMainGroup(s.name, s.units));


   updateTotalUnitsEntered();
  
});

// ================================
// Create Main Group (subject row)
// ================================
const container = document.getElementById("container");

function createMainGroup(subjectName = "", defaultUnits = "") {
  const div = document.createElement("div");
  div.className = "main-group";

  // SUBJECT SELECT
  const mainSelect = document.createElement("select");
  mainSelect.appendChild(new Option("--Select subject--", "", true, true));
  getFilteredSubjects().forEach(s =>

    mainSelect.appendChild(new Option(s.name, s.name, false, s.name === subjectName))
    


  );

if (mainSelect.value !== "") {
        mainSelect.options[0].disabled = true;
    }

  // GRADE SELECT
  const gradeSelect = document.createElement("select");
  gradeSelect.appendChild(new Option("Enter Grade", "", true, true));
  gradeSelect.options[0].disabled = true;
  [1,1.25,1.5,1.75,2,2.25,2.5,2.75,3,4,5].forEach(g =>
    gradeSelect.appendChild(new Option(g, g))
  );

  // UNIT SELECT (dynamic)
  const unitSelect = document.createElement("select");
  unitSelect.appendChild(new Option("Enter unit", "", true, true));
  unitSelect.options[0].disabled = true;

  for (let i = 1; i <= 10; i++) {
    unitSelect.appendChild(new Option(i, i));
  }

  unitSelect.value = defaultUnits || "";

  // DELETE BUTTON
  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.onclick = () => {
    div.remove();
    updateTotalUnits();
    updateTotalUnitsEntered();
    document.getElementById("resultContainer").textContent = "GWA Result: __";
  };

  div.appendChild(mainSelect);
  div.appendChild(gradeSelect);
  div.appendChild(unitSelect);
  div.appendChild(delBtn);
  container.appendChild(div);

  // Listeners
  gradeSelect.addEventListener("change", updateTotalUnitsEntered);

  unitSelect.addEventListener("change", () => {
    updateTotalUnits();
    updateTotalUnitsEntered();


});






mainSelect.addEventListener("change", () => {
    const subjectData = getFilteredSubjects().find(s => s.name === mainSelect.value);
    unitSelect.value = subjectData ? subjectData.units : "";

    // 🔥 Disable placeholder permanently after choosing a subject
    if (mainSelect.value !== "") {
        mainSelect.options[0].disabled = true;
    }

    updateTotalUnits();
    updateTotalUnitsEntered();
    document.getElementById("resultContainer").textContent = "GWA Result: __";
});


  updateTotalUnits();
}

// ================================
// Total Units
// ================================
function updateTotalUnits() {
  let total = 0;
  document.querySelectorAll(".main-group").forEach(g => {
    const units = parseFloat(g.querySelector("select:nth-child(3)").value);
    if (!isNaN(units)) total += units;
  });
  document.getElementById("unitContainer").textContent = `Total Units: ${total}`;
}

// ================================
// Units Entered (grade selected)
// ================================
function updateTotalUnitsEntered() {
  let total = 0;
  document.querySelectorAll(".main-group").forEach(g => {
    const grade = g.querySelector("select:nth-child(2)").value;
    const units = parseFloat(g.querySelector("select:nth-child(3)").value);
    if (grade !== "" && !isNaN(units)) total += units;
  });
  document.getElementById("unitEnteredContainer").textContent = `Units Occupied: ${total}`;
}

// ================================
// GWA Calculation
// ================================
function updateGWAResult() {
  let totalUnits = 0;
  let totalWeighted = 0;

  document.querySelectorAll(".main-group").forEach(g => {
    const grade = parseFloat(g.querySelector("select:nth-child(2)").value);
    const units = parseFloat(g.querySelector("select:nth-child(3)").value);

    if (!isNaN(grade) && !isNaN(units)) {
      totalUnits += units;
      totalWeighted += grade * units;
    }
  });

  const result = totalUnits === 0 ? 0 : (totalWeighted / totalUnits).toFixed(3);

  document.getElementById("resultContainer").textContent = `GWA Result: ${result}`;

  const r = parseFloat(result);

  if (r >= 1 && r < 1.5)      document.getElementById("alertSound1").play();
  else if (r >= 1.5 && r < 2) document.getElementById("alertSound2").play();
  else if (r >= 2 && r < 2.5) document.getElementById("alertSound3").play();
  else if (r >= 2.5)          document.getElementById("alertSound4").play();
}

// ================================
// Buttons
// ================================
document.getElementById("addDropdownBtn").addEventListener("click", () => createMainGroup());
document.getElementById("calculateGrades").addEventListener("click", updateGWAResult);
