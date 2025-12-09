import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './TaskKanban.css';

const TaskKanban = () => {
    const [tasksByStatus, setTasksByStatus] = useState({});
    const [loading, setLoading] = useState(true);

    // Constants matching PHP
    const statuses = {
        1: 'Not Started',
        2: 'In Progress',
        3: 'Testing',
        4: 'Awaiting Feedback',
        5: 'Completed'
    };

    const priorities = {
        1: 'Low',
        2: 'Medium',
        3: 'High',
        4: 'Urgent'
    };

    const relatedToOptions = {
        1: 'Invoice',
        2: 'Customer',
        3: 'Ticket',
        4: 'Project',
        5: 'Proposal',
        6: 'Estimate',
        7: 'Lead',
        8: 'Contract'
    };

    useEffect(() => {
        fetchKanbanData();
    }, []);

    const fetchKanbanData = async () => {
        try {
            const response = await api.get('/tasks/kanban');
            if (response.data.success) {
                setTasksByStatus(response.data.data.tasks || {});
            }
        } catch (error) {
            console.error('Error fetching kanban data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const taskId = parseInt(draggableId);
        const newStatus = parseInt(destination.droppableId);
        const oldStatus = parseInt(source.droppableId);

        // Optimistically update UI
        const newTasksByStatus = { ...tasksByStatus };
        const sourceList = [...(newTasksByStatus[oldStatus] || [])];
        const destList = oldStatus === newStatus ? sourceList : [...(newTasksByStatus[newStatus] || [])];

        const [movedTask] = sourceList.splice(source.index, 1);
        movedTask.status = newStatus;
        destList.splice(destination.index, 0, movedTask);

        newTasksByStatus[oldStatus] = sourceList;
        newTasksByStatus[newStatus] = destList;
        setTasksByStatus(newTasksByStatus);

        // API call
        try {
            const response = await api.patch(`/tasks/${taskId}/status/${newStatus}`);
            if (response.data.success) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Task status updated successfully.',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            console.error('Error updating task status:', error);
            fetchKanbanData(); // Revert on error
            Swal.fire('Error', 'Failed to update task status', 'error');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
    };

    if (loading) {
        return (
            <section className="section">
                <div className="section-header">
                    <h1>Kanban List</h1>
                </div>
                <div className="section-body">
                    <div className="card">
                        <div className="card-body text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
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
                    <Link to="/tasks" className="btn btn-primary form-btn float-right-mobile">
                        List View
                    </Link>
                </div>
            </div>
            <div className="section-body">
                <div className="card">
                    <div className="col-12">
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <div className="row flex-nowrap pt-3 overflow-auto board-container">
                                <div className="lock-board"></div>
                                <div className="row col-12 d-flex flex-nowrap pb-3">
                                    {Object.entries(statuses).map(([statusKey, statusText]) => {
                                        const statusId = parseInt(statusKey);
                                        const statusTasks = tasksByStatus[statusId] || [];

                                        return (
                                            <div key={statusId} className="col-12 col-md-6 col-lg-6 col-xl-4">
                                                <div className="card board">
                                                    <div className="card-header bg-light border-0">
                                                        <h4 className="text-primary">{statusText}</h4>
                                                    </div>
                                                    <Droppable droppableId={String(statusId)}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                className={`card-body p-2 bg-light ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                                                                ref={provided.innerRef}
                                                                {...provided.droppableProps}
                                                            >
                                                                <div className={`board-${statusId - 1}`} data-board-status={statusId}>
                                                                    {statusTasks.map((task, index) => (
                                                                        <Draggable
                                                                            key={task.id}
                                                                            draggableId={String(task.id)}
                                                                            index={index}
                                                                        >
                                                                            {(provided, snapshot) => (
                                                                                <div
                                                                                    className={`card mb-3 ${snapshot.isDragging ? 'dragging' : ''}`}
                                                                                    ref={provided.innerRef}
                                                                                    {...provided.draggableProps}
                                                                                    {...provided.dragHandleProps}
                                                                                    data-id={task.id}
                                                                                    data-status={statusText}
                                                                                    data-task-status={task.status}
                                                                                >
                                                                                    <div className="card-body p-3 no-touch touch_action">
                                                                                        <Link
                                                                                            to={`/tasks/${task.id}`}
                                                                                            className="mb-0 text-primary text-decoration-none"
                                                                                        >
                                                                                            {task.subject?.length > 15
                                                                                                ? task.subject.substring(0, 15) + '...'
                                                                                                : task.subject}
                                                                                        </Link>

                                                                                        <div className="col-xs-12 ml-1 mt-1 w-100">
                                                                                            <div className="d-flex justify-content-between">
                                                                                                {task.start_date && (
                                                                                                    <div className="due-date">
                                                                                                        <b>Start Date:</b> {formatDate(task.start_date)}
                                                                                                    </div>
                                                                                                )}
                                                                                                {task.due_date && (
                                                                                                    <div className="due-date">
                                                                                                        <b>Due Date:</b> {formatDate(task.due_date)}
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="task-footer d-flex align-items-center justify-content-between row mt-2">
                                                                                            <div className="avatar-container col-xs-12 ml-3">
                                                                                                {task.user && (
                                                                                                    <Link to={`/members/${task.member_id}`}>
                                                                                                        <figure className="avatar avatar-sm" data-toggle="tooltip" title={task.user.full_name}>
                                                                                                            <img src={task.user.image_url || '/assets/img/avatar-1.png'} alt={task.user.full_name} />
                                                                                                        </figure>
                                                                                                    </Link>
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="mt-1 mr-3">
                                                                                                <div className="text-right">
                                                                                                    {task.related_to && (
                                                                                                        <span
                                                                                                            className="badge badge-success badge-padding"
                                                                                                            data-toggle="tooltip"
                                                                                                            title={`Related To Is ${relatedToOptions[task.related_to]}`}
                                                                                                        >
                                                                                                            {relatedToOptions[task.related_to]}
                                                                                                        </span>
                                                                                                    )}
                                                                                                    {task.priority && (
                                                                                                        <span
                                                                                                            className="badge badge-primary badge-padding ml-1"
                                                                                                            data-toggle="tooltip"
                                                                                                            title={`Priority Is ${priorities[task.priority]}`}
                                                                                                        >
                                                                                                            {priorities[task.priority]}
                                                                                                        </span>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="d-flex mt-2">
                                                                                            <div className="w-75">
                                                                                                <i className={`font-size-medium ${task.billable ? 'fas fa-check-circle text-success' : 'fas fa-times-circle text-danger'}`}></i>
                                                                                                {' '}Billable
                                                                                            </div>
                                                                                            <div className="text-nowrap">
                                                                                                <i className={`font-size-medium ${task.public ? 'fas fa-check-circle text-success' : 'fas fa-times-circle text-danger'}`}></i>
                                                                                                {' '}Public
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    ))}
                                                                    {provided.placeholder}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Droppable>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </DragDropContext>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TaskKanban;
