/*
 * EEE Faculty Routine Preference Form
 *
 * STEP 3:
 * After deploying Google Apps Script as a Web App, paste the /exec URL below.
 */
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwEYBXhYIpW_3vB_w8HcEH20oEhi4SF1mzUWQ0tC1NP9klyBXNHtT_qxvm6ge_JSFgnoA/exec";

const faculty = {
  "Professor": [
    "Dr. Syed Iftekhar Ali","Dr. Mohammad Rakibul Islam","Dr. Khondokar Habibul Kabir",
    "Dr. Golam Sarowar","Dr. Mohammad Tawhid Kawser","Dr. Ashik Ahmed",
    "Dr. Rakibul Hasan Sagor","Dr. Nafiz Imtiaz Bin Hamid"
  ],
  "Assistant Professor": [
    "Engr. Muhammad","Dr. Rabiul Al Mahmud","Dr. Mohammad Masum Billah",
    "Fardeen Hasib Mozumder","Nadim Ahmed","Sheikh Montasir Mahbub","Hasan Jamil Apon"
  ],
  "Lecturer": [
    "Ashraful Islam Mridha","Mohd. Abu Bakar Siddique","Sheikh Munim Hussain"
  ],
  "Junior Lecturer": [
    "Anika Rahman Habiba","Mohammad Abrar Kabir","Aseer Imad Keats","Liman Shams",
    "Sumaiya Bashar","Mohammad Aman Ullah","Ahmed Jawad Rashid","Masrur Ibne Ali",
    "Fatema Tasnim Oyshi","Jarin Tasnim Rahman","Sakif Yeaser","Md. Rahib-Bin-Hossain",
    "Abrar Al Shadid Abir","Tabassom Rahman Aishy"
  ]
};

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
const theoryTimes = ["8:00–9:15","9:15–10:30","10:30–11:45","11:45–1:00","2:30–3:45","3:45–5:00"];
const labTimes = ["8:00–10:30","10:30–1:00","2:30–5:00"];

const designation = document.getElementById("designation");
const facultyName = document.getElementById("facultyName");
const labSection = document.getElementById("labSection");
const theoryGridBody = document.querySelector("#theoryGrid tbody");
const labGridBody = document.querySelector("#labGrid tbody");
const theoryCount = document.getElementById("theoryCount");
const labCount = document.getElementById("labCount");
const labCol1Count = document.getElementById("labCol1Count");
const labCol2Count = document.getElementById("labCol2Count");
const labCol3Count = document.getElementById("labCol3Count");
const comments = document.getElementById("comments");
const commentCount = document.getElementById("commentCount");
const form = document.getElementById("routineForm");
const submitButton = document.getElementById("submitButton");
const submitText = document.getElementById("submitText");
const submitSpinner = document.getElementById("submitSpinner");
const formMessage = document.getElementById("formMessage");

function buildGrid(tbody, times, type) {
  tbody.innerHTML = "";
  days.forEach(day => {
    const row = document.createElement("tr");
    const dayCell = document.createElement("td");
    dayCell.textContent = day;
    dayCell.style.fontWeight = "700";
    dayCell.style.color = "#344655";
    row.appendChild(dayCell);

    times.forEach((time, columnIndex) => {
      const cell = document.createElement("td");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "slot";
      button.textContent = time;
      button.dataset.type = type;
      button.dataset.day = day;
      button.dataset.time = time;
      button.dataset.column = String(columnIndex + 1);
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", `${day}, ${time}`);
      button.addEventListener("click", () => {
        button.classList.toggle("selected");
        button.setAttribute("aria-pressed", button.classList.contains("selected") ? "true" : "false");
        updateCounts();
      });
      cell.appendChild(button);
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });
}

function updateFacultyNames() {
  const selectedDesignation = designation.value;
  facultyName.innerHTML = "";

  if (!selectedDesignation) {
    facultyName.disabled = true;
    facultyName.innerHTML = '<option value="">Select designation first</option>';
    labSection.style.display = "none";
    clearLabSelections();
    return;
  }

  facultyName.disabled = false;
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select name";
  facultyName.appendChild(placeholder);

  faculty[selectedDesignation].forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    facultyName.appendChild(option);
  });

  const needsLab = selectedDesignation === "Lecturer" || selectedDesignation === "Junior Lecturer";
  labSection.style.display = needsLab ? "" : "none";
  if (!needsLab) clearLabSelections();
}

function clearLabSelections() {
  document.querySelectorAll("#labGrid .slot.selected").forEach(slot => {
    slot.classList.remove("selected");
    slot.setAttribute("aria-pressed", "false");
  });
  updateCounts();
}

function getSelected(type) {
  return [...document.querySelectorAll(`#${type}Grid .slot.selected`)].map(slot => ({
    day: slot.dataset.day,
    time: slot.dataset.time,
    column: Number(slot.dataset.column)
  }));
}

function updateCounts() {
  const theory = getSelected("theory");
  const lab = getSelected("lab");
  theoryCount.textContent = theory.length;
  labCount.textContent = lab.length;

  const cols = [0,0,0];
  lab.forEach(item => cols[item.column - 1]++);
  labCol1Count.textContent = cols[0];
  labCol2Count.textContent = cols[1];
  labCol3Count.textContent = cols[2];
}

function clearError(id) { document.getElementById(id).textContent = ""; }
function showError(id, message) { document.getElementById(id).textContent = message; }

function clearMessages() {
  formMessage.className = "form-message";
  formMessage.textContent = "";
}

function showMessage(type, message) {
  formMessage.className = `form-message ${type}`;
  formMessage.textContent = message;
  formMessage.scrollIntoView({behavior:"smooth",block:"center"});
}

function validateForm() {
  let valid = true;
  clearMessages();
  ["designationError","facultyNameError","theoryError","labError"].forEach(clearError);

  if (!designation.value) {
    showError("designationError","Please select your designation.");
    valid = false;
  }

  if (!facultyName.value) {
    showError("facultyNameError","Please select your name.");
    valid = false;
  }

  const theory = getSelected("theory");
  if (theory.length < 6) {
    showError("theoryError",`Please select at least 6 theory-course time slots. You have selected ${theory.length}.`);
    valid = false;
  }

  const needsLab = designation.value === "Lecturer" || designation.value === "Junior Lecturer";
  if (needsLab) {
    const lab = getSelected("lab");
    const col1 = lab.filter(x => x.column === 1).length;
    const col3 = lab.filter(x => x.column === 3).length;

    if (lab.length < 6) {
      showError("labError",`Please select at least 6 laboratory time slots. You have selected ${lab.length}.`);
      valid = false;
    } else if (col1 < 1 || col3 < 1) {
      showError("labError","Your laboratory selection must include at least one slot from Column 1 and at least one slot from Column 3.");
      valid = false;
    }
  }
  return valid;
}

function setSubmitting(isSubmitting) {
  submitButton.disabled = isSubmitting;
  submitText.textContent = isSubmitting ? "Submitting..." : "Submit Response";
  submitSpinner.classList.toggle("hidden", !isSubmitting);
}

function collectFormData() {
  const needsLab = designation.value === "Lecturer" || designation.value === "Junior Lecturer";
  return {
    designation: designation.value,
    name: facultyName.value,
    theory: getSelected("theory"),
    lab: needsLab ? getSelected("lab") : [],
    comments: comments.value.trim()
  };
}

async function submitResponse(data) {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) {
    throw new Error("Google Sheets connection is not configured yet.");
  }

  /*
   * Apps Script web apps commonly require no-cors from a static GitHub page.
   * The request is sent to Apps Script; the backend records the response.
   */
  await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {"Content-Type":"text/plain;charset=utf-8"},
    body: JSON.stringify(data)
  });
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!validateForm()) {
    const firstError = document.querySelector(".field-error:not(:empty)");
    if (firstError) firstError.scrollIntoView({behavior:"smooth",block:"center"});
    return;
  }

  setSubmitting(true);

  try {
    await submitResponse(collectFormData());

    showMessage("success","Your response has been submitted successfully. Your PDF record has been saved to the department's Google Drive.");

    form.reset();
    facultyName.disabled = true;
    facultyName.innerHTML = '<option value="">Select designation first</option>';
    labSection.style.display = "none";
    document.querySelectorAll(".slot.selected").forEach(slot => {
      slot.classList.remove("selected");
      slot.setAttribute("aria-pressed","false");
    });
    updateCounts();
    commentCount.textContent = "0";

  } catch (error) {
    showMessage("error", error.message || "Unable to submit the response.");
  } finally {
    setSubmitting(false);
  }
});

designation.addEventListener("change", updateFacultyNames);
comments.addEventListener("input", () => commentCount.textContent = comments.value.length);

buildGrid(theoryGridBody,theoryTimes,"theory");
buildGrid(labGridBody,labTimes,"lab");
labSection.style.display = "none";
updateCounts();
