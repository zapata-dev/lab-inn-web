# Autorizacion por usuarios Firestore - LAB-PROD-004

## Objetivo

Conectar el login de Firebase Auth (Google) con autorizacion real en Firestore usando `usuarios/{uid}`.

Regla final:

- Autenticacion: cuenta Google con dominio permitido.
- Autorizacion: documento `usuarios/{uid}` existente, `activo=true` y rol valido.

## Autenticacion vs autorizacion

- Autenticacion responde: "quien eres" (Google/Firebase Auth).
- Autorizacion responde: "puedes usar LAB" (perfil en Firestore).

Tener correo `@zapata.com.mx` ya no es suficiente para entrar.

## Estructura esperada de `usuarios/{uid}`

```json
{
  "uid": "firebase_uid",
  "email": "usuario@zapata.com.mx",
  "nombre": "Nombre Usuario",
  "rol": "vendedor",
  "sucursalId": "suc-qro",
  "sucursalNombre": "Queretaro",
  "activo": true,
  "telefono": "",
  "createdAt": "...",
  "updatedAt": "...",
  "lastLoginAt": "..."
}
```

Roles permitidos:

- `vendedor`
- `coordinador`
- `soporte`

## Ejemplos JSON

### Vendedor

```json
{
  "uid": "uid_vendedor_01",
  "email": "vendedor@zapata.com.mx",
  "nombre": "Vendedor Prueba",
  "rol": "vendedor",
  "sucursalId": "suc-qro",
  "sucursalNombre": "Queretaro",
  "activo": true,
  "telefono": ""
}
```

### Coordinador

```json
{
  "uid": "uid_coordinador_01",
  "email": "coordinador@zapata.com.mx",
  "nombre": "Coordinador Prueba",
  "rol": "coordinador",
  "sucursalId": "suc-mty",
  "sucursalNombre": "Monterrey",
  "activo": true,
  "telefono": ""
}
```

### Soporte

```json
{
  "uid": "uid_soporte_01",
  "email": "soporte@zapata.com.mx",
  "nombre": "Soporte Prueba",
  "rol": "soporte",
  "sucursalId": "suc-cdmx",
  "sucursalNombre": "Ciudad de Mexico",
  "activo": true,
  "telefono": ""
}
```

## Alta manual de usuarios en Firestore

1. El usuario intenta iniciar sesion una vez.
2. Tomar su UID desde Firebase Authentication.
3. Crear documento `usuarios/{uid}` en Firestore.
4. Agregar campos minimos: `email`, `nombre`, `rol`, `sucursalId`, `activo=true`.
5. Usuario cierra y vuelve a iniciar sesion.

## Errores esperados

- `auth/user-not-allowed`: no existe `usuarios/{uid}`.
- `auth/user-inactive`: existe usuario pero `activo !== true`.
- `auth/invalid-role`: rol fuera de `vendedor/coordinador/soporte`.
- `access-denied-domain`: dominio de correo no permitido.

## Pruebas manuales

1. Configurar `.env.local` real con `VITE_AUTH_MODE=firebase`.
2. Probar login con cuenta `@zapata.com.mx` sin documento en `usuarios/{uid}`.
3. Confirmar redireccion a `/unauthorized`.
4. Crear documento con `activo=false` y probar de nuevo.
5. Confirmar bloqueo por usuario inactivo.
6. Cambiar `activo=true` y `rol=rol_invalido`.
7. Confirmar bloqueo por rol invalido.
8. Cambiar `rol` a `vendedor` o `coordinador` o `soporte`.
9. Confirmar acceso a `/inicio` y visualizacion de rol/sucursal en topbar.
10. Cambiar a `VITE_AUTH_MODE=demo` y validar que modo demo sigue operativo.

## Fuera de alcance de este ticket

- Reglas reales de Firestore (`firestore.rules`).
- Panel admin de usuarios.
- Auditoria funcional.
- Flujos de solicitudes.
- Importador de inventario.
- `firebase.json` / despliegue hosting.

## Relacion con reglas Firestore

Desde `LAB-PROD-005` ya existe `firestore.rules` en el repo. Eso significa:

- La autorizacion de frontend (`AuthContext` + `usuarios/{uid}`) valida experiencia de acceso.
- Las reglas Firestore validan seguridad real de lectura/escritura en backend para cada request del SDK.

Importante:

- La autorizacion en frontend **no sustituye** reglas de Firestore.
- Aunque un cliente manipule la UI, Firestore debe seguir rechazando operaciones no permitidas por rol/sucursal.
