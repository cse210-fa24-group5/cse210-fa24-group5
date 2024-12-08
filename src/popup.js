/**
 *initialise storage if empty lists 
 */
function initializeStorage() {
  chrome.storage.local.get(["completed"], (result) => {
    if (!result.completed) {
      chrome.storage.local.set({completed: [] }, () => {
        console.log("Storage initialized with empty completed lists.");
      });
    }
  });
  chrome.storage.local.get([ "todo"], (result) => {
    if (!result.todo ) {
      chrome.storage.local.set({ todo: []}, () => {
        console.log("Storage initialized with empty todo lists.");
      });
    }
  });
}

/**
 * renders the empty state of todo/completed list 
 */
function renderEmptyState(container, message) {
  const emptyMessage = document.createElement("p");
  emptyMessage.textContent = message;
  emptyMessage.classList.add("empty-message");
  container.appendChild(emptyMessage);
}

/**
 * renders the To-do list elements
 */
function renderTodoList(container, items) {
  const EMPTY_TODO_MESSAGE = "No tasks in your To-Do list!";
  console.log("rendering To-do");
  container.innerHTML = ""; 
  if (items[0] == null) {
    renderEmptyState(container, EMPTY_TODO_MESSAGE);
  }
  else{
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

      //Allow users to be redirected to problem in todo if clicked
      button.addEventListener("click", function() {
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
  }
};

/**
 * Renders the completed list items
 */
function renderList(container,items){
  const EMPTY_COMPLETED_MESSAGE = "No tasks completed yet!";
  console.log("rendering completed problems list");
  container.innerHTML = ""; // Clear the existing list
  if (items[0] == null) {
    renderEmptyState(container, EMPTY_COMPLETED_MESSAGE);
  } 
  else{
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

      // Allow users to be redirected to problem page in completed problems, if clicked
      button.addEventListener("click", function() {
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
};

/**
 * fetching the completed and todo-list from storage and rendering them.
 */
function fetchAndRender() {
  const completedList = document.getElementById("completed-list");
  const todoList = document.getElementById("todo-list");
  chrome.storage.local.get(["completed", "todo"], (result) => {
    const completed = result.completed || [];
    const todo = result.todo || [];
    renderList(completedList, completed);
    renderTodoList(todoList, todo);
  });
}

/**
 * Displays either todo page or completes list page based on the event trigger source.
 */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("backToTodo").addEventListener("click", () => {
    document.getElementById("completed-page").style.display = "none";
    document.getElementById("todo-page").style.display = "block";
  });

  document.getElementById("goToCompleted").addEventListener("click", () => {
    document.getElementById("todo-page").style.display = "none";
    document.getElementById("completed-page").style.display = "block";
  });
});

document.addEventListener("DOMContentLoaded", () => {
  initializeStorage()
  fetchAndRender();
  setInterval(fetchAndRender, 5000);
});

function isESModuleSupported() {
  try {
    new Function("import('data:text/javascript,export{}')");
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}
if (isESModuleSupported()) {
  module.exports = { initializeStorage, fetchAndRender, renderTodoList, renderList };
}