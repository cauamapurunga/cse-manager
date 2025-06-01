import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Form, Button } from 'react-bootstrap';
import jsPDF from 'jspdf';

export default function Orcamentos() {
  const [clientes, setClientes] = useState([]);
  const [clienteBusca, setClienteBusca] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [tarefas, setTarefas] = useState([]);
  const [tarefasSelecionadas, setTarefasSelecionadas] = useState([]);
  const [valoresTarefas, setValoresTarefas] = useState({});
  const [equipamentos, setEquipamentos] = useState([]);
  const [outrosTexto, setOutrosTexto] = useState('');
  const [outrosValor, setOutrosValor] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  const clienteObj = clienteSelecionado && clientes.find(c => c.id.toString() === clienteSelecionado);
  const totalEquipamentos = equipamentos.reduce((acc, eq) => acc + (parseFloat(eq.valor) || 0), 0);
  const totalServicos = tarefasSelecionadas.reduce((acc, id) => acc + (parseFloat(valoresTarefas[id]) || 0), 0) +
    (tarefasSelecionadas.includes('outros') ? parseFloat(outrosValor || 0) : 0);
  const totalGeral = totalServicos + totalEquipamentos;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resClientes, resTarefas] = await Promise.all([
          api.get('/clientes'),
          api.get('/tarefas')
        ]);
        setClientes(resClientes.data);
        setTarefas(resTarefas.data);
      } catch (error) {
        console.error('Erro ao carregar dados', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const match = clientes.find(c => `${c.nome} - ${c.telefone}` === clienteBusca);
    setClienteSelecionado(match ? match.id.toString() : '');
  }, [clienteBusca, clientes]);

  const toggleTarefa = (id) => {
    setTarefasSelecionadas(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const atualizarValorTarefa = (id, valor) => {
    setValoresTarefas(prev => ({ ...prev, [id]: valor }));
  };

  const adicionarEquipamento = () => {
    setEquipamentos([...equipamentos, { nome: '', valor: '' }]);
  };

  const atualizarEquipamento = (index, campo, valor) => {
    const atualizados = [...equipamentos];
    atualizados[index][campo] = valor;
    setEquipamentos(atualizados);
  };

  const removerEquipamento = (index) => {
    setEquipamentos(prev => prev.filter((_, i) => i !== index));
  };

  const exibirErro = (mensagem) => {
    setMensagemErro(mensagem);
    setTimeout(() => setMensagemErro(''), 4000);
  };

  const handleGerarPDF = () => {
    if (!clienteSelecionado) return exibirErro('Selecione um cliente antes de gerar o PDF.');
    if (tarefasSelecionadas.length === 0) return exibirErro('Selecione pelo menos um serviço.');
    for (const id of tarefasSelecionadas) {
      if (id !== 'outros' && (valoresTarefas[id] === '' || isNaN(parseFloat(valoresTarefas[id])))) {
        return exibirErro('Informe o valor de todas as tarefas selecionadas.');
      }
    }
    if (tarefasSelecionadas.includes('outros')) {
      if (!outrosTexto.trim()) return exibirErro('Descreva o problema em "Outros".');
      if (outrosValor === '' || isNaN(parseFloat(outrosValor))) {
        return exibirErro('Informe um valor válido para "Outros".');
      }
    }
    for (let i = 0; i < equipamentos.length; i++) {
      const eq = equipamentos[i];
      if (eq.valor === '' || isNaN(parseFloat(eq.valor))) {
        return exibirErro(`Informe um valor válido para o equipamento: ${eq.nome || 'sem nome'}`);
      }
    }

    const pdf = new jsPDF();
    const logo = new Image();
    logo.src = '/logo-cse.png';
    logo.onload = () => {
      const dataHoje = new Date().toLocaleDateString('pt-BR');
      let y = 20;

      pdf.addImage(logo, 'PNG', 10, y, 35, 35);
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('CSE & REFRIGERAÇÃO', 50, y + 5);
      pdf.setFont(undefined, 'normal');
      pdf.text('CNPJ: 21.935.339/0001-50', 50, y + 12);
      pdf.text('Rua São Jerônimo, 465', 50, y + 19);
      pdf.text('Novo Maranguape II, Maranguape-CE', 50, y + 26);
      pdf.text('CEP 61944-620', 50, y + 33);
      pdf.text('cserefrigeracaowy@gmail.com', 150, y + 12);
      pdf.text('(85) 98717-5445', 150, y + 19);
      y += 45;

      pdf.setFillColor(230);
      pdf.rect(10, y, 190, 10, 'F');
      pdf.setFontSize(14);
      pdf.text(`Orçamento ${Math.floor(100 + Math.random() * 900)}-2025`, 15, y + 7);
      y += 20;

      pdf.setFontSize(12);
      pdf.text(`Cliente: ${clienteObj?.nome || ''}`, 15, y);
      y += 7;
      pdf.text(`Telefone: ${clienteObj?.telefone || ''}`, 15, y);
      y += 12;

      pdf.setFontSize(13);
      pdf.setFont(undefined, 'bold');
      pdf.text('Serviços', 15, y);
      y += 7;
      pdf.setFont(undefined, 'normal');

      const colDescricao = 20;
      const colValor = 180;

      tarefas
        .filter(t => tarefasSelecionadas.includes(t.id))
        .forEach(t => {
          const valor = parseFloat(valoresTarefas[t.id]) || 0;
          pdf.text(`- ${t.titulo}`, colDescricao, y);
          pdf.text(`R$ ${valor.toFixed(2)}`, colValor, y, { align: 'right' });
          y += 6;
        });

      if (tarefasSelecionadas.includes('outros') && outrosTexto) {
        const valorOutros = parseFloat(outrosValor || 0);
        pdf.text(`- ${outrosTexto}`, colDescricao, y);
        pdf.text(`R$ ${valorOutros.toFixed(2)}`, colValor, y, { align: 'right' });
        y += 6;
      }

      y += 4;
      pdf.setFont(undefined, 'bold');
      pdf.text('Total Serviços:', colDescricao, y);
      pdf.text(`R$ ${totalServicos.toFixed(2)}`, colValor, y, { align: 'right' });
      y += 12;

      if (equipamentos.length > 0) {
        pdf.setFont(undefined, 'bold');
        pdf.text('Equipamentos', 15, y);
        y += 7;
        pdf.setFont(undefined, 'normal');

        equipamentos.forEach(e => {
          const valor = parseFloat(e.valor || 0);
          pdf.text(`- ${e.nome}`, colDescricao, y);
          pdf.text(`R$ ${valor.toFixed(2)}`, colValor, y, { align: 'right' });
          y += 6;
        });

        y += 4;
        pdf.setFont(undefined, 'bold');
        pdf.text('Total Equipamentos:', colDescricao, y);
        pdf.text(`R$ ${totalEquipamentos.toFixed(2)}`, colValor, y, { align: 'right' });
        y += 12;
      }

      pdf.setFont(undefined, 'bold');
      pdf.text('Total Geral:', colDescricao, y);
      pdf.text(`R$ ${totalGeral.toFixed(2)}`, colValor, y, { align: 'right' });
      y += 15;

      pdf.text('Pagamento', 15, y);
      y += 7;
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(11);
      pdf.text('Meios de pagamento: Boleto, transferência bancária, dinheiro, cheque, cartão ou pix.', 15, y);
      y += 15;
      pdf.text(`Maranguape, ${dataHoje}`, 15, y);
      y += 15;
      pdf.text('_____________________________________', 15, y);
      pdf.setFont(undefined, 'bold');
      pdf.text('CSE & REFRIGERAÇÃO', 15, y + 6);
      pdf.text('Weyne Arruda', 15, y + 12);
      pdf.save('orcamento.pdf');
    };
  };

  return (
    <div className="p-4 text-white" style={{ height: '100vh', overflowY: 'scroll' }}>
      <h3>Gerar Orçamento</h3>
      <p>Selecione um cliente e adicione os serviços e equipamentos.</p>

      {mensagemErro && (
        <div className="mt-2 p-3 rounded" style={{ backgroundColor: '#aa2e2e', color: '#fff' }}>
          {mensagemErro}
        </div>
      )}

      <Form.Group className="mt-4">
        <Form.Label>Cliente</Form.Label>
        <Form.Control
          type="text"
          placeholder="Buscar cliente por nome ou telefone"
          className="bg-dark text-white border-secondary mb-2"
          value={clienteBusca}
          onChange={(e) => setClienteBusca(e.target.value)}
          list="clientesList"
        />
        <datalist id="clientesList">
          {clientes.map((c) => (
            <option key={c.id} value={`${c.nome} - ${c.telefone}`} />
          ))}
        </datalist>
        {clienteSelecionado && clienteObj && (
          <div className="mt-3 border rounded p-3 bg-dark border-secondary">
            <div><strong>Nome:</strong> {clienteObj.nome}</div>
            <div><strong>Telefone:</strong> {clienteObj.telefone}</div>
            <div><strong>Endereço:</strong> {clienteObj.endereco}</div>
          </div>
        )}
      </Form.Group>

      <hr className="border-secondary my-4" />

      <Form.Group>
        <Form.Label>Serviços (Tarefas)</Form.Label>
        <div className="bg-dark p-3 rounded border border-secondary">
          {tarefas.map((tarefa) => (
            <div key={tarefa.id} className="mb-3">
              <Form.Check
                type="checkbox"
                label={tarefa.titulo}
                className="text-white"
                checked={tarefasSelecionadas.includes(tarefa.id)}
                onChange={() => toggleTarefa(tarefa.id)}
              />
              {tarefasSelecionadas.includes(tarefa.id) && (
                <Form.Control
                  type="number"
                  placeholder="Valor da tarefa (R$)"
                  className="bg-dark text-white border-secondary mt-1"
                  value={valoresTarefas[tarefa.id] || ''}
                  onChange={(e) => atualizarValorTarefa(tarefa.id, e.target.value)}
                />
              )}
            </div>
          ))}
          <Form.Check
            type="checkbox"
            label="Outros (descrever problema)"
            className="text-white mb-2"
            checked={tarefasSelecionadas.includes('outros')}
            onChange={() =>
              setTarefasSelecionadas((prev) =>
                prev.includes('outros') ? prev.filter((t) => t !== 'outros') : [...prev, 'outros']
              )
            }
          />
          {tarefasSelecionadas.includes('outros') && (
            <div className="row g-2 mt-2">
              <div className="col-md-8">
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Descreva o problema ou serviço"
                  className="bg-dark text-white border-secondary"
                  value={outrosTexto}
                  onChange={(e) => setOutrosTexto(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <Form.Control
                  type="number"
                  placeholder="Valor (R$)"
                  className="bg-dark text-white border-secondary"
                  value={outrosValor}
                  onChange={(e) => setOutrosValor(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </Form.Group>

      <hr className="border-secondary my-4" />

      <Form.Group controlId="equipamentos">
        <Form.Label>Equipamentos</Form.Label>
        <div className="bg-dark p-3 rounded border border-secondary">
          {equipamentos.map((equip, idx) => (
            <div key={idx} className="row g-2 mb-2 align-items-center">
              <div className="col-md-5">
                <Form.Control
                  type="text"
                  placeholder="Nome do equipamento"
                  value={equip.nome}
                  onChange={(e) => atualizarEquipamento(idx, 'nome', e.target.value)}
                  className="bg-dark text-white border-secondary"
                />
              </div>
              <div className="col-md-4">
                <Form.Control
                  type="number"
                  placeholder="Custo (R$)"
                  value={equip.valor}
                  onChange={(e) => atualizarEquipamento(idx, 'valor', e.target.value)}
                  className="bg-dark text-white border-secondary"
                />
              </div>
              <div className="col-md-3 text-end">
                <Button variant="danger" onClick={() => removerEquipamento(idx)}>
                  Remover
                </Button>
              </div>
            </div>
          ))}
          <div className="d-flex justify-content-between mt-3 align-items-center">
            <Button variant="outline-light" onClick={adicionarEquipamento}>
              + Adicionar Equipamento
            </Button>
            {equipamentos.length > 0 && (
              <div className="text-white">
                <strong>Total:</strong> R$ {totalEquipamentos.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </Form.Group>

      <hr className="border-secondary my-4" />

      <Button variant="success" onClick={handleGerarPDF}>
        Gerar PDF
      </Button>
    </div>
  );
}
