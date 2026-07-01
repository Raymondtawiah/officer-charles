import AuthController from './AuthController'
import CreditController from './CreditController'
import PaystackController from './PaystackController'
const Api = {
    AuthController: Object.assign(AuthController, AuthController),
CreditController: Object.assign(CreditController, CreditController),
PaystackController: Object.assign(PaystackController, PaystackController),
}

export default Api