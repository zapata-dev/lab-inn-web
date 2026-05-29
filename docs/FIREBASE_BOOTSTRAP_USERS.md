# Bootstrap de usuarios Firestore

## Objetivo
Dar acceso controlado creando `usuarios/{uid}` despues del login Google.

## Flujo rapido
1. Usuario intenta login con `@zapata.com.mx`.
2. Si no existe perfil, cae en `/unauthorized`.
3. Tomar UID en Firebase Console -> Authentication -> Users.
4. Crear documento en Firestore: `usuarios/{uid}`.

## Esquema minimo recomendado
```json
{
  "email": "SOPORTE_EMAIL_ZAPATA",
  "nombre": "Nombre Usuario",
  "rol": "soporte",
  "sucursalId": "suc-qro",
  "sucursalNombre": "Queretaro",
  "activo": true
}
```

## Roles validos
- `vendedor`
- `coordinador`
- `soporte`

## Ejemplo vendedor
```json
{
  "email": "SOPORTE_EMAIL_ZAPATA",
  "nombre": "Vendedor",
  "rol": "vendedor",
  "sucursalId": "suc-cdmx",
  "sucursalNombre": "Ciudad de Mexico",
  "activo": true
}
```

## Ejemplo coordinador
```json
{
  "email": "SOPORTE_EMAIL_ZAPATA",
  "nombre": "Coordinador",
  "rol": "coordinador",
  "sucursalId": "suc-pue",
  "sucursalNombre": "Puebla",
  "activo": true
}
```

## Ejemplo soporte
```json
{
  "email": "SOPORTE_EMAIL_ZAPATA",
  "nombre": "Soporte",
  "rol": "soporte",
  "sucursalId": "suc-qro",
  "sucursalNombre": "Queretaro",
  "activo": true
}
```

## Comportamiento esperado
- `activo: true` + rol valido => acceso.
- `activo: false` => bloqueo.
- rol invalido => bloqueo.
- sin documento => `/unauthorized`.

## Referencia operativa
Para operacion detallada de usuarios, roles y sucursales ver:
`docs/USERS_ROLES_BRANCHES_OPERATIONS.md`.
