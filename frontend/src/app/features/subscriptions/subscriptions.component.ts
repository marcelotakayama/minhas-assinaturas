import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubscriptionsService, Subscription } from '../../core/services/subscriptions.service';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  template: `
    <div class="page">
      <header class="header">
        <div>
          <h1>Assinaturas</h1>
          <p class="subtitle">Cadastre e acompanhe seus gastos mensais.</p>
        </div>

        <div class="summary">
          <div class="pill">
            <div class="pillLabel">Total mensal</div>
            <div class="pillValue">{{ totalMonthly | currency:'BRL':'symbol':'1.2-2' }}</div>
          </div>
          <button class="btn" (click)="reload()" [disabled]="loading">
            {{ loading ? 'Atualizando...' : 'Atualizar' }}
          </button>
        </div>
      </header>

      <section class="card formCard">
        <h2>Nova assinatura</h2>

        <form [formGroup]="createForm" (ngSubmit)="create()">
          <div class="formGrid">
            <label class="field">
              <span>Serviço</span>
              <input type="text" formControlName="serviceName" placeholder="Ex.: Netflix" />
              <small class="error" *ngIf="createForm.controls.serviceName.touched && createForm.controls.serviceName.invalid">
                Informe o nome do serviço.
              </small>
            </label>

            <label class="field">
              <span>Valor (R$)</span>
              <input type="number" step="0.01" formControlName="amount" placeholder="Ex.: 39.90" />
              <small class="error" *ngIf="createForm.controls.amount.touched && createForm.controls.amount.invalid">
                Informe um valor válido.
              </small>
            </label>

            <label class="field">
              <span>Dia da cobrança</span>
              <input type="number" formControlName="billingDay" placeholder="1 a 31" />
              <small class="error" *ngIf="createForm.controls.billingDay.touched && createForm.controls.billingDay.invalid">
                Use um dia entre 1 e 31.
              </small>
            </label>

            <div class="actions">
              <button class="btn primary" type="submit" [disabled]="createForm.invalid || saving">
                {{ saving ? 'Salvando...' : 'Adicionar' }}
              </button>
            </div>
          </div>
        </form>

        <p class="banner error" *ngIf="error">{{ error }}</p>
      </section>

      <section class="listHeader">
        <h2>Minhas assinaturas</h2>
        <div class="muted" *ngIf="items.length === 0 && !loading">Nenhuma assinatura cadastrada ainda.</div>
      </section>

      <section class="grid" *ngIf="items.length > 0">
        <article class="card subCard" *ngFor="let s of items; trackBy: trackById">
          <div class="subTop">
            <div>
              <div class="service">{{ s.serviceName }}</div>
              <div class="meta">
                <span class="tag">Dia {{ s.billingDay }}</span>
                <span class="tag">Mensal</span>
              </div>
            </div>

            <div class="amount">
              {{ s.amount | currency:'BRL':'symbol':'1.2-2' }}
            </div>
          </div>

          <div class="divider"></div>

          <!-- modo normal -->
          <div class="subActions" *ngIf="editingId !== s.id; else editBlock">
            <button class="btn" (click)="startEdit(s)">Editar</button>
            <button class="btn danger" (click)="remove(s.id)" [disabled]="deletingId === s.id">
              {{ deletingId === s.id ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>

          <!-- modo edição -->
          <ng-template #editBlock>
            <form [formGroup]="editForm" (ngSubmit)="saveEdit(s.id)">
              <div class="formGrid compact">
                <label class="field">
                  <span>Serviço</span>
                  <input type="text" formControlName="serviceName" />
                </label>

                <label class="field">
                  <span>Valor (R$)</span>
                  <input type="number" step="0.01" formControlName="amount" />
                </label>

                <label class="field">
                  <span>Dia</span>
                  <input type="number" formControlName="billingDay" />
                </label>

                <div class="actions">
                  <button class="btn primary" type="submit" [disabled]="editForm.invalid || savingEdit">
                    {{ savingEdit ? 'Salvando...' : 'Salvar' }}
                  </button>
                  <button class="btn" type="button" (click)="cancelEdit()" [disabled]="savingEdit">
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </ng-template>
        </article>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 16px;
      display: grid;
      gap: 16px;
    }

    .header {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    h1 { margin: 0; font-size: 28px; }
    h2 { margin: 0 0 10px 0; font-size: 18px; }
    .subtitle { margin: 6px 0 0 0; color: #666; }

    .summary {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .pill {
      border: 1px solid #e6e6e6;
      border-radius: 999px;
      padding: 10px 12px;
      background: #fafafa;
      min-width: 180px;
    }

    .pillLabel { font-size: 12px; color: #666; }
    .pillValue { font-size: 16px; font-weight: 700; margin-top: 2px; }

    .card {
      border: 1px solid #e8e8e8;
      border-radius: 14px;
      padding: 14px;
      background: #fff;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }

    .formCard { padding: 16px; }

    .formGrid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    /* desktop */
    @media (min-width: 900px) {
      .formGrid {
        grid-template-columns: 2fr 1fr 1fr auto;
        align-items: end;
      }
      .formGrid.compact {
        grid-template-columns: 2fr 1fr 1fr auto;
      }
    }

    .formGrid.compact {
      grid-template-columns: 1fr;
    }

    .field { display: grid; gap: 6px; }
    .field span { font-size: 12px; color: #555; }

    input {
      border: 1px solid #d9d9d9;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 14px;
      outline: none;
    }

    input:focus {
      border-color: #b7b7b7;
      box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
    }

    .actions {
      display: flex;
      gap: 8px;
      justify-content: flex-start;
    }

    .btn {
      border: 1px solid #d8d8d8;
      background: #fff;
      padding: 10px 12px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn.primary {
      background: #111;
      color: #fff;
      border-color: #111;
    }

    .btn.danger {
      border-color: #ffdddd;
      color: #b00020;
      background: #fff7f7;
    }

    .error { color: #b00020; font-size: 12px; }
    .banner { margin: 12px 0 0 0; }
    .banner.error { color: #b00020; }

    .listHeader {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .muted { color: #666; font-size: 13px; }

    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    @media (min-width: 700px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (min-width: 1050px) {
      .grid { grid-template-columns: repeat(3, 1fr); }
    }

    .subCard { display: grid; gap: 10px; }

    .subTop {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
    }

    .service { font-weight: 800; font-size: 16px; }
    .amount { font-weight: 900; font-size: 16px; white-space: nowrap; }

    .meta { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
    .tag {
      font-size: 12px;
      color: #444;
      background: #f3f3f3;
      border-radius: 999px;
      padding: 4px 8px;
      border: 1px solid #e8e8e8;
    }

    .divider { height: 1px; background: #eee; }

    .subActions { display: flex; gap: 8px; }
  `]
})
export class SubscriptionsComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private api = inject(SubscriptionsService);

  items: Subscription[] = [];
  loading = false;
  saving = false;
  error = '';

  editingId: string | null = null;
  savingEdit = false;
  deletingId: string | null = null;

  createForm = this.fb.group({
    serviceName: this.fb.control('', [Validators.required, Validators.maxLength(120)]),
    amount: this.fb.control(0, [Validators.required, Validators.min(0.01)]),
    billingDay: this.fb.control(1, [Validators.required, Validators.min(1), Validators.max(31)]),
  });

  editForm = this.fb.group({
    serviceName: this.fb.control('', [Validators.required, Validators.maxLength(120)]),
    amount: this.fb.control(0, [Validators.required, Validators.min(0.01)]),
    billingDay: this.fb.control(1, [Validators.required, Validators.min(1), Validators.max(31)]),
  });

  get totalMonthly(): number {
    // arredonda só pra não ficar aquele 39.90000000004
    const sum = this.items.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    return Math.round(sum * 100) / 100;
  }

  ngOnInit(): void {
    this.reload();
  }

  trackById(_: number, item: Subscription) {
    return item.id;
  }

  reload(): void {
    this.error = '';
    this.loading = true;

    this.api.getAll().subscribe({
      next: (res) => {
        this.items = res ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Falha ao carregar assinaturas. Verifique se você está logado e se a API está rodando.';
      },
    });
  }

  create(): void {
    this.error = '';
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.api.create(this.createForm.getRawValue()).subscribe({
      next: () => {
        this.saving = false;
        this.createForm.reset({ serviceName: '', amount: 0, billingDay: 1 });
        this.reload();
      },
      error: () => {
        this.saving = false;
        this.error = 'Falha ao criar assinatura.';
      },
    });
  }

  startEdit(s: Subscription): void {
    this.editingId = s.id;
    this.error = '';
    this.editForm.reset({
      serviceName: s.serviceName,
      amount: s.amount,
      billingDay: s.billingDay,
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.error = '';
  }

  saveEdit(id: string): void {
    this.error = '';
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.savingEdit = true;
    this.api.update(id, this.editForm.getRawValue()).subscribe({
      next: () => {
        this.savingEdit = false;
        this.editingId = null;
        this.reload();
      },
      error: () => {
        this.savingEdit = false;
        this.error = 'Falha ao salvar edição.';
      },
    });
  }

  remove(id: string): void {
    this.error = '';
    this.deletingId = id;

    this.api.delete(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.reload();
      },
      error: () => {
        this.deletingId = null;
        this.error = 'Falha ao excluir assinatura.';
      },
    });
  }
}
