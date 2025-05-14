import { AddElement, RemoveElement, GetAllElements, GetElement } from './crudTypes';

export interface OnSuccessActions {
  add: AddElement;
  get: GetElement;
  getAll: GetAllElements;
  remove: RemoveElement;
}
