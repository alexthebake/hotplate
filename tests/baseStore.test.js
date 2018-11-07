import * as redux from 'redux';
import * as createReducer from '../src/utils/createReducer';
import BaseStore from '../src/baseStore';

describe('BaseStore', () => {
  describe('counter example', () => {
    const ACTION_NAME = 'increment';
    const ACTION_TYPE = 'COUNTER_INCREMENT';

    const incrementAction = (i = 1) => ({
      type: ACTION_TYPE,
      payload: i,
    });

    const incrementReducer = (state, action) => state + action.payload;

    const counterStore = new BaseStore({
      name: 'counter',
      initialState: 0,
      actions: {
        [ACTION_NAME]: incrementAction,
      },
      reducers: {
        [ACTION_TYPE]: incrementReducer,
      },
    });

    test('sets actions and reducers', () => {
      expect(counterStore.actions[ACTION_NAME]).to.eq(incrementAction);
      expect(counterStore.reducers[ACTION_TYPE]).to.eq(incrementReducer);
    });

    describe('#bindActionCreators', () => {
      let dispatchMock;

      beforeEach(() => {
        dispatchMock = sinon.stub();
        sinon.spy(redux, 'bindActionCreators');
        counterStore.bindActionCreators(dispatchMock);
      });

      afterEach(() => {
        redux.bindActionCreators.restore();
      });

      test('binds configured action creators with given dispatch', () => {
        expect(redux.bindActionCreators).to.have.been.calledWith(
          counterStore.actions,
          dispatchMock
        );
      });
    });

    describe('#createReducer', () => {
      beforeEach(() => {
        sinon.spy(createReducer, 'default');
        counterStore.createReducer();
      });

      afterEach(() => {
        createReducer.default.restore();
      });

      test('created root reducer with configured reducers and initial state', () => {
        expect(createReducer.default).to.have.been.calledWith(
          counterStore.initialState,
          counterStore.reducers
        );
      });
    });

    describe('adding a new action', () => {
      const DECREMENT_NAME = 'decrement';
      const DECREMENT_TYPE = 'DECREMENT';

      const decrementAction = (i = 1) => ({
        type: DECREMENT_TYPE,
        payload: i,
      });

      const decrementReducer = (state, action) => state - action.payload;

      beforeEach(() => {
        counterStore.addAction({
          name: DECREMENT_NAME,
          action: decrementAction,
        });
        counterStore.addReducer({
          type: DECREMENT_TYPE,
          reducer: decrementReducer,
        });
      });

      describe('#addAction', () => {
        test('sets new action', () => {
          expect(counterStore.actions[DECREMENT_NAME]).to.eq(decrementAction);
        });
      });

      describe('#addReducer', () => {
        test('sets new reducer', () => {
          expect(counterStore.reducers[DECREMENT_TYPE]).to.eq(decrementReducer);
        });
      });
    });
  });
});
