var VueReactivity = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key2 of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key2) && key2 !== except)
          __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/reactivity/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    effect: () => effect,
    reactive: () => reactive,
    ref: () => ref
  });

  // packages/reactivity/src/effect.ts
  var activeEffect = void 0;
  function cleanupEffect(effect2) {
    const { deps } = effect2;
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect2);
    }
    effect2.deps.length = 0;
  }
  var ReactiveEffect = class {
    constructor(fn, scheduler) {
      this.fn = fn;
      this.scheduler = scheduler;
      this.parent = null;
      this.active = true;
      this.deps = [];
    }
    run() {
      if (!this.active)
        this.fn();
      try {
        this.parent = activeEffect;
        activeEffect = this;
        cleanupEffect(this);
        return this.fn();
      } finally {
        activeEffect = this.parent;
        this.parent = null;
      }
    }
    stop() {
      if (this.active) {
        cleanupEffect(this);
        this.active = false;
      }
    }
  };
  function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
  }
  var targetMap = /* @__PURE__ */ new WeakMap();
  function track(target, type, key2) {
    if (activeEffect) {
      let depsMap = targetMap.get(target);
      if (!depsMap) {
        targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
      }
      let dep = depsMap.get(key2);
      if (!dep) {
        depsMap.set(key2, dep = /* @__PURE__ */ new Set());
      }
      let shouldTrack = !dep.has(activeEffect);
      if (shouldTrack) {
        dep.add(activeEffect);
        activeEffect.deps.push(dep);
      }
    }
  }
  function trigger(target, type, key2, newValue, oldValue) {
    const depsMap = targetMap.get(target);
    if (!depsMap)
      return;
    let effects = depsMap.get(key2);
    if (effects) {
      effects = new Set(effects);
      for (const effect2 of effects) {
        if (effect2 !== activeEffect) {
          if (effect2.scheduler) {
            effect2.scheduler();
          } else {
            effect2.run();
          }
        }
      }
    }
  }

  // packages/shared/src/index.ts
  function isObject(value) {
    return typeof value === "object" && value !== null;
  }

  // packages/reactivity/src/baseHandler.ts
  var mutablehandlers = {
    get(target, key2, receiver) {
      if (key2 === "__v_isReactive" /* IS_REACTIVE */) {
        return true;
      }
      let res = Reflect.get(target, key2, receiver);
      track(target, "get", key2);
      console.log("\u7528\u6237\u53D6\u503C\u4E86");
      if (isObject(res)) {
        return reactive(res);
      }
      return res;
    },
    set(target, key2, value, receiver) {
      console.log("\u7528\u6237\u8BBE\u7F6E\u4E86");
      let oldValue = target[key2];
      const result = Reflect.set(target, key2, value, receiver);
      if (oldValue !== value) {
        trigger(target, "set", key2, value, oldValue);
      }
      return result;
    }
  };

  // packages/reactivity/src/reactive.ts
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  function reactive(target) {
    if (!isObject(target)) {
      return;
    }
    if (target["__v_isReactive" /* IS_REACTIVE */]) {
      return target;
    }
    let exisitingProxy = reactiveMap.get(target);
    if (exisitingProxy)
      return exisitingProxy;
    const proxy = new Proxy(target, mutablehandlers);
    reactiveMap.set(target, proxy);
    return proxy;
  }

  // packages/reactivity/src/ref.ts
  function toReactive(value) {
    return isObject(value) ? reactive(value) : value;
  }
  var RefImpl = class {
    constructor(rawValue) {
      this.rawValue = rawValue;
      this.dep = /* @__PURE__ */ new Set();
      this.__v_isRef = true;
      this._value = toReactive(rawValue);
    }
    get value() {
      track(this.dep, "get", key);
      return this._value;
    }
    set value(newValue) {
      if (newValue !== this.rawValue) {
        this._value = toReactive(newValue);
        this.rawValue = newValue;
        trigger(this.dep, "set", key);
      }
    }
  };
  function ref(value) {
    return new RefImpl(value);
  }
  function key(dep, arg1, key2) {
    throw new Error("Function not implemented.");
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=reactivity.global.js.map
