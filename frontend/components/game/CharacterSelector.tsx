'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface CharacterSelectorProps {
  scriptId: string;
  userId: string;
  script: any;
  onConfirm: (characterMappings: any[]) => void;
  onCancel: () => void;
}

/**
 * 检测文本中的角色变量 ({{角色A}}, {{角色B}} 等)
 */
function detectCharacterVariablesInText(text: string): string[] {
  if (!text) return [];
  
  const regex = /{{(角色[A-Za-z0-9]+)}}/g;
  const matches: string[] = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (!matches.includes(match[1])) {
      matches.push(match[1]);
    }
  }
  
  return matches;
}

/**
 * 检测剧本中是否使用了角色变量
 */
function detectScriptCharacterVariables(script: any): { [key: string]: number } {
  const variables: { [key: string]: number } = {};
  const characterLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  
  // 检测角色池中的变量
  if (script?.角色池) {
    script.角色池.forEach((role: any) => {
      const textToCheck = JSON.stringify(role);
      const found = detectCharacterVariablesInText(textToCheck);
      found.forEach((varName) => {
        if (!variables.hasOwnProperty(varName)) {
          const index = characterLabels.indexOf(varName.substring(2));
          if (index !== -1) {
            variables[varName] = index;
          }
        }
      });
    });
  }
  
  // 检测角色详细设定中的变量
  if (script?.角色详细设定) {
    script.角色详细设定.forEach((detail: any) => {
      const textToCheck = JSON.stringify(detail);
      const found = detectCharacterVariablesInText(textToCheck);
      found.forEach((varName) => {
        if (!variables.hasOwnProperty(varName)) {
          const index = characterLabels.indexOf(varName.substring(2));
          if (index !== -1) {
            variables[varName] = index;
          }
        }
      });
    });
  }
  
  return variables;
}

export default function CharacterSelector({
  scriptId,
  userId,
  script,
  onConfirm,
  onCancel,
}: CharacterSelectorProps) {
  const [userAICharacters, setUserAICharacters] = useState<any[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 单人多AI模式的角色映射：{ scriptCharacterId: selectedAICharacterId }
  const [characterMappings, setCharacterMappings] = useState<Record<string, string>>({});
  // 角色变量映射：{ 角色A: selectedAICharacterId, 角色B: selectedAICharacterId }
  const [variableMappings, setVariableMappings] = useState<Record<string, string>>({});

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // 获取剧本需要的AI角色数量
  const requiredCount = script?.参与AI数 || 1;
  
  // 判断是否为多人剧本（根据剧本类别中是否包含"多人"）
  const isMultiPlayer = script?.剧本类别?.includes('【多人】') || false;
  
  // 判断是否为单人多AI（【单人】【多AI】）
  const isSinglePlayerMultiAI = script?.剧本类别?.includes('【单人】') && script?.剧本类别?.includes('【多AI】');
  
  // 检测剧本是否使用了角色变量
  const characterVariables = detectScriptCharacterVariables(script);
  const hasCharacterVariables = Object.keys(characterVariables).length > 0;
  
  // 多人剧本可以选 1-X 个，单人剧本必须选 X 个
  const minCount = isMultiPlayer ? 1 : requiredCount;
  const maxCount = isMultiPlayer ? 1 : requiredCount;

  // 从脚本中获取需要映射的角色列表（单人多AI模式）
  const scriptCharacters = isSinglePlayerMultiAI ? (script?.角色池 || []) : [];
  const requiredMappings = scriptCharacters.length;
  // 如果使用了角色变量，需要映射的是变量，否则映射脚本角色
  const actualRequiredMappings = hasCharacterVariables ? Object.keys(characterVariables).length : requiredMappings;

  useEffect(() => {
    loadCharacters();
  }, [userId]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${apiUrl}/game/user-characters/${userId}`);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        setUserAICharacters(response.data.data);
      } else {
        setError('未能加载可用的AI角色');
      }
    } catch (error) {
      console.error('Failed to load characters:', error);
      setError('加载角色失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCharacter = (characterId: string) => {
    setSelectedCharacters((prev) => {
      if (prev.includes(characterId)) {
        // 取消选择
        return prev.filter((id) => id !== characterId);
      } else {
        // 选择角色
        if (prev.length < maxCount) {
          return [...prev, characterId];
        }
        return prev;
      }
    });
  };

  // 单人多AI模式：为脚本角色选择对应的AI角色
  const handleScriptCharacterAISelection = (scriptCharacterId: string, aiCharacterId: string) => {
    console.log(`📌 角色映射变更: ${scriptCharacterId} -> ${aiCharacterId}`);
    setCharacterMappings((prev) => {
      const newMappings = { ...prev };
      if (aiCharacterId) {
        newMappings[scriptCharacterId] = aiCharacterId;
      } else {
        delete newMappings[scriptCharacterId];
      }
      console.log(`📌 当前映射:`, newMappings);
      return newMappings;
    });
  };

  const handleConfirm = () => {
    let finalCharacterMappings: any[] = [];

    if (hasCharacterVariables) {
      // 如果使用了角色变量：需要验证所有变量都被映射
      if (Object.keys(variableMappings).length !== actualRequiredMappings) {
        alert(`请为所有 ${actualRequiredMappings} 个角色变量分配AI角色`);
        return;
      }

      // 构建角色映射 - 从角色变量映射转换
      const variableNames = Object.keys(characterVariables).sort((a, b) => characterVariables[a] - characterVariables[b]);
      finalCharacterMappings = variableNames.map((varName, index) => {
        const aiCharacterId = variableMappings[varName];
        const userCharacter = userAICharacters.find((c) => c.id === aiCharacterId);
        
        return {
          userAICharacterId: aiCharacterId,
          scriptRoleId: varName, // 使用变量名作为角色标识
          scriptCharacterName: varName,
          userAICharacterName: userCharacter?.姓名 || '未选择',
          isVariableMapping: true,
        };
      });
    } else if (isSinglePlayerMultiAI) {
      // 单人多AI模式：验证所有脚本角色都被映射
      if (Object.keys(characterMappings).length !== requiredMappings) {
        alert(`请为所有 ${requiredMappings} 个角色分配AI角色`);
        return;
      }

      // 构建角色映射
      finalCharacterMappings = scriptCharacters.map((scriptChar: any) => {
        const aiCharacterId = characterMappings[scriptChar.roleId || scriptChar.id];
        const userCharacter = userAICharacters.find((c) => c.id === aiCharacterId);
        
        return {
          userAICharacterId: aiCharacterId,
          scriptRoleId: scriptChar.roleId || scriptChar.id,
          scriptCharacterName: scriptChar.姓名 || '角色',
          userAICharacterName: userCharacter?.姓名 || '未选择',
        };
      });
    } else if (isMultiPlayer) {
      // 多人多AI模式：用户只能选1个AI角色
      if (selectedCharacters.length !== 1) {
        alert(`多人剧本请选择恰好 1 个AI角色`);
        return;
      }

      const userCharacterId = selectedCharacters[0];
      const userCharacter = userAICharacters.find((c) => c.id === userCharacterId);
      
      finalCharacterMappings = [{
        userAICharacterId: userCharacterId,
        scriptRoleId: 'player-role-0',
        scriptCharacterName: userCharacter?.姓名 || '你',
        userAICharacterName: userCharacter?.姓名,
      }];
    } else {
      // 单人单AI或其他模式：验证选择数量
      if (selectedCharacters.length < minCount) {
        alert(`请至少选择 ${minCount} 个角色`);
        return;
      }

      if (selectedCharacters.length > maxCount) {
        alert(`最多只能选择 ${maxCount} 个角色`);
        return;
      }

      // 构建角色映射
      finalCharacterMappings = selectedCharacters.map((userCharacterId, index) => {
        const userCharacter = userAICharacters.find((c) => c.id === userCharacterId);
        
        return {
          userAICharacterId: userCharacterId,
          scriptRoleId: `player-role-${index}`,
          scriptCharacterName: userCharacter?.姓名 || `角色 ${index + 1}`,
          userAICharacterName: userCharacter?.姓名,
        };
      });
    }

    onConfirm(finalCharacterMappings);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <div className="animate-spin inline-block h-8 w-8 bg-blue-500 rounded-full mb-4"></div>
          <p className="text-gray-300">加载角色中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  const canSelectMore = selectedCharacters.length < maxCount;
  const selectionComplete = hasCharacterVariables
    ? Object.keys(variableMappings).length === actualRequiredMappings
    : isSinglePlayerMultiAI 
    ? Object.keys(characterMappings).length === requiredMappings
    : selectedCharacters.length >= minCount;

  // 单人多AI的进度 / 角色变量的进度
  const mappingProgress = hasCharacterVariables
    ? Object.keys(variableMappings).length
    : Object.keys(characterMappings).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-gray-700"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2">🤖 选择AI角色</h2>
          <p className="text-gray-400 mb-4">
            {isSinglePlayerMultiAI
              ? `这是单人多AI剧本，请为每个剧本角色选择对应的AI角色`
              : isMultiPlayer
              ? `这是多人剧本，请选择恰好 1 个AI角色作为你的角色`
              : `这是单人剧本，请选择恰好 ${requiredCount} 个AI角色参与游戏`}
          </p>

          {/* 已选择的角色数量提示 */}
          <div className="mb-4 p-3 bg-blue-900/20 rounded border border-blue-700/50">
            {hasCharacterVariables ? (
              <p className="text-sm text-blue-300">
                已分配: <span className="font-bold">{mappingProgress}</span> / {actualRequiredMappings} 个角色变量
                {!selectionComplete && <span className="text-yellow-400 ml-2">（还需分配 {actualRequiredMappings - mappingProgress} 个）</span>}
              </p>
            ) : isSinglePlayerMultiAI ? (
              <p className="text-sm text-blue-300">
                已分配: <span className="font-bold">{mappingProgress}</span> / {requiredMappings} 个角色
                {!selectionComplete && <span className="text-yellow-400 ml-2">（还需分配 {requiredMappings - mappingProgress} 个）</span>}
              </p>
            ) : (
              <p className="text-sm text-blue-300">
                已选择: <span className="font-bold">{selectedCharacters.length}</span> / {maxCount} 个角色
                {!selectionComplete && !isMultiPlayer && <span className="text-yellow-400 ml-2">（还需选择 {minCount - selectedCharacters.length} 个）</span>}
              </p>
            )}
          </div>

          {/* 角色变量模式：为每个角色变量选择AI角色 */}
          {hasCharacterVariables && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-4">🎭 请为以下角色变量分配AI角色：</h3>
              <div className="space-y-4 mb-6">
                {Object.keys(characterVariables).sort((a, b) => characterVariables[a] - characterVariables[b]).map((varName) => (
                  <div key={varName} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="mb-3">
                      <h4 className="text-lg font-bold text-purple-300 mb-1">{varName}</h4>
                      <p className="text-sm text-gray-400">请为剧本中的"{varName}"变量选择对应的AI角色</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-300 block mb-2">
                        选择AI角色：
                        {variableMappings[varName] && (
                          <span className="ml-2 text-green-400 font-bold">
                            ✓ {userAICharacters.find(c => c.id === variableMappings[varName])?.姓名}
                          </span>
                        )}
                      </label>
                      <select
                        value={variableMappings[varName] || ''}
                        onChange={(e) => {
                          setVariableMappings((prev) => {
                            const newMappings = { ...prev };
                            if (e.target.value) {
                              newMappings[varName] = e.target.value;
                            } else {
                              delete newMappings[varName];
                            }
                            return newMappings;
                          });
                        }}
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">-- 选择一个AI角色 --</option>
                        {userAICharacters.map((char) => (
                          <option key={char.id} value={char.id}>
                            {char.姓名} (MBTI: {char.MBTI || '未知'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 单人多AI模式：为每个脚本角色选择AI角色 */}
          {!hasCharacterVariables && isSinglePlayerMultiAI && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-4">📋 请为以下角色分配AI角色：</h3>
              <div className="text-xs text-gray-400 mb-2">调试: {scriptCharacters.length} 个脚本角色</div>
              <div className="space-y-4 mb-6">
                {scriptCharacters.map((scriptChar: any, idx: number) => {
                  console.log(`🎭 脚本角色 ${idx}:`, { roleId: scriptChar.roleId || scriptChar.id, name: scriptChar.姓名 });
                  return (
                  <div key={scriptChar.roleId || scriptChar.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="mb-3">
                      <h4 className="text-lg font-bold text-blue-300 mb-1">{scriptChar.姓名}</h4>
                      <p className="text-sm text-gray-400">{scriptChar.角色简介}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-300 block mb-2">
                        选择AI角色：
                        {characterMappings[scriptChar.roleId || scriptChar.id] && (
                          <span className="ml-2 text-green-400 font-bold">
                            ✓ {userAICharacters.find(c => c.id === characterMappings[scriptChar.roleId || scriptChar.id])?.姓名}
                          </span>
                        )}
                      </label>
                      <select
                        value={characterMappings[scriptChar.roleId || scriptChar.id] || ''}
                        onChange={(e) => handleScriptCharacterAISelection(scriptChar.roleId || scriptChar.id, e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">-- 选择一个AI角色 --</option>
                        {userAICharacters.map((char) => (
                          <option key={char.id} value={char.id}>
                            {char.姓名} (MBTI: {char.MBTI || '未知'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 可用的AI角色网格（仅在非单人多AI和非角色变量模式显示） */}
          {!hasCharacterVariables && !isSinglePlayerMultiAI && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">可用的AI角色</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {userAICharacters.map((character: any) => {
                  const isSelected = selectedCharacters.includes(character.id);
                  const canSelect = canSelectMore || isSelected;

                  return (
                    <motion.button
                      key={character.id}
                      whileHover={canSelect ? { scale: 1.05 } : undefined}
                      whileTap={canSelect ? { scale: 0.95 } : undefined}
                      onClick={() => canSelect && handleSelectCharacter(character.id)}
                      disabled={!canSelect}
                      className={`p-4 rounded-lg text-center transition ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 border-2 border-blue-400 text-white shadow-lg shadow-blue-500/50'
                          : canSelect
                          ? 'bg-gray-800 border-2 border-gray-600 text-gray-300 hover:border-gray-500'
                          : 'bg-gray-700 border-2 border-gray-600 text-gray-500 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <p className="font-bold text-sm mb-1">{character.姓名}</p>
                      <p className="text-xs text-gray-300 mb-1">
                        {character.MBTI || '未知'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {character.年龄}岁
                      </p>
                      {isSelected && (
                        <div className="mt-2 text-green-400 font-bold">
                          ✅ 已选择
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {userAICharacters.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">暂无可用的AI角色</p>
                </div>
              )}
            </div>
          )}

          {/* 已选择的角色详情 */}
          {selectedCharacters.length > 0 && !hasCharacterVariables && !isSinglePlayerMultiAI && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-purple-900/20 rounded border border-purple-700/50"
            >
              <h3 className="text-sm font-bold text-purple-300 mb-2">已选择的角色：</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCharacters.map((characterId) => {
                  const character = userAICharacters.find((c) => c.id === characterId);
                  return (
                    <span
                      key={characterId}
                      className="px-3 py-1 bg-purple-600 text-purple-100 rounded-full text-sm"
                    >
                      {character?.姓名}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold transition"
            >
              取消
            </motion.button>
            <motion.button
              whileHover={selectionComplete ? { scale: 1.05 } : undefined}
              whileTap={selectionComplete ? { scale: 0.95 } : undefined}
              onClick={handleConfirm}
              disabled={!selectionComplete}
              className={`flex-1 px-4 py-3 rounded-lg text-white font-bold transition ${
                selectionComplete
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 cursor-pointer'
                  : 'bg-gray-600 cursor-not-allowed opacity-50'
              }`}
            >
              ✅ 开始游戏
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
