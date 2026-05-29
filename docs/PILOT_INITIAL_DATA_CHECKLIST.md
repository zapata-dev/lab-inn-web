# Pilot Initial Data Checklist (LAB-PROD-021)

Checklist paso a paso para dejar el ambiente dev/piloto con datos suficientes para QA.

Completar en orden. Cada paso depende del anterior.

Ver templates en:
- [PILOT_BRANCHES_TEMPLATE.md](./PILOT_BRANCHES_TEMPLATE.md)
- [PILOT_USERS_TEMPLATE.md](./PILOT_USERS_TEMPLATE.md)

---

## Paso 1 — Confirmar ambiente

- [ ] `firebase use` muestra el proyecto correcto (dev, no prod)
- [ ] Firestore está en modo producción (no emulador)
- [ ] La app está desplegada y accesible en la URL de Hosting (o corriendo en `localhost` con `.env.local` apuntando al proyecto dev)

---

## Paso 2 — Crear sucursales

En **Firestore Console > sucursales**:

- [ ] Crear `sucursales/suc-qro` con campos del template
- [ ] Crear `sucursales/suc-mty` con campos del template
- [ ] (Opcional) Crear `sucursales/suc-cdmx` si se necesita tercera sucursal

Validar:
- [ ] Ambos documentos existen con `activa: true`
- [ ] `coordinadorIds` está como array vacío `[]` por ahora

---

## Paso 3 — Bootstrap usuario soporte

- [ ] El usuario soporte inicia sesión en la app con su cuenta `@zapata.com.mx`
- [ ] La app redirige a `/unauthorized` (esperado)
- [ ] Obtener UID desde Firebase Console > Authentication > Users
- [ ] Crear `usuarios/{uid}` con el template de soporte
- [ ] Usuario recarga la app
- [ ] Verificar que puede ver el menú completo y acceder a `/soporte/inventario/imports`

---

## Paso 4 — Crear coordinadores

Para cada coordinador:

- [ ] El usuario inicia sesión (obtiene UID en Authentication)
- [ ] Crear `usuarios/{uid}` con template de coordinador, `sucursalId` correcto
- [ ] Verificar login: puede ver inventario y bandeja de solicitudes

Coordinar que:
- [ ] Coordinador QRO: `sucursalId = "suc-qro"`
- [ ] Coordinador MTY: `sucursalId = "suc-mty"`

---

## Paso 5 — Actualizar coordinadorIds en sucursales

Una vez creados los coordinadores:

- [ ] Abrir `sucursales/suc-qro` en Firestore Console
- [ ] Editar `coordinadorIds` → agregar UID del coordinador QRO
- [ ] Abrir `sucursales/suc-mty` en Firestore Console
- [ ] Editar `coordinadorIds` → agregar UID del coordinador MTY

Esto permite que las solicitudes se enruten correctamente a cada coordinador.

---

## Paso 6 — Crear vendedores

Para cada vendedor:

- [ ] El usuario inicia sesión (obtiene UID en Authentication)
- [ ] Crear `usuarios/{uid}` con template de vendedor, `sucursalId` correcto
- [ ] Verificar login: puede ver Inventario Nacional

Mínimo recomendado:
- [ ] 2 vendedores en `suc-qro`
- [ ] 2 vendedores en `suc-mty`

---

## Paso 7 — Importar inventario inicial

- [ ] Confirmar que `INVENTORY_CSV_URL` está configurada en Cloud Functions
- [ ] Login como soporte
- [ ] Ir a `/soporte/inventario/imports`
- [ ] Ejecutar import manual (dejar URL vacía para usar la configurada)
- [ ] Esperar resultado

Validar:
- [ ] `status = "completado"` o `"completado_con_errores"` en el resultado
- [ ] `registrosUpserted > 0`
- [ ] Al menos una unidad en `inventario/{vin}` con `importStatus = "active"`
- [ ] Las unidades tienen `sucursalId` que coincide con los IDs creados en Paso 2
- [ ] Inventario Nacional muestra unidades (requiere login como vendedor o coordinador)

Si `status = "fallido"`:
- Revisar `errorResumen` en el detalle del import
- Verificar que `INVENTORY_CSV_URL` es accesible y devuelve CSV válido

---

## Paso 8 — Validación cruzada de roles

| Escenario | Resultado esperado |
|-----------|-------------------|
| Login como vendedor QRO | Ve inventario, puede crear solicitud para unidad de MTY |
| Login como coordinador MTY | Ve solicitudes de su sucursal |
| Login como soporte | Ve todo, puede ejecutar import manual |
| Login con correo sin `usuarios/{uid}` | Redirige a `/unauthorized` |
| Login con correo externo | Bloqueado por dominio |

---

## Paso 9 — Smoke test final

- [ ] Vendedor crea solicitud para unidad de otra sucursal
- [ ] Coordinador de la sucursal destino ve la solicitud en su bandeja
- [ ] Coordinador cambia estado de la solicitud
- [ ] Notificación in-app llega al vendedor
- [ ] Soporte ve el import en `/soporte/inventario/imports`
- [ ] Banner de frescura en Inventario Nacional muestra hora del último import

---

## Datos de referencia para QA

Anotar aquí durante el seed (no commitear):

```txt
soporte_uid:           __________________
coordinador_qro_uid:   __________________
coordinador_mty_uid:   __________________
vendedor_qro_01_uid:   __________________
vendedor_qro_02_uid:   __________________
vendedor_mty_01_uid:   __________________
vendedor_mty_02_uid:   __________________
vin_unidad_qro_01:     __________________
vin_unidad_mty_01:     __________________
ultimo_importId:       __________________
```

---

## Próximo paso

Con el ambiente sembrado, ejecutar **LAB-PROD-022 — QA end-to-end** usando los usuarios y datos creados aquí.

- Plan completo: [QA_PILOT_E2E_PLAN.md](./QA_PILOT_E2E_PLAN.md)
- Casos de prueba: [QA_PILOT_TEST_CASES.md](./QA_PILOT_TEST_CASES.md)
- Plantilla de resultados: [QA_PILOT_RESULTS_TEMPLATE.md](./QA_PILOT_RESULTS_TEMPLATE.md)

No abrir piloto a usuarios reales hasta completar el QA y obtener decisión **Go** o **Go con restricciones**.
