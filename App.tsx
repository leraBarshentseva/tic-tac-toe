import { useState, useEffect, useCallback } from 'react';
import { Settings, Flower2, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import Board from './components/Board';
import SettingsModal from './components/SettingsModal';
import GameResultModal from './components/GameResultModal';
import FluidBackground from './components/FluidBackground';
import RotatingCube from './components/RotatingCube';
import { GameStatus, Player, AppSettings, WinResult } from './types';
import { checkWinner, generatePromoCode, getBestMove } from './utils/gameLogic';
import { sendTelegramMessage } from './services/telegram';
import { playSound } from './utils/audio';

const DEFAULT_SETTINGS: AppSettings = {
  telegram: { botToken: '', chatId: '' },
  difficulty: 'medium',
  theme: 'flowers',
  soundEnabled: true,
  hapticsEnabled: true,
};

function App() {
  // Game State
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [winResult, setWinResult] = useState<WinResult | null>(null);
  const [promoCode, setPromoCode] = useState<string | undefined>(undefined);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  
  // App State
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Load settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };

  // Haptics Helper
  const triggerHaptic = (pattern: number | number[]) => {
    if (settings.hapticsEnabled && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const startNewGame = useCallback(() => {
    if (settings.soundEnabled) playSound.start();
    setBoard(Array(9).fill(null));
    setStatus(GameStatus.PLAYING);
    setWinResult(null);
    setPromoCode(undefined);
    setCurrentPlayer('X');
    setIsSending(false);
  }, [settings.soundEnabled]);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#fb7185', '#f43f5e', '#fda4af', '#fff1f2']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#fb7185', '#f43f5e', '#fda4af', '#fff1f2']
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  const handleGameEnd = useCallback(async (result: WinResult) => {
    setWinResult(result);
    let newStatus: GameStatus;
    let code: string | undefined;
    let message = '';

    if (result.winner === 'X') {
      newStatus = GameStatus.WON;
      code = generatePromoCode();
      setPromoCode(code);
      message = `Победа! Промокод: ${code}`;
      triggerConfetti();
      if (settings.soundEnabled) playSound.win();
      triggerHaptic([100, 50, 100, 50, 200]);
    } else if (result.winner === 'O') {
      newStatus = GameStatus.LOST;
      message = 'Проигрыш';
      if (settings.soundEnabled) playSound.loss();
      triggerHaptic(400);
    } else {
      newStatus = GameStatus.DRAW;
      message = 'Ничья';
      if (settings.soundEnabled) playSound.draw();
      triggerHaptic([50, 50]);
    }

    setStatus(newStatus);

    if (settings.telegram.botToken && settings.telegram.chatId) {
      setIsSending(true);
      await sendTelegramMessage(settings.telegram, message);
      setIsSending(false);
    }
  }, [settings]);

  // Game Loop
  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;

    const result = checkWinner(board);
    if (result) {
      handleGameEnd(result);
      return;
    }

    if (currentPlayer === 'O') {
      const timer = setTimeout(() => {
        const move = getBestMove(board, settings.difficulty);
        const newBoard = [...board];
        newBoard[move] = 'O';
        setBoard(newBoard);
        if (settings.soundEnabled) playSound.click();
        setCurrentPlayer('X');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [board, currentPlayer, status, handleGameEnd, settings.difficulty, settings.soundEnabled]);

  const handleSquareClick = (index: number) => {
    if (board[index] || status !== GameStatus.PLAYING || currentPlayer !== 'X') return;

    if (settings.soundEnabled) playSound.click();
    triggerHaptic(20);

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setCurrentPlayer('O');
  };

  return (
    <div className="min-h-screen bg-[#fff1f2] flex flex-col items-center justify-center p-4 font-sans text-gray-800 relative overflow-hidden selection:bg-rose-200">
      
      {/* High-end Fluid Simulation Background */}
      <FluidBackground />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
           <h1 className="text-3xl font-handwriting font-bold text-rose-900 tracking-wide drop-shadow-sm mix-blend-multiply">Крестики-Нолики</h1>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 text-rose-500 hover:text-rose-600 bg-white/40 hover:bg-white/70 rounded-full transition-all duration-300 shadow-sm backdrop-blur-md"
          title="Настройки"
        >
          <Settings size={22} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center w-full max-w-lg z-10">
        
        <div className="text-center mb-6 space-y-3">
          {/* Decorative Separator */}
          <div className="flex items-center justify-center gap-3 mb-4 opacity-70">
             <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-rose-400"></div>
             <Heart size={16} className="text-rose-400 fill-rose-200 animate-pulse" />
             <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-rose-400"></div>
          </div>

          <h2 className="text-5xl md:text-6xl font-handwriting font-bold text-gray-900 leading-tight pb-2 mix-blend-multiply">
            Играй и <span className="relative inline-block animate-shimmer-text">
              Побеждай
            </span>
          </h2>
        </div>

        {/* Game Area */}
        <div className="relative mt-2">
          {/* Glow effect behind board */}
          <div className="absolute -inset-4 bg-white/40 rounded-[40px] blur-xl opacity-60 animate-pulse-slow"></div>
          
          <Board 
            board={board} 
            onSquareClick={handleSquareClick} 
            disabled={status !== GameStatus.PLAYING || currentPlayer === 'O'}
            theme={settings.theme}
            winningLine={winResult?.line}
          />
          
          {/* Start Overlay if IDLE */}
          {status === GameStatus.IDLE && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[6px] rounded-3xl flex flex-col items-center justify-center z-10 animate-fade-in transition-all duration-500">
              
              {/* The New 3D Rotating Cube */}
              <RotatingCube />
              
              <button 
                onClick={startNewGame}
                className="group relative px-12 py-4 bg-gradient-to-r from-rose-500 to-rose-400 text-white rounded-full shadow-[0_10px_20px_rgba(244,63,94,0.3)] text-xl font-handwriting font-bold tracking-wide hover:shadow-[0_15px_30px_rgba(244,63,94,0.4)] transition-all duration-300 animate-heartbeat"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Начать игру
                  <Heart size={18} className="fill-white/20 group-hover:fill-white transition-colors" />
                </span>
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
            </div>
          )}
        </div>

        {/* Status Text */}
        <div className="mt-8 h-8 flex items-center justify-center">
            {status === GameStatus.PLAYING && (
                <div className="flex items-center gap-2 text-rose-800/80 font-handwriting text-2xl animate-pulse bg-white/30 px-6 py-2 rounded-full backdrop-blur-sm border border-white/20 shadow-sm">
                  {currentPlayer === 'X' ? (
                    <>Ваш ход <Flower2 size={20} className="inline animate-spin-slow" /></>
                  ) : (
                    <>Компьютер думает...</>
                  )}
                </div>
            )}
        </div>

      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentSettings={settings}
      />

      <GameResultModal 
        status={status}
        promoCode={promoCode}
        onReset={startNewGame}
        sendingToTelegram={isSending}
      />

      <footer className="absolute bottom-4 text-center w-full text-rose-900/40 text-lg font-handwriting mix-blend-multiply">
        Сделано с любовью © 2025
      </footer>
    </div>
  );
}

export default App;