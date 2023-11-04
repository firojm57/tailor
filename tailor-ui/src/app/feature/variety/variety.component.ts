import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, map, takeUntil } from 'rxjs';
import { TagModel } from 'src/app/model/common.model';
import { Variety, VarietyRequest } from 'src/app/model/variety.model';
import { ApiService } from 'src/app/service/api/api.service';
import { operation } from 'src/app/shared/util/constant';

@Component({
  selector: 'app-variety',
  templateUrl: './variety.component.html',
  styleUrls: ['./variety.component.scss']
})
export class VarietyComponent implements OnInit, OnDestroy {
  varieties: Variety[] = [];
  unsub = new Subject<void>();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getAllVarieties();
  }

  onTagsChange(tags: TagModel, variety: Variety) {
    variety.measureList = tags.currentTags;
  }

  onEditClick(item: Variety) {
    item.action = operation.edit;
  }

  onDeleteClick(item: Variety) {
    item.action = operation.delete;
  }

  onConfirmClick(item: Variety) {
    if (item.action === operation.edit) {
      let varietyReq = new VarietyRequest(item.id, item.type, item.measureList);
      this.apiService.updateVariety(varietyReq).subscribe((data: any) => {
        this.getAllVarieties();
      });
    } else if (item.action === operation.delete) {
      this.apiService.deleteVarietyById(item.id).subscribe((data: any) => {
        this.getAllVarieties();
      });
    }
  }

  onCancelClick(item: Variety) {
    item.action = operation.view;
    this.getAllVarieties();
  }

  private getAllVarieties(): void {
    this.apiService.getAllVarieties()
    .pipe(
      takeUntil(this.unsub)
    )
    .subscribe((values: Variety[]) => {
      this.varieties = values.map(v => {
        v.action = operation.view;
        return v;
      });
    });
  }

  ngOnDestroy(): void {
    this.unsub.next();
    this.unsub.complete();
  }
}
