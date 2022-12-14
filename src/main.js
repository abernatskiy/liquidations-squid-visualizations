import * as graphqlWs from 'graphql-ws'
import { Big } from 'big.js'

const collateralToken = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH

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
client.subscribe(
	{
		query: `
			query {
				liquidationEvents(where: {timestamp_gt: 1667906014000, collateralAsset_eq: "${collateralToken}"}) {
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
			console.log(data)
		},
		error: error => { console.error('error', error) },
		complete: () => { console.log('done!') },
	}
)
