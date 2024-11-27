document.addEventListener('DOMContentLoaded', () => {
  // 获取任务列表和输入框、按钮
  const completedList = document.getElementById('completed-list');
  const todoList = document.getElementById('todo-list');
  const newTaskInput = document.getElementById('new-task'); // 获取输入框
  const addTaskButton = document.getElementById('add-task'); // 获取加号按钮

  const initialTodo = [
      "Two Sum",
      "Reverse Linked List",
      "Binary Search",
      "Merge Intervals",
      "Longest Substring Without Repeating Characters"
  ];

  // 初始化并渲染任务列表
  function fetchAndRender() {
      chrome.storage.local.get(['completed', 'todo'], (result) => {
          const completed = result.completed || [];
          let todo = result.todo;

          if (!todo || todo.length === 0) {
              todo = initialTodo;
              chrome.storage.local.set({ todo });
          }

          renderList(completedList, completed);
          renderList(todoList, todo);
      });
  }

  function renderList(container, items) {
      container.innerHTML = '';
      items.forEach((item) => {
          const li = document.createElement('li');
          li.textContent = item;
          container.appendChild(li);
      });
  }

  // 添加新任务到 To-Do List
  addTaskButton.addEventListener('click', () => {
      const newTask = newTaskInput.value.trim(); // 获取输入框中的值
      if (newTask) {
          chrome.storage.local.get(['todo'], (result) => {
              const todo = result.todo || [];
              if (!todo.includes(newTask)) {
                  todo.push(newTask); // 添加新任务
                  chrome.storage.local.set({ todo }, () => {
                      console.log('New task added:', newTask);
                      renderList(todoList, todo); // 更新显示
                  });
              } else {
                  alert('Task already exists!'); // 防止重复任务
              }
          });
          newTaskInput.value = ''; // 清空输入框
      } else {
          alert('Please enter a task!'); // 提示用户输入
      }
  });

  // 支持按回车键添加任务
  newTaskInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
          addTaskButton.click(); // 模拟点击加号按钮
      }
  });

  fetchAndRender();

  // 每隔5秒刷新一次任务列表
  setInterval(fetchAndRender, 5000);
});