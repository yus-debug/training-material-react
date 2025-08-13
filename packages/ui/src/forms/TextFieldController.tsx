import { Controller, type FieldValues, type FieldPath, type Control } from 'react-hook-form'
import { TextField, type TextFieldProps } from '@mui/material'
import type { ReactElement } from 'react'

interface TextFieldControllerProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'error' | 'helperText'> {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  helperText?: string
  required?: boolean
}

export function TextFieldController<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  helperText,
  required,
  ...textFieldProps
}: TextFieldControllerProps<TFieldValues>): ReactElement {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...textFieldProps}
          label={label}
          error={!!error}
          helperText={error?.message || helperText}
          required={required}
          fullWidth
        />
      )}
    />
  )
}
