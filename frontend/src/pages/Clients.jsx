import React, { useEffect, useState } from 'react';
import api from '../services/Api';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../index.css'; // Certifique-se de importar o CSS global

export default function Clients() {
  const [clientes, setClientes]         = useState([]);
  const [search, setSearch]             = useState('');
  const [showCreateEdit, setShowCreateEdit] = useState(false);
  const [showView, setShowView]         = useState(false);
  const [current, setCurrent]           = useState(null);
  const [form, setForm]                 = useState({
    nome:'', telefone:'', endereco:'', email:'', notas:''
  });
  const [validated, setValidated]       = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  // --- carregar lista
  useEffect(() => {
    (async()=>{
      const resp = await api.get('/clientes');
      setClientes(resp.data);
    })();
  }, []);

  // --- filtros
  const filtered = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  );

  // --- handlers header
  const handleSearch = e => setSearch(e.target.value);

  // --- abrir modal view
  function onView(cliente) {
    setCurrent(cliente);
    setShowView(true);
  }

  // --- abrir modal create/edit
  function onEditOrNew(cliente=null) {
    if(cliente) {
      setCurrent(cliente);
      setForm({ ...cliente });
    } else {
      setCurrent(null);
      setForm({ nome:'',telefone:'',endereco:'',email:'',notas:'' });
    }
    setFieldErrors({});
    setValidated(false);
    setShowCreateEdit(true);
  }

  // --- submit create/edit
  async function handleSubmit(e) {
    e.preventDefault();
    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) {
      setValidated(true);
      return;
    }
    try {
      if (current) {
        await api.put(`/clientes/${current.id}`, form);
      } else {
        await api.post('/clientes', form);
      }
      setShowCreateEdit(false);
      const resp = await api.get('/clientes');
      setClientes(resp.data);
    } catch (err) {
      if (err.response?.status === 400) {
        setFieldErrors(err.response.data);
        setValidated(true);
      }
    }
  }

  // --- confirmar delete
  function onDelete(cliente) {
    setCurrent(cliente);
    setConfirmDelete(true);
  }
  async function doDelete() {
    await api.delete(`/clientes/${current.id}`);
    setConfirmDelete(false);
    const resp = await api.get('/clientes');
    setClientes(resp.data);
  }

  return (
    <div className="clients-wrapper">
      {/* HEADER */}
      <div className="clients-header d-flex align-items-center gap-2">
        <h3 className="m-0 text-white">Clientes</h3>
        <InputGroup className="flex-grow-1">
          <InputGroup.Text><i className="bi bi-search" /></InputGroup.Text>
          <Form.Control
            placeholder="Buscar cliente..."
            value={search}
            onChange={handleSearch}
          />
        </InputGroup>
        <Button variant="primary" onClick={() => onEditOrNew()}>
          Novo Cliente
        </Button>
      </div>

      {/* TABELA */}
      <div className="clients-table table-responsive">
        <table className="table table-dark table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th className="d-none d-md-table-cell">Endereço</th>
              <th className="d-none d-lg-table-cell">Email</th>
              <th style={{width: '120px'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>{c.nome}</td>
                <td>{c.telefone}</td>
                <td className="d-none d-md-table-cell">{c.endereco}</td>
                <td className="d-none d-lg-table-cell">{c.email||'—'}</td>
                <td className="d-flex justify-content-center gap-1">
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => onView(c)}
                  >
                    <i className="bi bi-eye-fill text-dark" />
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => onEditOrNew(c)}
                  >
                    <i className="bi bi-pencil-fill" />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete(c)}
                  >
                    <i className="bi bi-trash-fill" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL VISUALIZAR */}
      <Modal show={showView} onHide={()=>setShowView(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>Detalhes do Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <p><strong>Nome:</strong> {current?.nome}</p>
          <p><strong>Telefone:</strong> {current?.telefone}</p>
          <p><strong>Endereço:</strong> {current?.endereco}</p>
          <p><strong>Email:</strong> {current?.email||'—'}</p>
          <p><strong>Notas:</strong><br/>{current?.notas||'—'}</p>
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={()=>setShowView(false)}>Fechar</Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL CRIAR/EDITAR */}
      <Modal show={showCreateEdit} onHide={()=>setShowCreateEdit(false)} backdrop="static">
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>{current ? 'Editar Cliente' : 'Novo Cliente'}</Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body className="bg-dark text-white">
            {/** Nome */}
            <Form.Group controlId="formNome" className="mb-3">
              <Form.Label>Nome*</Form.Label>
              <Form.Control
                type="text" name="nome" value={form.nome}
                onChange={e=>setForm(f=>({...f, nome:e.target.value}))}
                required isInvalid={!!fieldErrors.nome}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.nome||'O nome é obrigatório'}
              </Form.Control.Feedback>
            </Form.Group>
            {/** Telefone */}
            <Form.Group controlId="formTel" className="mb-3">
              <Form.Label>Telefone*</Form.Label>
              <Form.Control
                type="text" name="telefone" value={form.telefone}
                onChange={e=>setForm(f=>({...f, telefone:e.target.value}))}
                required isInvalid={!!fieldErrors.telefone}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.telefone||'O telefone é obrigatório'}
              </Form.Control.Feedback>
            </Form.Group>
            {/** Endereço */}
            <Form.Group controlId="formEnd" className="mb-3">
              <Form.Label>Endereço*</Form.Label>
              <Form.Control
                type="text" name="endereco" value={form.endereco}
                onChange={e=>setForm(f=>({...f, endereco:e.target.value}))}
                required isInvalid={!!fieldErrors.endereco}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.endereco||'O endereço é obrigatório'}
              </Form.Control.Feedback>
            </Form.Group>
            {/** Email */}
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email" name="email" value={form.email}
                onChange={e=>setForm(f=>({...f, email:e.target.value}))}
                isInvalid={!!fieldErrors.email}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.email}
              </Form.Control.Feedback>
            </Form.Group>
            {/** Notas */}
            <Form.Group controlId="formNotas" className="mb-3">
              <Form.Label>Notas</Form.Label>
              <Form.Control
                as="textarea" rows={3}
                name="notas" value={form.notas}
                onChange={e=>setForm(f=>({...f, notas:e.target.value}))}
                isInvalid={!!fieldErrors.notas}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.notas}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-dark">
            <Button variant="secondary" onClick={()=>setShowCreateEdit(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="success">
              Salvar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL EXCLUIR */}
      <Modal show={confirmDelete} onHide={()=>setConfirmDelete(false)} backdrop="static">
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>Excluir Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          Deseja realmente excluir <strong>{current?.nome}</strong>?
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={()=>setConfirmDelete(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={doDelete}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}