import { useState, useEffect } from 'react';
import { AppSettings, Difficulty, GameTheme } from '../types';
import { Settings, X, Volume2, VolumeX, Smartphone, Zap } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
  currentSettings: AppSettings;
}

const SettingsModal = ({ isOpen, onClose, onSave, currentSettings }: SettingsModalProps) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(currentSettings);

  useEffect(() => {
    setLocalSettings(currentSettings);
  }, [currentSettings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const updateTelegram = (key: 'botToken' | 'chatId', val: string) => {
    setLocalSettings(prev => ({
      ...prev,
      telegram: { ...prev.telegram, [key]: val }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-2 mb-6 text-rose-900">
          <Settings className="w-6 h-6" />
          <h2 className="text-3xl font-handwriting font-bold">Настройки</h2>
        </div>

        <div className="space-y-6">
          
          {/* Game Options */}
          <section className="space-y-3">
             <h3 className="font-bold text-gray-700 font-sans text-sm uppercase tracking-wider">Игра</h3>
             
             {/* Difficulty */}
             <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map(level => (
                  <button
                    key={level}
                    onClick={() => setLocalSettings(s => ({ ...s, difficulty: level }))}
                    className={`py-2 px-1 rounded-lg text-sm font-medium capitalize transition-all border ${
                      localSettings.difficulty === level 
                      ? 'bg-rose-100 border-rose-300 text-rose-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {level === 'easy' ? 'Легко' : level === 'medium' ? 'Средне' : 'Сложно'}
                  </button>
                ))}
             </div>

             {/* Theme */}
             <div className="flex gap-2 justify-between">
                {(['flowers', 'hearts', 'cats'] as GameTheme[]).map(theme => (
                   <button
                    key={theme}
                    onClick={() => setLocalSettings(s => ({ ...s, theme: theme }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all border flex items-center justify-center gap-1 ${
                      localSettings.theme === theme 
                      ? 'bg-rose-100 border-rose-300 text-rose-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {theme === 'flowers' && '🌸'}
                    {theme === 'hearts' && '❤️'}
                    {theme === 'cats' && '🐱'}
                    <span className="hidden sm:inline">
                        {theme === 'flowers' ? 'Цветы' : theme === 'hearts' ? 'Любовь' : 'Котики'}
                    </span>
                  </button>
                ))}
             </div>
          </section>

          {/* Effects */}
          <section className="space-y-3">
            <h3 className="font-bold text-gray-700 font-sans text-sm uppercase tracking-wider">Эффекты</h3>
            <div className="flex gap-4">
               <button 
                 onClick={() => setLocalSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
                 className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${localSettings.soundEnabled ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
               >
                 {localSettings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                 <span>Звук</span>
               </button>
               
               <button 
                 onClick={() => setLocalSettings(s => ({ ...s, hapticsEnabled: !s.hapticsEnabled }))}
                 className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${localSettings.hapticsEnabled ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
               >
                 {localSettings.hapticsEnabled ? <Zap size={20} /> : <Smartphone size={20} />}
                 <span>Вибрация</span>
               </button>
            </div>
          </section>

          {/* Telegram */}
          <section className="space-y-3 border-t pt-4">
            <h3 className="font-bold text-gray-700 font-sans text-sm uppercase tracking-wider flex items-center gap-2">
                Telegram (Опционально)
            </h3>
            <div className="space-y-2">
                <input 
                type="text" 
                value={localSettings.telegram.botToken}
                onChange={(e) => updateTelegram('botToken', e.target.value)}
                placeholder="Bot Token"
                className="w-full px-4 py-2 border border-rose-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                />
                <input 
                type="text" 
                value={localSettings.telegram.chatId}
                onChange={(e) => updateTelegram('chatId', e.target.value)}
                placeholder="Chat ID"
                className="w-full px-4 py-2 border border-rose-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
                />
            </div>
          </section>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-rose-400 hover:bg-rose-500 text-white rounded-full font-medium transition-colors shadow-lg shadow-rose-200"
          >
            Сохранить настройки
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;