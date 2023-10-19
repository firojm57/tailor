import { Component } from '@angular/core';
import { MenuModel } from './model/menu.model';
import { menuId } from './shared/util/constant';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'tailor-ui';
  selectedMenu: MenuModel = new MenuModel(menuId.billing, "Billing");

  onMenuSelect(selectedMenu: MenuModel) {
    this.selectedMenu = selectedMenu;
  }
}
