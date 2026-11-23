import { fireEvent, render, screen } from '@testing-library/react-native';
import { CounterWidget } from './CounterWidget';
import {
  applyDiscountPercent,
  calculateCartSummary,
  calculateSubtotalCents,
  formatCurrency,
  type CartLineItem,
} from './priceUtils';

describe('priceUtils', () => {
  const sampleItems: readonly CartLineItem[] = [
    { id: '1', name: 'Expo Sticker Pack', unitPriceCents: 500, quantity: 2 },
    { id: '2', name: 'React Native Hoodie', unitPriceCents: 4500, quantity: 1 },
  ];

  it('calculates the subtotal in integer cents', () => {
    expect(calculateSubtotalCents(sampleItems)).toBe(5500);
    expect(calculateSubtotalCents([])).toBe(0);
  });

  it('applies percentage discounts and rejects out-of-range discounts', () => {
    expect(applyDiscountPercent(1000, 15)).toBe(850);
    expect(applyDiscountPercent(1000, 0)).toBe(1000);
    expect(() => applyDiscountPercent(1000, 120)).toThrow(RangeError);
  });

  it('computes subtotal, discount, tax, and total accurately', () => {
    const summary = calculateCartSummary(sampleItems, {
      discountPercent: 10,
      taxRatePercent: 8,
    });

    expect(summary).toEqual({
      subtotalCents: 5500,
      discountCents: 550,
      taxCents: 396,
      totalCents: 5346,
    });
  });

  it('formats positive and negative cents as USD currency', () => {
    expect(formatCurrency(5346)).toBe('$53.46');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(-250)).toBe('-$2.50');
  });
});

describe('CounterWidget', () => {
  it('renders the initial count and updates when incremented or decremented', async () => {
    const handleChange = jest.fn<void, [number]>();

    await render(<CounterWidget initialValue={2} step={1} min={0} max={5} onChange={handleChange} />);

    expect(screen.getByText('Count: 2')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Increment counter' }));
    expect(screen.getByText('Count: 3')).toBeTruthy();
    expect(handleChange).toHaveBeenLastCalledWith(3);

    await fireEvent.press(screen.getByRole('button', { name: 'Decrement counter' }));
    expect(screen.getByText('Count: 2')).toBeTruthy();
    expect(handleChange).toHaveBeenLastCalledWith(2);
  });

  it('enforces minimum and maximum boundaries', async () => {
    const handleChange = jest.fn<void, [number]>();

    await render(<CounterWidget initialValue={1} step={1} min={0} max={2} onChange={handleChange} />);

    const incrementButton = screen.getByRole('button', { name: 'Increment counter' });
    const decrementButton = screen.getByRole('button', { name: 'Decrement counter' });

    await fireEvent.press(incrementButton);
    await fireEvent.press(incrementButton);
    expect(screen.getByText('Count: 2')).toBeTruthy();
    expect(handleChange).toHaveBeenCalledTimes(1);

    await fireEvent.press(decrementButton);
    await fireEvent.press(decrementButton);
    await fireEvent.press(decrementButton);
    expect(screen.getByText('Count: 0')).toBeTruthy();
    expect(handleChange).toHaveBeenCalledTimes(3);
  });

  it('resets back to the initial value when Reset is pressed', async () => {
    await render(<CounterWidget initialValue={3} min={0} max={10} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Increment counter' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Increment counter' }));
    expect(screen.getByText('Count: 5')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Reset counter' }));
    expect(screen.getByText('Count: 3')).toBeTruthy();
  });
});
