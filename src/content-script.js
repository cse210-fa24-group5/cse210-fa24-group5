//storing the problem details as an object
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

let problem = new Object();
const { title, number, link, difficulty } = InformationRetrieval();
problem = { title, number, link, difficulty};

//saving the current problem to local storage
function saveProblemDetails() {
  if(problem.number){
    chrome.storage.local.set({ problem: { ...problem } }, () => {
      console.log("Stored problem:", problem);
    });
  } else {
    console.log("Problem not found.");
  }
}

function autoSaveProblemDetails() {
  saveProblemDetails();
  const observer = new MutationObserver(() => {
    const titleElement = document.querySelector(
      'a.no-underline[href^="/problems/"]',
    );
    if (titleElement) {
      saveProblemDetails();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  console.log("Observing for problem details...");
}

//
document.body.addEventListener("click", (event) => {
  const submitButton = event.target.closest("button");
  if (submitButton && submitButton.textContent.includes("Submit")) {
    console.log("Submit button clicked.");
    saveProblemDetails();
  }
});

//On accepted submission removes problem from to-do list and adds to completed problems list
const observer = new MutationObserver((mutations) => {
  mutations.forEach(() => {
    const successMessage = document.querySelector(
      'span[data-e2e-locator="submission-result"]',
    );
    if (successMessage && successMessage.textContent.includes("Accepted")) {
      console.log("Submission successful.");

      chrome.storage.local.get("problem", (result) => {
        const savedProblem = result.problem || null;
        if (!savedProblem) {
          console.warn("No saved problem found!");
          return;
        }

        chrome.storage.local.get(["completed", "todo"], (result) => {
          const completed = result.completed || [];
          const todo = result.todo || [];
          if (!completed.some(item => item.number === savedProblem.number)) {
            completed.push(savedProblem);
          }
          const updatedTodo = todo.filter(item => item.number !== savedProblem.number);

          chrome.storage.local.set({ completed, todo: updatedTodo }, () => {
            console.log("Storage updated successfully.");
          });
        });
        chrome.storage.local.remove(problem, () => {
          console.log("Cleared stored current problem");
        });
      });
    }
  });
});

autoSaveProblemDetails();

observer.observe(document.body, { childList: true, subtree: true });
console.log("Content script loaded and observing DOM changes.");
