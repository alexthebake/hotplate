# BasicStore

The `BasicStore` takes an object configuration with the following shape:

```
{
  name         : String | Name of the store
  initialState : Any    | Initial state for store
  actions      : Object | Action updaters
  thunks       : Object | Thunks that call other action updaters
}
```

## Motivation

In vanilla redux actions, return a simple object, only requiring a `type` property.

```js
// Vanilla Redux Action Creator
function increment(i = 0) {
  return {
    type: 'COUNTER_INCREMENT',
    payload: i,
  };
}
```

These actions are then handled by reducers:

```js
// Vanilla Redux Reducer
function counterReducer(state, action) {
  switch (action.type) {
    case 'COUNTER_INCREMENT':
      return state + action.payload;
    default:
      return state;
  }
}
```

While this looks pretty straightforward so far, it can easily become more complicated and difficult to manage. It can also be hard to track where and how changes happen, since the actions and reducers are separated.

The `BasicStore` makes this easier by combining actions and reducers into a single function, which we call `updaters`. We can rewrite the action creator and reducer example from above as a `BasicStore` updater as follows:

```js
function increment(state, i = 0) {
  return state + i;
}
```

Updaters must return a new state. They will always recieve the current state as the first argument, and can handle any argument structure following that. They also automatically create an appropriate action `type`, based on the name of the store and the name of the action. This simplifies the API and brings actions and reducers closer together!

## API

### Actions

As mentioned above, the `BasicStore` combines vanilla actions and reducers. For clarity we'll typically call these `updaters`.

When initializing a store, action updaters can be defined as follows:

```js
const myStore = new BasicStore({
  // other configuration stuff...
  actions: {
    actionName: updaterFunction,
  },
});
```

The `actionName` is how you will invoke the action, and the updater function is called when it's time to update the store's state. Updater functions must return a new state, and have the following signature:

```js
function updaterFunction(oldState, ...args) {
  // do stuff with oldState and args
  return newState;
}
```

Actions can also be added to a store after it's been initialized as follows:

```js
myStore.addAction({
  name: 'actionName',
  updater: updaterFunction,
});
```

### Thunks

If you're already familiar with redux, you've probably used thunks. If not, you can think of thunks as a way of invoking multiple actions with one. Async operations are a great example of this, since there are multiple states that we want to go through and make updates against (i.e. going from loading to loaded).

When initializing a store, thunks can be defined as follows:

```js
const myStore = new BasicStore({
  // other configuration stuff...
  actions: {
    actionName: updaterFunction,
  },
  thunks: {
    thunkName: thunkFunction,
  },
});
```

Thunks in the `BasicStore` are very similar to thunks in vanilla redux-thunk,with one exception: instead of getting dispatch, you get a bound object of actions defined in the store. They have the following structure:

```js
function thunkFunction(...args) {
  return (actions, getState) => {
    // do stuff with actions and getState
  };
}
```

Thunks can also be added to a store after it's been initialized as follows:

```js
myStore.addThunk({
  name: 'thunkName',
  thunk: thunkFunction,
});
```

## Examples

### Counter Example

```js
const counterStore = new BasicStore({
  name: 'counter',
  initialState: 0,
  actions: {
    increment: (state, i = 1) => state + i,
  },
});
```

### Async Example

```js
const asyncStore = new BasicStore({
  name: 'async',
  initialState: {
    loaded: false,
    loading: false,
    data: null,
    error: null,
  },
  actions: {
    loading: state => ({
      ...state,
      loading: true,
    }),
    success: (state, response) => ({
      ..state,
      loaded: true,
      loading: false,
      data: response.data,
    }),
    failure: (state, response) => ({
      ..state,
      loaded: true,
      loading: false,
      error: response.error,
    }),
  },
  thunks: {
    loadResouce: (params = {}) => actions => {
      actions.loading();
      return axios.get('/api/resouce', { params })
        .then(response => actions.success(response))
        .catch(response => actions.failure(response));
      );
    },
  },
});
```
