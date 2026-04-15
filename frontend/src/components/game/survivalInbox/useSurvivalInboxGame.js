import { useCallback, useReducer } from 'react'

export const SCORE_CORRECT = 100
export const SCORE_FALSE_REPORT = 50

export function createInitialGameState() {
  return {
    status: 'PLAYING',
    currentEmailIndex: 0,
    score: 0,
    gameOverEmail: null,
  }
}

/**
 * @param {{ isPhishing: boolean }[]} emails
 * @param {boolean} isReported true = BÁO CÁO PHISHING, false = TIN TƯỞNG
 */
function reduceDecision(state, emails, isReported) {
  if (state.status !== 'PLAYING') return state

  const email = emails[state.currentEmailIndex]
  if (!email) return state

  // Tin tưởng email phishing → GAME OVER (tương đương click link bẫy / tải file độc)
  if (!isReported && email.isPhishing) {
    return { ...state, status: 'GAME_OVER', gameOverEmail: email }
  }

  let delta = 0
  const correctTrust = !isReported && !email.isPhishing
  const correctReport = isReported && email.isPhishing
  if (correctTrust || correctReport) {
    delta = SCORE_CORRECT
  } else if (isReported && !email.isPhishing) {
    delta = -SCORE_FALSE_REPORT
  }

  const nextIndex = state.currentEmailIndex + 1
  const victory = nextIndex >= emails.length

  return {
    ...state,
    score: Math.max(0, state.score + delta),
    currentEmailIndex: nextIndex,
    status: victory ? 'VICTORY' : 'PLAYING',
  }
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'DECISION':
      return reduceDecision(state, action.emails, action.isReported)
    case 'RESET':
      return createInitialGameState()
    default:
      return state
  }
}

/**
 * @param {{ isPhishing: boolean }[]} emails
 */
export function useSurvivalInboxGame(emails) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState)

  const handleDecision = useCallback(
    (isReported) => {
      dispatch({ type: 'DECISION', emails, isReported })
    },
    [emails],
  )

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const currentEmail =
    state.status === 'VICTORY' || state.currentEmailIndex >= emails.length
      ? null
      : emails[state.currentEmailIndex]

  return { state, handleDecision, resetGame, currentEmail }
}
