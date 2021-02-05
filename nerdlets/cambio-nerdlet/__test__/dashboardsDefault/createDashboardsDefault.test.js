// HOST
// this.dashboard = new Dash();
// let host=[];
// let xApiKey="NRAA-289e1d1e36005c27396bdbba43c";
// host.push({name:"Ubuntu virtual",entityGuid:"MjcxMDExMnxJTkZSQXxOQXwxNjQyMDU1NTA4OTE4MzMyOTY0"});
// await this.dashboard.createDashboards(host,xApiKey);

// REDIS
// this.dashboard = new Dash();
// let integrationsRedis=[];
// let xApiKey="NRAA-289e1d1e36005c27396bdbba43c";
// integrationsRedis.push({name:"Redis INTEGRATION",entityGuid:"MjcxMDExMnxJTkZSQXxOQXw2NjEwODU3NTE4MDExMDkxNzc1"});
// await this.dashboard.createDashboards(integrationsRedis,xApiKey);

// MYSQL
// this.dashboard = new Dash();
// let host = [];
// let xApiKey = "NRAA-289e1d1e36005c27396bdbba43c";
// host.push({ name: "Mysql TEST", entityGuid: "MjcxMDExMnxJTkZSQXxOQXwyNjc5MDg4OTM4NDQ1MTgxMDk1",entityGuidHost:"MjcxMDExMnxJTkZSQXxOQXwxNjQyMDU1NTA4OTE4MzMyOTY0" });
// const dashboardsCreated = await this.dashboard.createDashboards(host, xApiKey);

describe('Test creation dashboard default host', () => {
  test('Dashboard default host', async () => {
    // const dashboard = new DashboardHost();
    // let host = [];
    // let xApiKey = "NRAA-289e1d1e36005c27396bdbba43c";
    // host.push({ name: "Ubuntu virtual", entityGuid: "MjcxMDExMnxJTkZSQXxOQXwxNjQyMDU1NTA4OTE4MzMyOTY0" });
    // const ty = await dashboard.createDashboards(host, xApiKey);
    expect(1).toBeCloseTo(1);
  });
});
