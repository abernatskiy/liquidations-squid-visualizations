import distinctColors from "distinct-colors"

// https://codesandbox.io/s/distinct-colors-i4k65
const allColors = distinctColors({
  count: 20,
  chromaMin: 30,
  chromaMax: 80,
  lightMin: 35,
  lightMax: 80
}).map(color => `rgb(${color.rgb().join(',')})`)

// all sufficiently distinct styles from https://www.chartjs.org/docs/latest/configuration/elements.html#point-styles
const allStyles = [
	'circle', 'cross',   'crossRot',
	'rect',   'rectRot', 'triangle'
]

export class QuasiCyclicPointProperty {
	incrementIdx() {
		this.currentIdx++
		if ( this.currentIdx>=this.allPropertyValues.length ) {
			this.currentIdx = 0
		}
	}

	constructor(propertyType) {
		if ( propertyType==='style' ) {
			this.allPropertyValues = allStyles
		} else if ( propertyType==='color' ) {
			this.allPropertyValues = allColors
		} else {
			throw `QuasiCyclicPointProperty: ${propertyType} is not an acceptable value for propertyType`
		}

		this.currentIdx = 0
		this.mapping = {}
		this.recentlyReturnedPropertyValues = new Set()
		this.maxRecentlyReturnedPropertyValues = 2
	}

	getProperty(value) {
		let newPropertyValue
		if ( value in this.mapping ) {
			newPropertyValue = this.mapping[value]
		} else {
			while ( this.recentlyReturnedPropertyValues.has(this.allPropertyValues[this.currentIdx]) ) {
				this.incrementIdx()
			}
			newPropertyValue = this.allPropertyValues[this.currentIdx]
			this.incrementIdx()
			this.mapping[value] = newPropertyValue
		}

		this.recentlyReturnedPropertyValues.add(newPropertyValue)
		if ( this.recentlyReturnedPropertyValues.size>this.maxRecentlyReturnedPropertyValues ) {
			let leastRecentValue = this.recentlyReturnedPropertyValues.keys().next().value
			this.recentlyReturnedPropertyValues.delete(leastRecentValue)
		}

		return newPropertyValue
	}

	reset() {
		this.currentIdx = 0
		this.mapping = {}
		this.recentlyReturnedPropertyValues = new Set()
	}
}
