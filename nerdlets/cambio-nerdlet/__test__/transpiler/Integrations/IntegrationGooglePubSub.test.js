import { translate } from '../../../dd2nr/transpiler';

describe('Test metrics google pub sub', () => {
  test('Test transpiler simple query', () => {
    const value = translate('avg:gcp.pubsub.subscription.backlog_bytes{*}', null);
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   average(gcp.pubsub.subscription.backlog_bytes)   FROM  Metric     '
    });
  });

  test('TestTraspilerSimple', () => {
    const value = translate('avg:gcp.pubsub.subscription.push_request_count{*}+avg:gcp.pubsub.subscription.retained_acked_bytes{*}', null);
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   average(gcp.pubsub.subscription.push_request_count) + average(gcp.pubsub.subscription.retained_acked_bytes)   FROM  Metric     '
    });
  });

  test('TestTraspilerSimple', () => {
    const value = translate('avg:gcp.pubsub.subscription.num_unacked_messages_by_region{*}', null);
    expect(value).toEqual({
      getDDTokensMulti2: [],
      queryTranslated:
        ' SELECT   average(gcp.pubsub.subscription.num_unacked_messages_by_region)   FROM  Metric     '
    });
  });
});
