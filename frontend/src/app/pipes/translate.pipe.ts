import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService, TRANSLATIONS } from '../services/language.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  constructor(private langService: LanguageService) {}

  transform(key: keyof typeof TRANSLATIONS['id']): string {
    return this.langService.t(key);
  }
}
