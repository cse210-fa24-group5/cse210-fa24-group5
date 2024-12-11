const { initializeStorage, fetchAndRender } = require("../../src/popup");

const mockStorage = {};
global.chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        const result = keys.reduce((acc, key) => {
          acc[key] = mockStorage[key] || [];
          return acc;
        }, {});
        callback(result);
      }),
      set: jest.fn((data, callback) => {
        Object.assign(mockStorage, data);
        callback?.();
      }),
    },
  },
};

describe("initializeStorage", () => {
  it("should initialize the storage with empty lists if not present", () => {
    chrome.storage.local.get = jest.fn((key, callback) => {
      callback({ todo: null, completed: null });
    });
    chrome.storage.local.set = jest.fn();

    initializeStorage();

    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      { todo: [] },
      expect.any(Function),
    );
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      { completed: [] },
      expect.any(Function),
    );
  });
});

describe("fetchAndRender", () => {
  let mockTodo;
  let mockCompleted;

  beforeEach(() => {
    // Mock DOM structure
    document.body.innerHTML = `
      <div id="todo-page">
        <h2>To-Do List</h2>
        <ul id="todo-list" style="display: block;">
        </ul>
        <button id="goToCompleted">Go to Completed</button>
      </div>
      <div id="completed-page" style="display: none;">
        <h2>Completed Problems</h2>
        <ul id="completed-list">
        </ul>
        <button id="backToTodo">Back to Todo</button>
      </div>
    `;
    const event = new Event("DOMContentLoaded");
    document.dispatchEvent(event);

    // Mock data
    mockTodo = [
      {
        title: "Example Problem",
        number: "1",
        difficulty: "Easy",
        link: "http://example.com",
      },
    ];
    mockCompleted = [
      {
        title: "Completed Problem",
        number: "2",
        difficulty: "Medium",
        link: "http://example.com/completed",
      },
    ];

    chrome.storage.local.get = jest.fn((keys, callback) => {
      callback({ todo: mockTodo, completed: mockCompleted });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("should fetch and render todo and completed lists from storage", () => {
    fetchAndRender();

    const todoList = document.getElementById("todo-list");
    const completedList = document.getElementById("completed-list");

    expect(todoList.children.length).toBe(1);
    expect(completedList.children.length).toBe(1);

    const todoButton = todoList.querySelector(".problem-button");
    const completedButton = completedList.querySelector(".problem-button");

    expect(todoButton.textContent).toContain("Example Problem");
    expect(completedButton.textContent).toContain("Completed Problem");
  });

  it("should fetch and render appropriately for empty todo and completed lists from storage", () => {
    chrome.storage.local.get = jest.fn((keys, callback) => {
      callback({ todo: [], completed: [] });
    });

    fetchAndRender();

    const todoList = document.getElementById("todo-list");
    const completedList = document.getElementById("completed-list");

    expect(todoList.children.length).toBe(1);
    const emptyMessage = todoList.querySelector(".empty-message");
    expect(emptyMessage).not.toBeNull();
    expect(emptyMessage.textContent).toBe("No tasks in your To-Do list!");

    expect(completedList.children.length).toBe(1);
    const emptyCompletedMessage = completedList.querySelector(".empty-message");
    expect(emptyCompletedMessage).not.toBeNull();
    expect(emptyCompletedMessage.textContent).toBe("No tasks completed yet!");
  });
  it("should switch to the todo page on 'Back to Todo' click", () => {
    const backToTodoButton = document.getElementById("backToTodo");
    backToTodoButton.click();

    expect(getComputedStyle(document.getElementById("todo-page")).display).toBe(
      "block",
    );
    expect(
      getComputedStyle(document.getElementById("completed-page")).display,
    ).toBe("none");
  });

  it("should switch to the completed page on 'Go to Completed' click", () => {
    const goToCompletedButton = document.getElementById("goToCompleted");
    goToCompletedButton.click();
    expect(goToCompletedButton).not.toBeNull();

    expect(
      getComputedStyle(document.getElementById("completed-page")).display,
    ).toBe("block");
    expect(getComputedStyle(document.getElementById("todo-page")).display).toBe(
      "none",
    );
  });
});
