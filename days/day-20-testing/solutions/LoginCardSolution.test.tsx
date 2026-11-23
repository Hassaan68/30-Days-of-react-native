import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  LoginCardSolution,
  validateLoginCredentials,
  type LoginCredentials,
} from './LoginCardSolution';

describe('validateLoginCredentials', () => {
  it('returns an error when email is invalid', () => {
    expect(validateLoginCredentials({ email: '', password: 'secret123' })).toBe(
      'Please enter a valid email address.',
    );
    expect(validateLoginCredentials({ email: 'not-an-email', password: 'secret123' })).toBe(
      'Please enter a valid email address.',
    );
  });

  it('returns an error when password is shorter than 6 characters', () => {
    expect(validateLoginCredentials({ email: 'dev@example.com', password: '123' })).toBe(
      'Password must be at least 6 characters.',
    );
  });

  it('returns null for valid credentials', () => {
    expect(validateLoginCredentials({ email: 'dev@example.com', password: 'secret123' })).toBeNull();
  });
});

describe('LoginCardSolution', () => {
  it('shows a validation alert and skips onLogin when inputs are invalid', () => {
    const mockLogin = jest.fn<Promise<void>, [LoginCredentials]>().mockResolvedValue(undefined);

    render(<LoginCardSolution onLogin={mockLogin} />);

    fireEvent.changeText(screen.getByLabelText('Email address'), 'invalid-email');
    fireEvent.changeText(screen.getByLabelText('Password'), 'password123');
    fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Please enter a valid email address.')).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('normalizes credentials, calls onLogin, and shows a welcome message on success', async () => {
    const mockLogin = jest.fn<Promise<void>, [LoginCredentials]>().mockResolvedValue(undefined);

    render(<LoginCardSolution onLogin={mockLogin} />);

    fireEvent.changeText(screen.getByLabelText('Email address'), '  Alex@Example.com  ');
    fireEvent.changeText(screen.getByLabelText('Password'), 'supersecret');
    fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'alex@example.com',
        password: 'supersecret',
      });
      expect(screen.getByText('Welcome back, alex@example.com!')).toBeTruthy();
    });

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('displays an error alert when onLogin rejects', async () => {
    const mockLogin = jest
      .fn<Promise<void>, [LoginCredentials]>()
      .mockRejectedValue(new Error('Invalid email or password.'));

    render(<LoginCardSolution onLogin={mockLogin} />);

    fireEvent.changeText(screen.getByLabelText('Email address'), 'alex@example.com');
    fireEvent.changeText(screen.getByLabelText('Password'), 'wrongpass');
    fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy();
      expect(screen.getByText('Invalid email or password.')).toBeTruthy();
    });

    expect(screen.queryByText(/Welcome back/)).toBeNull();
  });
});
