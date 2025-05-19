package com.csemanager.controller;

import com.csemanager.model.Cliente;
import com.csemanager.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    // LISTAR TODOS
    @GetMapping
    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    // BUSCAR POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscarPorId(@PathVariable Long id) {
        Optional<Cliente> cliente = clienteRepository.findById(id);
        return cliente.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // CRIAR NOVO
    @PostMapping
    public Cliente criar(@RequestBody Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    // ATUALIZAR
    @PutMapping("/{id}")
    public ResponseEntity<Cliente> atualizar(@PathVariable Long id, @RequestBody Cliente clienteAtualizado) {
        Optional<Cliente> optionalCliente = clienteRepository.findById(id);

        if (optionalCliente.isPresent()) {
            Cliente clienteExistente = optionalCliente.get();
            clienteExistente.setNome(clienteAtualizado.getNome());
            clienteExistente.setTelefone(clienteAtualizado.getTelefone());
            clienteExistente.setEndereco(clienteAtualizado.getEndereco());
            clienteExistente.setEmail(clienteAtualizado.getEmail());
            clienteExistente.setNotas(clienteAtualizado.getNotas());

            clienteRepository.save(clienteExistente);
            return ResponseEntity.ok(clienteExistente);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETAR
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Optional<Cliente> optionalCliente = clienteRepository.findById(id);

        if (optionalCliente.isPresent()) {
            clienteRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
