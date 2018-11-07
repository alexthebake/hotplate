import { bindActionCreators } from 'redux';
import createReducer from './utils/createReducer';

export default class BaseStore {
  constructor({ name, initialState, actions = {}, reducers = {} }) {
    this.name = name;
    this.initialState = initialState;
    this.actions = actions;
    this.reducers = reducers;
  }

  bindActionCreators(dispatch) {
    return bindActionCreators(this.actions, dispatch);
  }

  createReducer() {
    return createReducer(this.initialState, this.reducers);
  }

  addAction({ name, action }) {
    this.actions[name] = action;
  }

  addReducer({ type, reducer }) {
    this.reducers[type] = reducer;
  }
}
