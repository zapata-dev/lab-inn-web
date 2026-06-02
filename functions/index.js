const admin = require('firebase-admin')
const logger = require('firebase-functions/logger')
const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { defineSecret } = require('firebase-functions/params')
const { Resend } = require('resend')

admin.initializeApp()

const RESEND_API_KEY = defineSecret('RESEND_API_KEY')
const DEFAULT_FROM = 'LAB Comercial <onboarding@resend.dev>'
const APPROVAL_SUBJECT = 'Tu acceso a LAB fue aprobado'
const LAB_URL = 'https://lab-inn-web-dev.web.app'

function normalizeString(value) {
  return String(value ?? '').trim()
}

function normalizeEmail(value) {
  return normalizeString(value).toLowerCase()
}

function safeErrorMessage(error) {
  const message = normalizeString(error?.message || error?.toString?.() || 'unknown_error')
  return message.slice(0, 240)
}

function buildApprovalText({ targetName, assignedRole, assignedBranch }) {
  const name = normalizeString(targetName) || 'equipo'
  const role = normalizeString(assignedRole) || 'No especificado'
  const branch = normalizeString(assignedBranch) || 'No especificada'

  return [
    `Hola ${name}.`,
    '',
    'Tu acceso a LAB Comercial ha sido aprobado.',
    '',
    `Rol asignado: ${role}`,
    `Sucursal: ${branch}`,
    '',
    'Ya puedes ingresar con tu cuenta corporativa:',
    LAB_URL,
    '',
    'Saludos,',
    'Equipo LAB',
  ].join('\n')
}

function buildApprovalHtml({ targetName, assignedRole, assignedBranch }) {
  const name = normalizeString(targetName) || 'equipo'
  const role = normalizeString(assignedRole) || 'No especificado'
  const branch = normalizeString(assignedBranch) || 'No especificada'

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;background:#f8fafc;padding:24px">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:28px">
        <h1 style="font-size:24px;margin:0 0 16px;color:#0f172a">Tu acceso a LAB fue aprobado</h1>
        <p style="margin:0 0 16px">Hola ${name}.</p>
        <p style="margin:0 0 16px">Tu acceso a LAB Comercial ha sido aprobado.</p>
        <ul style="margin:0 0 20px;padding-left:20px">
          <li><strong>Rol asignado:</strong> ${role}</li>
          <li><strong>Sucursal:</strong> ${branch}</li>
        </ul>
        <p style="margin:0 0 16px">Ya puedes ingresar con tu cuenta corporativa:</p>
        <p style="margin:0 0 20px"><a href="${LAB_URL}" style="color:#2563eb;text-decoration:none">${LAB_URL}</a></p>
        <p style="margin:0">Saludos,<br />Equipo LAB</p>
      </div>
    </div>
  `
}

async function markAuditLog(ref, payload) {
  await ref.set(payload, { merge: true })
}

exports.sendApprovalEmail = onDocumentCreated(
  {
    document: 'auditLogs/{auditLogId}',
    region: 'us-central1',
    secrets: [RESEND_API_KEY],
  },
  async (event) => {
    const snapshot = event.data
    if (!snapshot) {
      return
    }

    const auditLog = snapshot.data() || {}
    const ref = snapshot.ref

    if (auditLog.action !== 'access_approved') {
      return
    }

    if (auditLog.emailStatus === 'sent' || auditLog.emailSentAt) {
      logger.info('Skipping already-sent approval email', {
        auditLogId: ref.id,
        requestId: auditLog.requestId || null,
      })
      return
    }

    if (!normalizeEmail(auditLog.targetEmail)) {
      await markAuditLog(ref, {
        emailStatus: 'skipped',
        emailProvider: 'resend',
        emailError: 'missing_target_email',
      })
      return
    }

    const resendApiKey = RESEND_API_KEY.value()
    const resend = new Resend(resendApiKey)

    const emailPayload = {
      from: DEFAULT_FROM,
      to: normalizeEmail(auditLog.targetEmail),
      subject: APPROVAL_SUBJECT,
      text: buildApprovalText({
        targetName: auditLog.targetName,
        assignedRole: auditLog.assignedRole,
        assignedBranch: auditLog.assignedBranch,
      }),
      html: buildApprovalHtml({
        targetName: auditLog.targetName,
        assignedRole: auditLog.assignedRole,
        assignedBranch: auditLog.assignedBranch,
      }),
    }

    try {
      const result = await resend.emails.send(emailPayload)
      const messageId = result?.data?.id || result?.id || ''

      await markAuditLog(ref, {
        emailStatus: 'sent',
        emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        emailProvider: 'resend',
        emailMessageId: messageId,
      })

      logger.info('Approval email sent', {
        auditLogId: ref.id,
        requestId: auditLog.requestId || null,
        emailMessageId: messageId || null,
      })
    } catch (error) {
      const emailError = safeErrorMessage(error)

      await markAuditLog(ref, {
        emailStatus: 'failed',
        emailProvider: 'resend',
        emailError,
      })

      logger.error('Approval email failed', {
        auditLogId: ref.id,
        requestId: auditLog.requestId || null,
        emailError,
      })
    }
  }
)
