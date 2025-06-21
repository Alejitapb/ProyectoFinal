import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
    // Estado para almacenar el valor
    const [storedValue, setStoredValue] = useState(() => {
        try {
            // Obtener del localStorage local
            const item = window.localStorage.getItem(key);
            // Parsear el JSON almacenado o retornar el valor inicial
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // Si hay error, retornar valor inicial
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Función para actualizar el estado y localStorage
    const setValue = (value) => {
        try {
            // Permitir que el valor sea una función para tener la misma API que useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Guardar en el estado
            setStoredValue(valueToStore);

            // Guardar en localStorage
            if (valueToStore === undefined) {
                window.localStorage.removeItem(key);
            } else {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    // Función para eliminar del localStorage
    const removeValue = () => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    };

    // Efecto para escuchar cambios en otras pestañas/ventanas
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key && e.newValue !== null) {
                try {
                    setStoredValue(JSON.parse(e.newValue));
                } catch (error) {
                    console.error(`Error parsing localStorage key "${key}":`, error);
                }
            }
        };

        // Agregar event listener
        window.addEventListener('storage', handleStorageChange);

        // Cleanup
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key]);

    return [storedValue, setValue, removeValue];
};