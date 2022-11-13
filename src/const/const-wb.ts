import { INJECT_GROUP_CLASS_NAME_MAP } from './const-inject-class'

const CONTROL_TYPES = 
{
	wb_vote: '1001',//之前key是vote，修改后需要将代码替换下 CONTROL_TYPES.vote 改为 CONTROL_TYPES.wb_vote
  wb_number: '1002',
  wb_repost: '1003',
  wb_push: '1004',
  wb_msg: '1005',
  wb_praise: '1006',
  wb_follow: '1007',
  // wb_is_follow: 'isFollow',
  wb_packet: '1008',
  wb_lottery: '1009',
  wb_reposts: '1010',
  wb_rank_friend: '1011',
  wb_judge_right_wrong: '1012',//获取通用
  wb_user: '1013',
  wb_activity_info: '1014',
  wb_general: '1015',//触发通用
  wb_general_num: '1016',
  // wb_report_pasture_plan: '1017',
  wb_number_day_exists: '1018',
  wb_submit: 'submit',
  wb_timer: 'timer',
}

const WB_LISTS_CONTROL_ID = [
  CONTROL_TYPES.wb_reposts,
  CONTROL_TYPES.wb_rank_friend,
  CONTROL_TYPES.wb_judge_right_wrong,
  CONTROL_TYPES.wb_user,
  CONTROL_TYPES.wb_push,
  CONTROL_TYPES.wb_repost,
  CONTROL_TYPES.wb_msg,
  CONTROL_TYPES.wb_vote,
  CONTROL_TYPES.wb_lottery,
]


const COMPONENT_TYPES  = {
  wb_text: 1,
  wb_img: 2,
  wb_audio: 3,
  wb_video: 4,

  wb_imgs: 11,

  wb_timer: 14,

  wb_menu: 18,
  wb_share: 19,

  wb_camera: 20,
  wb_turn_book: 21,
  wb_scroll_container: 22,
  wb_moveable: 23,
  wb_calendar: 24,
  // wb_grasp_doll: 25,

  // wb_head: 52,
  
  // wb_carousel: 63,
  wb_common_list: 64,
  wb_is_post_event: 65,
  // wb_table: 69,
  wb_slot_machine: 70,

  wb_input: 100,
  wb_btn: 101,
  // wb_form_score: 103,
  wb_radio: 104,
  wb_checkbox: 105,
  wb_dropdown: 106,
  // wb_form: 107,
  wb_address: 108,
  wb_switch: 117,
  wb_upload: 116,

  wb_process: 110,
  // wb_flip_mc: 112,
  // wb_notice_bar: 113,
  // wb_icon: 114,
  wb_svg_icon: 115,
  wb_bg: 120,

  //createjs 300
  wb_bitmap_text: 304,
  wb_mc: 306,

  //paper
  wb_paper: 400,

  group_component: 500,
  group_carousel: 501,

  //phaser 1000
  wb_phasers: 1000,

  //pixi
  wb_pixis: 2004,

  //threejs
  wb_panorama: 5001,
  wb_threes: 5002,
}

const HIDDEN_EVENT_TABS = [
  COMPONENT_TYPES.wb_input,
  COMPONENT_TYPES.wb_menu,
  COMPONENT_TYPES.wb_radio,
  COMPONENT_TYPES.wb_checkbox,
  COMPONENT_TYPES.wb_dropdown,
]
const INJECT_IN_GROUPS = [
  COMPONENT_TYPES.wb_img,
  COMPONENT_TYPES.wb_btn,
  COMPONENT_TYPES.wb_bg,
]

const WB_ITEM_LISTS = [
  COMPONENT_TYPES.wb_menu,
  COMPONENT_TYPES.wb_common_list,
  COMPONENT_TYPES.wb_radio,
  COMPONENT_TYPES.wb_checkbox,
  COMPONENT_TYPES.wb_scroll_container,
]

const COMPARE_FORM = [
  COMPONENT_TYPES.wb_radio,
  COMPONENT_TYPES.wb_checkbox,
  COMPONENT_TYPES.wb_dropdown,
  COMPONENT_TYPES.wb_address,
  COMPONENT_TYPES.group_component,
]

const SUBMIT_FORM = [
  COMPONENT_TYPES.wb_text,
  COMPONENT_TYPES.wb_img,
  COMPONENT_TYPES.wb_input,
  COMPONENT_TYPES.wb_radio,
  COMPONENT_TYPES.wb_checkbox,
  COMPONENT_TYPES.wb_upload,
  COMPONENT_TYPES.wb_dropdown,
  COMPONENT_TYPES.wb_address,
  INJECT_GROUP_CLASS_NAME_MAP.CheckBox,
]

const DOM_CID = 1
const CREATEJS_CID = 300
const GROUP_COMPONENT = 500
const PHASER_CID = 1000
const PIXI_CID = 2000
const THREE_CID = 5000
const MAX_CID = 10000

export {
  CONTROL_TYPES,
  WB_LISTS_CONTROL_ID,
  COMPONENT_TYPES,
  INJECT_IN_GROUPS,
  WB_ITEM_LISTS,
  DOM_CID,
  CREATEJS_CID,
  COMPARE_FORM,
  SUBMIT_FORM,
  HIDDEN_EVENT_TABS,
}