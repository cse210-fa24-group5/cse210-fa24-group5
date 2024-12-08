/**
 * @jest-environment jsdom
 */

const { 
    InformationRetrieval, 
    saveProblemDetails, 
    autoSaveProblemDetails,
  } = require("../../src/content-script");
  
  describe("Content Script Tests", () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="flexlayout__tab">
          <div>
            <div>
              <div>
                <div>
                  <div>
                    <a href="http://localhost/problems/example-problem/">1. Example Problem</a>
                  </div>
                </div>
              </div>
              <div>
                <div>Medium</div>
              </div>
            </div>
          </div>
        </div>
        <span data-e2e-locator="submission-result">Accepted</span>
      `;
  
      global.chrome = {
        storage: {
          local: {
            set: jest.fn((data, callback) => callback && callback()),
            get: jest.fn((keys, callback) => callback({ completed: [], todo: [] })),
          },
        },
      };
  
      jest.spyOn(console, "log").mockImplementation(() => {});
      jest.spyOn(console, "warn").mockImplementation(() => {});
      jest.spyOn(console, "error").mockImplementation(() => {});
    });
  
    afterEach(() => {
      jest.clearAllMocks();
      document.body.innerHTML = "";
      if (global.MutationObserver) {
        global.MutationObserver.mockClear && global.MutationObserver.mockClear();
      }
    });
  
    describe("InformationRetrieval function", () => {
      it("retrieves problem details correctly", () => {
        const result = InformationRetrieval();
        expect(result).toEqual({
          title: "Example Problem",
          number: "1",
          link: "http://localhost/problems/example-problem/",
          difficulty: "Medium",
        });
      });
  
      it("returns null when problem element is missing", () => {
        document.body.innerHTML = "";
        const result = InformationRetrieval();
        expect(result).toBeNull();
        expect(console.warn).toHaveBeenCalledWith("Problem element not found. The DOM structure may have changed or not loaded yet.");
      });
  
      it("returns null when problem data is incomplete (missing title)", () => {
        const problemLink = document.querySelector("a");
        problemLink.textContent = "";
        const result = InformationRetrieval();
        expect(result).toBeNull();
        expect(console.warn).toHaveBeenCalledWith("Incomplete problem data. Skipping retrieval.");
      });
  
      it("returns null when problemDifficulty is missing", () => {
        const difficultyDiv = document.querySelector(".flexlayout__tab div:nth-child(2)");
        difficultyDiv.textContent = "";
        const result = InformationRetrieval();
        expect(result).toBeNull();
        expect(console.warn).toHaveBeenCalledWith("Incomplete problem data. Skipping retrieval.");
      });
    });
  
    describe("saveProblemDetails function", () => {
      it("saves problem details to local storage", () => {
        saveProblemDetails();
        expect(global.chrome.storage.local.set).toHaveBeenCalledWith(
          {
            problem: {
              title: "Example Problem",
              number: "1",
              link: "http://localhost/problems/example-problem/",
              difficulty: "Medium",
            },
          },
          expect.any(Function)
        );
        expect(console.log).toHaveBeenCalledWith("Problem saved to local storage.");
      });
  
      it("does not save when InformationRetrieval returns null", () => {
        jest.spyOn(require("../../src/content-script"), "InformationRetrieval").mockReturnValue(null);
        saveProblemDetails();
        expect(global.chrome.storage.local.set).not.toHaveBeenCalled();
        require("../../src/content-script").InformationRetrieval.mockRestore();
      });
  
      it("does not add duplicate tasks to the Completed List", () => {
        chrome.storage.local.get.mockImplementation((keys, callback) => {
          callback({ todo: [{ title: "Example Problem", number: "1" }], completed: [] });
        });
  
        saveProblemDetails();
  
        expect(console.log).toHaveBeenCalledWith("Problem saved to local storage.");
      });
    });
  
    describe("autoSaveProblemDetails function", () => {
      it("calls saveProblemDetails on initialization", () => {
        const saveProblemDetailsSpy = jest.spyOn(require("../../src/content-script"), "saveProblemDetails");
  
        autoSaveProblemDetails();
  
        expect(saveProblemDetailsSpy).toHaveBeenCalledTimes(1);
  
        saveProblemDetailsSpy.mockRestore();
      });
  
      it("calls saveProblemDetails when MutationObserver detects DOM changes", (done) => {
        const saveProblemDetailsSpy = jest.spyOn(require("../../src/content-script"), "saveProblemDetails");
  
        // Mock MutationObserver
        const mockObserve = jest.fn();
        const mockDisconnect = jest.fn();
        global.MutationObserver = jest.fn((callback) => ({
          observe: mockObserve,
          disconnect: mockDisconnect,
          trigger: () => callback(), // Custom method to trigger the callback
        }));
  
        autoSaveProblemDetails();
  
        // Simulate DOM change that triggers the observer
        const observerInstance = global.MutationObserver.mock.instances[0];
        observerInstance.trigger();
  
        setImmediate(() => {
          expect(saveProblemDetailsSpy).toHaveBeenCalledTimes(2);
          saveProblemDetailsSpy.mockRestore();
          done();
        });
      });
  
      it("disconnects observer after handling submission", (done) => {
        // Mock MutationObserver with disconnect
        const mockDisconnect = jest.fn();
        const mockObserve = jest.fn();
        global.MutationObserver = jest.fn((callback) => ({
          observe: mockObserve,
          disconnect: mockDisconnect,
          trigger: () => callback(), // Custom method to trigger the callback
        }));
  
        autoSaveProblemDetails();
  
        // Simulate successful submission by updating the DOM
        const successMessage = document.querySelector('span[data-e2e-locator="submission-result"]');
        successMessage.textContent = "Accepted";
  
        // Trigger MutationObserver callback
        const observerInstance = global.MutationObserver.mock.instances[0];
        observerInstance.trigger();
  
        setImmediate(() => {
          expect(mockDisconnect).toHaveBeenCalled();
          expect(console.log).toHaveBeenCalledWith("Observer disconnected to prevent duplicate processing.");
          done();
        });
      });
  
      it("handles case when InformationRetrieval returns null in MutationObserver", (done) => {
        jest.spyOn(require("../../src/content-script"), "InformationRetrieval").mockReturnValue(null);
  
        // Mock MutationObserver
        const mockObserve = jest.fn();
        const mockDisconnect = jest.fn();
        global.MutationObserver = jest.fn((callback) => ({
          observe: mockObserve,
          disconnect: mockDisconnect,
          trigger: () => callback(), // Custom method to trigger the callback
        }));
  
        autoSaveProblemDetails();
  
        // Trigger MutationObserver callback
        const observerInstance = global.MutationObserver.mock.instances[0];
        observerInstance.trigger();
  
        setImmediate(() => {
          expect(console.warn).toHaveBeenCalledWith("Problem element not found. The DOM structure may have changed or not loaded yet.");
          require("../../src/content-script").InformationRetrieval.mockRestore();
          done();
        });
      });
    });
  
    describe("MutationObserver for submission results", () => {
      beforeEach(() => {
        document.body.innerHTML = `
          <div class="flexlayout__tab">
            <div>
              <div>
                <div>
                  <div>
                    <div>
                      <a href="http://localhost/problems/example-problem/">1. Example Problem</a>
                    </div>
                  </div>
                </div>
                <div>
                  <div>Medium</div>
                </div>
              </div>
            </div>
          </div>
          <span data-e2e-locator="submission-result"></span>
        `;
      });
  
      it("moves problem to completed list on successful submission", (done) => {
        const mockSet = jest.fn((data, callback) => callback && callback());
        const mockGet = jest.fn((keys, callback) => callback({ completed: [], todo: [] }));
  
        global.chrome.storage.local.set = mockSet;
        global.chrome.storage.local.get = mockGet;
  
        // Mock MutationObserver
        const mockDisconnect = jest.fn();
        const mockObserve = jest.fn();
        global.MutationObserver = jest.fn((callback) => ({
          observe: mockObserve,
          disconnect: mockDisconnect,
          trigger: () => callback(), // Custom method to trigger the callback
        }));
  
        autoSaveProblemDetails();
        const successMessage = document.querySelector('span[data-e2e-locator="submission-result"]');
        successMessage.textContent = "Accepted";
  
        // Trigger MutationObserver callback
        const observerInstance = global.MutationObserver.mock.instances[0];
        observerInstance.trigger();
  
        setImmediate(() => {
          expect(mockGet).toHaveBeenCalledWith(["completed", "todo"], expect.any(Function));
          expect(mockSet).toHaveBeenCalledWith(
            {
              completed: [{
                title: "Example Problem",
                number: "1",
                link: "http://localhost/problems/example-problem/",
                difficulty: "Medium",
              }],
              todo: [],
            },
            expect.any(Function)
          );
          expect(console.log).toHaveBeenCalledWith("Storage updated: problem moved to completed list.");
          expect(console.log).toHaveBeenCalledWith("Observer disconnected to prevent duplicate processing.");
          done();
        });
      });
  
      it("does not move problem if already in completed list", (done) => {
        const mockSet = jest.fn((data, callback) => callback && callback());
        const mockGet = jest.fn((keys, callback) => callback({ 
          completed: [{ title: "Example Problem", number: "1" }], 
          todo: [] 
        }));
  
        global.chrome.storage.local.set = mockSet;
        global.chrome.storage.local.get = mockGet;
  
        // Mock MutationObserver
        const mockDisconnect = jest.fn();
        const mockObserve = jest.fn();
        global.MutationObserver = jest.fn((callback) => ({
          observe: mockObserve,
          disconnect: mockDisconnect,
          trigger: () => callback(), // Custom method to trigger the callback
        }));
  
        autoSaveProblemDetails();
  
        const successMessage = document.querySelector('span[data-e2e-locator="submission-result"]');
        successMessage.textContent = "Accepted";
  
        // Trigger MutationObserver callback
        const observerInstance = global.MutationObserver.mock.instances[0];
        observerInstance.trigger();
  
        setImmediate(() => {
          expect(mockGet).toHaveBeenCalledWith(["completed", "todo"], expect.any(Function));
          expect(mockSet).toHaveBeenCalledWith(
            {
              completed: [{ title: "Example Problem", number: "1" }],
              todo: [],
            },
            expect.any(Function)
          );
          expect(console.log).toHaveBeenCalledWith("Problem already exists in completed list.");
          done();
        });
      });
  
      it("handles non-Accepted submissions", (done) => {
        const mockSet = jest.fn((data, callback) => callback && callback());
        const mockGet = jest.fn((keys, callback) => callback({ completed: [], todo: [] }));
  
        global.chrome.storage.local.set = mockSet;
        global.chrome.storage.local.get = mockGet;
  
        // Mock MutationObserver
        const mockDisconnect = jest.fn();
        const mockObserve = jest.fn();
        global.MutationObserver = jest.fn((callback) => ({
          observe: mockObserve,
          disconnect: mockDisconnect,
          trigger: () => callback(), // Custom method to trigger the callback
        }));
  
        autoSaveProblemDetails();

        const successMessage = document.querySelector('span[data-e2e-locator="submission-result"]');
        successMessage.textContent = "Wrong Answer";

        const observerInstance = global.MutationObserver.mock.instances[0];
        observerInstance.trigger();
  
        setImmediate(() => {
          expect(mockGet).not.toHaveBeenCalled();
          expect(mockSet).not.toHaveBeenCalled();
          expect(console.log).not.toHaveBeenCalledWith("Storage updated: problem moved to completed list.");
          done();
        });
      });
    });
  
    describe("MutationObserver for submission results", () => {
      it("handles MutationObserver callbacks correctly", (done) => {
        done();
      });
    });
  });
  