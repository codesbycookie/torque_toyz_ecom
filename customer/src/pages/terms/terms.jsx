import { FileText } from "lucide-react";
import { LegalLayout } from "../privacy_policy/legalcomponents";

const SECTIONS = [
  {
    title: "General Information",
    text: "Torque Toyzz is an RC toys retail business that sells remote-controlled cars, drones, and accessories. By using our website or placing an order, you confirm that you are at least 18 years old or have parental/guardian consent.",
  },
  {
    title: "Products & Orders",
    text: "We strive to provide accurate product descriptions, images, and pricing. However, we do not guarantee that all details are always error-free. Orders are confirmed once payment is received. We reserve the right to cancel or refuse any order at our discretion.",
  },
  {
    title: "Pricing & Payment",
    text: "Cash on Delivery (COD) is available. For COD orders, you must pay:",
    list: [
      "The product price",
      "₹150 for cash handling charge to the courier person",
    ],
    after: "Prepaid payments are also accepted via UPI.",
  },
  {
    title: "Shipping & Delivery",
    list: [
      "All orders are shipped within a working days after confirmation.",
      "Delivery takes 1–3 working days depending on your location.",
      "Tracking details will be shared once the order is dispatched.",
      "We are not responsible for delays caused by courier companies.",
    ],
  },
  {
    title: "Returns & Refunds",
    list: [
      "Return available only for damaged or wrong items received.",
      "Raise a return request within 24 hours of delivery with photo/video proof.",
      "Return shipping is customer’s responsibility unless it’s our mistake.",
      "No returns for used, mishandled, or physically damaged items.",
    ],
  },
  {
    title: "Warranty & Repair",
    text: "We also provide repair services for any issues in the product. Customers should courier the product to our address, and we will repair it and courier it back.",
  },
  {
    title: "User Responsibilities",
    text: "You agree not to misuse our website or products. All content (images, text, logos) belongs to Torque Toyzz and cannot be used without permission.",
  },
  {
    title: "Limitation of Liability",
    text: "We are not liable for damages caused by product misuse, delivery delays, or website downtime.",
  },
  {
    title: "Changes to Terms",
    text: "Torque Toyzz reserves the right to update these Terms anytime. Updates will be posted on this page.",
  },
  {
    title: "Contact Us",
    text: "For any questions or support, contact us at:",
    contact: true,
  },
];

export default function Terms() {
  return (
    <LegalLayout
      icon={FileText}
      badge="Legal"
      title="Terms & Conditions"
      sections={SECTIONS}
      otherPage={{ to: "/privacy", label: "Privacy Policy" }}
    />
  );
}