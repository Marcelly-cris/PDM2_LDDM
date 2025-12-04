## Configurações do env

```
## substituir as configurações de conexão com o banco de dados pelas definidas em sua máquina
DB_USER = "postgres" 
DB_PASSWORD = 123
DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "to_do"
PORT = 5000
JWT_SECRET = "jwt_secret_key"
```
Para criar as tabelas necessárias, cole os comandos SQL encontrados em ./backend/initdb.sql em seu postgre após criar o banco.

## Padrões de Projeto (Design Patterns)

### 1. Padrão Factory Method: Criação Abstrata de Usuários

[cite_start]O **Factory Method** cria objetos sem expor a lógica de criação ao cliente, permitindo escolher a implementação concreta[cite: 19, 20].

#### ⚙️ Aplicação
| Aspecto | Detalhe |
| :--- | :--- |
| **Recurso Criado** | Objeto `User` configurado e pronto para o banco de dados. |
| **Implementação** | [cite_start]A classe `UserFactory` (método `create`) decide qual objeto instanciar (ou, neste caso, como configurar o objeto), ocultando a lógica interna de criação[cite: 29]. |
| **Código (Rota)** | `const newUser = await UserFactory.create(username, password, role);` |

#### ⭐ Benefícios
* [cite_start]**Desacoplamento:** O *endpoint* de registro (`/register`) não precisa saber a lógica complexa de construção do objeto (criptografia, validação de *role*)[cite: 3].
* **Centralização de Lógica:** A validação de *role* e a geração do *hash* de senha estão em um único local (`UserFactory.ts`), facilitando a manutenção.

---

### 2. Estrutura do Código com Padrões

A implementação dos padrões resulta na seguinte separação de responsabilidades:

| Arquivo | Padrão Principal | Função |
| :--- | :--- | :--- |
| **`auth.ts`** | Consumidor | Rota de autenticação; utiliza o objeto da Factory. |
| **`userFactory.ts`** | **Factory Method** | Cria, valida e configura o objeto `User`. |
| **`../db.ts`** | **Singleton** | Gerenciamento da Conexão Única com o DB. |

**Conclusão:** A aplicação desses padrões Criacionais torna o código mais **organizado**, **testável** e **fácil de manter**. [cite_start]A separação da lógica de criação (`UserFactory`) da lógica de negócio (`auth.ts`) promove um sistema mais flexível e desacoplado[cite: 3].