# CSE Manager

Plataforma para gestão de serviços de refrigeração

## Funcionalidades

*   Autenticação de usuários (Login, Cadastro)
*   Gerenciamento de clientes
*   Agendamento de serviços e agenda
*   Gerenciamento de orçamentos
*   Configurações da aplicação
*   Painel de Controle/Página Inicial

## Tecnologias Utilizadas

**Backend:**
*   Java
*   Spring Boot
*   Spring Security
*   Spring Data JPA
*   Maven
*   MySQL

**Frontend:**
*   JavaScript
*   React
*   React Router
*   Axios
*   Bootstrap
*   Recharts
*   Node.js/npm

## Pré-requisitos

Para construir e executar este projeto, você precisará ter o seguinte instalado:

*   Java JDK 21 ou superior
*   Apache Maven
*   Node.js e npm
*   Servidor MySQL

## Instalação e Configuração

Siga estes passos para colocar o projeto em funcionamento:

### Backend

1.  **Navegue até o diretório do backend:**
    ```bash
    cd backend
    ```
2.  **Configuração do Banco de Dados:**
    *   Certifique-se de que você tem um servidor MySQL em execução.
    *   Crie um banco de dados para a aplicação.
    *   Configure a conexão com o banco de dados em `src/main/resources/application.properties`. Você precisará definir propriedades como `spring.datasource.url`, `spring.datasource.username`, e `spring.datasource.password`.
    *(Observação: Pode ser necessário criar um arquivo `application.properties` se ele não existir, ou modificar um arquivo `application.yml` existente.)*

3.  **Execute a aplicação:**
    ```bash
    ./mvnw spring-boot:run
    ```
    O servidor backend geralmente será iniciado em `http://localhost:8080`.

### Frontend

1.  **Navegue até o diretório do frontend:**
    ```bash
    cd frontend
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm start
    ```
    A aplicação frontend geralmente abrirá automaticamente no seu navegador, frequentemente em `http://localhost:3000`.

4.  **Configuração da API:**
    O frontend está configurado para se conectar à API do backend. Por padrão, ele pode assumir que o backend está rodando em `http://localhost:8080`. Se o seu backend estiver rodando em uma porta ou host diferente, você pode precisar ajustar a configuração do endpoint da API no código do frontend (normalmente em um arquivo como `src/services/api.js` ou um arquivo de configuração).

## Estrutura do Projeto

O projeto está organizado em dois diretórios principais:

*   `backend/`: Contém a aplicação Java Spring Boot que fornece a API e a lógica de negócios.
*   `frontend/`: Contém a aplicação React que fornece a interface do usuário.
