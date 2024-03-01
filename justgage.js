var config = {
// id : string
// this is container element id
id: config.id,

// value : float
// value gauge is showing
value: kvLookup('value', config, dataset, 0, 'float'),

// defaults : bool
// defaults parameter to use
defaults: kvLookup('defaults', config, dataset, 0, false),

// parentNode : node object
// this is container element
parentNode: kvLookup('parentNode', config, dataset, null),

// width : int
// gauge width
width: kvLookup('width', config, dataset, null),

// height : int
// gauge height
height: kvLookup('height', config, dataset, null),

// valueFontColor : string
// color of label showing current value
valueFontColor: kvLookup('valueFontColor', config, dataset, "#010101"),

// valueFontFamily : string
// color of label showing current value
valueFontFamily: kvLookup('valueFontFamily', config, dataset, "Arial"),

// symbol : string
// special symbol to show next to value
symbol: kvLookup('symbol', config, dataset, ''),

// min : float
// min value
min: kvLookup('min', config, dataset, 0, 'float'),

// minTxt : string
// min value text
minTxt: kvLookup('minTxt', config, dataset, false),

// max : float
// max value
max: kvLookup('max', config, dataset, 100, 'float'),

// maxTxt : string
// max value text
maxTxt: kvLookup('maxTxt', config, dataset, false),

// reverse : bool
// reverse min and max
reverse: kvLookup('reverse', config, dataset, false),

// humanFriendlyDecimal : int
// number of decimal places for our human friendly number to contain
humanFriendlyDecimal: kvLookup('humanFriendlyDecimal', config, dataset, 0),


// textRenderer: func
// function applied before rendering text
textRenderer: kvLookup('textRenderer', config, dataset, null),

// on<a href="https://www.jqueryscript.net/animation/">Animation</a>End: func
// function applied after animation is done
onAnimationEnd: kvLookup('onAnimationEnd', config, dataset, null),

// gaugeWidthScale : float
// width of the gauge element
gaugeWidthScale: kvLookup('gaugeWidthScale', config, dataset, 1.0),

// gaugeColor : string
// background color of gauge element
gaugeColor: kvLookup('gaugeColor', config, dataset, "#edebeb"),

// label : string
// text to show below value
label: kvLookup('label', config, dataset, ''),

// labelFontColor : string
// color of label showing label under value
labelFontColor: kvLookup('labelFontColor', config, dataset, "#b3b3b3"),

// valueFontFamily : string
// font-family for label as well as min/max value
labelFontFamily: kvLookup('labelFontFamily', config, dataset, "Arial"),

// shadowOpacity : int
// 0 ~ 1
shadowOpacity: kvLookup('shadowOpacity', config, dataset, 0.2),

// shadowSize: int
// inner shadow size
shadowSize: kvLookup('shadowSize', config, dataset, 5),

// shadowVerticalOffset : int
// how much shadow is offset from top
shadowVerticalOffset: kvLookup('shadowVerticalOffset', config, dataset, 3),

// levelColors : string[]
// colors of indicator, from lower to upper, in RGB format
levelColors: kvLookup('levelColors', config, dataset, ["#a9d70b", "#f9c802", "#ff0000"], 'array', ','),

// startAnimationTime : int
// length of initial animation
startAnimationTime: kvLookup('startAnimationTime', config, dataset, 700),

// startAnimationType : string
// type of initial animation (linear, >, <,  <>, bounce)
startAnimationType: kvLookup('startAnimationType', config, dataset, '>'),

// refreshAnimationTime : int
// length of refresh animation
refreshAnimationTime: kvLookup('refreshAnimationTime', config, dataset, 700),

// refreshAnimationType : string
// type of refresh animation (linear, >, <,  <>, bounce)
refreshAnimationType: kvLookup('refreshAnimationType', config, dataset, '>'),

// donutStartAngle : int
// angle to start from when in donut mode
donutStartAngle: kvLookup('donutStartAngle', config, dataset, 90),

// valueMinFontSize : int
// absolute minimum font size for the value
valueMinFontSize: kvLookup('valueMinFontSize', config, dataset, 16),

// labelMinFontSize
// absolute minimum font size for the label
labelMinFontSize: kvLookup('labelMinFontSize', config, dataset, 10),

// minLabelMinFontSize
// absolute minimum font size for the minimum label
minLabelMinFontSize: kvLookup('minLabelMinFontSize', config, dataset, 10),

// maxLabelMinFontSize
// absolute minimum font size for the maximum label
maxLabelMinFontSize: kvLookup('maxLabelMinFontSize', config, dataset, 10),

// hideValue : bool
// hide value text
hideValue: kvLookup('hideValue', config, dataset, false),

// hideMinMax : bool
// hide min and max values
hideMinMax: kvLookup('hideMinMax', config, dataset, false),

// showInnerShadow : bool
// show inner shadow
showInnerShadow: kvLookup('showInnerShadow', config, dataset, false),

// humanFriendly : bool
// convert large numbers for min, max, value to human friendly (e.g. 1234567 -> 1.23M)
humanFriendly: kvLookup('humanFriendly', config, dataset, false),

// noGradient : bool
// whether to use gradual color change for value, or sector-based
noGradient: kvLookup('noGradient', config, dataset, false),

// donut : bool
// show full donut gauge
donut: kvLookup('donut', config, dataset, false),

// relativeGaugeSize : bool
// whether gauge size should follow changes in container element size
relativeGaugeSize: kvLookup('relativeGaugeSize', config, dataset, false),

// counter : bool
// animate level number change
counter: kvLookup('counter', config, dataset, false),

// decimals : int
// number of digits after floating point
decimals: kvLookup('decimals', config, dataset, 0),

// customSectors : object
// custom sectors colors. Expects an object with props
// percents : bool hi/lo are percents values
// ranges : array of objects : {hi, lo, color}
customSectors: kvLookup('customSectors', config, dataset, {}),

// formatNumber: boolean
// formats numbers with commas where appropriate
formatNumber: kvLookup('formatNumber', config, dataset, false),

// pointer : bool
// show value pointer
pointer: kvLookup('pointer', config, dataset, false),

// min must = -max and pointer will be at top when = 0
differential: true,

// pointerOptions : object
// define pointer look
pointerOptions: kvLookup('pointerOptions', config, dataset, {}),

// displayRemaining: boolean
// replace display number with the number remaining to reach max
displayRemaining: kvLookup('displayRemaining', config, dataset, false)
}