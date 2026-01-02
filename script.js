let currentFilter = "all";
let selectedTaskId = null;

// LOAD
window.onload = () => {
  loadTheme();
  renderTasks();

  taskInput.addEventListener("keydown", e => {
    if (e.key === "Enter") addTask();
  });
};

// STORAGE
const getTasks = () => JSON.parse(localStorage.getItem("tasks")) || [];
const saveTasks = t => localStorage.setItem("tasks", JSON.stringify(t));
const getTrash = () => JSON.parse(localStorage.getItem("trash")) || [];
const saveTrash = t => localStorage.setItem("trash", JSON.stringify(t));

// ADD TASK
function addTask(){
  let text = taskInput.value.trim();
  if(!text) return alert("Enter task");

  let tasks = getTasks();
  tasks.push({
    id: Date.now(),          // ✅ UNIQUE ID
    text,
    status:"pending",
    pinned:false
  });

  saveTasks(tasks);
  taskInput.value="";
  renderTasks();
}

// RENDER TASKS
function renderTasks(){
  taskTable.innerHTML="";
  let tasks = getTasks();

  // PINNED FIRST (safe now)
  tasks.sort((a,b)=> (b.pinned === true) - (a.pinned === true));

  let completed=0, pending=0;

  tasks.forEach(task=>{
    task.status==="completed"?completed++:pending++;
    if(currentFilter!=="all" && task.status!==currentFilter) return;

    let row=document.createElement("tr");

    // RIGHT CLICK
    row.oncontextmenu = function(e){
      e.preventDefault();
      selectedTaskId = task.id;   // ✅ USE ID
      showContextMenu(e.pageX, e.pageY);
    };

    row.innerHTML=`
      <td>${task.pinned ? "📌 " : ""}${task.text}</td>
      <td>
        <span class="${task.status}" onclick="toggleStatus(${task.id})">
          ${task.status}
        </span>
      </td>
      <td>
        <span class="edit" onclick="editTask(${task.id})">✏️</span>
      </td>
      <td class="delete" onclick="moveToTrash(${task.id})">🗑</td>
    `;
    taskTable.appendChild(row);
  });

  counter.innerText =
    `Total:${tasks.length} | Pending:${pending} | Completed:${completed}`;

  progressBar.style.width =
    tasks.length ? (completed/tasks.length)*100+"%" : "0%";
}

// HELPERS
function findTaskById(id){
  return getTasks().findIndex(t => t.id === id);
}

// STATUS
function toggleStatus(id){
  let tasks=getTasks();
  let i=findTaskById(id);
  tasks[i].status = tasks[i].status==="pending"?"completed":"pending";
  saveTasks(tasks);
  renderTasks();
}

// EDIT
function editTask(id){
  let tasks=getTasks();
  let i=findTaskById(id);
  let n=prompt("Edit task:",tasks[i].text);
  if(n){
    tasks[i].text=n.trim();
    saveTasks(tasks);
    renderTasks();
  }
}

// MOVE TO TRASH
function moveToTrash(id){
  let tasks=getTasks(), trash=getTrash();
  let i=findTaskById(id);
  trash.push(tasks[i]);
  tasks.splice(i,1);
  saveTasks(tasks);
  saveTrash(trash);
  renderTasks();
}

// TRASH
function showTrash(){
  trashBox.style.display =
    trashBox.style.display==="none"?"block":"none";
  renderTrash();
}

function renderTrash(){
  trashTable.innerHTML="";
  getTrash().forEach((t,i)=>{
    let row=document.createElement("tr");
    row.innerHTML=`
      <td>${t.text}</td>
      <td><button onclick="restoreTask(${i})">Restore</button></td>
    `;
    trashTable.appendChild(row);
  });
}

function restoreTask(i){
  let tasks=getTasks(), trash=getTrash();
  tasks.push(trash[i]);
  trash.splice(i,1);
  saveTasks(tasks);
  saveTrash(trash);
  renderTasks();
  renderTrash();
}

function clearTrash(){
  if(confirm("Clear trash permanently?")){
    localStorage.removeItem("trash");
    renderTrash();
  }
}

// FILTER
function setFilter(f){ currentFilter=f; renderTasks(); }

// CLEAR ALL
function clearAllTasks(){
  if(confirm("Clear all tasks?")){
    localStorage.removeItem("tasks");
    renderTasks();
  }
}

// THEME
function toggleTheme(){
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark")?"dark":"light"
  );
}
function loadTheme(){
  if(localStorage.getItem("theme")==="dark")
    document.body.classList.add("dark");
}

// CONTEXT MENU
function showContextMenu(x,y){
  let menu=document.getElementById("contextMenu");
  menu.style.display="block";
  menu.style.left=x+"px";
  menu.style.top=y+"px";
}

document.addEventListener("click",()=>{
  document.getElementById("contextMenu").style.display="none";
});

function pinTask(){
  let tasks=getTasks();
  let i=tasks.findIndex(t=>t.id===selectedTaskId);
  tasks[i].pinned=true;
  saveTasks(tasks);
  hideMenu();
}

function unpinTask(){
  let tasks=getTasks();
  let i=tasks.findIndex(t=>t.id===selectedTaskId);
  tasks[i].pinned=false;
  saveTasks(tasks);
  hideMenu();
}

function hideMenu(){
  document.getElementById("contextMenu").style.display="none";
  renderTasks();
}
