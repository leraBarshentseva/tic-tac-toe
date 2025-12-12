import { useState } from 'react';
import { GameStatus } from '../types';
import { X, Gift, RotateCcw, Copy, Check } from 'lucide-react';

interface GameResultModalProps {
  status: GameStatus;
  promoCode?: string;
  onReset: () => void;
  sendingToTelegram: boolean;
}

const GameResultModal = ({ status, promoCode, onReset, sendingToTelegram }: GameResultModalProps) => {
  const [copied, setCopied] = useState(false);

  if (status === GameStatus.PLAYING || status === GameStatus.IDLE) return null;

  const isWin = status === GameStatus.WON;
  const isLoss = status === GameStatus.LOST;

  const handleCopy = () => {
    if (promoCode) {
      navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-rose-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white/95 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center relative border-4 border-white ring-1 ring-rose-100">
        
        {/* Close Button */}
        <button 
          onClick={onReset}
          className="absolute top-4 right-4 text-gray-400 hover:text-rose-500 transition-colors p-1"
        >
          <X size={24} />
        </button>

        {/* Icon Header */}
        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl transform -translate-y-1/2 absolute -top-4 left-1/2 -ml-10 bg-white ring-4 ring-rose-50">
           {isWin ? (
             <div className="w-full h-full rounded-full bg-rose-400 flex items-center justify-center text-white">
                <Gift size={32} />
             </div>
           ) : (
             <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <RotateCcw size={32} />
             </div>
           )}
        </div>

        <div className="mt-8">
            <h2 className="text-4xl font-handwriting font-bold text-gray-800 mb-2">
            {isWin ? 'Поздравляем!' : isLoss ? 'Увы!' : 'Ничья'}
            </h2>
            
            <p className="text-gray-600 mb-6 font-light leading-relaxed font-sans">
            {isWin 
                ? "Вы великолепно сыграли! Вот ваш эксклюзивный подарок." 
                : isLoss 
                ? "В этот раз удача на стороне компьютера. Попробуем еще раз?" 
                : "Силы оказались равны. Достойная игра!"}
            </p>

            {/* Promo Code Section */}
            {isWin && promoCode && (
            <div 
                onClick={handleCopy}
                className="bg-rose-50 border-2 border-rose-200 border-dashed rounded-xl p-4 mb-6 relative group cursor-pointer hover:bg-rose-100 transition-colors"
            >
                <p className="text-[10px] uppercase tracking-[0.2em] text-rose-400 font-bold mb-1 font-sans">Ваш промокод</p>
                <div className="flex items-center justify-center gap-3">
                    <p className="text-3xl font-mono text-gray-800 font-bold tracking-wider">{promoCode}</p>
                    {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="text-rose-300 group-hover:text-rose-500" />}
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity font-sans">
                    Нажмите, чтобы скопировать
                </div>
            </div>
            )}

            {/* Action Button - Hidden on Win as per requirements */}
            {!isWin && (
              <button
              onClick={onReset}
              className="w-full py-4 px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-lg font-handwriting transition-all transform hover:scale-[1.02] shadow-xl hover:shadow-2xl active:scale-95"
              >
                Попробовать снова
              </button>
            )}

            {sendingToTelegram && (
                <p className="text-xs text-rose-400 mt-4 animate-pulse font-medium font-sans">Синхронизация с Telegram...</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default GameResultModal;