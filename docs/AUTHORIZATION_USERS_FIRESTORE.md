# Autorizacion en Firestore (`usuarios/{uid}`)

## Objetivo
Controlar acceso por perfil autorizado despues del login con Google.

## Reglas de autorizacion aplicadas
Se bloquea acceso si ocurre cualquiera:
- No existe `usuarios/{uid}`.
- `activo !== true`.
- `rol` invalido.
- Correo fuera de `@zapata.com.mx`.

Roles permitidos:
- `vendedor`
- `coordinador`
- `soporte`

## Estructura recomendada
Coleccion: `usuarios`
Documento: `uid` de Firebase Auth

Campos minimos:
```json
{
  "email": "usuario@zapata.com.mx",
  "nombre": "Nombre Apellido",
  "rol": "vendedor",
  "activo": true,
  "sucursalId": "suc-mty",
  "sucursalNombre": "Monterrey"
}
```

## Ejemplo vendedor
```json
{
  "email": "vendedor@zapata.com.mx",
  "nombre": "Vendedor Demo",
  "rol": "vendedor",
  "activo": true,
  "sucursalId": "suc-cdmx",
  "sucursalNombre": "Ciudad de Mexico"
}
```

## Ejemplo coordinador
```json
{
  "email": "coordinador@zapata.com.mx",
  "nombre": "Coordinador Demo",
  "rol": "coordinador",
  "activo": true,
  "sucursalId": "suc-puebla",
  "sucursalNombre": "Puebla"
}
```

## Ejemplo soporte
```json
{
  "email": "soporte@zapata.com.mx",
  "nombre": "Soporte Demo",
  "rol": "soporte",
  "activo": true,
  "sucursalId": "suc-corp",
  "sucursalNombre": "Corporativo"
}
```

## Normalizacion de usuario en app
La app transforma el perfil autorizado a:
```json
{
  "uid": "...",
  "email": "usuario@zapata.com.mx",
  "nombre": "Nombre",
  "photoURL": null,
  "rol": "vendedor",
  "role": "vendedor",
  "sucursalId": "suc-cdmx",
  "sucursalNombre": "Ciudad de Mexico",
  "activo": true,
  "authMode": "firebase"
}
```

## Fuera de alcance en esta entrega
- Definicion de reglas (`firestore.rules`).
- Inventario, imports, functions o notificaciones.
- Soporte avanzado y modulos extra.