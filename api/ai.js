// Vercel Serverless Function — بروكسي آمن لـ Anisk AI.
// السبب: مفتاح الـ API لازم يفضل على السيرفر، مينفعش يتحط في كود الموقع نفسه
// (أي حد فاتح الصفحة هيقدر يشوفه ويستخدمه لو كان جوه كود المتصفح). الدالة دي
// بتستقبل رسائل المستخدمة، وتنادي Anthropic API فعليًا من السيرفر، وترجّع الرد بس.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY غير مُعرَّف. أضيفيه من إعدادات المشروع على Vercel (Settings → Environment Variables) ثم أعيدي النشر (Redeploy).",
    });
  }

  try {
    const { system, messages } = req.body || {};
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system,
        messages,
      }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data?.error?.message || "تعذّر الاتصال بالمساعد." });
    }
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: "حدث خطأ غير متوقع في الخادم." });
  }
}
