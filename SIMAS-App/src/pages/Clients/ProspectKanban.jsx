import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Eye, Edit } from 'lucide-react';

const COLUMNS = {
    'Froid': { id: 'Froid', title: 'Froid', color: '#64748b' },
    'Tiède': { id: 'Tiède', title: 'Tiède', color: '#3b82f6' },
    'Chaud': { id: 'Chaud', title: 'Chaud', color: '#f59e0b' },
    'Gagné': { id: 'Gagné', title: 'Gagné', color: '#22c55e' },
    'Perdu': { id: 'Perdu', title: 'Perdu', color: '#ef4444' }
};

const ProspectKanban = ({ prospects, onProspectUpdate }) => {
    const navigate = useNavigate();
    const [columns, setColumns] = useState(COLUMNS);
    const [data, setData] = useState(prospects);

    useEffect(() => {
        setData(prospects);
    }, [prospects]);

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Find the moved item
        const movedItem = data.find(p => p.id === draggableId);
        const newStatus = destination.droppableId;

        // Optimistic UI update
        const newData = data.map(item =>
            item.id === draggableId ? { ...item, status: newStatus } : item
        );
        setData(newData);

        // Update Firestore
        try {
            const prospectRef = doc(db, "prospects", draggableId);
            await updateDoc(prospectRef, {
                status: newStatus,
                updatedAt: new Date()
            });
            if (onProspectUpdate) onProspectUpdate();
        } catch (error) {
            console.error("Error updating status:", error);
            // Revert on error would go here
            setData(prospects);
        }
    };

    const getColumnData = (columnId) => {
        return data.filter(p => (p.status || 'Froid') === columnId);
    };

    return (
        <div className="kanban-board">
            <DragDropContext onDragEnd={onDragEnd}>
                {Object.values(columns).map(column => (
                    <div key={column.id} className="kanban-column">
                        <div className="column-header" style={{ borderTopColor: column.color }}>
                            <h3>{column.title}</h3>
                            <span className="count-badge">{getColumnData(column.id).length}</span>
                        </div>
                        <Droppable droppableId={column.id}>
                            {(provided, snapshot) => (
                                <div
                                    className={`column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {getColumnData(column.id).map((prospect, index) => (
                                        <Draggable key={prospect.id} draggableId={prospect.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''}`}
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    onClick={() => navigate(`/prospects/${prospect.id}`)}
                                                >
                                                    <div className="card-header">
                                                        <span className="prospect-name">{prospect.name}</span>
                                                        {prospect.potential_revenue && (
                                                            <span className="prospect-value">{prospect.potential_revenue} €</span>
                                                        )}
                                                    </div>
                                                    <div className="card-company">{prospect.company || 'Particulier'}</div>

                                                    <div className="card-footer">
                                                        <div className="card-actions">
                                                            <button
                                                                className="card-action-btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/prospects/${prospect.id}`);
                                                                }}
                                                            >
                                                                <Eye size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </DragDropContext>
            <style>{`
                .kanban-board {
                    display: flex;
                    gap: 1rem;
                    overflow-x: auto;
                    padding-bottom: 1rem;
                    height: calc(100vh - 250px);
                }
                .kanban-column {
                    flex: 0 0 280px;
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid var(--glass-border);
                }
                .column-header {
                    padding: 1rem;
                    border-top: 3px solid transparent;
                    border-radius: 12px 12px 0 0;
                    background: rgba(255, 255, 255, 0.6);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 600;
                }
                .count-badge {
                    background: rgba(0,0,0,0.05);
                    padding: 0.2rem 0.6rem;
                    border-radius: 12px;
                    font-size: 0.8rem;
                }
                .column-content {
                    padding: 0.75rem;
                    flex: 1;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    transition: background 0.2s;
                }
                .column-content.dragging-over {
                    background: rgba(0,0,0,0.02);
                }
                .kanban-card {
                    background: white;
                    padding: 1rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    border: 1px solid transparent;
                    cursor: grab;
                    transition: all 0.2s;
                }
                .kanban-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    transform: translateY(-2px);
                }
                .kanban-card.dragging {
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                    border-color: var(--color-primary);
                    transform: rotate(2deg);
                    z-index: 1000;
                }
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.25rem;
                }
                .prospect-name {
                    font-weight: 600;
                    font-size: 0.95rem;
                }
                .prospect-value {
                    background: #ecfdf5;
                    color: #059669;
                    padding: 0.1rem 0.4rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .card-company {
                    color: var(--color-text-muted);
                    font-size: 0.85rem;
                    margin-bottom: 0.75rem;
                }
                .card-footer {
                    display: flex;
                    justify-content: flex-end;
                    border-top: 1px solid rgba(0,0,0,0.05);
                    padding-top: 0.5rem;
                }
                .card-action-btn {
                    background: none;
                    border: none;
                    color: var(--color-text-muted);
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 4px;
                }
                .card-action-btn:hover {
                    background: rgba(0,0,0,0.05);
                    color: var(--color-primary);
                }
            `}</style>
        </div>
    );
};

export default ProspectKanban;
