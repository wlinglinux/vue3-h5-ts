
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


declare interface IFileUploadItem {
  url: string,
  name: string,
  type: number,//分类,暂时默认1,用处待定
  suffix: string,//后缀
  size: number,//大小
  site_id: number,//站点名称
}