# Smoke Test Operativo Actual LAB

## Objetivo

Validar que el estado actual de LAB funciona despues de cualquier cambio.

## Reglas

- No probar alcances viejos.
- No exigir roles o modulos no vigentes.
- No considerar pendiente algo que fue recortado.
- Validar solo rutas y flujos actuales.

## Preparacion

```bash
npm install
npm run lint
npm run build
npm run preview
```

## Rutas minimas a validar

- `/`
- `/login`
- `/inicio`
- `/herramientas`
- `/capacitacion`
- `/salesforce`
- `/youtube`
- `/canal-youtube`
- `/inventario`
- `/promociones`
- `/catalogo-portadas`
- `/usuarios`
- `/soporte/usuarios`
- `/perfil`
- `/unauthorized`

Si alguna ruta no aplica por permisos, documentar el resultado esperado.

## Checklist manual

### Acceso

- Login carga correctamente.
- Login muestra mensajes claros.
- Logout funciona.
- Usuario no autorizado no entra a rutas protegidas.

### Navegacion

- Sidebar no manda a rutas rotas.
- BottomNav no manda a rutas rotas.
- Topbar no manda a rutas rotas.
- Refrescar una ruta no rompe la SPA.

### Inventario y promociones

- Inventario carga.
- Filtros visibles funcionan segun estado actual.
- Promociones carga.
- Catalogo de portadas carga si sigue vigente.

### YouTube

- Pagina de YouTube carga.
- Tabs o tarjetas actuales abren los links esperados.
- No hay links vacios.

### Usuarios y soporte

- `/usuarios` responde segun permisos actuales.
- `/soporte/usuarios` responde segun permisos actuales.
- Si no hay acceso, debe verse bloqueo controlado, no pantalla rota.

### Perfil

- Perfil carga.
- Datos visibles actuales se muestran correctamente.
- Cerrar sesion funciona desde donde aplique.

### Responsive basico

- Validar desktop.
- Validar tablet aproximado.
- Validar movil aproximado.

### Errores visibles

- No hay errores rojos en consola durante navegacion basica.
- No hay pantalla blanca.
- No hay 404 inesperado en rutas registradas.

## Resultado esperado

Cada prueba debe tener:

- Estado: Pendiente / OK / Falla.
- Evidencia opcional.
- Observaciones.

