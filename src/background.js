chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "submissionSuccess") {
    const { problemTitle } = message;

    chrome.storage.local.get(["completed", "todo"], (result) => {
      const completed = result.completed || [];
      const todo = result.todo || [];

      if (!completed.includes(problemTitle)) {
        completed.push(problemTitle);
      }
      const updatedTodo = todo.filter((item) => item !== problemTitle);

      chrome.storage.local.set({ completed, todo: updatedTodo }, () => {
        console.log("Background: Storage updated successfully.");
      });
    });
  }
});
