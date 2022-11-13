
declare interface IMsgControl extends IBaseListControl{ 
  send_uid: string,                        // 发送用户uid
  rec_uid: string,                         //关联组件id
  elements: string[],        
}
