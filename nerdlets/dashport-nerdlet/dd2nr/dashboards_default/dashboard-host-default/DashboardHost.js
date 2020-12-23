import { getAccountId, createDashboardApi } from '../utils/utils';

/**
 * Class that define and create dashboards with widgets
 * for default created in base to datadog dashboards host preset
 * @export
 * @class DashboardHostDefault
 */
export default class DashboardHostDefault {
    
    /**
     *Creates an instance of DashboardHostDefault.
     * @memberof DashboardHostDefault
     */
    constructor() {
        this.accountId = 0;
    }

    /**
     * Function that execute creation de dashboards for default of a host
     * @param {Array} host List of host where is obligated include name and entityGuid of host
     * @param {String} xApiKey Api key of user for consume api of dashboards
     * @memberof DashboardDefault
     */
    async createDashboards(hosts,xApiKey) {
        this.accountId = await getAccountId();
        let dashboardsCreated=[];
        for (const host of hosts) {
            host.grid_column_count = 12;
            host.widgets = this.createWidgets(host.entityGuid);
            host.title = host.name;
            host.icon = "line-chart"
            host.visibility = "all"
            host.editable = "editable_by_all"
            host.metadata = { "version": 1 }
            delete host.entityGuid;
            delete host.name;
        }
        for (const host of hosts) {
            const result=await createDashboardApi(host,xApiKey);
            dashboardsCreated.push(result);
        }
        return dashboardsCreated;
    }

    /**
     * Function that it is responsible of return array of widgets
     * @param {String} entityGuid Identifier unique of host or entity
     * @returns
     * @memberof DashboardDefault
     */
    createWidgets(entityGuid) {
        let widgets = [];
        widgets.push(this.createWidgetCpuUsage(entityGuid));
        widgets.push(this.createWidgetMemoryBreakDown(entityGuid));
        widgets.push(this.createWidgetLoadAverage(entityGuid));

        widgets.push(this.createWidgetAvaliableSwap(entityGuid));
        widgets.push(this.createWidgetDiskUsage(entityGuid));
        widgets.push(this.createWidgetNetworkTraffic(entityGuid));
        return widgets;
    }

    /**
     * Function that define widget related with usage of cpu
     * @param {String} entityGuid Identifier unique of integration 
     * @returns
     * @memberof DashboardDefault
     */
    createWidgetCpuUsage(entityGuid) {
        //CPU GUEST METRIC NOT SUPPORTED OR NOT FIND EQUIVALENT (system.cpu.guest)
        return {
            visualization: "faceted_area_chart",
            layout: {
                row: 1,
                column: 1,
                width: 4,
                height: 3
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT average(cpuIdlePercent),average(cpuSystemPercent),average(cpuIOWaitPercent),average(cpuUserPercent),average(cpuStealPercent) from SystemSample WHERE entityGuid = '${entityGuid}' TIMESERIES auto`
                }
            ],
            presentation: {
                title: "CPU usage (%)",
                notes: null
            }
        }
    }

    /**
     * Function that define widget related with load average between 1 - 5 - 15 minutes
     * @param {*} entityGuid Identifier unique of integration 
     * @returns
     * @memberof DashboardDefault
     */
    createWidgetLoadAverage(entityGuid) {
        return {
            visualization: "line_chart",
            layout: {
                row: 1,
                column: 5,
                width: 4,
                height: 3,
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT average(loadAverageOneMinute),average(loadAverageFiveMinute),average(loadAverageFifteenMinute) from SystemSample WHERE entityGuid = '${entityGuid}'  TIMESERIES auto`
                }
            ],
            presentation: {
                title: "Load averages 1-5-15",
                notes: null
            }
        }
    }

    /**
     * Function that define widget memory breakdown how memory usable and memory in use
     * @param {String} entityGuid Identifier unique of integration 
     * @returns
     * @memberof DashboardDefault
     */
    createWidgetMemoryBreakDown(entityGuid) {
        return {
            visualization: "faceted_area_chart",
            layout: {
                row: 1,
                column: 9,
                width: 4,
                height: 3
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT (sum(memoryTotalBytes)-sum(memoryUsedBytes)) as 'Total Memory Usable',sum(memoryTotalBytes) as 'Total Memory',(sum(memoryTotalBytes)-sum(memoryUsedBytes)-sum(memoryTotalBytes)) as 'Total Memory Usable -Total Memory' from SystemSample WHERE entityGuid = '${entityGuid}'  TIMESERIES auto`
                }
            ],
            presentation: {
                title: "Memory breakdown",
                notes: null
            }
        }
    }

    /**
     * Function that define widget related swap avaliable
     * @param {*} entityGuid Identifier unique of integration 
     * @returns
     * @memberof DashboardDefault
     */
    createWidgetAvaliableSwap(entityGuid) {
        return {
            visualization: "faceted_area_chart",
            layout: {
                width: 4,
                height: 3,
                row: 4,
                column: 1
            },
            account_id: this.accountId,
            data: [

                {
                    nrql: `SELECT average(swapFreeBytes),average(swapUsedBytes) from SystemSample WHERE entityGuid = '${entityGuid}' timeseries auto`
                }
            ],
            presentation: {
                title: "Avaliable Swap",
                notes: null
            }
        }
    }

    /**
     * Function that define widget related use in disk 
     * @param {*} entityGuid Identifier unique of integration 
     * @returns
     * @memberof DashboardDefault
     */
    createWidgetDiskUsage(entityGuid) {
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
                    nrql: `SELECT max(diskUsedPercent),100 as 'full' from SystemSample where entityGuid = '${entityGuid}' TIMESERIES AUTO`
                }
            ],
            presentation: {
                title: "Disk usage by device %",
                notes: null
            }
        }
    }

    /**
     *
     * Function that define widget network traffic
     * @param {*} entityGuid Identifier unique of integration 
     * @returns
     * @memberof DashboardDefault
     */
    createWidgetNetworkTraffic(entityGuid) {
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
                    nrql: `SELECT average(transmitBytesPerSecond) AS 'Transmit bytes per second', average(receiveBytesPerSecond) AS 'Receive bytes per second' FROM NetworkSample where entityGuid='${entityGuid}' TIMESERIES AUTO`
                }
            ],
            presentation: {
                title: "Network traffic (bytes per sec)",
                notes: null
            }
        }
    }

}