import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your Steeldoor password.",
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
