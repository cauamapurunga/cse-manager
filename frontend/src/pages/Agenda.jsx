import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Modal,
  Form,
  InputGroup,
  Tooltip,
  OverlayTrigger,
  Alert
} from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';

const STATUS = [
  { key: 'ABERTO', label: 'Aberto', badge: 'primary' },
  { key: 'ANDAMENTO', label: 'Em Andamento', badge: 'warning' },
  { key: 'CONCLUIDO', label: 'Concluído', badge: 'success' }
];
const PRIORITY = [
  { value: '', label: 'Todas' },
  { value: '1', label: 'Alta' },
  { value: '2', label: 'Média' },
  { value: '3', label: 'Baixa' }
];
const PRIORITY_COLOR = { 1: '#dc3545', 2: '#ffc107', 3: '#198754' };

function FilterBar({ search, onSearch, priority, onPriorityChange, onNewTask }) {
  return (
    <Row className="g-3 mb-4 align-items-stretch">
      <Col xs={12} sm={8} md={6}>
        <InputGroup size="lg" className="h-100">
          <OverlayTrigger placement="top" overlay={<Tooltip>Buscar</Tooltip>}>
            <InputGroup.Text className="h-100"><i className="bi bi-search" /></InputGroup.Text>
          </OverlayTrigger>
          <Form.Control
            className="h-100"
            placeholder="Buscar tarefas..."
            value={search}
            onChange={onSearch}
          />
        </InputGroup>
      </Col>
      <Col xs={6} sm={4} md={3}>
        <Form.Select size="lg" className="h-100" value={priority} onChange={onPriorityChange}>
          {PRIORITY.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </Form.Select>
      </Col>
      <Col xs={6} sm={12} md={3} className="d-flex align-items-stretch">
        <Button size="lg" variant="primary" className="w-100 h-100" onClick={onNewTask}>
          <i className="bi bi-plus-lg me-1" />Nova Tarefa
        </Button>
      </Col>
    </Row>
  );
}

function DroppableColumn({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className="p-2 d-flex flex-column gap-3"
      style={{
        flex: 1,
        maxHeight: '75vh',
        overflowY: 'auto',
        backgroundColor: isOver ? '#3a3f47' : '#282c34',
        borderRadius: 4,
        transition: 'background-color 200ms ease'
      }}
    >
      {children}
    </div>
  );
}

function DraggableCard({ id, tarefa, onEdit, onDelete, onView }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useDraggable({ id });
  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    transition: transition || 'transform 3ms ease',
    cursor: 'grab'
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="mb-2 bg-dark text-white"
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <Badge style={{ backgroundColor: PRIORITY_COLOR[tarefa.prioridade] }}>
            {PRIORITY.find(p => +p.value === tarefa.prioridade)?.label}
          </Badge>
          <div className="d-flex gap-1">
            <Button size="sm" variant="outline-light" title="Visualizar" onClick={() => onView(tarefa)}>
              <i className="bi bi-eye-fill" />
            </Button>
            <Button size="sm" variant="outline-light" title="Editar" onClick={() => onEdit(tarefa)}>
              <i className="bi bi-pencil-fill" />
            </Button>
            <Button size="sm" variant="outline-danger" title="Deletar" onClick={() => onDelete(tarefa.id)}>
              <i className="bi bi-trash-fill" />
            </Button>
          </div>
        </div>
        <Card.Title className="fs-6 text-break mb-1">{tarefa.titulo}</Card.Title>
        <Card.Text className="text-white-50 text-break" style={{ fontSize: '0.85rem' }}>
          {tarefa.descricao || <i>Sem descrição</i>}
        </Card.Text>
        <Card.Text className="text-white-75 fs-7">
          <strong>Endereço:</strong> {tarefa.cliente?.endereco || '—'}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default function Agenda() {
  const [tarefas, setTarefas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({ id: null, titulo: '', descricao: '', prioridade: 2, clienteId: '', status: 'ABERTO' });
  const [search, setSearch] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');
  const sensors = useSensors(useSensor(PointerSensor));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resTarefas, resClientes] = await Promise.all([
        api.get('/tarefas'), api.get('/clientes')
      ]);
      setTarefas(resTarefas.data);
      setClientes(resClientes.data);
      setError(null);
    } catch (err) {
      setError(err.response?.status === 403 ? 'Sem permissão (403)' : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleView = tarefa => { setCurrent(tarefa); setShowView(true); };
  const handleEdit = tarefa => {
    setForm({
      id: tarefa.id,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      prioridade: tarefa.prioridade,
      clienteId: tarefa.cliente?.id || '',
      status: tarefa.status
    });
    setShowModal(true);
  };
  const handleDelete = async id => {
    if (!window.confirm('Deseja realmente deletar esta tarefa?')) return;
    try { await api.delete(`/tarefas/${id}`); setTarefas(prev => prev.filter(t => t.id !== id)); setError(null); }
    catch (err) { setError(err.response?.status === 403 ? 'Não autorizado (403)' : 'Erro ao deletar'); }
  };
  const handleSalvar = async e => {
    e.preventDefault();
    const cliente = clientes.find(c => c.id === +form.clienteId);
    const payload = { ...form, prioridade: +form.prioridade, cliente };
    try {
      form.id ? await api.put(`/tarefas/${form.id}`, payload) : await api.post('/tarefas', payload);
      fetchData(); setShowModal(false); setError(null);
    } catch (err) {
      setError(err.response?.status === 403 ? 'Não autorizado (403)' : 'Erro ao salvar');
    }
  };
  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const dragged = tarefas.find(t => t.id === +active.id);
    if (!dragged) return;
    const updatedTask = { ...dragged, status: over.id };
    setTarefas(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    api.put(`/tarefas/${updatedTask.id}`, updatedTask).catch(err => setError('Erro ao atualizar status'));
  };

  const tarefasFiltradas = tarefas
    .filter(t => t.titulo.toLowerCase().includes(search.toLowerCase()))
    .filter(t => filtroPrioridade ? t.prioridade === +filtroPrioridade : true);

  return (
    <Container fluid className="mt-4">
      <header className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-white">Agenda de Tarefas</h2>
        <FilterBar
          search={search} onSearch={e => setSearch(e.target.value)}
          priority={filtroPrioridade} onPriorityChange={e => setFiltroPrioridade(e.target.value)}
          onNewTask={() => { setForm({ id: null, titulo: '', descricao: '', prioridade: 2, clienteId: '', status: 'ABERTO' }); setShowModal(true); }}
        />
      </header>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}><Spinner/></div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <Row className="flex-nowrap gx-3" style={{ overflowX: 'auto', paddingBottom: 16 }}>
            {STATUS.map(({ key, label, badge }) => (
              <Col key={key} xs={12} sm={6} md={4} className="d-flex flex-column">
                <div className="d-flex align-items-center mb-2"><Badge bg={badge} className="me-2">{tarefasFiltradas.filter(t=>t.status===key).length}</Badge><h5 className="text-white mb-0">{label}</h5></div>
                <DroppableColumn id={key}>
                  {tarefasFiltradas.filter(t=>t.status===key).sort((a,b)=>a.prioridade-b.prioridade).map(tarefa=>(
                    <DraggableCard key={tarefa.id} id={String(tarefa.id)} tarefa={tarefa} onView={handleView} onEdit={handleEdit} onDelete={handleDelete}/>
                  ))}
                </DroppableColumn>
              </Col>
            ))}
          </Row>
        </DndContext>
      )}

      {/* View Modal */}
      <Modal show={showView} onHide={()=>setShowView(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white"><Modal.Title>Detalhes da Tarefa</Modal.Title></Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <p><strong>Título:</strong> {current?.titulo}</p>
          <p><strong>Descrição:</strong> {current?.descricao || '—'}</p>
          <p><strong>Prioridade:</strong> {PRIORITY.find(p=>+p.value===current?.prioridade)?.label}</p>
          <p><strong>Cliente:</strong> {current?.cliente?.nome || '—'}</p>
          <p><strong>Endereço:</strong> {current?.cliente?.endereco || '—'}</p>
        </Modal.Body>
        <Modal.Footer className="bg-dark"><Button variant="secondary" onClick={()=>setShowView(false)}>Fechar</Button></Modal.Footer>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={()=>setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white"><Modal.Title>{form.id?'Editar':'Nova'} Tarefa</Modal.Title></Modal.Header>
        <Form onSubmit={handleSalvar} className="bg-dark text-white">
          <Modal.Body>
            <Row className="g-3">
              <Col xs={12} md={6}><Form.Group><Form.Label>Título</Form.Label><Form.Control required value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})}/></Form.Group></Col>
              <Col xs={6} md={3}><Form.Group><Form.Label>Prioridade</Form.Label><Form.Select value={form.prioridade} onChange={e=>setForm({...form,prioridade:e.target.value})}><option value="1">Alta</option><option value="2">Média</option><option value="3">Baixa</option></Form.Select></Form.Group></Col>
              <Col xs={6} md={3}><Form.Group><Form.Label>Status</Form.Label><Form.Select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{STATUS.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</Form.Select></Form.Group></Col>
              <Col xs={12} md={6}><Form.Group><Form.Label>Cliente</Form.Label><Form.Select required value={form.clienteId} onChange={e=>setForm({...form,clienteId:e.target.value})}><option value="">Selecione...</option>{clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</Form.Select></Form.Group></Col>
              <Col xs={12} md={6}><Form.Group><Form.Label>Descrição</Form.Label><Form.Control as="textarea" rows={2} value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})}/></Form.Group></Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="bg-dark"><Button variant="secondary" onClick={()=>setShowModal(false)}>Cancelar</Button><Button type="submit" variant="success">Salvar</Button></Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
