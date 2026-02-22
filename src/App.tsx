/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Timer, Play, RotateCcw, Home, Gamepad2 } from 'lucide-react';
import { useGameLogic } from './useGameLogic';
import { GameMode, GameStatus } from './types';
import { GRID_ROWS, GRID_COLS, COLORS, TEXT_COLORS } from './constants';

export default function App() {
  const {
    grid,
    targetSum,
    score,
    status,
    mode,
    timeLeft,
    selectedIds,
    initGame,
    handleBlockClick,
    setStatus
  } = useGameLogic();

  const currentSelectionSum = selectedIds.reduce((acc, id) => {
    const block = grid.flat().find(b => b?.id === id);
    return acc + (block?.value || 0);
  }, 0);

  return (
    <div className="h-screen h-[100dvh] bg-[#f5f5f5] text-slate-900 font-sans selection:bg-indigo-100 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col h-full max-h-[850px]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-bottom border-slate-100 bg-white z-10">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-xl">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-wider font-bold text-slate-400">Score</p>
                <p className="text-lg sm:text-xl font-black text-slate-800 leading-none">{score}</p>
              </div>
            </div>

            {mode === GameMode.TIME && status === GameStatus.PLAYING && (
              <div className="flex items-center gap-2">
                <div className={`p-1.5 sm:p-2 rounded-xl transition-colors ${timeLeft <= 3 ? 'bg-rose-50' : 'bg-amber-50'}`}>
                  <Timer className={`w-4 h-4 sm:w-5 sm:h-5 ${timeLeft <= 3 ? 'text-rose-600 animate-pulse' : 'text-amber-600'}`} />
                </div>
                <div>
                  <p className="text-[8px] sm:text-[10px] uppercase tracking-wider font-bold text-slate-400">Time</p>
                  <p className={`text-lg sm:text-xl font-black leading-none ${timeLeft <= 3 ? 'text-rose-600' : 'text-amber-600'}`}>{timeLeft}s</p>
                </div>
              </div>
            )}

            <button 
              onClick={() => setStatus(GameStatus.MENU)}
              className="p-1.5 sm:p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <AnimatePresence>
            {status !== GameStatus.MENU && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col items-center justify-center py-1 sm:py-2 overflow-hidden"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-0.5 sm:mb-1">Target Sum</p>
                <div className="relative">
                  <motion.div 
                    key={targetSum}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl sm:text-6xl font-black text-indigo-600 tabular-nums"
                  >
                    {targetSum}
                  </motion.div>
                  {currentSelectionSum > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    >
                      <span className="text-sm font-bold text-slate-400">
                        Current: <span className={currentSelectionSum > targetSum ? 'text-rose-500' : 'text-indigo-400'}>{currentSelectionSum}</span>
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Game Area */}
        <div className="flex-1 relative bg-slate-50/50 overflow-y-auto">
          <AnimatePresence mode="wait">
            {status === GameStatus.MENU && (
              <motion.div 
                key="menu"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="min-h-full flex flex-col items-center justify-center bg-white p-6 sm:p-8"
              >
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200">
                    <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">Ryan's Sum Blast</h1>
                  <p className="text-slate-500 text-sm">Combine numbers to reach the target sum.</p>
                </div>

                <div className="w-full space-y-3 max-w-[280px] pb-8">
                  <button 
                    onClick={() => initGame(GameMode.CLASSIC)}
                    className="w-full group relative overflow-hidden bg-slate-900 text-white p-4 sm:p-5 rounded-2xl font-bold flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Play className="w-5 h-5 fill-current" />
                      <div className="text-left">
                        <p className="text-base sm:text-lg leading-none">Classic Mode</p>
                        <p className="text-[8px] sm:text-[10px] opacity-60 uppercase tracking-wider mt-1">Survival Challenge</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => initGame(GameMode.TIME)}
                    className="w-full group relative overflow-hidden bg-white border-2 border-slate-900 text-slate-900 p-4 sm:p-5 rounded-2xl font-bold flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <div className="flex items-center gap-3">
                      <Timer className="w-5 h-5" />
                      <div className="text-left">
                        <p className="text-base sm:text-lg leading-none">Time Mode</p>
                        <p className="text-[8px] sm:text-[10px] opacity-60 uppercase tracking-wider mt-1">Beat the Clock</p>
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {status === GameStatus.PLAYING && (
              <motion.div 
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 h-full"
              >
                {/* Grid */}
                <div 
                  className="grid gap-2 h-full"
                  style={{ 
                    gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`
                  }}
                >
                  {grid.map((row, r) => (
                    row.map((block, c) => (
                      <div key={`${r}-${c}`} className="relative w-full h-full">
                        <AnimatePresence>
                          {block && (
                            <motion.button
                              layoutId={block.id}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ 
                                scale: 1, 
                                opacity: 1,
                                y: 0 
                              }}
                              exit={{ scale: 0, opacity: 0 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleBlockClick(block.id)}
                              className={`
                                absolute inset-0 rounded-xl flex items-center justify-center text-2xl font-black shadow-sm transition-all
                                ${selectedIds.includes(block.id) 
                                  ? 'ring-4 ring-indigo-500 ring-offset-2 scale-105 z-10' 
                                  : 'hover:brightness-105'}
                                ${COLORS[block.value]} ${TEXT_COLORS[block.value]}
                              `}
                            >
                              {block.value}
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  ))}
                </div>
              </motion.div>
            )}

            {status === GameStatus.GAMEOVER && (
              <motion.div 
                key="gameover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-rose-500/95 backdrop-blur-md text-white p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="mb-6"
                >
                  <Trophy className="w-20 h-20 mx-auto opacity-50 mb-4" />
                  <h2 className="text-5xl font-black mb-2">GAME OVER</h2>
                  <p className="text-rose-100 font-medium">You reached the top!</p>
                </motion.div>

                <div className="bg-white/20 rounded-2xl p-6 mb-8 w-full max-w-[240px]">
                  <p className="text-xs uppercase tracking-widest font-bold opacity-80 mb-1">Final Score</p>
                  <p className="text-4xl font-black">{score}</p>
                </div>

                <button 
                  onClick={() => initGame(mode)}
                  className="flex items-center gap-2 bg-white text-rose-600 px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-transform"
                >
                  <RotateCcw className="w-5 h-5" />
                  TRY AGAIN
                </button>
                <button 
                  onClick={() => setStatus(GameStatus.MENU)}
                  className="mt-4 text-rose-100 font-bold hover:underline"
                >
                  Back to Menu
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
            {mode === GameMode.CLASSIC ? 'Classic: Add row on success' : 'Time: Add row every 10s'}
          </p>
        </div>
      </div>
    </div>
  );
}
