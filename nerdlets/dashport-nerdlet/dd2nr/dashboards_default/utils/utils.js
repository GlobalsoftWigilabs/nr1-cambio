import {
    AccountsQuery,
    NrqlQuery
} from 'nr1';
import axios from 'axios';

async function getAccountId() {
    let accountId = null;
    await AccountsQuery.query()
        .then(({ data }) => {
            accountId = data[0].id;
        })
        .catch((err) => {
            console.log(err);
        });
    return accountId;
}

async function createDashboardApi(dashboard, xApiKey) {
    let obj = null;
    const options = {
        baseURL: `https://api.newrelic.com`,
        method: 'POST',
        headers: {
            'X-Api-Key': xApiKey,
            'Content-Type': 'application/json'
        },
        url: '/v2/dashboards.json',
        data: { dashboard }
    };
    await axios(options)
        .then(result => {
            obj=result.data.dashboard;
        })
        .catch(error => {
            if (error && error.response) {
                obj = {
                    status: error.response.status,
                    info: `${error.response.data.error.title} - ${error.response.statusText}`,
                    dashboardFailed: dashboard
                }
            }
        });
    return obj;
}

async function searchDashboardApi(parameter, xApiKey) {
    let obj = null;
    const options = {
        baseURL: `https://api.newrelic.com`,
        method: 'GET',
        headers: {
            'X-Api-Key': xApiKey,
            'Content-Type': 'application/json'
        },
        url: `/v2/dashboards.json?filter[title]=${parameter}`,
    };
    await axios(options)
        .then(result => {
            obj=result.data.dashboard;
        })
        .catch(error => {
            if (error && error.response) {
                obj = {
                    status: error.response.status,
                    info: `${error.response.data.error.title} - ${error.response.statusText}`
                }
            }
        });
    return obj;
}


async function recoveHostExist(accountId) {
    const myResult = await NrqlQuery.query({
        accountId: accountId,
        formatType: NrqlQuery.FORMAT_TYPE.RAW,
        query: "SELECT uniques(entityGuid) FROM SystemSample FACET hostname LIMIT max"
    });
    let listHost = [];
    for (const iterator of myResult.data.chart) {
        let nameHost = '';
        for (const group of iterator.metadata.groups) {
            if (group.name === 'hostname') {
                nameHost = group.value;
            }
        }
        listHost.push({
            name: nameHost,
            entityGuid: iterator.data[0].entityGuid,
        })
    }
    return listHost;
}

export {
    createDashboardApi,
    getAccountId,
    recoveHostExist,
    searchDashboardApi
}