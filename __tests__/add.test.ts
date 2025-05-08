function add(a: number, b: number) {
    return a + b;
  }
  
  test('adds two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
  