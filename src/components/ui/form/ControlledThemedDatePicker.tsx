import { dateUtc } from "@/utils";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { ThemedDatePicker, ThemedDatePickerProps } from "../ThemedDatePicker";

export type ControlledThemedDatePickerProps<T extends FieldValues> = Omit<
  ThemedDatePickerProps,
  "initialDate" | "onDateChange"
> & {
  control: Control<T>;
  name: Path<T>;
  required?: boolean;
};

export function ControlledThemedDatePicker<T extends FieldValues>({
  control,
  name,
  label,
  required,
  ...inputProps
}: ControlledThemedDatePickerProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={{ required }}
      render={({ field: { value, onChange } }) => (
        <ThemedDatePicker
          label={required ? `${label} *` : label}
          initialDate={value ? dateUtc(value).toDate() : undefined}
          onDateChange={onChange}
          {...inputProps}
        />
      )}
    />
  );
}
