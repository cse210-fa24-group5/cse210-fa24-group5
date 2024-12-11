/**
 * Retrieves the problem details from the LeetCode page.
 */
function InformationRetrieval() {
  const problemElement =
    document.querySelector(`.flexlayout__tab`)?.children[0]?.children[0]
      ?.children[0]?.children[0]?.children[0]?.children[0];
  if (!problemElement) return null;

  const problemTextContent = problemElement.textContent;
  const problemTitle = problemTextContent.split(". ")[1];
  const problemNumber = problemTextContent.split(". ")[0];
  const problemLink = problemElement.href;
  const problemDifficulty =
    document.querySelector(`.flexlayout__tab`)?.children[0]?.children[0]
      ?.children[1]?.children[0]?.textContent;
  return {
    title: problemTitle,
    number: problemNumber,
    link: problemLink,
    difficulty: problemDifficulty,
  };
}

/**
 * Adds a "+" button next to the problem title that adds the problem to the Todo List.
 */
function initializeHijackButton() {
  const problemData = InformationRetrieval();
  if (!problemData) return;

  const { title, number, link, difficulty } = problemData;
  const problemElement = document.querySelector(`.flexlayout__tab`)?.children[0]?.children[0]?.children[0]?.children[0]?.children[0]?.children[0];

  // Check if the button is already added
  if (problemElement.querySelector(".add-todo-btn")) return;

  const button = document.createElement("button");
  button.textContent = "+";
  button.className = "add-todo-btn"; // Add a class to identify the button
  problemElement.appendChild(button);

  button.addEventListener("click", () => {
    chrome.storage.local.get(["todo", "completed"], (result) => {
      const completed = result.completed || [];
      const todo = result.todo || [];

      const newTask = {
        title: title,
        number: number,
        link: link,
        difficulty: difficulty,
      };

      // Check if the task is already in the completed list
      if (completed.some(task => task.number === number)) {
        console.log("This problem is already completed!");
        return;
      }

      // Check if the task is already in the todo list
      if (!todo.some(task => task.number === number)) {
        todo.push(newTask);
        chrome.storage.local.set({ todo }, () => {
          console.log(`Problem ${title} #${number} of difficulty ${difficulty} added to Todo List! Link: ${link}`);
        });
      } else {
        console.log("This problem is already in the Todo List!");
      }
    });
  });
}


/**
 * Watches for changes in the DOM to detect when a new problem page is loaded.
 */
function observeProblemPage() {
  const targetNode = document.body;
  const config = { childList: true, subtree: true };

  const callback = (mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        // Initialize the button whenever the problem page changes
        initializeHijackButton();
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}

/**
 *  Start observing for DOM changes
 */
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
  module.exports = {
    InformationRetrieval,
    initializeHijackButton,
    observeProblemPage,
  };
}
observeProblemPage();