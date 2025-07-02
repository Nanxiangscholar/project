import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters('app', ['keyStrategy'])
  },
  methods: {
    ...mapActions('app', ['updateKeyStrategy']),
    
    getItemKey(item, index) {
      switch (this.keyStrategy) {
        case 'id':
          return item.id
        case 'index':
          return index
        case 'none':
          return null
        default:
          return item.id
      }
    }
  },
  watch: {
    keyStrategy: {
      immediate: true,
      handler(newStrategy) {
        // 强制组件重新渲染以更新所有key
        if (this.$forceUpdate) {
          this.$forceUpdate()
        }
      }
    }
  }
} 