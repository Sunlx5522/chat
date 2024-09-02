import { DirectiveBinding, nextTick } from "vue"

// 加载失败显示的图片
const defaultImg = './assets/img/img_fail.jpg'

// export default {
//   mounted(el: HTMLImageElement, binding: DirectiveBinding) {
//     // el表示使用指令的DOM元素
//     // bindings表示指令相关的信息是一个对象
//     // 指令的功能：实现图片的懒加载
//     // 1、监听图片进入可视区
//     const observer = new IntersectionObserver(([{ isIntersecting }]) => {
//       if (isIntersecting) {
//         // 进入了可视区
//         // 2、给图片的src属性赋值图片的地址
//         el.src = binding.value
//         // 取消图片的监听
//         observer.unobserve(el)
//         // 加载的图片失败了，显示默认的图片地址
//         el.onerror = () => {
//           el.src = defaultImg
//         }
//       }
//     })
//     observer.observe(el)

//   }
// }



export default {
  mounted(el: HTMLImageElement) {
    const observe = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const data_src = img.getAttribute('data-src') as string
          img.setAttribute('src', data_src)
          observe.unobserve(img)
        }
      })
    })

    // dom的创建渲染需要一定时间，这里延迟500毫秒获取，不然会获取不到里面的img属性
    setTimeout(() => {
      const imgs = el.querySelectorAll('img[data-src]')
      imgs.forEach(img => {
        observe.observe(img)
      })
    }, 500)

  }
}