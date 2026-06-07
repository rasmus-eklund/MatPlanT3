import {
  cleanupFrontendGlobals,
  installFrontendGlobals,
} from "~/test/setup-frontend";

import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import DecimalInput, { parseDecimalDraft } from "./DecimalInput";

const { cleanup, fireEvent, render, screen } =
  await import("@testing-library/react");

const renderDecimalInput = ({
  disabled = false,
  fallbackValue,
  min,
  value,
}: {
  disabled?: boolean;
  fallbackValue?: number;
  min?: number;
  value?: number | undefined;
} = {}) => {
  const onValidValueChange = mock(() => undefined);
  const onValidityChange = mock(() => undefined);

  render(
    <DecimalInput
      ariaLabel="Kvantitet"
      disabled={disabled}
      errorMessage="Måste vara större än 0"
      fallbackValue={fallbackValue}
      min={min}
      onValidityChange={onValidityChange}
      onValidValueChange={onValidValueChange}
      value={value ?? 1}
    />,
  );

  return { onValidityChange, onValidValueChange };
};

const input = () =>
  screen.getByRole<HTMLInputElement>("textbox", { name: /kvantitet/i });
const errorText = () => screen.getByText("Måste vara större än 0");

describe("parseDecimalDraft", () => {
  test("accepts positive integer, dot decimal, and comma decimal drafts", () => {
    expect(parseDecimalDraft("2")).toBe(2);
    expect(parseDecimalDraft("0.5")).toBe(0.5);
    expect(parseDecimalDraft("0,5")).toBe(0.5);
    expect(parseDecimalDraft(" 10,25 ")).toBe(10.25);
  });

  test("rejects empty, partial, non-numeric, and non-positive drafts", () => {
    for (const value of ["", ".", ",", "0.", "0,", "abc", "1/2", "0", "-1"]) {
      expect(parseDecimalDraft(value)).toBeNull();
    }
  });

  test("respects a custom minimum", () => {
    expect(parseDecimalDraft("2", 2)).toBeNull();
    expect(parseDecimalDraft("2.1", 2)).toBe(2.1);
  });
});

describe("DecimalInput", () => {
  beforeEach(() => {
    installFrontendGlobals();
  });

  afterEach(() => {
    cleanup();
    cleanupFrontendGlobals();
  });

  test("renders the numeric value as editable text with decimal keyboard hint", () => {
    renderDecimalInput({ value: 2 });

    expect(input().value).toBe("2");
    expect(input().type).toBe("text");
    expect(input().inputMode).toBe("decimal");
    expect(errorText().getAttribute("aria-hidden")).toBe("true");
    expect(errorText().className).toContain("invisible");
  });

  test("uses fallback value when no value is provided", () => {
    const onValidValueChange = mock(() => undefined);

    render(
      <DecimalInput
        ariaLabel="Kvantitet"
        errorMessage="Måste vara större än 0"
        fallbackValue={3}
        onValidValueChange={onValidValueChange}
        value={undefined}
      />,
    );

    expect(input().value).toBe("3");
  });

  test("emits valid dot and comma decimals as numbers", () => {
    const { onValidValueChange, onValidityChange } = renderDecimalInput();

    fireEvent.change(input(), { target: { value: "0.5" } });
    expect(onValidValueChange).toHaveBeenCalledWith(0.5);
    expect(onValidityChange).toHaveBeenLastCalledWith(true);

    fireEvent.change(input(), { target: { value: "0,75" } });
    expect(onValidValueChange).toHaveBeenCalledWith(0.75);
    expect(onValidityChange).toHaveBeenLastCalledWith(true);
  });

  test("keeps invalid drafts visible, shows error, and does not emit a number", () => {
    const { onValidValueChange, onValidityChange } = renderDecimalInput();
    onValidValueChange.mockClear();
    onValidityChange.mockClear();

    fireEvent.change(input(), { target: { value: "" } });

    expect(input().value).toBe("");
    expect(onValidValueChange).not.toHaveBeenCalled();
    expect(onValidityChange).toHaveBeenCalledWith(false);
    expect(errorText().getAttribute("aria-hidden")).toBe("false");
    expect(errorText().className).toContain("visible");
  });

  test("disables the input and hides validation feedback while disabled", () => {
    const { onValidityChange } = renderDecimalInput({
      disabled: true,
      value: undefined,
    });

    expect(input().disabled).toBe(true);
    expect(errorText().getAttribute("aria-hidden")).toBe("true");
    expect(errorText().className).toContain("invisible");
    expect(onValidityChange).toHaveBeenLastCalledWith(true);
  });
});
