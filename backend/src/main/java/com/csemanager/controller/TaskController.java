package com.csemanager.controller;

import com.csemanager.dto.TaskDTO;
import com.csemanager.model.Task;
import com.csemanager.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tarefas")
public class TaskController {

    @Autowired
    private TaskRepository repository;

    // Converter entidade para DTO
    private TaskDTO toDTO(Task t) {
        return new TaskDTO(t.getId(), t.getTitulo(), t.getDescricao(), t.getStatus(), t.getPrioridade());
    }

    // Converter DTO para entidade
    private Task toEntity(TaskDTO dto) {
        return new Task(dto.getTitulo(), dto.getDescricao(), dto.getStatus(), dto.getPrioridade());
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