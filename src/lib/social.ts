export type SocialLink = {
  name: string;
  href: string;
  icon: "x" | "instagram" | "facebook" | "linkedin";
};

export const SOCIAL_LINKS: SocialLink[] = [
  { name: "X",         href: "https://x.com/fenadaily",                              icon: "x" },
  { name: "Instagram", href: "https://www.instagram.com/fenadaily",                  icon: "instagram" },
  { name: "Facebook",  href: "https://www.facebook.com/profile.php?id=61590749965758", icon: "facebook" },
  // Add LinkedIn here when available:
  // { name: "LinkedIn", href: "https://www.linkedin.com/company/fenadaily", icon: "linkedin" },
];

export const SOCIAL_SAME_AS = SOCIAL_LINKS.map((l) => l.href);
