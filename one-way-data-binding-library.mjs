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
      reverse: false,
      rtn: ["key", "value", "matchedBy"],
    })(state).forEach(([key, data, matchedBy]) => {
      console.log(key);
      matchedBy.forEach((match) => {
        // No binding exists for this key; bind and call create method
        if (!(key in bound)) {
          bound[key] = { methods: bindings[match](), data };
          if (bound[key].methods.create) {
            bound[key].methods.create(data, state);
          }
        }
        // Binding exists and data reference has changed; call update method
        else if (bound[key].methods.update && data !== bound[key].data) {
          bound[key].methods.update(data, state);
        }

        nextBound[key] = { methods: bound[key].methods, data };
      });
    });

    Object.keys(bound).forEach((key) => {
      if (!(key in nextBound) || nextBound[key] === undefined) {
        console.log("delete", key);
        bound[key].methods.delete?.(state);
      }
    });

    bound = nextBound;

    return processor;
  };

  return processor;
};
