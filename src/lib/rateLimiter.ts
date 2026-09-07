interface RateLimitRecord {
  attempts: number;
  firstAttemptTime: number;
  lockUntil: number;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 30 * 60 * 1000; // 30 minutos

export const rateLimiter = {
  checkLimit(identifier: string): { allowed: boolean; remainingMinutes?: number; message?: string } {
    if (typeof window === 'undefined') return { allowed: true };
    const key = `startap_rate_limit_${identifier.toLowerCase().trim()}`;
    const raw = localStorage.getItem(key);
    if (!raw) return { allowed: true };

    try {
      const record: RateLimitRecord = JSON.parse(raw);
      const now = Date.now();

      // Si la ventana de 30 minutos expiró, limpiar registro automáticamente
      if (now - record.firstAttemptTime > WINDOW_MS && now > record.lockUntil) {
        localStorage.removeItem(key);
        return { allowed: true };
      }

      // Si la cuenta está bloqueada por haber fallado 5 veces
      if (record.lockUntil && now < record.lockUntil) {
        const remainingMinutes = Math.ceil((record.lockUntil - now) / (60 * 1000));
        return {
          allowed: false,
          remainingMinutes,
          message: `Has superado el límite de ${MAX_ATTEMPTS} intentos fallidos en 30 minutos. Por seguridad, tu acceso está bloqueado durante ${remainingMinutes} minuto(s).`
        };
      }
    } catch (e) {
      localStorage.removeItem(key);
    }

    return { allowed: true };
  },

  recordFailedAttempt(identifier: string): { remainingAttempts: number; isLocked: boolean; lockMinutes?: number; message: string } {
    if (typeof window === 'undefined') {
      return { remainingAttempts: MAX_ATTEMPTS, isLocked: false, message: '' };
    }
    const key = `startap_rate_limit_${identifier.toLowerCase().trim()}`;
    const now = Date.now();
    const raw = localStorage.getItem(key);

    let record: RateLimitRecord = {
      attempts: 0,
      firstAttemptTime: now,
      lockUntil: 0
    };

    if (raw) {
      try {
        const parsed: RateLimitRecord = JSON.parse(raw);
        if (now - parsed.firstAttemptTime < WINDOW_MS) {
          record = parsed;
        }
      } catch (e) {}
    }

    record.attempts += 1;

    if (record.attempts >= MAX_ATTEMPTS) {
      record.lockUntil = now + WINDOW_MS; // Bloqueo de 30 minutos
      localStorage.setItem(key, JSON.stringify(record));
      return {
        remainingAttempts: 0,
        isLocked: true,
        lockMinutes: 30,
        message: `Has alcanzado el límite de ${MAX_ATTEMPTS} intentos fallidos. Tu cuenta ha sido bloqueada por 30 minutos por seguridad.`
      };
    }

    localStorage.setItem(key, JSON.stringify(record));
    const remainingAttempts = MAX_ATTEMPTS - record.attempts;
    return {
      remainingAttempts,
      isLocked: false,
      message: `Intento fallido (${record.attempts}/${MAX_ATTEMPTS}). Te quedan ${remainingAttempts} intento(s) antes del bloqueo de 30 minutos.`
    };
  },

  clearAttempts(identifier: string): void {
    if (typeof window !== 'undefined') {
      const key = `startap_rate_limit_${identifier.toLowerCase().trim()}`;
      localStorage.removeItem(key);
    }
  }
};
