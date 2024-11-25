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

  chrome.storage.local.get(['completed', 'todo'], (result) => {
      const completed = result.completed || [];
      const todo = result.todo || initialTodo;

      if (!result.todo) {
          chrome.storage.local.set({ todo });
      }

      renderList(completedList, completed);
      renderList(todoList, todo);
  });

  function renderList(container, items) {
      container.innerHTML = '';
      items.forEach((item) => {
          const li = document.createElement('li');
          li.textContent = item;
          container.appendChild(li);
      });
  }
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'submissionSuccess') {
          const { problemTitle } = message;

          chrome.storage.local.get(['completed', 'todo'], (result) => {
              const completed = result.completed || [];
              const todo = result.todo || [];

              if (!completed.includes(problemTitle)) {
                  completed.push(problemTitle); 
              }
              console.log(problemTitle);
              const updatedTodo = todo.filter(item => item !== problemTitle);

              chrome.storage.local.set({ completed, todo: updatedTodo }, () => {
                  renderList(completedList, completed);
                  renderList(todoList, updatedTodo);
              });
          });
      }
  });
});
