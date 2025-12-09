import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './LeadKanban.css';

const LeadKanban = () => {
    const [kanbanData, setKanbanData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchKanbanData();
    }, []);

    const fetchKanbanData = async () => {
        try {
            const response = await api.get('/leads/kanban');
            if (response.data.success) {
                setKanbanData(response.data.data.kanban);
            }
        } catch (error) {
            console.error('Error fetching kanban data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;

        // If dropped in the same column and position, do nothing
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const leadId = draggableId;
        const newStatusId = destination.droppableId;

        // Optimistic update
        const updatedKanbanData = [...kanbanData];
        const sourceColIndex = updatedKanbanData.findIndex(col => col.status.id.toString() === source.droppableId);
        const destColIndex = updatedKanbanData.findIndex(col => col.status.id.toString() === newStatusId);

        if (sourceColIndex === -1 || destColIndex === -1) return;

        const [movedLead] = updatedKanbanData[sourceColIndex].leads.splice(source.index, 1);
        movedLead.status_id = parseInt(newStatusId);
        updatedKanbanData[destColIndex].leads.splice(destination.index, 0, movedLead);

        setKanbanData(updatedKanbanData);

        try {
            const response = await api.patch(`/leads/${leadId}/status/${newStatusId}`);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: response.data.message,
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            // Revert on error
            fetchKanbanData();
            Swal.fire('Error', error.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    const truncate = (str, len) => {
        if (!str) return '';
        return str.length > len ? str.substring(0, len) + '..' : str;
    };

    const timeAgo = (date) => {
        if (!date) return '';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }
        return 'Just now';
    };

    if (loading) {
        return (
            <section className="section">
                <div className="section-header">
                    <h1>Kanban List</h1>
                </div>
                <div className="section-body">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section">
            <div className="section-header">
                <h1>Kanban List</h1>
                <div className="section-header-breadcrumb">
                    <div className="card-header-action">
                        <Link to="/leads" className="btn btn-primary form-btn float-right-mobile">
                            List View
                        </Link>
                    </div>
                </div>
            </div>
            <div className="section-body">
                <div className="card">
                    <div className="col-12">
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <div className="row flex-nowrap pt-3 overflow-auto board-container">
                                {kanbanData.map((column, index) => (
                                    <div key={column.status.id} className="col-12 col-md-6 col-lg-6 col-xl-4">
                                        <div className="card board">
                                            <div className="card-header bg-light border-0">
                                                <h4 style={{ color: column.status.color || '#6777ef' }}>
                                                    {column.status.name}
                                                </h4>
                                            </div>
                                            <Droppable droppableId={column.status.id.toString()}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        className={`card-body p-2 bg-light ${snapshot.isDraggingOver ? 'ex-over' : ''}`}
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                    >
                                                        <div className={`board-${index}`} data-board-status={column.status.id}>
                                                            {column.leads.length > 0 ? (
                                                                column.leads.map((lead, leadIndex) => (
                                                                    <Draggable
                                                                        key={lead.id}
                                                                        draggableId={lead.id.toString()}
                                                                        index={leadIndex}
                                                                    >
                                                                        {(provided, snapshot) => (
                                                                            <div
                                                                                className={`card mb-3 ${snapshot.isDragging ? 'ex-moved' : ''}`}
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                data-id={lead.id}
                                                                            >
                                                                                <div className="card-body p-3 no-touch touch_action">
                                                                                    <a
                                                                                        href="#"
                                                                                        className="mb-0 text-primary text-decoration-none"
                                                                                        onClick={(e) => {
                                                                                            e.preventDefault();
                                                                                            navigate(`/leads/${lead.id}`);
                                                                                        }}
                                                                                    >
                                                                                        {truncate(lead.name, 20)}
                                                                                    </a>
                                                                                    <div className="col-xs-12 ml-1 mt-1 w-100">
                                                                                        <div className="d-flex justify-content-between">
                                                                                            <div className="ml-1">
                                                                                                <i className="fas fa-street-view"></i>
                                                                                                {' '}{truncate(lead.company_name, 15)}
                                                                                            </div>
                                                                                            <div className="tracked-time text-right mr-2">
                                                                                                <i className="fas fa-dollar-sign"></i>
                                                                                                {' '}{lead.estimate_budget || 0}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="task-footer d-flex align-items-center justify-content-between row">
                                                                                        <div className="avatar-container col-xs-12 mt-2 ml-3">
                                                                                            {lead.assignedTo && (
                                                                                                <figure
                                                                                                    className="avatar avatar-sm"
                                                                                                    data-toggle="tooltip"
                                                                                                    title={lead.assignedTo.full_name}
                                                                                                >
                                                                                                    <img
                                                                                                        src={lead.assignedTo.image_url || '/images/avatar.png'}
                                                                                                        alt={lead.assignedTo.full_name}
                                                                                                        onError={(e) => { e.target.src = '/images/avatar.png'; }}
                                                                                                    />
                                                                                                </figure>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="mt-1 mr-3">
                                                                                            <div className="text-right">
                                                                                                {lead.position && (
                                                                                                    <span
                                                                                                        className="badge badge-primary badge-padding"
                                                                                                        title={`Position Is ${lead.position}`}
                                                                                                    >
                                                                                                        {lead.position}
                                                                                                    </span>
                                                                                                )}
                                                                                                {lead.leadSource && (
                                                                                                    <span
                                                                                                        className="badge badge-success badge-padding"
                                                                                                        title={`Source Is ${lead.leadSource.name}`}
                                                                                                    >
                                                                                                        {lead.leadSource.name}
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="col-xs-12 ml-1 mt-2">
                                                                                        <div className="d-flex justify-content-between">
                                                                                            <div>
                                                                                                <i className={`font-size-medium ${lead.public === 1 ? 'fas fa-check-circle text-success' : 'fas fa-times-circle text-danger'}`}></i>
                                                                                                {' '}Public
                                                                                            </div>
                                                                                            <div className="due-date mr-2">
                                                                                                {timeAgo(lead.created_at || lead.createdAt)}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                ))
                                                            ) : (
                                                                <div className="text-center text-muted py-3">
                                                                    No leads available
                                                                </div>
                                                            )}
                                                            {provided.placeholder}
                                                        </div>
                                                    </div>
                                                )}
                                            </Droppable>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </DragDropContext>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LeadKanban;
