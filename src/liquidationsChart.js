import { Chart } from 'chart.js/auto'

export class LiquidationsChart {
	dataPointsToChartInputs(dataPoints) {
		let data = dataPoints.map(dp => ({ x: dp.timestamp, y: dp.liquidatedCollateralAmount }))
		return { data }
	}

	constructor(canvas) {
		const chartData = {
			datasets: [{
				label: 'AAVE v2 liquidations',
				borderWidth: 2,
				pointRadius: 3,
				...this.dataPointsToChartInputs([])
			}]
		}

		const config = {
			type: 'scatter',
			data: chartData,
			options: {
				scales: {
					x: { type: 'linear' },
					y: { type: 'linear' }
				}
			}
		}

		this.chart = new Chart(canvas, config)
	}

	addData(rawData) {
		let { data } = this.dataPointsToChartInputs(rawData)
		let currentData = this.chart.data.datasets[0].data
		let shift = 0
		if ( currentData.length > 0) {
			// Determining the data overlap by looking at timesteps
			// No need to do an intra-timestep search: blocks, and
			// by extension timesteps, are "atomic" in a sense that
			// any arriving data will include all events of the block
			// or none at all
			while ( currentData.at(-1).x >= data.at(shift).x ) {
				shift++
			}
		}
		data.splice(0, shift)
		this.chart.data.datasets[0].data.push(...data)
		this.chart.update()
	}
}
