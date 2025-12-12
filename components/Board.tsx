import Square from './Square';
import { Player, GameTheme } from '../types';

interface BoardProps {
  board: Player[];
  onSquareClick: (index: number) => void;
  disabled: boolean;
  theme: GameTheme;
  winningLine?: number[] | null;
}

const Board = ({ board, onSquareClick, disabled, theme, winningLine }: BoardProps) => {
  
  // Calculate SVG line coordinates based on winning indices
  const getLineCoordinates = () => {
    if (!winningLine) return null;
    
    // Grid logic: 0,1,2 (Row 1), 3,4,5 (Row 2), etc.
    const startIdx = winningLine[0];
    const endIdx = winningLine[2];
    
    // Map index to % position (center of square)
    // Col: 0->16.6%, 1->50%, 2->83.3%
    // Row: 0->16.6%, 1->50%, 2->83.3%
    const getPos = (idx: number) => ({
      x: (idx % 3) * 33.33 + 16.66,
      y: Math.floor(idx / 3) * 33.33 + 16.66
    });

    const start = getPos(startIdx);
    const end = getPos(endIdx);

    return { x1: `${start.x}%`, y1: `${start.y}%`, x2: `${end.x}%`, y2: `${end.y}%` };
  };

  const lineCoords = getLineCoordinates();

  return (
    <div className="relative p-5 bg-white/20 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_8px_32px_0_rgba(255,255,255,0.3)]">
      <div className="grid grid-cols-3 gap-3 sm:gap-4 relative z-10">
        {board.map((value, i) => (
          <Square
            key={i}
            value={value}
            onClick={() => onSquareClick(i)}
            disabled={disabled || value !== null}
            theme={theme}
          />
        ))}
      </div>

      {/* Winning Line Overlay */}
      {lineCoords && (
        <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none p-5">
           <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <line 
            x1={lineCoords.x1} 
            y1={lineCoords.y1} 
            x2={lineCoords.x2} 
            y2={lineCoords.y2} 
            stroke="#fb7185" 
            strokeWidth="8" 
            strokeLinecap="round"
            className="animate-draw-line"
            filter="url(#glow)"
            style={{ 
              strokeDasharray: 400, 
              strokeDashoffset: 400,
              animation: 'dash 0.6s ease-out forwards' 
            }}
          />
        </svg>
      )}
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default Board;