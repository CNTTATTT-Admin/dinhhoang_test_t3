import { createContext, useContext, useMemo, useReducer } from 'react'

const GameStateContext = createContext(null)

const initialState = {
  ui: {
    isBrowserOpen: false,
    isZaloActive: false,
    isPhoneWidgetVisible: false,
    activeOverlay: 'none',
  },
  trap: {
    currentTrapClicked: null,
    isPhished: false,
    phishReason: null,
    openedUrl: '',
    browserFormType: 'CREDENTIAL',
  },
  inspection: {
    sender: false,
    linkIds: [],
    attachmentIds: [],
  },
  decision: {
    finalAction: null,
  },
}

function uniquePush(items, next) {
  if (items.includes(next)) return items
  return [...items, next]
}

function reducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return {
        ...initialState,
        ui: {
          ...initialState.ui,
          isZaloActive: Boolean(action.payload?.isZaloActive),
          isPhoneWidgetVisible: Boolean(action.payload?.isPhoneWidgetVisible),
        },
      }
    case 'OPEN_BROWSER':
      return {
        ...state,
        ui: { ...state.ui, isBrowserOpen: true, activeOverlay: 'browser' },
        trap: {
          ...state.trap,
          openedUrl: action.payload?.url || '',
          currentTrapClicked: action.payload?.trapId || null,
          browserFormType: action.payload?.formType || 'CREDENTIAL',
        },
      }
    case 'CLOSE_BROWSER':
      return {
        ...state,
        ui: {
          ...state.ui,
          isBrowserOpen: false,
          isPhoneWidgetVisible: false,
          activeOverlay: 'none',
        },
      }
    case 'MARK_INSPECT_SENDER':
      return {
        ...state,
        inspection: { ...state.inspection, sender: true },
      }
    case 'MARK_INSPECT_LINK':
      return {
        ...state,
        inspection: {
          ...state.inspection,
          linkIds: uniquePush(state.inspection.linkIds, String(action.payload?.linkId || '')),
        },
      }
    case 'MARK_INSPECT_ATTACHMENT':
      return {
        ...state,
        inspection: {
          ...state.inspection,
          attachmentIds: uniquePush(state.inspection.attachmentIds, String(action.payload?.attachmentId || '')),
        },
      }
    case 'SET_PHONE_WIDGET':
      return {
        ...state,
        ui: { ...state.ui, isPhoneWidgetVisible: Boolean(action.payload?.visible) },
      }
    case 'TRIGGER_PHISHED':
      return {
        ...state,
        trap: {
          ...state.trap,
          isPhished: true,
          phishReason: action.payload?.reason || 'UNKNOWN',
        },
      }
    case 'COMMIT_DECISION':
      return {
        ...state,
        decision: { ...state.decision, finalAction: action.payload?.action || null },
      }
    default:
      return state
  }
}

export function GameStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const actions = useMemo(
    () => ({
      reset(next = {}) {
        dispatch({ type: 'RESET', payload: next })
      },
      openBrowser({ url, trapId, formType }) {
        dispatch({ type: 'OPEN_BROWSER', payload: { url, trapId, formType } })
      },
      closeBrowser() {
        dispatch({ type: 'CLOSE_BROWSER' })
      },
      markInspectedSender() {
        dispatch({ type: 'MARK_INSPECT_SENDER' })
      },
      markInspectedLink(linkId) {
        dispatch({ type: 'MARK_INSPECT_LINK', payload: { linkId } })
      },
      getInspectedLinks() {
        return state.inspection.linkIds
      },
      markInspectedAttachment(attachmentId) {
        dispatch({ type: 'MARK_INSPECT_ATTACHMENT', payload: { attachmentId } })
      },
      setPhoneWidgetVisible(visible) {
        dispatch({ type: 'SET_PHONE_WIDGET', payload: { visible } })
      },
      triggerPhished(reason) {
        dispatch({ type: 'TRIGGER_PHISHED', payload: { reason } })
      },
      commitDecision(action) {
        dispatch({ type: 'COMMIT_DECISION', payload: { action } })
      },
    }),
    [state.inspection.linkIds],
  )

  const value = useMemo(() => ({ state, actions }), [state, actions])
  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>
}

export function useGameState() {
  const ctx = useContext(GameStateContext)
  if (!ctx) throw new Error('useGameState must be used within GameStateProvider')
  return ctx
}

