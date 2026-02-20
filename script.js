// ---------------------
// The First Impression - Stage 1 Engine
// ---------------------

// NOTE: We use a face-only source to avoid random nature images.
// pravatar is mostly faces and stable for beta.
const FACE_URLS = [
  "https://i.pravatar.cc/320?img=1",
  "https://i.pravatar.cc/320?img=2",
  "https://i.pravatar.cc/320?img=3",
  "https://i.pravatar.cc/320?img=4",
  "https://i.pravatar.cc/320?img=5",
  "https://i.pravatar.cc/320?img=6",
  "https://i.pravatar.cc/320?img=7",
  "https://i.pravatar.cc/320?img=8",
  "https://i.pravatar.cc/320?img=9",
  "https://i.pravatar.cc/320?img=10"
];

// Beta people list (we'll replace with profiles.json later)
const PEOPLE = [
  { name: "Carson", age: 28, salary: 42000, faceIndex: 0 },
  { name: "Michael", age: 46, salary: 98000, faceIndex: 1 },
  { name: "Ashley", age: 33, salary: 74000, faceIndex: 2 },
  { name: "David", age: 52, salary: 121000, faceIndex: 3 },
  { name: "Samantha", age: 24, salary: 61000, faceIndex: 4 }
];

const ROUND_ORDER = ["age", "salary", "name"];

let score = 0;
let person = null;
let roundIndex = 0;

let ageTries = 0;
let salaryTries = 0;
let nameTries = 0;

const MAX_AGE_TRIES = 5;
const MAX_SALARY_TRIES = 5;
const MAX_NAME_TRIES = 6;

function $(id) { return document.getElementById(id); }

function setFeedback(text, cls, shake=false) {
  const fb = $("feedback");
  fb.className = "feedback " + cls;

  // Force animation to replay every time
  fb.classList.remove("shake");
  void fb.offsetWidth;
  if (shake) fb.classList.add("shake");

  fb.textContent = text;
}

function pulseScore() {
  const s = $("score");
  s.classList.remove("pulse");
  void s.offsetWidth;
  s.classList.add("pulse");
}

function floatPoints(text, cls) {
  const el = document.createElement("div");
  el.className = "float " + cls;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

function setReveal(id, value) {
  $(id).textContent = value;
}

function startNewPerson() {
  person = PEOPLE[Math.floor(Math.random() * PEOPLE.length)];
  roundIndex = 0;
  ageTries = 0;
  salaryTries = 0;
  nameTries = 0;

  // Reset reveal panel
  setReveal("rAge", "???");
  setReveal("rSalary", "???");
  setReveal("rName", "???");

  // Set face
  const face = $("face");
  face.src = FACE_URLS[person.faceIndex % FACE_URLS.length] + "&v=" + Date.now();

  setFeedback("GET READY...", "", false);
  renderRound();
  updateScore(0, false);
}

function updateScore(delta, withFX=true) {
  score += delta;
  $("score").textContent = score;

  if (withFX && delta > 0) {
    pulseScore();
    floatPoints("+" + delta, "fb-correct");
  }
}

function renderRound() {
  const round = ROUND_ORDER[roundIndex];
  const area = $("roundArea");

  if (round === "age") {
    area.innerHTML = `
      <h2>AGE ROUND — Guess the age (${ageTries}/${MAX_AGE_TRIES})</h2>
      <div class="controls">
        <input id="ageInput" type="number" placeholder="Enter age" inputmode="numeric" />
        <button id="ageBtn">SUBMIT</button>
      </div>
    `;
    $("ageBtn").onclick = onGuessAge;
    $("ageInput").focus();
    $("ageInput").addEventListener("keydown", (e)=>{ if(e.key==="Enter") onGuessAge(); });

    setFeedback("Higher / Lower • Within 10 = CLOSE", "", false);
    return;
  }

  if (round === "salary") {
    area.innerHTML = `
      <h2>SALARY ROUND — Guess the salary (${salaryTries}/${MAX_SALARY_TRIES})</h2>
      <div class="controls">
        <input id="salaryInput" type="number" placeholder="Enter salary" inputmode="numeric" />
        <button id="salaryBtn">SUBMIT</button>
      </div>
    `;
    $("salaryBtn").onclick = onGuessSalary;
    $("salaryInput").focus();
    $("salaryInput").addEventListener("keydown", (e)=>{ if(e.key==="Enter") onGuessSalary(); });

    setFeedback("Higher / Lower • Within $10,000 = CLOSE", "", false);
    return;
  }

  // NAME (attempt ladder)
  area.innerHTML = `
    <h2>NAME ROUND — 6 tries (${nameTries}/${MAX_NAME_TRIES})</h2>
    <div class="controls">
      <input id="nameInput" type="text" placeholder="Enter first name" autocomplete="off" />
      <button id="nameBtn">SUBMIT</button>
    </div>
    <div style="opacity:.85;margin-top:10px;font-size:14px;">
      Points: 1st–2nd=10, 3rd=8, 4th=6, 5th=4, 6th=2, fail=0
    </div>
  `;
  $("nameBtn").onclick = onGuessName;
  $("nameInput").focus();
  $("nameInput").addEventListener("keydown", (e)=>{ if(e.key==="Enter") onGuessName(); });

  setFeedback("Guess the name!", "", false);
}

function advanceRound() {
  roundIndex++;
  if (roundIndex >= ROUND_ORDER.length) {
    setFeedback("ROUND COMPLETE! 🔥", "fb-correct", false);
    setTimeout(startNewPerson, 1200);
    return;
  }
  renderRound();
}

function onGuessAge() {
  const val = parseInt($("ageInput").value);
  if (Number.isNaN(val)) return;

  ageTries++;

  if (val === person.age) {
    setReveal("rAge", String(person.age));
    updateScore(10);
    setFeedback("✅ EXACT! AGE REVEALED!", "fb-correct", false);
    setTimeout(advanceRound, 950);
    return;
  }

  const diff = Math.abs(val - person.age);

  if (diff <= 10) {
    setFeedback("🔥 CLOSE! (within 10) " + (val < person.age ? "⬆️ HIGHER" : "⬇️ LOWER"), "fb-close", true);
  } else {
    setFeedback(val < person.age ? "⬆️ HIGHER" : "⬇️ LOWER", "fb-wrong", true);
  }

  if (ageTries >= MAX_AGE_TRIES) {
    setReveal("rAge", String(person.age));
    setFeedback("❌ OUT OF GUESSES — AGE: " + person.age, "fb-wrong", false);
    setTimeout(advanceRound, 1100);
  } else {
    renderRound(); // updates try counter, keeps feedback visible
  }
}

function onGuessSalary() {
  const val = parseInt($("salaryInput").value);
  if (Number.isNaN(val)) return;

  salaryTries++;

  if (val === person.salary) {
    setReveal("rSalary", "$" + person.salary.toLocaleString());
    updateScore(10);
    setFeedback("✅ EXACT! SALARY REVEALED!", "fb-correct", false);
    setTimeout(advanceRound, 950);
    return;
  }

  const diff = Math.abs(val - person.salary);

  if (diff <= 10000) {
    setFeedback("💸 CLOSE! (within $10k) " + (val < person.salary ? "⬆️ HIGHER" : "⬇️ LOWER"), "fb-close", true);
  } else {
    setFeedback(val < person.salary ? "⬆️ HIGHER" : "⬇️ LOWER", "fb-wrong", true);
  }

  if (salaryTries >= MAX_SALARY_TRIES) {
    setReveal("rSalary", "$" + person.salary.toLocaleString());
    setFeedback("❌ OUT OF GUESSES — SALARY: $" + person.salary.toLocaleString(), "fb-wrong", false);
    setTimeout(advanceRound, 1100);
  } else {
    renderRound();
  }
}

function onGuessName() {
  const guess = $("nameInput").value.trim();
  if (!guess) return;

  nameTries++;

  if (guess.toLowerCase() === person.name.toLowerCase()) {
    const ladder = [10,10,8,6,4,2];
    const points = ladder[nameTries - 1] || 0;

    setReveal("rName", person.name);
    updateScore(points);
    setFeedback("🎉 NAME CORRECT! +" + points, "fb-correct", false);
    setTimeout(advanceRound, 950);
    return;
  }

  const remaining = MAX_NAME_TRIES - nameTries;

  if (remaining <= 0) {
    setReveal("rName", person.name);
    setFeedback("❌ FAIL — NAME WAS: " + person.name, "fb-wrong", false);
    setTimeout(advanceRound, 1100);
    return;
  }

  setFeedback("❌ WRONG — " + remaining + " TRIES LEFT", "fb-wrong", true);
  renderRound();
}

// Boot
window.addEventListener("load", () => {
  $("score").textContent = "0";
  startNewPerson();
});
