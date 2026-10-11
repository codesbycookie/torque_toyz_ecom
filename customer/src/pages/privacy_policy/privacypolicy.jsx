import { ShieldCheck } from "lucide-react";
import { LegalLayout } from "./legalcomponents";

const SECTIONS = [
  {
    title: "Information We Collect",
    text: "We may collect your personal details (name, email, address, payment info) and non-personal data (device info, cookies) to improve our services.",
  },
  {
    title: "How We Use Your Information",
    text: "We use this data to process orders, deliver products, send updates, and improve your experience. You may opt out of promotional emails anytime.",
  },
  {
    title: "Data Security",
    text: "We use secure servers and encryption to protect your data. However, no platform is 100% secure.",
  },
  {
    title: "Sharing of Data",
    text: "We do not sell your personal data. We may share necessary information with shipping partners, payment gateways, or legal authorities if required.",
  },
  {
    title: "Cookies",
    text: "Our site uses cookies to enhance your experience. You can disable them in your browser settings.",
  },
  {
    title: "Third-Party Services",
    text: "We may link to third-party websites. We are not responsible for their privacy policies or practices.",
  },
  {
    title: "Children’s Privacy",
    text: "We do not knowingly collect data from children under 13 years old.",
  },
  {
    title: "Your Rights",
    text: "You can request access, updates, or deletion of your data anytime by contacting us.",
  },
  {
    title: "Changes to Policy",
    text: "We may update this Privacy Policy from time to time. Changes will be posted on this page.",
  },
  {
    title: "Contact Us",
    text: "For any privacy-related queries, contact us at:",
    contact: true,
  },
];

export default function Privacy() {
  return (
    <LegalLayout
      icon={ShieldCheck}
      badge="Your data"
      title="Privacy Policy"
      effectiveDate="06/09/2025"
      sections={SECTIONS}
      otherPage={{ to: "/terms", label: "Terms & Conditions" }}
    />
  );
}