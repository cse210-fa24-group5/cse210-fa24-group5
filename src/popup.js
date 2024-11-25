document.addEventListener('DOMContentLoaded', () => {
  const completedList = document.getElementById('completed-list');
  const todoList = document.getElementById('todo-list');

  const initialTodo = [
      "Two Sum",
      "Reverse Linked List",
      "Binary Search",
      "Merge Intervals",
      "Longest Substring Without Repeating Characters"
  ];

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

  fetchAndRender();


  setInterval(fetchAndRender, 5000);
});
