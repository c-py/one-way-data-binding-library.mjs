# One Way Data Binding Library .MJS

## 😎 Description 🙏

Maps javascript objects to arbitrary create, update and delete functions.

Can be used to sync stateful or stateless components with some other provider of data.

## 🚀 Installation 😱

```bash
yarn add one-way-data-binding-library.mjs
```

## 💯 Basic Usage 👆

```js
import oneWayDataBindingLibraryJs from "one-way-data-binding-library.mjs";

const bar = () => ({
  create: (relative, absolute) => console.log("Create", relative, absolute),
  update: (relative, absolute) => console.log("Update", relative, absolute),
  delete: (absolute) => console.log("Delete", absolute),
});

const run = oneWayDataBindingLibraryJs({
  "foo.bar": bar,
});

// Create
run(() => ({ foo: { bar: { hello: "world" } } }));

// Update
run((state) => {
  state.foo.bar.hello = "moon";
});

// Delete
run((state) => ({}));
```

## 💪 Additional Usage 😂

### Multiple Paths

```js
const example = () => ({
  create: (relative, absolute) => console.log("Create", relative, absolute),
  update: (relative, absolute) => console.log("Update", relative, absolute),
  delete: (absolute) => console.log("Delete", absolute),
});

const run = oneWayDataBindingLibraryJs({
  "foo.bar": example,
  "foo.baz": example,
});

run(() => ({
  foo: {
    bar: {},
    baz: {},
  },
}));
```

### Wildcards

```js
const example = () => ({
  create: (relative, absolute) => console.log("Create", relative, absolute),
  update: (relative, absolute) => console.log("Update", relative, absolute),
  delete: (absolute) => console.log("Delete", absolute),
});

const run = oneWayDataBindingLibraryJs({
  "foo.*": example,
});

run(() => ({
  foo: {
    bar: {},
    baz: {},
  },
}));
```

### Using Classes

```js
class Example {
  create(relative, absolute) {
    console.log("Create", relative, absolute);
  }

  update(relative, absolute) {
    console.log("Update", relative, absolute);
  }

  delete(absolute) {
    console.log("Delete", absolute);
  }
}

const run = oneWayDataBindingLibraryJs({
  "foo.bar": () => new Example(),
});

run(() => ({
  foo: {
    bar: {},
  },
}));
```

## 👀 Help & Documentation 🎉

### Path Matching

JSON Path matching utilises Object Scan: https://github.com/blackflux/object-scan

### State Updates

State updates are Immer patch expressions: https://github.com/immerjs/immer
