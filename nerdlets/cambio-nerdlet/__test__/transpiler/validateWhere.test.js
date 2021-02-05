import { validateWhere } from '../../dd2nr/transpiler';

describe('Test validate Where', () => {
  test('Test validateWhere heatmap', () => {
    const value = validateWhere(
      [
        {
          aggregator: 'histogram',
          metric: 'loadAverageOneMinute',
          eventType: 'SystemSample',
          useWhere: false,
          whereKey: null,
          whereValue: null,
          faceter: null,
          useVar: false,
          varValue: null,
          varKey: null,
          functionType: 'heatmap'
        },
        {
          aggregator: 'histogram',
          metric: 'loadAverageFiveMinute',
          eventType: 'SystemSample',
          useWhere: false,
          whereKey: null,
          whereValue: null,
          faceter: null,
          useVar: false,
          varValue: null,
          varKey: null,
          functionType: 'heatmap'
        },
        {
          aggregator: 'histogram',
          metric: 'loadAverageFifteenMinute',
          eventType: 'SystemSample',
          useWhere: false,
          whereKey: null,
          whereValue: null,
          faceter: null,
          useVar: false,
          varValue: null,
          varKey: null,
          functionType: 'heatmap'
        },
        {
          aggregator: 'histogram',
          metric: 'loadAverageOneMinute',
          eventType: 'SystemSample',
          useWhere: false,
          whereKey: null,
          whereValue: null,
          faceter: null,
          useVar: false,
          varValue: null,
          varKey: null,
          functionType: 'heatmap'
        },
        {
          aggregator: 'histogram',
          metric: 'loadAverageFiveMinute',
          eventType: 'SystemSample',
          useWhere: false,
          whereKey: null,
          whereValue: null,
          faceter: null,
          useVar: false,
          varValue: null,
          varKey: null,
          functionType: 'heatmap'
        },
        {
          aggregator: 'histogram',
          metric: 'loadAverageFifteenMinute',
          eventType: 'SystemSample',
          useWhere: false,
          whereKey: null,
          whereValue: null,
          faceter: null,
          useVar: false,
          varValue: null,
          varKey: null,
          functionType: 'heatmap'
        }
      ],
      { functionType: 'heatmap' }
    );
    expect(value).toEqual({
      whereUsage: false,
      whereKeys: null,
      whereValues: [null]
    });
  });
});
