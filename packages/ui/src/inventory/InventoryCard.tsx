import { Card, CardActions, CardContent, Stack, Typography } from '@mui/material'
import type { ReactElement, ReactNode } from 'react'

export interface InventoryCardProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function InventoryCard({ title, subtitle, actions }: InventoryCardProps): ReactElement {
  return (
    <Card variant="outlined" sx={{ borderColor: 'var(--md-sys-color-primary)' }}>
      <CardContent>
        <Stack spacing={0.5}>
          <Typography variant="h6">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>
      </CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </Card>
  )
}


