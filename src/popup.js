document.addEventListener('DOMContentLoaded', () => {
    const completedList = document.getElementById('completed-list');
  
    // 初始化完成列表
    chrome.storage.local.get(['completed'], (result) => {
      const completed = result.completed || [];
      renderList(completedList, completed);
    });
  
    // 渲染列表
    function renderList(container, items) {
      container.innerHTML = ''; // 清空列表
      items.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        container.appendChild(li);
      });
    }
  
    // 监听来自 content-script 的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'submissionSuccess') {
        const { problemTitle } = message;
  
        // 获取当前完成列表并更新
        chrome.storage.local.get(['completed'], (result) => {
          const completed = result.completed || [];
          if (!completed.includes(problemTitle)) {
            completed.push(problemTitle); // 添加新的题目标题
          }
  
          // 保存到本地存储并更新 UI
          chrome.storage.local.set({ completed }, () => {
            renderList(completedList, completed);
          });
        });
      }
    });
  });
  