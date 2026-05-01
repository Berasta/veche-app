import { Palette, Check, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ThemeSwitcherProps {
  compact?: boolean;
}

interface ThemeEntry {
  id: string;
  name: string;
  description: string;
  colors: string[];
}

const themeGroups: { group: string; themes: ThemeEntry[] }[] = [
  {
    group: 'Тёмныя',
    themes: [
      { id: '', name: 'Древняя Русь', description: 'Тёплыя золотыя тона', colors: ['#d4af37', '#c1702a', '#4a3526', '#1a120c'] },
      { id: 'dark', name: 'Тёмная Русь', description: 'Глубокая ночь', colors: ['#d4af37', '#c1702a', '#3a2a1a', '#0f0a06'] },
      { id: 'night', name: 'Ночной дозоръ', description: 'Простая тьма', colors: ['#8888a0', '#6a8aba', '#24242a', '#0c0c0e'] },
      { id: 'midnight', name: 'Полуночный звонъ', description: 'Глубокая лазурь', colors: ['#5a7acc', '#d4af37', '#1a2038', '#080a12'] },
    ],
  },
  {
    group: 'Свѣтлыя',
    themes: [
      { id: 'light', name: 'Берёзовая грамота', description: 'Свѣтлыя береста', colors: ['#8b6914', '#a8552a', '#e8dcc8', '#f5f0e8'] },
      { id: 'pearl', name: 'Жемчужная заря', description: 'Розовый жемчугъ', colors: ['#d4b8c0', '#b8a0b0', '#e8d8e0', '#f0e8ec'] },
    ],
  },
  {
    group: 'Студёныя',
    themes: [
      { id: 'frost', name: 'Морозная зима', description: 'Студёные небеса', colors: ['#67b8e3', '#a0c4e8', '#2a3a4a', '#0f1419'] },
      { id: 'silver', name: 'Серебряная гривна', description: 'Студёное сребро', colors: ['#a8b0b8', '#7890a8', '#2a2e34', '#101214'] },
      { id: 'ice', name: 'Ледяная пустошь', description: 'Хладныя тона', colors: ['#67c8e8', '#4aa0c8', '#1e2838', '#0e1218'] },
    ],
  },
  {
    group: 'Природныя',
    themes: [
      { id: 'forest', name: 'Лѣсной хоромъ', description: 'Зелёные просторы', colors: ['#7cb342', '#8d6e63', '#3e4a3e', '#1a1f1a'] },
      { id: 'moss', name: 'Мшистый камень', description: 'Мохъ и камень', colors: ['#6a8a6a', '#8a7a5a', '#2a3a2a', '#121812'] },
      { id: 'sunset', name: 'Закатъ надъ полемъ', description: 'Рдяныя облака', colors: ['#e87a5d', '#d4a057', '#4a2828', '#1a0f14'] },
      { id: 'cherry', name: 'Черёмуховая весна', description: 'Цвѣтущій садъ', colors: ['#d87090', '#d0a060', '#3a1e2a', '#1a0e14'] },
      { id: 'emerald', name: 'Изумрудная долина', description: 'Зелень лѣсовъ', colors: ['#4cbf6a', '#6a8a4a', '#18302a', '#0a140e'] },
    ],
  },
  {
    group: 'Водныя',
    themes: [
      { id: 'ocean', name: 'Морская пучина', description: 'Глубины водныя', colors: ['#4088c8', '#d4af37', '#142838', '#060c14'] },
    ],
  },
  {
    group: 'Земныя',
    themes: [
      { id: 'stone', name: 'Каменная палата', description: 'Сѣрыя стѣны', colors: ['#9e9e9e', '#6b8e6b', '#2e302e', '#111311'] },
      { id: 'clay', name: 'Красная глина', description: 'Терракотовый', colors: ['#c07a5a', '#a06040', '#3a2820', '#18120e'] },
      { id: 'copper', name: 'Мѣдный градъ', description: 'Зелёная мѣдь', colors: ['#b8845e', '#6ba89a', '#283a34', '#0e1412'] },
    ],
  },
  {
    group: 'Благородныя',
    themes: [
      { id: 'crimson', name: 'Червлёная Русь', description: 'Багряныя палаты', colors: ['#c0392b', '#d4a057', '#3a1a1a', '#140a0a'] },
      { id: 'violet', name: 'Вечерній звонъ', description: 'Сумрачныя дали', colors: ['#a07dd6', '#c9a85c', '#2e2440', '#120f18'] },
      { id: 'wine', name: 'Вишнёвый садъ', description: 'Спѣлыя вишни', colors: ['#b84a6a', '#c08040', '#3a1e28', '#160c10'] },
      { id: 'heather', name: 'Вересковый мёдъ', description: 'Верескъ и медокъ', colors: ['#b080a0', '#c09060', '#2e1e2e', '#141014'] },
      { id: 'royal', name: 'Царскiй багрянецъ', description: 'Благородный пурпуръ', colors: ['#b884d8', '#d4af37', '#2a1e38', '#100a14'] },
    ],
  },
  {
    group: 'Златыя',
    themes: [
      { id: 'amber', name: 'Янтарная палата', description: 'Медовый свѣтъ', colors: ['#e8a020', '#d48120', '#4a3a18', '#1a1408'] },
      { id: 'honey', name: 'Медовый спасъ', description: 'Златой медокъ', colors: ['#d4a040', '#b87830', '#4a3018', '#1a1408'] },
    ],
  },
  {
    group: 'Пустынныя',
    themes: [
      { id: 'sand', name: 'Песчаный берегъ', description: 'Тёплый песокъ', colors: ['#d4a860', '#c08040', '#2a2418', '#12100a'] },
    ],
  },
];

const gradients: Record<string, string> = {
  '': 'from-[#d4af37] via-[#c1702a] to-[#1a120c]',
  dark: 'from-[#d4af37] via-[#3a2a1a] to-[#0f0a06]',
  light: 'from-[#8b6914] via-[#e8dcc8] to-[#f5f0e8]',
  forest: 'from-[#7cb342] via-[#3e4a3e] to-[#1a1f1a]',
  frost: 'from-[#67b8e3] via-[#2a3a4a] to-[#0f1419]',
  sunset: 'from-[#e87a5d] via-[#4a2828] to-[#1a0f14]',
  crimson: 'from-[#c0392b] via-[#3a1a1a] to-[#140a0a]',
  stone: 'from-[#9e9e9e] via-[#2e302e] to-[#111311]',
  violet: 'from-[#a07dd6] via-[#2e2440] to-[#120f18]',
  amber: 'from-[#e8a020] via-[#4a3a18] to-[#1a1408]',
  copper: 'from-[#b8845e] via-[#283a34] to-[#0e1412]',
  wine: 'from-[#b84a6a] via-[#3a1e28] to-[#160c10]',
  honey: 'from-[#d4a040] via-[#4a3018] to-[#1a1408]',
  silver: 'from-[#a8b0b8] via-[#2a2e34] to-[#101214]',
  cherry: 'from-[#d87090] via-[#3a1e2a] to-[#1a0e14]',
  midnight: 'from-[#5a7acc] via-[#1a2038] to-[#080a12]',
  night: 'from-[#8888a0] via-[#24242a] to-[#0c0c0e]',
  moss: 'from-[#6a8a6a] via-[#2a3a2a] to-[#121812]',
  clay: 'from-[#c07a5a] via-[#3a2820] to-[#18120e]',
  pearl: 'from-[#d4b8c0] via-[#e8d8e0] to-[#f0e8ec]',
  heather: 'from-[#b080a0] via-[#2e1e2e] to-[#141014]',
  ice: 'from-[#67c8e8] via-[#1e2838] to-[#0e1218]',
  emerald: 'from-[#4cbf6a] via-[#18302a] to-[#0a140e]',
  ocean: 'from-[#4088c8] via-[#142838] to-[#060c14]',
  royal: 'from-[#b884d8] via-[#2a1e38] to-[#100a14]',
  sand: 'from-[#d4a860] via-[#2a2418] to-[#12100a]',
};

function ThemeCard({ theme, isSelected, onClick }: { theme: ThemeEntry; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-lg overflow-hidden text-left transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:ring-2 hover:ring-primary/50 hover:ring-offset-1 hover:ring-offset-background'
      }`}
    >
      <div className="h-10 flex rounded-t-lg overflow-hidden">
        {theme.colors.map((color, i) => <div key={i} className="flex-1" style={{ backgroundColor: color }} />)}
      </div>
      <div className="p-2 bg-card">
        <div className="flex items-center justify-between gap-1">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate">{theme.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{theme.description}</p>
          </div>
          {isSelected && (
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export function ThemeSwitcher({ compact = false }: ThemeSwitcherProps) {
  const [currentTheme, setCurrentTheme] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || '';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeId: string) => { document.documentElement.className = themeId; };

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    localStorage.setItem('theme', themeId);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div className="relative">
        <button onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          title="Измѣнити тему">
          <Palette className="w-4 h-4" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute bottom-full mb-2 right-0 w-80 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-border flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Избрати тему</h4>
              </div>
              <div className="p-2 max-h-96 overflow-y-auto space-y-3">
                {themeGroups.map((group) => (
                  <div key={group.group}>
                    <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest px-1 mb-1.5">{group.group}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {group.themes.map((theme) => (
                        <ThemeCard key={theme.id} theme={theme} isSelected={currentTheme === theme.id} onClick={() => handleThemeChange(theme.id)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-primary" strokeWidth={2} />
        <h3 className="text-base font-semibold text-foreground">Тема оформленія</h3>
      </div>

      <div className="space-y-5">
        {themeGroups.map((group) => (
          <div key={group.group}>
            <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest mb-2 px-0.5">{group.group}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.themes.map((theme) => (
                <button key={theme.id} onClick={() => handleThemeChange(theme.id)}
                  className={`relative rounded-xl overflow-hidden text-left transition-all cursor-pointer ${
                    currentTheme === theme.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'ring-1 ring-border hover:ring-primary/50'
                  }`}>
                  <div className={`h-16 bg-gradient-to-r ${gradients[theme.id]}`} />
                  <div className="px-3 py-1.5 flex gap-1.5 -mt-3 relative">
                    {theme.colors.map((color, i) => <div key={i} className="w-4 h-4 rounded-full ring-1 ring-black/10" style={{ backgroundColor: color }} />)}
                  </div>
                  <div className="px-3 pb-3 -mt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{theme.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{theme.description}</p>
                      </div>
                      {currentTheme === theme.id && (
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 ml-2">
                          <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
