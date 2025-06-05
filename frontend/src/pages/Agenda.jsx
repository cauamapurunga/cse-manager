import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Button,
  Card,
  Modal,
  Badge,
  Form,
  Row,
  Col,
  Container,
  InputGroup
} from 'react-bootstrap';
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../index.css';
import TipToast from '../components/TipToast';

const STATUS_LIST = [
  { value: 'EM_ABERTO', label: 'Em Aberto', color: '#0066FF' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento', color: '#FFC107' },
  { value: 'FINALIZADO', label: 'Finalizado', color: '#198754' }
];

const PRIORIDADE = {
  1: { label: 'Alta', color: '#DC3545' },
  2: { label: 'Média', color: '#FFC107' },
  3: { label: 'Baixa', color: '#198754' }
};

function DraggableCard({ tarefa, children }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tarefa.id
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        opacity: isDragging ? 0.7 : 1,
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
        marginBottom: 10,
        touchAction: 'none'
      }}
    >
      {children}
    </div>
  );
}

function DroppableCol({ status, children, style }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: 290,
        background: isOver ? '#233452' : '#212529',
        borderRadius: 16,
        padding: '20px 10px 10px 10px',
        margin: '18px 8px 30px 8px',
        flex: 1,
        boxShadow: isOver ? '0 0 18px #0066FF44' : '0 2px 8px #0004',
        overflowY: 'auto',
        ...style
      }}
    >
      {children}
    </div>
  );
}

export default function Agenda() {
  const [tarefas, setTarefas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [validated, setValidated] = useState(false);
  const [clienteFiltro, setClienteFiltro] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 8 } })
  );

  useEffect(() => {
    fetchTarefas();
    fetchClientes();
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function fetchTarefas() {
    const resp = await api.get('/tarefas');
    setTarefas(resp.data);
  }

  async function fetchClientes() {
    const resp = await api.get('/clientes');
    setClientes(resp.data);
  }

  function openModal(tarefa = null) {
    setModalData(
      tarefa || {
        titulo: '',
        descricao: '',
        status: 'EM_ABERTO',
        prioridade: 2,
        clienteId: '',
        dataServico: ''
      }
    );
    setClienteFiltro('');
    setValidated(false);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setModalData(null);
    setValidated(false);
    setClienteFiltro('');
  }

  function handleShowConfirm(tarefaId) {
    setTarefaParaExcluir(tarefaId);
    setShowConfirm(true);
  }
  function handleCloseConfirm() {
    setTarefaParaExcluir(null);
    setShowConfirm(false);
  }

  async function handleConfirmDelete() {
    if (tarefaParaExcluir) {
      await api.delete(`/tarefas/${tarefaParaExcluir}`);
      fetchTarefas();
      handleCloseConfirm();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setValidated(true);
    if (!modalData?.titulo || !modalData?.clienteId || !modalData?.dataServico) return;
    try {
      if (modalData.id) {
        await api.put(`/tarefas/${modalData.id}`, modalData);
      } else {
        await api.post('/tarefas', modalData);
      }
      fetchTarefas();
      closeModal();
    } catch {
      alert('Erro ao salvar tarefa');
    }
  }

  function handleDragEnd(event) {
    const { over, active } = event;
    if (!over) return;
    const tarefa = tarefas.find(t => t.id === active.id);
    if (!tarefa || tarefa.status === over.id) return;
    api.put(`/tarefas/${tarefa.id}`, { ...tarefa, status: over.id }).then(fetchTarefas);
  }

  function getTarefasByStatus(status) {
    return tarefas
      .filter(t => t.status === status)
      .sort((a, b) => a.prioridade - b.prioridade);
  }

  function getClienteInfo(tarefa) {
    const cliente = clientes.find(c => c.id === (tarefa.clienteId || tarefa.cliente_id));
    return cliente
      ? { nome: cliente.nome, endereco: cliente.endereco }
      : { nome: '-', endereco: '-' };
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(clienteFiltro.toLowerCase()) ||
    c.endereco.toLowerCase().includes(clienteFiltro.toLowerCase())
  );

  // ========== RENDER ================
  return (
    <Container
      fluid
      className="py-3 agenda-kanban d-flex flex-column"
      style={{
        minHeight: '100vh',
        paddingLeft: isMobile ? 2 : 32,
        paddingRight: isMobile ? 2 : 32,
        paddingTop: isMobile ? 15 : 40
      }}
    >
      <Row className="mb-3">
        <Col xs={12}>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <h2 className="text-white mb-2 mb-sm-0" style={{ fontWeight: 700 }}>
              Agenda de Tarefas
            </h2>
            <Button
              variant="primary"
              onClick={() => openModal()}
              className="d-flex align-items-center"
              style={{ height: '2.2rem', fontSize: '0.95rem', fontWeight: 500 }}
            >
              <i className="bi bi-plus-lg me-1" /> Nova Tarefa
            </Button>
          </div>
        </Col>
      </Row>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div
          className={isMobile ? '' : 'd-flex gap-3'}
          style={
            isMobile
              ? {
                  width: '100%',
                  flexDirection: 'column',
                  overflowY: 'auto',
                  height: 'calc(95vh - 120px)',
                  minHeight: 450,
                  paddingBottom: 20
                }
              : {
                  width: '100%',
                  flex: 1,
                  height: 'calc(90vh - 140px)',
                  minHeight: 450,
                  alignItems: 'stretch',
                }
          }
        >
          {STATUS_LIST.map(statusObj => (
            <DroppableCol
              status={statusObj.value}
              key={statusObj.value}
              style={
                isMobile
                  ? {
                      width: '100%',
                      maxWidth: '100%',
                      margin: '0 0 20px 0',
                      minHeight: 230,
                      maxHeight: 'none',
                    }
                  : {
                      minHeight: 'calc(98vh - 180px)',
                      maxHeight: 'calc(98vh - 180px)',
                      height: 'calc(98vh - 180px)',    
                      overflowY: 'auto',
                    }
              }
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-bold" style={{ color: statusObj.color, fontSize: 18 }}>
                  {statusObj.label}
                </span>
                <Badge bg="dark" style={{ fontSize: 16 }}>
                  {getTarefasByStatus(statusObj.value).length}
                </Badge>
              </div>
              {getTarefasByStatus(statusObj.value).length === 0 && (
                <div className="text-muted small" style={{ opacity: .7 }}>Nenhuma tarefa</div>
              )}
              {getTarefasByStatus(statusObj.value).map(tarefa => {
                const clienteInfo = getClienteInfo(tarefa);
                return (
                  <DraggableCard tarefa={tarefa} key={tarefa.id}>
                    <Card style={{
                      background: '#1a1e22',
                      border: `2px solid ${PRIORIDADE[tarefa.prioridade]?.color || '#6c757d'}`,
                      borderRadius: 12,
                      color: '#fff',
                      marginBottom: 4,
                      marginTop: 0,
                      boxShadow: '0 1px 10px #0003'
                    }}>
                      <Card.Body className="p-2 pb-1">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <div>
                            <span className="fw-bold" style={{ fontSize: 16 }}>{tarefa.titulo}</span>
                            <Badge bg="" style={{
                              background: PRIORIDADE[tarefa.prioridade]?.color,
                              color: '#fff',
                              marginLeft: 8,
                              fontSize: 12,
                              verticalAlign: 'middle'
                            }}>
                              {PRIORIDADE[tarefa.prioridade]?.label}
                            </Badge>
                          </div>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              title="Editar"
                              onClick={() => openModal(tarefa)}
                              style={{ borderRadius: 8, border: '1px solid #bbb', background: 'transparent' }}
                            >
                              <i className="bi bi-pencil-fill" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              title="Excluir"
                              onClick={() => handleShowConfirm(tarefa.id)}
                              style={{ borderRadius: 8, border: '1px solid #dc3545', background: 'transparent' }}
                            >
                              <i className="bi bi-trash-fill" />
                            </Button>
                          </div>
                        </div>
                        <div className="mb-1" style={{ color: '#e7e9ea', opacity: .94, fontSize: 14, whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>
                          {tarefa.descricao || <span className="text-secondary">Sem descrição</span>}
                        </div>
                        <div className="small mt-2" style={{ color: '#b0c4d8' }}>
                          <i className="bi bi-person me-1 text-primary" />
                          {clienteInfo.nome}
                        </div>
                        <div className="small mt-1" style={{ color: '#b0c4d8' }}>
                          <i className="bi bi-geo-alt me-1 text-primary" />
                          {clienteInfo.endereco}
                        </div>
                        <div className="small mt-1" style={{ color: '#b0c4d8' }}>
                          <i className="bi bi-calendar-event me-1 text-primary" />
                          {tarefa.dataServico
                            ? new Date(tarefa.dataServico).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : <span className="text-secondary">Sem data</span>
                          }
                        </div>
                      </Card.Body>
                    </Card>
                  </DraggableCard>
                );
              })}
            </DroppableCol>
          ))}
        </div>
      </DndContext>
      <div style={{ height: 30 }} />

      {/* MODAL DE CRIAR/EDITAR */}
      <Modal show={!!showModal} onHide={closeModal} centered>
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>{modalData?.id ? 'Editar Tarefa' : 'Nova Tarefa'}</Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body className="bg-dark text-white">
            <Form.Group className="mb-2">
              <Form.Label>Título*</Form.Label>
              <Form.Control
                value={modalData?.titulo || ''}
                onChange={e => setModalData(d => ({ ...d, titulo: e.target.value }))}
                required
                autoFocus
                isInvalid={validated && !modalData?.titulo}
              />
              <Form.Control.Feedback type="invalid">
                O título é obrigatório
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                value={modalData?.descricao || ''}
                onChange={e => setModalData(d => ({ ...d, descricao: e.target.value }))}
                rows={2}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Data do Serviço*</Form.Label>
              <Form.Control
                type="date"
                value={modalData?.dataServico || ''}
                onChange={e => setModalData(d => ({ ...d, dataServico: e.target.value }))}
                required
                isInvalid={validated && !modalData?.dataServico}
              />
              <Form.Control.Feedback type="invalid">
                A data é obrigatória
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Prioridade</Form.Label>
              <Form.Select
                value={modalData?.prioridade || 2}
                onChange={e => setModalData(d => ({ ...d, prioridade: parseInt(e.target.value) }))}
              >
                <option value={1}>Alta</option>
                <option value={2}>Média</option>
                <option value={3}>Baixa</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Cliente*</Form.Label>
              <InputGroup className="mb-2">
                <InputGroup.Text style={{
                  background: '#fff',
                  borderRight: 0,
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                  border: '1px solid #ced4da',
                  borderRightWidth: 0,
                  paddingLeft: 10,
                  paddingRight: 10
                }}>
                  <i className="bi bi-search" style={{ color: '#0066FF', fontSize: 18 }} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Filtrar por nome ou endereço..."
                  value={clienteFiltro}
                  onChange={e => setClienteFiltro(e.target.value)}
                  style={{
                    background: '#fff',
                    borderLeft: 0,
                    borderTopRightRadius: 8,
                    borderBottomRightRadius: 8,
                    border: '1px solid #ced4da'
                  }}
                  autoComplete="off"
                />
              </InputGroup>
              <Form.Select
                value={modalData?.clienteId || ''}
                onChange={e => setModalData(d => ({ ...d, clienteId: e.target.value }))}
                required
                isInvalid={validated && !modalData?.clienteId}
                style={{ fontSize: 16, height: 40 }}
              >
                <option value="">Selecione um cliente</option>
                {clientesFiltrados.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nome} - {c.endereco}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Cliente obrigatório
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={modalData?.status || 'EM_ABERTO'}
                onChange={e => setModalData(d => ({ ...d, status: e.target.value }))}
              >
                {STATUS_LIST.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-dark" style={{ borderTop: 'none' }}>
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button variant="success" type="submit">Salvar</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL CONFIRMAÇÃO DE EXCLUSÃO */}
      <Modal show={showConfirm} onHide={handleCloseConfirm} centered>
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white" style={{ textAlign: 'center', fontSize: 16 }}>
          Tem certeza que deseja <b>excluir esta tarefa?</b>
        </Modal.Body>
        <Modal.Footer className="bg-dark" style={{ borderTop: 'none' }}>
          <Button variant="secondary" onClick={handleCloseConfirm}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>
    <TipToast message="Arraste e solte as tarefas entre as colunas para atualizar o status." />
    </Container>
  );
}
