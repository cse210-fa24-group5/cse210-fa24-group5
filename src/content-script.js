/**
 *  Function to retrieve problem details from the LeetCode page
 */
function InformationRetrieval() {
  const flexTab = document.querySelector(`.flexlayout__tab`);
  const problemElement = flexTab?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0];

  if (!problemElement) {
    console.warn("Problem element not found. The DOM structure may have changed or not loaded yet.");
    return null;
  }

  const problemTextContent = problemElement.textContent || "";
  const problemTitle = problemTextContent.split(". ")[1];
  const problemNumber = problemTextContent.split(". ")[0];
  const problemLink = problemElement.href;
  const problemDifficulty = document.querySelector(`.flexlayout__tab`)?.children?.[0]?.children?.[0]?.children?.[1]?.children?.[0]?.textContent;

  if (!problemTitle || !problemNumber || !problemLink || !problemDifficulty) {
    console.warn("Incomplete problem data. Skipping retrieval.");
    return null;
  }

  return {
    title: problemTitle,
    number: problemNumber,
    link: problemLink,
    difficulty: problemDifficulty,
  };
}

/**
 *  Function to save problem details to local storage
 */
function saveProblemDetails() {
  const problemData = InformationRetrieval();
  if (!problemData) return;

  chrome.storage.local.set({ problem: problemData }, () => {
    console.log("Problem saved to local storage.");
  });
}

/** 
 * Function to automatically save problem details when the page updates 
 */
function autoSaveProblemDetails() {
  saveProblemDetails();

  const observer = new MutationObserver(() => {
    const titleElement = document.querySelector('a.no-underline[href^="/problems/"]');
    if (titleElement) {
      saveProblemDetails();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 *  Event listener for problem submission
 */
document.body.addEventListener("click", (event) => {
  const submitButton = event.target.closest("button");
  if (submitButton && submitButton.textContent.includes("Submit")) {
    saveProblemDetails();
  }
});

/**
 * Observe for submission results to update storage
 */
let handledSubmission = false; 

const observer = new MutationObserver((mutations) => {
  

  const successMessage = document.querySelector('span[data-e2e-locator="submission-result"]');
  if (successMessage && successMessage.textContent.includes("Accepted") && !handledSubmission) {
    handledSubmission = true; 
   

    const problemData = InformationRetrieval();
    if (!problemData) {
      
      return;
    }
    chrome.storage.local.get(["completed", "todo"], (result) => {
      const completed = result.completed || [];
      const todo = result.todo || [];
      if (!completed.some((item) => item.number === problemData.number)) {
        completed.push(problemData);
      } else {
        console.log("Problem already exists in completed list.");
      }

      const updatedTodo = todo.filter((item) => item.number !== problemData.number);
  

      chrome.storage.local.set({ completed, todo: updatedTodo }, () => {
        console.log("Storage updated: problem moved to completed list.");
      });
    });

    observer.disconnect(); 
    console.log("Observer disconnected to prevent duplicate processing.");
  } else if (handledSubmission) {
    console.log("Submission already handled. Skipping.");
  }
});


/**
 * Initialize problem auto-save and observe DOM changes
 */
autoSaveProblemDetails();
module.exports = { InformationRetrieval , saveProblemDetails , autoSaveProblemDetails};
observer.observe(document.body, { childList: true, subtree: true });
