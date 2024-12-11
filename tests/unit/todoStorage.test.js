// Import the script (modify the path as needed)
const {
  informationRetrieval,
  initializeHijackButton,
  observeProblemPage,
} = require("../../src/hijackAddButton");

// Mock the Chrome storage API
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

describe("LeetCode Problem Hijacker", () => {
  beforeEach(() => {
    // Create a mock DOM structure
    document.body.innerHTML = `
      <div class="flexlayout__tab">
        <div>
          <div>
            <div>
              <div>
                <div>
                  <a href="https://leetcode.com/problems/example-problem/">1. Example Problem</a>
                </div>
              </div>
            </div>
            <div>
              <span>Easy</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockStorage.todo = [];
    document.body.innerHTML = "";
  });

  it("should correctly extract problem details from the DOM", () => {
    const problemDetails = informationRetrieval();
    expect(problemDetails).toEqual({
      title: "Example Problem+",
      number: "1",
      link: "https://leetcode.com/problems/example-problem/",
      difficulty: "Easy",
    });
  });

  it("should return null if the DOM structure is missing", () => {
    document.querySelector(".flexlayout__tab").remove();
    const problemDetails = informationRetrieval();
    expect(problemDetails).toBeNull();
  });

  it("should add a '+' button next to the problem title", () => {
    initializeHijackButton();
    const button = document.querySelector(".add-todo-btn");
    expect(button).not.toBeNull();
    expect(button.textContent).toBe("+");
  });

  it("should not add duplicate buttons", () => {
    initializeHijackButton();
    initializeHijackButton();
    const buttons = document.querySelectorAll(".add-todo-btn");
    expect(buttons.length).toBe(1);
  });

  it("should add the problem to Chrome storage when the '+' button is clicked", () => {
    initializeHijackButton();
    const button = document.querySelector(".add-todo-btn");
    button.click();

    expect(chrome.storage.local.get).toHaveBeenCalledWith(
      ["todo", "completed"],
      expect.any(Function),
    );
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      {
        todo: [
          {
            title: "Example Problem",
            number: "1",
            link: "https://leetcode.com/problems/example-problem/",
            difficulty: "Easy",
          },
        ],
      },
      expect.any(Function),
    );
  });

  it("should not add the same problem multiple times", () => {
    mockStorage.todo = [
      {
        title: "Example Problem",
        number: "1",
        link: "https://leetcode.com/problems/example-problem/",
        difficulty: "Easy",
      },
    ];

    initializeHijackButton();
    const button = document.querySelector(".add-todo-btn");
    button.click();

    expect(chrome.storage.local.set).not.toHaveBeenCalledWith(
      expect.objectContaining({
        todo: expect.arrayContaining([
          {
            title: "Example Problem",
            number: "1",
            link: "https://leetcode.com/problems/example-problem/",
            difficulty: "Easy",
          },
        ]),
      }),
    );
  });
  it("should not add a problem to the Todo List if it is already marked as completed", () => {
    // Prepare the environment
    mockStorage.completed = [
      {
        title: "Example Problem",
        number: "1",
        link: "https://leetcode.com/problems/example-problem/",
        difficulty: "Easy",
      },
    ];
    initializeHijackButton();
    const button = document.querySelector(".add-todo-btn");
    button.click(); // Trigger the click event

    // Assertions
    expect(chrome.storage.local.set).not.toHaveBeenCalledWith(
      expect.objectContaining({
        todo: expect.arrayContaining([
          {
            title: "Example Problem",
            number: "1",
            link: "https://leetcode.com/problems/example-problem/",
            difficulty: "Easy",
          },
        ]),
      }),
    );
    console.log("The completed task is not added again to the Todo List.");
  });
});

describe("observeProblemPage", () => {
  let observeMock;
  beforeEach(() => {
    // Mock MutationObserver
    observeMock = jest.fn();
    global.MutationObserver = jest.fn(() => ({
      observe: observeMock,
      disconnect: jest.fn(),
    }));
    // Set up the DOM
    document.body.innerHTML = `
      <div class="flexlayout__tab">
        <div>
          <div>
            <div>
              <div>
                <div>
                  <a href="https://leetcode.com/problems/example-problem/">1. Example Problem</a>
                </div>
              </div>
            </div>
            <div>
              <span>Easy</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore all mocks after each test
    document.body.innerHTML = "";
  });

  it("should initialize the '+' button when a new problem page is loaded", () => {
    const mutationCallback = jest.fn(); // Mock the callback function
    // Mock the MutationObserver constructor to use our mock callback
    global.MutationObserver = jest.fn((callback) => {
      mutationCallback.mockImplementation(callback); // Store the real callback
      return { observe: observeMock, disconnect: jest.fn() };
    });
    // Call the observeProblemPage function
    observeProblemPage();
    // Verify that observe was called with the correct arguments
    expect(observeMock).toHaveBeenCalledWith(document.body, {
      childList: true,
      subtree: true,
    });
    // Simulate a mutation to trigger the callback
    mutationCallback([{ type: "childList" }]);
    // Verify the '+' button is initialized
    const button = document.querySelector(".add-todo-btn");
    expect(button).not.toBeNull();
  });
});
