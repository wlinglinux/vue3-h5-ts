
declare interface IGeneralControl { 
  ele_key: string,                        // 通用接口类型 GENERAL_TYPES_MAP
  relateCompId: string,                   // 关联触发组件id
  getCompId: string,                   // 关联获取数据组件id
  ext_1: string,                          // 扩展属性1
  ext_2: string,                          // 扩展属性2
  ext_4: string,                          // 扩展属性3
  ext_3: string,                          // 扩展属性4
  ext_5: string,                          // 扩展属性5
  ext_key: string,                          // 扩展字段key

  isJoin: boolean
  isattend: boolean
}
