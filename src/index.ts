import { Router } from 'express';
import { Chalk } from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';

interface PluginInfo {
    id: string;
    name: string;
    description: string;
}

interface Plugin {
    init: (router: Router) => Promise<void>;
    exit: () => Promise<void>;
    info: PluginInfo;
}

const chalk = new Chalk();
const MODULE_NAME = '[KV-Cache-Manager-Plugin]';

// Директория сохранений из переменной окружения
const SAVES_DIRECTORY = process.env.KV_SAVE_DIR;

/**
 * Initialize the plugin.
 * @param router Express Router
 */
export async function init(router: Router): Promise<void> {
    if (!SAVES_DIRECTORY) {
        console.error(chalk.red(MODULE_NAME), 'Plugin cannot be initialized: KV_SAVE_DIR is not set');
        throw new Error('KV_SAVE_DIR environment variable is required');
    }

    // Проверяем существование директории
    try {
        await fs.access(SAVES_DIRECTORY);
        console.log(chalk.green(MODULE_NAME), `Saves directory: ${SAVES_DIRECTORY}`);
    } catch (error) {
        console.error(chalk.red(MODULE_NAME), `Saves directory does not exist: ${SAVES_DIRECTORY}`);
        throw new Error(`Saves directory does not exist: ${SAVES_DIRECTORY}`);
    }

    // Эндпоинт для получения списка файлов
    router.get('/files', async (_req, res) => {
        try {
            const files = await fs.readdir(SAVES_DIRECTORY);
            const fileList = await Promise.all(
                files.map(async (file) => {
                    const filePath = path.join(SAVES_DIRECTORY, file);
                    const stats = await fs.stat(filePath);
                    return {
                        name: file,
                        size: stats.size,
                        modified: stats.mtime.toISOString(),
                        isDirectory: stats.isDirectory(),
                    };
                })
            );
            return res.json({ files: fileList });
        } catch (error) {
            console.error(chalk.red(MODULE_NAME), 'Failed to list files', error);
            return res.status(500).json({ error: 'Failed to list files' });
        }
    });

    // Эндпоинт для удаления файла
    router.delete('/files/:filename', async (req, res) => {
        try {
            const { filename } = req.params;
            
            // Защита от path traversal атак
            const safeFilename = path.basename(filename);
            const filePath = path.join(SAVES_DIRECTORY, safeFilename);
            
            // Проверяем, что файл находится в директории сохранений
            const resolvedPath = path.resolve(filePath);
            const resolvedSavesDir = path.resolve(SAVES_DIRECTORY);
            
            if (!resolvedPath.startsWith(resolvedSavesDir)) {
                return res.status(403).json({ error: 'Access denied' });
            }

            // Проверяем существование файла
            try {
                await fs.access(filePath);
            } catch {
                return res.status(404).json({ error: 'File not found' });
            }

            // Удаляем файл
            await fs.unlink(filePath);
            console.log(chalk.yellow(MODULE_NAME), `File deleted: ${safeFilename}`);
            return res.json({ success: true, message: `File ${safeFilename} deleted successfully` });
        } catch (error) {
            console.error(chalk.red(MODULE_NAME), 'Failed to delete file', error);
            return res.status(500).json({ error: 'Failed to delete file' });
        }
    });

    console.log(chalk.green(MODULE_NAME), 'Plugin loaded!');
}

export async function exit(): Promise<void> {
    console.log(chalk.yellow(MODULE_NAME), 'Plugin exited');
}

export const info: PluginInfo = {
    id: 'kv-cache-manager',
    name: 'KV Cache Manager',
    description: 'Plugin for managing saved files: list and delete operations.',
};

const plugin: Plugin = {
    init,
    exit,
    info,
};

export default plugin;
