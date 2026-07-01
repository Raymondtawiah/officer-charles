import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\CreditController::packages
 * @see app/Http/Controllers/Api/CreditController.php:18
 * @route '/api/credit-packages'
 */
export const packages = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: packages.url(options),
    method: 'get',
})

packages.definition = {
    methods: ["get","head"],
    url: '/api/credit-packages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CreditController::packages
 * @see app/Http/Controllers/Api/CreditController.php:18
 * @route '/api/credit-packages'
 */
packages.url = (options?: RouteQueryOptions) => {
    return packages.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CreditController::packages
 * @see app/Http/Controllers/Api/CreditController.php:18
 * @route '/api/credit-packages'
 */
packages.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: packages.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CreditController::packages
 * @see app/Http/Controllers/Api/CreditController.php:18
 * @route '/api/credit-packages'
 */
packages.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: packages.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CreditController::packages
 * @see app/Http/Controllers/Api/CreditController.php:18
 * @route '/api/credit-packages'
 */
    const packagesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: packages.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CreditController::packages
 * @see app/Http/Controllers/Api/CreditController.php:18
 * @route '/api/credit-packages'
 */
        packagesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: packages.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CreditController::packages
 * @see app/Http/Controllers/Api/CreditController.php:18
 * @route '/api/credit-packages'
 */
        packagesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: packages.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    packages.form = packagesForm
/**
* @see \App\Http\Controllers\Api\CreditController::balance
 * @see app/Http/Controllers/Api/CreditController.php:25
 * @route '/api/credits/balance'
 */
export const balance = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: balance.url(options),
    method: 'get',
})

balance.definition = {
    methods: ["get","head"],
    url: '/api/credits/balance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CreditController::balance
 * @see app/Http/Controllers/Api/CreditController.php:25
 * @route '/api/credits/balance'
 */
balance.url = (options?: RouteQueryOptions) => {
    return balance.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CreditController::balance
 * @see app/Http/Controllers/Api/CreditController.php:25
 * @route '/api/credits/balance'
 */
balance.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: balance.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CreditController::balance
 * @see app/Http/Controllers/Api/CreditController.php:25
 * @route '/api/credits/balance'
 */
balance.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: balance.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CreditController::balance
 * @see app/Http/Controllers/Api/CreditController.php:25
 * @route '/api/credits/balance'
 */
    const balanceForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: balance.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CreditController::balance
 * @see app/Http/Controllers/Api/CreditController.php:25
 * @route '/api/credits/balance'
 */
        balanceForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: balance.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CreditController::balance
 * @see app/Http/Controllers/Api/CreditController.php:25
 * @route '/api/credits/balance'
 */
        balanceForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: balance.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    balance.form = balanceForm
/**
* @see \App\Http\Controllers\Api\CreditController::history
 * @see app/Http/Controllers/Api/CreditController.php:32
 * @route '/api/credits/history'
 */
export const history = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/api/credits/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CreditController::history
 * @see app/Http/Controllers/Api/CreditController.php:32
 * @route '/api/credits/history'
 */
history.url = (options?: RouteQueryOptions) => {
    return history.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CreditController::history
 * @see app/Http/Controllers/Api/CreditController.php:32
 * @route '/api/credits/history'
 */
history.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\CreditController::history
 * @see app/Http/Controllers/Api/CreditController.php:32
 * @route '/api/credits/history'
 */
history.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\CreditController::history
 * @see app/Http/Controllers/Api/CreditController.php:32
 * @route '/api/credits/history'
 */
    const historyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: history.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\CreditController::history
 * @see app/Http/Controllers/Api/CreditController.php:32
 * @route '/api/credits/history'
 */
        historyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: history.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\CreditController::history
 * @see app/Http/Controllers/Api/CreditController.php:32
 * @route '/api/credits/history'
 */
        historyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: history.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    history.form = historyForm
/**
* @see \App\Http\Controllers\Api\CreditController::deduct
 * @see app/Http/Controllers/Api/CreditController.php:139
 * @route '/api/credits/deduct'
 */
export const deduct = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deduct.url(options),
    method: 'post',
})

deduct.definition = {
    methods: ["post"],
    url: '/api/credits/deduct',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CreditController::deduct
 * @see app/Http/Controllers/Api/CreditController.php:139
 * @route '/api/credits/deduct'
 */
deduct.url = (options?: RouteQueryOptions) => {
    return deduct.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CreditController::deduct
 * @see app/Http/Controllers/Api/CreditController.php:139
 * @route '/api/credits/deduct'
 */
deduct.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deduct.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CreditController::deduct
 * @see app/Http/Controllers/Api/CreditController.php:139
 * @route '/api/credits/deduct'
 */
    const deductForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: deduct.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CreditController::deduct
 * @see app/Http/Controllers/Api/CreditController.php:139
 * @route '/api/credits/deduct'
 */
        deductForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: deduct.url(options),
            method: 'post',
        })
    
    deduct.form = deductForm
/**
* @see \App\Http\Controllers\Api\CreditController::purchase
 * @see app/Http/Controllers/Api/CreditController.php:41
 * @route '/api/stripe/purchase'
 */
export const purchase = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: purchase.url(options),
    method: 'post',
})

purchase.definition = {
    methods: ["post"],
    url: '/api/stripe/purchase',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CreditController::purchase
 * @see app/Http/Controllers/Api/CreditController.php:41
 * @route '/api/stripe/purchase'
 */
purchase.url = (options?: RouteQueryOptions) => {
    return purchase.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CreditController::purchase
 * @see app/Http/Controllers/Api/CreditController.php:41
 * @route '/api/stripe/purchase'
 */
purchase.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: purchase.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CreditController::purchase
 * @see app/Http/Controllers/Api/CreditController.php:41
 * @route '/api/stripe/purchase'
 */
    const purchaseForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: purchase.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CreditController::purchase
 * @see app/Http/Controllers/Api/CreditController.php:41
 * @route '/api/stripe/purchase'
 */
        purchaseForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: purchase.url(options),
            method: 'post',
        })
    
    purchase.form = purchaseForm
/**
* @see \App\Http\Controllers\Api\CreditController::webhook
 * @see app/Http/Controllers/Api/CreditController.php:90
 * @route '/api/stripe/webhook'
 */
export const webhook = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: webhook.url(options),
    method: 'post',
})

webhook.definition = {
    methods: ["post"],
    url: '/api/stripe/webhook',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\CreditController::webhook
 * @see app/Http/Controllers/Api/CreditController.php:90
 * @route '/api/stripe/webhook'
 */
webhook.url = (options?: RouteQueryOptions) => {
    return webhook.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CreditController::webhook
 * @see app/Http/Controllers/Api/CreditController.php:90
 * @route '/api/stripe/webhook'
 */
webhook.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: webhook.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\CreditController::webhook
 * @see app/Http/Controllers/Api/CreditController.php:90
 * @route '/api/stripe/webhook'
 */
    const webhookForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: webhook.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\CreditController::webhook
 * @see app/Http/Controllers/Api/CreditController.php:90
 * @route '/api/stripe/webhook'
 */
        webhookForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: webhook.url(options),
            method: 'post',
        })
    
    webhook.form = webhookForm
const CreditController = { packages, balance, history, deduct, purchase, webhook }

export default CreditController