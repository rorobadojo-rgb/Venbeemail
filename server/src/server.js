// Titik masuk: SMTP (port 25) + HTTP (127.0.0.1:3000) + pembersihan berkala.
// Jalankan: npm start   (lihat README.md untuk pemasangan di aaPanel)

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './config.js';
import { openDb } from './db.js';
import { createMailbox } from './mail.js';
import { createHttpServer } from './http.js';
import { createSmtpServer } from './smtp.js';

export async function start(env = process.env) {
  const config = loadConfig(env);
  const store = openDb(config.dbPath);
  const mailbox = createMailbox({ store, config });
  const httpServer = createHttpServer({ config, mailbox });
  const smtpServer = createSmtpServer({ config, mailbox });

  const listen = (srv, port, host) => new Promise((resolve, reject) => {
    srv.once('error', reject);
    srv.listen(port, host, () => { srv.off('error', reject); resolve(); });
  });
  await listen(httpServer, config.httpPort, config.httpHost);
  await listen(smtpServer, config.smtpPort, config.smtpHost);
  smtpServer.on('error', (err) => console.error('smtp error', err.message));

  const sweep = () => {
    try { const n = mailbox.cleanup(); if (n) console.log(`cleanup: ${n} alamat kedaluwarsa dihapus`); } catch (err) { console.error('cleanup error', err); }
  };
  sweep();
  const timer = setInterval(sweep, config.cleanupEveryMs);

  const ports = { http: httpServer.address().port, smtp: smtpServer.server.address().port };
  return {
    config, store, mailbox, ports,
    async stop() {
      clearInterval(timer);
      await Promise.all([new Promise((r) => httpServer.close(r)), new Promise((r) => smtpServer.close(r))]);
      store.close();
    },
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  start().then(({ config, ports }) => {
    console.log(`BanaMail siap — HTTP ${config.httpHost}:${ports.http}, SMTP ${config.smtpHost}:${ports.smtp}, domain ${config.domains.join(', ')}`);
  }).catch((err) => {
    console.error('Gagal mulai:', err.code === 'EACCES' ? `${err.message} — port 25 butuh izin root atau CAP_NET_BIND_SERVICE (lihat README)` : err);
    process.exit(1);
  });
  const quit = () => process.exit(0);
  process.on('SIGTERM', quit);
  process.on('SIGINT', quit);
}
