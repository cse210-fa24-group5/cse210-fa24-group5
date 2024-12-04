let currentProblemTitle = "";

function saveProblemTitle() {
  const titleElement = document.querySelector(
    'a.no-underline[href^="/problems/"]',
  );
  if (titleElement) {
    currentProblemTitle = titleElement.textContent
      .trim()
      .replace(/^\d+\.\s/, "");
    console.log(`Saved problem title: ${currentProblemTitle}`);

    chrome.storage.local.set({ currentProblemTitle }, () => {
      console.log(`Stored problem title: ${currentProblemTitle}`);
    });
  } else {
    console.log("Problem title element not found.");
  }
}

function autoSaveProblemTitle() {
  saveProblemTitle();

  const observer = new MutationObserver(() => {
    const titleElement = document.querySelector(
      'a.no-underline[href^="/problems/"]',
    );
    if (titleElement) {
      saveProblemTitle();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  console.log("Observing for problem title...");
}

document.body.addEventListener("click", (event) => {
  const submitButton = event.target.closest("button");
  if (submitButton && submitButton.textContent.includes("Submit")) {
    console.log("Submit button clicked.");
    saveProblemTitle();
  }
});

const observer = new MutationObserver((mutations) => {
  mutations.forEach(() => {
    const successMessage = document.querySelector(
      'span[data-e2e-locator="submission-result"]',
    );
    if (successMessage && successMessage.textContent.includes("Accepted")) {
      console.log("Submission successful.");

      chrome.storage.local.get("currentProblemTitle", (result) => {
        currentProblemTitle = result.currentProblemTitle || "";
        if (!currentProblemTitle) {
          console.warn("No saved problem title found!");
          return;
        }

        chrome.storage.local.get(["completed", "todo"], (result) => {
          const completed = result.completed || [];
          const todo = result.todo || [];

          if (!completed.includes(currentProblemTitle)) {
            completed.push(currentProblemTitle);
          }
          const updatedTodo = todo.filter(
            (item) => item !== currentProblemTitle,
          );

          chrome.storage.local.set({ completed, todo: updatedTodo }, () => {
            console.log("Storage updated successfully.");
          });
        });

        chrome.storage.local.remove("currentProblemTitle", () => {
          console.log("Cleared stored problem title.");
        });
      });
    }
  });
});

autoSaveProblemTitle();

observer.observe(document.body, { childList: true, subtree: true });
console.log("Content script loaded and observing DOM changes.");
