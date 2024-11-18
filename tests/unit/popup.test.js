const testFunction = require('../../src/popup');

test('check 3 * 10 works', () => {
  expect(
    testFunction(3)
  ).toBe(30);
});

test('check -3 * 10 works', () => {
    expect(
      testFunction(-3)
    ).toBe(-30);
  });