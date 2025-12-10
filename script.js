let subjectDB = {};

// Fetch JSON file
fetch("college.json")
  .then((res) => res.json())
  .then((data) => {
    subjectDB = data;
    populateCollegeSelect();
  })
  .catch((err) => console.error("Error loading subjects:", err));

// ================================
// Populate college select
// ================================
function populateCollegeSelect() {
  const collegeSelect = document.getElementById("collegeSelect");
  collegeSelect.innerHTML = `<option value="">-- Select College --</option>`;
  Object.keys(subjectDB).forEach((col) => {
    const opt = document.createElement("option");
    opt.value = col;
    opt.textContent = col;
    collegeSelect.appendChild(opt);
  });
  document.getElementById("yearSelect").disabled = true;
  document.getElementById("semSelect").disabled = true;
}

// ================================
// Update main selects when college/year/sem changes
// ================================
function updateAllMainSelects() {
  const filteredSubjects = getFilteredSubjects();

  document.querySelectorAll(".main-group").forEach((group) => {
    const mainSelect = group.querySelector("select:first-child"); // subject
    const gradeSelect = group.querySelector("select:nth-child(2)"); // grade
    const unitSelect = group.querySelector("select:nth-child(3)"); // units

    const prevValue = mainSelect.value;

    // Clear main select and add new options
    mainSelect.innerHTML = "";
    mainSelect.appendChild(new Option("--Select subject--", "", true, true));

    filteredSubjects.forEach((s) => {
      const opt = new Option(s.name, s.name, false, s.name === prevValue);
      mainSelect.appendChild(opt);
    });

    // Keep subject if still exists; otherwise, reset
    if (!filteredSubjects.some((s) => s.name === prevValue)) {
      mainSelect.value = "";
    } else {
      mainSelect.value = prevValue;
    }

    // Always reset grade whenever college/year/sem changes
    gradeSelect.value = "";

    // Update units based on subject
    if (mainSelect.value.includes("PATH-Fit")) unitSelect.value = 2;
    else if (mainSelect.value !== "") unitSelect.value = 3;
    else unitSelect.value = 3;
  });

  updateTotalUnits();
  updateTotalUnitsEntered();
  document.getElementById("resultContainer").textContent = "GWA Result: __";
}

// ================================
// Filter subjects
// ================================
function getFilteredSubjects() {
  const college = document.getElementById("collegeSelect").value;
  const year = document.getElementById("yearSelect").value;
  const sem = document.getElementById("semSelect").value;

  let subjects = [];

  if (!college) {
    subjects = Object.values(subjectDB).flatMap((c) => Object.values(c).flat());
  } else if (college && !year && !sem) {
    subjects = Object.values(subjectDB[college]).flat();
  } else if (college && year && !sem) {
    subjects = Object.entries(subjectDB[college])
      .filter(([k]) => k.startsWith(year + "-"))
      .flatMap(([_, v]) => v);
  } else if (college && year && sem) {
    subjects = subjectDB[college][`${year}-${sem}`] || [];
  }

  return subjects;
}

// ================================
// Disable first option
// ================================
function disableFirstOption(id) {
  const select = document.getElementById(id);
  if (select.options.length) select.options[0].disabled = true;
}

// ================================
// College → Year → Sem logic
// ================================
document.getElementById("collegeSelect").addEventListener("change", () => {
  const college = document.getElementById("collegeSelect").value;
  const yearSelect = document.getElementById("yearSelect");
  const semSelect = document.getElementById("semSelect");

  yearSelect.innerHTML = `<option value="">-- Select Year --</option>`;
  semSelect.innerHTML = `<option value="">-- Select Semester --</option>`;
  semSelect.disabled = true;

  if (!college) {
    yearSelect.disabled = true;
    updateAllMainSelects();
    return;
  }

  disableFirstOption("collegeSelect");

  const years = new Set(
    Object.keys(subjectDB[college]).map((k) => k.split("-")[0])
  );
  years.forEach((y) => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = `Year ${y}`;
    yearSelect.appendChild(opt);
  });

  yearSelect.disabled = false;
  updateAllMainSelects();
});

document.getElementById("yearSelect").addEventListener("change", () => {
  const college = document.getElementById("collegeSelect").value;
  const year = document.getElementById("yearSelect").value;
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
      .filter((k) => k.startsWith(year + "-"))
      .map((k) => k.split("-")[1])
  );

  semesters.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = `Semester ${s}`;
    semSelect.appendChild(opt);
  });

  semSelect.disabled = false;
  updateAllMainSelects();
});

document.getElementById("semSelect").addEventListener("change", () => {
  disableFirstOption("semSelect");
  updateAllMainSelects();
});

// ================================
// Load subjects
// ================================
document.getElementById("loadSubjectsBtn").addEventListener("click", () => {
  const college = document.getElementById("collegeSelect").value;
  const year = document.getElementById("yearSelect").value;
  const sem = document.getElementById("semSelect").value;

  if (!college || !year || !sem) {
    alert("Please select College, Year, and Semester.");
    return;
  }

  const subjects = subjectDB[college][`${year}-${sem}`];
  if (!subjects) {
    alert("No subjects found.");
    return;
  }

  document.querySelectorAll(".main-group").forEach((g) => g.remove());
  subjects.forEach((s) => createMainGroup(s.name, s.units));
});

// ================================
// Main group creation
// ================================
const container = document.getElementById("container");
function createMainGroup(subjectName = "", defaultUnits = 3) {
  const div = document.createElement("div");
  div.className = "main-group";

  const mainSelect = document.createElement("select");
  mainSelect.appendChild(new Option("--Select subject--", "", true, true));
  getFilteredSubjects().forEach((s) => {
    const opt = new Option(s.name, s.name, false, s.name === subjectName);
    mainSelect.appendChild(opt);
  });

  const gradeSelect = document.createElement("select");
  gradeSelect.appendChild(new Option("Enter Grade", "", true, true));
  gradeSelect.options[0].disabled = true;
  [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 4.0, 5.0].forEach((g) =>
    gradeSelect.appendChild(new Option(g, g))
  );

  const unitSelect = document.createElement("select");
  [2, 3].forEach((u) => {
    const opt = new Option(u, u, u === defaultUnits, u === defaultUnits);
    unitSelect.appendChild(opt);
  });

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

  gradeSelect.addEventListener("change", updateTotalUnitsEntered);
  mainSelect.addEventListener("change", () => {
    unitSelect.value = mainSelect.value.includes("PATH-Fit") ? 2 : 3;
    updateTotalUnitsEntered();
    updateTotalUnits();
  });

  updateTotalUnits();
}

// ================================
// Total units
// ================================
function updateTotalUnits() {
  let total = 0;
  document.querySelectorAll(".main-group").forEach((g) => {
    const units = parseFloat(g.querySelector("select:nth-child(3)").value);
    total += units;
  });
  document.getElementById(
    "unitContainer"
  ).textContent = `Total Units: ${total}`;
}

// ================================
// Units entered
// ================================
function updateTotalUnitsEntered() {
  let total = 0;
  document.querySelectorAll(".main-group").forEach((g) => {
    const grade = g.querySelector("select:nth-child(2)").value;
    const units = parseFloat(g.querySelector("select:nth-child(3)").value);
    if (grade !== "") total += units;
  });
  document.getElementById(
    "unitEnteredContainer"
  ).textContent = `Units Occupied: ${total}`;
}

// ================================
// GWA calculation (only when pressing Calculate)
// ================================
function updateGWAResult() {
  let totalUnits = 0,
    totalWeighted = 0;
  document.querySelectorAll(".main-group").forEach((g) => {
    const grade = parseFloat(g.querySelector("select:nth-child(2)").value);
    const units = parseFloat(g.querySelector("select:nth-child(3)").value);
    if (!isNaN(grade) && !isNaN(units)) {
      totalUnits += units;
      totalWeighted += grade * units;
    }
  });

  const result = totalUnits === 0 ? 0 : (totalWeighted / totalUnits).toFixed(2);
  document.getElementById(
    "resultContainer"
  ).textContent = `GWA Result: ${result}`;

  if (result > 0 && result < 2) document.getElementById("alertSound").play();
  else if (result > 0) document.getElementById("alertSound2").play();
}

// ================================
// Buttons
// ================================
document
  .getElementById("addDropdownBtn")
  .addEventListener("click", () => createMainGroup());
document
  .getElementById("calculateGrades")
  .addEventListener("click", () => updateGWAResult());
