import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api'; // Certifique-se que este caminho está correto e sua API configurada
import { 
    Modal, 
    Button, 
    Form, 
    InputGroup, 
    Alert, 
    Spinner, 
    Table
} from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../index.css'; // Seu arquivo CSS customizado para estilos globais ou específicos do tema

// Estado inicial para o formulário de cliente
const INITIAL_FORM_STATE = {
  nome: '',
  telefone: '',
  endereco: '',
  email: '',
  notas: '',
};

export default function Clients() {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para Modais
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

  const [currentCliente, setCurrentCliente] = useState(null);
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);

  // Estados para Validação de Formulário
  const [validated, setValidated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // --- Carregar lista de clientes ---
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/clientes');
      setClientes(response.data || []);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      setError("Falha ao carregar clientes. Verifique a conexão ou tente novamente mais tarde.");
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // --- Filtro de clientes ---
  const filteredClientes = clientes.filter(cliente =>
    cliente.nome && typeof cliente.nome === 'string' &&
    cliente.nome.toLowerCase().includes(search.toLowerCase())
  );

  // --- Manipuladores de Eventos ---
  const handleSearchChange = useCallback(e => {
    setSearch(e.target.value);
  }, []);

  const handleFormChange = useCallback(e => {
    const { name, value } = e.target;
    setFormState(prevFormState => ({
      ...prevFormState,
      [name]: value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors(prevFieldErrors => ({
        ...prevFieldErrors,
        [name]: null,
      }));
    }
  }, [fieldErrors]);

  // --- Funções para abrir Modais ---
  const handleOpenViewModal = useCallback(cliente => {
    setCurrentCliente(cliente);
    setShowViewModal(true);
  }, []);

  const handleOpenCreateEditModal = useCallback((cliente = null) => {
    setError(null);
    if (cliente) {
      setCurrentCliente(cliente);
      setFormState({ 
        nome: cliente.nome || '',
        telefone: cliente.telefone || '',
        endereco: cliente.endereco || '',
        email: cliente.email || '',
        notas: cliente.notas || '',
       });
    } else {
      setCurrentCliente(null);
      setFormState(INITIAL_FORM_STATE);
    }
    setFieldErrors({});
    setValidated(false);
    setShowCreateEditModal(true);
  }, []);

  const handleOpenConfirmDeleteModal = useCallback(cliente => {
    setError(null);
    setCurrentCliente(cliente);
    setShowConfirmDeleteModal(true);
  }, []);
  
  // --- Ações CRUD ---
  const handleSubmitForm = useCallback(async e => {
    e.preventDefault();
    const formElement = e.currentTarget;

    if (!formElement.checkValidity()) {
      setValidated(true);
      return;
    }

    setValidated(false);
    setFieldErrors({});
    setError(null);

    try {
      if (currentCliente && currentCliente.id) {
        await api.put(`/clientes/${currentCliente.id}`, formState);
      } else {
        await api.post('/clientes', formState);
      }
      setShowCreateEditModal(false);
      setCurrentCliente(null);
      fetchClientes();
    } catch (err) {
      console.error("Erro ao salvar cliente:", err.response || err.message);
      if (err.response?.status === 400 && err.response.data) {
        setFieldErrors(err.response.data);
        setValidated(true); 
      } else {
        setError(err.response?.data?.message || "Erro ao salvar cliente. Verifique os dados ou a conexão.");
      }
    }
  }, [currentCliente, formState, fetchClientes]);

  const handleConfirmDelete = useCallback(async () => {
    if (!currentCliente || !currentCliente.id) return;
    setError(null);
    try {
      await api.delete(`/clientes/${currentCliente.id}`);
      setShowConfirmDeleteModal(false);
      setCurrentCliente(null);
      fetchClientes();
    } catch (err) {
      console.error("Erro ao deletar cliente:", err.response || err.message);
      setError(err.response?.data?.message || "Falha ao excluir cliente. Tente novamente.");
    }
  }, [currentCliente, fetchClientes]);

  // --- Funções para fechar Modais (ação de fechar reseta o currentCliente e error se necessário) ---
  const closeModalAndReset = () => {
    setShowCreateEditModal(false);
    setShowViewModal(false);
    setShowConfirmDeleteModal(false);
    setCurrentCliente(null);
    setError(null);
  };


  // --- Renderização ---
  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="5" className="text-center py-4">
            <Spinner animation="border" role="status" size="sm" variant="light" />
            <span className="ms-2">Carregando clientes...</span>
          </td>
        </tr>
      );
    }
    if (error && clientes.length === 0) { 
      return (
        <tr>
          <td colSpan="5" className="text-center py-4">
            <Alert variant="danger" className="mb-0">{error}</Alert>
          </td>
        </tr>
      );
    }
    if (filteredClientes.length === 0 && !loading) {
      return (
        <tr>
          <td colSpan="5" className="text-center py-4">
            Nenhum cliente encontrado {search && `com o termo "${search}"`}.
          </td>
        </tr>
      );
    }
    return filteredClientes.map(cliente => (
      <tr key={cliente.id}>
        <td>{cliente.nome}</td>
        <td>{cliente.telefone}</td>
        <td className="d-none d-md-table-cell">{cliente.endereco}</td>
        <td className="d-none d-lg-table-cell">{cliente.email || '—'}</td>
        <td className="text-center">
          <div className="d-flex justify-content-center gap-2">
            {/* BOTÕES MODIFICADOS AQUI */}
            <Button variant="outline-light" size="sm" onClick={() => handleOpenViewModal(cliente)} title="Visualizar">
              <i className="bi bi-eye-fill"></i>
            </Button>
            <Button variant="outline-light" size="sm" onClick={() => handleOpenCreateEditModal(cliente)} title="Editar">
              <i className="bi bi-pencil-fill" />
            </Button>
            {/* Botão de excluir permanece com variant danger */}
            <Button variant="outline-danger" size="sm" onClick={() => handleOpenConfirmDeleteModal(cliente)} title="Excluir">
              <i className="bi bi-trash-fill" />
            </Button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="clients-wrapper p-3 p-md-4">
      <div className="clients-header d-flex flex-column flex-md-row align-items-md-center gap-2 mb-3">
        <h3 className="m-0 text-white">Clientes</h3>
        <InputGroup className="flex-grow-1">
          <InputGroup.Text id="search-addon"><i className="bi bi-search" /></InputGroup.Text>
          <Form.Control
            placeholder="Buscar cliente por nome..."
            aria-label="Buscar cliente"
            aria-describedby="search-addon"
            value={search}
            onChange={handleSearchChange}
          />
        </InputGroup>
        <Button variant="primary" onClick={() => handleOpenCreateEditModal()} className="mt-2 mt-md-0">
          <i className="bi bi-plus-lg me-1"></i> Novo Cliente
        </Button>
      </div>
      
      {error && (clientes.length > 0 || !loading) && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible className="mt-2">
          {error}
        </Alert>
      )}

      <div className="clients-table table-responsive rounded shadow-sm overflow-hidden mt-3">
        <Table 
          hover 
          responsive 
          variant="dark" 
          className="align-middle mb-0 table-bordered"
        >
          <thead> 
            <tr>
              <th className="text-uppercase">Nome</th>
              <th className="text-uppercase">Telefone</th>
              <th className="text-uppercase d-none d-md-table-cell">Endereço</th>
              <th className="text-uppercase d-none d-lg-table-cell">Email</th>
              <th className="text-uppercase text-center" style={{ width: '150px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {renderTableContent()}
          </tbody>
        </Table>
      </div>

      {/* MODAL VISUALIZAR */}
      {currentCliente && (
        <Modal show={showViewModal} onHide={closeModalAndReset} centered>
          <Modal.Header closeButton className="bg-dark text-white">
            <Modal.Title><i className="bi bi-person-vcard me-2"></i>Detalhes do Cliente</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-white">
            <p><strong>Nome:</strong> {currentCliente.nome}</p>
            <p><strong>Telefone:</strong> {currentCliente.telefone}</p>
            <p><strong>Endereço:</strong> {currentCliente.endereco}</p>
            <p><strong>Email:</strong> {currentCliente.email || '—'}</p>
            <p><strong>Notas:</strong><br />{currentCliente.notas || '—'}</p>
          </Modal.Body>
          <Modal.Footer className="bg-dark">
            <Button variant="secondary" onClick={closeModalAndReset}>Fechar</Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* MODAL CRIAR/EDITAR */}
      <Modal show={showCreateEditModal} onHide={closeModalAndReset} backdrop="static" centered>
        <Modal.Header closeButton className="bg-dark text-white border-bottom border-secondary">
          <Modal.Title className="fw-bold">
            <i className={currentCliente ? "bi bi-pencil-square me-2" : "bi bi-person-plus-fill me-2"}></i>
            {currentCliente ? 'Editar Cliente' : 'Novo Cliente'}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmitForm}>
          <Modal.Body style={{ backgroundColor: '#1C1C1C', color: '#ffffff' }} className="border-0">
            {error && !Object.keys(fieldErrors).length && (
                <Alert variant="danger" className="mb-3">{error}</Alert>
            )}
            {['nome', 'telefone', 'endereco', 'email', 'notas'].map((key) => {
              const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
              const isRequired = ['nome', 'telefone', 'endereco'].includes(key);
              
              return (
                <Form.Group controlId={`form${key}`} className="mb-3" key={key}>
                  <Form.Label>{label}{isRequired ? '*' : ''}</Form.Label>
                  <Form.Control
                    style={{ 
                        backgroundColor: '#363636', 
                        color: '#ffffff', 
                        borderColor: fieldErrors[key] || (validated && !formState[key] && isRequired) ? 'var(--bs-danger)' : '#555' 
                    }}
                    className="border-bottom"
                    type={key === 'email' ? 'email' : 'text'}
                    as={key === 'notas' ? 'textarea' : undefined}
                    rows={key === 'notas' ? 3 : undefined}
                    name={key}
                    value={formState[key]}
                    onChange={handleFormChange}
                    required={isRequired}
                    isInvalid={!!fieldErrors[key] || (validated && !formState[key] && isRequired)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors[key] || (isRequired ? `O campo ${label.toLowerCase()} é obrigatório.` : '')}
                  </Form.Control.Feedback>
                </Form.Group>
              );
            })}
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: '#2a2a2a', borderTop: '1px solid #0066FF' }}>
            <Button variant="outline-light" onClick={closeModalAndReset}>
              Cancelar
            </Button>
            <Button type="submit" variant="success">
              <i className="bi bi-check-lg me-1"></i> Salvar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL EXCLUIR */}
      {currentCliente && (
        <Modal show={showConfirmDeleteModal} onHide={closeModalAndReset} backdrop="static" centered>
          <Modal.Header closeButton className="bg-dark text-white">
            <Modal.Title><i className="bi bi-trash3-fill me-2"></i>Excluir Cliente</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-white">
            {error && <Alert variant="danger">{error}</Alert>}
            Deseja realmente excluir o cliente <strong>{currentCliente.nome}</strong>?
            <p className="text-danger mt-2">Esta ação não poderá ser desfeita.</p>
          </Modal.Body>
          <Modal.Footer className="bg-dark">
            <Button variant="secondary" onClick={closeModalAndReset}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              <i className="bi bi-exclamation-triangle-fill me-1"></i> Excluir
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
