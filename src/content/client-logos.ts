// Written by design/logos/build.py: do not edit by hand.
/**
 * Client logos in /public/logos/<project slug>.svg (one colour). `ratio`: the logo's width to height.
 * `size`: its optical size in the logo row against the shared rule (1 when left out). `name`: a client without a
 * case study here (the others take their name from their project).
 */
export const CLIENT_LOGOS: Record<string, { ratio: number; size?: number; name?: string }> = {
  "aaoms": { ratio: 1.109, name: "AAOMS" },
  "actigraph": { ratio: 2.62, name: "ActiGraph" },
  "afthab-tours": { ratio: 6.123 },
  "altruity": { ratio: 4.321, name: "Altruity" },
  "bigtapp": { ratio: 1.475 },
  "cabot-solutions": { ratio: 2.568 },
  "carlton-noble": { ratio: 11.281 },
  "corechair": { ratio: 5.318, name: "CoreChair" },
  "dubai-police": { ratio: 2.876, name: "Dubai Police" },
  "engel-volkers": { ratio: 9.132 },
  "graymatter-analytics": { ratio: 5.126, name: "GrayMatter Analytics" },
  "green-circle-life": { ratio: 1.374, name: "Green Circle Life" },
  "instachart": { ratio: 4.539, name: "instachart" },
  "kinduct": { ratio: 5.166, name: "Kinduct" },
  "meetingful": { ratio: 4.584 },
  "microchip": { ratio: 4.305, name: "Microchip" },
  "my-healing-mate": { ratio: 2.698, name: "My Healing Mate" },
  "nephtech": { ratio: 4.468, name: "NephTech" },
  "norsecom": { ratio: 7.25 },
  "nova-scotia-power": { ratio: 4.2, name: "Nova Scotia Power" },
  "oh-my-glam": { ratio: 2.285 },
  "rohde-schwarz": { ratio: 3.865, size: 1.2 },
  "rush": { ratio: 3.375, name: "RUSH" },
  "rxlive": { ratio: 2.238 },
  "sandlogic": { ratio: 3.592, size: 1.1 },
  "sap": { ratio: 2.02, name: "SAP" },
  "sifio-health": { ratio: 3.606, size: 0.8 },
  "surgo-health": { ratio: 2.129 },
  "the-sieve": { ratio: 2.411, name: "The Sieve" },
};
