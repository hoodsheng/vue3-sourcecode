import { isObject } from "@vue/shared";
import { mutablehandlers, ReactiveFlags } from "./baseHandler";

// 如果同一个对象代理多次，则缓存一下
const reactiveMap = new WeakMap(); // 记录依赖关系，key只能是对象

// 将数据转换成响应式数据，只能做对象的代理
export function reactive(target) {
  // 如果是对象，则return，否者就去代理
  if (!isObject(target)) {
    return;
  }

  // 如果目标是一个代理对象，那么一定被代理过，就一定会走get，返回true，也就返回了原代理对象target
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }

  // 如果对象被代理过，就直接返回
  let exisitingProxy = reactiveMap.get(target);
  if (exisitingProxy) return exisitingProxy;

  // let target = {
  //   name: "hood",
  //   get alias() {
  //     return this.name;
  //   },
  // };
  const proxy = new Proxy(target, mutablehandlers);
  // 将原对象和代理对象关联
  reactiveMap.set(target, proxy);
  return proxy;
}
