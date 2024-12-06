/**
 * Creates a button in the leetcode page 
 * that adds the current problem to Todo-List/Local Storage
 */
// How to retrieve the Problem Details
function InformationRetrieval(){
  const problemElement = document.querySelector(`.flexlayout__tab`).children[0].children[0].children[0].children[0].children[0].children[0];
  const problemTextContent = problemElement.textContent;

  const problemTitle = problemTextContent.split(". ")[1];
  const problemNumber = problemTextContent.split(". ")[0];
  const problemLink = problemElement.href;
  const problemDifficulty = document.querySelector(`.flexlayout__tab`).children[0].children[0].children[1].children[0].textContent;
  return {
    title: problemTitle,
    number: problemNumber,
    link: problemLink,
    difficulty: problemDifficulty
  };
}

//Overlays a + button near the problem title which adds problem to todo list.
function initializeHijackButton() {
  const { title, number,  link, difficulty } = InformationRetrieval();
  const problemElement = document.querySelector(`.flexlayout__tab`).children[0].children[0].children[0].children[0].children[0].children[0];
  const button = document.createElement("button");
  button.textContent = "+";
  problemElement.appendChild(button);

  button.addEventListener("click", () => {
    chrome.storage.local.get(["todo"], (result) => {
      const todo = result.todo || [];
      const newTask = {
        title: title,
        number: number,
        link: link,
        difficulty: difficulty,
      };
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
};


/**
 * Initialize button on loading problem
 */
window.onload = function() {
initializeHijackButton();
};
