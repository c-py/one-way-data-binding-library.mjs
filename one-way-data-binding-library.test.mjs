import { describe, it, expect } from "vitest";

import bind from "./one-way-data-binding-library";

describe("one-way-data-binding-library", () => {
  it("executes create on a single json path match", () => {
    let runs = 0;

    const foo = () => ({
      create: () => runs++,
    });

    const run = bind({
      "state.foo": foo,
    });

    run(() => ({ state: { foo: {} } }));

    expect(runs).toBe(1);
  });

  it("executes create on multiple matches at end of json path", () => {
    let runs = 0;

    const wildcard = () => ({
      create: () => runs++,
    });

    const run = bind({
      "state.*": wildcard,
    });

    run(() => ({ state: { foo: {}, bar: {} } }));

    expect(runs).toBe(2);
  });

  it("executes create on multiple matches in the middle of json path", () => {
    let runs = 0;

    const test = () => ({
      create: () => runs++,
    });

    const run = bind({
      "state.*.test": test,
    });

    run(() => ({ state: { foo: { test: {} }, bar: { test: {} } } }));

    expect(runs).toBe(2);
  });

  it("executes an update when a field is updated", () => {
    let runs = 0;

    const foo = () => ({
      update: () => runs++,
    });

    const run = bind({
      "state.foo": foo,
    });

    run(() => ({ state: { foo: {} } }))((state) => {
      state.state.foo = { huh: 1 };
    });

    expect(runs).toBe(1);
  });

  it("executes an update when a field is updated", () => {
    let runs = 0;

    const foo = () => ({
      update: () => runs++,
    });

    const run = bind({
      "state.foo": foo,
    });

    run(() => ({ state: { foo: { bar: 0 } } }))((state) => {
      state.state.foo.bar += 1;
    });

    expect(runs).toBe(1);
  });

  it("does not execute an update when a field is not updated", () => {
    let runs = 0;

    const foobar = () => ({
      update: () => runs++,
    });

    const run = bind({
      "state.foo": foobar,
      "state.bar": foobar,
    });

    run(() => ({ state: { foo: {} } }));
    run((state) => state);

    expect(runs).toBe(0);
  });

  it("executes a delete when a field is removed", () => {
    let runs = 0;

    const foo = () => ({
      delete: () => runs++,
    });

    const run = bind({
      "state.foo": foo,
    });

    run(() => ({ state: { foo: {} } }))(() => ({ state: {} }));

    expect(runs).toBe(1);
  });

  it("executes multiple deletes when multiple fields are removed", () => {
    let runs = 0;

    const foobar = () => ({
      delete: () => runs++,
    });

    const run = bind({
      "state.foo": foobar,
      "state.bar": foobar,
    });

    run(() => ({ state: { foo: {}, bar: {} } }))(() => ({ state: {} }));

    expect(runs).toBe(2);
  });

  it("runs two sequential updates", () => {
    let runs = 0;

    const mediator = () => ({
      update: () => {
        runs++;
      },
    });

    const run = bind({
      foo: mediator,
    });

    run(() => ({ foo: 0 }))((state) => {
      state.foo += 1;
    })((state) => {
      state.foo += 1;
    });

    expect(runs).toBe(2);
  });

  it("runs a create, update and delete", () => {
    let status = null;

    const run = bind({
      foo: () => {
        return {
          create: () => {
            status = "created";
          },
          update: () => {
            status = "updated";
          },
          delete: () => {
            status = "deleted";
          },
        };
      },
    });

    run(() => ({ foo: 0 }));
    expect(status).toBe("created");

    run((state) => {
      state.foo += 1;
    });
    expect(status).toBe("updated");

    run(() => ({}));
    expect(status).toBe("deleted");
  });

  it("exposes the updated state in the update method", () => {
    let newData;

    const foo = () => ({
      update: (data) => {
        newData = data;
      },
    });

    const run = bind({
      foo,
    });

    run(() => ({ foo: 0 }))((state) => {
      state.foo++;
    });

    expect(newData).toEqual(1);
  });

  it("allows for nested routes", () => {
    let runs = 0;

    const foo = () => {
      const run = bind({
        bar: () => ({
          create: () => runs++,
        }),
      });

      return {
        create: (state) => run(() => state),
        update: (state) => run(() => state),
        delete: (state) => run(() => state),
      };
    };

    const run = bind({
      "state.foo": foo,
    });

    run(() => ({ state: { foo: { bar: {} } } }));

    expect(runs).toBe(1);
  });

  it("allows classes to be used", () => {
    let runs = 0;

    class Foo {
      create() {
        runs++;
      }
    }

    const run = bind({
      foo: () => new Foo(),
    });

    run(() => ({ foo: {} }));

    expect(runs).toBe(1);
  });

  it("runs a single delete on popping a list", () => {
    let runs = 0;

    const foo = () => ({
      delete: () => runs++,
    });

    const run = bind({
      "state.foo[*]": foo,
    });

    run(() => ({ state: { foo: [1, 2, 3] } }));
    run((state) => {
      state.state.foo.pop();
    });

    expect(runs).toBe(1);
  });

  it("runs creates in list order", () => {
    let order = [];

    const foo = () => ({
      create: (data) => order.push(data),
    });

    const run = bind({
      "state.foo[*]": foo,
    });

    run(() => ({ state: { foo: [1, 2, 3] } }));

    expect(order).toEqual([1, 2, 3]);
  });
});
