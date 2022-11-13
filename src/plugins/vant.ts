import { 
  Loading, 
  Lazyload,
  Button, 
  Field, 
  Dialog, 
  Toast,
  Overlay,
  Picker, 
  Popup, 
  DropdownMenu, 
  DropdownItem,
  Image,
  NoticeBar,
  CountDown,
  Checkbox, 
  CheckboxGroup, 
  Switch,
  Radio, 
  RadioGroup, 
  CellGroup,
  Progress,
  Cell,
  Form,
  Icon,
  Calendar,
  Area,
  Uploader
} from 'vant'

export default function (app) {
  app
    .use(Lazyload)
    .use(Loading)
    .use(Button)
    .use(Field)
    .use(Dialog)
    .use(Toast)
    .use(Overlay)
    .use(Picker)
    .use(Popup)
    .use(DropdownMenu)
    .use(DropdownItem)
    .use(Image)
    .use(NoticeBar)
    .use(CountDown)
    .use(Checkbox)
    .use(CheckboxGroup)
    .use(Switch)
    .use(Radio)
    .use(RadioGroup)
    .use(CellGroup)
    .use(Progress)
    .use(Form)
    .use(Cell)
    .use(Icon)
    .use(Calendar)
    .use(Area)
    .use(Uploader)
}


