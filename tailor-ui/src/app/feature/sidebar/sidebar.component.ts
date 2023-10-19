import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MenuModel } from 'src/app/model/menu.model';
import { menuId } from 'src/app/shared/util/constant';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  menuItems: MenuModel[] = [];
  selectedMenu: MenuModel = new MenuModel(menuId.billing, "Billing");
  @Output() menuSelect = new EventEmitter<MenuModel> ();

  constructor(private router: Router) {
    this.menuItems.push(new MenuModel(menuId.billing, "Billing", "fa-solid fa-window-restore"));
    this.menuItems.push(new MenuModel(menuId.variety, "Varieties", "fa-solid fa-person-rays"));
    this.menuItems.push(new MenuModel(menuId.customer, "Customers", "fa-solid fa-user-tie"));
    this.menuItems.push(new MenuModel(menuId.report, "Report", "fa-solid fa-chart-simple"));
  }

  onMenuClick(selectedMenu: MenuModel) {
    this.selectedMenu = selectedMenu;
    this.menuSelect.emit(selectedMenu);
  }
}
