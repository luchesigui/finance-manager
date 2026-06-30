import React from "react";
import clsx from "clsx";
import styles from "./Input.module.css";

/* ----- Text / Number Input ----- */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  prefix?: string;
  error?: string;
}

export function Input({ label, prefix, error, className, id, ...props }: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      {prefix ? (
        <div className={styles.prefixWrapper}>
          <span className={styles.prefix}>{prefix}</span>
          <input
            id={inputId}
            className={clsx(
              styles.field,
              styles.withPrefix,
              { [styles.fieldError]: error },
              className,
            )}
            {...props}
          />
        </div>
      ) : (
        <input
          id={inputId}
          className={clsx(styles.field, { [styles.fieldError]: error }, className)}
          {...props}
        />
      )}
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}

/* ----- Select ----- */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function Select({ label, options, error, className, id, ...props }: SelectProps) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
      )}
      <div className={styles.selectWrapper}>
        <select
          id={selectId}
          className={clsx(styles.field, styles.select, { [styles.fieldError]: error }, className)}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className={styles.selectArrow} aria-hidden>
          ▾
        </span>
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}

/* ----- Textarea ----- */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const generatedId = React.useId();
  const textareaId = id ?? generatedId;
  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label} htmlFor={textareaId}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={clsx(styles.field, styles.textarea, className)}
        {...props}
      />
    </div>
  );
}

/* ----- Checkbox ----- */
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const inputId = id || `cb-${Math.random().toString(36).slice(2)}`;
  return (
    <div className={styles.checkRow}>
      <input type="checkbox" id={inputId} className={clsx(styles.checkbox, className)} {...props} />
      {label && (
        <label htmlFor={inputId} className={styles.checkLabel}>
          {label}
        </label>
      )}
    </div>
  );
}

/* ----- Radio ----- */
export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Radio({ label, className, id, ...props }: RadioProps) {
  const inputId = id || `radio-${Math.random().toString(36).slice(2)}`;
  return (
    <div className={styles.checkRow}>
      <input type="radio" id={inputId} className={clsx(styles.radio, className)} {...props} />
      {label && (
        <label htmlFor={inputId} className={styles.checkLabel}>
          {label}
        </label>
      )}
    </div>
  );
}

/* ----- Toggle ----- */
export interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Toggle({ label, className, id, ...props }: ToggleProps) {
  const inputId = id || `toggle-${Math.random().toString(36).slice(2)}`;
  return (
    <div className={styles.checkRow}>
      <label className={styles.toggleWrapper} htmlFor={inputId}>
        <input type="checkbox" id={inputId} className={className} {...props} />
        <span className={styles.toggleSlider} />
      </label>
      {label && (
        <label htmlFor={inputId} className={styles.checkLabel}>
          {label}
        </label>
      )}
    </div>
  );
}

/* ----- CapsuleRadio ----- */
export interface CapsuleRadioOption {
  value: string;
  label: string;
}

export interface CapsuleRadioProps {
  options: CapsuleRadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function CapsuleRadio({ options, value, onChange, label }: CapsuleRadioProps) {
  return (
    <div className={styles.wrapper} style={{ width: "fit-content" }}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.capsuleContainer}>
        {options.map((opt) => {
          const isActive = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(opt.value)}
              className={clsx(styles.capsuleButton, { [styles.capsuleButtonActive]: isActive })}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
