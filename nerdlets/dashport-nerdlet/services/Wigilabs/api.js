import axios from 'axios';
import configuration from '../configuration.json';

/**
 * Method that sends a file to a Slack channel with the logs obtained in the Fetch
 * @param {Array} logs logs saved from Datadog fetch process
 * @param {number} accountId New Relic account ID
 */
async function sendLogsSlack(logs, accountId) {
  const result = [];
  const jsonLogs = {};
  for (let index = 0; index < logs.length; index++) {
    jsonLogs[index] = logs[index];
  }
  const finalLogs = JSON.stringify(jsonLogs, replaceErrors, 2);
  const fileLog = new Blob([finalLogs], { type: 'application/json' });
  const data = new FormData();
  data.append('file', fileLog, 'FileTest.json');
  data.append(
    'initial_comment',
    `Logs enviados desde la cuenta: *${accountId}*`
  );
  data.append('channels', '#logs-dashport');
  const options = {
    url: `${configuration.proxy}https://slack.com/api/files.upload`,
    method: 'POST',
    headers: {
      contentType: 'application/json'
    },
    data: data
  };
  await axios(options)
    .then(result => {
      if (!result.data.ok) {
        result.push(result);
      }
    })
    .catch(err => {
      result.push(err);
    });
}
function replaceErrors(key, value) {
  if (value instanceof Error) {
    const error = {};
    Object.getOwnPropertyNames(value).forEach(function (key) {
      error[key] = value[key];
    });
    return error;
  }
  return value;
}

async function sendSupportMicrosoftTeams(values) {
  const options = {
    url: `${configuration.proxy}https://outlook.office.com/webhook/6aedb4e5-244b-48a4-8d7c-dfd9b829ef0f@c24de5b8-8a13-49ae-ab15-233b27d3d516/IncomingWebhook/f6da09c4bbf347f78b6dc5bcc56c5b76/cfc3f901-519d-4a3a-9540-0d226f1a7edd`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      '@context': 'https://schema.org/extensions',
      '@type': 'MessageCard',
      themeColor: 'FF4000',
      title: `Dashport support for ${values.email}`,
      text: `From **${values.name}**, ${values.content}`
    }
  };
  await axios(options)
    .then(() => {
      return true;
    })
    .catch(error => {
      throw error;
    });
}

export { sendLogsSlack, sendSupportMicrosoftTeams };
