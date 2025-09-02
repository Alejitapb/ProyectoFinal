import { render, screen } from '@testing-library/react';
import { describe, test, expect } from '@jest/globals';

// Componente de prueba simple
const LoginForm = () => {
    return (
        <form>
            <input type="email" placeholder="Email" aria-label="Email" />
            <input type="password" placeholder="Contraseña" aria-label="Contraseña" />
            <button type="submit">Iniciar Sesión</button>
        </form>
    );
};

describe('LoginForm', () => {
    test('renders login form elements', () => {
        render(<LoginForm />);

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });
});