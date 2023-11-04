import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TagModel } from 'src/app/model/common.model';
import { operation } from '../util/constant';

@Component({
  selector: 'app-tag-input',
  templateUrl: './tag-input.component.html',
  styleUrls: ['./tag-input.component.scss']
})
export class TagInputComponent implements OnInit {
  @Input() tags: string[] = [];
  @Input() mode: string = operation.view;
  @Output() tagsChange = new EventEmitter<TagModel>();
  tagInput: string = '';
  oldTags: string[] = [];

  ngOnInit(): void {
    this.oldTags = [...this.tags];
  }

  addTag() {
    if (this.tagInput.trim() !== '') {
      this.tags.push(this.tagInput);
      this.tagInput = '';
      this.emitTags();
    }
  }

  removeTag(tag: string) {
    this.tags = this.tags.filter((t) => t !== tag);
    this.emitTags();
  }

  emitTags() {
    const tags: TagModel = new TagModel(this.tags, this.oldTags)
    this.tagsChange.emit(tags);
  }
}
