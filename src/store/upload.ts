import { defineStore, acceptHMRUpdate } from 'pinia'
import { useSiteStore } from '@/store/site'



declare interface IUpload {
  fileUploadData: IFileUploadData
}

declare interface IFileUploadData {
  site_id: string
  type: number
  AWSAccessKeyId: string
  key: string
  acl: string
  success_action_status: string
  'Content-Type': string
  'Content-Disposition': string
  uid: string
  Policy: string
  Signature: string
}

class FileUploadData implements IFileUploadData {
  site_id: string = ''
  type: number = 0
  AWSAccessKeyId: string = "SINA000000ROQDH4Z6NW"
  key: string = "upload\/biz\/1\/${filename}"
  acl: string = "public-read"
  success_action_status: string = "201"
  'Content-Type': string = "application\/octet-stream"
  'Content-Disposition': string = "attachment; filename=${filename}"
  uid: string = "123"
  Policy: string = ""
  Signature: string = "E81D+t4N6G+j+Ud9zE+Q8Z8pqYE="
}

export const useUploadStore = defineStore('upload',{
  state: (): IUpload => {
    return {
      fileUploadData: new FileUploadData(),           //上传图片需要验证数据 后台返回的
    }
  },
  getters: {

  },
  actions: {
    updateFileUploadData(data: IFileUploadData) {
      const useSite = useSiteStore()
      data.key = data.key.split("$")[0]
      this.fileUploadData = _.merge({ site_id: useSite.siteInfo.id, type: 1 }, data)
    }
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUploadStore, import.meta.hot))
}