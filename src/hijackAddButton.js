

/**
 * Creates a button in the leetcode page 
 * that adds the current problem to Todo-List/Local Storage
 */
function initializeHijackButton() {
  // How to retrieve the 
  const problemElement = document.querySelector(`.flexlayout__tab`).children[0].children[0].children[0].children[0].children[0].children[0];
  const problemTextContent = problemElement.textContent;

  const problemName = problemTextContent.split(". ")[1];
  const problemNumber = problemTextContent.split(". ")[0];
  const problemLink = problemElement.href;
  const problemDifficulty = checkDifficulty();

  const button = document.createElement("button");
  button.textContent = "+";
  problemElement.appendChild(button);

  button.addEventListener("click", () => {
    chrome.storage.local.get(["todo"], (result) => {
      const todo = result.todo || [];

      // TODO - add problem to todo list as data object
      // const newTask = {
      //   name: problemName,
      //   number: problemNumber,
      //   link: problemLink,
      //   difficulty: problemDifficulty,
      // };
      alert(`Problem ${problemName} #${problemNumber} of difficulty ${problemDifficulty} added to Todo List! Link: ${problemLink}`);
    });
  });
};


/**
 * Initialize button on loading problem
 */
// window.onload = function() {
initializeHijackButton();
// };
