const router = require('express').Router()
const uesrController = require('../controller')
router.post('/confirmation', uesrController.confirmationPost)
router.post('/resend', uesrController.resendTokenPost)