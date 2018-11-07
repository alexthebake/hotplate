import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

export function setupMockStore(hotStore) {
  // Create real store to test state updates
  const store = createStore(
    hotStore.createReducer(),
    hotStore.initialState,
    applyMiddleware(thunk)
  );
  const actions = hotStore.bindActionCreators(store.dispatch);

  // Create mock store to test action creators
  const createMockStore = configureStore([thunk]);
  const mockStore = createMockStore(hotStore.initialState);
  const mockActions = hotStore.bindActionCreators(mockStore.dispatch);

  return { store, actions, mockStore, mockActions };
}
