# Components for the real-time AAVE v2 liquidation events chart

## ChartJS test chart

To see the chart, execute
```bash
$ npm i
$ npm run dev
```
and visit [localhost:1234](http://localhost:1234).

## GraphQL-ws example page

Get a [liquidations-squid](https://github.com/abernatskiy/liquidations-squid) instance running, then start HTTP server with
```bash
$ python -m http.server 9090
```
Visit [localhost:9090/graphqlwstest.html](http://localhost:9090/graphqlwstest.html) and go to console. After hitting refresh you should see parent transaction hashes and block numbers for ten latest AAVE liquidations.
