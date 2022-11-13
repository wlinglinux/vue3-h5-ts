
declare interface IJudgeRightWrongControl extends IBaseListControl { 
  area: any[],                            
  area_code: string,
  ele_key: string,               // GENERAL_TYPES_MAP        
  relateCompId: string,                  
  right: IRight,
  elements: any[],
  [key: string]: any
}

declare interface IRight  { 
  gift: IGift,
  key: string,
  value: string
}

declare interface IGift  { 
  name: string 
  pic_url: string, 
  link: string
}
