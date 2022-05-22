export let activeEffect = undefined; // 当前正在执行的effect

function cleanupEffect(effect) {
  const { deps } = effect; // 清理effect
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect);
  }
  effect.deps.length = 0;
}

class ReactiveEffect {
  public parent = null;
  public active = true; // 默认这个effect是激活状态
  public deps = []; // 收集effect中使用到的属性
  constructor(public fn, public scheduler) {}
  run() {
    // 非激活状态不需要依赖收集，只需要执行fn
    if (!this.active) this.fn();

    // 依赖收集
    try {
      this.parent = activeEffect; // 当前的effect就是他的父亲
      activeEffect = this; // 设置成正在激活的是当前effect

      // 将用户函数调用之前，将之前的依赖收集清空，重新依赖收集
      cleanupEffect(this);

      return this.fn(); // 当取值的时候，就可以获取全局的activeEffect
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
}

export function effect(fn, options: any = {}) {
  // fn可以根据状态重新执行，且可以无限嵌套
  const _effect = new ReactiveEffect(fn, options.scheduler); // 创建响应式effect

  _effect.run(); // 默认先执行一次

  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner; // 返回runne
}

const targetMap = new WeakMap(); // 记录依赖关系
// 单项记录
export function track(target, type, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target); // {对象：map}
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = new Set())); // {对象：{ 属性 :[ dep, dep ]}}
    }
    let shouldTrack = !dep.has(activeEffect);
    if (shouldTrack) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep); // 让effect记住dep，这样后续可以用于清理
    }
  }
}

export function trigger(target, type, key?, newValue?, oldValue?) {
  const depsMap = targetMap.get(target); // 获取对应的映射表
  if (!depsMap) return; // 触发的值不在模板中
  let effects = depsMap.get(key);
  if (effects) {
    effects = new Set(effects);
    for (const effect of effects) {
      if (effect !== activeEffect) {
        if (effect.scheduler) {
          // 如果有调度函数则执行调度函数
          effect.scheduler();
        } else {
          // 否则默认刷新试图
          effect.run();
        }
      }
    }
  }
}
