class DomTrackStats {
  constructor() {
    this.created = 0;
    this.reused = 0;
    this.destroyed = 0;
  }

  reset() {
    this.created = 0;
    this.reused = 0;
    this.destroyed = 0;
  }
}

// 确保只创建一次全局统计对象
if (!window.domTrackStats) {
  window.domTrackStats = new DomTrackStats();
}

export const domTrack = {
  bind(el, binding) {
    const key = binding.value;
    el.__domTrackKey__ = key;

    // 当元素被创建时（初次渲染或新增）
    if (!window.domTrackStats.trackedElements) {
      window.domTrackStats.trackedElements = new Set();
    }

    if (!window.domTrackStats.trackedElements.has(key)) {
      window.domTrackStats.created++;
      window.domTrackStats.trackedElements.add(key);
    } else {
      window.domTrackStats.reused++; // 如果key已经存在，说明是复用
    }
  },
  unbind(el, binding) {
    const key = binding.value;
    // 当元素被销毁时
    if (window.domTrackStats.trackedElements && window.domTrackStats.trackedElements.has(key)) {
      window.domTrackStats.destroyed++;
      window.domTrackStats.trackedElements.delete(key);
    }
  },
  update(el, binding) {
    const oldKey = el.__domTrackKey__;
    const newKey = binding.value;

    if (oldKey !== newKey) {
      // Key 变化时，旧元素被销毁，新元素被创建
      if (window.domTrackStats.trackedElements && window.domTrackStats.trackedElements.has(oldKey)) {
        window.domTrackStats.destroyed++;
        window.domTrackStats.trackedElements.delete(oldKey);
      }
      if (!window.domTrackStats.trackedElements.has(newKey)) {
        window.domTrackStats.created++;
        window.domTrackStats.trackedElements.add(newKey);
      } else {
        window.domTrackStats.reused++; // 如果新key已经存在，说明是复用
      }
      el.__domTrackKey__ = newKey;
    }
  }
};
