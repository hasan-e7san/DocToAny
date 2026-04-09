import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact DocToAny for support, feedback, or sales questions.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
