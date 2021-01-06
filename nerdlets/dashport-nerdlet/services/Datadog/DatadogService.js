class DatadogService {
  constructor(datadogClient) {
    this.client = datadogClient;
  }

  async fetchMetrics(from, maxGroups = null, updateProgress = null) {
    const metrics = [];
    const metricsByGroup = 10;
    const groups = [];
    let group = [];
    let count = 0;
    let gcount = 0;
    let totalRequest = 0;
    const response = await this.client.getActiveMetricList(from);

    if (response) {
      if (updateProgress) {
        totalRequest = response.data.metrics.length;
        if (maxGroups !== null) {
          totalRequest = maxGroups * metricsByGroup;
        }
        if (totalRequest % metricsByGroup > 0) {
          totalRequest++;
        }
        totalRequest += parseInt(totalRequest / metricsByGroup);
      }

      for (const metricName of response.data.metrics) {
        gcount++;
        const metric = {
          name: metricName,
          integration: null,
          type: null,
          hosts: [],
          unit: null,
          aggr: null
        };

        const responseMetricMetadata = await this.client.getMetricMetadata(metricName);
        if (updateProgress) {
          updateProgress(gcount / totalRequest * 100);
        }

        if (
          responseMetricMetadata &&
          responseMetricMetadata.data &&
          responseMetricMetadata.data.errors === undefined
        ) {
          const metricMetadata = responseMetricMetadata.data;
          metric.integration = metricMetadata.integration;
          metric.type = metricMetadata.type;
          metric.unit = metricMetadata.unit;
        }

        metrics[metric.name] = metric;
        count++;

        group.push(`${metric.name}{*}by{host}`);
        if (count === metricsByGroup) {
          groups.push(group);
          group = [];
          count = 0;
        }

        if (maxGroups !== null && groups.length === maxGroups) {
          break;
        }

      }

      const to = Math.floor(new Date() / 1000);
      for (const group of groups) {
        gcount++;
        const query = group.join(',');

        const responseTimeSeries = await this.client.queryTimeSeriesPoints(from, to, query);
        if (updateProgress) {
          updateProgress(gcount / totalRequest * 100);
        }

        if (responseTimeSeries && responseTimeSeries.data) {
          for (const serie of responseTimeSeries.data.series) {
            metrics[serie.metric].hosts.push(serie.scope.replace('host:', ''));
            metrics[serie.metric].aggr = serie.aggr;
          }
        }
      }
    }

    return Object.values(metrics);
  }
}

export default DatadogService;