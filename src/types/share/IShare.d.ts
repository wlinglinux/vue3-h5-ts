declare interface IWxTicket {
  appId: string
  jsapiTicket: string
  nonceStr: string
  rawString: string
  signature: string
  timestamp: number
  url: string
}