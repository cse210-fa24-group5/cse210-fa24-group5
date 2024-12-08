//Displays either todo page or completes list page based on the event trigger source.
document.getElementById("backToTodo").addEventListener("click", () => {
  document.getElementById("completed-page").style.display = "none";
  document.getElementById("todo-page").style.display = "block";
});
document.getElementById("goToCompleted").addEventListener("click", () => {
  document.getElementById("todo-page").style.display = "none";
  document.getElementById("completed-page").style.display = "block";
});

document.addEventListener("DOMContentLoaded", () => {
  const completedList = document.getElementById("completed-list");
  const todoList = document.getElementById("todo-list");

  const EMPTY_TODO_MESSAGE = "No tasks in your To-Do list!";
  const EMPTY_COMPLETED_MESSAGE = "No tasks completed yet!";

  function initializeStorage() {
    chrome.storage.local.get(["completed"], (result) => {
      if (!result.completed) {
        chrome.storage.local.set({ completed: [] }, () => {
          console.log("Storage initialized with empty completed lists.");
        });
      }
    });
    chrome.storage.local.get(["todo"], (result) => {
      if (!result.todo) {
        chrome.storage.local.set({ todo: [] }, () => {
          console.log("Storage initialized with empty todo lists.");
        });
      }
    });
    chrome.storage.local.get(["mins"], (result) => {
      if (!result.mins) {
        chrome.storage.local.set({ mins: [20, 40, 60] }, () => {
          console.log("Storage initialized with 20, 40, 60 minutes.");
        });
      }
    });
  }

  //fetching the completed and todo-list from storage and rendering them.
  function fetchAndRender() {
    chrome.storage.local.get(["completed", "todo"], (result) => {
      const completed = result.completed || [];
      let todo = result.todo;
      renderList(completedList, completed);
      renderTodoList(todoList, todo);
    });
  }

  //renders the To-do list elements
  function renderTodoList(container, items) {
    console.log("rendering To-do");
    container.innerHTML = ""; // Clear the existing list
    if (items.length === 0) {
      renderEmptyState(container, EMPTY_TODO_MESSAGE);
    } else {
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

        // Allow users to be redirected to problem in todo if clicked
        button.addEventListener("click", function () {
          console.log("Button clicked for problem:", problem);
          console.log("Problem link:", problem.link);
          window.open(problem.link, "_blank");
        });

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
            const updatedTodo = todo.filter(
              (currItem) =>
                JSON.stringify(currItem) !== JSON.stringify(problem),
            );

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
    }
  }

  //Renders the completed list items
  function renderList(container, items) {
    console.log("rendering completed problems list");
    container.innerHTML = ""; // Clear the existing list
    if (items.length === 0) {
      renderEmptyState(container, EMPTY_COMPLETED_MESSAGE);
    } else {
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

        // Allow users to be redirected to problem in completed problems if clicked
        button.addEventListener("click", function () {
          console.log("Button clicked for problem:", problem);
          console.log("Problem link:", problem.link);
          window.open(problem.link, "_blank");
        });

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
    }
  }

  // renders the empty state of todo/completed list
  function renderEmptyState(container, message) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = message;
    emptyMessage.classList.add("empty-message");
    container.appendChild(emptyMessage);
  }

  initializeStorage();
  fetchAndRender();
  setInterval(fetchAndRender, 5000);
});
