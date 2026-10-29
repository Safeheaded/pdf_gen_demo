import { useFieldArray, useWatch, type Control, type UseFormReturn } from 'react-hook-form';
import { COMPANIES, getCompany } from '../companies/companies';
import { formatGrosz, parseGrosz, parseQuantity } from '../domain/money';
import { buildOfferNumber } from '../domain/offerNumber';
import { VAT_RATES } from '../domain/types';
import { vatLabel } from '../domain/totals';
import { newItem, type OfferFormValues } from '../offer/schema';
import { Card } from './Card';
import { CompanyLogo } from './CompanyLogo';
import { Field } from './Field';
import styles from './OfferForm.module.css';

type Props = { form: UseFormReturn<OfferFormValues> };

const RowNet = ({ control, index }: { control: Control<OfferFormValues>; index: number }) => {
  const [quantity, unitNet] = useWatch({
    control,
    name: [`items.${index}.quantity`, `items.${index}.unitNet`],
  });
  const qty = parseQuantity(quantity);
  const unit = parseGrosz(unitNet);
  return <output className={styles.rowNet}>{qty && unit !== null ? formatGrosz(Math.round(qty * unit)) : '—'}</output>;
};

export const OfferForm = ({ form }: Props) => {
  const { register, control, setValue, getValues, formState } = form;
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const companyId = useWatch({ control, name: 'companyId' });
  const company = getCompany(companyId);

  const companyField = register('companyId');

  return (
    <form className={styles.form} noValidate onSubmit={(event) => event.preventDefault()}>
      <Card title="Spółka" aside={<span className={styles.asideLabel}>Sprzedawca / Wystawca</span>}>
        <Field label="Wybierz spółkę z grupy">
          {(props) => (
            <select
              {...props}
              {...companyField}
              onChange={(event) => {
                void companyField.onChange(event);
                const next = getCompany(event.target.value);
                setValue(
                  'offerNumber',
                  buildOfferNumber(next.code, new Date(getValues('issueDate')), 1),
                  { shouldValidate: true },
                );
              }}
            >
              {COMPANIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.legalName}
                </option>
              ))}
            </select>
          )}
        </Field>
        <div className={styles.companyCard}>
          <div className={styles.logoTile}>
            <CompanyLogo company={company} size={26} />
          </div>
          <div className={styles.companyInfo}>
            <strong>{company.legalName}</strong>
            <span>
              NIP {company.nip} · KRS {company.krs}
            </span>
            <span>
              {company.address.street}, {company.address.postalCode} {company.address.city}
            </span>
            <span className={styles.muted}>
              {company.contact.email} · {company.contact.phone}
            </span>
          </div>
        </div>
      </Card>

      <Card title="Szczegóły oferty">
        <Field label="Numer oferty" error={errors.offerNumber?.message}>
          {(props) => <input className={styles.mono} {...props} {...register('offerNumber')} />}
        </Field>
        <div className={styles.grid2}>
          <Field label="Data wystawienia" error={errors.issueDate?.message}>
            {(props) => <input type="date" {...props} {...register('issueDate')} />}
          </Field>
          <Field label="Ważność oferty (dni)" error={errors.validityDays?.message}>
            {(props) => <input inputMode="numeric" {...props} {...register('validityDays')} />}
          </Field>
        </div>
      </Card>

      <Card title="Klient">
        <Field label="Nazwa firmy" error={errors.clientName?.message}>
          {(props) => <input {...props} {...register('clientName')} />}
        </Field>
        <div className={styles.grid2}>
          <Field label="NIP" error={errors.clientNip?.message}>
            {(props) => (
              <input className={styles.mono} inputMode="numeric" {...props} {...register('clientNip')} />
            )}
          </Field>
          <Field label="Osoba kontaktowa" error={errors.clientContact?.message}>
            {(props) => <input {...props} {...register('clientContact')} />}
          </Field>
        </div>
      </Card>

      <Card
        title="Pozycje oferty"
        aside={
          <button type="button" className={styles.add} onClick={() => append(newItem())}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Dodaj pozycję
          </button>
        }
      >
        {errors.items?.root?.message || errors.items?.message ? (
          <p role="alert" className={styles.error}>
            {errors.items?.root?.message ?? errors.items?.message}
          </p>
        ) : null}
        <ul className={styles.items}>
          {fields.map((field, index) => (
            <li key={field.id} className={styles.item}>
              <Field label="Nazwa usługi / produktu" error={errors.items?.[index]?.name?.message}>
                {(props) => <input {...props} {...register(`items.${index}.name`)} />}
              </Field>
              <div className={styles.itemNumbers}>
                <Field label="Ilość" error={errors.items?.[index]?.quantity?.message}>
                  {(props) => <input inputMode="decimal" {...props} {...register(`items.${index}.quantity`)} />}
                </Field>
                <Field label="Cena netto (zł)" error={errors.items?.[index]?.unitNet?.message}>
                  {(props) => <input inputMode="decimal" {...props} {...register(`items.${index}.unitNet`)} />}
                </Field>
                <Field label="VAT">
                  {(props) => (
                    <select {...props} {...register(`items.${index}.vatRate`)}>
                      {VAT_RATES.map((rate) => (
                        <option key={rate} value={rate}>
                          {vatLabel(rate)}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
                <div className={styles.netCell}>
                  <div>
                    <span className={styles.netLabel}>Wartość netto</span>
                    <RowNet control={control} index={index} />
                  </div>
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => remove(index)}
                    aria-label={`Usuń pozycję ${index + 1}`}
                  >
                    Usuń
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Uwagi i warunki współpracy">
        <Field label="Treść widoczna na ofercie">
          {(props) => <textarea rows={4} {...props} {...register('notes')} />}
        </Field>
      </Card>
    </form>
  );
};
