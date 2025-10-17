import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sun, Moon, Palette } from 'lucide-react';

const COLOR_THEMES = ['blue', 'violet', 'green', 'red', 'orange', 'yellow', 'rose'] as const;
type ColorTheme = typeof COLOR_THEMES[number];
const THEME_LABELS: Record<ColorTheme, string> = {
  blue: 'Bleu',
  violet: 'Violet',
  green: 'Vert',
  red: 'Rouge',
  orange: 'Orange',
  yellow: 'Jaune',
  rose: 'Rose',
};

function applyColorTheme(color: ColorTheme) {
  const root = document.documentElement;
  COLOR_THEMES.forEach((c) => root.classList.remove(`theme-${c}`));
  root.classList.add(`theme-${color}`);
  localStorage.setItem('color-theme', color);
}

function applyMode(mode: 'light' | 'dark') {
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  localStorage.setItem('mode', mode);
}

export const ThemeSwitcher = () => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => (localStorage.getItem('mode') as 'light' | 'dark') || 'dark');
  const [color, setColor] = useState<ColorTheme>(() => (localStorage.getItem('color-theme') as ColorTheme) || 'blue');

  useEffect(() => {
    const storedMode = (localStorage.getItem('mode') as 'light' | 'dark') || 'dark';
    const storedColor = (localStorage.getItem('color-theme') as ColorTheme) || 'blue';
    setMode(storedMode);
    setColor(storedColor);
    applyMode(storedMode);
    applyColorTheme(storedColor);
  }, []);

  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  useEffect(() => {
    applyColorTheme(color);
  }, [color]);

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        className="cursor-pointer"
        onClick={() => setMode((m) => (m === 'dark' ? 'light' : 'dark'))}
        aria-label="Basculer clair/sombre"
      >
        {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="cursor-pointer" aria-label="Palette de couleurs">
            <Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {COLOR_THEMES.map((c) => (
            <DropdownMenuItem key={c} onClick={() => setColor(c)}>
              {THEME_LABELS[c]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ThemeSwitcher;


