import { Chart } from 'chart.js/auto'
import zoomPlugin from 'chartjs-plugin-zoom'
import 'chartjs-adapter-moment'
import { QuasiCyclicPointProperty } from './quasiCyclicPointProperty'

Chart.register(zoomPlugin)

export class LiquidationsChart {
	dataPointsToChartInputs(dataPoints) {
		let data = dataPoints.map(dp => ({ x: dp.timestamp, y: dp.liquidatedCollateralAmount }))
		let fullData = dataPoints.map(dp => dp)
		let backgroundColor = dataPoints.map(dp => this.colorMapping.getProperty(dp.liquidator))
		let borderColor = backgroundColor
		let pointStyle = dataPoints.map(dp => this.styleMapping.getProperty(dp.debtAsset))
		return { data, fullData, backgroundColor, borderColor, pointStyle }
	}

	constructor(canvas) {
		const chartData = {
			datasets: [{
				label: 'AAVE v2 liquidations',
				borderWidth: 2,
				pointRadius: 4,
				...this.dataPointsToChartInputs([])
			}]
		}

		const pluginsConfig = {
			tooltip: {
				callbacks: {
					label: (ctx) => {
						let fullDataPoint = ctx.chart.data.datasets[ctx.datasetIndex].fullData[ctx.dataIndex]
						return Object.entries(fullDataPoint).map(([k, v], i) => `${k}: ${v}`)
					}
				}
			},
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
					x: { type: 'time' },
					y: {
						type: 'logarithmic',
						title: {
							text: 'WETH',
							display: true
						}
					}
				},
				plugins: pluginsConfig
			}
		}

		this.chart = new Chart(canvas, config)

		this.colorMapping = new QuasiCyclicPointProperty('color')
		this.styleMapping = new QuasiCyclicPointProperty('style')
	}

	getMaxTimestamp() {
		return this.chart.data.datasets[0].data.at(-1).x
	}

	addData(rawData) {
		let { data, fullData, backgroundColor, borderColor, pointStyle } = this.dataPointsToChartInputs(rawData)
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
		fullData.splice(0, shift)
		backgroundColor.splice(0, shift)
		borderColor.splice(0, shift)
		pointStyle.splice(0, shift)
		console.log(`Added ${data.length} points`)
		console.log(data)
		this.chart.data.datasets[0].data.push(...data)
		this.chart.data.datasets[0].fullData.push(...fullData)
		this.chart.data.datasets[0].backgroundColor.push(...backgroundColor)
		this.chart.data.datasets[0].borderColor.push(...borderColor)
		this.chart.data.datasets[0].pointStyle.push(...pointStyle)
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
