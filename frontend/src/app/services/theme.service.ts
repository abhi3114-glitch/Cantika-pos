import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<ThemeMode>('light');
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme() {
    const saved = localStorage.getItem('theme_mode') as ThemeMode;
    if (saved === 'dark') {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }
  }

  public setTheme(mode: ThemeMode) {
    this.themeSubject.next(mode);
    localStorage.setItem('theme_mode', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }

  public toggleTheme() {
    const current = this.themeSubject.value;
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }

  public isDark(): boolean {
    return this.themeSubject.value === 'dark';
  }
}
