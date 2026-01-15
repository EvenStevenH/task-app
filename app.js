// set up elements and start up local storage
let taskArray = [];
let taskInputName = document.getElementById("taskInputName");
let taskInputCategory = document.getElementById("taskInputCategory");
let taskInputDeadline = document.getElementById("taskInputDeadline");
let taskInputStatus = document.getElementById("taskInputStatus");
let addTaskButton = document.getElementById("addTaskButton");
let refreshTaskButton = document.getElementById("refreshTaskButton");
let taskCounter = document.getElementById("task-counter");
let message = document.getElementById("message");
let taskList = document.getElementById("task-list");
document.getElementById("taskInputDeadline").valueAsDate = new Date();
loadTasks();
displayList();

// format date
function formatDate(date) {
	let newDate = new Date(date);
	let year = newDate.getFullYear();
	let month = "" + (newDate.getMonth() + 1);
	let day = "" + newDate.getDate();

	if (month.length < 2) {
		month = "0" + month;
	}
	if (day.length < 2) {
		day = "0" + day;
	}

	return year + "-" + month + "-" + day;
}

// button to add task
addTaskButton.addEventListener("click", function () {
	let taskName = taskInputName.value;
	let taskCategory = taskInputCategory.value;
	let taskDeadline = taskInputDeadline.value;
	let taskStatus = taskInputStatus.value;

	// add to array
	if (!taskName || !taskCategory || !taskDeadline || !taskStatus) {
		return alert("Please complete all fields!");
	}
	let task = {
		name: taskName,
		category: taskCategory,
		deadline: taskDeadline,
		status: taskStatus,
	};
	taskArray.push(task);

	// reset input fields
	taskInputName.value = "";
	taskInputCategory.selectedIndex = 0;
	taskInputStatus.selectedIndex = 0;
	saveTasks();
	displayList();
});

// button to remove task
taskList.addEventListener("click", (event) => {
	if (event.target.classList.contains("removeTaskButton")) {
		let li = event.target.closest("li");
		let index = li.dataset.index;
		li.remove();
		taskArray.splice(index, 1);
		saveTasks();
		displayList();
	}
});

// button to refresh list
refreshTaskButton.addEventListener("click", (event) => {
	displayList();
});

// listen for filter change
document.getElementById("taskFilterStatus").addEventListener("change", displayList);

// display all tasks
function displayList() {
	let filterValue = document.getElementById("taskFilterStatus").value;
	let statusMap = {
		"not-started": "Not Started",
		"in-progress": "In progress",
		canceled: "Canceled",
		done: "Done",
	};
	let filteredArray = filterValue === "all" ? taskArray : taskArray.filter((task) => task.status === statusMap[filterValue]);

	// toggle message for empty list
	message.style.display = filteredArray.length === 0 ? "flex" : "none";

	// task counter
	let taskCount = filteredArray.length;
	document.getElementById("task-counter").innerText = taskCount;

	taskList.innerHTML = "";
	filteredArray.forEach((task) => {
		let index = taskArray.indexOf(task);

		// create list item
		let li = document.createElement("li");
		li.dataset.index = index;
		li.innerHTML = `
			<h3>${task.name}</h3>
			<p>${task.category} — Deadline: 
				<span class="deadline">${task.deadline}
				</span>
			<p>
			<select class="taskItemStatus" data-index="${index}">
				<option value="Not Started">Not Started</option>
				<option value="In progress">In Progress</option>
				<option value="Canceled">Canceled</option>
				<option value="Done">Done</option>
			</select>
			<button class="removeTaskButton">Delete</button>`;

		// assign task status
		let select = li.querySelector(".taskItemStatus");
		select.value = task.status;

		// tasks done on time
		if (task.status === "Done") {
			li.classList.add("task-done");
		}

		// tasks overdue
		if (task.status !== "Done" && task.deadline < formatDate(new Date())) {
			let marker = Object.assign(document.createElement("span"), { className: "overdue-marker" });
			marker.innerHTML = `(Overdue)`;
			li.querySelector(".deadline").appendChild(marker);
		}

		taskList.appendChild(li);
	});
}

// update task status through dropdown
taskList.addEventListener("change", (event) => {
	if (!event.target.classList.contains("taskItemStatus")) return;
	let index = event.target.dataset.index;
	taskArray[index].status = event.target.value;

	saveTasks();
	displayList();
});

// check tasks that have become overdue every minute
setInterval(() => {
	displayList();
}, 60_000);

// local storage functions
function saveTasks() {
	localStorage.setItem("tasks", JSON.stringify(taskArray));
}

function loadTasks() {
	let storedTasks = localStorage.getItem("tasks");
	if (storedTasks) {
		taskArray = JSON.parse(storedTasks);
	}
}
