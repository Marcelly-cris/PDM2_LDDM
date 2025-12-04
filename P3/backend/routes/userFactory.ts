// userFactory.ts

import bcrypt from 'bcryptjs';

/**
 * Interface que define o formato do objeto de usuário retornado pela Factory.
 * Isso garante a segurança de tipos no resto da aplicação.
 */
interface NewUser {
    username: string;
    passwordHash: string;
    role: 'administrativo' | 'gerencial' | 'visualizacao';
}

/**
 * UserFactory
 * Centraliza a lógica para criar e configurar um novo objeto usuário.
 */
class UserFactory {
    private static readonly ALLOWED_ROLES = ['administrativo', 'gerencial', 'visualizacao'];
    private static readonly DEFAULT_ROLE = 'visualizacao';
    private static readonly SALT_ROUNDS = 10;

    /**
     * Cria um objeto de usuário pronto para ser inserido no banco de dados.
     * @param username Nome de usuário.
     * @param password Senha fornecida pelo cliente.
     * @param requestedRole A role que o cliente está tentando registrar.
     * @returns O objeto do usuário, tipado como NewUser.
     */
    public static async create(username: string, password: string, requestedRole?: string): Promise<NewUser> {
        
        // 1. Lógica Condicional: Define e valida a role
        const userRole = (requestedRole && UserFactory.ALLOWED_ROLES.includes(requestedRole))
            ? requestedRole as NewUser['role']
            : UserFactory.DEFAULT_ROLE; 

        // 2. Lógica Complexa: Criptografa a senha
        const hash = await bcrypt.hash(password, UserFactory.SALT_ROUNDS);

        // Retorna o objeto completo do usuário, validado pela interface NewUser
        return {
            username: username,
            passwordHash: hash,
            role: userRole
        };
    }
}

export default UserFactory;