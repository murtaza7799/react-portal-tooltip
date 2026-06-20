// Card positioning, arrow styles, and hover behaviour — requires a real DOM.
// Runs in jsdom, unlike test/index.js which intentionally runs WITHOUT a DOM
// to verify SSR safety. Keep these concerns separate.
//
// All DOM globals and hooks below are scoped inside the top-level describe()
// so they never leak into other test files (mocha treats bare beforeEach/
// afterEach as global hooks applying to the entire suite).

describe('Card (DOM)', () => {
  const { JSDOM } = require('jsdom')
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })

  const originalNavigator = Object.getOwnPropertyDescriptor(global, 'navigator')

  before(() => {
    global.window = dom.window
    global.document = dom.window.document
    // Node 20+ defines a built-in read-only `navigator` global — must
    // redefine the property descriptor rather than assign directly.
    Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true })
    global.IS_REACT_ACT_ENVIRONMENT = true
  })

  // Restore the no-DOM environment so test/index.js's SSR checks
  // (typeof document === 'undefined') stay valid regardless of file load order.
  after(() => {
    delete global.window
    delete global.document
    if (originalNavigator) {
      Object.defineProperty(global, 'navigator', originalNavigator)
    } else {
      delete global.navigator
    }
    delete global.IS_REACT_ACT_ENVIRONMENT
  })

  const React = require('react')
  const { createRoot } = require('react-dom/client')
  const { act } = require('react-dom/test-utils')
  const assert = require('assert')
  const Card = require('../src/Card').default

  // ─── helpers ────────────────────────────────────────────────────────────

  const makeEl = (rect = { top: 0, left: 0, width: 50, height: 20 }) => {
    const el = global.document.createElement('div')
    el.getBoundingClientRect = () => ({ ...rect, right: rect.left + rect.width, bottom: rect.top + rect.height })
    Object.defineProperty(el, 'offsetWidth', { value: rect.width, configurable: true })
    Object.defineProperty(el, 'offsetHeight', { value: rect.height, configurable: true })
    return el
  }

  const makeParentEl = (rect = { top: 100, left: 100, width: 50, height: 20 }) => {
    const el = makeEl(rect)
    global.document.body.appendChild(el)
    return el
  }

  let container

  beforeEach(() => {
    container = global.document.createElement('div')
    global.document.body.appendChild(container)
  })

  afterEach(() => {
    global.document.body.innerHTML = ''
  })

  const renderCard = (props = {}) => {
    const parentEl = props.parentEl || makeParentEl()
    let instanceRef
    const root = createRoot(container)
    act(() => {
      root.render(
        React.createElement(Card, {
          active: true,
          parentEl,
          ref: (r) => { instanceRef = r },
          ...props,
        },
          React.createElement('span', null, 'content')
        )
      )
    })
    return { root, get instance() { return instanceRef }, container }
  }

  const styleOf = (c) => c.container.firstChild.style

  // ─── positioning ──────────────────────────────────────────────────────

  describe('positioning', () => {
    it('places tooltip to the right of the parent by default', () => {
      const c = renderCard()
      assert.equal(styleOf(c).position, 'absolute')
      assert.ok(parseFloat(styleOf(c).left) > 100)
      act(() => c.root.unmount())
    })

    it('positions above the parent for position="top"', () => {
      const c = renderCard({ position: 'top' })
      assert.ok(parseFloat(styleOf(c).top) < 100)
      act(() => c.root.unmount())
    })

    it('positions below the parent for position="bottom"', () => {
      const c = renderCard({ position: 'bottom' })
      assert.ok(parseFloat(styleOf(c).top) > 100)
      act(() => c.root.unmount())
    })

    it('positions left of the parent for position="left"', () => {
      const c = renderCard({ position: 'left' })
      assert.ok(parseFloat(styleOf(c).left) < 100)
      act(() => c.root.unmount())
    })

    it('renders display:none when no parentEl is provided', () => {
      const root = createRoot(container)
      act(() => {
        root.render(React.createElement(Card, { active: true, parentEl: null }))
      })
      assert.equal(container.firstChild.style.display, 'none')
      act(() => root.unmount())
    })
  })

  // ─── arrow styles ─────────────────────────────────────────────────────

  describe('arrow styles', () => {
    it('renders no arrow elements when arrow is null', () => {
      const c = renderCard({ arrow: null })
      // only the content span renders, no arrow wrapper div
      assert.equal(c.container.firstChild.children.length, 1)
      assert.equal(c.container.firstChild.children[0].tagName, 'SPAN')
      act(() => c.root.unmount())
    })

    it('renders arrow elements when arrow="center"', () => {
      const c = renderCard({ arrow: 'center' })
      const arrowWrapper = c.container.firstChild.children[0]
      assert.equal(arrowWrapper.children.length, 2)
      act(() => c.root.unmount())
    })

    it('applies custom arrow color from style prop', () => {
      const c = renderCard({
        arrow: 'center',
        style: { style: {}, arrowStyle: { color: 'rgb(255, 0, 0)' } },
      })
      const [fg] = c.container.firstChild.children[0].children
      const border = fg.style.borderRight || fg.style.borderLeft || fg.style.borderTop || fg.style.borderBottom
      assert.ok(border.includes('255, 0, 0'))
      act(() => c.root.unmount())
    })
  })

  // ─── hover behaviour ──────────────────────────────────────────────────

  describe('hover behaviour', () => {
    it('sets hover state on mouseEnter when useHover is true', () => {
      const c = renderCard({ active: true, useHover: true })
      assert.equal(c.instance.state.hover, false)
      act(() => c.instance.handleMouseEnter())
      assert.equal(c.instance.state.hover, true)
      act(() => c.root.unmount())
    })

    it('does not set hover state on mouseEnter when useHover is false', () => {
      const c = renderCard({ active: true, useHover: false })
      act(() => c.instance.handleMouseEnter())
      assert.equal(c.instance.state.hover, false)
      act(() => c.root.unmount())
    })

    it('clears hover state on mouseLeave', () => {
      const c = renderCard({ active: true, useHover: true })
      act(() => c.instance.handleMouseEnter())
      assert.equal(c.instance.state.hover, true)
      act(() => c.instance.handleMouseLeave())
      assert.equal(c.instance.state.hover, false)
      act(() => c.root.unmount())
    })

    it('stays visible via hover state even when active becomes false', () => {
      const parentEl = makeParentEl()
      const c = renderCard({ active: true, useHover: true, parentEl })
      act(() => c.instance.handleMouseEnter())

      act(() => {
        c.root.render(
          React.createElement(Card, { active: false, useHover: true, parentEl },
            React.createElement('span', null, 'content')
          )
        )
      })

      assert.equal(styleOf(c).opacity, '1')
      assert.equal(styleOf(c).visibility, 'visible')
      act(() => c.root.unmount())
    })

    it('becomes hidden when both active and hover are false', () => {
      const c = renderCard({ active: false, useHover: true })
      assert.equal(styleOf(c).opacity, '0')
      assert.equal(styleOf(c).visibility, 'hidden')
      act(() => c.root.unmount())
    })
  })

  // ─── cleanup ──────────────────────────────────────────────────────────

  describe('cleanup', () => {
    it('unmounts without throwing', () => {
      const c = renderCard()
      assert.doesNotThrow(() => act(() => c.root.unmount()))
    })

    it('measures size on mount via updateSize', () => {
      const c = renderCard()
      assert.doesNotThrow(() => c.instance.updateSize())
      act(() => c.root.unmount())
    })
  })
})
