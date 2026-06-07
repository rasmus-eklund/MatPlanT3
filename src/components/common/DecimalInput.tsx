"use client";
import { useEffect, useId, useState } from "react";
import { Input } from "~/components/ui/input";

type Props = {
  ariaLabel: string;
  disabled?: boolean;
  errorMessage: string;
  fallbackValue?: number;
  min?: number;
  onValidityChange?: (isValid: boolean) => void;
  onValidValueChange: (value: number) => void;
  value: number | undefined;
};

const formatDraft = (value: number | undefined, fallbackValue: number) =>
  String(value ?? fallbackValue);

export const parseDecimalDraft = (value: string, min = 0) => {
  const trimmed = value.trim();
  const normalized = trimmed.replace(",", ".");
  const isPartialDecimal =
    trimmed.endsWith(".") || trimmed.endsWith(",") || trimmed === "";
  const decimalPattern = /^(?:\d+|\d*[.,]\d+)$/;

  if (isPartialDecimal || !decimalPattern.test(trimmed)) {
    return null;
  }

  const number = Number(normalized);

  if (!Number.isFinite(number) || number <= min) {
    return null;
  }

  return number;
};

const DecimalInput = ({
  ariaLabel,
  disabled = false,
  errorMessage,
  fallbackValue = 1,
  min = 0,
  onValidityChange,
  onValidValueChange,
  value,
}: Props) => {
  const errorId = useId();
  const [draft, setDraft] = useState(formatDraft(value, fallbackValue));
  const parsedValue = parseDecimalDraft(draft, min);
  const showError = !disabled && parsedValue === null;

  useEffect(() => {
    onValidityChange?.(!showError);
  }, [onValidityChange, showError]);

  const handleChange = (nextDraft: string) => {
    setDraft(nextDraft);
    const nextValue = parseDecimalDraft(nextDraft, min);
    onValidityChange?.(nextValue !== null);

    if (nextValue !== null) {
      onValidValueChange(nextValue);
    }
  };

  return (
    <div className="w-full">
      <Input
        aria-label={ariaLabel}
        aria-describedby={showError ? errorId : undefined}
        aria-invalid={showError}
        disabled={disabled}
        inputMode="decimal"
        type="text"
        value={draft}
        onChange={({ target: { value } }) => handleChange(value)}
      />
      <p
        id={errorId}
        aria-hidden={!showError}
        className={`text-destructive mt-1 min-h-5 text-sm font-medium ${
          showError ? "visible" : "invisible"
        }`}
      >
        {errorMessage}
      </p>
    </div>
  );
};

export default DecimalInput;
