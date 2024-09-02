import { Subscribe } from "@/type";
import { onBeforeUnmount } from "vue";

export default function (subList: Subscribe[]) {
  subList.forEach((item, index, list) => {
    list[index]['token'] = PubSub.subscribe(item.msgName, item.callback)
  })

  onBeforeUnmount(() => {
    subList.forEach(item => {
      PubSub.unsubscribe(item.token as string)
    })
  })
}