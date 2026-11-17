import { Colors } from "@/constants";
import {
  Control,
  Controller,
  FieldError,
  FieldValues,
  Path,
} from "react-hook-form";
import { TextType, ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { ThemedInput, ThemedInputProps } from "../ThemedInput";

export type ControlledThemedInputProps<T extends FieldValues> = Omit<
  ThemedInputProps,
  "value" | "onChangeText"
> & {
  control: Control<T>;
  name: Path<T>;
  required?: boolean;
  error?: FieldError;
};

export function ControlledThemedInput<T extends FieldValues>({
  control,
  name,
  required,
  label,
  error,
  ...inputProps
}: ControlledThemedInputProps<T>) {
  return (
    <ThemedView>
      <Controller
        control={control}
        name={name}
        rules={{ required }}
        render={({ field: { value, onChange } }) => (
          <ThemedInput
            label={required ? `${label} *` : label}
            labelColor={error ? Colors.red : undefined}
            value={value ?? ""}
            onChangeText={onChange}
            {...inputProps}
          />
        )}
      />
      {error && (
        <ThemedText type={TextType.Caption} color={Colors.red} style={{}}>
          Required Field
        </ThemedText>
      )}
    </ThemedView>
  );
}
