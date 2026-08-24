# USERS, ROLES AND BRANCHES OPERATIONS

## Objetivo

Definir el procedimiento operativo para administrar usuarios de LAB en Firebase Auth + Firestore durante la fase piloto.

Este documento cubre:

- alta manual de usuarios;
- roles permitidos;
- sucursales;
- desactivacion;
- cambio de rol;
- cambio de sucursal;
- controles minimos de seguridad;
- preparacion para un eventual panel admin si el alcance se retoma.

Nota de alcance:

- Este documento describe operaciones vigentes y no redefine el roadmap.
- Las referencias a "futuro" deben leerse como escenarios historicos, no como compromiso actual.

## Estado actual

La app usa:

- Firebase Auth con Google como autenticacion;
- restriccion de dominio `@zapata.com.mx`;
- Firestore `usuarios/{uid}` como autorizacion;
- alta manual desde Firebase Console.

No existe todavia:

- panel admin;
- self-registration;
- MFA;
- auditoria avanzada de cambios;
- gestion automatica de sucursales.

## Coleccion principal

Coleccion:

```txt
usuarios
```

Document ID:

```txt
UID exacto de Firebase Authentication
```

Ejemplo:

```txt
usuarios/j5JkCadulHasqgOwKXPhqNQdKJe2
```

## Campos obligatorios

| Campo          | Tipo      | Obligatorio | Ejemplo                    | Descripcion                     |
| -------------- | --------- | ----------: | -------------------------- | ------------------------------- |
| email          | string    |          si | usuario@zapata.com.mx      | Correo corporativo del usuario  |
| nombre         | string    |          si | Diego Gonzalez             | Nombre visible                  |
| rol            | string    |          si | soporte                    | Rol productivo principal        |
| role           | string    |          si | soporte                    | Campo espejo por compatibilidad |
| sucursalId     | string    |          si | suc-qro                    | ID interno de sucursal          |
| sucursalNombre | string    |          si | Queretaro                  | Nombre visible de sucursal      |
| activo         | boolean   |          si | true                       | Control de acceso               |
| createdAt      | timestamp | recomendado | server/manual              | Fecha de alta                   |
| updatedAt      | timestamp | recomendado | server/manual              | Ultima actualizacion            |
| notas          | string    |    opcional | Alta piloto                | Comentario operativo            |

## Roles permitidos

### vendedor

Uso:

- vendedor normal de sucursal.

Puede:

- entrar a la app;
- consultar herramientas permitidas por el MVP;
- iniciar operaciones comerciales segun los permisos vigentes;
- solicitar unidades de otras sucursales cuando exista el flujo.

No debe:

- administrar usuarios;
- ver auditoria global;
- modificar reglas;
- ver informacion de soporte global.

### coordinador

Uso:

- coordinador de vendedores de una sucursal.

Puede:

- entrar a la app;
- ver/gestionar informacion relacionada con su sucursal segun los permisos vigentes;
- participar en solicitudes entre sucursales;
- recibir notificaciones de solicitudes de unidades.

No debe:

- administrar usuarios globalmente;
- modificar configuracion tecnica;
- ver informacion de soporte global fuera de su alcance.

### soporte

Uso:

- desarrolladores/soporte operativo global.

Puede:

- entrar a la app;
- apoyar en pruebas;
- revisar configuracion operativa;
- validar usuarios;
- ver informacion global si sus permisos vigentes lo permiten.

No debe:

- usarse como rol comercial diario;
- compartirse entre personas;
- saltarse proceso de alta.

## Catalogo inicial de sucursales

Usar estos IDs de forma consistente.

| sucursalId       | sucursalNombre   | Estado        |
| ---------------- | ---------------- | ------------- |
| suc-qro          | Queretaro        | activo        |
| suc-leon         | Leon             | sugerido      |
| suc-gdl          | Guadalajara      | sugerido      |
| suc-cdmx         | Ciudad de Mexico | sugerido      |
| suc-mty          | Monterrey        | sugerido      |
| suc-default      | Sin asignar      | solo temporal |
| suc-tlalnepantla | Tlalnepantla     | sugerido      |
| suc-aeropuerto   | Aeropuerto       | sugerido      |
| suc-celaya       | Celaya           | sugerido      |
| suc-tampico      | Tampico          | sugerido      |
| suc-occidente    | Occidente        | sugerido      |
| suc-corporativo  | Corporativo      | sugerido      |

Nota:
Si no se conoce todavia la sucursal exacta, usar temporalmente `suc-default`, pero corregir antes de produccion amplia.

Nota sobre Guadalajara:
El valor `CAMIONES GUADALAJARA OTERO` que aparece en la columna `Centro` del CSV de
inventario corresponde a la misma sucursal `suc-gdl` (Guadalajara), no a una sucursal
distinta. No crear un id nuevo para "Otero".

## Procedimiento de alta manual

### Paso 1 - Usuario intenta login

1. Abrir:
   https://lab-inn-web-dev.web.app/login
2. Usuario hace login con Google corporativo.
3. Si no existe `usuarios/{uid}`, la app debe mandar a `/unauthorized`.

### Paso 2 - Copiar UID

En Firebase Console:

```txt
Authentication -> Users
```

Copiar el UID exacto del usuario.

### Paso 3 - Crear documento Firestore

En Firebase Console:

```txt
Firestore Database -> Datos -> usuarios -> Agregar documento
```

Document ID:

```txt
UID exacto de Authentication
```

Campos minimos:

```json
{
  "email": "usuario@zapata.com.mx",
  "nombre": "Nombre Usuario",
  "rol": "vendedor",
  "role": "vendedor",
  "sucursalId": "suc-qro",
  "sucursalNombre": "Queretaro",
  "activo": true
}
```

Importante:

- `activo` debe ser boolean, no string.
- `rol` y `role` deben coincidir.
- `sucursalId` debe escribirse exactamente asi, con I mayuscula.
- No usar ID automatico para el documento.

### Paso 4 - Validar acceso

1. Usuario cierra sesion.
2. Usuario vuelve a entrar.
3. Debe entrar a la app.
4. Debe ver boton `Salir`.

## Plantillas de usuarios

### Soporte

```json
{
  "email": "soporte@zapata.com.mx",
  "nombre": "Soporte LAB",
  "rol": "soporte",
  "role": "soporte",
  "sucursalId": "suc-qro",
  "sucursalNombre": "Queretaro",
  "activo": true,
  "notas": "Usuario soporte piloto"
}
```

### Vendedor

```json
{
  "email": "vendedor@zapata.com.mx",
  "nombre": "Vendedor Piloto",
  "rol": "vendedor",
  "role": "vendedor",
  "sucursalId": "suc-qro",
  "sucursalNombre": "Queretaro",
  "activo": true,
  "notas": "Usuario vendedor piloto"
}
```

### Coordinador

```json
{
  "email": "coordinador@zapata.com.mx",
  "nombre": "Coordinador Piloto",
  "rol": "coordinador",
  "role": "coordinador",
  "sucursalId": "suc-qro",
  "sucursalNombre": "Queretaro",
  "activo": true,
  "notas": "Usuario coordinador piloto"
}
```

## Baja o desactivacion de usuario

No borrar el documento como primera opcion.

Procedimiento:

1. Ir a:

```txt
Firestore -> usuarios/{uid}
```

2. Cambiar:

```json
{
  "activo": false
}
```

3. Guardar.

Resultado esperado:

- El usuario ya no debe entrar.
- Si tiene sesion activa, al refrescar o volver a validar debe quedar fuera.

## Cambio de rol

Procedimiento:

1. Ir a `usuarios/{uid}`.
2. Cambiar ambos campos:

```json
{
  "rol": "coordinador",
  "role": "coordinador"
}
```

3. Guardar.
4. Pedir al usuario cerrar sesion y volver a entrar.

Regla:

- `rol` y `role` deben coincidir.

## Cambio de sucursal

Procedimiento:

1. Ir a `usuarios/{uid}`.
2. Cambiar ambos campos:

```json
{
  "sucursalId": "suc-leon",
  "sucursalNombre": "Leon"
}
```

3. Guardar.
4. Pedir al usuario cerrar sesion y volver a entrar.

## Errores comunes

### Usuario entra a Google pero queda en unauthorized

Revisar:

- Existe `usuarios/{uid}`?
- El UID del documento es exacto?
- `activo` es boolean `true`?
- `rol` es uno de `vendedor`, `coordinador`, `soporte`?
- `role` coincide con `rol`?
- El correo termina en `@zapata.com.mx`?

### Usuario queda en validando acceso

Revisar:

- consola;
- Firestore rules;
- documento `usuarios/{uid}`;
- campos mal escritos;
- errores de red.

### Campo activo mal creado

Incorrecto:

```json
{
  "activo": "true"
}
```

Correcto:

```json
{
  "activo": true
}
```

### Documento con ID automatico

Incorrecto:

```txt
usuarios/abc123random
```

Correcto:

```txt
usuarios/{UID_DE_AUTHENTICATION}
```

## Checklist de alta de usuario

- [ ] Usuario intento login una vez.
- [ ] Usuario aparece en Authentication.
- [ ] UID copiado correctamente.
- [ ] Documento `usuarios/{uid}` creado.
- [ ] `email` correcto.
- [ ] `nombre` correcto.
- [ ] `rol` valido.
- [ ] `role` coincide con `rol`.
- [ ] `sucursalId` correcto.
- [ ] `sucursalNombre` correcto.
- [ ] `activo=true` como boolean.
- [ ] Usuario valido entrada.
- [ ] Usuario valido logout.

## Usuarios piloto recomendados

Crear minimo:

| Rol         | Cantidad | Sucursal sugerida |
| ----------- | -------: | ----------------- |
| soporte     |        1 | Queretaro         |
| vendedor    |        1 | Queretaro         |
| coordinador |        1 | Queretaro         |

Despues:

- repetir para Leon;
- repetir para Guadalajara;
- probar flujo entre sucursales.

## Seguridad minima actual

- No hay registro publico.
- No hay acceso sin cuenta Google.
- No hay acceso sin dominio permitido.
- No hay acceso sin documento Firestore.
- No hay acceso si `activo=false`.
- No hay acceso si rol invalido.

## Limitaciones conocidas

- Alta manual desde Firebase Console.
- No hay panel admin todavia.
- No hay auditoria formal de cambios de usuarios.
- No hay MFA todavia.
- No hay catalogo formal de sucursales en Firestore.
- No hay flujo automatico de invitacion.

## Recomendacion de siguiente alcance

Despues de este documento:

1. Crear usuarios piloto reales:
- soporte;
- vendedor;
- coordinador.
2. Ejecutar:
- `docs/AUTH_ACCESS_QA_CHECKLIST.md`
3. Crear siguiente ticket:
- `LAB-USERS-002 - Catalogo formal de sucursales y usuarios piloto`
  o
- `LAB-REQUESTS-001 - Diseno del flujo de solicitudes entre sucursales`

FIN DEL DOCUMENTO.

## Referencia de modelo de aprobacion

Para el modelo de solicitudes de acceso y base de seguridad para panel de soporte ver:
`docs/USERS_ADMIN_PANEL_MODEL.md`.
