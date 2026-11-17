import { Control, Controller, FieldPathValue, FieldValues, Path } from "react-hook-form";
import { ThemedPicker, ThemedPickerProps } from "../ThemedPicker";

export type ControlledThemedPickerProps<T extends FieldValues> = Omit<ThemedPickerProps, "value" | "onValueChange"> & {
  control: Control<T>;
  name: Path<T>;
  required?: boolean;
  /**
   * Format input value to string value that will be used on the option.
   * @param value Original field value
   * @returns Formatted string value
   */
  format?: (value: FieldPathValue<T, Path<T>>) => string;
  /**
   * Parse string option value to a another type
   * @param value string value from option
   * @returns Parsed value
   */
  parse?: (value: string) => FieldPathValue<T, Path<T>>;
};

export function ControlledThemedPicker<T extends FieldValues>({
  control,
  name,
  label,
  required,
  format,
  parse,
  ...inputProps
}: ControlledThemedPickerProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={{ required }}
      render={({ field: { value, onChange } }) => (
        <ThemedPicker
          label={required ? `${label} *` : label}
          value={(format ? format(value) : value) ?? ""}
          onValueChange={(v) => onChange(parse ? parse(v) : v)}
          {...inputProps}
        />
      )}
    />
  );
}
