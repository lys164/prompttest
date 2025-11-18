import express, { Router, Request, Response } from 'express';
import { scriptService } from '../services/scriptService';

const router: Router = express.Router();

/**
 * 获取所有剧本
 * GET /api/scripts
 * Query: category?: '【单人】【单AI】' | '【单人】【多AI】' | '【多人】【多AI】'
 */
router.get('/', async (req: Request, res: Response) => {
    const { category } = req.query;

    try {
        let scripts;
        if (category && typeof category === 'string') {
            scripts = await scriptService.getScriptsByCategory(category);
        } else {
            scripts = await scriptService.getAllScripts();
        }

        res.json({
            success: true,
            data: scripts,
            total: scripts.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * 获取剧本详情
 * GET /api/scripts/:scriptId
 */
router.get('/:scriptId', async (req: Request, res: Response) => {
    const { scriptId } = req.params;

    try {
        const script = await scriptService.getScriptById(scriptId);
        if (!script) {
            return res.status(404).json({
                success: false,
                error: 'Script not found',
            });
        }

        res.json({
            success: true,
            data: script,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * 获取剧本的角色列表
 * GET /api/scripts/:scriptId/characters
 */
router.get('/:scriptId/characters', async (req: Request, res: Response) => {
    const { scriptId } = req.params;

    try {
        const characters = await scriptService.getScriptCharacters(scriptId);

        res.json({
            success: true,
            data: characters,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
