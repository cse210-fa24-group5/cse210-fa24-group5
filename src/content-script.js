const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
   
      const successMessage = document.querySelector('span.text-green-s.dark\\:text-dark-green-s.text-sm.font-medium');
      if (successMessage && successMessage.textContent.includes('Accepted')) {
    
        const titleElement = document.querySelector('a.no-underline[href^="/problems/"]');
        if (titleElement) {
          let problemTitle = titleElement.textContent.trim();
          problemTitle = problemTitle.replace(/^\d+\.\s/, '');
          console.log(`Submission successful for: ${problemTitle}`);
  
  
          chrome.runtime.sendMessage({
            action: 'submissionSuccess',
            problemTitle,
          });
        }
      }
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  console.log("Content script for LeetCode loaded!");