"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const scriptService_1 = require("../services/scriptService");
const router = express_1.default.Router();
/**
 * 获取所有剧本
 * GET /api/scripts
 * Query: category?: '【单人】【单AI】' | '【单人】【多AI】' | '【多人】【多AI】'
 */
router.get('/', async (req, res) => {
    const { category } = req.query;
    try {
        let scripts;
        if (category && typeof category === 'string') {
            scripts = await scriptService_1.scriptService.getScriptsByCategory(category);
        }
        else {
            scripts = await scriptService_1.scriptService.getAllScripts();
        }
        res.json({
            success: true,
            data: scripts,
            total: scripts.length,
        });
    }
    catch (error) {
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
router.get('/:scriptId', async (req, res) => {
    const { scriptId } = req.params;
    try {
        const script = await scriptService_1.scriptService.getScriptById(scriptId);
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
    }
    catch (error) {
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
router.get('/:scriptId/characters', async (req, res) => {
    const { scriptId } = req.params;
    try {
        const characters = await scriptService_1.scriptService.getScriptCharacters(scriptId);
        res.json({
            success: true,
            data: characters,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.default = router;
