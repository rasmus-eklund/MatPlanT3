import "~/test/setup-frontend";

import React from "react";
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { Unit } from "~/types";

const toast = {
  error: mock(() => undefined),
  success: mock(() => undefined),
};

void mock.module("sonner", () => ({ toast }));

void mock.module("usehooks-ts", () => ({
  useDebounceCallback: <T extends (...args: never[]) => unknown>(
    callback: T,
  ) => {
    const callbackRef = React.useRef(callback);
    callbackRef.current = callback;

    return React.useMemo(() => {
      let timeout: ReturnType<typeof setTimeout> | null = null;
      const debounced = (...args: Parameters<T>) => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
          timeout = null;
          void callbackRef.current(...args);
        }, 1);
      };
      debounced.cancel = () => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = null;
      };
      debounced.flush = () => undefined;
      debounced.isPending = () => timeout !== null;
      return debounced;
    }, []);
  },
}));

void mock.module("~/components/common/Select", () => ({
  default: ({
    disabled,
    onValueChange,
    options,
    value,
  }: {
    disabled?: boolean;
    onValueChange?: (value: Unit) => void;
    options: { key: string; value: Unit; label: React.ReactNode }[];
    value?: Unit;
  }) => (
    <select
      aria-label="Enhet"
      disabled={disabled}
      value={value}
      onChange={(event) => onValueChange?.(event.currentTarget.value as Unit)}
    >
      {options.map((option) => (
        <option key={option.key} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

const { default: SearchModal } = await import("./SearchModal");
const { cleanup, fireEvent, render, screen, waitFor } =
  await import("@testing-library/react");
const originalConsoleLog = globalThis.console.log;
const originalConsoleError = globalThis.console.error;

type Item = { id: string; name: string; quantity: number; unit: Unit };
type SearchArgs = Parameters<
  React.ComponentProps<typeof SearchModal>["onSearch"]
>[0];

const milk: Item = { id: "milk-id", name: "Milk", quantity: 1, unit: "st" };
const flour: Item = { id: "flour-id", name: "Flour", quantity: 1, unit: "kg" };

const renderModal = (
  props: Partial<React.ComponentProps<typeof SearchModal>> = {},
) => {
  const onSearch = mock(async (): Promise<Item[]> => [milk]);
  const onSubmit = mock(async () => undefined);

  render(
    <SearchModal
      title="vara"
      onSearch={onSearch}
      onSubmit={onSubmit}
      {...props}
    />,
  );

  return { onSearch, onSubmit };
};

const clickTrigger = () => {
  const trigger =
    screen.queryByRole("button", { name: /lägg till vara/i }) ??
    screen.getAllByRole("button")[0]!;
  fireEvent.click(trigger);
};

const searchInput = () => screen.getByPlaceholderText(/sök/i);
const quantityInput = () =>
  screen.getByRole<HTMLInputElement>("textbox", { name: /kvantitet/i });
const quantityError = () => screen.getByText("Måste vara större än 0");
const unitSelect = () => screen.getByLabelText<HTMLSelectElement>("Enhet");
const saveButton = () => screen.getByRole("button", { name: /spara/i });
const closeDialog = () =>
  fireEvent.click(screen.getByRole("button", { name: /close/i }));

const waitForSearch = async (
  onSearch: ReturnType<typeof mock<(_args: SearchArgs) => Promise<Item[]>>>,
) => {
  await waitFor(() => expect(onSearch).toHaveBeenCalledTimes(1), {
    timeout: 1000,
  });
};

describe("SearchModal", () => {
  afterEach(() => {
    globalThis.console.log = originalConsoleLog;
    globalThis.console.error = originalConsoleError;
    cleanup();
  });

  beforeEach(() => {
    globalThis.console.log = mock(() => undefined);
    globalThis.console.error = mock(() => undefined);
    toast.error.mockClear();
    toast.success.mockClear();
  });

  test("opens in add mode and disables save until an item is selected", () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: /lägg till vara/i }));

    expect(searchInput()).toBeTruthy();
    expect(saveButton().hasAttribute("disabled")).toBe(true);
    expect(quantityInput().disabled).toBe(true);
    expect(unitSelect().disabled).toBe(true);
  });

  test("debounces search, shows loading during fetch, submits selected item with edited quantity and unit", async () => {
    let resolveSearch: (items: Item[]) => void = () => undefined;
    const onSearch = mock(
      async () =>
        new Promise<Item[]>((resolve) => {
          resolveSearch = resolve;
        }),
    );
    const onSubmit = mock(async () => undefined);

    renderModal({ onSearch, onSubmit });
    clickTrigger();

    fireEvent.change(searchInput(), { target: { value: "mi" } });

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.queryByRole("status", { name: /loading/i })).toBeNull();

    await waitForSearch(onSearch);
    expect(screen.getByRole("status", { name: /loading/i })).toBeTruthy();

    resolveSearch([milk]);

    fireEvent.click(await screen.findByText("Milk"));
    fireEvent.change(quantityInput(), { target: { value: "3" } });
    fireEvent.change(unitSelect(), { target: { value: "dl" } });
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        ...milk,
        quantity: 3,
        unit: "dl",
      }),
    );
  });

  test("allows clearing the quantity input before typing a decimal value", async () => {
    const onSubmit = mock(async () => undefined);

    renderModal({ item: milk, onSubmit });
    clickTrigger();

    fireEvent.change(quantityInput(), { target: { value: "" } });

    expect(quantityInput().value).toBe("");
    expect(quantityError()).toBeTruthy();
    expect(saveButton().hasAttribute("disabled")).toBe(true);

    fireEvent.change(quantityInput(), { target: { value: "0.5" } });
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        ...milk,
        quantity: 0.5,
      }),
    );
  });

  test("accepts comma decimals and submits them as numbers", async () => {
    const onSubmit = mock(async () => undefined);

    renderModal({ item: milk, onSubmit });
    clickTrigger();

    fireEvent.change(quantityInput(), { target: { value: "0,5" } });
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        ...milk,
        quantity: 0.5,
      }),
    );
  });

  test("auto-selects exact search matches case-insensitively and clears the search input", async () => {
    const onSearch = mock(async () => [milk]);
    const onSubmit = mock(async () => undefined);

    renderModal({ onSearch, onSubmit });
    clickTrigger();

    fireEvent.change(searchInput(), { target: { value: "  milk  " } });

    await waitFor(() => expect(searchInput().getAttribute("value")).toBe(""));
    expect(screen.getByText("Milk")).toBeTruthy();
    expect(saveButton().hasAttribute("disabled")).toBe(false);
  });

  test("seeds unmatched link selections from defaultValue while still allowing edits", async () => {
    const onSearch = mock(async () => [flour]);
    const onSubmit = mock(async () => undefined);

    renderModal({
      addIcon: true,
      defaultValue: { quantity: 2, unit: "dl" },
      onSearch,
      onSubmit,
    });
    clickTrigger();

    fireEvent.change(searchInput(), { target: { value: "flo" } });
    fireEvent.click(await screen.findByText("Flour"));

    expect(quantityInput().value).toBe("2");
    expect(unitSelect().value).toBe("dl");

    fireEvent.change(quantityInput(), { target: { value: "5" } });
    fireEvent.change(unitSelect(), { target: { value: "kg" } });
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        ...flour,
        quantity: 5,
        unit: "kg",
      }),
    );
  });

  test("edits an existing item and preserves quantity and unit when selecting a different result", async () => {
    const onSearch = mock(async () => [flour]);
    const onSubmit = mock(async () => undefined);

    renderModal({
      item: { ...milk, quantity: 4, unit: "msk" },
      onSearch,
      onSubmit,
    });
    clickTrigger();

    expect(quantityInput().value).toBe("4");
    expect(unitSelect().value).toBe("msk");

    fireEvent.change(searchInput(), { target: { value: "flo" } });
    fireEvent.click(await screen.findByText("Flour"));
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        ...flour,
        quantity: 4,
        unit: "msk",
      }),
    );
  });

  test("preserves quantity edits made while an exact replacement search is in flight", async () => {
    let resolveSearch: (items: Item[]) => void = () => undefined;
    const onSearch = mock(
      async () =>
        new Promise<Item[]>((resolve) => {
          resolveSearch = resolve;
        }),
    );
    const onSubmit = mock(async () => undefined);

    renderModal({
      item: { ...milk, quantity: 4, unit: "msk" },
      onSearch,
      onSubmit,
    });
    clickTrigger();

    fireEvent.change(searchInput(), { target: { value: "flour" } });
    await waitForSearch(onSearch);

    fireEvent.change(quantityInput(), { target: { value: "7" } });
    resolveSearch([flour]);

    await waitFor(() => expect(searchInput().getAttribute("value")).toBe(""));
    expect(quantityInput().value).toBe("7");

    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        ...flour,
        quantity: 7,
        unit: "msk",
      }),
    );
  });

  test("disables save while a replacement search is waiting for debounce", () => {
    const onSearch = mock(async () => [flour]);
    const onSubmit = mock(async () => undefined);

    renderModal({
      item: { ...milk, quantity: 4, unit: "msk" },
      onSearch,
      onSubmit,
    });
    clickTrigger();

    fireEvent.change(searchInput(), { target: { value: "flo" } });

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.queryByRole("status", { name: /loading/i })).toBeNull();
    expect(saveButton().hasAttribute("disabled")).toBe(true);

    fireEvent.click(saveButton());

    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("disables unit editing in recipe mode and submits the selected recipe quantity", async () => {
    const recipe = {
      id: "recipe-id",
      name: "Soup",
      quantity: 2,
      unit: "port" as Unit,
    };
    const onSearch = mock(async () => [recipe]);
    const onSubmit = mock(async () => undefined);

    renderModal({
      title: "recept",
      onSearch,
      onSubmit,
    });

    fireEvent.click(screen.getByRole("button", { name: /lägg till recept/i }));
    fireEvent.change(searchInput(), { target: { value: "sou" } });
    fireEvent.click(await screen.findByText("Soup"));

    expect(unitSelect().disabled).toBe(true);
    fireEvent.change(quantityInput(), { target: { value: "6" } });
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        ...recipe,
        quantity: 6,
      }),
    );
  });

  test("clears add-mode state on close", async () => {
    renderModal({ onSearch: mock(async () => [milk]) });
    clickTrigger();

    fireEvent.change(searchInput(), { target: { value: "mi" } });
    fireEvent.click(await screen.findByText("Milk"));
    expect(screen.getByText("Milk")).toBeTruthy();

    closeDialog();
    clickTrigger();

    expect(searchInput().getAttribute("value")).toBe("");
    expect(screen.queryByText("Milk")).toBeNull();
    expect(saveButton().hasAttribute("disabled")).toBe(true);
  });

  test("cancels pending debounced searches when search text is cleared", async () => {
    const onSearch = mock(async () => [milk]);

    renderModal({ onSearch });
    clickTrigger();

    fireEvent.change(searchInput(), { target: { value: "mi" } });
    fireEvent.change(searchInput(), { target: { value: "" } });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(onSearch).not.toHaveBeenCalled();
  });

  test("cancels pending debounced searches when the dialog closes", async () => {
    const onSearch = mock(async () => [milk]);

    renderModal({ onSearch });
    clickTrigger();

    fireEvent.change(searchInput(), { target: { value: "mi" } });
    closeDialog();

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(onSearch).not.toHaveBeenCalled();
  });

  test("shows inline validation and does not submit for invalid quantities", async () => {
    const onSubmit = mock(async () => undefined);

    renderModal({ item: milk, onSubmit });
    clickTrigger();

    for (const value of ["", "abc", "0", "-1"]) {
      fireEvent.change(quantityInput(), { target: { value } });

      expect(quantityError()).toBeTruthy();
      expect(saveButton().hasAttribute("disabled")).toBe(true);
      fireEvent.click(saveButton());
      expect(onSubmit).not.toHaveBeenCalled();
    }
    expect(toast.error).not.toHaveBeenCalled();
  });

  test("shows an error toast when search fails", async () => {
    const onSearch = mock(async () => {
      throw new Error("search failed");
    });

    renderModal({ onSearch });
    clickTrigger();

    fireEvent.change(searchInput(), { target: { value: "mi" } });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Något gick fel..."),
    );
    expect(screen.queryByRole("status", { name: /loading/i })).toBeNull();
  });

  test("shows an error toast when submit fails", async () => {
    const onSubmit = mock(async () => {
      throw new Error("submit failed");
    });

    renderModal({ item: milk, onSubmit });
    clickTrigger();
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Något gick fel..."),
    );
  });
});
