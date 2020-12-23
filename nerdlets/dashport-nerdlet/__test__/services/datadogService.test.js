import { validateKeys, _setHttpHeaders, _getChildsApi, _getPartentList, _filterQueryParams } from '../../services/Datadog/DD';
import list from '../../services/Datadog/data/formatted_endpoints.json';

describe('Test datadog service', () => {

    test('Test validated keys', async () => {
        const value = await validateKeys("xxxxxxx...", "xxxxxxx...");
        expect(value).toEqual({
            apikey: false,
            appkey: false
        });
    });

    test('Test set http headers', () => {
        const value = _setHttpHeaders([
            {
                "key": "DD-API-KEY",
                "value": "{{datadog_api_key}}"
            },
            {
                "key": "DD-APPLICATION-KEY",
                "value": "{{datadog_application_key}}"
            }
        ]);
        expect(value).toEqual({
            "DD-API-KEY": "null",
            "DD-APPLICATION-KEY": "null"
        });
    });

    test('Test childs api', () => {
        const value = _getChildsApi(list, "Get all Dashboards");
        expect(value).toEqual([{
            name: "Get a Dashboard",
            url: "https://api.datadoghq.{{datadog_site}}/api/v1/dashboard/:DASHBOARD_ID",
            proto: "https",
            host: "api.datadoghq.{{datadog_site}}",
            pathname: "/api/v1/dashboard/:DASHBOARD_ID",
            search: "",
            headers: [
                {
                    key: "Content-Type",
                    value: "application/json"
                },
                {
                    key: "DD-API-KEY",
                    value: "{{datadog_api_key}}"
                },
                {
                    key: "DD-APPLICATION-KEY",
                    value: "{{datadog_application_key}}"
                }
            ]
        }]);
    });

    test('Test filter parent list', () => {
        const value = _getPartentList(list);
        expect(value.length).toBeCloseTo(18);
    });
});
