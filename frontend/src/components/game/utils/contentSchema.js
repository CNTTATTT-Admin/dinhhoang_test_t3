const TYPE_SET = new Set(['MAIL_STANDARD', 'MAIL_WEB', 'MAIL_OTP', 'MAIL_ZALO'])

function parseJson(value) {
  if (!value || typeof value !== 'string') return {}
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

function mapStepTypeToScenarioType(stepType) {
  const normalized = String(stepType || 'MAIL_STANDARD').toUpperCase()
  if (TYPE_SET.has(normalized)) return normalized
  if (normalized === 'MAIL') return 'MAIL_STANDARD'
  if (normalized === 'WEB_PAGE') return 'MAIL_WEB'
  if (normalized === 'OTP' || normalized === 'MAIL_OTP') return 'MAIL_OTP'
  if (normalized === 'ZALO') return 'MAIL_ZALO'
  return 'MAIL_STANDARD'
}

function normalizeAttachment(att, fallbackId) {
  return {
    id: String(att?.id || fallbackId),
    displayName: att?.displayName || att?.fileName || 'attachment.bin',
    actualName: att?.actualName || att?.fileName || att?.displayName || 'attachment.bin',
    mimeShown: att?.mimeShown || att?.mimeLabel || 'File',
    mimeActual: att?.mimeActual || att?.mimeLabel || 'File',
    inspectionHint: att?.inspectionHint || '',
    raw: att || null,
  }
}

export function normalizeScenarioContent({ stepType, content, queue }) {
  const raw = typeof content === 'object' && content !== null ? content : parseJson(content)
  const scenarioType = mapStepTypeToScenarioType(raw.scenarioType || stepType)

  const browserEnabled = scenarioType === 'MAIL_WEB' || scenarioType === 'MAIL_OTP'
  const zaloEnabled = scenarioType === 'MAIL_ZALO'
  const otpEnabled = scenarioType === 'MAIL_OTP'

  const contentLinks = Array.isArray(raw?.mail?.links) ? raw.mail.links : []
  const contentAttachments = Array.isArray(raw?.mail?.attachments) ? raw.mail.attachments : []

  const normalizedQueue = (Array.isArray(queue) ? queue : []).map((email, idx) => {
    const parsedAttachment = parseJson(email?.attachmentJson)
    const link = email?.linkUrl
      ? {
          id: `email-${idx}-link`,
          label: email?.linkLabel || 'Mở liên kết',
          displayUrl: email?.linkUrl || '',
          actualUrl: email?.linkUrl || '',
          action: 'OPEN_BROWSER',
        }
      : null
    const attachment = parsedAttachment?.fileName
      ? normalizeAttachment(
          {
            id: `email-${idx}-attachment`,
            displayName: parsedAttachment.fileName,
            actualName: parsedAttachment.fileName,
            mimeShown: parsedAttachment.mimeLabel,
            mimeActual: parsedAttachment.mimeLabel,
            inspectionHint: parsedAttachment.fileWarnings?.[0] || '',
          },
          `email-${idx}-attachment`,
        )
      : null
    return {
      ...email,
      links: link ? [link] : [],
      attachments: attachment ? [attachment] : [],
    }
  })

  const traps = {
    browser: {
      enabled: Boolean(raw?.traps?.browser?.enabled ?? browserEnabled),
      title: raw?.traps?.browser?.title || raw?.title || 'Secure Login',
      displayUrl: raw?.traps?.browser?.addressBar?.displayUrl || raw?.landing?.fakeUrl || '',
      actualUrl: raw?.traps?.browser?.addressBar?.actualUrl || raw?.landing?.fakeUrl || '',
      formType: raw?.traps?.browser?.formType || (scenarioType === 'MAIL_OTP' ? 'OTP' : 'CREDENTIAL'),
    },
    zalo: {
      enabled: Boolean(raw?.traps?.zalo?.enabled ?? zaloEnabled),
      peerName: raw?.traps?.zalo?.peerName || raw?.sender || 'Liên hệ',
      messages: Array.isArray(raw?.traps?.zalo?.messages) ? raw.traps.zalo.messages : [],
    },
    otp: {
      enabled: Boolean(raw?.traps?.otp?.enabled ?? otpEnabled),
      code: raw?.traps?.otp?.code || raw?.otpCode || '',
      delivery: raw?.traps?.otp?.delivery || 'SMS',
    },
  }

  return {
    scenarioType,
    queue: normalizedQueue,
    mail: {
      links: contentLinks,
      attachments: contentAttachments.map((x, i) => normalizeAttachment(x, `content-attachment-${i}`)),
    },
    traps,
    rules: {
      quarantineWins: true,
      verifyIfPhishing: 'GAME_OVER',
      ...(raw?.rules || {}),
    },
  }
}

