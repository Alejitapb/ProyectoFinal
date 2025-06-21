import React, { useState } from 'react';
import {
    HelpCircle,
    MessageCircle,
    Phone,
    Mail,
    Clock,
    CheckCircle,
    AlertCircle,
    FileText,
    Search
} from 'lucide-react';
import Container from '../components/common/Container';
import HelpCenter from '../components/support/HelpCenter';
import SupportTicket from '../components/support/SupportTicket';
import TechnicalIssueForm from '../components/support/TechnicalIssueForm';
import ChatSupport from '../components/support/ChatSupport';

const Support = () => {
    const [activeSection, setActiveSection] = useState('help');

    const supportOptions = [
        {
            id: 'help',
            title: 'Centro de Ayuda',
            description: 'Encuentra respuestas a preguntas frecuentes',
            icon: HelpCircle,
            color: 'text-yellow-600'
        },
        {
            id: 'ticket',
            title: 'Crear Ticket',
            description: 'Reporta un problema específico',
            icon: FileText,
            color: 'text-orange-600'
        },
        {
            id: 'technical',
            title: 'Problema Técnico',
            description: 'Reporta fallos en la aplicación',
            icon: AlertCircle,
            color: 'text-red-600'
        },
        {
            id: 'chat',
            title: 'Chat en Vivo',
            description: 'Habla directamente con soporte',
            icon: MessageCircle,
            color: 'text-green-600'
        }
    ];

    const contactInfo = [
        {
            icon: Phone,
            title: 'Teléfono',
            value: '+57 300 123 4567',
            description: 'Lun - Dom: 10:00 AM - 10:00 PM'
        },
        {
            icon: Mail,
            title: 'Email',
            value: 'soporte@calipollo.com',
            description: 'Respuesta en 24 horas'
        },
        {
            icon: Clock,
            title: 'Horarios',
            value: '10:00 AM - 10:00 PM',
            description: 'Todos los días'
        }
    ];

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'help':
                return <HelpCenter />;
            case 'ticket':
                return <SupportTicket />;
            case 'technical':
                return <TechnicalIssueForm />;
            case 'chat':
                return <ChatSupport />;
            default:
                return <HelpCenter />;
        }
    };

    return (
        <div className="support-page">
            {/* Hero Section */}
            <section className="support-hero">
                <Container>
                    <div className="text-center py-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                            ¿Cómo podemos ayudarte?
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Estamos aquí para resolver todas tus dudas y problemas
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar en el centro de ayuda..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:outline-none text-lg"
                            />
                        </div>
                    </div>
                </Container>
            </section>

            {/* Support Options */}
            <section className="py-8 bg-gray-50">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {supportOptions.map((option) => {
                            const IconComponent = option.icon;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => setActiveSection(option.id)}
                                    className={`support-option-card ${
                                        activeSection === option.id ? 'active' : ''
                                    }`}
                                >
                                    <div className={`icon-container ${option.color}`}>
                                        <IconComponent className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">
                                        {option.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {option.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </Container>
            </section>

            {/* Active Section Content */}
            <section className="py-12">
                <Container>
                    {renderActiveSection()}
                </Container>
            </section>

            {/* Contact Information */}
            <section className="py-12 bg-gradient-to-r from-yellow-50 to-orange-50">
                <Container>
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Otras formas de contactarnos
                        </h2>
                        <p className="text-gray-600">
                            Si prefieres contactarnos directamente, aquí tienes nuestros canales
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {contactInfo.map((contact, index) => {
                            const IconComponent = contact.icon;
                            return (
                                <div key={index} className="contact-info-card">
                                    <div className="icon-container text-yellow-600 mb-4">
                                        <IconComponent className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">
                                        {contact.title}
                                    </h3>
                                    <p className="font-medium text-gray-900 mb-1">
                                        {contact.value}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        {contact.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </section>

            {/* FAQ Quick Access */}
            <section className="py-12 bg-white border-t">
                <Container>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8">
                            Preguntas Frecuentes
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="faq-quick-card">
                                <CheckCircle className="w-6 h-6 text-green-500 mb-3" />
                                <h4 className="font-semibold mb-2">¿Cómo hacer un pedido?</h4>
                                <p className="text-gray-600 text-sm">
                                    Selecciona tus productos, agrégalos al carrito y procede al checkout
                                </p>
                            </div>

                            <div className="faq-quick-card">
                                <CheckCircle className="w-6 h-6 text-green-500 mb-3" />
                                <h4 className="font-semibold mb-2">¿Cuánto demora la entrega?</h4>
                                <p className="text-gray-600 text-sm">
                                    Entre 25-35 minutos dependiendo de tu ubicación
                                </p>
                            </div>

                            <div className="faq-quick-card">
                                <CheckCircle className="w-6 h-6 text-green-500 mb-3" />
                                <h4 className="font-semibold mb-2">¿Cómo cancelar un pedido?</h4>
                                <p className="text-gray-600 text-sm">
                                    Puedes cancelar antes de que esté en preparación desde tu perfil
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    );
};

export default Support;