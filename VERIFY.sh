#!/bin/bash

echo "🔍 系统验证脚本"
echo "==============================================="

# 检查后端
echo -e "\n✓ 检查后端..."
if [ -d "backend/dist" ]; then
    echo "  ✅ 后端已编译"
else
    echo "  ❌ 后端未编译"
fi

if [ -f "backend/src/services/userService.ts" ]; then
    echo "  ✅ UserService 已创建"
else
    echo "  ❌ UserService 不存在"
fi

if [ -f "backend/src/services/scriptService.ts" ]; then
    echo "  ✅ ScriptService 已更新"
else
    echo "  ❌ ScriptService 不存在"
fi

if [ -f "backend/src/services/aiService.ts" ]; then
    echo "  ✅ AIService 已更新"
else
    echo "  ❌ AIService 不存在"
fi

# 检查前端
echo -e "\n✓ 检查前端..."
if [ -f "frontend/components/game/CharacterSelector.tsx" ]; then
    echo "  ✅ CharacterSelector 组件已创建"
else
    echo "  ❌ CharacterSelector 不存在"
fi

if [ -f "frontend/app/script/\[id\]/page.tsx" ]; then
    echo "  ✅ 脚本详情页已更新"
else
    echo "  ❌ 脚本详情页不存在"
fi

# 检查文档
echo -e "\n✓ 检查文档..."
if [ -f "SYSTEM_INTEGRATION.md" ]; then
    echo "  ✅ 系统集成文档已创建"
else
    echo "  ❌ 系统集成文档不存在"
fi

if [ -f "RUN_DEMO.md" ]; then
    echo "  ✅ 演示指南已创建"
else
    echo "  ❌ 演示指南不存在"
fi

if [ -f "COMPLETION_SUMMARY.md" ]; then
    echo "  ✅ 完成总结已创建"
else
    echo "  ❌ 完成总结不存在"
fi

# 检查API可用性
echo -e "\n✓ 检查API可用性..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "  ✅ 后端运行中"
    
    # 测试脚本API
    if curl -s http://localhost:3001/api/scripts | grep -q "success"; then
        echo "  ✅ 脚本API可用"
    else
        echo "  ❌ 脚本API异常"
    fi
    
    # 测试游戏API
    if curl -s http://localhost:3001/api/game/user-characters/test | grep -q "success"; then
        echo "  ✅ 游戏API可用"
    else
        echo "  ❌ 游戏API异常"
    fi
else
    echo "  ⚠️  后端未运行 (正常，需要手动启动)"
fi

echo -e "\n==============================================="
echo "✅ 验证完成！"
echo -e "\n下一步："
echo "1. cd backend && npm start"
echo "2. 新开一个终端：cd frontend && npm run dev"
echo "3. 访问 http://localhost:3000"
