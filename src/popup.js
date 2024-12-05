document.addEventListener("DOMContentLoaded", () => {
  const completedList = document.getElementById("completed-list");
  const todoList = document.getElementById("todo-list");

  //default todo list if the initial state is empty
  const initialTodo = [
    {
      title: "Two Sum",
      number: "1",
      link: "https://leetcode.com/problems/two-sum/",
      difficulty: "Easy"
    }
  ];

  //fetching the completed and todo-list from storage and rendering them
  function fetchAndRender() {
    chrome.storage.local.get(["completed", "todo"], (result) => {
      const completed = result.completed || [];
      let todo = result.todo;

      if (!todo || todo.length === 0) {
        todo = initialTodo;
        chrome.storage.local.set({ todo });
        console.log("initial todo", todo);
      }
      // eslint-disable-next-line no-use-before-define
      renderList(completedList, completed);
      // eslint-disable-next-line no-use-before-define
      renderTodoList(todoList, todo);
    });
  }

  //renders the To-do list elements
  function renderTodoList(container, items) {
    console.log("rendering To-do");
    container.innerHTML = ""; // Clear the existing list
    items.forEach((problem) => {
      //created span elements for better CSS handling
      const spanTitle = document.createElement("span");
      const spanNumber = document.createElement("span");
      const spanDifficulty = document.createElement("span");
  
      spanTitle.textContent = problem.title;
      spanNumber.textContent = problem.number;
      spanDifficulty.textContent = problem.difficulty;
  
      const button = document.createElement("button");
      button.appendChild(spanNumber);
      button.appendChild(spanTitle);
      button.appendChild(spanDifficulty);
      // button.addEventListener("click", function() {
      //   console.log("Button clicked for problem:", problem);
      //   console.log("Problem link:", problem.link);
      //   window.location.href = problem.link;
      // });      
      button.classList.add("problem-button");
      //for styling purpose
      if (problem.difficulty === "Easy") {
        button.classList.add("easy-difficulty");
      } else if (problem.difficulty === "Medium") {
        button.classList.add("medium-difficulty");
      } else if (problem.difficulty === "Hard") {
        button.classList.add("hard-difficulty");
      }  
      const removeButton = document.createElement("button");
      removeButton.textContent = "x";
      removeButton.classList.add("remove-button");
      removeButton.addEventListener("click", () => {
        chrome.storage.local.get(["todo"], (result) => {
          const todo = result.todo || [];
          const updatedTodo = todo.filter((currItem) => JSON.stringify(currItem) !== JSON.stringify(problem));
  
          chrome.storage.local.set({ todo: updatedTodo }, () => {
            console.log("Storage updated successfully.");
            fetchAndRender();
          });
        });
      });
  
      const li = document.createElement("li");
      li.appendChild(button);
      li.appendChild(removeButton);
      container.appendChild(li);
    });
  };

  function renderList(container,items){
    console.log("rendering completed problems list");
    container.innerHTML = ""; // Clear the existing list
    items.forEach((problem) => {
      //created span elements for better CSS handling
      const spanTitle = document.createElement("span");
      const spanNumber = document.createElement("span");
      const spanDifficulty = document.createElement("span");
  
      spanTitle.textContent = problem.title;
      spanNumber.textContent = problem.number;
      spanDifficulty.textContent = problem.difficulty;
  
      const button = document.createElement("button");
      button.appendChild(spanNumber);
      button.appendChild(spanTitle);
      button.appendChild(spanDifficulty);
      // button.addEventListener("click", function() {
      //   window.location.href = problem.link;
      // });
      //for styling purpose
      if (problem.difficulty === "Easy") {
        button.classList.add("easy-difficulty");
      } else if (problem.difficulty === "Medium") {
        button.classList.add("medium-difficulty");
      } else if (problem.difficulty === "Hard") {
        button.classList.add("hard-difficulty");
      } 
      button.classList.add("problem-button");
      const li = document.createElement("li");
      li.appendChild(button);
      container.appendChild(li);
    });
  };


  fetchAndRender();
  setInterval(fetchAndRender, 5000);
});
