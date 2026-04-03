// A simple test for your math logic
const calculateNet = (inc, exp) => inc - exp;

test('Financial Math: Should calculate balance correctly', () => {
  expect(calculateNet(10000, 4000)).toBe(6000);
  expect(calculateNet(5000, 7000)).toBe(-2000);
});