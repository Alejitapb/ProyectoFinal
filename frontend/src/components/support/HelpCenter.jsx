import React, { useState } from 'react';
import {
    Search,
    Phone,
    Mail,
    Clock,
    MapPin,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    HelpCircle
} from 'lucide-react';

const HelpCenter = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedFaq, setExpandedFaq] = useState(null);

    const faqs = [
        {
            id: 1,
            question: "¿Cuál es el tiempo de entrega promedio?",
            answer: "Nuestro tiempo de entrega promedio es de 30-45 minutos, dependiendo de tu ubicación en Sabanalarga y la demanda del momento."
        },
        {
            id: 2,
            question: "¿Cuál es el monto mínimo para hacer un pedido?",
            answer: "El monto mínimo para pedidos a domicilio es de $15.000 COP. Para pedidos menores, puedes recoger en nuestro restaurante."
        },
        {
            id: 3,
            question: "¿Qué métodos de pago aceptan?",
            answer: "Aceptamos efectivo, transferencias bancarias, PSE, y tarjetas de crédito/débito. También trabajamos con Nequi y Daviplata."
        },
        {
            id: 4,
            question: "¿Puedo cancelar mi pedido?",
            answer: "Puedes cancelar tu pedido hasta 5 minutos después de haberlo realizado. Una vez que esté en preparación, no será posible cancelarlo."
        },
        {
            id: 5,
            question: "¿Hacen entregas fuera de Sabanalarga?",
            answer: "Por el momento solo hacemos entregas dentro del perímetro urbano de Sabanalarga. Para otras localidades, consulta disponibilidad."
        },
        {
            id: 6,
            question: "¿Cómo puedo rastrear mi pedido?",
            answer: "Una vez realizado tu pedido, recibirás actualizaciones por WhatsApp y podrás ver el estado en tiempo real en tu perfil."
        }
    ];

    const contactInfo = [
        {
            icon: Phone,
            title: "Teléfono",
            value: "+57 300 123 4567",
            action: "tel:+573001234567"
        },
        {
            icon: Mail,
            title: "Email",
            value: "ayuda@calipollo.com",
            action: "mailto:ayuda@calipollo.com"
        },
        {
            icon: MapPin,
            title: "Dirección",
            value: "Carrera 10 #15-25, Sabanalarga, Atlántico",
            action: "https://maps.google.com"
        },
        {
            icon: Clock,
            title: "Horarios",
            value: "Lun-Dom: 11:00 AM - 10:00 PM"
        }
    ];

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleFaq = (id) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <HelpCircle className="w-16 h-16 text-primary-orange mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Centro de Ayuda
                    </h1>
                    <p className="text-xl text-gray-600">
                        ¿En qué podemos ayudarte hoy?
                    </p>
                </div>

                {/* Search */}
                <div className="relative mb-12">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar en preguntas frecuentes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none text-lg"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* FAQ Section */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Preguntas Frecuentes
                        </h2>

                        <div className="space-y-4">
                            {filteredFaqs.map((faq) => (
                                <div
                                    key={faq.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleFaq(faq.id)}
                                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                                    >
                    <span className="font-semibold text-gray-800 pr-4">
                      {faq.question}
                    </span>
                                        {expandedFaq === faq.id ? (
                                            <ChevronUp className="w-5 h-5 text-primary-orange flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-primary-orange flex-shrink-0" />
                                        )}
                                    </button>

                                    {expandedFaq === faq.id && (
                                        <div className="px-6 pb-4 text-gray-600 border-t border-gray-100">
                                            <p className="pt-4">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {filteredFaqs.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">
                                    No se encontraron preguntas que coincidan con tu búsqueda.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Información de Contacto
                        </h2>

                        {contactInfo.map((contact, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-start space-x-4">
                                    <div className="p-3 bg-primary-orange bg-opacity-10 rounded-lg">
                                        <contact.icon className="w-6 h-6 text-primary-orange" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800 mb-1">
                                            {contact.title}
                                        </h3>
                                        {contact.action ? (
                                            <a
                                                href={contact.action}
                                                className="text-primary-orange hover:text-primary-red transition-colors"
                                            >
                                                {contact.value}
                                            </a>
                                        ) : (
                                            <p className="text-gray-600">{contact.value}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Quick Support */}
                        <div className="bg-gradient-to-r from-primary-orange to-primary-red rounded-xl p-6 text-white">
                            <MessageCircle className="w-8 h-8 mb-4" />
                            <h3 className="font-bold text-lg mb-2">
                                ¿Necesitas ayuda inmediata?
                            </h3>
                            <p className="mb-4 opacity-90">
                                Nuestro equipo de soporte está listo para ayudarte
                            </p>
                            <button className="bg-white text-primary-orange px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                                Crear Ticket de Soporte
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;