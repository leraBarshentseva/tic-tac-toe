import React from 'react';
import { Player, GameTheme } from '../types';
import { Flower2, Gem, Heart, Star, Cat, Fish } from 'lucide-react';

interface SquareProps {
  value: Player;
  onClick: () => void;
  disabled: boolean;
  theme: GameTheme;
}

const Square: React.FC<SquareProps> = ({ value, onClick, disabled, theme }) => {
  
  const getIcon = () => {
    if (!value) return null;
    
    switch (theme) {
      case 'hearts':
        return value === 'X' 
          ? <Heart size={52} className="text-rose-500 drop-shadow-md fill-rose-500" />
          : <Star size={48} className="text-yellow-400 drop-shadow-md fill-yellow-200" />;
      case 'cats':
        return value === 'X'
          ? <Cat size={52} className="text-slate-700 drop-shadow-md" strokeWidth={1.5} />
          : <Fish size={48} className="text-blue-400 drop-shadow-md" strokeWidth={1.5} />;
      case 'flowers':
      default:
        return value === 'X'
          ? <Flower2 size={52} className="text-rose-500 drop-shadow-md filter" strokeWidth={1.5} />
          : <Gem size={48} className="text-slate-400 drop-shadow-md" strokeWidth={1.5} />;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden
        w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28
        rounded-2xl flex items-center justify-center
        transition-all duration-500 ease-out
        border border-white/60
        backdrop-blur-md
        ${!value && !disabled 
          ? 'bg-white/40 hover:bg-white/70 hover:scale-105 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer' 
          : 'bg-white/20'}
        ${disabled && !value ? 'cursor-default opacity-50' : ''}
        ${value ? 'bg-white/60 shadow-inner' : ''}
      `}
    >
      {/* Glossy reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-transparent opacity-50 pointer-events-none"></div>

      <span className={`
        relative z-10 transform transition-all duration-500
        ${value ? 'animate-pop scale-100 opacity-100' : 'scale-0 opacity-0'}
      `}>
        {getIcon()}
      </span>
    </button>
  );
};

export default Square;