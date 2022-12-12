import { Chart } from 'chart.js/auto'

(async function() {

	const data = {
		datasets: [{
			label: 'liquidations',
			data: [{x: -10, y: 0}, {x: 0, y: 10}, {x: 10, y: 5}, {x: 0.5, y: 5.5}],
			backgroundColor: ['rgb(255, 99, 132)', 'rgb(255, 99, 0)', 'rgb(255, 0, 132)', 'rgb(0, 99, 132)'],
			borderColor: ['rgb(255, 99, 132)', 'rgb(255, 99, 0)', 'rgb(255, 0, 132)', 'rgb(0, 99, 132)'],
			pointStyle: ['circle', 'cross', 'crossRot', 'rect'],
			borderWidth: 3,
			pointRadius: 5
		}],
	};

	const config = {
		type: 'scatter',
		data: data,
		options: {
			scales: {
				x: {
					type: 'linear',
					position: 'bottom'
				}
			}
		}
	};

	new Chart(document.getElementById('liquidations-chart'), config);

})();
