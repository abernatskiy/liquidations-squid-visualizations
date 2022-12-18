import * as graphqlWs from 'graphql-ws'
import { Big } from 'big.js'

import { LiquidationsChart } from './liquidationsChart'

const COLLATERAL_TOKEN = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH

function weiStrToEth(weiStr, precision = 8) {
	let WEIS_PER_ETH = new Big(1_000_000_000_000_000_000n.toString()) // 10^18
	return new Big(weiStr).div(WEIS_PER_ETH).toFixed(precision)
}

function parseGraphQLReply(reply) {
	let rawData = reply['data']['liquidationEvents']
	return rawData.map(dataPoint => {
		return {
			id: dataPoint['id'],
			collateralAsset: dataPoint['collateralAsset'],
			debtAsset: dataPoint['debtAsset'],
			user: dataPoint['user'],
			debtToCover: BigInt(dataPoint['debtToCover']),
			liquidatedCollateralAmount: weiStrToEth(dataPoint['liquidatedCollateralAmount']),
			liquidator: dataPoint['liquidator'],
			receiveAToken: dataPoint['receiveAToken'],
			block: Number(dataPoint['block']),
			timestamp: Number(dataPoint['timestamp']),
			hash: dataPoint['hash']
		}
	})
}

const client = graphqlWs.createClient({url: 'ws://localhost:4350/graphql'})
const chart = new LiquidationsChart(document.getElementById('liquidations-chart'))

function doPlotUpdates(startAtTimestamp) {
	client.subscribe(
		{
			query: `
				subscription {
					liquidationEvents(orderBy: timestamp_ASC, where: {timestamp_gt: ${startAtTimestamp}, collateralAsset_eq: "${COLLATERAL_TOKEN}"}) {
						id collateralAsset debtAsset user debtToCover
						liquidatedCollateralAmount liquidator
						receiveAToken block timestamp hash
					}
				}
			`,
		},
		{
			next: rawReply => {
				let data = parseGraphQLReply(rawReply)
				chart.addData(data)
			},
			error: error => {
				throw `Error updating the plot: ${error}`
			},
			complete: () => {
				console.log('done!')
			},
		}
	)
}

function doAllPlotting(timeHorizon) {
	const timeHorizonToMillisecondsAgo = {
		'1 week': 7*24*60*60*1000,
		'1 month': 30.437*24*60*60*1000,
		'1 year': 365.2422*24*60*60*1000
	}
	let query
	if ( timeHorizon==='all' ) {
		query = `
			query {
				liquidationEvents(orderBy: timestamp_ASC, where: {collateralAsset_eq: "${COLLATERAL_TOKEN}"}) {
					id collateralAsset debtAsset user debtToCover
					liquidatedCollateralAmount liquidator
					receiveAToken block timestamp hash
				}
			}
		`
	} else {
		let timeHorizonTimestampDiff = timeHorizonToMillisecondsAgo[timeHorizon]
		let minTimestamp = new Date().getTime() - timeHorizonTimestampDiff
		query = `
			query {
				liquidationEvents(orderBy: timestamp_ASC, where: {timestamp_gt: ${minTimestamp}, collateralAsset_eq: "${COLLATERAL_TOKEN}"}) {
					id collateralAsset debtAsset user debtToCover
					liquidatedCollateralAmount liquidator
					receiveAToken block timestamp hash
				}
			}
		`
	}

	let maxStaticTimestamp
	client.subscribe(
		{ query },
		{
			next: rawReply => {
				let data = parseGraphQLReply(rawReply)
				chart.addData(data)
				maxStaticTimestamp = chart.getMaxTimestamp()
			},
			error: error => {
				throw `Error retrieving initial data: ${error}`
			},
			complete: () => {
				console.log('done but now to updates!')
				doPlotUpdates(maxStaticTimestamp)
			},
		}
	)
}

doAllPlotting('1 month')

processTimescaleChange = (arg) => {
	chart.clearData()
	doAllPlotting(arg)
}
