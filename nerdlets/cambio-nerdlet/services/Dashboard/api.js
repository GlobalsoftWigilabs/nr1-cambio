import axios from 'axios';
import { NerdGraphQuery } from 'nr1';

async function searchDashboardApi(parameter, xApiKey) {
  let obj = null;
  const options = {
    baseURL: `https://api.newrelic.com`,
    method: 'GET',
    headers: {
      'X-Api-Key': xApiKey,
      'Content-Type': 'application/json'
    },
    url: `/v2/dashboards.json?filter[title]=${parameter}`
  };
  await axios(options)
    .then(result => {
      obj = result.data.dashboards;
    })
    .catch(error => {
      if (error && error.response) {
        obj = {
          status: error.response.status,
          info: `${error.response.data.error.title} - ${error.response.statusText}`
        };
      }
    });
  return obj;
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
      obj = result.data.dashboard;
    })
    .catch(error => {
      if (error && error.response) {
        obj = {
          status: error.response.status,
          info: `${error.response.data.error.title} - ${error.response.statusText}`,
          dashboardFailed: dashboard
        };
      }
    });
  return obj;
}

async function validateQuery(accountId, query) {
  const gql = `{
        actor {
         account(id: ${accountId}) {
           nrql(query: "${query}") {
             results
           }
         }
       }
     }`;
  const dataInside = await NerdGraphQuery.query({ query: gql })
    .then(response => {
      return response.data.actor.account.nrql.results;
    })
    .catch(() => {
      return null;
    });
  return dataInside;
}

export { searchDashboardApi, createDashboardApi, validateQuery };
