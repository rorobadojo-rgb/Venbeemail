import type { Letter } from "./fakeMail";

/** RFC 2047 encoded-word for non-ASCII header text. */
function header(text: string) {
  if (/^[\x20-\x7e]*$/.test(text)) return text;
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return `=?UTF-8?B?${btoa(bin)}?=`;
}

/** A single RFC 5322 message, plain text, CRLF line endings. */
export function toEml(letter: Letter, to: string) {
  const lines = [
    `From: "${header(letter.fromName).replace(/"/g, "'")}" <${letter.from}>`,
    `To: <${to}>`,
    `Subject: ${header(letter.subject)}`,
    `Date: ${new Date(letter.at).toUTCString().replace("GMT", "+0000")}`,
    `Message-ID: <${letter.id}@venbeemail.local>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "X-Mailer: VenbeeMail (demo)",
    "",
    letter.body,
    "",
  ];
  return lines.join("\r\n").replace(/\r?\n/g, "\r\n");
}

export function downloadEml(letter: Letter, to: string) {
  const blob = new Blob([toEml(letter, to)], { type: "message/rfc822" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const slug = letter.subject.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "surat";
  a.href = url;
  a.download = `${slug}.eml`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // older browsers / insecure contexts
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}
