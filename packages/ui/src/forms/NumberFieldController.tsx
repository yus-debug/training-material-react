import { Controller, type FieldValues, type FieldPath, type Control } from 'react-hook-form'
import { TextField, type TextFieldProps } from '@mui/material'
import type { ReactElement } from 'react'

interface NumberFieldControllerProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'error' | 'helperText' | 'type'> {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  helperText?: string
  required?: boolean
}

export function NumberFieldController<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  helperText,
  required,
  ...textFieldProps
}: NumberFieldControllerProps<TFieldValues>): ReactElement {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...textFieldProps}
          type="number"
          label={label}
          error={!!error}
          helperText={error?.message || helperText}
          required={required}
          fullWidth
          onChange={(e) => field.onChange(Number(e.target.value))}
        />
      )}
    />
  )
}
