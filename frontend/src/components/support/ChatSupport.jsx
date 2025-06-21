import React, { useState, useEffect, useRef } from 'react';
import {
    MessageCircle,
    Send,
    Phone,
    X,
    Minimize2,
    Maximize2,
    Bot,
    User,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ChatSupport = ({ isOpen, onToggle }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [chatStatus, setChatStatus] = useState('offline'); // offline, connecting, online
    const messagesEndRef = useRef(null);

    // Respuestas automáticas del bot
    const botResponses = {
        greeting: "¡Hola! Soy el asistente virtual de Cali Pollo. ¿En qué puedo ayudarte hoy?",
        hours: "Nuestros horarios de atención son:\n📅 Lunes a Domingo: 11:00 AM - 10:00 PM\n📞 Soporte: 24/7",
        delivery: "El tiempo de entrega promedio es de 30-45 minutos. El costo del domicilio es de $3.000 COP.",
        payment: "Aceptamos:\n💳 Tarjetas de crédito/débito\n💰 Efectivo\n📱 Nequi y Daviplata\n🏦 Transferencias PSE",
        menu: "Puedes ver nuestro menú completo en la sección 'Menú' de la aplicación. ¡Tenemos delicioso pollo frito, arroces y mucho más!",
        contact: "Puedes contactarnos:\n📞 +57 300 123 4567\n📧 ayuda@calipollo.com\n📍 Carrera 10 #15-25, Sabanalarga",
        default: "Entiendo tu consulta. Un agente se pondrá en contacto contigo pronto. También puedes llamarnos al +57 300 123 4567 para asistencia inmediata."
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Mensaje de bienvenida
            setTimeout(() => {
                addBotMessage(botResponses.greeting);
            }, 1000);
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const addBotMessage = (text) => {
        const message = {
            id: Date.now(),
            text,
            sender: 'bot',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, message]);
    };

    const addUserMessage = (text) => {
        const message = {
            id: Date.now(),
            text,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, message]);
    };

    const getAutomaticResponse = (userMessage) => {
        const message = userMessage.toLowerCase();

        if (message.includes('hola') || message.includes('buenos') || message.includes('buenas')) {
            return botResponses.greeting;
        }
        if (message.includes('horario') || message.includes('abierto') || message.includes('hora')) {
            return botResponses.hours;
        }
        if (message.includes('entrega') || message.includes('domicilio') || message.includes('tiempo')) {
            return botResponses.delivery;
        }
        if (message.includes('pago') || message.includes('pagar') || message.includes('tarjeta')) {
            return botResponses.payment;
        }
        if (message.includes('menu') || message.includes('comida') || message.includes('producto')) {
            return botResponses.menu;
        }
        if (message.includes('telefono') || message.includes('contacto') || message.includes('llamar')) {
            return botResponses.contact;
        }

        return botResponses.default;
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Agregar mensaje del usuario
        addUserMessage(newMessage);

        // Simular typing del bot
        setIsTyping(true);

        // Generar respuesta automática
        setTimeout(() => {
            const response = getAutomaticResponse(newMessage);
            addBotMessage(response);
            setIsTyping(false);
        }, 1500);

        setNewMessage('');
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const quickActions = [
        { text: "Ver horarios", action: () => setNewMessage("¿Cuáles son los horarios?") },
        { text: "Información de entrega", action: () => setNewMessage("¿Cuánto demora la entrega?") },
        { text: "Métodos de pago", action: () => setNewMessage("¿Qué métodos de pago aceptan?") },
        { text: "Hablar con agente", action: () => setNewMessage("Necesito hablar con un agente") }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Chat Window */}
            <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
                isMinimized ? 'w-80 h-16' : 'w-80 h-96'
            }`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-orange to-primary-red text-white p-4 rounded-t-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Soporte Cali Pollo</h3>
                            <div className="flex items-center text-xs opacity-90">
                                <div className="w-2 h-2 bg-green-300 rounded-full mr-1"></div>
                                En línea
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                        >
                            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={onToggle}
                            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Chat Content */}
                {!isMinimized && (
                    <>
                        {/* Messages */}
                        <div className="h-64 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-xs flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            message.sender === 'user'
                                                ? 'bg-primary-orange text-white'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {message.sender === 'user' ? (
                                                <User className="w-4 h-4" />
                                            ) : (
                                                <Bot className="w-4 h-4" />
                                            )}
                                        </div>

                                        {/* Message Bubble */}
                                        <div className={`px-3 py-2 rounded-lg max-w-xs ${
                                            message.sender === 'user'
                                                ? 'bg-primary-orange text-white'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                            <p className={`text-xs mt-1 ${
                                                message.sender === 'user' ? 'text-orange-100' : 'text-gray-500'
                                            }`}>
                                                {formatTime(message.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="flex items-end space-x-2">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                            <Bot className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div className="bg-gray-100 px-3 py-2 rounded-lg">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        {messages.length <= 1 && (
                            <div className="px-4 pb-2">
                                <div className="text-xs text-gray-500 mb-2">Acciones rápidas:</div>
                                <div className="flex flex-wrap gap-1">
                                    {quickActions.map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={action.action}
                                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                                        >
                                            {action.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="border-t border-gray-200 p-4">
                            <form onSubmit={handleSendMessage} className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Escribe tu mensaje..."
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-primary-orange text-white p-2 rounded-lg hover:bg-primary-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatSupport;