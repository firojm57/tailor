import { operation } from "../shared/util/constant";

export class Variety {
  constructor(
    public id: number,
    public type: string,
    public measureList: string[],
    public action: string = operation.view
  ) {}
}

export class VarietyRequest {
  constructor(
    public id: number,
    public type: string,
    public measureList: string[]
  ) {}
}