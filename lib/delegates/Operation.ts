/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */

import Functor from "../utilities/Functor";
import State from "./State";

export default class Operation extends Functor {
  path: string;

  dependencies: Array<string>;

  dependents: Array<string>;

  constructor(path: string, fn: Function, cacheable: boolean, dependents = [], dependencies = []) {
    super();

    this.__call__ = async (args) => {
      let result;

      try {
        result = await fn(args);

        if (!(result instanceof State)) {
          console.log("Unexpected result:", result);
          throw new Error("Internal Server Error.");
        }
      } catch (err) {
        console.log(err);
        result = State.INTERNAL_SERVER_ERROR("An error occurred.");
      }

      this.dependencies.forEach((_path) => result.__meta__.dependencies.add(_path));

      return result;
    };

    this.path = path;
    this.dependents = cacheable ? [] : [path, ...dependents];
    this.dependencies = cacheable ? [path, ...dependencies] : [];
  }

  isRead() {
    return this.dependents.length === 0;
  }

  isWrite() {
    return this.dependents.length > 0;
  }
}
