// Penerima SMTP di port 25. Hanya menerima surat untuk alamat BanaMail yang masih aktif;
// tidak pernah meneruskan ke domain lain (bukan open relay), tidak ada AUTH.

import fs from 'node:fs';
import { SMTPServer } from 'smtp-server';
import { authenticate as mailauth } from 'mailauth';

const MAX_RECIPIENTS = 50;
const AUTH_TIMEOUT_MS = 10000;

const reject = (code, message) => Object.assign(new Error(message), { responseCode: code });

/** Ringkas hasil mailauth menjadi {spf, dkim, dmarc}: 'pass' | 'fail' | 'softfail' | 'none' | ... */
function summarize({ spf, dkim, dmarc }) {
  const dk = dkim?.results || [];
  return {
    spf: spf?.status?.result || 'none',
    dkim: dk.some((r) => r.status?.result === 'pass') ? 'pass' : dk.some((r) => r.status?.result === 'fail') ? 'fail' : 'none',
    dmarc: dmarc?.status?.result || 'none',
  };
}

async function checkAuth(raw, session, config) {
  if (!config.authChecks) return {};
  try {
    const result = await Promise.race([
      mailauth(Buffer.from(raw), {
        ip: session.remoteAddress,
        helo: session.hostNameAppearsAs || session.clientHostname,
        sender: session.envelope.mailFrom?.address || '',
        mta: config.smtpHostname,
        disableArc: true,
      }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('auth-timeout')), AUTH_TIMEOUT_MS)),
    ]);
    return summarize(result);
  } catch (err) {
    console.warn('SPF/DKIM/DMARC check skipped:', err.message);
    return {};
  }
}

export function createSmtpServer({ config, mailbox }) {
  const tls = config.tlsKey && config.tlsCert
    ? { key: fs.readFileSync(config.tlsKey), cert: fs.readFileSync(config.tlsCert) }
    : { hideSTARTTLS: true };

  return new SMTPServer({
    name: config.smtpHostname,
    banner: 'BanaMail',
    logger: false,
    authOptional: true,
    disabledCommands: ['AUTH'],
    size: config.maxBytes,
    maxClients: config.maxClients,
    disableReverseLookup: true,
    ...tls,

    onRcptTo(address, session, callback) {
      const rcpt = String(address.address || '').toLowerCase();
      const domain = rcpt.split('@')[1] || '';
      if (!config.domains.includes(domain)) return callback(reject(550, '5.7.1 Relaying denied'));
      if (session.envelope.rcptTo.length >= MAX_RECIPIENTS) return callback(reject(452, '4.5.3 Too many recipients'));
      if (!mailbox.liveAddress(rcpt)) return callback(reject(550, '5.1.1 Mailbox does not exist'));
      callback();
    },

    onData(stream, session, callback) {
      const chunks = [];
      stream.on('data', (c) => { if (!stream.sizeExceeded) chunks.push(c); });
      stream.on('error', callback);
      stream.on('end', async () => {
        if (stream.sizeExceeded) return callback(reject(552, '5.3.4 Message too large'));
        try {
          const raw = new Uint8Array(Buffer.concat(chunks));
          // Alamat bisa kedaluwarsa di antara RCPT dan akhir DATA — cek sekali lagi.
          const recipients = [...new Set(session.envelope.rcptTo.map((r) => r.address.toLowerCase()))].filter((a) => mailbox.liveAddress(a));
          if (!recipients.length) return callback(reject(550, '5.1.1 Mailbox does not exist'));
          const auth = await checkAuth(raw, session, config);
          const { ids, spam } = await mailbox.receive(raw, recipients, auth, session.envelope.mailFrom?.address || '');
          console.log(`mail ${ids.join(',')} → ${recipients.join(',')} from ${session.remoteAddress} spam=${spam.score} ${JSON.stringify(auth)}`);
          callback(null, 'Queued');
        } catch (err) {
          console.error('store error', err);
          callback(reject(451, '4.3.0 Temporary failure, try again later'));
        }
      });
    },
  });
}
