import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="card">
        <h1>Entrar</h1>
        <p class="subtitle">Acesse para gerenciar suas assinaturas.</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label class="field">
            <span>Email</span>
            <input type="email" formControlName="email" placeholder="voce@exemplo.com" />
          </label>

          <label class="field">
            <span>Senha</span>
            <input type="password" formControlName="password" placeholder="••••••••" />
          </label>

          <p class="error" *ngIf="error">{{ error }}</p>

          <button class="btn" type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div class="footer">
          <span>Não tem conta?</span>
          <a routerLink="/auth/register">Criar conta</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; display:flex; align-items:center; justify-content:center; padding:16px; background:#fafafa; }
    .card { width:100%; max-width:420px; background:#fff; border:1px solid #eee; border-radius:14px; padding:18px; box-shadow:0 1px 2px rgba(0,0,0,.04); }
    h1 { margin:0; font-size:22px; }
    .subtitle { margin:6px 0 16px 0; color:#666; font-size:13px; }
    form { display:grid; gap:12px; }
    .field { display:grid; gap:6px; }
    .field span { font-size:12px; color:#555; }
    input { border:1px solid #d9d9d9; border-radius:10px; padding:10px 12px; font-size:14px; }
    .btn { border:1px solid #111; background:#111; color:#fff; padding:10px 12px; border-radius:10px; cursor:pointer; font-weight:700; }
    .btn:disabled { opacity:.6; cursor:not-allowed; }
    .error { color:#b00020; font-size:12px; margin:0; }
    .footer { margin-top:14px; display:flex; gap:8px; color:#666; font-size:13px; }
    a { color:#111; font-weight:700; text-decoration:none; }
  `]
})
export class LoginComponent {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';

  form = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]),
    password: this.fb.control('', [Validators.required]),
  });

  submit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/app/subscriptions']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error = (err.error as any)?.message ?? 'Falha no login.';
      },
    });
  }
}
