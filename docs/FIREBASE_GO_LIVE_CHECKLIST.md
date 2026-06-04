# Firebase Go-Live Checklist (Current Scope)

## Scope note

This checklist validates the current Firebase auth setup. It does not define roadmap items or add new modules.

## Proyecto e infraestructura

- [ ] Firebase project confirmed.
- [ ] Billing confirmed by admin.
- [ ] Region validated for the target environment.

## Auth

- [ ] Google Provider enabled.
- [ ] Support email configured.
- [ ] Authorized domains include localhost and the active hosting domain.
- [ ] `VITE_AUTH_MODE=firebase` is set where Firebase auth should be used.

## Firestore

- [ ] Database created.
- [ ] Collection `usuarios` exists.
- [ ] At least one active support user exists.

## Verification

- [ ] `/login` shows the current sign-in state.
- [ ] External email is blocked.
- [ ] Authorized user without profile goes to `/unauthorized`.
- [ ] Active support user can enter.
- [ ] Inactive user is blocked.
- [ ] Invalid role is blocked.
- [ ] Login and logout stay stable.
- [ ] Current navigation routes still resolve after login.

## Security and change control

- [ ] No secrets were committed to the repo.
- [ ] `.env.local` is not tracked.
- [ ] No unplanned changes were made to `src/`, rules or hosting config for this document.

