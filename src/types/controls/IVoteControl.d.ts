
declare interface IVoteControl extends IBaseListControl { 
  day_limit: number,                   //每个用户每天分配票数
  isUid: boolean,                      // 个人行为
  syn_com_id: string ,                 // 触发投票关联id
  syn_vote_ids: string,                // 关联投票ids
  vote_coefficient: number,            // 系数
  elements: IVoteMap,
}

declare interface IVoteMap {
  [index: string]: IVoteMapItem
}

declare interface IVoteMapItem{
  base: number,       // 调整投票基数
  num: number,       
  progress: number,
  total: number,       // 限制投票数
}


