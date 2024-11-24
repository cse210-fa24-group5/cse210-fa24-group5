const { initializeTimer } = require('../../src/timer');

describe('initializeTimer', () => {
    beforeEach(() => {
      // Set up a mock DOM
      document.body.innerHTML = `
        <div class = 'flexlayout__tab'>Hello, World!
            <div>1
                <div>2
                    <div>3[0]
                    </div>
                    <div>3[1]
                        <div>Easy</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="anotherDiv">Another Content</div>
      `;
    });

    it('check if minute reflect difficulty', () => {
        expect(
            initializeTimer()
        ).toBe(20);
    });

});

//let parentDiv = document.querySelector(`.flexlayout__tab`);
//difficulty = parentDiv.children[0].children[0].children[1].children[0].textContent;