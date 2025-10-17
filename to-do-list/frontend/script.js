const API_URL = "http://localhost:5000";

// === Token JWT ===
function saveToken(token) {
    localStorage.setItem("token", token);
}

function getToken() {
    return localStorage.getItem("token");
}

function clearToken() {
    localStorage.removeItem("token");
}

// ---

// === Requisição autenticada (Revisão Final) ===
async function api(path, method = "GET", body) {
    const token = getToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = "Bearer " + token;

    try {
        const res = await fetch(API_URL + path, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
            const errorData = await res.text();
            console.error(
                `Erro na requisição: ${res.status} ${res.statusText}`,
                errorData
            );

            if (res.status === 401) {
                clearToken();
                window.location.href = "login.html";
            }
            throw new Error(
                `Erro na requisição: ${res.status} ${res.statusText}. Detalhes: ${errorData}`
            );
        }

        // Lógica revisada: Se não for DELETE E houver um corpo JSON esperado
        const contentType = res.headers.get("content-type");
        // Se o status for 204 (No Content) ou se não houver Content-Type, retorna objeto vazio.
        if (res.status === 204 || !contentType || !contentType.includes("application/json")) {
            return {};
        }

        // Se não for o caso acima, tenta retornar o JSON.
        return res.json();

    } catch (err) {
        console.error("Erro na requisição API:", err);
        throw err;
    }
}

// ---

// === DRAG AND DROP COM SORTABLE.JS ===
function enableDragAndDrop() {
    const lists = ["todoList", "inProgressList", "doneList"];

    lists.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;

        new Sortable(el, {
            group: "shared",
            animation: 150,
            onEnd: async (evt) => {
                const taskId = evt.item.dataset.id;
                const newColumn = evt.to.id;

                let status = "todo"; // CORRIGIDO: Era 'todos', agora é 'todo'
                if (newColumn === "inProgressList") status = "in_progress";
                else if (newColumn === "doneList") status = "done";

                console.log(`Tarefa ID: ${taskId} movida para a coluna: ${newColumn}. Novo status: ${status}`);

                try {
                    // Rota corrigida para usar '/todos/'
                    await api(`/todos/${taskId}`, "PUT", { status }); 
                    console.log("Tarefa movida com sucesso!");
                    await loadTasks();
                } catch (err) {
                    console.error("Erro ao atualizar status da tarefa:", err);
                    await loadTasks();
                    alert("Erro ao mover a tarefa. Verifique se a rota PUT /todos/:id está correta no backend.");
                }
            },
        });
    });
}

// ---

// === CARREGAR TAREFAS ===
async function loadTasks() {
    try {
        console.log("Carregando tarefas...");
        // Rota corrigida para usar '/todos'
        const tasks = await api("/todos"); 
        const todoList = document.getElementById("todoList");
        const inProgressList = document.getElementById("inProgressList");
        const doneList = document.getElementById("doneList");

        todoList.innerHTML = "";
        inProgressList.innerHTML = "";
        doneList.innerHTML = "";

        if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
            console.log("Nenhuma tarefa encontrada.");
            return;
        }

        tasks.forEach((task) => {
            const li = document.createElement("li");
            li.textContent = task.task;
            li.dataset.id = task.id;

            // Adiciona a classe CSS correta com base no status
            if (task.status === "in_progress") {
                li.classList.add("in-progress");
            } else if (task.status === "done") {
                li.classList.add("done");
            }

            const delBtn = document.createElement("button");
            delBtn.textContent = "❌";
            delBtn.className = "delete-task";
            // Chave para a exclusão funcionar: a função deleteTask é chamada aqui
            delBtn.onclick = () => deleteTask(task.id);

            li.appendChild(delBtn);

            // Coloca o elemento na lista correta
            if (task.status === "in_progress") {
                inProgressList.appendChild(li);
            } else if (task.status === "done") {
                doneList.appendChild(li);
            } else {
                todoList.appendChild(li);
            }
        });

        applyRoleUI();
    } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
        alert("Erro ao carregar tarefas");
    }
}

// ---

// === ADICIONAR TAREFA ===
async function addTask() {
    const input = document.getElementById("newTask");
    const task = input.value.trim();

    if (!task) {
        console.log("Erro: Tarefa não pode ser vazia");
        alert("A tarefa não pode estar vazia");
        return;
    }

    console.log("Adicionando tarefa:", task);

    try {
        // Rota corrigida para usar '/todos'
        await api("/todos", "POST", { task }); 
        console.log("Tarefa adicionada com sucesso!");

        input.value = "";
        await loadTasks();
    } catch (err) {
        console.error("Erro ao adicionar tarefa:", err);
        alert("Erro ao adicionar tarefa");
    }
}

// ---

// === DELETAR TAREFA (FINAL) ===
async function deleteTask(id) {
    // CONFIRMAÇÃO VISUAL: Adicionei uma confirmação para evitar exclusões acidentais
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) {
        return;
    }

    try {
        // Rota corrigida para usar '/todos/'
        await api(`/todos/${id}`, "DELETE"); 

        console.log(`Tarefa ID ${id} deletada com sucesso.`);

        // Recarrega as tarefas para atualizar a UI
        await loadTasks();
    } catch (err) {
        // Se a exclusão falhar (ex: por permissão 403/404), o erro é capturado aqui
        console.error("Erro ao deletar tarefa:", err);
        alert("Erro ao deletar tarefa. Verifique sua permissão ('administrativo').");
    }
}

// ---

// === APLICAR ROLE NA INTERFACE ===
function applyRoleUI() {
    const token = getToken();
    if (!token) return;

    const payload = parseJwt(token);
    const role = payload?.role;

    console.log("Role do usuário:", role);

    // *** ALTERAÇÃO FEITA AQUI ***
    // O botão de exclusão agora aparece para todos os roles (ou para qualquer um que esteja logado)
    const btns = document.querySelectorAll(".delete-task");
    btns.forEach((btn) => {
        btn.style.display = "inline-block"; // Força o botão a ser visível
    });
    // **************************
}
// ---

// === Decodificar JWT ===
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
        return null;
    }
}

// ---

// === LOGOUT ===
function logout() {
    clearToken();
    window.location.href = "login.html";
}

// === REGISTRAR USUÁRIO ===
async function register() {
    // 1. Coletar os dados
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // **Atenção:** Coletar o valor selecionado do <select>
    const role = document.getElementById('role').value; // Pega 'visualizacao', 'gerencial' ou 'administrativo'

    // 2. Validação básica (evitar campos vazios)
    if (!username || !password || !role) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const userData = {
        username: username,
        password: password,
        role: role // Inclui o nível de acesso
    };

    console.log("Tentando registrar usuário:", userData);

    try {
        // Rota corrigida para usar '/auth/register'
        const result = await api("/auth/register", "POST", userData); 

        // 4. Lidar com o sucesso (o backend deve retornar o usuário ou uma mensagem)
        alert('Usuário registrado com sucesso! Faça login para continuar.');

        // 5. Redirecionar para a tela de login
        window.location.href = 'login.html';

    } catch (error) {
        // 6. Lidar com erros (ex: usuário já existe, erro de servidor, etc.)
        console.error('Erro no registro:', error);
        alert('Falha no registro. Verifique o console para mais detalhes.');
    }
}

// ---

// === Atalhos para eventos de DOM ===
document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const addBtn = document.getElementById("addBtn");
    const newTaskInput = document.getElementById("newTask");
    const goLoginBtn = document.getElementById("goLoginBtn");
    const goRegisterBtn = document.getElementById("goRegisterBtn");

    if (loginBtn) loginBtn.onclick = login;
    if (registerBtn) registerBtn.onclick = register;

    if (logoutBtn) logoutBtn.onclick = logout;
    if (addBtn) addBtn.onclick = addTask;
    if (newTaskInput) {
        newTaskInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") addTask();
        });
    }
    if (goLoginBtn)
        goLoginBtn.onclick = () => (window.location.href = "login.html");
    if (goRegisterBtn)
        goRegisterBtn.onclick = () => (window.location.href = "register.html");

    // Inicializa se na página de tarefas
    if (document.body.classList.contains("kanban-page")) {
        if (!getToken()) {
            window.location.href = "login.html";
        } else {
            loadTasks();
            enableDragAndDrop();
        }
    }
});