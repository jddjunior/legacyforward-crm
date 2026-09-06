/**
 * Session lifetime and "remember me for 60 days".
 *
 * Run: npm run test:auth
 */
import { decodeJwt, SignJWT } from 'jose';
import {
  signSession,
  verifySession,
  SESSION_TTL_SECONDS,
  REMEMBER_ME_TTL_SECONDS,
} from '../src/lib/session';
import { signOAuthState, verifyOAuthState } from '../src/lib/oauth-state';

let passed = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  ok   ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const days = (seconds: number) => Math.round(seconds / 86400);

async function main() {
  const payload = { userId: 'u1', email: 'a@example.com', orgId: 'o1', orgRole: 'owner' };

  console.log('\nSession lifetimes:');

  const normal = decodeJwt(await signSession(payload));
  const remembered = decodeJwt(await signSession(payload, REMEMBER_ME_TTL_SECONDS));

  check('a normal session lasts 7 days', days(normal.exp! - normal.iat!) === 7,
    `${days(normal.exp! - normal.iat!)}d`);
  check('a remembered session lasts 60 days', days(remembered.exp! - remembered.iat!) === 60,
    `${days(remembered.exp! - remembered.iat!)}d`);
  check('the 60-day token verifies', (await verifySession(await signSession(payload, REMEMBER_ME_TTL_SECONDS)))?.userId === 'u1');
  check('remember-me is genuinely longer than the default', REMEMBER_ME_TTL_SECONDS > SESSION_TTL_SECONDS);

  // An expired token must be rejected regardless of how long it was meant to last.
  const expired = await signSession(payload, -60);
  check('an expired session is rejected', (await verifySession(expired)) === null);

  console.log('\nThe remember-me choice survives the WorkOS round trip:');

  check('remember=true round-trips', (await verifyOAuthState(await signOAuthState({ remember: true }))).remember === true);
  check('remember=false round-trips', (await verifyOAuthState(await signOAuthState({ remember: false }))).remember === false);
  check('a missing state falls back to a normal session', (await verifyOAuthState(null)).remember === false);
  check('a garbage state falls back to a normal session', (await verifyOAuthState('not-a-jwt')).remember === false);

  // The whole point of signing it: state comes back through the browser.
  const forged = await new SignJWT({ remember: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(new TextEncoder().encode('an-attackers-own-secret-key-32-chars'));
  check('a forged state cannot mint a 60-day session', (await verifyOAuthState(forged)).remember === false);

  const stale = await new SignJWT({ remember: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
    .setExpirationTime(Math.floor(Date.now() / 1000) - 1800)
    .sign(new TextEncoder().encode(process.env.SESSION_SECRET || 'local-dev-only-not-for-production-32chars'));
  check('an expired login state is not replayable', (await verifyOAuthState(stale)).remember === false);

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length > 0) {
    console.error('\nSession handling is NOT correct:');
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }
  console.log('Session lifetimes and remember-me behave correctly.');
}

main().catch((err) => { console.error(err); process.exit(1); });
