class LoadExternalScript {
  static DYNAMICS_LOAD_SCRIPT  = {}
}
function dynamicsLoadScript (url: string, attr: string, cb: Function, groupId?: string) {
  let attrs = attr.split(".")
  let attr_ = ''
  if(attrs.length > 1) {
    attr_ = attrs[0]
    if(window[attrs[0]] && window[attrs[0]][attrs[1]]) {
      if(cb) {
        cb(window[attr_])
      }
      return
    }
  }else{
    attr_ = attr
    if(window[attr]) {
      if(cb) {
        cb(window[attr_])
      }
      return
    }
  }
  let dynamicsScript = LoadExternalScript.DYNAMICS_LOAD_SCRIPT
  if(!dynamicsScript[attr]) {
    dynamicsScript[attr] = { isLoading: false,  cbs: [], groupId }
  }
  if(dynamicsScript[attr].isLoading){
    if(cb) {
      dynamicsScript[attr].cbs.push(cb)
    }
  } else {
    if(cb) {
      dynamicsScript[attr].cbs.push(cb)
    }
    dynamicsScript[attr].isLoading = true
    let script: any = document.createElement("script")
    script.type = "text/javascript"
    script.charset = "utf-8"
    script.src = url
    script.onload = script.onreadystatechange = function() {
      if (
        !this.readyState || //这是FF的判断语句，因为ff下没有readyState这人值，IE的readyState肯定有值
        this.readyState == "loaded" ||
        this.readyState == "complete" // 这是IE的判断语句
      ) {
        let cbs: any
        let groupId_ = dynamicsScript[attr].groupId;
        let groupObj = dynamicsScript[groupId_];
        let isCallback = false;
        if(groupId_){
          cbs = groupObj.cbs
          groupObj.currentNum++
          delete dynamicsScript[attr].groupId
          if(groupObj.currentNum >= groupObj.totalNum) {
            isCallback = true
          }else{
            if(!groupObj.isParallel) {
              let i = groupObj.currentNum
              let url_ = groupObj.urls[i]
              let attr_ = groupObj.attrs[i]
              let cb_ = groupObj.cbs[0]
              dynamicsLoadScript(url_, attr_, cb_, groupId_)
            }
          }
        }else{
          cbs = dynamicsScript[attr].cbs
          isCallback = true
        }
        if(isCallback && cbs.length > 0) {
          _.forEach(cbs, (cb: Function) => {
            if(cb) {
              if(!window[attr]) {
                window[attr] = attr
              }
              cb(window[attr_])
            }
          })
        }
      }
    };
    document.body.appendChild(script)
  }
} 
function dynamicsLoadScripts (urls: string, attrs: string, cb: Function, isParallel = true) {
  let groupId = attrs[0] + "_Group_Id_" +  _.random(0, 50)
  let dynamicsScript = LoadExternalScript.DYNAMICS_LOAD_SCRIPT

  if(!dynamicsScript[groupId]) {
    dynamicsScript[groupId] = { currentNum: 0, totalNum: urls.length, cbs: [cb], isParallel, urls, attrs }
  }
  
  for(let i = 0, len = urls.length; i < len; i++){
    let url = urls[i]
    let attr = attrs[i]
    if(isParallel) {
      dynamicsLoadScript(url, attr, cb, groupId)
    }else{
      dynamicsLoadScript(url, attr, cb, groupId)
      break
    }
  }
}

export {
  dynamicsLoadScript
}