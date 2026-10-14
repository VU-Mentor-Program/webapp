// Industry connections shown on the homepage, rotating between the groups below.
// Logo files live in public/assets/images/logos/companies/ — white on a transparent background.
// To add a company: drop its white logo (svg or png) in that folder and append an entry to a group.
// Logos are sized automatically from their aspect ratio, so crop files tight to the artwork (no padding).

const LOGO_DIR = "/webapp/assets/images/logos/companies";

export interface Partner {
  name: string;
  logo: string;
}

export interface PartnerGroup {
  id: "speakers" | "tours";
  /** translation key in the "partners" namespace */
  headingKey: string;
  partners: Partner[];
}

export const partnerGroups: PartnerGroup[] = [
  {
    id: "speakers",
    headingKey: "speakers_heading",
    partners: [
      { name: "Databricks", logo: `${LOGO_DIR}/databricks.svg` },
      { name: "Meta", logo: `${LOGO_DIR}/meta.svg` },
      { name: "Disney Streaming", logo: `${LOGO_DIR}/disney-streaming.png` },
      { name: "Apple", logo: `${LOGO_DIR}/apple.svg` },
    ],
  },
  {
    id: "tours",
    headingKey: "tours_heading",
    partners: [
      { name: "Equinix", logo: `${LOGO_DIR}/equinix.png` },
      { name: "Prosus", logo: `${LOGO_DIR}/prosus.png` },
      { name: "AI House Amsterdam", logo: `${LOGO_DIR}/aihouse.png` },
      { name: "JetBrains", logo: `${LOGO_DIR}/jetbrains.svg` },
    ],
  },
];
