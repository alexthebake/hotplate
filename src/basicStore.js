import BaseStore from './baseStore';
import { toActionType } from './utils/actionTypes';

export default class BasicStore {
  constructor({ name, initialState, actions = {}, thunks = {} }) {
    this.name = name;
    this.initialState = initialState;
    this.baseStore = new BaseStore({ name, initialState });
    this.defineActions(actions);
    this.defineThunks(thunks);
  }

  bindActionCreators(dispatch) {
    return this.baseStore.bindActionCreators(dispatch);
  }

  createReducer() {
    return this.baseStore.createReducer();
  }

  defineActions(actions) {
    _.forEach(actions, (updater, name) => this.addAction({ name, updater }));
  }

  defineThunks(thunks) {
    _.forEach(thunks, (thunk, name) => this.addThunk({ name, thunk }));
  }

  addAction({ name, updater }) {
    const actionType = toActionType(this.baseStore.name, name);
    this.baseStore.addAction({
      name,
      action: (...args) => ({ type: actionType, payload: args }),
    });
    this.baseStore.addReducer({
      type: actionType,
      reducer: (state, action) => updater(state, ...action.payload),
    });
  }

  addThunk({ name, thunk }) {
    this.baseStore.addAction({
      name,
      action: (...args) => (dispatch, getState) => {
        const actions = this.bindActionCreators(dispatch);
        return thunk(...args)(actions, getState);
      },
    });
  }
}
