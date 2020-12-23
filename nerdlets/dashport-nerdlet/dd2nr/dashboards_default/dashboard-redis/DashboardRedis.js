import { getAccountId, createDashboardApi } from '../utils/utils';

/**
 * Class that define and create dashboards with widgets
 * for default created in base to datadog dashboard redis integration preset
 * @export
 * @class DashboardRedisDefault
 */
export default class DashboardRedisDefault {

    /**
     *Creates an instance of DashboardRedisDefault.
     * @memberof DashboardRedisDefault
     */
    constructor() {
        this.accountId = 0;
    }

    /**
     * Function that execute creation de dashboards for default of integration with redis
     * @param {Array} redisIntegrations List of integrations redis where is obligated include name and entityGuid of integration redis
     * @param {String} xApiKey Api key of user for consume api of dashboards
     * @memberof DashboardRedisDefault
     */
    async createDashboards(redisIntegrations, xApiKey) {
        this.accountId = await getAccountId();
        let dashboardsCreated = [];
        for (const redisIntegration of redisIntegrations) {
            redisIntegration.grid_column_count = 12;
            redisIntegration.widgets = this.createWidgets(redisIntegration.entityGuid);
            redisIntegration.title = redisIntegration.name;
            redisIntegration.icon = "line-chart"
            redisIntegration.visibility = "all"
            redisIntegration.editable = "editable_by_all"
            redisIntegration.metadata = { "version": 1 }
            delete redisIntegration.entityGuid;
            delete redisIntegration.name;
        }
        for (const redisIntegration of redisIntegrations) {
            const result = await createDashboardApi(redisIntegration, xApiKey);
            dashboardsCreated.push(result);
        }
        return dashboardsCreated;
    }

    /**
     * Function that it is responsible of return array of widgets
     * @param {String} entityGuid Identifier unique of host or entity
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgets(entityGuid) {
        let widgets = [];
        widgets.push(this.createWidgetRedisLogs());
        widgets.push(this.createWidgetBillBoardBlockedClients(entityGuid));
        widgets.push(this.createRedisKeySpace(entityGuid));
        widgets.push(this.createWidgetUnsavedChanges(entityGuid));
        widgets.push(this.createWidgetLogo());

        widgets.push(this.createWidgetTitlePerformanceMetrics());
        widgets.push(this.createWidgetTitleMemoryMetrics());
        widgets.push(this.createWidgetTitleBasicMetrics());
        widgets.push(this.createDescriptionBasicDashboard());

        widgets.push(this.createWidgetCommandsPerSecond(entityGuid));
        widgets.push(this.createWidgetEvictions(entityGuid));
        widgets.push(this.createWidgetConnectedSlaves(entityGuid));

        widgets.push(this.createWidgetCacheHitRate(entityGuid));
        widgets.push(this.createWidgetFragmetationRatio(entityGuid));
        widgets.push(this.createWidgetRejectConnections(entityGuid));

        widgets.push(this.createWidgetBlockedClients(entityGuid));
        widgets.push(this.createWidgetInfoConnections());

        widgets.push(this.createWidgetUsedMemory(entityGuid));
        widgets.push(this.createWidgetConnectedClients(entityGuid));

        widgets.push(this.createWidgetInfoMemory());
        widgets.push(this.createWidgetKeys(entityGuid));

        return widgets;
    }

    /**
     * Function that define widget with link direct to logs of new relic
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetRedisLogs() {
        return {
            visualization: "markdown",
            layout: {
                width: 3,
                height: 2,
                row: 1,
                column: 1
            },
            account_id: this.accountId,
            data: [
                {
                    source: "# Redis logs\n[Open in log explorer](https://one.newrelic.com/launcher/logger.log-launcher)"
                }
            ],
            presentation: {
                title: "",
                notes: null
            }
        }

    }

    /**
     * Function that define widget related with blocked clients
     * @param {String} entityGuid Identifier unique of integration redis
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetBillBoardBlockedClients(entityGuid) {
        return {
            visualization: "billboard",
            layout: {
                width: 2,
                height: 2,
                row: 1,
                column: 4
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT latest(net.blockedClients) as 'Blocked clients' from RedisSample WHERE entityGuid='${entityGuid}'`
                }
            ],
            presentation: {
                title: "",
                notes: null,
                threshold: {
                    "red": null,
                    "yellow": null
                }
            }
        }
    }

    /**
     * Function that define widget of key space
     * @param {String} entityGuid Identifier unique of integration 
     * @returns
     * @memberof DashboardRedisDefault
     */
    createRedisKeySpace(entityGuid) {
        return {
            visualization: "billboard",
            layout: {
                width: 2,
                height: 2,
                row: 1,
                column: 6
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT  latest(db.keys) as 'redis keyspace' from RedisKeyspaceSample WHERE entityGuid='${entityGuid}'`
                }
            ],
            presentation: {
                title: "",
                notes: null,
                threshold: {
                    red: null,
                    yellow: null
                }
            }
        }
    }

    /**
     * Function that define widget unsaved changes
     * @param {*} entityGuid Identifier unique of integration 
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetUnsavedChanges(entityGuid) {
        return {
            visualization: "billboard",
            layout: {
                width: 2,
                height: 2,
                row: 1,
                column: 8
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT latest(db.rdbChangesSinceLastSave) as 'Unsaved changes' from RedisSample WHERE entityGuid='${entityGuid}'`
                }
            ],
            presentation: {
                title: "",
                notes: null,
                threshold: {
                    "red": null,
                    "yellow": null
                }
            }
        }
    }

    /**
     * Function that define widget that show logo of redis
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetLogo() {
        return {
            visualization: "markdown",
            layout: {
                width: 2,
                height: 2,
                row: 1,
                column: 10
            },
            account_id: this.accountId,
            data: [
                {
                    source: "![Add Images](https://upload.wikimedia.org/wikipedia/commons/6/6b/Redis_Logo.svg)"
                }
            ],
            presentation: {
                title: "",
                notes: null
            }
        }
    }

    /**
     * Function that define widget title of performance metrics
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetTitlePerformanceMetrics() {
        return {
            visualization: "markdown",
            layout: {
                width: 3,
                height: 1,
                row: 3,
                column: 1
            },
            account_id: this.accountId,
            data: [
                {
                    source: "## Performance metrics"
                }
            ],
            presentation: {
                title: "",
                notes: null
            }
        }
    }

    /**
     * Function that define widget title of basic memory metrics
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetTitleMemoryMetrics() {
        return {
            visualization: "markdown",
            layout: {
                width: 3,
                height: 1,
                row: 3,
                column: 4
            },
            account_id: this.accountId,
            data: [
                {
                    source: "## Memory metrics"
                }
            ],
            presentation: {
                title: "",
                notes: null
            }
        }
    }

    /**
     * Function that define widget title of basic metrics
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetTitleBasicMetrics() {
        return {
            visualization: "markdown",
            layout: {
                width: 3,
                height: 1,
                row: 3,
                column: 7
            },
            account_id: this.accountId,
            data: [
                {
                    source: "## Basic activity metrics"
                }
            ],
            presentation: {
                title: "",
                notes: null
            }
        }
    }

    /**
     * Function that define widget description basic related to dashboard
     * @returns
     * @memberof DashboardRedisDefault
     */
    createDescriptionBasicDashboard() {
        return {
            visualization: "markdown",
            layout: {
                width: 3,
                height: 4,
                row: 3,
                column: 10
            },
            account_id: this.accountId,
            data: [
                {
                    source: "This dashboard shows latency information and slow query counts that summarize your Redis master's performance, as well as memory metrics to help you manage your Redis instance. For more information, see:\n* [Official Redis documentation](https://docs.newrelic.com/docs/integrations/host-integrations/host-integrations-list/redis-monitoring-integration)\n\nEdit this template dashboard to make changes and add your own graph widgets."
                }
            ],
            presentation: {
                title: "",
                notes: null
            }
        }
    }

    /**
     * Function that define widget related commands per second
     * @param {String} entityGuid
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetCommandsPerSecond(entityGuid) {
        return {
            visualization: "line_chart",
            layout: {
                width: 3,
                height: 3,
                row: 4,
                column: 1
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT average(net.commandsProcessedPerSecond) as 'Commands' FROM RedisSample WHERE entityGuid = '${entityGuid}' TIMESERIES auto`
                }
            ],
            presentation: {
                title: "Commands per second",
                notes: null
            }
        }
    }

    /**
     * Function that define widget related evictions
     * @param {String} entityGuid
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetEvictions(entityGuid) {
        return {
            visualization: "line_chart",
            layout: {
                width: 3,
                height: 3,
                row: 4,
                column: 4
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT sum(db.evictedKeysPerSecond) AS 'evicted keys' from RedisSample WHERE entityGuid = '${entityGuid}' TIMESERIES auto`
                }
            ],
            presentation: {
                title: "Evictions",
                notes: null
            }
        }
    }

    /**
     * Function that define widget related to slaves connected
     * @param {String} entityGuid
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetConnectedSlaves(entityGuid) {
        return {
            visualization: "line_chart",
            layout: {
                width: 3,
                height: 3,
                row: 4,
                column: 7
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT sum(cluster.connectedSlaves) AS 'connected slaves' from RedisSample WHERE entityGuid = '${entityGuid}' TIMESERIES AUTO `
                }
            ],
            presentation: {
                title: "Connected slaves",
                notes: null
            }
        }
    }

    /**
     * Function that define widget related to cache hit rate
     * @param {String} entityGuid
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetCacheHitRate(entityGuid) {
        return {
            visualization: "line_chart",
            layout: {
                width: 3,
                height: 3,
                row: 7,
                column: 1
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT ( average(db.keyspaceHitsPerSecond/60)  / ( average(db.keyspaceHitsPerSecond/60) + average(db.keyspaceMissesPerSecond/60) ) ) * 100 as 'cache hit rate',100 as 'full',75 as 'investigate' from RedisSample WHERE entityGuid = '${entityGuid}' TIMESERIES AUTO`
                }
            ],
            presentation: {
                title: "Cache hit rate",
                notes: null
            }
        }
    }

    /**
     * Function that define widget related to fragmetation ratio
     * @param {String} entityGuid
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetFragmetationRatio(entityGuid) {
        return {
            visualization: "line_chart",
            layout: {
                width: 3,
                height: 3,
                row: 7,
                column: 4
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT sum(system.memFragmentationRatio),1.5 as 'restart redis' from RedisSample WHERE entityGuid = '${entityGuid}' TIMESERIES AUTO `
                }
            ],
            presentation: {
                title: "Fragmentation ratio",
                notes: null
            }
        }
    }

    /**
     * Function that define widget related to reject connections
     * @param {String} entityGuid
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetRejectConnections(entityGuid) {
        return {
            visualization: "line_chart",
            layout: {
                width: 3,
                height: 3,
                row: 7,
                column: 7
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT sum(net.rejectedConnectionsPerSecond) as 'rejected connections' from RedisSample WHERE entityGuid = '${entityGuid}' TIMESERIES AUTO `
                }
            ],
            presentation: {
                title: "Rejected connections",
                notes: null
            }
        }
    }

    /**
     * Function that define widget related to blocked clients
     * @param {String} entityGuid
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetBlockedClients(entityGuid) {
        return {
            visualization: "line_chart",
            layout: {
                width: 3,
                height: 3,
                row: 10,
                column: 4
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT average(net.blockedClients) as 'Blocked clients' from RedisSample WHERE entityGuid = '${entityGuid}' TIMESERIES AUTO `
                }
            ],
            presentation: {
                title: "Blocked clients",
                notes: null
            }
        }
    }

    /**
     * Function that define widget describe related connections in redis
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetInfoConnections() {
        return {
            visualization: "markdown",
            layout: {
                width: 3,
                height: 3,
                row: 10,
                column: 7
            },
            account_id: this.accountId,
            data: [
                {
                    source: "Redis is capable of handling many active connections, with a default of 10,000 client connections available. \r\n\r\nYou can set the maximum number of connections to a different value, by altering the `maxclient` directive in redis.conf. Any new connection attempts will be disconnected if your Redis instance is currently at its maximum number of connections."
                }
            ],
            presentation: {
                title: "",
                notes: null
            }
        }
    }

    /**
     * Function that define widget related to use of memory
     * @param {String} entityGuid
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetUsedMemory(entityGuid) {
        return {
            visualization: "faceted_area_chart",
            layout: {
                width: 3,
                height: 3,
                row: 13,
                column: 4
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT sum(system.usedMemoryBytes) as 'Used memory' from RedisSample WHERE entityGuid = '${entityGuid}' TIMESERIES auto`
                }
            ],
            presentation: {
                title: "Used memory",
                notes: null
            }
        }
    }

    /**
     * Function that define widget related to connected clients
     * @param {String} entityGuid
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetConnectedClients(entityGuid) {
        return {
            visualization: "line_chart",
            layout: {
                width: 3,
                height: 3,
                row: 13,
                column: 7
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT latest(net.connectedClients) as 'connected clients' from RedisSample WHERE entityGuid = '${entityGuid}' TIMESERIES auto`
                }
            ],
            presentation: {
                title: "Connected clients",
                notes: null
            }
        }
    }

    /**
     * Function that define widget describe related usage of memory
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetInfoMemory() {
        return {
            visualization: "markdown",
            layout: {
                width: 3,
                height: 3,
                row: 16,
                column: 4
            },
            account_id: this.accountId,
            data: [
                {
                    source: "Memory usage is a critical component of Redis performance. If used_memory exceeds the total available system memory, the operating system will begin swapping old/unused sections of memory.\r\n\r\nEvery swapped section is written to disk, severely affecting performance. Writing or reading from disk is up to 5 orders of magnitude (100,000x!) slower than writing or reading from memory (0.1 µs for memory vs. 10 ms for disk)."
                }
            ],
            presentation: {
                title: "",
                notes: null
            }
        }
    }

    /**
     * Function that define widget related to quantity of queys
     * @param {String} entityGuid
     * @returns
     * @memberof DashboardRedisDefault
     */
    createWidgetKeys(entityGuid) {
        return {
            visualization: "faceted_area_chart",
            layout: {
                width: 3,
                height: 3,
                row: 16,
                column: 7
            },
            account_id: this.accountId,
            data: [
                {
                    nrql: `SELECT latest(db.keys) from RedisKeyspaceSample WHERE entityGuid = '${entityGuid}' TIMESERIES AUTO `
                }
            ],
            presentation: {
                title: "Keys",
                notes: null
            }
        }
    }

}