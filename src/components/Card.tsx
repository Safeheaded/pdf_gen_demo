import { useId, type ReactNode } from 'react';
import styles from './Card.module.css';

type Props = { title: string; aside?: ReactNode; children: ReactNode };

export const Card = ({ title, aside, children }: Props) => {
  const headingId = useId();
  return (
    <section className={styles.card} aria-labelledby={headingId}>
      <header className={styles.header}>
        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>
        {aside}
      </header>
      {children}
    </section>
  );
};
