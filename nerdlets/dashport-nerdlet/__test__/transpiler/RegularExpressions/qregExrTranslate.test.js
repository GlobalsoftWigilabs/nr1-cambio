import { qregExrTranslate } from '../../../dd2nr/transpiler/regexr';

describe('RegExr Translate', () => {
  test('Test RegExr Translate function count', () => {
    const query = 'count(avg:system.cpu.user{*})';
    const value = qregExrTranslate(query);
    expect(value).toEqual({
      functionType: 'count',
      function: 'avg:system.cpu.user{*}'
    });
  });

  test('Test RegExr Translate function null', () => {
    const query = '(avg:system.cpu.user{*})';
    const value = qregExrTranslate(query);
    expect(value).toBeNull();
  });

  test('Test RegExr Translate function null 2', () => {
    const query = 'count';
    const value = qregExrTranslate(query);
    expect(value).toBeNull();
  });

  test('Test RegExr Translate function autosmooth', () => {
    const query = 'autosmooth(<METRIC_NAME>{*})';
    const value = qregExrTranslate(query);
    expect(value).toEqual({
      functionType: 'autosmooth',
      function: '<METRIC_NAME>{*}'
    });
  });

  test('Test RegExr Translate function top', () => {
    const query = 'top(avg:system.cpu.user{*}, 10, "mean", "desc")';
    const value = qregExrTranslate(query);
    expect(value).toEqual({
      functionType: 'top',
      function: 'avg:system.cpu.user{*}, 10, \"mean\", \"desc\"'
    });
  });
});
