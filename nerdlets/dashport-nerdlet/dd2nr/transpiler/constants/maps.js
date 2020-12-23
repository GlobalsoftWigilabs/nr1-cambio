const SPECIAL_TYPES_MAP = {
  heatmap: 'histogram',
  distribution: 'histogram'
};

const AGGREGATION_MAP = {
  // dd_metric: (nr_metric, nr_event_type)
  avg: 'average',
  max: 'max',
  min: 'min',
  sum: 'sum'
};

const ATTRIBUTE_MAP = {
  // dd_where_key: nr_where_key
  host: 'host.name',
  service: 'appName'
};

const VARIABLES_MAP = {
  // dd_where_key: nr_nrlquery
  host: 'SELECT uniques(`host.name`) as uniqueValues from `Metric`',
  service: 'SELECT uniques(entityName) as name FROM ProcessSample'
};

const METRIC_MAP = {
  // dd_metric: (nr_metric, nr_event_type)
  // System          agregator                  metri
  'system.load.1': ['system.load.1', 'Metric'],
  'system.load.5': ['system.load.5', 'Metric'],
  'system.load.15': ['system.load.15', 'Metric'],
  'system.cpu.idle': ['system.cpu.idle', 'Metric'],
  'system.cpu.user': ['system.cpu.user', 'Metric'],
  'system.cpu.guest': ['system.cpu.guest', 'Metric'],
  'system.cpu.iowait': ['system.cpu.iowait', 'Metric'],
  'system.mem.used': ['system.mem.used', 'Metric'],
  // "system.cpu.stolen": ["", "Metric"],
  'system.cpu.system': ['system.cpu.system', 'Metric'],
  // Metric
  'nginx.net.conn_dropped_per_s': [
    'ginx.net.conn_dropped_per_s',
    'Metric'
  ],
  'nginx.net.conn_opened_per_s': [
    'nginx.net.conn_opened_per_s',
    'Metric'
  ],
  'nginx.net.connections': ['nginx.net.connections', 'Metric'],
  'nginx.net.reading': ['nginx.net.reading', 'Metric'],
  'nginx.net.request_per_s': ['nginx.net.request_per_s', 'Metric'],
  'nginx.net.waiting': ['nginx.net.waiting', 'Metric'],
  'nginx.net.writing': ['nginx.net.writing', 'Metric'],
  // Metric
  'mysql.net.connections': ['mysql.net.connections', 'Metric'],
  'mysql.net.aborted_clients': ['mysql.net.aborted_clients', 'Metric'],
  'mysql.net.aborted_connects': ['mysql.net.aborted_connects', 'Metric'],
  'mysql.net.max_connections': ['mysql.net.max_connections', 'Metric'],
  // "mysql.net.max_connections_available": ["", "Metric"],
  //Google Pub/Sub
  'gcp.pubsub.subscription.backlog_bytes': ['gcp.pubsub.subscription.backlog_bytes', 'Metric'],
  'gcp.pubsub.subscription.byte_cost': ['gcp.pubsub.subscription.byte_cost', 'Metric'],
  'gcp.pubsub.subscription.config_updates_count': ['gcp.pubsub.subscription.config_updates_count', 'Metric'],
  'gcp.pubsub.subscription.mod_ack_deadline_message_operation_count': ['gcp.pubsub.subscription.mod_ack_deadline_message_operation_count', 'Metric'],
  'gcp.pubsub.subscription.mod_ack_deadline_request_count': ['gcp.pubsub.subscription.mod_ack_deadline_request_count', 'Metric'],
  'gcp.pubsub.subscription.num_outstanding_messages': ['gcp.pubsub.subscription.num_outstanding_messages', 'Metric'],
  'gcp.pubsub.subscription.num_retained_acked_messages': ['gcp.pubsub.subscription.num_retained_acked_messages', 'Metric'],
  'gcp.pubsub.subscription.num_retained_acked_messages_by_region': ['gcp.pubsub.subscription.num_retained_acked_messages_by_region', 'Metric'],
  'gcp.pubsub.subscription.num_unacked_messages_by_region': ['gcp.pubsub.subscription.num_unacked_messages_by_region', 'Metric'],
  'gcp.pubsub.subscription.num_undelivered_messages': ['gcp.pubsub.subscription.num_undelivered_messages', 'Metric'],
  'gcp.pubsub.subscription.oldest_retained_acked_message_age': ['gcp.pubsub.subscription.oldest_retained_acked_message_age', 'Metric'],
  'gcp.pubsub.subscription.oldest_retained_acked_message_age_by_region': ['gcp.pubsub.subscription.oldest_retained_acked_message_age_by_region', 'Metric'],
  'gcp.pubsub.subscription.oldest_unacked_message_age': ['gcp.pubsub.subscription.oldest_unacked_message_age', 'Metric'],
  'gcp.pubsub.subscription.oldest_unacked_message_age_by_region': ['gcp.pubsub.subscription.oldest_unacked_message_age_by_region', 'Metric'],
  'gcp.pubsub.subscription.pull_ack_message_operation_count': ['gcp.pubsub.subscription.pull_ack_message_operation_count', 'Metric'],
  'gcp.pubsub.subscription.pull_ack_request_count': ['gcp.pubsub.subscription.pull_ack_request_count', 'Metric'],
  'gcp.pubsub.subscription.pull_message_operation_count': ['gcp.pubsub.subscription.pull_message_operation_count', 'Metric'],
  'gcp.pubsub.subscription.pull_request_count': ['gcp.pubsub.subscription.pull_request_count', 'Metric'],
  'gcp.pubsub.subscription.push_request_count': ['gcp.pubsub.subscription.push_request_count', 'Metric'],
  'gcp.pubsub.subscription.retained_acked_bytes': ['gcp.pubsub.subscription.retained_acked_bytes', 'Metric'],
  'gcp.pubsub.subscription.retained_acked_bytes_by_region': ['gcp.pubsub.subscription.retained_acked_bytes_by_region', 'Metric'],
  'gcp.pubsub.subscription.streaming_pull_ack_message_operation_count': ['gcp.pubsub.subscription.streaming_pull_ack_message_operation_count', 'Metric'],
  'gcp.pubsub.subscription.streaming_pull_ack_request_count': ['gcp.pubsub.subscription.streaming_pull_ack_request_count', 'Metric'],
  'gcp.pubsub.subscription.streaming_pull_message_operation_count': ['gcp.pubsub.subscription.streaming_pull_message_operation_count', 'Metric'],
  'gcp.pubsub.subscription.streaming_pull_mod_ack_deadline_message_operation_count': ['gcp.pubsub.subscription.streaming_pull_mod_ack_deadline_message_operation_count', 'Metric'],
  'gcp.pubsub.subscription.streaming_pull_mod_ack_deadline_request_count': ['gcp.pubsub.subscription.streaming_pull_mod_ack_deadline_request_count', 'Metric'],
  'gcp.pubsub.subscription.streaming_pull_response_count': ['gcp.pubsub.subscription.streaming_pull_response_count', 'Metric'],
  'gcp.pubsub.subscription.unacked_bytes_by_region': ['gcp.pubsub.subscription.unacked_bytes_by_region', 'Metric'],
  'gcp.pubsub.topic.byte_cost': ['gcp.pubsub.topic.byte_cost', 'Metric'],
  'gcp.pubsub.topic.config_updates_count': ['gcp.pubsub.topic.config_updates_count', 'Metric'],
  'gcp.pubsub.topic.num_retained_acked_messages_by_region': ['gcp.pubsub.topic.num_retained_acked_messages_by_region', 'Metric'],
  'gcp.pubsub.topic.num_unacked_messages_by_region': ['gcp.pubsub.topic.num_unacked_messages_by_region', 'Metric'],
  'gcp.pubsub.topic.oldest_retained_acked_message_age_by_region': ['gcp.pubsub.topic.oldest_retained_acked_message_age_by_region', 'Metric'],
  'gcp.pubsub.topic.oldest_unacked_message_age_by_region': ['gcp.pubsub.topic.oldest_unacked_message_age_by_region', 'Metric'],
  'gcp.pubsub.topic.retained_acked_bytes_by_region': ['gcp.pubsub.topic.retained_acked_bytes_by_region', 'Metric'],
  'gcp.pubsub.topic.send_message_operation_count': ['gcp.pubsub.topic.send_message_operation_count', 'Metric'],
  'gcp.pubsub.topic.send_request_count': ['gcp.pubsub.topic.send_request_count', 'Metric'],
  'gcp.pubsub.topic.unacked_bytes_by_region': ['gcp.pubsub.topic.unacked_bytes_by_region', 'Metric']
};

export {
  SPECIAL_TYPES_MAP,
  AGGREGATION_MAP,
  ATTRIBUTE_MAP,
  VARIABLES_MAP,
  METRIC_MAP
};
