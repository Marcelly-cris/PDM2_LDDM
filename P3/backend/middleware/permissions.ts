import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware"; // importa o tipo correto

const permissions = {
    visualizacao: {
        view: true,
        updateStatus: false,
        create: false,
        delete: false
    },
    gerencial: {
        view: true,
        updateStatus: true,
        create: true,
        delete: false
    },
    administrativo: {
        view: true,
        updateStatus: true,
        create: true,
        delete: true
    }
};

/**
 * Middleware que verifica se o usuário tem permissão para realizar a ação.
 */
export function checkPermission(action: keyof typeof permissions["visualizacao"]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {

        const user = req.user; // agora o TS reconhece

        if (!user || !user.role) {
            return res.status(403).json({ error: "Usuário não autorizado." });
        }

        const role = user.role as keyof typeof permissions;

        if (!permissions[role][action]) {
            return res.status(403).json({ error: "Permissão negada." });
        }

        next();
    };
}
