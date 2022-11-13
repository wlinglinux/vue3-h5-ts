declare interface IConstItem {
  name: string
  value: string | number
  key?: string
}

declare interface IConstObj {
  [index: string | number]: string | number
}