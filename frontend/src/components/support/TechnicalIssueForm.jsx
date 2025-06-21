import React, { useState } from 'react';
import {
    AlertTriangle,
    Smartphone,
    Monitor,
    Wifi,
    CreditCard,
    ShoppingCart,
    User,
    Bug,
    Send,
    ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const TechnicalIssueForm = ({ onBack, onSubmitSuccess }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        issueType: '',
        priority: 'medium',
        device: 'desktop',
        browser: '',
        description: '',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: '',
        errorMessage: '',
        userAgent: navigator.userAgent
    });
    const [submitting, setSubmitting] = useState(false);

    const issueTypes = [
        {
            id: 'login',
            label: 'Problemas de Inicio de Sesión',
            icon: User,
            description: 'No puedo acceder a mi cuenta'
        },
        {
            id: 'cart',
            label: 'Carrito de Compras',
            icon: ShoppingCart,
            description: 'Problemas para agregar/quitar productos'
        },
        {
            id: 'payment',
            label: 'Pagos y Transacciones',
            icon: CreditCard,
            description: 'Errores al procesar pagos'
        },
        {
            id: 'loading',
            label: 'Carga de Página',
            icon: Wifi,
            description: 'Páginas que no cargan correctamente'
        },
        {
            id: 'mobile',
            label: 'Problemas Móviles',
            icon: Smartphone,
            description: 'Específicos de teléfonos/tablets'
        },
        {
            id: 'display',
            label: 'Problemas de Visualización',
            icon: Monitor,
            description: 'Elementos que no se ven bien'
        },
        {
            id: 'bug',
            label: 'Error General',
            icon: Bug,
            description: 'Otros problemas técnicos'
        }
    ];

    const priorityLevels = [
        { value: 'low', label: 'Baja', description: 'No afecta el uso principal' },
        { value: 'medium', label: 'Media', description: 'Dificulta algunas funciones' },
        { value: 'high', label: 'Alta', description: 'Impide realizar pedidos' }
    ];

    const deviceTypes = [
        { value: 'desktop', label: 'Computadora de Escritorio' },
        { value: 'laptop', label: 'Laptop' },
        { value: 'mobile', label: 'Teléfono Móvil' },
        { value: 'tablet', label: 'Tablet' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.issueType || !formData.description) {
            toast.error('Por favor completa todos los campos requeridos');
            return;
        }

        setSubmitting(true);

        try {
            const issueTypeLabel = issueTypes.find(type => type.id === formData.issueType)?.label || 'Problema Técnico';

            const ticketData = {
                subject: `[TÉCNICO] ${issueTypeLabel}`,
                description: `TIPO DE PROBLEMA: ${issueTypeLabel}

DESCRIPCIÓN:
${formData.description}

PASOS PARA REPRODUCIR:
${formData.stepsToReproduce || 'No especificado'}

COMPORTAMIENTO ESPERADO:
${formData.expectedBehavior || 'No especificado'}

COMPORTAMIENTO ACTUAL:
${formData.actualBehavior || 'No especificado'}

MENSAJE DE ERROR:
${formData.errorMessage || 'Ninguno'}

INFORMACIÓN TÉCNICA:
- Dispositivo: ${formData.device}
- Navegador: ${formData.browser || 'No especificado'}
- User Agent: ${formData.userAgent}`,
                category: 'technical',
                priority: formData.priority
            };

            const response = await api.post('/support/tickets', ticketData);

            toast.success('Reporte técnico enviado correctamente');

            if (onSubmitSuccess) {
                onSubmitSuccess(response);
            }

            // Reset form
            setFormData({
                issueType: '',
                priority: 'medium',
                device: 'desktop',
                browser: '',
                description: '',
                stepsToReproduce: '',
                expectedBehavior: '',
                actualBehavior: '',
                errorMessage: '',
                userAgent: navigator.userAgent
            });

        } catch (error) {
            toast.error('Error al enviar el reporte técnico');
            console.error('Error submitting technical issue:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center mb-6">
                <button
                    onClick={onBack}
                    className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
                        Reportar Problema Técnico
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Ayúdanos a resolver tu problema proporcionando información detallada
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Issue Type Selection */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        ¿Qué tipo de problema estás experimentando?
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {issueTypes.map((type) => (
                            <label
                                key={type.id}
                                className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    formData.issueType === type.id
                                        ? 'border-primary-orange bg-primary-orange bg-opacity-5'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="issueType"
                                    value={type.id}
                                    checked={formData.issueType === type.id}
                                    onChange={handleInputChange}
                                    className="sr-only"
                                />
                                <type.icon className={`w-6 h-6 mr-3 ${
                                    formData.issueType === type.id ? 'text-primary-orange' : 'text-gray-400'
                                }`} />
                                <div>
                                    <div className="font-medium text-gray-800">{type.label}</div>
                                    <div className="text-sm text-gray-500">{type.description}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Priority and Device Info */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Priority */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Prioridad del Problema
                        </h3>

                        <div className="space-y-3">
                            {priorityLevels.map((priority) => (
                                <label
                                    key={priority.value}
                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                                        formData.priority === priority.value
                                            ? 'border-primary-orange bg-primary-orange bg-opacity-5'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="priority"
                                        value={priority.value}
                                        checked={formData.priority === priority.value}
                                        onChange={handleInputChange}
                                        className="mr-3"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-800">{priority.label}</div>
                                        <div className="text-sm text-gray-500">{priority.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Device and Browser Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Información del Dispositivo
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Dispositivo *
                                </label>
                                <select
                                    name="device"
                                    value={formData.device}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                                    required
                                >
                                    {deviceTypes.map((device) => (
                                        <option key={device.value} value={device.value}>
                                            {device.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Navegador (Opcional)
                                </label>
                                <input
                                    type="text"
                                    name="browser"
                                    value={formData.browser}
                                    onChange={handleInputChange}
                                    placeholder="ej: Chrome, Firefox, Safari..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Problem Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Detalles del Problema
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción del Problema *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe detalladamente el problema que estás experimentando..."
                                rows="4"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-orange focus:border-transparent resize-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pasos para Reproducir el Problema
                            </label>
                            <textarea
                                name="stepsToReproduce"
                                value={formData.stepsToReproduce}
                                onChange={handleInputChange}
                                placeholder="1. Primero hice esto...&#10;2. Luego hice esto...&#10;3. Entonces ocurrió..."
                                rows="3"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-orange focus:border-transparent resize-none"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ¿Qué esperabas que pasara?
                                </label>
                                <textarea
                                    name="expectedBehavior"
                                    value={formData.expectedBehavior}
                                    onChange={handleInputChange}
                                    placeholder="Describe el comportamiento esperado..."
                                    rows="3"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-orange focus:border-transparent resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ¿Qué pasó en realidad?
                                </label>
                                <textarea
                                    name="actualBehavior"
                                    value={formData.actualBehavior}
                                    onChange={handleInputChange}
                                    placeholder="Describe lo que realmente ocurrió..."
                                    rows="3"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-orange focus:border-transparent resize-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mensaje de Error (si aplica)
                            </label>
                            <textarea
                                name="errorMessage"
                                value={formData.errorMessage}
                                onChange={handleInputChange}
                                placeholder="Copia aquí cualquier mensaje de error que hayas visto..."
                                rows="2"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-orange focus:border-transparent resize-none font-mono text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={submitting || !formData.issueType || !formData.description}
                        className="bg-primary-orange text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {submitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Enviando Reporte...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5 mr-2" />
                                Enviar Reporte Técnico
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Help Text */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-2">
                            Consejos para un mejor reporte
                        </h4>
                        <ul className="text-blue-700 text-sm space-y-1">
                            <li>• Sé lo más específico posible en la descripción</li>
                            <li>• Incluye capturas de pantalla si es posible (puedes enviarlas por WhatsApp)</li>
                            <li>• Menciona si el problema ocurre siempre o solo a veces</li>
                            <li>• Indica si has intentado alguna solución</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TechnicalIssueForm;