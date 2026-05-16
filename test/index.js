const React = require('react')
const assert = require('assert')
const ReactShallowRenderer = require('react-test-renderer/shallow')
const Tooltip = require('../src').default

const renderer = (Component) => {
  const shallowRenderer = new ReactShallowRenderer()
  shallowRenderer.render(Component)
  return shallowRenderer.getRenderOutput()
}

describe('React Portal Tooltip', () => {
  it('should export a react component', () => {
    assert.equal(typeof Tooltip, 'function')
  })

  it('should render null', () => {
    let tooltip = renderer(React.createElement(Tooltip, { parent: '#hey', position: 'top', arrow: 'center', active: false },
      React.createElement('span', null, 'Hey this is a tooltip')
    ))
    assert.equal(tooltip, null)
  })
})
