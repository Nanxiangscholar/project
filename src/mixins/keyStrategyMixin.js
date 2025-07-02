import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('app', ['keyStrategy'])
  },
  methods: {
    getItemKey(item, index) {
      switch (this.keyStrategy) {
        case 'id':
          return item.id
        case 'index':
          return index
        case 'key':
          return item.key || index
        case 'none':
          return index
        default:
          return item.id
      }
    }
  }
} 