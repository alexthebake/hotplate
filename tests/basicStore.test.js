import BasicStore from '../src/basicStore';
import { setupMockStore } from './__helpers/mockStore';

describe('BasicStore', () => {
  describe('counter example', () => {
    const ACTION_NAME = 'increment';
    const ACTION_TYPE = 'COUNTER_INCREMENT';
    const DEFAULT_VALUE = 1;
    const counterStore = new BasicStore({
      name: 'counter',
      initialState: 0,
      actions: {
        increment: (state, i = DEFAULT_VALUE) => state + i,
      },
    });

    describe('baseStore actions and reducers', () => {
      test('sets actions and reducers on baseStore', () => {
        expect(counterStore.baseStore.actions).to.have.key(ACTION_NAME);
        expect(counterStore.baseStore.reducers).to.have.key(ACTION_TYPE);
      });

      test('action returns valid action creator', () => {
        const action = counterStore.baseStore.actions[ACTION_NAME];
        const message = action(1);
        expect(message).to.eql({ type: ACTION_TYPE, payload: [1] });
      });

      test('reducer returns valid updated state', () => {
        const reducer = counterStore.baseStore.reducers[ACTION_TYPE];
        const newState = reducer(0, { payload: [1] });
        expect(newState).to.eq(1);
      });
    });

    describe('dispatched actions and reducers', () => {
      let store;
      let mockStore;
      let actions;
      let mockActions;

      beforeEach(() => {
        const mock = setupMockStore(counterStore);
        store = mock.store;
        actions = mock.actions;
        mockStore = mock.mockStore;
        mockActions = mock.mockActions;
      });

      test('dispatches actions', () => {
        mockActions[ACTION_NAME](1);
        expect(mockStore.getActions()).to.eql([
          { type: ACTION_TYPE, payload: [1] },
        ]);
      });

      test('updates store', () => {
        actions[ACTION_NAME](1);
        expect(store.getState()).to.eq(1);
      });

      test('handles default values', () => {
        actions[ACTION_NAME]();
        expect(store.getState()).to.eq(DEFAULT_VALUE);
      });
    });
  });

  describe('async example', () => {
    const successResponse = { data: 'Hooray!' };
    const succeed = Promise.resolve(successResponse);
    const failureResponse = {
      error: "Oh fuck... I can't believe you've done this.",
    };
    const fail = Promise.reject(failureResponse);

    const STATUS = {
      NOT_STARTED: 'NOT_STARTED',
      LOADING: 'LOADING',
      SUCCESS: 'SUCCESS',
      FAILURE: 'FAILURE',
    };

    const asyncStore = new BasicStore({
      name: 'async',
      initialState: {
        status: STATUS.NOT_STARTED,
        data: null,
        error: null,
      },
      actions: {
        loading: state => ({ ...state, status: STATUS.LOADING }),
        success: (state, data) => ({ ...state, status: STATUS.SUCCESS, data }),
        failure: (state, error) => ({
          ...state,
          status: STATUS.FAILURE,
          error,
        }),
      },
      thunks: {
        perform: promise => actions => {
          actions.loading();
          return promise.then(
            ({ data }) => actions.success(data),
            ({ error }) => actions.failure(error)
          );
        },
      },
    });

    let store;
    let mockStore;
    let actions;
    let mockActions;

    beforeEach(() => {
      const mock = setupMockStore(asyncStore);
      store = mock.store;
      actions = mock.actions;
      mockStore = mock.mockStore;
      mockActions = mock.mockActions;
    });

    test('dispatches the correct actions for success', () => {
      mockActions.perform(succeed);
      expect(mockStore.getActions()).to.eql([
        { type: 'ASYNC_LOADING', payload: [] },
      ]);
    });

    test('dispatches the correct actions for success', () => {
      return mockActions.perform(succeed).then(() => {
        expect(mockStore.getActions()).to.eql([
          { type: 'ASYNC_LOADING', payload: [] },
          { type: 'ASYNC_SUCCESS', payload: [successResponse.data] },
        ]);
      });
    });

    test('dispatches the correct actions for failure', () => {
      return mockActions.perform(fail).then(() => {
        expect(mockStore.getActions()).to.eql([
          { type: 'ASYNC_LOADING', payload: [] },
          { type: 'ASYNC_FAILURE', payload: [failureResponse.error] },
        ]);
      });
    });

    test('correctly updates the store for loading', () => {
      actions.perform(succeed);
      expect(store.getState()).to.eql({
        status: STATUS.LOADING,
        data: null,
        error: null,
      });
    });

    test('correctly updates the store for success', () => {
      return actions.perform(succeed).then(() => {
        expect(store.getState()).to.eql({
          status: STATUS.SUCCESS,
          data: successResponse.data,
          error: null,
        });
      });
    });

    test('correctly updates the store for failure', () => {
      return actions.perform(fail).then(() => {
        expect(store.getState()).to.eql({
          status: STATUS.FAILURE,
          data: null,
          error: failureResponse.error,
        });
      });
    });
  });
});
