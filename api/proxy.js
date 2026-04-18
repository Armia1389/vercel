export default async function handler(req, res) {
  const target = req.query.url;

  if (!target) {
    return res.status(400).send("No URL");
  }

  try {
    const response = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const contentType = response.headers.get("content-type") || "";

    // اگر HTML بود لینک‌ها رو اصلاح کن
    if (contentType.includes("text/html")) {
      let html = await response.text();

      html = html.replace(/href="\/(.*?)"/g,
        `href="/api/proxy?url=${target}/$1"`);

      html = html.replace(/href="https:\/\/(.*?)"/g,
        `href="/api/proxy?url=https://$1"`);

      html = html.replace(/src="\/(.*?)"/g,
        `src="/api/proxy?url=${target}/$1"`);

      html = html.replace(/src="https:\/\/(.*?)"/g,
        `src="/api/proxy?url=https://$1"`);

      res.setHeader("content-type", "text/html");
      return res.send(html);
    }

    // سایر فایل‌ها (عکس، css…)
    const buffer = await response.arrayBuffer();
    res.setHeader("content-type", contentType);
    res.send(Buffer.from(buffer));

  } catch (e) {
    res.status(500).send("Error loading site");
  }
}
