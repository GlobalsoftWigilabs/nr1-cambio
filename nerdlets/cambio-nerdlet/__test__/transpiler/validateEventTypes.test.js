import { validateEventTypes } from '../../dd2nr/transpiler';

describe('Test Validate Event Types', () => {
  test('Test validateEventTypes heatmap', () => {
    const value = validateEventTypes([
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
      }
    ]);
    expect(value).toEqual({
      aggregatorMetric: [['histogram', 'loadAverageOneMinute']],
      eventTypes: 'SystemSample'
    });
  });
});
