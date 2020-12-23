import { filterSignalInMetric } from '../../dd2nr/transpiler';

describe('Test Filter promql', () => {
  test('Test promql filter with nothing to filter', () => {
    const value =filterSignalInMetric("avg:system.cpu.user{*}");
    expect(value).toEqual("avg:system.cpu.user{*}");
  });
  
  test('Test promql filter with complexity easy metric', () => {
    const value =filterSignalInMetric("avg:system.cpu.user{host:wigilabs-demo-server}");
    expect(value).toMatch("avg:system.cpu.user{host:wigilabs~demo~server}");
  });

  test('Test promql filter with complexity easy metric second', () => {
    const value =filterSignalInMetric("avg:system.cpu.user{host:wigilabs-demo-server}-avg:system.cpu.user{host:any}");
    expect(value).toMatch("avg:system.cpu.user{host:wigilabs~demo~server}-avg:system.cpu.user{host:any}");
  });

  test('Test promql filter with complexity medium metric ', () => {
    const value =filterSignalInMetric("avg:trace.servlet.request.duration.by.service.50p{service:apps-solr-person,env:production}");
    expect(value).toMatch("avg:trace.servlet.request.duration.by.service.50p{service:apps~solr~person,env:production}");
  });

  test('Test promql filter with complexity medium metric second', () => {
    const value =filterSignalInMetric("avg:trace.servlet.request.duration.by.service.50p{service:apps-solr-person,env:production-enviroment}");
    expect(value).toMatch("avg:trace.servlet.request.duration.by.service.50p{service:apps~solr~person,env:production~enviroment}");
  });

  test('Test promql filter with complexity hight metric', () => {
    const value =filterSignalInMetric("avg:trace.servlet.request.duration.by.service.50p{service:apps-solr-person,env:production-enviroment}-avg:system.cpu.user{host:wigilabs-demo-server}");
    expect(value).toMatch("avg:trace.servlet.request.duration.by.service.50p{service:apps~solr~person,env:production~enviroment}-avg:system.cpu.user{host:wigilabs~demo~server}");
  });

  test('Test promql filter with complexity hight metric second', () => {
    const value =filterSignalInMetric("avg:kubernetes_state.statefulset.replicas_desired{cluster-name:prd-solr-001,namespace:solr-person,statefulset:apps-solr-person} by {namespace,cluster-name}-avg:kubernetes_state.statefulset.replicas_ready{cluster-name:prd-solr-001,namespace:solr-person,statefulset:apps-solr-person} by {namespace,cluster-name}");
    expect(value).toMatch("avg:kubernetes_state.statefulset.replicas_desired{cluster~name:prd~solr~001,namespace:solr~person,statefulset:apps~solr~person} by {namespace,cluster~name}-avg:kubernetes_state.statefulset.replicas_ready{cluster~name:prd~solr~001,namespace:solr~person,statefulset:apps~solr~person} by {namespace,cluster~name}");
  });
  test('Test promql filter with complexity hight metric second three', () => {
    const value =filterSignalInMetric("avg:gcp.pubsub.subscription.num_unacked_messages_by_region{project_id:dozi-stg-intents-1,subscription_id:intent-records-with-id.subscription-6366226368389020485}");
    expect(value).toMatch("avg:gcp.pubsub.subscription.num_unacked_messages_by_region{project_id:dozi~stg~intents~1,subscription_id:intent~records~with~id.subscription~6366226368389020485}");
  });
});
