import express from 'express';

const app = express();
const PORT = process.env.PORT || 10000;
const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://www.dreamstaychile.com';

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'dreamstay-payment-api' });
});

app.post('/create-preference', async (req, res) => {
  try {
    if (!ACCESS_TOKEN) {
      return res.status(503).json({ error: 'Mercado Pago no configurado' });
    }

    const amount = Number(req.body?.amount);
    const reference = String(req.body?.reference || '').trim().slice(0, 80);

    if (!Number.isFinite(amount) || amount < 100 || amount > 10000000) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    const preference = {
      items: [
        {
          id: reference || `dreamstay-${Date.now()}`,
          title: reference ? `Dream Stay - ${reference}` : 'Pago de reserva Dream Stay',
          quantity: 1,
          currency_id: 'CLP',
          unit_price: Math.round(amount)
        }
      ],
      statement_descriptor: 'DREAM STAY',
      external_reference: reference || undefined,
      back_urls: {
        success: 'https://www.dreamstaychile.com/pagar/?estado=aprobado',
        pending: 'https://www.dreamstaychile.com/pagar/?estado=pendiente',
        failure: 'https://www.dreamstaychile.com/pagar/?estado=rechazado'
      },
      auto_return: 'approved'
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok || !data?.init_point) {
      console.error('Mercado Pago error:', data);
      return res.status(502).json({ error: 'No fue posible iniciar el pago' });
    }

    res.json({ checkoutUrl: data.init_point });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al iniciar el pago' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dream Stay payment API running on port ${PORT}`);
});
