const CATEGORIES = [
  { emoji: "🤖", name: "AI",             desc: "Artificial intelligence & machine learning",  slug: "ai" },
  { emoji: "⚽", name: "Football",       desc: "Scores, transfers & match analysis",           slug: "football" },
  { emoji: "₿",  name: "Crypto",         desc: "Markets, Web3 & blockchain news",              slug: "crypto" },
  { emoji: "💼", name: "Business",       desc: "Strategy, finance & global markets",           slug: "business" },
  { emoji: "💻", name: "Technology",     desc: "Gadgets, software & innovation",               slug: "technology" },
  { emoji: "🎵", name: "Music",          desc: "Culture, releases & the music industry",       slug: "music" },
  { emoji: "📈", name: "Personal Growth", desc: "Mindset, habits & everyday wins",             slug: "personal-growth" },
  { emoji: "🗳️", name: "Politics",       desc: "Global affairs, policy & world events",        slug: "politics" },
];

function categoryCard(siteUrl: string, c: (typeof CATEGORIES)[0]): string {
  return `
    <td width="50%" valign="top" style="padding:0 6px 12px;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="background-color:#111c2d;border:1px solid #1e2e45;border-radius:12px;padding:16px;">
            <p style="margin:0 0 6px;font-size:20px;line-height:1;">${c.emoji}</p>
            <a href="${siteUrl}/category/${c.slug}" style="text-decoration:none;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">${c.name}</p>
            </a>
            <p style="margin:0;font-size:12px;color:#71717a;line-height:1.4;font-family:Arial,Helvetica,sans-serif;">${c.desc}</p>
          </td>
        </tr>
      </table>
    </td>`;
}

function categoryRows(siteUrl: string): string {
  let rows = "";
  for (let i = 0; i < CATEGORIES.length; i += 2) {
    const a = CATEGORIES[i];
    const b = CATEGORIES[i + 1];
    rows += `
    <tr>
      ${categoryCard(siteUrl, a)}
      ${b ? categoryCard(siteUrl, b) : '<td width="50%" style="padding:0 6px 12px;"></td>'}
    </tr>`;
  }
  return rows;
}

export function buildWelcomeEmail({
  siteUrl,
  unsubscribeUrl,
}: {
  siteUrl: string;
  unsubscribeUrl: string;
}): { html: string; text: string } {
  const year = new Date().getFullYear();

  const html = `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
  <title>Welcome to Fena Daily</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    *{box-sizing:border-box;}
    body{margin:0;padding:0;width:100%;word-break:break-word;-webkit-font-smoothing:antialiased;background-color:#080f1a;}
    a{color:inherit;}
    @media only screen and (max-width:620px){
      .container{width:100%!important;}
      .px{padding-left:24px!important;padding-right:24px!important;}
      .cat-row{display:block!important;}
      .cat-cell{display:block!important;width:100%!important;padding:0 0 10px!important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#080f1a;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#080f1a;">
  <tr>
    <td align="center" style="padding:40px 16px 48px;">

      <table class="container" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">

        <!-- ── HEADER ── -->
        <tr>
          <td style="background-color:#0d1623;border-radius:16px 16px 0 0;border:1px solid #1a2840;border-bottom:none;padding:26px 40px;" class="px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <a href="${siteUrl}" style="text-decoration:none;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;font-family:Arial,Helvetica,sans-serif;">Fena Daily</a>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span style="font-size:10px;color:#3f5070;text-transform:uppercase;letter-spacing:3px;font-family:Arial,Helvetica,sans-serif;">Newsletter</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── AMBER ACCENT LINE ── -->
        <tr>
          <td height="3" style="background-color:#fbbf24;font-size:0;line-height:0;border-left:1px solid #1a2840;border-right:1px solid #1a2840;">&nbsp;</td>
        </tr>

        <!-- ── HERO ── -->
        <tr>
          <td style="background-color:#0b1525;border-left:1px solid #1a2840;border-right:1px solid #1a2840;padding:52px 40px 44px;" class="px">

            <!-- "You're in" badge -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background-color:#0d2010;border:1px solid #1a3d14;border-radius:50px;padding:5px 16px;">
                  <span style="font-size:11px;font-weight:700;color:#86efac;text-transform:uppercase;letter-spacing:2px;font-family:Arial,Helvetica,sans-serif;">&#10003;&nbsp; You&#39;re in</span>
                </td>
              </tr>
            </table>

            <!-- Headline -->
            <h1 style="margin:0 0 18px;font-size:36px;font-weight:700;line-height:1.15;letter-spacing:-0.5px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
              Welcome to<br><span style="color:#fbbf24;">Fena Daily</span>
            </h1>

            <!-- Body -->
            <p style="margin:0 0 36px;font-size:16px;color:#94a3b8;line-height:1.65;font-family:Arial,Helvetica,sans-serif;">
              You&#39;re subscribed. Every edition brings you independent, no-fluff coverage of the stories
              that matter, across AI, Football, Crypto, Business, Technology, Music, Politics, and Personal Growth.
            </p>

            <!-- CTA button -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius:50px;background-color:#fbbf24;">
                  <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${siteUrl}" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="50%" stroke="f" fillcolor="#fbbf24"><w:anchorlock/><center><![endif]-->
                  <a href="${siteUrl}" style="display:inline-block;padding:14px 30px;font-size:14px;font-weight:700;color:#0a0a0a;text-decoration:none;letter-spacing:0.1px;font-family:Arial,Helvetica,sans-serif;">
                    Read Today&#39;s Stories &#8594;
                  </a>
                  <!--[if mso]></center></v:roundrect><![endif]-->
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- ── DIVIDER ── -->
        <tr>
          <td height="1" style="background-color:#1a2840;font-size:0;line-height:0;border-left:1px solid #1a2840;border-right:1px solid #1a2840;">&nbsp;</td>
        </tr>

        <!-- ── TOPICS ── -->
        <tr>
          <td style="background-color:#0d1623;border-left:1px solid #1a2840;border-right:1px solid #1a2840;padding:36px 34px 28px;" class="px">

            <p style="margin:0 0 22px;font-size:10px;font-weight:700;color:#3f5070;text-transform:uppercase;letter-spacing:4px;font-family:Arial,Helvetica,sans-serif;">What&#39;s covered</p>

            <table width="100%" cellpadding="0" cellspacing="0">
              ${categoryRows(siteUrl)}
            </table>

          </td>
        </tr>

        <!-- ── DIVIDER ── -->
        <tr>
          <td height="1" style="background-color:#1a2840;font-size:0;line-height:0;border-left:1px solid #1a2840;border-right:1px solid #1a2840;">&nbsp;</td>
        </tr>

        <!-- ── PROMISE STRIP ── -->
        <tr>
          <td style="background-color:#0b1525;border-left:1px solid #1a2840;border-right:1px solid #1a2840;padding:28px 40px;" class="px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="33%" align="center" style="padding:0 8px;">
                  <p style="margin:0 0 4px;font-size:18px;">📬</p>
                  <p style="margin:0;font-size:12px;font-weight:700;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">Daily Updates</p>
                  <p style="margin:4px 0 0;font-size:11px;color:#71717a;font-family:Arial,Helvetica,sans-serif;">Fresh stories every day</p>
                </td>
                <td width="33%" align="center" style="padding:0 8px;border-left:1px solid #1a2840;border-right:1px solid #1a2840;">
                  <p style="margin:0 0 4px;font-size:18px;">🚫</p>
                  <p style="margin:0;font-size:12px;font-weight:700;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">Zero Spam</p>
                  <p style="margin:4px 0 0;font-size:11px;color:#71717a;font-family:Arial,Helvetica,sans-serif;">Unsubscribe any time</p>
                </td>
                <td width="33%" align="center" style="padding:0 8px;">
                  <p style="margin:0 0 4px;font-size:18px;">🎯</p>
                  <p style="margin:0;font-size:12px;font-weight:700;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">Independent</p>
                  <p style="margin:4px 0 0;font-size:11px;color:#71717a;font-family:Arial,Helvetica,sans-serif;">No agenda, just facts</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="background-color:#080f1a;border:1px solid #1a2840;border-top:none;border-radius:0 0 16px 16px;padding:28px 40px 32px;" class="px">

            <!-- Nav links -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td align="center">
                  <a href="${siteUrl}" style="font-size:12px;color:#94a3b8;text-decoration:none;margin:0 10px;font-family:Arial,Helvetica,sans-serif;">Home</a>
                  <span style="color:#1a2840;">|</span>
                  <a href="${siteUrl}/about" style="font-size:12px;color:#94a3b8;text-decoration:none;margin:0 10px;font-family:Arial,Helvetica,sans-serif;">About</a>
                  <span style="color:#1a2840;">|</span>
                  <a href="${siteUrl}/contact" style="font-size:12px;color:#94a3b8;text-decoration:none;margin:0 10px;font-family:Arial,Helvetica,sans-serif;">Contact</a>
                </td>
              </tr>
            </table>

            <!-- Rule -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td height="1" style="background-color:#1a2840;font-size:0;line-height:0;">&nbsp;</td>
              </tr>
            </table>

            <!-- Legal -->
            <p style="margin:0 0 6px;font-size:11px;color:#3f5070;text-align:center;font-family:Arial,Helvetica,sans-serif;">
              &#169; ${year} Fena Daily &#8212; Independent news, delivered daily.
            </p>
            <p style="margin:0;font-size:11px;color:#3f5070;text-align:center;font-family:Arial,Helvetica,sans-serif;">
              You subscribed at fenadaily.com.
              <a href="${unsubscribeUrl}" style="color:#52525b;text-decoration:underline;font-family:Arial,Helvetica,sans-serif;">Unsubscribe</a>
            </p>

          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;

  const text = [
    "FENA DAILY: Welcome!",
    "════════════════════════════════",
    "",
    "You're subscribed. Here's what you'll receive:",
    "",
    "  🤖 AI: Artificial intelligence & machine learning",
    "  ⚽ Football: Scores, transfers & match analysis",
    "  ₿  Crypto: Markets, Web3 & blockchain news",
    "  💼 Business: Strategy, finance & global markets",
    "  💻 Technology: Gadgets, software & innovation",
    "  🎵 Music: Culture, releases & the music industry",
    "  📈 Personal Growth: Mindset, habits & everyday wins",
    "  🗳️ Politics: Global affairs, policy & world events",
    "",
    "Read today's stories:",
    siteUrl,
    "",
    "════════════════════════════════",
    `© ${year} Fena Daily`,
    `To unsubscribe: ${unsubscribeUrl}`,
  ].join("\n");

  return { html, text };
}
