import { useState, useEffect, useCallback, useRef } from 'react';
import { GameMode, GameStatus, BlockData } from './types';
import { GRID_ROWS, GRID_COLS, INITIAL_ROWS, MAX_NUMBER, MIN_NUMBER, TIME_LIMIT } from './constants';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createBlock = (row: number, col: number): BlockData => ({
  id: generateId(),
  value: Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER,
  row,
  col,
  isSelected: false,
});

export const useGameLogic = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [mode, setMode] = useState<GameMode>(GameMode.CLASSIC);
  const [grid, setGrid] = useState<(BlockData | null)[][]>([]);
  const [targetSum, setTargetSum] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateTargetSum = useCallback((currentGrid: (BlockData | null)[][]) => {
    const flatBlocks = currentGrid.flat().filter((b): b is BlockData => b !== null);
    if (flatBlocks.length === 0) return 10;
    
    // Pick 2-4 random blocks to form a sum
    const numToPick = Math.min(flatBlocks.length, Math.floor(Math.random() * 3) + 2);
    const shuffled = [...flatBlocks].sort(() => 0.5 - Math.random());
    const sum = shuffled.slice(0, numToPick).reduce((acc, b) => acc + b.value, 0);
    return sum;
  }, []);

  const initGame = (selectedMode: GameMode) => {
    const newGrid: (BlockData | null)[][] = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));
    
    // Fill bottom rows
    for (let r = GRID_ROWS - INITIAL_ROWS; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        newGrid[r][c] = createBlock(r, c);
      }
    }
    
    setGrid(newGrid);
    setTargetSum(generateTargetSum(newGrid));
    setScore(0);
    setStatus(GameStatus.PLAYING);
    setMode(selectedMode);
    setTimeLeft(TIME_LIMIT);
    setSelectedIds([]);
  };

  const checkGameOver = (currentGrid: (BlockData | null)[][]) => {
    // If any block is in the top row
    return currentGrid[0].some(cell => cell !== null);
  };

  const addRow = useCallback(() => {
    setGrid(prev => {
      if (checkGameOver(prev)) {
        setStatus(GameStatus.GAMEOVER);
        return prev;
      }

      const newGrid = prev.map((row, r) => {
        if (r === 0) return row; // Top row will be lost if full
        return prev[r];
      });

      // Shift everything up
      for (let r = 0; r < GRID_ROWS - 1; r++) {
        newGrid[r] = prev[r + 1].map(block => block ? { ...block, row: r } : null);
      }

      // Add new row at bottom
      newGrid[GRID_ROWS - 1] = Array(GRID_COLS).fill(null).map((_, c) => createBlock(GRID_ROWS - 1, c));

      if (checkGameOver(newGrid)) {
        setStatus(GameStatus.GAMEOVER);
      }

      return newGrid;
    });
    setTimeLeft(TIME_LIMIT);
  }, []);

  const handleBlockClick = (id: string) => {
    if (status !== GameStatus.PLAYING) return;

    setSelectedIds(prev => {
      const isAlreadySelected = prev.includes(id);
      const next = isAlreadySelected ? prev.filter(i => i !== id) : [...prev, id];
      
      // Calculate current sum
      const currentSum = next.reduce((acc, selectedId) => {
        const block = grid.flat().find(b => b?.id === selectedId);
        return acc + (block?.value || 0);
      }, 0);

      if (currentSum === targetSum) {
        // Success!
        setTimeout(() => eliminateBlocks(next), 100);
        return [];
      } else if (currentSum > targetSum) {
        // Over sum, reset selection
        return [];
      }

      return next;
    });
  };

  const eliminateBlocks = (ids: string[]) => {
    setGrid(prev => {
      const newGrid = prev.map(row => row.map(block => (block && ids.includes(block.id) ? null : block)));
      
      // Apply gravity
      for (let c = 0; c < GRID_COLS; c++) {
        const colBlocks = [];
        for (let r = GRID_ROWS - 1; r >= 0; r--) {
          if (newGrid[r][c]) colBlocks.push(newGrid[r][c]);
        }
        
        for (let r = GRID_ROWS - 1; r >= 0; r--) {
          const block = colBlocks[GRID_ROWS - 1 - r];
          if (block) {
            newGrid[r][c] = { ...block, row: r, col: c };
          } else {
            newGrid[r][c] = null;
          }
        }
      }

      setScore(s => s + ids.length * 10);
      setTargetSum(generateTargetSum(newGrid));
      
      if (mode === GameMode.CLASSIC) {
        // In classic mode, adding a row is triggered by success or periodically?
        // Reference says "每次成功凑出目标数字，底部新增一行方块"
        setTimeout(addRow, 300);
      }

      return [...newGrid];
    });
  };

  // Time mode logic
  useEffect(() => {
    if (status === GameStatus.PLAYING && mode === GameMode.TIME) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            addRow();
            return TIME_LIMIT;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, mode, addRow]);

  return {
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
  };
};
