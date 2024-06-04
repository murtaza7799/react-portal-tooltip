# React Portal Tooltip React V18

Awesome tooltips.

[![Build Status](https://img.shields.io/travis/romainberger/react-portal-tooltip/master.svg?style=flat-square)](https://travis-ci.org/romainberger/react-portal-tooltip-upgraded) [![npm version](https://img.shields.io/npm/v/react-portal-tooltip.svg?style=flat-square)](https://www.npmjs.com/package/react-portal-tooltip-upgraded)
[![npm downloads](https://img.shields.io/npm/dm/react-portal-tooltip.svg?style=flat-square)](https://www.npmjs.com/package/react-portal-tooltip-upgraded)

![react tooltip](https://raw.githubusercontent.com/romainberger/react-portal-tooltip/master/react-portal-tooltip-upgraded.gif)

## Installation

```shell
$ npm install react-portal-tooltip-upgraded
```

```

## Usage

```javascript
import React from 'react'
import ToolTip from 'react-portal-tooltip-upgraded'

class MyComponent extends React.Component {
    state = {
        isTooltipActive: false
    }
    showTooltip() {
        this.setState({isTooltipActive: true})
    }
    hideTooltip() {
        this.setState({isTooltipActive: false})
    }
    render() {
        return (
            <div>
                <p id="text" onMouseEnter={this.showTooltip.bind(this)} onMouseLeave={this.hideTooltip.bind(this)}>This is a cool component</p>
                <ToolTip active={this.state.isTooltipActive} position="top" arrow="center" parent="#text">
                    <div>
                        <p>This is the content of the tooltip</p>
                        <img src="image.png"/>
                    </div>
                </ToolTip>
            </div>
        )
    }
}
```

### Props

* `active`: boolean, the tooltip will be visible if true
* `position`: top, right, bottom or left. Default to right
* `arrow`: center, right, left, top or bottom (depending on the position prop). No arrow when the prop is not sepecified
* `align`: the alignment of the whole tooltip relative to the `parent` element. possible values : center, right, left. Default to center.
* `tooltipTimeout`: timeout for the tooltip fade out in milliseconds. Default to 500
* `parent`: the tooltip will be placed next to this element. Can be the id of the parent or the ref (see example below)
* `group`: string, necessary if you want several independent tooltips
* `style`: object, allows customizing the tooltip. Checkout the [example](https://github.com/murtaza7799/react-portal-tooltip/blob/master/example/src/style.js) for details.
* `useHover` bool, default to true. If true, the tooltip will stay visible when hovered.

### Parent prop

You can use an id or a ref to reference the parent:

#### id

```javascript
<div id="hoverMe" onMouseEnter={this.showTooltip} onMouseLeave={this.hideTooltip}>
    Hover me!!!
</div>
<ToolTip active={this.state.isTooltipActive} position="top" arrow="center" parent="#hoverMe">
    <div>
        <p>This is the content of the tooltip</p>
    </div>
</ToolTip>
```

#### ref

```javascript
<div ref={(element) => { this.element = element }} onMouseEnter={this.showTooltip} onMouseLeave={this.hideTooltip}>
    Hover me!!!
</div>
<ToolTip active={this.state.isTooltipActive} position="top" arrow="center" parent={this.element}>
    <div>
        <p>This is the content of the tooltip</p>
    </div>
</ToolTip>
```

### Stateful ToolTip

If you only use the Tooltip for mouse enter / mouse leave, you may not want to handle the state yourself for all elements. In this case, you can use the stateful version which will do it for you:

Import the stateful version:

```js
import { StatefulToolTip } from "react-portal-tooltip-upgraded"
```

Then create your parent and give it as a prop to the Tooltip:

```js
const button = <span>Hover me to display the tooltip</span>

return (
  <StatefulToolTip parent={ button }>
    Stateful Tooltip content here!
  </StatefulToolTip>
)
```

`StatefulToolTip` takes the same props as `ToolTip`, plus a `className` prop that will be applied to the root element wrapping the parent ([see the example](https://github.com/murtaza7799/react-portal-tooltip/blob/master/example/src/stateful.js)).

[See the example live](http://murtaza7799.github.io/react-portal-tooltip/#/stateful).

## Development

```shell

# install the dependencies
$ npm install

# go to the example folder, then install more dependencies
$ cd example && npm install

# start the development server with hot reloading
$ npm start

# to build run this command from the root directory
$ npm build
```

## License

MIT
