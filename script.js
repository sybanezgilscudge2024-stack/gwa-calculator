let subjectDB = {};

console.log("Entered")
// Fetch JSON file
fetch('college.json')
  .then(res => {
      console.log('Fetch response:', res);
      return res.json();
  })
  .then(data => {
      console.log('JSON data:', data);
      subjectDB = data;
      populateCollegeSelect();
  })
  .catch(err => console.error("Error loading subjects:", err));

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

function disableFirstOption(id) {
    const select = document.getElementById(id);
    if (select.options.length) select.options[0].disabled = true;
}

// Event listeners for dynamic select changes
document.getElementById("collegeSelect").addEventListener("change", () => {
    const college = document.getElementById("collegeSelect").value;
    const yearSelect = document.getElementById("yearSelect");
    yearSelect.innerHTML = `<option value="">-- Select Year --</option>`;
    const semSelect = document.getElementById("semSelect");
    semSelect.innerHTML = `<option value="">-- Select Semester --</option>`;
    semSelect.disabled = true;

    if (!college) { yearSelect.disabled = true; updateAllMainSelects(); return; }

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

    if (!year) { semSelect.disabled = true; updateAllMainSelects(); return; }

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

// AUTO-LOAD subjects
document.getElementById("loadSubjectsBtn").addEventListener("click", () => {
    const college = document.getElementById("collegeSelect").value;
    const year = document.getElementById("yearSelect").value;
    const sem = document.getElementById("semSelect").value;

    if (!college || !year || !sem) { alert("Please select College, Year, and Semester."); return; }

    const subjects = subjectDB[college][`${year}-${sem}`];
    if (!subjects) { alert("No subjects found."); return; }

    document.querySelectorAll(".main-group").forEach(g => g.remove());
    subjects.forEach(s => createMainGroup(s.name, s.units));
});

// CREATE MAIN GROUP
const container = document.getElementById('container');

function attachGradeListener(select) {
    select.addEventListener('change', updateTotalUnits);
}

function updateAllMainSelects() {
    document.querySelectorAll('.main-group').forEach(group => {
        const mainSelect = group.querySelector('select:first-child');
        const prev = mainSelect.value;
        mainSelect.innerHTML = `<option value="">--Select subject--</option>`;
        getFilteredSubjects().forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.name;
            opt.textContent = s.name;
            if (s.name === prev) opt.selected = true;
            mainSelect.appendChild(opt);
        });
    });
}

function createMainGroup(subjectName = "", defaultUnits = 3) {
    const div = document.createElement('div');
    div.className = 'main-group';

    const mainSelect = document.createElement('select');
    const defaultOpt = document.createElement('option');
    defaultOpt.value = "";
    defaultOpt.textContent = "--Select subject--";
    mainSelect.appendChild(defaultOpt);

    getFilteredSubjects().forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = s.name;
        if (s.name === subjectName) opt.selected = true;
        mainSelect.appendChild(opt);
    });

    const gradeSelect = document.createElement('select');
    gradeSelect.appendChild(new Option("Enter Grade","",true,true));
    gradeSelect.options[0].disabled = true;
    [1.00,1.25,1.50,1.75,2.00,2.25,2.50,2.75,3.00,4.00,5.00].forEach(g => gradeSelect.appendChild(new Option(g,g)));
    attachGradeListener(gradeSelect);

    const unitSelect = document.createElement('select');
    [2,3].forEach(u => {
        const opt = document.createElement('option');
        opt.value = u;
        opt.textContent = u;
        if (u === defaultUnits) opt.selected = true;
        unitSelect.appendChild(opt);
    });

    mainSelect.addEventListener('change', () => {
        unitSelect.value = mainSelect.value.includes("PATH-Fit") ? 2 : 3;
        updateTotalUnits();
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = "Delete";
    delBtn.onclick = () => { div.remove(); updateTotalUnits(); };

    div.appendChild(mainSelect);
    div.appendChild(gradeSelect);
    div.appendChild(unitSelect);
    div.appendChild(delBtn);

    container.appendChild(div);
    updateTotalUnits();
}

function updateTotalUnits() {
    let total = 0;
    document.querySelectorAll('.main-group').forEach(g => {
        const units = parseFloat(g.querySelectorAll('select')[2].value);
        if (!isNaN(units)) total += units;
    });
    document.getElementById("unitContainer").textContent = `Total Units: ${total}`;
    updateGWAResult();
}

function updateGWAResult() {
    let totalUnits = 0, totalWeighted = 0;
    document.querySelectorAll('.main-group').forEach(g => {
        const selects = g.querySelectorAll("select");
        const grade = parseFloat(selects[1].value);
        const units = parseFloat(selects[2].value);
        if (!isNaN(grade) && !isNaN(units)) { totalUnits += units; totalWeighted += grade*units; }
    });
    const result = totalUnits === 0 ? 0 : (totalWeighted/totalUnits).toFixed(2);
    document.getElementById("resultContainer").textContent = `GWA Result: ${result} | Total Units: ${totalUnits}`;
    if (result>0 && result<2) document.getElementById('alertSound').play();
    else if (result>0) document.getElementById('alertSound2').play();
}

document.getElementById('addDropdownBtn').addEventListener('click', () => createMainGroup());
document.getElementById("calculateGrades").addEventListener("click", () => {
    document.getElementById("resultContainer").textContent = "GWA Result: " + calculateWeightedAverage();
});

function calculateWeightedAverage() {
    let totalUnits = 0, totalWeighted = 0;
    document.querySelectorAll('.main-group').forEach(g => {
        const selects = g.querySelectorAll("select");
        const grade = parseFloat(selects[1].value);
        const units = parseFloat(selects[2].value);
        if (!isNaN(grade) && !isNaN(units)) { totalUnits += units; totalWeighted += grade*units; }
    });
    if (totalUnits === 0) return 0;
    return (totalWeighted/totalUnits).toFixed(2);
}