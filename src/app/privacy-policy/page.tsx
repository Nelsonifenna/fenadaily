import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fenadaily.com";
const DESC =
  "Fena Daily's Privacy Policy: how we collect, use, and protect your information when you visit our site or subscribe to our newsletter.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: DESC,
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/privacy-policy`,
    title: "Privacy Policy | Fena Daily",
    description: DESC,
  },
};

const sections = [
  {
    heading: "1. Information We Collect",
    content: (
      <>
        <p className="mb-3">
          <strong className="text-white">Information you provide:</strong> When you subscribe to our
          newsletter or contact us through our contact form, we collect your name and email address.
          You provide this voluntarily.
        </p>
        <p>
          <strong className="text-white">Automatically collected data:</strong> Like most websites, we
          may collect certain technical data automatically when you visit, including your IP address,
          browser type, referring page, and the pages you view. This data is used only to understand
          how our site is used and to improve it. We do not build profiles or use this data for
          advertising targeting.
        </p>
      </>
    ),
  },
  {
    heading: "2. How We Use Your Information",
    content: (
      <ul className="space-y-2 pl-0">
        {[
          "Send our newsletter to subscribers who have opted in",
          "Respond to messages you send us through our contact form",
          "Understand how our website is used so we can improve it",
          "Ensure our website operates correctly and securely",
        ].map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    heading: "3. Newsletter",
    content: (
      <p>
        If you subscribe to the Fena Daily newsletter, we will send you editorial updates based on
        your subscription preferences. You can unsubscribe at any time using the link at the bottom
        of any email we send. We do not share subscriber email addresses with third parties for
        marketing purposes.
      </p>
    ),
  },
  {
    heading: "4. Cookies",
    content: (
      <p>
        We may use cookies and similar tracking technologies to improve your experience on our site.
        You can control cookies through your browser settings. Please note that disabling cookies may
        affect the functionality of some parts of our site.
      </p>
    ),
  },
  {
    heading: "5. Third-Party Services",
    content: (
      <p>
        We use a small number of third-party services to operate our website, including an email
        delivery service for our newsletter. These providers process data according to their own
        privacy policies and only to the extent necessary to deliver the service. We do not sell
        your data to any third party.
      </p>
    ),
  },
  {
    heading: "6. Data Retention",
    content: (
      <p>
        We retain subscriber email addresses until you unsubscribe or request deletion. Contact form
        submissions may be retained for a reasonable period to respond to your message and for
        record-keeping purposes.
      </p>
    ),
  },
  {
    heading: "7. Your Rights",
    content: (
      <p>
        Depending on where you live, you may have rights regarding your personal data, including
        the right to access, correct, or delete your information. To exercise any of these rights,
        contact us at{" "}
        <a
          href="mailto:fenadaily@gmail.com"
          className="text-amber-300 transition-colors hover:text-amber-200"
        >
          fenadaily@gmail.com
        </a>
        . We will respond within a reasonable timeframe.
      </p>
    ),
  },
  {
    heading: "8. Children's Privacy",
    content: (
      <p>
        Fena Daily is not directed at children under the age of 13. We do not knowingly collect
        personal information from children. If you believe we have inadvertently collected such
        information, please contact us and we will delete it promptly.
      </p>
    ),
  },
  {
    heading: "9. Changes to This Policy",
    content: (
      <p>
        We may update this policy periodically to reflect changes in our practices or for legal
        reasons. When we do, we will update the date at the top of this page. Continued use of our
        site after a change constitutes your acceptance of the updated policy. We encourage you to
        review this page occasionally.
      </p>
    ),
  },
  {
    heading: "10. Contact",
    content: (
      <p>
        If you have questions or concerns about this privacy policy or how we handle your data,
        please email us at{" "}
        <a
          href="mailto:fenadaily@gmail.com"
          className="text-amber-300 transition-colors hover:text-amber-200"
        >
          fenadaily@gmail.com
        </a>
        .
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#111827_45%,#020617_100%)] text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 lg:px-8 lg:py-16">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/85 p-6 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Legal</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-3 text-xs text-zinc-500">Last updated: June 2025</p>

          <p className="mt-6 text-sm leading-relaxed text-zinc-300 sm:text-base">
            This Privacy Policy explains how Fena Daily (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
            &ldquo;us&rdquo;) collects, uses, and protects information when you visit our website at
            fenadaily.com or subscribe to our newsletter.
          </p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-300 sm:text-base">
            {sections.map(({ heading, content }) => (
              <section key={heading}>
                <h2 className="mb-3 text-base font-semibold text-white sm:text-lg">{heading}</h2>
                {content}
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
