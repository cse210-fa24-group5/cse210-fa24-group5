document.addEventListener('DOMContentLoaded', () => {
    const completedList = document.getElementById('completed-list');
  
    // Initialize the completion list
    chrome.storage.local.get(['completed'], (result) => {
      const completed = result.completed || [];
      renderList(completedList, completed);
    });
  
    function renderList(container, items) {
      container.innerHTML = ''; // Clear list
      items.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        container.appendChild(li);
      });
    }
  
    // Add new entry to the completed list upon submitting a valid solution
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'submissionSuccess') {
        const { problemTitle } = message;
  
        // Get the current completion list and update
        chrome.storage.local.get(['completed'], (result) => {
          const completed = result.completed || [];
          if (!completed.includes(problemTitle)) {
            completed.push(problemTitle); // Add new topic title
          }
  
          // Save to local storage and update UI
          chrome.storage.local.set({ completed }, () => {
            renderList(completedList, completed);
          });
        });
      }
    });
  });
  