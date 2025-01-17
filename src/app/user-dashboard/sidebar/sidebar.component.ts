import {Component, HostListener, OnInit} from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  isDesktopView: boolean = true;

  ngOnInit(): void {
    this.updateView();
  }

  @HostListener('window:resize', [])
  onResize(): void {
    this.updateView();
  }

  updateView(): void {
    this.isDesktopView = window.innerWidth > 768; // Adjust breakpoint as needed
  }

  toggleSidenav(sidenav: any): void {
    sidenav.toggle();
  }
}
