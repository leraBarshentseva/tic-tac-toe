import { Gem, Sparkles } from 'lucide-react';

const RotatingCube = () => {
  return (
    <div className="relative flex items-center justify-center w-40 h-40 mb-10 mt-4">
      
      {/* 1. Soft Pulse Glow behind */}
      <div className="absolute inset-0 bg-rose-400/20 blur-3xl rounded-full animate-pulse"></div>

      {/* 2. The Diamond */}
      <div className="relative animate-float-gentle z-10">
        <Gem 
          size={80} 
          strokeWidth={1} 
          stroke="url(#rose-gold)" 
          className="drop-shadow-[0_10px_20px_rgba(244,63,94,0.2)]"
          fill="url(#rose-gold-light)"
          fillOpacity="0.2"
        />
        
        {/* 3. Flickering Sparkles attached to the Diamond */}
        <div className="absolute -top-2 -right-2 animate-twinkle">
          <Sparkles size={24} className="text-rose-300 fill-white" />
        </div>
        
        <div className="absolute bottom-2 -left-2 animate-twinkle" style={{ animationDelay: '1.5s' }}>
           <Sparkles size={16} className="text-yellow-200 fill-white" />
        </div>
      </div>
      
    </div>
  );
};

export default RotatingCube;