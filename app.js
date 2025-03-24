// Task class to structure each task
class Task {
    constructor(name, description, doDate, dueDate, status = 'pending') {
      this.id = Date.now(); // Unique ID for the task
      this.name = name;
      this.description = description;
      this.doDate = doDate;
      this.dueDate = dueDate || 'None';
      this.status = status; // 'pending' or 'completed'
    }
  }
  
  // References to DOM elements
  const taskForm = document.getElementById('taskForm');
  const taskList = document.getElementById('taskList');
  const searchBar = document.getElementById('searchBar');
  
  // Tasks array initialized from local storage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  
  // Listen for form submissions
  taskForm.addEventListener('submit', addTask);
  
  // Add or update a task
  function addTask(event) {
    event.preventDefault(); // Prevent form submission from reloading the page
    clearErrors();
  
    try {
      const taskId = document.getElementById('taskId').value; // Hidden input for editing
      const name = document.getElementById('taskName').value.trim();
      const description = document.getElementById('taskDescription').value.trim();
      const doDate = document.getElementById('doDate').value;
      const dueDate = document.getElementById('dueDate').value;
  
      // Input validation
      if (!name) throw new Error('Task name is required.');
      if (!description) throw new Error('Task description is required.');
      if (!doDate) throw new Error('Do Date is required.');
      if (dueDate && new Date(dueDate) <= new Date(doDate)) {
        throw new Error('Due Date must be greater than Do Date.');
      }
  
      if (taskId) {
        // Update an existing task
        const index = tasks.findIndex(t => t.id === Number(taskId));
        if (index === -1) throw new Error('Task not found.');
        tasks[index] = new Task(name, description, doDate, dueDate, tasks[index].status);
      } else {
        // Add a new task
        const newTask = new Task(name, description, doDate, dueDate);
        tasks.push(newTask);
      }
  
      saveTasks();
      renderTasks();
      taskForm.reset(); // Clear form inputs
      document.getElementById('taskId').value = ''; // Reset hidden input
    } catch (error) {
      displayError(error.message); // Show validation errors to the user
    }
  }
  
  // Render tasks
  function renderTasks(filteredTasks = tasks) {
    taskList.innerHTML = ''; // Clear task list
  
    if (filteredTasks.length === 0) {
      taskList.innerHTML = '<tr><td colspan="6" style="text-align: center;">No tasks to display.</td></tr>';
      return;
    }
  
    filteredTasks.forEach(task => {
      const row = document.createElement('tr');
      row.classList.add('task', task.status);
      row.innerHTML = `
        <td>${task.status === 'pending' ? '⏳ Pending' : '✅ Completed'}</td>
        <td>${task.name}</td>
        <td>${task.doDate}</td>
        <td>${task.dueDate}</td>
        <td>${task.description}</td>
        <td>
          <button onclick="editTask(${task.id})">Edit</button>
          <button onclick="toggleStatus(${task.id})">Toggle Status</button>
          <button onclick="deleteTask(${task.id})">Delete</button>
        </td>
      `;
      taskList.appendChild(row);
    });
  }
  
  // Toggle task status
  function toggleStatus(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) {
      displayError('Task not found.');
      return;
    }
    task.status = task.status === 'pending' ? 'completed' : 'pending';
    saveTasks();
    renderTasks();
  }
  
  // Edit a task
  function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) {
      displayError('Task not found.');
      return;
    }
    document.getElementById('taskName').value = task.name;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('doDate').value = task.doDate;
    document.getElementById('dueDate').value = task.dueDate === 'None' ? '' : task.dueDate;
    document.getElementById('taskId').value = task.id; // Set hidden input for editing
  }
  
  // Delete a task
  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
  }
  
  // Filter tasks by status
  function filterTasks(status) {
    let filteredTasks;
    if (status === 'all') {
      filteredTasks = tasks;
    } else {
      filteredTasks = tasks.filter(task => task.status === status);
    }
    renderTasks(filteredTasks);
    const taskTable = document.querySelector('table');
    taskTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  // Search tasks by name
function searchTasks() {
    const query = document.getElementById('searchBar').value.trim().toLowerCase();
    const filteredTasks = tasks.filter(task => task.name.toLowerCase().includes(query));
  
    if (filteredTasks.length === 0) {
      taskList.innerHTML = '<tr><td colspan="6" style="text-align: center;">No tasks match your search.</td></tr>';
    } else {
      renderTasks(filteredTasks); // Pass filtered tasks for rendering
    }
  }
  
  
  // Save tasks to local storage
  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  
  // Display error messages
  function displayError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = `Error: ${message}`;
    taskForm.appendChild(errorDiv);
  }
  
  // Clear previous errors
  function clearErrors() {
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());
  }
  
  // Initial rendering of tasks on page load
  renderTasks();
  