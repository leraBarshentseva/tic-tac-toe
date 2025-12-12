import { Player, WinResult, Difficulty } from '../types';

export const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export const checkWinner = (board: Player[]): WinResult | null => {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  if (!board.includes(null)) return { winner: 'DRAW' };
  return null;
};

// Generates a random 5-digit alphanumeric promo code
export const generatePromoCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Computer AI
export const getBestMove = (board: Player[], difficulty: Difficulty): number => {
  // 1. Chance to make a random mistake based on difficulty
  const mistakeChance = difficulty === 'easy' ? 0.4 : difficulty === 'medium' ? 0.15 : 0;
  
  if (Math.random() < mistakeChance) {
    const available = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
    return available[Math.floor(Math.random() * available.length)];
  }

  // 2. Try to win immediately
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      const boardCopy = [...board];
      boardCopy[i] = 'O';
      const result = checkWinner(boardCopy);
      if (result && result.winner === 'O') return i;
    }
  }

  // 3. Block player from winning
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      const boardCopy = [...board];
      boardCopy[i] = 'X';
      const result = checkWinner(boardCopy);
      if (result && result.winner === 'X') return i;
    }
  }

  // 4. Take center if available
  if (board[4] === null) return 4;

  // 5. Take corners
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(i => board[i] === null);
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  // 6. Random available move
  const available = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
  return available[Math.floor(Math.random() * available.length)];
};