import { ComponentTypesDefaultDom  } from '@/store/models/component-default-data'
import { COMPONENT_TYPES } from '@/const/'

function searchComponentDataById(searchId: string, pageOrGroupComponent: IGroup) : IComponent | null  {
  const components = pageOrGroupComponent.components
  const len = components.length
  for(let i = 0; i < len; i++) {
    const componentData = components[i]
    if(componentData.id == searchId){
      return componentData
    } else {
      if(componentData.components && componentData.components.length > 0) {
        const compData = searchComponentDataById(searchId, componentData)
        if(compData) {
          return compData
        }
      }
    }
  }
  return null
}

function searchComponentDataByCid(cid: number, pageOrGroupComponent: IGroup) : IComponent | null  {
  const components = pageOrGroupComponent.components
  const len = components.length
  for(let i = 0; i < len; i++) {
    const componentData = components[i]
    if(componentData.cid == cid) {
      return componentData
    } else {
      if(componentData.components && componentData.components.length > 0){
        const compData = searchComponentDataByCid(cid, componentData)
        if(compData){
          return compData
        }
      }
    }
  }
  return null
}

function getComponentDataByCid(cid: number): any {
  return ComponentTypesDefaultDom[cid]
}

function resetAllCropImgUrl(pages: IGroup[]){
  _.forEach(pages, (page: IGroup) => {
    resetCropImgUrl(page)
  })
}

function resetCropImgUrl(pageOrGroupComp: IGroup){
  _.forEach(pageOrGroupComp.components, (componentData: IComponent) => {
    if(componentData.cid == COMPONENT_TYPES.group_component || componentData.components && componentData.components.length > 0){
      resetCropImgUrl(componentData)
    }else{
      delete componentData.commonAttr.isLoadedImg
    }
  })
}

export {
  searchComponentDataById,
  searchComponentDataByCid,
  getComponentDataByCid,
  resetAllCropImgUrl
}

export {
  dealPageStyleAndAttr,
  dealPageOrGroup,
  dealGroupInjectJsClass,
} from './page-data-utils'

export {
  dealComponentData,
} from './comp-data-utils'

