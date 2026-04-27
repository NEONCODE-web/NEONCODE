/* ================= PAGE SWITCH ================= */
function show(page){
  document.querySelectorAll(".page").forEach(p => p.style.display="none");
  document.getElementById(page).style.display="block";
}

/* ================= AUTH UI ================= */
function updateAuthUI(){
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  let user = JSON.parse(sessionStorage.getItem("user"));

  if(user){
    if(loginBtn) loginBtn.style.display = "none";
    if(logoutBtn) logoutBtn.style.display = "inline-block";
  } else {
    if(loginBtn) loginBtn.style.display = "inline-block";
    if(logoutBtn) logoutBtn.style.display = "none";
  }
}

/* ================= PASSWORD HASH ================= */
async function hashPass(pass){
  const data = new TextEncoder().encode(pass);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2,"0"))
    .join("");
}

/* ================= SIGNUP ================= */
async function signup(){
  let name = signupName.value;
  let email = signupEmail.value;
  let pass = signupPass.value;

  if(!name || !email || !pass){
    signupError.innerText = "All fields required!";
    return;
  }

  if(pass.length < 6){
    signupError.innerText = "Password must be 6+ characters";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  if(users.some(u => u.email === email)){
    signupError.innerText = "Email already exists!";
    return;
  }

  let hashed = await hashPass(pass);

  users.push({name, email, pass: hashed});
  localStorage.setItem("users", JSON.stringify(users));

  show("login");
}

/* ================= LOGIN ================= */
async function login(){
  let email = loginEmail.value;
  let pass = loginPass.value;

  // 👑 Admin
  if(email === "admin@codenova.com" && pass === "admin667"){
    sessionStorage.setItem("user", JSON.stringify({name:"Admin", email}));
    welcomeUser.innerText = "Welcome Admin 👑";
    updateAuthUI();
    show("admin");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  let hashed = await hashPass(pass);

  let found = users.find(u => u.email === email && u.pass === hashed);

  if(found){
    sessionStorage.setItem("user", JSON.stringify(found));
    welcomeUser.innerText = "Welcome " + found.name + " 😊";
    updateAuthUI();
    show("home");
  } else {
    loginError.innerText = "Invalid email or password!";
  }
}

/* ================= LOGOUT ================= */
function logout(){
  sessionStorage.removeItem("user");
  updateAuthUI();
  show("login");
}

/* ================= SAFE CHECK ================= */
function isSafe(code){
  const blocked = [
    "localStorage",
    "sessionStorage",
    "document.cookie",
    "fetch",
    "while(true)",
    "for(;;)"
  ];
  return !blocked.some(word => code.includes(word));
}

/* ================= COMPILER ================= */
function runMultiLang() {
  const code = document.getElementById("code").value;
  const output = document.getElementById("output");
  const ai = document.getElementById("assistantOutput");

  if (!code.trim()) {
    output.innerHTML = "Write some code!";
    return;
  }

  if(!isSafe(code)){
    output.innerHTML = "❌ Unsafe code detected!";
    return;
  }

  try {
    let logs = [];
    const originalLog = console.log;

    console.log = (...args) => logs.push(args.join(" "));

    let result = eval(code);

    console.log = originalLog;

    output.innerHTML =
      logs.join("<br>") ||
      (result !== undefined ? result : "✅ Code executed");

    if(ai) ai.innerHTML = "No errors 👍";

  } catch (e) {
    output.innerHTML = "❌ " + e;

    let err = e.toString().toLowerCase();

    for (let item of kb) {
      for (let word of item.q) {
        if (err.includes(word)) {
          if(ai) ai.innerHTML = item.a;
          return;
        }
      }
    }

    if(ai) ai.innerHTML = "Unknown error.";
  }
}

/* ================= SAVE CODE ================= */
function saveCode(){
  let user = JSON.parse(sessionStorage.getItem("user"));
  if(!user){
    alert("Login first!");
    return;
  }

  let code = document.getElementById("code").value;
  let all = JSON.parse(localStorage.getItem("codes")) || {};

  all[user.email] = code;
  localStorage.setItem("codes", JSON.stringify(all));

  alert("Code saved!");
}

/* ================= LOAD CODE ================= */
function loadCode(){
  let user = JSON.parse(sessionStorage.getItem("user"));
  if(!user){
    alert("Login first!");
    return;
  }

  let all = JSON.parse(localStorage.getItem("codes")) || {};
  document.getElementById("code").value = all[user.email] || "";

  alert("Code loaded!");
}

/* ================= ADMIN ================= */
function loadUsers(){
  let user = JSON.parse(sessionStorage.getItem("user"));

  if(!user || user.email !== "admin@codenova.com"){
    alert("Access denied!");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  let box = document.getElementById("userList");

  if(users.length === 0){
    box.innerHTML = "No users found.";
    return;
  }

  box.innerHTML = users.map(u =>
    `<div>👤 ${u.name} - ${u.email}</div>`
  ).join("");
}

function showStats(){
  let users = JSON.parse(localStorage.getItem("users")) || [];
  alert("Total Users: " + users.length);
}

/* ================= OFFLINE AI ================= */
const kb = [
  { q: ["not defined"], a: "Variable not defined. Use let/const." },
  { q: ["unexpected token"], a: "Syntax error." },
  { q: ["not a function"], a: "Wrong data type." },
  { q: ["undefined"], a: "Value not assigned." },
  { q: ["null"], a: "Object is null." },
  { q: ["nan"], a: "Invalid math operation." }
];

function askAI() {
  const input = userInput.value.toLowerCase();
  const output = assistantOutput;

  if (!input.trim()) {
    output.innerHTML = "Please type something!";
    return;
  }

  for (let item of kb) {
    for (let word of item.q) {
      if (input.includes(word)) {
        output.innerHTML = item.a;
        return;
      }
    }
  }

  output.innerHTML = "Ask about coding errors.";
}

/* ================= SCRIPT WRITER ================= */
function writeScript() {
  const input = scriptInput.value;
  const out = scriptOutput;

  if (!input.trim()) {
    out.innerHTML = "Please describe the scene!";
    return;
  }

  out.innerHTML = `
🎬 Scene Start<br><br>
Narrator: ${input}<br><br>
Something builds...<br>
Suddenly everything changes!<br><br>
🎬 The End
  `;
}

/* ================= AUTO LOGIN ================= */
let user = JSON.parse(sessionStorage.getItem("user"));

updateAuthUI();

if(user){
  if(user.email === "admin@codenova.com"){
    show("admin");
  } else {
    welcomeUser.innerText = "Welcome " + user.name;
    show("home");
  }
} else {
  show("login");
}
function downloadCode(){
  const code = document.getElementById("code").value;

  if(!code.trim()){
    alert("Nothing to download!");
    return;
  }

  const blob = new Blob([code], { type: "text/javascript" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "code.js";

  a.click();
}