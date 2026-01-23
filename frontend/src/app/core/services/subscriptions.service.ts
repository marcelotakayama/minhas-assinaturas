import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Subscription = {
  id: string;
  serviceName: string;
  amount: number;
  billingDay: number;
};

export type UpsertSubscription = {
  serviceName: string;
  amount: number;
  billingDay: number;
};

@Injectable({ providedIn: 'root' })
export class SubscriptionsService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Subscription[]>('/api/subscriptions');
  }

  create(payload: UpsertSubscription) {
    return this.http.post<Subscription>('/api/subscriptions', payload);
  }

  update(id: string, payload: UpsertSubscription) {
    return this.http.put<void>(`/api/subscriptions/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`/api/subscriptions/${id}`);
  }
}
