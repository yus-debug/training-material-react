import { render, screen } from '@testing-library/react'
import { InventoryCard } from './InventoryCard'

describe('InventoryCard', () => {
  it('renders title and optional subtitle', () => {
    render(<InventoryCard title="Widget" subtitle="Subtitle" />)
    expect(screen.getByText('Widget')).toBeDefined()
    expect(screen.getByText('Subtitle')).toBeDefined()
  })
})


