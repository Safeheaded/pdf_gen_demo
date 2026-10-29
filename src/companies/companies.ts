export type CompanyLogo = {
  /** SVG polygon points in a 40x40 viewBox. */
  points: string;
  wordmark: string;
};

export type Company = {
  id: string;
  /** Short code used in the offer number. */
  code: string;
  name: string;
  legalName: string;
  accentColor: string;
  logo: CompanyLogo;
  nip: string;
  krs: string;
  regon: string;
  address: { street: string; postalCode: string; city: string };
  contact: { email: string; phone: string; website: string; person: string };
  bank: { name: string; iban: string; swift: string };
  registryNote: string;
};

export const COMPANIES: readonly Company[] = [
  {
    id: 'nordica-group',
    code: 'NG',
    name: 'Nordica Group',
    legalName: 'Nordica Group sp. z o.o.',
    accentColor: '#1d4ed8',
    logo: { points: '20,2 38,20 20,38 2,20', wordmark: 'NORDICA GROUP' },
    nip: '5260001016',
    krs: '0000123401',
    regon: '140000101',
    address: { street: 'ul. Przykładowa 10', postalCode: '00-001', city: 'Warszawa' },
    contact: {
      email: 'oferty@nordica-group.example',
      phone: '+48 22 000 01 01',
      website: 'www.nordica-group.example',
      person: 'Dział Handlowy',
    },
    bank: { name: 'Demo Bank S.A.', iban: 'PL 61 1090 1014 0000 0712 1981 2874', swift: 'DEMOPLPW' },
    registryNote: 'Sąd Rejonowy dla m.st. Warszawy, XII Wydział Gospodarczy KRS',
  },
  {
    id: 'nordica-tech',
    code: 'NT',
    name: 'Nordica Tech',
    legalName: 'Nordica Tech sp. z o.o.',
    accentColor: '#0f766e',
    logo: { points: '20,2 36,11 36,29 20,38 4,29 4,11', wordmark: 'NORDICA TECH' },
    nip: '5260002027',
    krs: '0000123402',
    regon: '140000202',
    address: { street: 'ul. Technologiczna 5', postalCode: '30-002', city: 'Kraków' },
    contact: {
      email: 'oferty@nordica-tech.example',
      phone: '+48 12 000 02 02',
      website: 'www.nordica-tech.example',
      person: 'Zespół Sprzedaży IT',
    },
    bank: { name: 'Demo Bank S.A.', iban: 'PL 27 1140 2004 0000 3002 0135 5387', swift: 'DEMOPLPW' },
    registryNote: 'Sąd Rejonowy dla Krakowa-Śródmieścia, XI Wydział Gospodarczy KRS',
  },
  {
    id: 'nordica-consulting',
    code: 'NC',
    name: 'Nordica Consulting',
    legalName: 'Nordica Consulting sp. z o.o.',
    accentColor: '#9333ea',
    logo: { points: '20,3 38,36 2,36', wordmark: 'NORDICA CONSULTING' },
    nip: '5260003038',
    krs: '0000123403',
    regon: '140000303',
    address: { street: 'ul. Doradców 22', postalCode: '50-003', city: 'Wrocław' },
    contact: {
      email: 'oferty@nordica-consulting.example',
      phone: '+48 71 000 03 03',
      website: 'www.nordica-consulting.example',
      person: 'Biuro Doradztwa',
    },
    bank: { name: 'Demo Bank S.A.', iban: 'PL 83 1020 1026 0000 0422 7020 1111', swift: 'DEMOPLPW' },
    registryNote: 'Sąd Rejonowy dla Wrocławia-Fabrycznej, VI Wydział Gospodarczy KRS',
  },
  {
    id: 'nordica-logistics',
    code: 'NL',
    name: 'Nordica Logistics',
    legalName: 'Nordica Logistics sp. z o.o.',
    accentColor: '#c2410c',
    logo: { points: '3,6 37,6 37,34 3,34', wordmark: 'NORDICA LOGISTICS' },
    nip: '5260004049',
    krs: '0000123404',
    regon: '140000404',
    address: { street: 'ul. Magazynowa 1', postalCode: '80-004', city: 'Gdańsk' },
    contact: {
      email: 'oferty@nordica-logistics.example',
      phone: '+48 58 000 04 04',
      website: 'www.nordica-logistics.example',
      person: 'Dział Spedycji',
    },
    bank: { name: 'Demo Bank S.A.', iban: 'PL 10 1050 1214 1000 0090 3012 3456', swift: 'DEMOPLPW' },
    registryNote: 'Sąd Rejonowy Gdańsk-Północ, VII Wydział Gospodarczy KRS',
  },
];

export const getCompany = (id: string): Company => {
  const company = COMPANIES.find((c) => c.id === id);
  if (!company) throw new Error(`Unknown company: ${id}`);
  return company;
};
