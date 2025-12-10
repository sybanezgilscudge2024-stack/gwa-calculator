let subjectDB = {};

// Fetch JSON file
fetch('college.json')
  .then(res => res.json())
  .then(data => {
      subjectDB = data;
      populateCollegeSelect();
  })
  .catch(err => console.error("Error loading subjects:", err));

// ================================
// Populate college select
// ================================
function populateCollegeSelect() {
    const collegeSelect = document.getElementById("collegeSelect");
    collegeSelect.innerHTML = `<option value="">-- Select College --</option>`;
    Object.keys(subjectDB).forEach(col => {
        const opt = document.createElement("option");
        opt.value = col;
        opt.textContent = col;
        collegeSelect.appendChild(opt);
    });
    document.getElementById("yearSelect").disabled = true;
    document.getElementById("semSelect").disabled = true;
}
function updateAllMainSelects() {
    const filteredSubjects = getFilteredSubjects(); // get subjects for current college/year/sem

    document.querySelectorAll('.main-group').forEach(group => {
        const mainSelect = group.querySelector('select:first-child'); // the subject select
        const prevValue = mainSelect.value; // store current selection

        mainSelect.innerHTML = ""; // clear options

        // default placeholder
        mainSelect.appendChild(new Option("--Select subject--", "", true, prevValue === ""));

        // add filtered subjects
        filteredSubjects.forEach(s => {
            const opt = new Option(s.name, s.name, false, s.name === prevValue);
            mainSelect.appendChild(opt);
        });

        // reapply unit if subject has changed
        const unitSelect = group.querySelector('select:nth-child(3)');
        if (mainSelect.value.includes("PATH-Fit")) unitSelect.value = 2;
        else if (mainSelect.value !== "") unitSelect.value = 3;
    });

    updateTotalUnits(); // recalc total units after update
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
        subjects = Object.values(subjectDB).flatMap(c => Object.values(c).flat());
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

    const years = new Set(Object.keys(subjectDB[college]).map(k => k.split("-")[0]));
    years.forEach(y => {
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

    const semesters = new Set(Object.keys(subjectDB[college])
        .filter(k => k.startsWith(year + "-"))
        .map(k => k.split("-")[1]));

    semesters.forEach(s => {
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
    if (!subjects) { alert("No subjects found."); return; }

    document.querySelectorAll(".main-group").forEach(g => g.remove());
    subjects.forEach(s => createMainGroup(s.name, s.units));
});

// ================================
// Main group creation
// ================================
const container = document.getElementById('container');
function createMainGroup(subjectName = "", defaultUnits = 3) {
    const div = document.createElement('div');
    div.className = 'main-group';

    // Subject select
    const mainSelect = document.createElement('select');
    mainSelect.appendChild(new Option("--Select subject--", "", true, true));
    getFilteredSubjects().forEach(s => {
        const opt = new Option(s.name, s.name, false, s.name === subjectName);
        mainSelect.appendChild(opt);
    });

    // Grade select
    const gradeSelect = document.createElement('select');
    gradeSelect.appendChild(new Option("Enter Grade", "", true, true));
    gradeSelect.options[0].disabled = true;
    [1.00,1.25,1.50,1.75,2.00,2.25,2.50,2.75,3.00,4.00,5.00].forEach(g => gradeSelect.appendChild(new Option(g,g)));

    // Unit select
    const unitSelect = document.createElement('select');
    [2,3].forEach(u => {
        const opt = new Option(u,u, u===defaultUnits, u===defaultUnits);
        unitSelect.appendChild(opt);
    });

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = "Delete";
    delBtn.onclick = () => { div.remove(); updateTotalUnits(); updateTotalUnitsEntered()};

    // Append elements
    div.appendChild(mainSelect);
    div.appendChild(gradeSelect);
    div.appendChild(unitSelect);
    div.appendChild(delBtn);
    container.appendChild(div);

    // **Update total units whenever grade changes**
    gradeSelect.addEventListener('change', updateTotalUnitsEntered);

    // Update unit when subject changes
    mainSelect.addEventListener('change', () => {
        unitSelect.value = mainSelect.value.includes("PATH-Fit") ? 2 : 3;
        updateTotalUnits();
    });

    // Initial update of total units
    updateTotalUnits();
}


// ================================
// Update total units (only sum units with grade selected)
// ================================
function updateTotalUnits() {
    let total = 0;
    document.querySelectorAll('.main-group').forEach(g => {
        const selects = g.querySelectorAll('select');
        const mainVal = selects[0].value;   // subject selected
        const units = parseFloat(selects[2].value); // unit value

        // sum unit if a subject is selected
            total += units;
        
    });

    document.getElementById("unitContainer").textContent = `Total Units: ${total}`;
    
}



function updateTotalUnitsEntered() {
    let total = 0;
    document.querySelectorAll('.main-group').forEach(g => {
        const selects = g.querySelectorAll('select');
        const mainVal = selects[0].value;   // Subject selected
        const grade = selects[1].value;     // Grade entered
        const units = parseFloat(selects[2].value); // Unit value

        if (mainVal !== "" && grade !== "") {
            total += units;
        }
    });

    document.getElementById("unitEnteredContainer").textContent = `Units Entered: ${total}`;
}



// ================================
// Update GWA dynamically
// ================================
function updateGWAResult() {
    let totalUnits = 0, totalWeighted = 0;
    document.querySelectorAll('.main-group').forEach(g => {
        const selects = g.querySelectorAll("select");
        const mainVal = selects[0].value;
        const grade = parseFloat(selects[1].value);
        const units = parseFloat(selects[2].value);

        if (mainVal !== "" && !isNaN(grade) && !isNaN(units)) {
            totalUnits += units;
            totalWeighted += grade * units;
        }
    });

    const result = totalUnits === 0 ? 0 : (totalWeighted / totalUnits).toFixed(2);
    document.getElementById("resultContainer").textContent = `GWA Result: ${result}`;

    if (result > 0 && result < 2) document.getElementById('alertSound').play();
    else if (result > 0) document.getElementById('alertSound2').play();
}

// ================================
// Buttons
// ================================
document.getElementById('addDropdownBtn').addEventListener('click', () => createMainGroup());
document.getElementById("calculateGrades").addEventListener("click", () => {
    updateGWAResult();
});
