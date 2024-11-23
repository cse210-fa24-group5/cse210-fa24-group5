const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      // 查找提交成功的提示元素
      const successMessage = document.querySelector('span.text-green-s.dark\\:text-dark-green-s.text-sm.font-medium');
      if (successMessage && successMessage.textContent.includes('Accepted')) {
        // 提取题目标题
        const titleElement = document.querySelector('a.no-underline[href^="/problems/"]');
        if (titleElement) {
          const problemTitle = titleElement.textContent.trim(); // 提取标题
          console.log(`Submission successful for: ${problemTitle}`);
  
          // 发送消息到扩展的弹窗或后台脚本
          chrome.runtime.sendMessage({
            action: 'submissionSuccess',
            problemTitle,
          });
        }
      }
    });
  });
  
  // 开始观察 DOM 变化
  observer.observe(document.body, { childList: true, subtree: true });
  
  console.log("Content script for LeetCode loaded!");