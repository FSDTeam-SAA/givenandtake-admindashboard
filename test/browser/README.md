# Admin login integration checks

These checks use the production Next.js build, actual login/dashboard components,
NextAuth credentials exchange, signed session cookies, and middleware. The upstream
login response and dashboard API reads are isolated fixtures. No production accounts
or data are used, and outbound server requests are blocked by the fixture preload.

Run `npm run build`, then run these commands from the admin repository in separate
terminals:

```sh
node test/browser/start-admin-login-fixture.cjs
node test/browser/admin-login-browser.cjs
```

The browser runner needs Playwright with Google Chrome available. It resolves the
`playwright` package normally, or from the `PLAYWRIGHT_MODULE` environment variable
when using a workstation-provided installation. No production dependency is added.
Both commands accept `ADMIN_LOGIN_ARTIFACTS` to choose the output directory; otherwise
screenshots, fixture audit entries, and JSON results go in ignored `test/browser/output`.
Stop the fixture server after running the checks. Port 3109 must be free.

Coverage includes successful login with old inactivity state, reload, existing-session
redirect, invalid-password retry, network-failure retry, logout/relogin, callback
validation and query retention, an expired session, repeated submissions, blocked
browser storage, guest access restrictions, and the login layout at 320px/390px.

Run the session/middleware unit regressions with `npm test`.
