/* Senha-mestra do painel /admin.
   - Na primeira visita o usuário CRIA a senha; o hash fica no localStorage.
   - Nenhuma senha é fixada no código.
   - A sessão (aba) é marcada em sessionStorage; fechar a aba pede a senha
     de novo. O hash é SHA-256 com salt fixo — suficiente para um painel
     local; quando houver Supabase, trocar por Supabase Auth. */

const HASH_KEY = "bonelli-escritorio-admin-hash";
const SESSION_KEY = "bonelli-escritorio-admin-session";
const SALT = "bonelli-escritorio-v1";

async function sha256Hex(text: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback sem WebCrypto (ex.: contexto não seguro): hash simples.
  // Não é segurança criptográfica — só evita a senha em texto claro.
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16);
}

export function hasAdminPassword(): boolean {
  try {
    return localStorage.getItem(HASH_KEY) !== null;
  } catch {
    return false;
  }
}

export async function setAdminPassword(password: string): Promise<void> {
  const hash = await sha256Hex(`${SALT}:${password}`);
  localStorage.setItem(HASH_KEY, hash);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const stored = localStorage.getItem(HASH_KEY);
  if (!stored) return false;
  const hash = await sha256Hex(`${SALT}:${password}`);
  return hash === stored;
}

export function isAdminSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function startAdminSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* sem sessionStorage, a sessão não persiste — o login será pedido de novo */
  }
}

export function endAdminSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* nada a fazer */
  }
}
