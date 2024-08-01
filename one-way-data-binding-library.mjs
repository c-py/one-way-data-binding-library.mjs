import scan from "object-scan";
import { produce } from "immer";

export default (bindings) => {
  let state = {};
  let bound = {};

  const processor = (update) => {
    state = produce(state, update);

    const nextBound = {};

    scan(Object.keys(bindings), {
      joined: true,
      rtn: ["key", "value", "matchedBy"],
    })(state).forEach(([key, data, matchedBy]) => {
      matchedBy.forEach((match) => {
        // No binding exists for this key; bind and call create method
        if (!(key in bound)) {
          nextBound[key] = { methods: bindings[match](), data };
          if (nextBound[key].methods.create) {
            nextBound[key].methods.create(data, state);
          }
        }
        // Binding exists and data reference has changed; call update method
        else if (bound[key].methods.update && data !== bound[key].data) {
          nextBound[key] = { methods: bound[key].methods, data };
          nextBound[key].methods.update(data, state);
        }
      });
    });

    Object.keys(bound).forEach((key) => {
      if (!(key in nextBound) || nextBound[key] === undefined) {
        bound[key].methods.delete?.();
      }
    });

    bound = nextBound;

    return processor;
  };

  return processor;
};
