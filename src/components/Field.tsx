import { useId, type ReactNode } from 'react';
import styles from './Field.module.css';

type Props = {
  label: string;
  error?: string;
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid': boolean }) => ReactNode;
};

export const Field = ({ label, error, children }: Props) => {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children({ id, 'aria-describedby': error ? errorId : undefined, 'aria-invalid': !!error })}
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
};
