import { isObject } from "@vue/shared";
import { track, trigger } from "./effect";
import { reactive } from "./reactive";

function toReactive(value) {
  // 是否为对象
  return isObject(value) ? reactive(value) : value;
}

class RefImpl {
  public dep = new Set();
  public _value;
  public __v_isRef = true;
  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }
  get value() {
    // 依赖收集
    track(this.dep, "get", key);
    return this._value;
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      // newValue 可能还是个对象，所以要继续判断是否为对象，形成递归
      this._value = toReactive(newValue);
      this.rawValue = newValue;
      trigger(this.dep, "set", key); // 触发更新
    }
  }
}

export function ref(value) {
  return new RefImpl(value); // 将值进行装包
}

function key(dep: Set<unknown>, arg1: string, key: any) {
  throw new Error("Function not implemented.");
}

// const state = reactive({
//   name: "hood",
//   age: 18,
// });
// const { name, age } = state;
// effect(() => {
//   // 结构出来丢失响应式
//   document.getElementById(
//     "app"
//   ).innerHTML = `${name}今年${age}岁了`;
// });
// setTimeout(() => {
//   state.age = 20;
// }, 1000);

// 将.value属性代理到原始数据上
class ObjectRefImpl {
  public __v_isRef = true;
  constructor(public _object, public _key) {}
  get value() {
    return this._object[this._key];
  }
  set value(newVal) {
    this._object[this._key] = newVal;
  }
}

export function toRef(object, key) {
  // 将响应式对象中的某个属性转化成ref
  return new ObjectRefImpl(object, key);
}
export function toRefs(object) {
  // 将所有的属性转换成ref
  const ret = Array.isArray(object) ? new Array(object.length) : {};
  for (const key in object) {
    ret[key] = toRef(object, key);
  }
  return ret;
}
