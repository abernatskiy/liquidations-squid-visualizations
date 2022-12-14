import { Chart } from 'chart.js/auto'

export class LiquidationsChart {
	dataPointsToChartInputs(dataPoints) {
		let data = [...dataPoints].map(dp => {
			return { x: dp.timestamp, y: dp.liquidatedCollateralAmount }
		})
		return { data }
	}

	constructor(canvas, initialData) {
		this.data = new Set(initialData)

		const chartData = {
			datasets: [{
				label: 'AAVE v2 liquidations',
				borderWidth: 2,
				pointRadius: 3,
				...this.dataPointsToChartInputs(this.data)
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
}
