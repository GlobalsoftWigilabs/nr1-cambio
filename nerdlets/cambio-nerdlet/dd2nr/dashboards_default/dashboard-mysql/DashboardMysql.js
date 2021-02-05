import { getAccountId, createDashboardApi } from '../utils/utils';

/**
 * Class that define and create dashboards with widgets
 * for default created in base to datadog dashboard mysql integration preset
 * @export
 * @class DashboardMysqlDefault
 */
export default class DashboardMysqlDefault {

    /**
     *Creates an instance of DashboardMysqlDefault.
     * @memberof DashboardMysqlDefault
     */
    constructor() {
        this.accountId = 0;
    }

    /**
     * Function that execute creation de dashboards for default of integration with redis
     * @param {Array} mysqlIntegrations List of integrations mysql where is obligated include name, entityGuid of integration mysql and entityGuidHost of host 
     * @param {String} xApiKey Api key of user for consume api of dashboards
     * @memberof DashboardMysqlDefault
     */
    async createDashboards(mysqlIntegrations, xApiKey) {
        this.accountId = await getAccountId();
        let dashboardsCreated = [];
        for (const mysqlIntegration of mysqlIntegrations) {
            mysqlIntegration.grid_column_count = 12;
            mysqlIntegration.widgets = this.createWidgets(mysqlIntegration.entityGuid, mysqlIntegration.entityGuidHost);
            mysqlIntegration.title = mysqlIntegration.name;
            mysqlIntegration.icon = "line-chart"
            mysqlIntegration.visibility = "all"
            mysqlIntegration.editable = "editable_by_all"
            mysqlIntegration.metadata = { "version": 1 }
            delete mysqlIntegration.entityGuid;
            delete mysqlIntegration.name;
            delete mysqlIntegration.entityGuidHost;
        }
        for (const mysqlIntegration of mysqlIntegrations) {
            const result = await createDashboardApi(mysqlIntegration, xApiKey);
            dashboardsCreated.push(result);
        }
        return dashboardsCreated;
    }

    /**
     * Function that it is responsible of return array of widgets
     * @param {String} entityGuid Identifier unique of entity integration
     * @param {String} entityGuidHost Identifier unique of host that contain integration
     * @returns
     * @memberof DashboardMysqlDefault
     */
    createWidgets(entityGuid, entityGuidHost) {
        let widgets = [];
        widgets.push(this.createWidgetMysqlConnections(entityGuid));
        widgets.push(this.createWidgetReadsAndWrites(entityGuid));
        widgets.push(this.createWidgetFsync(entityGuid));

        widgets.push(this.createWidgetSlowQueries(entityGuid));
        widgets.push(this.createWidgetLockingRate(entityGuid));
        widgets.push(this.createWidgetLoadAverages(entityGuidHost));

        widgets.push(this.createWidgetCpuUsage(entityGuidHost));
        widgets.push(this.createWidgetIO(entityGuidHost));
        widgets.push(this.createWidgetSystemMemory(entityGuidHost));

        widgets.push(this.createWidgetNetworkTraffic(entityGuid));
        return widgets;
    }

    /**
     * Function that define widget with connections actually 
     * @param {String} entityGuid Identifier unique of entity integration
     * @returns
     * @memberof DashboardMysqlDefault
     */
    createWidgetMysqlConnections(entityGuid) {
        return {
            visualization: "line_chart",
            layout: {
                width: 4,
                height: 3,
                row: 1,
                column: 1
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT max(net.threadsConnected) as 'max connections' FROM MysqlSample WHERE entityGuid = '${entityGuid}' TIMESERIES AUTO `
                }
            ],
            presentation: {
                title: "MYSQL connections",
                notes: null
            }
        }
    }

    /**
     * Function that define widget that contain reads and writes
     * @param {String} entityGuid Identifier unique of integration
     * @returns
     * @memberof DashboardMysqlDefault
     */
    createWidgetReadsAndWrites(entityGuid) {
        return {
            visualization: "line_chart",
            layout: {
                width: 4,
                height: 3,
                row: 1,
                column: 5
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT sum(db.innodb.dataReadsPerSecond) as 'reads per second',sum(db.innodb.dataWrittenBytesPerSecond) as 'written per second'  FROM MysqlSample WHERE entityGuid = '${entityGuid}' TIMESERIES AUTO `
                }
            ],
            presentation: {
                title: "MySQL reads and writes (per sec)",
                notes: null
            }
        }
    }

    /**
     * Function that define widget of fsync
     * @param {String} entityGuid Identifier unique of integration 
     * @returns
     * @memberof DashboardMysqlDefault
     */
    createWidgetFsync(entityGuid) {
        return {
            visualization: "line_chart",
            layout: {
                width: 4,
                height: 3,
                row: 1,
                column: 9
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT sum(db.innodb.osLogFsyncsPerSecond) as 'fsyncs per second'  FROM MysqlSample WHERE entityGuid = '${entityGuid}' TIMESERIES AUTO `
                }
            ],
            presentation: {
                title: "MySQL fsync op count (per sec)",
                notes: null
            }
        }
    }

    /**
     * Function that define widget with slow queries
     * @param {String} entityGuid Identifier unique of integration 
     * @returns
     * @memberof DashboardMysqlDefault
     */
    createWidgetSlowQueries(entityGuid) {
        return {
            visualization: "line_chart",
            layout: {
                width: 4,
                height: 3,
                row: 4,
                column: 1
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT sum(query.slowQueriesPerSecond) AS 'slow queries per second' from MysqlSample where entityGuid='${entityGuid}' TIMESERIES  AUTO `
                }
            ],
            presentation: {
                title: "MySQL slow queries",
                notes: null
            }
        }
    }

    /**
     * Function that define widget with locking rate
     * @param {String} entityGuid
     * @returns
     * @memberof DashboardMysqlDefault
     */
    createWidgetLockingRate(entityGuid) {
        return {
            visualization: "line_chart",
            layout: {
                width: 4,
                height: 3,
                row: 4,
                column: 5
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT sum(db.tablesLocksWaitedPerSecond) as 'tables locks waited per second' from MysqlSample where entityGuid='${entityGuid}' TIMESERIES  AUTO `
                }
            ],
            presentation: {
                title: "MySQL locking rate (per sec)",
                notes: null
            }
        }
    }

    /**
     * Function that define widget with load averages between 1 - 5 - 15 minutes
     * @param {String} entityGuidHost
     * @returns
     * @memberof DashboardMysqlDefault
     */
    createWidgetLoadAverages(entityGuidHost) {
        return {
            visualization: "line_chart",
            layout: {
                width: 4,
                height: 3,
                row: 4,
                column: 9
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT average(loadAverageOneMinute),average(loadAverageFiveMinute),average(loadAverageFifteenMinute) from SystemSample where entityGuid='${entityGuidHost}' timeseries auto`
                }
            ],
            presentation: {
                title: "System load",
                notes: null
            }
        }
    }

    /**
     * Function that define cpu usage of host
     * @param {String} entityGuidHost
     * @returns
     * @memberof DashboardMysqlDefault
     */
    createWidgetCpuUsage(entityGuidHost) {
        return {
            visualization: "faceted_area_chart",
            layout: {
                width: 4,
                height: 3,
                row: 7,
                column: 1
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT average(cpuIdlePercent),average(cpuSystemPercent),average(cpuIOWaitPercent),average(cpuUserPercent),average(cpuStealPercent) from SystemSample WHERE entityGuid ='${entityGuidHost}' TIMESERIES auto`
                }
            ],
            presentation: {
                title: "CPU usage (%)",
                notes: null
            }
        }
    }

    /**
     * Function that define widget with Input and Outputs percentage of cpu
     * @param {String} entityGuidHost
     * @returns
     * @memberof DashboardMysqlDefault
     */
    createWidgetIO(entityGuidHost) {
        return {
            visualization: "line_chart",
            layout: {
                width: 4,
                height: 3,
                row: 7,
                column: 5
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT max(cpuIOWaitPercent) from SystemSample where entityGuid='${entityGuidHost}' timeseries auto`
                }
            ],
            presentation: {
                title: "I/O wait (%)",
                notes: null
            }
        }
    }

    /**
     * Function that define widget with memory of system
     * @param {*} entityGuidHost
     * @returns
     * @memberof DashboardMysqlDefault
     */
    createWidgetSystemMemory(entityGuidHost) {
        return {
            visualization: "faceted_area_chart",
            layout: {
                width: 4,
                height: 3,
                row: 7,
                column: 9
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT sum(memoryTotalBytes-(memoryTotalBytes-memoryUsedBytes)) as 'total memory - total memory usable',(sum(memoryTotalBytes)-sum(memoryUsedBytes)) as 'total memory usable' from SystemSample WHERE entityGuid ='${entityGuidHost}' TIMESERIES auto`
                }
            ],
            presentation: {
                title: "System memory",
                notes: null
            }
        }
    }

    /**
     * Function that define widget with bytes recieved and sent
     * @param {String} entityGuid
     * @returns
     * @memberof DashboardMysqlDefault
     */
    createWidgetNetworkTraffic(entityGuid) {
        return {
            visualization: "line_chart",
            layout: {
                width: 4,
                height: 3,
                row: 10,
                column: 1
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT sum(net.bytesReceivedPerSecond),sum(net.bytesSentPerSecond) FROM MysqlSample WHERE entityGuid = '${entityGuid}' TIMESERIES AUTO`
                }
            ],
            presentation: {
                title: "Network traffic (per sec)",
                notes: null
            }
        }
    }
    
}