import { qregExrContains } from '../../../dd2nr/transpiler/regexr';

describe('RegExr Contains', () => {
  test('Test RegExr Contains function type count', () => {
    const functionType = 'count';
    const value = qregExrContains(functionType);
    expect(value).toEqual(['count']);
  });

  test('Test RegExr Contains function type null', () => {
    const functionType = '';
    const value = qregExrContains(functionType);
    expect(value).toBeNull();
  });

  test('Test RegExr Contains function type autosmooth', () => {
    const functionType = 'autosmooth';
    const value = qregExrContains(functionType);
    expect(value).toEqual(['autosmooth']);
  });

  test('Test RegExr Contains function type top', () => {
    const functionType = 'top';
    const value = qregExrContains(functionType);
    expect(value).toEqual(['top']);
  });
});
