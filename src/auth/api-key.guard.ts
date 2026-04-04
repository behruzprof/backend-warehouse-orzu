import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // 1. Получаем ключ из заголовка запроса 'x-api-key'
    const apiKey = request.headers['x-api-key'];
    
    // 2. Получаем строку со всеми ключами из .env
    // Если переменная пустая или не найдена, используем пустую строку '', чтобы избежать ошибок
    const validApiKeysString = this.configService.get<string>('API_KEYS') || '';
    
    // 3. Превращаем строку "key1, key2, key3" в массив ['key1', 'key2', 'key3']
    // Метод .map(key => key.trim()) удаляет случайные пробелы до и после ключа
    const validApiKeys = validApiKeysString.split(',').map(key => key.trim());

    // 4. Если ключ не прислали ИЛИ присланного ключа нет в массиве разрешенных — ошибка
    if (!apiKey || !validApiKeys.includes(apiKey as string)) {
      throw new UnauthorizedException('Yaroqsiz yoki mavjud bo‘lmagan API kalit (Invalid API Key)');
    }

    return true; // Проверка пройдена, пускаем дальше
  }
}