#!/bin/sh
# End-to-end debug loop for the WorkOS auth workflow.
# Verifies: server up -> WorkOS user signup -> login redirect -> WorkOS accepts
# our redirect URI -> password sign-in -> callback error handling -> route protection.
#
# Run inside the web container (has WORKOS_* env + curl):
#   docker compose -f docker-compose.base44.yml exec web sh scripts/debug-auth.sh
#
# Never prints secret values; test-user credentials live only in this script.

BASE="${BASE_URL:-http://localhost:3000}"
EMAIL="${TEST_USER_EMAIL:-debug-tester@legacyforward.test}"
PASSWORD="${TEST_USER_PASSWORD:-DebugLoop123!}"
CODE_PREFIX='{"error'

step() { printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$1"; }
ok()   { printf '  OK: %s\n' "$1"; }
fail() { printf '  FAIL: %s\n' "$1"; exit 1; }

step "1/7 App server reachable"
curl -sf -o /dev/null "$BASE" && ok "app serves /" || fail "app not reachable at $BASE"

step "2/7 Test user exists in WorkOS (signup path)"
CREATE_BODY=$(curl -s -w "\n%{http_code}" -X POST https://api.workos.com/user_management/users \
  -H "Authorization: Bearer $WORKOS_API_KEY" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"email_verified\":true,\"first_name\":\"Debug\",\"last_name\":\"Tester\"}")
CREATE=$(echo "$CREATE_BODY" | tail -1)
case "$CREATE" in
  200|201) ok "test user created";;
  400|409|422)
    case "$CREATE_BODY" in
      *email_not_available*) ok "test user already exists";;
      *) printf '  response: %s\n' "$(echo "$CREATE_BODY" | head -c 200)"; fail "WorkOS user creation failed";;
    esac;;
  *) fail "WorkOS user creation returned $CREATE — check WORKOS_API_KEY (and that the key is valid)";;
esac

step "3/7 Login route redirects to WorkOS"
LOGIN_URL=$(curl -s -o /dev/null -w "%{redirect_url}" "$BASE/api/auth/login")
case "$LOGIN_URL" in
  https://api.workos.com/*) ok "redirects to WorkOS authorize";;
  *) fail "unexpected redirect: $LOGIN_URL";;
esac

step "4/7 WorkOS accepts our redirect URI"
BOOTSTRAP=$(curl -s -o /dev/null -w "%{redirect_url}" "$LOGIN_URL")
SESSION_ID=$(echo "$BOOTSTRAP" | sed -n 's/.*authorization_session_id=\([^&]*\).*/\1/p')
if [ -z "$SESSION_ID" ]; then
  case "$BOOTSTRAP" in
    *redirect-uri-invalid*) fail "WorkOS rejected the redirect URI — add <public-preview-url>/api/auth/callback in WorkOS dashboard -> Authentication -> Redirects";;
    *) fail "no authorization session created — redirect: $BOOTSTRAP";;
  esac
fi
ok "authorization session started"

step "5/7 Test user can sign in (password grant, same call the SDK makes)"
AUTH=$(curl -s -X POST https://api.workos.com/user_management/authenticate \
  -H "Content-Type: application/json" \
  -d "{\"client_id\":\"$WORKOS_CLIENT_ID\",\"client_secret\":\"$WORKOS_API_KEY\",\"grant_type\":\"password\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"authorization_session_id\":\"$SESSION_ID\"}")
AUTHED=$(echo "$AUTH" | sed -n 's/.*"authentication_method":"\([^"]*\)".*/\1/p')
if [ -n "$AUTHED" ]; then
  ok "signed in via $AUTHED"
else
  printf '  response: %s\n' "$(echo "$AUTH" | head -c 200)"
  fail "password grant failed — check WORKOS_CLIENT_ID / WORKOS_API_KEY"
fi

step "6/7 Callback handles a bad code without crashing"
BAD=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/auth/callback?code=invalid")
case "$BAD" in
  302|303|307) ok "bad code -> clean redirect";;
  *) fail "callback returned $BAD on a bad code";;
esac

step "7/7 Protected routes require a session"
PORTAL=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/portal")
case "$PORTAL" in
  302|303|307) ok "/portal redirects unauthenticated users to login";;
  200) fail "/portal is publicly reachable without a session";;
  *) fail "/portal returned $PORTAL";;
esac

printf '\nAll 7 checks passed.\n'
printf 'Interactive browser check (WorkOS blocks its page inside iframes):\n'
printf '  1. open the public preview URL + /api/auth/login in a NEW TAB\n'
printf '  2. sign in as %s / %s\n' "$EMAIL" "$PASSWORD"
printf '  3. you should land on /portal with a session cookie\n' "$EMAIL" "$PASSWORD" | head -2
