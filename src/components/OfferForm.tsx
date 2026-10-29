import { useFieldArray, useWatch, type Control, type UseFormReturn } from 'react-hook-form';
import { COMPANIES, getCompany } from '../companies/companies';
import { formatGrosz, parseGrosz, parseQuantity } from '../domain/money';
import { buildOfferNumber } from '../domain/offerNumber';
import { VAT_RATES } from '../domain/types';
import { vatLabel } from '../domain/totals';
import { newItem, type OfferFormValues } from '../offer/schema';
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
      <fieldset className={styles.section}>
        <legend>Spółka</legend>
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
          <CompanyLogo company={company} size={36} />
          <div>
            <strong>{company.legalName}</strong>
            <div className={styles.muted}>
              NIP {company.nip} · KRS {company.krs}
            </div>
            <div className={styles.muted}>
              {company.address.street}, {company.address.postalCode} {company.address.city}
            </div>
            <div className={styles.muted}>
              {company.contact.email} · {company.contact.phone}
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend>Oferta</legend>
        <div className={styles.grid3}>
          <Field label="Numer oferty" error={errors.offerNumber?.message}>
            {(props) => <input {...props} {...register('offerNumber')} />}
          </Field>
          <Field label="Data wystawienia" error={errors.issueDate?.message}>
            {(props) => <input type="date" {...props} {...register('issueDate')} />}
          </Field>
          <Field label="Ważność oferty (dni)" error={errors.validityDays?.message}>
            {(props) => <input inputMode="numeric" {...props} {...register('validityDays')} />}
          </Field>
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend>Klient</legend>
        <Field label="Nazwa firmy" error={errors.clientName?.message}>
          {(props) => <input {...props} {...register('clientName')} />}
        </Field>
        <div className={styles.grid2}>
          <Field label="NIP" error={errors.clientNip?.message}>
            {(props) => <input inputMode="numeric" {...props} {...register('clientNip')} />}
          </Field>
          <Field label="Osoba kontaktowa" error={errors.clientContact?.message}>
            {(props) => <input {...props} {...register('clientContact')} />}
          </Field>
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend>Pozycje oferty</legend>
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
            </li>
          ))}
        </ul>
        <button type="button" className={styles.add} onClick={() => append(newItem())}>
          + Dodaj pozycję
        </button>
      </fieldset>

      <fieldset className={styles.section}>
        <legend>Uwagi i warunki współpracy</legend>
        <Field label="Treść widoczna na ofercie">
          {(props) => <textarea rows={4} {...props} {...register('notes')} />}
        </Field>
      </fieldset>
    </form>
  );
};
