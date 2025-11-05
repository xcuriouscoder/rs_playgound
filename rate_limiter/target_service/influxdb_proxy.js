const { InfluxDB, Point } = require('@influxdata/influxdb-client');

const client = new InfluxDB({ url:"http://influxdb:8086", token: process.env.INFLUXDB_TOKEN });

const writeApi = client.getWriteApi('rate_limiter_org', 'rate_limiter_metrics');

async function logMetricsToInfluxDB(ratelimit_method, httpResultCode) {
    const point = new Point('request_logs')
        .tag('rateLimiter', ratelimit_method)
        .intField('httpResultCode', httpResultCode)
        .timestamp(new Date());
    writeApi.writePoint(point);
    await writeApi.flush();
}
exports.logMetricsToInfluxDB = logMetricsToInfluxDB;


async function queryMetricsFromInfluxDB(ratelimit_method) {
    const queryApi = client.getQueryApi('rate_limiter_org');
    const query = `
from(bucket: "rate_limiter_metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "request_logs" and r.rateLimiter == "${ratelimit_method}")`;

    const rows = [];
    await new Promise((resolve, reject) => {
        queryApi.queryRows(query, {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                rows.push(o);
            },
            error(error) {
                reject(error);
            },
            complete() {
                resolve(rows);
            }
        });
    });

    return rows;
}
exports.queryMetricsFromInfluxDB = queryMetricsFromInfluxDB;

async function queryMetricsFromInfluxDBInMinuteBuckets(ratelimit_method) {
    const queryApi = client.getQueryApi('rate_limiter_org');
    const query = `
from(bucket: "rate_limiter_metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "request_logs" and r.rateLimiter == "${ratelimit_method}")
  |> aggregateWindow(every: 1m, fn: count, createEmpty: false)
  |> group(columns: ["httpResultCode"])`;

    const rows = [];
    await new Promise((resolve, reject) => {
        queryApi.queryRows(query, {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                rows.push(o);
            },
            error(error) {
                reject(error);
            },
            complete() {
                resolve(rows);
            }
        });
    });

    return rows;
}
exports.queryMetricsFromInfluxDBInMinuteBuckets = queryMetricsFromInfluxDBInMinuteBuckets;
