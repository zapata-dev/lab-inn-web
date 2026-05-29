# AUTH ACCESS QA CHECKLIST

## Objetivo

Validar que el acceso productivo con Firebase Auth + Firestore `usuarios/{uid}` funciona correctamente para el piloto LAB.

## Ambiente

- URL: https://lab-inn-web-dev.web.app
- Proyecto Firebase: lab-inn-web-dev
- Auth mode esperado: firebase
- Provider: Google
- Dominio permitido: zapata.com.mx
- Base Firestore: `(default)`
- Coleccion de autorizacion: `usuarios`

## Estructura esperada de usuario autorizado

Coleccion:
usuarios

Document ID:
UID exacto de Firebase Authentication

Campos minimos:

- email: string
- nombre: string
- rol: string
- role: string
- sucursalId: string
- sucursalNombre: string
- activo: boolean

Roles validos:

- vendedor
- coordinador
- soporte

Ejemplo soporte:

```json
{
  "email": "usuario@zapata.com.mx",
  "nombre": "Nombre Usuario",
  "rol": "soporte",
  "role": "soporte",
  "sucursalId": "suc-qro",
  "sucursalNombre": "Queretaro",
  "activo": true
}
```

## Checklist tecnico previo

- [ ] Firebase Hosting abre correctamente.
- [ ] `/login` muestra boton "Entrar con Google Zapata".
- [ ] No aparece `index-CrxS1kh5.js`.
- [ ] No aparecen requests a `cdn.simpleicons.org`.
- [ ] No hay loop infinito de `channel?VER=8...`.
- [ ] Existe boton visible `Salir` dentro de rutas protegidas.
- [ ] Firestore tiene coleccion `usuarios`.
- [ ] Google Provider esta habilitado.
- [ ] Dominios autorizados incluyen:
- [ ] `lab-inn-web-dev.web.app`
- [ ] `lab-inn-web-dev.firebaseapp.com`
- [ ] `localhost`

## Prueba 1 - Soporte autorizado entra

Precondicion:

- Existe usuario en Authentication.
- Existe `usuarios/{uid}` con:
- `activo=true`
- `rol=soporte`
- `role=soporte`

Pasos:

1. Abrir `https://lab-inn-web-dev.web.app/login`.
2. Click en "Entrar con Google Zapata".
3. Entrar con cuenta `@zapata.com.mx`.
4. Esperar redireccion.

Resultado esperado:

- Entra a la app.
- No se queda en "Validando acceso...".
- No redirige a `/unauthorized`.
- Se ve boton `Salir`.

Resultado real:

- Pendiente de llenar.

Estatus:

- [ ] Pass
- [ ] Fail

## Prueba 2 - Logout limpia sesion

Precondicion:

- Usuario autorizado dentro de la app.

Pasos:

1. Click en `Salir`.
2. Confirmar redireccion a `/login`.
3. Refrescar pagina.
4. Confirmar que sigue en login.
5. Volver a entrar.

Resultado esperado:

- Cierra sesion.
- Aparece boton "Entrar con Google Zapata".
- No queda sesion anterior pegada.
- Puede volver a iniciar sesion.

Resultado real:

- Pendiente de llenar.

Estatus:

- [ ] Pass
- [ ] Fail

## Prueba 3 - Usuario sin documento Firestore queda bloqueado

Precondicion:

- Usuario existe en Authentication.
- No existe documento `usuarios/{uid}`.

Pasos:

1. Iniciar sesion con ese usuario.
2. Esperar validacion.

Resultado esperado:

- Redirige a `/unauthorized`.
- No queda en loading infinito.
- Mensaje claro de acceso no autorizado.

Resultado real:

- Pendiente de llenar.

Estatus:

- [ ] Pass
- [ ] Fail

## Prueba 4 - Usuario inactivo queda bloqueado

Precondicion:

- Existe `usuarios/{uid}`.
- Campo `activo=false`.

Pasos:

1. Iniciar sesion con ese usuario.
2. Esperar validacion.

Resultado esperado:

- Redirige a `/unauthorized`.
- No entra a la app.
- No queda en loading infinito.

Resultado real:

- Pendiente de llenar.

Estatus:

- [ ] Pass
- [ ] Fail

## Prueba 5 - Rol invalido queda bloqueado

Precondicion:

- Existe `usuarios/{uid}`.
- `activo=true`.
- `rol` o `role` tiene valor invalido, por ejemplo `admin_fake`.

Pasos:

1. Iniciar sesion con ese usuario.
2. Esperar validacion.

Resultado esperado:

- Redirige a `/unauthorized`.
- No entra a la app.
- No queda en loading infinito.

Resultado real:

- Pendiente de llenar.

Estatus:

- [ ] Pass
- [ ] Fail

## Prueba 6 - Vendedor autorizado entra

Precondicion:

- Existe `usuarios/{uid}` con:
- `activo=true`
- `rol=vendedor`
- `role=vendedor`
- `sucursalId` valido
- `sucursalNombre` valido

Pasos:

1. Iniciar sesion.
2. Validar acceso.

Resultado esperado:

- Entra a la app.
- Logout visible.
- No ve errores de autorizacion.

Resultado real:

- Pendiente de llenar.

Estatus:

- [ ] Pass
- [ ] Fail

## Prueba 7 - Coordinador autorizado entra

Precondicion:

- Existe `usuarios/{uid}` con:
- `activo=true`
- `rol=coordinador`
- `role=coordinador`
- `sucursalId` valido
- `sucursalNombre` valido

Pasos:

1. Iniciar sesion.
2. Validar acceso.

Resultado esperado:

- Entra a la app.
- Logout visible.
- No ve errores de autorizacion.

Resultado real:

- Pendiente de llenar.

Estatus:

- [ ] Pass
- [ ] Fail

## Prueba 8 - Correo externo queda bloqueado

Precondicion:

- Cuenta Google externa, no `@zapata.com.mx`.

Pasos:

1. Abrir `/login`.
2. Intentar entrar con correo externo.

Resultado esperado:

- No entra a la app.
- Se muestra error de dominio no permitido o se redirige a `/unauthorized`.
- No se crea acceso valido.

Resultado real:

- Pendiente de llenar.

Estatus:

- [ ] Pass
- [ ] Fail

## Prueba 9 - Refresh en ruta protegida mantiene sesion

Precondicion:

- Usuario autorizado dentro de la app.

Pasos:

1. Estando dentro de la app, refrescar con `Ctrl + R`.
2. Esperar validacion.

Resultado esperado:

- Permanece dentro.
- No manda a login.
- No queda en "Validando acceso..." indefinidamente.

Resultado real:

- Pendiente de llenar.

Estatus:

- [ ] Pass
- [ ] Fail

## Prueba 10 - Navegacion directa a ruta protegida

Precondicion:

- Usuario autorizado con sesion activa.

Pasos:

1. Abrir directamente:
- `/`
- `/inventario`
- `/login`

Resultado esperado:

- Ruta raiz carga app.
- Ruta protegida valida sesion.
- `/login` no causa loop raro si ya hay sesion.

Resultado real:

- Pendiente de llenar.

Estatus:

- [ ] Pass
- [ ] Fail

## Evidencia a capturar

Para cada prueba fallida, capturar:

- URL exacta.
- Pantalla.
- Primer error rojo de consola.
- Requests relevantes de Network.
- UID probado.
- Documento `usuarios/{uid}` usado.
- Resultado esperado vs resultado real.

## Criterio de cierre

El bloque Auth/Firebase se considera listo cuando:

- [ ] Soporte autorizado entra.
- [ ] Vendedor autorizado entra.
- [ ] Coordinador autorizado entra.
- [ ] Usuario sin documento bloquea.
- [ ] Usuario inactivo bloquea.
- [ ] Rol invalido bloquea.
- [ ] Correo externo bloquea.
- [ ] Logout funciona.
- [ ] Refresh mantiene sesion.
- [ ] No hay loops de Firestore/Auth.
- [ ] No hay errores de cache/simpleicons.

## Riesgos conocidos

- Warning `Cross-Origin-Opener-Policy` puede aparecer con popup Google; no se considera bloqueo si el login funciona.
- El alta de usuarios sigue siendo manual en Firestore.
- No existe panel admin todavia.
- MFA queda fuera de alcance.

## Proximos pasos recomendados

Despues de cerrar este checklist:

1. Definir alta operativa de usuarios por rol y sucursal.
2. Crear usuarios piloto:
- 1 soporte
- 1 vendedor
- 1 coordinador
3. Validar permisos por rol en vistas futuras.
4. Evaluar panel admin en un alcance posterior.
5. Evaluar MFA para soporte/coordinador en alcance posterior.

FIN DEL DOCUMENTO.
