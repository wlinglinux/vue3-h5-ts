
declare interface ICard166 {
  id: string
  biz: IBiz
  display_name: string
  summary: string
  tips: string
  url: string
  object_type: string
  links: ILink
  target_url: string
  image: IImage
  url_long: string
  card_info: ICardInfo
}

declare interface IBiz {
  biz_id: string
  containerid: string
}

declare interface ILink {
  url: string
  scheme: string
}

declare interface IImage {
  width: number
  height: number
  url: string
}


declare interface ICardInfo {
  card_type: number              //166
  lc_isplay: number              //是否播放动画   1 == 播
  scheme: string                 //"sinaweibo://detail/?mblogid=Jx15N4hUl",    //点击跳转
  lc_background: string          //背景图
  lc_lotties: ILcLottyItem[]     //lottie资源
  lc_infos: ILcInfoItem[]        //左上角文字
  lc_content: ILcContent         //左下角文字
  lc_round_img: string           //
  lc_button: ILcButton           //右下角按钮
}

declare interface ILcLottyItem {
  key: string
  url: string
}
declare interface ILcInfoItem {
  text_size: number
  bg_start_color: string
  text: string
  text_color: string
  bg_end_color: string
}

declare interface ILcContent {
  text_size: number
  text: string
  text_color: string
}
declare interface ILcButton {
  text_size: number
  bg_start_color: string
  bg_line_color: string
  text: string
  text_color: string
  bg_end_color: string
}