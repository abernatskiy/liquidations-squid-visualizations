import { Chart } from 'chart.js/auto'
import zoomPlugin from 'chartjs-plugin-zoom'

Chart.register(zoomPlugin)

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

		const pluginsConfig = {
			zoom: {
				zoom: {
					mode: 'x',
					drag: {
						enabled: true
					}
				}
			}
		}

		const config = {
			type: 'scatter',
			data: chartData,
			options: {
				scales: {
					x: { type: 'linear' },
					y: { type: 'linear' }
				},
				plugins: pluginsConfig
			}
		}

		this.chart = new Chart(canvas, config)
	}

	getMaxTimestamp() {
		return this.chart.data.datasets[0].data.at(-1).x
	}

	addData(rawData) {
		let { data } = this.dataPointsToChartInputs(rawData)
		let currentData = this.chart.data.datasets[0].data
		let shift = 0
		// Determining the data overlap by looking at timesteps
		// No need to do an intra-timestep search: blocks, and
		// by extension timesteps, are "atomic" in a sense that
		// any arriving data will include all events of the block
		// or none at all
		while (
			currentData.length>0 &&
			shift<data.length &&
			this.getMaxTimestamp()>=data.at(shift).x
		) {
			shift++
		}
		data.splice(0, shift)
		console.log(`Added ${data.length} points`)
		console.log(data)
		this.chart.data.datasets[0].data.push(...data)
		this.chart.update()
	}

	clearData() {
		this.chart.data.datasets[0].data.length = 0 // clears the array
		this.chart.update()
	}

	resetZoom() {
		this.chart.resetZoom()
	}
}
