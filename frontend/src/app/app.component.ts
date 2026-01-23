import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PingService } from '../../src/app/core/services/ping.service';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  imports: [RouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private pingService: PingService) {}

  ngOnInit(): void {
    console.log('APP CARREGOU');
    this.pingService.ping().subscribe({
      next: (res) => console.log('PING OK:', res),
      error: (err) => console.error('PING ERRO:', err),
    });
  }
}
