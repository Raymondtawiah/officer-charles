import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PaystackController::initialize
 * @see app/Http/Controllers/Api/PaystackController.php:20
 * @route '/api/paystack/initialize'
 */
export const initialize = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: initialize.url(options),
    method: 'post',
})

initialize.definition = {
    methods: ["post"],
    url: '/api/paystack/initialize',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PaystackController::initialize
 * @see app/Http/Controllers/Api/PaystackController.php:20
 * @route '/api/paystack/initialize'
 */
initialize.url = (options?: RouteQueryOptions) => {
    return initialize.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PaystackController::initialize
 * @see app/Http/Controllers/Api/PaystackController.php:20
 * @route '/api/paystack/initialize'
 */
initialize.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: initialize.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\PaystackController::initialize
 * @see app/Http/Controllers/Api/PaystackController.php:20
 * @route '/api/paystack/initialize'
 */
    const initializeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: initialize.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\PaystackController::initialize
 * @see app/Http/Controllers/Api/PaystackController.php:20
 * @route '/api/paystack/initialize'
 */
        initializeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: initialize.url(options),
            method: 'post',
        })
    
    initialize.form = initializeForm
/**
* @see \App\Http\Controllers\Api\PaystackController::verify
 * @see app/Http/Controllers/Api/PaystackController.php:70
 * @route '/api/paystack/verify/{reference}'
 */
export const verify = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verify.url(args, options),
    method: 'get',
})

verify.definition = {
    methods: ["get","head"],
    url: '/api/paystack/verify/{reference}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PaystackController::verify
 * @see app/Http/Controllers/Api/PaystackController.php:70
 * @route '/api/paystack/verify/{reference}'
 */
verify.url = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { reference: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    reference: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        reference: args.reference,
                }

    return verify.definition.url
            .replace('{reference}', parsedArgs.reference.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PaystackController::verify
 * @see app/Http/Controllers/Api/PaystackController.php:70
 * @route '/api/paystack/verify/{reference}'
 */
verify.get = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verify.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\PaystackController::verify
 * @see app/Http/Controllers/Api/PaystackController.php:70
 * @route '/api/paystack/verify/{reference}'
 */
verify.head = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verify.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\PaystackController::verify
 * @see app/Http/Controllers/Api/PaystackController.php:70
 * @route '/api/paystack/verify/{reference}'
 */
    const verifyForm = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: verify.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\PaystackController::verify
 * @see app/Http/Controllers/Api/PaystackController.php:70
 * @route '/api/paystack/verify/{reference}'
 */
        verifyForm.get = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verify.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\PaystackController::verify
 * @see app/Http/Controllers/Api/PaystackController.php:70
 * @route '/api/paystack/verify/{reference}'
 */
        verifyForm.head = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verify.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    verify.form = verifyForm
/**
* @see \App\Http\Controllers\Api\PaystackController::webhook
 * @see app/Http/Controllers/Api/PaystackController.php:100
 * @route '/api/paystack/webhook'
 */
export const webhook = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: webhook.url(options),
    method: 'post',
})

webhook.definition = {
    methods: ["post"],
    url: '/api/paystack/webhook',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PaystackController::webhook
 * @see app/Http/Controllers/Api/PaystackController.php:100
 * @route '/api/paystack/webhook'
 */
webhook.url = (options?: RouteQueryOptions) => {
    return webhook.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PaystackController::webhook
 * @see app/Http/Controllers/Api/PaystackController.php:100
 * @route '/api/paystack/webhook'
 */
webhook.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: webhook.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\PaystackController::webhook
 * @see app/Http/Controllers/Api/PaystackController.php:100
 * @route '/api/paystack/webhook'
 */
    const webhookForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: webhook.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\PaystackController::webhook
 * @see app/Http/Controllers/Api/PaystackController.php:100
 * @route '/api/paystack/webhook'
 */
        webhookForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: webhook.url(options),
            method: 'post',
        })
    
    webhook.form = webhookForm
const PaystackController = { initialize, verify, webhook }

export default PaystackController