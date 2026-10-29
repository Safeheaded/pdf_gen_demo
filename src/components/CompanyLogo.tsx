import type { Company } from '../companies/companies';

type Props = { company: Company; size?: number };

export const CompanyLogo = ({ company, size = 28 }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    role="img"
    aria-label={`Logo ${company.name}`}
  >
    <polygon points={company.logo.points} fill={company.accentColor} />
  </svg>
);
