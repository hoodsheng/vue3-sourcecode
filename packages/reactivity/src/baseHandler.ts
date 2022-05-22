import { isObject } from "@vue/shared";
import { track, trigger } from "./effect";
import { reactive } from "./reactive";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}

export const mutablehandlers = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      // 在get中增加标识，当获取IS_REACTIVE时返回true
      return true;
    }
    let res = Reflect.get(target, key, receiver);
    track(target, "get", key); // 依赖收集
    // Reflect可以改变原对象的this指向，指向proxy
    //  receiver指代理对象proxy
    console.log("用户取值了");

    if (isObject(res)) {
      // 深度代理
      return reactive(res);
    }

    return res;
  },
  set(target, key, value, receiver) {
    console.log("用户设置了");
    let oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, "set", key, value, oldValue);
    }
    return result;
  },
};
