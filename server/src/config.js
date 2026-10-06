// Semua pengaturan dibaca dari variabel lingkungan (lihat .env.example).

import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export function loadConfig(env = process.env) {
  const num = (v, d) => (v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : d);
  const bool = (v, d) => (v === undefined || v === '' ? d : /^(1|true|yes|on)$/i.test(v));
  const domains = String(env.DOMAINS || 'venbeemail.com').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return {
    domains,
    ttlMs: num(env.TTL_MINUTES, 60) * 60000,
    randomLength: num(env.RANDOM_LENGTH, 10),
    suffixLength: num(env.SUFFIX_LENGTH, 6),
    maxBytes: num(env.MAX_MESSAGE_BYTES, 20 * 1024 * 1024),
    newAddressLimit: num(env.NEW_ADDRESS_LIMIT, 20),
    sending: bool(env.SENDING_ENABLED, false),

    dbPath: env.DB_PATH || path.join(here, '..', 'data', 'banamail.db'),
    staticDir: env.STATIC_DIR || path.join(here, '..', '..', 'public', 'banamail'),

    httpHost: env.HTTP_HOST || '127.0.0.1', // Nginx aaPanel meneruskan ke sini
    httpPort: num(env.HTTP_PORT, 3000),
    trustProxy: bool(env.TRUST_PROXY, true), // pakai X-Real-IP / X-Forwarded-For dari Nginx lokal

    smtpHost: env.SMTP_HOST || '0.0.0.0',
    smtpPort: num(env.SMTP_PORT, 25),
    smtpHostname: env.SMTP_HOSTNAME || `mail.${domains[0] || 'localhost'}`,
    tlsKey: env.TLS_KEY || '',   // privkey.pem untuk STARTTLS (opsional tapi disarankan)
    tlsCert: env.TLS_CERT || '', // fullchain.pem
    authChecks: bool(env.AUTH_CHECKS, true), // periksa SPF/DKIM/DMARC pengirim (butuh DNS keluar)
    maxClients: num(env.SMTP_MAX_CLIENTS, 100),

    cleanupEveryMs: num(env.CLEANUP_MINUTES, 10) * 60000,
    hostname: os.hostname(),
  };
}
