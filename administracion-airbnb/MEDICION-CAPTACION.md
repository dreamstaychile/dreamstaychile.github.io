# Medición de captación de propietarios — Dream Stay Chile

## Estado
- Landings por mercado: publicadas en el repositorio, con el formulario compartido `administra-tu-propiedad/app.js`.
- Registro de leads: el navegador envía POST al endpoint de `administra-tu-propiedad/config.js`. **No se ha validado una entrega real de producción**.
- Instrumentación de eventos: envía eventos al `window.dataLayer`, con `lead_market` y `form_id`. Esto **no equivale a tener Google Analytics 4 activo**: se debe conectar GTM o una implementación equivalente, respetando las preferencias de privacidad.

## Eventos disponibles
| Evento | Disparador | Métrica |
|---|---|---|
| `property_landing_view` | Carga de una landing | Visitas |
| `property_cta_clicked` | Clic en CTA | Interés |
| `property_form_started` | Primera interacción | Inicio formulario |
| `property_form_step_1_completed` | Avance de etapa | Calidad del embudo |
| `property_form_step_2_completed` | Formulario validado en navegador | Finalización de ingreso |
| `property_form_attempt` | Intenta enviar datos | Intentos |
| `property_form_success` | Backend responde `ok: true` | **Conversión principal** |
| `property_form_error` | Fallo de envío o configuración | Errores |

Todos incluyen `lead_market` (slug de la ruta) y `form_id`. Algunos incluyen parámetros de campaña permitidos. **No enviar correo, teléfono, dirección ni nombre a GA4**.

## Datos de atribución capturados para el backend
- `leadMarket`: mercado del pathname.
- `landingPage`: URL sin query string.
- `source`, `medium`, `campaign`, `content`, `term`, `gclid`, `fbclid` desde el último contacto UTM disponible en la sesión.
- `firstTouch`: primer contacto etiquetado de la sesión.
- `referrer`: URL referidora truncada.
- Los datos adicionales son opcionales para el backend. Verificar que Apps Script los persista en columnas antes de afirmar que están almacenados.

## Configuración para convertir eventos en informes
1. Obtener el ID de la propiedad GA4 y configurar Google Tag Manager o gtag, con gestión de consentimiento apropiada.
2. Conectar las variables de capa de datos `lead_market`, `form_id`, `source`, `medium`, `campaign`.
3. Mapear los ocho eventos anteriores y marcar **solo** `property_form_success` como evento clave principal.
4. Probar las rutas de Providencia, Las Condes, Santiago Centro, Ñuñoa y Viña del Mar/Reñaca con GA4 DebugView y una prueba autorizada de formulario. Confirmar recepción en Apps Script.
5. En la fuente de leads, conservar estados de CRM: `nuevo`, `contactado`, `calificado`, `visita`, `propuesta`, `contrato`, `descartado`; registrar `motivo_descarte`, `fecha`, `leadMarket` y origen.
6. Revisar semanalmente por mercado: visitas, inicios, éxitos, tasa de conversión, errores, calificados, contratos, gasto y costos por lead/calificado/contrato.

## Fórmulas
- Conversión web = envíos exitosos / visitas de landing.
- Calificación = leads calificados / envíos exitosos.
- Conversión comercial = contratos firmados / leads calificados.
- CPL = gasto publicitario / leads exitosos atribuidos.
- CPQL = gasto publicitario / leads calificados atribuidos.
- CAC = gasto publicitario y comercial atribuible / contratos firmados.
- Medir por campañas con parámetros UTM consistentes. No sumar conversiones de distinta definición.

## Plantillas UTM (ejemplos)
- Google Search: `?utm_source=google&utm_medium=cpc&utm_campaign=propietarios_providencia&utm_content=search_servicio`
- Meta: `?utm_source=facebook&utm_medium=paid_social&utm_campaign=propietarios_las_condes&utm_content=creativo_a`
- Organic social: `?utm_source=instagram&utm_medium=organic_social&utm_campaign=propietarios_nunoa`

## Antes de contratar publicidad
- Comprobar funcionamiento real del formulario, validaciones y registro en backend.
- Probar carga móvil y consentimientos; confirmar que GA4 registra sin exponer PII.
- Revisar el mensaje de cobertura: no presentar como operación confirmada mercados aún no habilitados.
- No calcular retorno sobre inversión usando solo visitas o leads sin calificación comercial.
