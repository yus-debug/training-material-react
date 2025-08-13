import { Controller, type FieldValues, type FieldPath, type Control } from 'react-hook-form'
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, type SelectProps } from '@mui/material'
import type { ReactElement } from 'react'

interface SelectFieldControllerProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<SelectProps, 'name' | 'value' | 'onChange' | 'error'> {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  helperText?: string
  required?: boolean
  options: Array<{ value: string | number; label: string }>
}

export function SelectFieldController<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  helperText,
  required,
  options,
  ...selectProps
}: SelectFieldControllerProps<TFieldValues>): ReactElement {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error}>
          {label && <InputLabel required={required}>{label}</InputLabel>}
          <Select
            {...field}
            {...selectProps}
            label={label}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(error?.message || helperText) && (
            <FormHelperText>{error?.message || helperText}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  )
}
