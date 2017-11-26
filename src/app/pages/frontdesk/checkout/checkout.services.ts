import { Injectable } from '@angular/core';
import { HttpService } from '../../../providers/httpClient';

@Injectable()
export class CheckoutService {
  private modelName = 'fwhouseinfo';  // URL to web api
  constructor(private _httpService: HttpService) {
  }

  getCheckouts() {
    return this._httpService.getModelList(this.modelName);
  }

  delete(id: any) {
    return this._httpService.delete(this.modelName , id);
  }
  create(checkout: any) {
    return this._httpService.create(this.modelName, checkout);
  }

}