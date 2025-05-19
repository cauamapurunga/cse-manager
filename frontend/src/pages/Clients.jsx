import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Modal, Button, Form } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Clients() {
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [clienteAtual, setClienteAtual] = useState(null);
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    email: '',
    notas: '',
  });

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [clienteParaExcluir, setClienteParaExcluir] = useState(null);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    const response = await api.get('/clientes');
    setClientes(response.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const abrirModal = (cliente = null) => {
    if (cliente) {
      setClienteAtual(cliente);
      setForm(cliente);
    } else {
      setClienteAtual(null);
      setForm({
        nome: '',
        telefone: '',
        endereco: '',
        email: '',
        notas: '',
      });
    }
    setShowModal(true);
  };

  const salvarCliente = async () => {
    if (clienteAtual) {
      await api.put(`/clientes/${clienteAtual.id}`, form);
    } else {
      await api.post('/clientes', form);
    }
    setShowModal(false);
    carregarClientes();
  };

  const confirmarExclusao = (cliente) => {
    setClienteParaExcluir(cliente);
    setShowConfirmDelete(true);
  };

  const deletarCliente = async () => {
    if (clienteParaExcluir) {
      await api.delete(`/clientes/${clienteParaExcluir.id}`);
      setShowConfirmDelete(false);
      setClienteParaExcluir(null);
      carregarClientes();
    }
  };

  return (
    <div className="p-4 text-white">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Clientes</h3>
        <Button variant="primary" onClick={() => abrirModal()}>
          Novo Cliente
        </Button>
      </div>

      <table className="table table-dark table-hover align-middle">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Endereço</th>
            <th>Email</th>
            <th>Notas</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.nome}</td>
              <td>{cliente.telefone}</td>
              <td>{cliente.endereco}</td>
              <td>{cliente.email}</td>
              <td>{cliente.notas}</td>
              <td className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="d-flex align-items-center gap-1"
                  onClick={() => abrirModal(cliente)}
                >
                  <i className="bi bi-pencil-fill" />
                  Editar
                </Button>

                <Button
                  style={{ backgroundColor: '#2a2a2a', border: '1px solid #444' }}
                  size="sm"
                  className="text-danger d-flex align-items-center gap-1"
                  onClick={() => confirmarExclusao(cliente)}
                >
                  <i className="bi bi-trash-fill" />
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de Cadastro / Edição */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>{clienteAtual ? 'Editar Cliente' : 'Novo Cliente'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nome*</Form.Label>
              <Form.Control
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Telefone*</Form.Label>
              <Form.Control
                type="text"
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Endereço*</Form.Label>
              <Form.Control
                type="text"
                name="endereco"
                value={form.endereco}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notas</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notas"
                value={form.notas}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={salvarCliente}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        show={showConfirmDelete}
        onHide={() => setShowConfirmDelete(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          Tem certeza que deseja excluir o cliente{' '}
          <strong>{clienteParaExcluir?.nome}</strong>?
          <br />
          Essa ação não poderá ser desfeita.
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={deletarCliente}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
