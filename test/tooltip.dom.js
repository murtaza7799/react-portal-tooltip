// ToolTip portal creation, tooltipTimeout delay, and group isolation —
// requires a real DOM. Runs in jsdom, scoped inside describe() so these
// globals never leak into test/index.js's SSR (no-DOM) checks.
//
// `portalNodes` inside src/ToolTip.js is a module-level singleton keyed by
// `group`, shared across every ToolTip instance in this process. Each test
// below uses a unique group name to avoid cross-test pollution.

describe('ToolTip (DOM)', () => {
  const { JSDOM } = require('jsdom')
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })

  const originalNavigator = Object.getOwnPropertyDescriptor(global, 'navigator')

  before(() => {
    global.window = dom.window
    global.document = dom.window.document
    Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true })
    global.IS_REACT_ACT_ENVIRONMENT = true
  })

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
  const ToolTip = require('../src/ToolTip').default

  let container
  let groupCounter = 0
  const uniqueGroup = () => `tt-test-${++groupCounter}`

  beforeEach(() => {
    container = global.document.createElement('div')
    global.document.body.appendChild(container)
  })

  afterEach(() => {
    global.document.body.innerHTML = ''
  })

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const mountTooltip = (props, children) => {
    const root = createRoot(container)
    act(() => {
      root.render(React.createElement(ToolTip, props, children))
    })
    return root
  }

  // ─── portal creation ────────────────────────────────────────────────────

  describe('portal creation', () => {
    it('creates no .ToolTipPortal when mounted with active=false', () => {
      const group = uniqueGroup()
      const root = mountTooltip({ parent: '#nonexistent', active: false, group })
      assert.equal(global.document.querySelectorAll('.ToolTipPortal').length, 0)
      act(() => root.unmount())
    })

    it('creates a .ToolTipPortal appended to document.body when active=true', () => {
      const group = uniqueGroup()
      const parentEl = global.document.createElement('button')
      global.document.body.appendChild(parentEl)

      const root = mountTooltip({ parent: parentEl, active: true, group },
        React.createElement('span', null, 'tooltip content')
      )

      const portal = global.document.querySelector('.ToolTipPortal')
      assert.ok(portal, 'expected a .ToolTipPortal node in document.body')
      assert.ok(portal.textContent.includes('tooltip content'))
      act(() => root.unmount())
    })

    it('resolves a string parent selector via document.querySelector', () => {
      const group = uniqueGroup()
      const parentEl = global.document.createElement('button')
      parentEl.id = `parent-${group}`
      global.document.body.appendChild(parentEl)

      const root = mountTooltip({ parent: `#parent-${group}`, active: true, group },
        React.createElement('span', null, 'selector content')
      )

      const portal = global.document.querySelector('.ToolTipPortal')
      assert.ok(portal.textContent.includes('selector content'))
      act(() => root.unmount())
    })
  })

  // ─── tooltipTimeout delay ───────────────────────────────────────────────

  describe('tooltipTimeout delay', () => {
    it('keeps the portal rendering active=true until the timeout elapses', async () => {
      const group = uniqueGroup()
      const parentEl = global.document.createElement('button')
      global.document.body.appendChild(parentEl)

      const root = mountTooltip({ parent: parentEl, active: true, group, tooltipTimeout: 30 },
        React.createElement('span', null, 'fading content')
      )

      act(() => {
        root.render(React.createElement(ToolTip, { parent: parentEl, active: false, group, tooltipTimeout: 30 },
          React.createElement('span', null, 'fading content')
        ))
      })

      // Still within the timeout window — portal should still show active styling
      const portalDuringTimeout = global.document.querySelector('.ToolTipPortal')
      assert.equal(portalDuringTimeout.firstChild.style.opacity, '1')

      await act(async () => { await wait(60) })

      const portalAfterTimeout = global.document.querySelector('.ToolTipPortal')
      assert.equal(portalAfterTimeout.firstChild.style.opacity, '0')

      act(() => root.unmount())
    })

    it('clears a pending timeout if active flips back to true before it fires', async () => {
      const group = uniqueGroup()
      const parentEl = global.document.createElement('button')
      global.document.body.appendChild(parentEl)

      const root = mountTooltip({ parent: parentEl, active: true, group, tooltipTimeout: 30 },
        React.createElement('span', null, 'content')
      )

      act(() => {
        root.render(React.createElement(ToolTip, { parent: parentEl, active: false, group, tooltipTimeout: 30 },
          React.createElement('span', null, 'content')
        ))
      })

      // Re-activate before the 30ms timeout fires
      act(() => {
        root.render(React.createElement(ToolTip, { parent: parentEl, active: true, group, tooltipTimeout: 30 },
          React.createElement('span', null, 'content')
        ))
      })

      await act(async () => { await wait(60) })

      // Should still be visible — the earlier timeout must have been cleared
      const portal = global.document.querySelector('.ToolTipPortal')
      assert.equal(portal.firstChild.style.opacity, '1')

      act(() => root.unmount())
    })
  })

  // ─── group isolation ────────────────────────────────────────────────────

  describe('group isolation', () => {
    it('creates separate portal nodes for different groups', () => {
      const groupA = uniqueGroup()
      const groupB = uniqueGroup()
      const parentA = global.document.createElement('button')
      const parentB = global.document.createElement('button')
      global.document.body.appendChild(parentA)
      global.document.body.appendChild(parentB)

      const containerA = global.document.createElement('div')
      const containerB = global.document.createElement('div')
      global.document.body.appendChild(containerA)
      global.document.body.appendChild(containerB)

      const rootA = createRoot(containerA)
      const rootB = createRoot(containerB)

      act(() => {
        rootA.render(React.createElement(ToolTip, { parent: parentA, active: true, group: groupA },
          React.createElement('span', null, 'A content')
        ))
      })
      act(() => {
        rootB.render(React.createElement(ToolTip, { parent: parentB, active: true, group: groupB },
          React.createElement('span', null, 'B content')
        ))
      })

      assert.equal(global.document.querySelectorAll('.ToolTipPortal').length, 2)

      act(() => rootA.unmount())
      act(() => rootB.unmount())
    })
  })

  // ─── cleanup ────────────────────────────────────────────────────────────

  describe('cleanup', () => {
    it('removes the .ToolTipPortal node from document.body on unmount', () => {
      const group = uniqueGroup()
      const parentEl = global.document.createElement('button')
      global.document.body.appendChild(parentEl)

      const root = mountTooltip({ parent: parentEl, active: true, group },
        React.createElement('span', null, 'content')
      )

      assert.equal(global.document.querySelectorAll('.ToolTipPortal').length, 1)
      act(() => root.unmount())
      assert.equal(global.document.querySelectorAll('.ToolTipPortal').length, 0)
    })

    it('unmounting one ToolTip does not affect a different group\'s portal', () => {
      const groupA = uniqueGroup()
      const groupB = uniqueGroup()
      const parentA = global.document.createElement('button')
      const parentB = global.document.createElement('button')
      global.document.body.appendChild(parentA)
      global.document.body.appendChild(parentB)

      const containerA = global.document.createElement('div')
      const containerB = global.document.createElement('div')
      global.document.body.appendChild(containerA)
      global.document.body.appendChild(containerB)

      const rootA = createRoot(containerA)
      const rootB = createRoot(containerB)

      act(() => {
        rootA.render(React.createElement(ToolTip, { parent: parentA, active: true, group: groupA },
          React.createElement('span', null, 'A content')
        ))
      })
      act(() => {
        rootB.render(React.createElement(ToolTip, { parent: parentB, active: true, group: groupB },
          React.createElement('span', null, 'B content')
        ))
      })

      act(() => rootA.unmount())

      assert.equal(global.document.querySelectorAll('.ToolTipPortal').length, 1)
      act(() => rootB.unmount())
    })
  })
})
