package com.csemanager.controller;

import com.csemanager.dto.TaskDTO;
import com.csemanager.model.Task;
import com.csemanager.model.Cliente;
import com.csemanager.repository.TaskRepository;
import com.csemanager.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tarefas")
public class TaskController {

    @Autowired
    private TaskRepository repository;

    @Autowired
    private ClienteRepository clienteRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // Converter entidade para DTO
    private TaskDTO toDTO(Task t) {
        Cliente c = t.getCliente();
        return new TaskDTO(
                t.getId(),
                t.getTitulo(),
                t.getDescricao(),
                t.getStatus(),
                t.getPrioridade(),
                c != null ? c.getId() : null,
                c != null ? c.getNome() : null,
                c != null ? c.getEndereco() : null,
                t.getDataServico() != null ? t.getDataServico().format(DATE_FORMATTER) : null
        );
    }

    // Converter DTO para entidade
    private Task toEntity(TaskDTO dto) {
        Task task = new Task();
        task.setTitulo(dto.getTitulo());
        task.setDescricao(dto.getDescricao());
        task.setStatus(dto.getStatus());
        task.setPrioridade(dto.getPrioridade());
        if (dto.getClienteId() != null) {
            Optional<Cliente> cliente = clienteRepository.findById(dto.getClienteId());
            cliente.ifPresent(task::setCliente);
        }
        if (dto.getDataServico() != null && !dto.getDataServico().isEmpty()) {
            task.setDataServico(LocalDate.parse(dto.getDataServico(), DATE_FORMATTER));
        }
        return task;
    }

    // Listar todas
    @GetMapping
    public List<TaskDTO> listar() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> buscar(@PathVariable Long id) {
        Optional<Task> t = repository.findById(id);
        return t.map(task -> ResponseEntity.ok(toDTO(task)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Criar nova tarefa
    @PostMapping
    public TaskDTO criar(@RequestBody TaskDTO dto) {
        Task entidade = toEntity(dto);
        Task salvo = repository.save(entidade);
        return toDTO(salvo);
    }

    // Atualizar
    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> atualizar(@PathVariable Long id, @RequestBody TaskDTO dados) {
        return repository.findById(id)
                .map(task -> {
                    task.setTitulo(dados.getTitulo());
                    task.setDescricao(dados.getDescricao());
                    task.setStatus(dados.getStatus());
                    task.setPrioridade(dados.getPrioridade());
                    if (dados.getClienteId() != null) {
                        Optional<Cliente> cliente = clienteRepository.findById(dados.getClienteId());
                        cliente.ifPresent(task::setCliente);
                    } else {
                        task.setCliente(null);
                    }
                    if (dados.getDataServico() != null && !dados.getDataServico().isEmpty()) {
                        task.setDataServico(LocalDate.parse(dados.getDataServico(), DATE_FORMATTER));
                    } else {
                        task.setDataServico(null);
                    }
                    Task atualizado = repository.save(task);
                    return ResponseEntity.ok(toDTO(atualizado));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Deletar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        return repository.findById(id)
                .map(task -> {
                    repository.delete(task);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}