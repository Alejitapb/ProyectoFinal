import React, { useState, useEffect } from 'react';
import {
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    MessageSquare,
    User,
    Calendar,
    Tag,
    ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';

const SupportTicket = ({ ticketId, onBack }) => {
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (ticketId) {
            fetchTicket();
        }
    }, [ticketId]);

    const fetchTicket = async () => {
        try {
            const data = await api.get(`/support/tickets/${ticketId}`);
            setTicket(data);
        } catch (error) {
            toast.error('Error al cargar el ticket');
            console.error('Error fetching ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddResponse = async (e) => {
        e.preventDefault();
        if (!response.trim()) return;

        setSubmitting(true);
        try {
            await api.post(`/support/tickets/${ticketId}/responses`, {
                message: response
            });

            setResponse('');
            toast.success('Respuesta enviada correctamente');
            fetchTicket(); // Refresh ticket data
        } catch (error) {
            toast.error('Error al enviar la respuesta');
            console.error('Error adding response:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            open: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            resolved: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || colors.open;
    };

    const getStatusIcon = (status) => {
        const icons = {
            open: AlertCircle,
            in_progress: Clock,
            resolved: CheckCircle,
            closed: XCircle
        };
        return icons[status] || AlertCircle;
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-red-100 text-red-800'
        };
        return colors[priority] || colors.medium;
    };

    const getCategoryColor = (category) => {
        const colors = {
            technical: 'bg-purple-100 text-purple-800',
            order: 'bg-blue-100 text-blue-800',
            payment: 'bg-orange-100 text-orange-800',
            general: 'bg-gray-100 text-gray-800'
        };
        return colors[category] || colors.general;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <Loading />;
    }

    if (!ticket) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Ticket no encontrado
                </h3>
                <p className="text-gray-500">
                    El ticket solicitado no existe o no tienes permisos para verlo.
                </p>
            </div>
        );
    }

    const StatusIcon = getStatusIcon(ticket.status);

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
                <h1 className="text-2xl font-bold text-gray-800">
                    Ticket #{ticket.id}
                </h1>
            </div>

            {/* Ticket Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-wrap items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            {ticket.subject}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {ticket.user_name}
                            </div>
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(ticket.created_at)}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(ticket.status)}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
                {ticket.status === 'in_progress' ? 'En Progreso' :
                    ticket.status === 'resolved' ? 'Resuelto' :
                        ticket.status === 'closed' ? 'Cerrado' : 'Abierto'}
            </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority === 'high' ? 'Alta' :
                  ticket.priority === 'medium' ? 'Media' : 'Baja'}
            </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getCategoryColor(ticket.category)}`}>
              <Tag className="w-3 h-3 mr-1" />
                            {ticket.category === 'technical' ? 'Técnico' :
                                ticket.category === 'order' ? 'Pedido' :
                                    ticket.category === 'payment' ? 'Pago' : 'General'}
            </span>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Descripción:</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
                </div>

                {ticket.admin_response && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <h3 className="font-semibold text-gray-800 mb-2">Respuesta del Soporte:</h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-gray-700 whitespace-pre-wrap">{ticket.admin_response}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Response Form */}
            {ticket.status !== 'closed' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Agregar Respuesta
                    </h3>

                    <form onSubmit={handleAddResponse}>
            <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Escribe tu respuesta o información adicional..."
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-orange focus:border-transparent resize-none"
                required
            />

                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                disabled={submitting || !response.trim()}
                                className="bg-primary-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Enviando...
                                    </>
                                ) : (
                                    'Enviar Respuesta'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Closed Ticket Message */}
            {ticket.status === 'closed' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                    <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Ticket Cerrado
                    </h3>
                    <p className="text-gray-500">
                        Este ticket ha sido cerrado. Si necesitas ayuda adicional,
                        por favor crea un nuevo ticket de soporte.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SupportTicket;