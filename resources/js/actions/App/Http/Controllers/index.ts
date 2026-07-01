import Api from './Api'
import Admin from './Admin'
import AiMessageController from './AiMessageController'
import Settings from './Settings'
const Controllers = {
    Api: Object.assign(Api, Api),
Admin: Object.assign(Admin, Admin),
AiMessageController: Object.assign(AiMessageController, AiMessageController),
Settings: Object.assign(Settings, Settings),
}

export default Controllers