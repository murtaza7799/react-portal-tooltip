# react-portal-tooltip-upgraded

A modern React tooltip library that renders tooltips via a portal — keeping them outside your component tree so they always appear on top. This is a **React 18 compatible fork** of the original [react-portal-tooltip](https://github.com/romainberger/react-portal-tooltip) by [Romain Berger](https://github.com/romainberger).

[![npm version](https://img.shields.io/npm/v/react-portal-tooltip-upgraded.svg?style=flat-square)](https://www.npmjs.com/package/react-portal-tooltip-upgraded)
[![npm downloads](https://img.shields.io/npm/dm/react-portal-tooltip-upgraded.svg?style=flat-square)](https://www.npmjs.com/package/react-portal-tooltip-upgraded)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE.md)

![react tooltip demo](https://raw.githubusercontent.com/romainberger/react-portal-tooltip/master/react-portal-tooltip.gif)

---

## What's Different in This Fork

The original library was built for React 15/16. This fork fully modernises it for **React 18**:

- `ReactDOM.render` replaced with `createRoot` from `react-dom/client`
- `componentWillReceiveProps` replaced with `componentDidUpdate` — fully Strict Mode compatible
- `ReactDOM.unmountComponentAtNode` replaced with `root.unmount()`
- Peer dependencies updated to `react@^18.2.0` and `react-dom@^18.2.0`
- Dev dependencies bumped to current Babel 7 and Mocha 10
- Maintained full backwards compatibility with the original API

---

## Installation

```bash
npm install react-portal-tooltip-upgraded
```

```bash
yarn add react-portal-tooltip-upgraded
```

`prop-types` is a required peer dependency — install it if you don't already have it:

```bash
npm install prop-types
```

---

## Usage

### Basic Usage (Class Component)

```jsx
import React from 'react'
import ToolTip from 'react-portal-tooltip-upgraded'

class MyComponent extends React.Component {
  state = {
    isTooltipActive: false
  }

  showTooltip = () => this.setState({ isTooltipActive: true })
  hideTooltip = () => this.setState({ isTooltipActive: false })

  render() {
    return (
      <div>
        <p id="text" onMouseEnter={this.showTooltip} onMouseLeave={this.hideTooltip}>
          Hover over me
        </p>
        <ToolTip active={this.state.isTooltipActive} position="top" arrow="center" parent="#text">
          <div>
            <p>This is the tooltip content</p>
          </div>
        </ToolTip>
      </div>
    )
  }
}
```

### Function Component with Hooks

```jsx
import React, { useState } from 'react'
import ToolTip from 'react-portal-tooltip-upgraded'

function MyComponent() {
  const [isActive, setIsActive] = useState(false)

  return (
    <div>
      <button
        id="my-button"
        onMouseEnter={() => setIsActive(true)}
        onMouseLeave={() => setIsActive(false)}
      >
        Hover me
      </button>
      <ToolTip active={isActive} position="bottom" arrow="center" parent="#my-button">
        <p>Tooltip content here</p>
      </ToolTip>
    </div>
  )
}
```

---

## Stateful Tooltip

If you only need hover behaviour, use `StatefulToolTip` to avoid managing state yourself:

```jsx
import { StatefulToolTip } from 'react-portal-tooltip-upgraded'

const button = <span>Hover me to display the tooltip</span>

function MyComponent() {
  return (
    <StatefulToolTip parent={button} position="top" arrow="center">
      <p>Tooltip content here</p>
    </StatefulToolTip>
  )
}
```

`StatefulToolTip` accepts all the same props as `ToolTip`, plus a `className` prop applied to the wrapper `<span>` around the parent element.

---

## Referencing the Parent Element

The `parent` prop accepts either a CSS selector string or a DOM ref.

### Using a CSS ID selector

```jsx
<div id="hoverMe" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
  Hover me
</div>
<ToolTip active={isActive} position="top" arrow="center" parent="#hoverMe">
  <p>Tooltip content</p>
</ToolTip>
```

### Using a ref

```jsx
<div
  ref={el => { this.triggerEl = el }}
  onMouseEnter={showTooltip}
  onMouseLeave={hideTooltip}
>
  Hover me
</div>
<ToolTip active={isActive} position="top" arrow="center" parent={this.triggerEl}>
  <p>Tooltip content</p>
</ToolTip>
```

---

## Props

### ToolTip

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `parent` | `string \| Element` | **required** | CSS selector string or DOM element to position the tooltip against |
| `active` | `bool` | `false` | Controls visibility of the tooltip |
| `position` | `string` | `'right'` | Tooltip placement: `top`, `right`, `bottom`, or `left` |
| `arrow` | `string` | `null` | Arrow position: `center`, `top`, `right`, `bottom`, `left`. Omit for no arrow |
| `align` | `string` | `null` | Horizontal alignment of the tooltip relative to the parent: `center`, `left`, `right` |
| `group` | `string` | `'main'` | Unique group name — use different values when you need multiple independent tooltips on the same page |
| `tooltipTimeout` | `number` | `500` | Fade-out delay in milliseconds |
| `useHover` | `bool` | `true` | When `true`, the tooltip stays visible when the user hovers over it |
| `style` | `object` | `{}` | Style overrides — see [Custom Styling](#custom-styling) below |

### StatefulToolTip

Accepts all `ToolTip` props, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `parent` | `ReactElement` | **required** | The element that triggers the tooltip on hover |
| `className` | `string` | `''` | Class name applied to the wrapper `<span>` |

---

## Custom Styling

Pass a `style` object with two keys to customise the tooltip appearance:

```jsx
const tooltipStyle = {
  style: {
    background: '#1a1a2e',
    color: '#eee',
    padding: '8px 12px',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  arrowStyle: {
    color: '#1a1a2e',
    borderColor: 'transparent',
  }
}

<ToolTip active={isActive} position="top" arrow="center" parent="#btn" style={tooltipStyle}>
  <p>Styled tooltip</p>
</ToolTip>
```

> **Note:** `position`, `top`, `left`, `right`, `bottom`, `marginLeft`, and `marginRight` are reserved and will be ignored in the `style` object — the library controls positioning.

---

## Multiple Independent Tooltips

Use the `group` prop to give each tooltip its own portal node:

```jsx
<ToolTip active={activeA} position="top" arrow="center" parent="#btn-a" group="tooltip-a">
  Tooltip A
</ToolTip>

<ToolTip active={activeB} position="bottom" arrow="center" parent="#btn-b" group="tooltip-b">
  Tooltip B
</ToolTip>
```

---

## Development

```bash
# Install root dependencies
npm install

# Build the library
npm run build

# Watch for changes
npm start

# Run tests
npm test
```

**Running the example app:**

```bash
cd example
npm install
npm start
```

---

## Known Issues & Planned Improvements

- [x] Migrate from deprecated `ReactDOM.render` to `createRoot` for full React 18 support
- [x] Replace `componentWillReceiveProps` with `componentDidUpdate` for Strict Mode compatibility
- [x] Update the `example/` app to React 18
- [ ] Add TypeScript type definitions
- [ ] Replace Travis CI with GitHub Actions
- [ ] Expand test coverage (Card positioning, arrow styles, StatefulToolTip, cleanup)

---

## Credits

This package is a fork of **[react-portal-tooltip](https://github.com/romainberger/react-portal-tooltip)** originally created and maintained by [Romain Berger](https://github.com/romainberger). The core tooltip logic, positioning system, and API design are his work. This fork exists solely to provide React 18 compatibility while the original project was no longer maintained.

All credit for the original architecture goes to Romain Berger.

---

## Author & Maintainer

**Muhammad Murtaza**
- GitHub: [@murtaza7799](https://github.com/murtaza7799)
- Email: murtazasarwar@live.com

---

## License

MIT — see [LICENSE.md](LICENSE.md) for details.

Original work © Romain Berger. Modifications © 2023 Muhammad Murtaza.
