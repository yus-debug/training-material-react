import { Button, Container, Stack, Typography, Card, CardContent } from '@mui/material'
import { InventoryCard } from '@sample/ui'
import Link from 'next/link'

export default function HomePage() {
  return (
    <Container sx={{ py: 6 }}>
      <Stack spacing={4}>
        <Typography variant="h3" component="h1" textAlign="center">
          Inventory Management System
        </Typography>
        
        <Typography variant="h6" color="text.secondary" textAlign="center">
          A modern inventory management solution built with Next.js, MUI, and Material Design 3
        </Typography>

        <Card>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <Typography variant="h5">Features</Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
                <InventoryCard
                  title="Form Management"
                  subtitle="React Hook Form + Zod validation"
                  actions={<Button variant="outlined" size="small">Learn More</Button>}
                />
                <InventoryCard
                  title="State Management"
                  subtitle="Redux Toolkit with async thunks"
                  actions={<Button variant="outlined" size="small">Learn More</Button>}
                />
                <InventoryCard
                  title="Data Grid"
                  subtitle="MUI DataGrid with CRUD operations"
                  actions={<Button variant="outlined" size="small">Learn More</Button>}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button 
            variant="contained" 
            size="large"
            component={Link}
            href="/inventory"
          >
            Open Inventory
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            component={Link}
            href="/api/health"
          >
            API Health
          </Button>
        </Stack>
      </Stack>
    </Container>
  )
}


