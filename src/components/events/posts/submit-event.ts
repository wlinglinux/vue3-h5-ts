import { showToast, resetSubmitStatus, getCheckboxStr } from '@/components/utils/'
import { useSiteStore, initComponentMap } from '@/store/site'
import { useControlsStore } from '@/store/controls'
import { useInteractionStore } from '@/store/interaction'
import { COMPONENT_TYPES, INJECT_GROUP_CLASS_NAME_MAP } from '@/const/'
import { getCompIdByParam, getQueryString, isJSON } from '@/utils/'
import { POST_API_MAP } from '@/service/api'

const formItemDesc = {
  name: "姓名",
  phone: "手机",
  code: "验证码",
  email: "邮箱",
  telephone: "电话",
  other: "其他",
}
function inputForm(compData: IComponent, statusObj: any, params: any, index: number) {
  const useInteraction = useInteractionStore()
  

  let key = compData.commonAttr.name
  let inputVal = useInteraction.formValueMap[compData.id].value
  let tableName = compData.commonAttr.tableName ? compData.commonAttr.tableName : key + "_" + index
  if (compData.commonAttr.need && !inputVal) {
    statusObj.isSubmit = false
    const hint = formItemDesc[key] ? formItemDesc[key] : tableName
    statusObj.msg += hint + "项，不能为空哦！"
  }
  if(compData && compData.commonAttr.rule && inputVal){
    const rule = new RegExp(compData.commonAttr.rule)
    if(!rule.test(inputVal)){
      statusObj.isSubmit = false
      const hint = tableName ? tableName : formItemDesc[key]
      statusObj.msg += hint + "项，格式不正确"
    }
  }
  if (key == "email" && inputVal.length > 0) {
    // eslint-disable-next-line
    if (/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(inputVal)) {
    } else {
      statusObj.isSubmit = false
      statusObj.msg += "邮箱格式输入不正确"
    }
  } else if (key == "phone" || key == "telephone") {
    // eslint-disable-next-line
    if (/^1[0-9]{10}$/.test(inputVal)) {
    } else {
      statusObj.isSubmit = false
      statusObj.msg += "电话号码输入不正确"
    }
  }
  params[tableName] = inputVal
}

function textareaForm(compData: IComponent, statusObj: any, params: any, index: number) {
  const useInteraction = useInteractionStore()
  let textareaVal = useInteraction.formValueMap[compData.id] && useInteraction.formValueMap[compData.id].value;
  let tableName: string = ''
  if(textareaVal && textareaVal.length > 0) {
    tableName = compData.commonAttr.tableName ? compData.commonAttr.tableName : "textarea_" + index
    params[tableName] = textareaVal
  }else{
    if(compData.commonAttr.need) {
      statusObj.isSubmit = false
      const hint = compData.commonAttr.tableName ? compData.commonAttr.tableName : "多行文本"
      statusObj.msg = hint + "项，不能为空哦！"
    }
  }
}

function radioForm(compData: IComponent, statusObj: any, params: any, index: number) {
  const useInteraction = useInteractionStore()
  let radioChecked: boolean = false
  let radioValue: string | number = ''
  if(useInteraction.formValueMap[compData.id]) {
    radioValue = useInteraction.formValueMap[compData.id].text || useInteraction.formValueMap[compData.id].value
  }
  if(_.isString(radioValue) && radioValue.length > 0 || _.isNumber(radioValue) && _.parseInt(radioValue) >= 0) {
    const tableName = compData.commonAttr.tableName ? compData.commonAttr.tableName : 'radio_' + index
    radioChecked = true;
    params[tableName] = radioValue
  }
  if (!radioChecked && compData.commonAttr.need) {
    statusObj.isSubmit = false
    const hint = compData.commonAttr.tableName ? compData.commonAttr.tableName + ", " : '单选';
    statusObj.msg = hint + "没有选哦"
  }
}

function checkboxFrom(compData: IComponent, statusObj: any, params: any, index: number) {
  const useInteraction = useInteractionStore()
  const commonAttr = compData.commonAttr
  let { checkboxNum, strs } = getCheckboxStr(compData)
  if(commonAttr.isOther && useInteraction.formValueMap[compData.id] && useInteraction.formValueMap[compData.id].value) {
    strs += useInteraction.formValueMap[compData.id].value
  }
  let max = parseInt(commonAttr.max)
  let min = parseInt(commonAttr.min)
  if (commonAttr.need && min < 1) {
    min = 1
  }
  let tableName = commonAttr.tableName ? commonAttr.tableName : 'checkbox_' + index
  if (checkboxNum >= min && checkboxNum <= max) {
    params[tableName] = strs
  } else {
    statusObj.isSubmit = false
    const hint = commonAttr.tableName ? commonAttr.tableName + ", " : ''
    statusObj.msg = hint + "请至少选择" + min + "个选项"
  }
}

function dropdownForm(compData: IComponent, statusObj: any, params: any, index: number) {
  const useInteraction = useInteractionStore()

  let dropdownValue: string = ''
  if(useInteraction.formValueMap[compData.id]) {
    dropdownValue = useInteraction.formValueMap[compData.id].value
  }
  if(dropdownValue.length > 0) {
    let tableName = compData.commonAttr.tableName ? compData.commonAttr.tableName : 'dropdown_' + index
    params[tableName] = dropdownValue
  }
}
function addressForm(compData: IComponent, statusObj: any, params: any, index: number) {
  const useInteraction = useInteractionStore()

  let adressValue = ''
  if(useInteraction.formValueMap[compData.id]){
    adressValue = useInteraction.formValueMap[compData.id].value
  }
  if(adressValue.length > 0) {
    let tableName = compData.commonAttr.tableName ? compData.commonAttr.tableName : 'address_' + index
    params[tableName] = adressValue
  }
}
function uploadForm(compData: IComponent, statusObj: any, params: any, index: number) {
  const useInteraction = useInteractionStore()
  let tableName_: string = ''
  let uploadUrls: string | undefined = ''
  if(useInteraction.formValueMap[compData.id]) {
    uploadUrls = useInteraction.formValueMap[compData.id].urls
  }
  if(uploadUrls && uploadUrls.length > 0) {
    let urlLen = uploadUrls.length
    tableName_ = compData.commonAttr.tableName ? compData.commonAttr.tableName : ''
    for(let i = 0; i < urlLen; i++) {
      let tableName = 'upload' + tableName_ + '_' + index + '_' + i
      params[tableName] = uploadUrls[i]
    }
  } else {
    if(compData.commonAttr.need) {
      statusObj.isSubmit = false;
      statusObj.msg = '亲， 没有选择上传文件哦'
    }
  }
}
function imgForm(compData: IComponent, statusObj: any, params: any, index: number) {
  const useInteraction = useInteractionStore()
  let imgUrl: string | undefined = ''
  if(compData.commonAttr.isForm && useInteraction.formValueMap[compData.id]) {
    imgUrl = useInteraction.formValueMap[compData.id].url
  }
  if(imgUrl && imgUrl.length > 0) {
    let tableName_ = compData.commonAttr.tableName ? compData.commonAttr.tableName : ''
    let tableName = 'img' + tableName_ + '_' + index
    params[tableName] = imgUrl
  }
}

function submitEvent(item: IComponent, event: IEvent, params: any): string {
  const useSite = useSiteStore()
  const useInteraction = useInteractionStore()
  const useControls = useControlsStore()
  let url: string = ''
  
  const formValueMap = useInteraction.formValueMap
  const formCompIds: string[] = []
  _.forEach(formValueMap, (comp: any, id: string) => {
    const compData: IComponent = useSite.componentMap[id]
    if(compData.cid == COMPONENT_TYPES.wb_text) {
      if(compData.commonAttr.isEdit) {
        formCompIds.push(id)
      }
    } else {
      formCompIds.push(id)
    }
  })
  const pageComIdMap = {}
  let paramStr = item.events.submit.comps[2] && item.events.submit.comps[2].attrs.value
  let groupCompId = ""
  if(paramStr && isJSON(paramStr)){
    groupCompId = JSON.parse(paramStr).groupCompId
  }
  const groupComponents = useSite.componentMap[groupCompId]
  const currentComponents = groupComponents && groupComponents.components && groupComponents.components.length > 0 ? groupComponents : useSite.getCurrentPage
  initComponentMap(pageComIdMap, currentComponents)
  const pageCompIds: string[] = []
  _.forEach(pageComIdMap, (comp: IComponent, id: string) => {
    pageCompIds.push(id)
  })

  const pageFormCompIds = _.intersection(pageCompIds, formCompIds)
  let formItem: IFormValueItem 
  let compData: IComponent | null
  let compId: string = ''
  let injectJsClass: string = ''
  const statusObj = { isSubmit: true, msg: '' }
  const formParams = {}
  _.forEach(pageFormCompIds, (id: string, index: number) => {
    formItem = formValueMap[id]
    compData = useSite.componentMap[id]
    compId = id
    if(compData) {
      injectJsClass = compData.commonAttr.injectJsClass
      if(compData.cid == COMPONENT_TYPES.wb_input) {
        inputForm(compData, statusObj, formParams, index)
      } else if (compData.cid == COMPONENT_TYPES.wb_text) {
        if(compData.commonAttr.isEdit) {
          textareaForm(compData, statusObj, formParams, index)
        }
      } else if (compData.cid == COMPONENT_TYPES.wb_radio || injectJsClass == INJECT_GROUP_CLASS_NAME_MAP.MenuByBtns) {
        radioForm(compData, statusObj, formParams, index)
      } else if (compData.cid == COMPONENT_TYPES.wb_checkbox || injectJsClass == INJECT_GROUP_CLASS_NAME_MAP.CheckBox) {
        checkboxFrom(compData, statusObj, formParams, index)
      } else if (compData.cid == COMPONENT_TYPES.wb_dropdown) {
        dropdownForm(compData, statusObj, formParams, index)
      } else if (compData.cid == COMPONENT_TYPES.wb_address) {
        addressForm(compData, statusObj, formParams, index)
      } else if (compData.cid == COMPONENT_TYPES.wb_upload) {
        uploadForm(compData, statusObj, formParams, index)
      } else if (compData.cid == COMPONENT_TYPES.wb_img) {
        imgForm(compData, statusObj, formParams, index)
      }
    }
  })

  let { isSubmit, msg } = statusObj
  if (_.keys(formParams).length <= 0) {
    msg = "没有填写必填项或是没有选则必选项！"
    isSubmit = false
  }
  if (isSubmit) {
      // 获取 controls
      const submitControlData: ISubmitControl = useControls.controls[item.id].submit.data as ISubmitControl
      let compId: string = item.id
      const relateCompId = getCompIdByParam(submitControlData.relateCompId)
      if(submitControlData && relateCompId) {
        compId = relateCompId
      }
      // post
      let fr = getQueryString("stfr")
      _.merge(params, { data_str: JSON.stringify(formParams), fr: fr ? fr : "", com_id: compId })
      //提交按钮只能提交一次
      if (!useSite.siteInfo.formIsSubmit) {
        resetSubmitStatus(item.eventShare)
        showToast("提交数据是一样的, 不要重复提交哦！！")
      } else {
        url = POST_API_MAP.submit
        useSite.updateFormIsSubmit(false)
      }
  } else {
    resetSubmitStatus(item.eventShare)
    showToast(msg)
  }
  return url
}
export {
  submitEvent
}