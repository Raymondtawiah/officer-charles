import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminController::overview
 * @see app/Http/Controllers/Admin/AdminController.php:28
 * @route '/api/admin/overview'
 */
export const overview = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overview.url(options),
    method: 'get',
})

overview.definition = {
    methods: ["get","head"],
    url: '/api/admin/overview',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::overview
 * @see app/Http/Controllers/Admin/AdminController.php:28
 * @route '/api/admin/overview'
 */
overview.url = (options?: RouteQueryOptions) => {
    return overview.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::overview
 * @see app/Http/Controllers/Admin/AdminController.php:28
 * @route '/api/admin/overview'
 */
overview.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overview.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::overview
 * @see app/Http/Controllers/Admin/AdminController.php:28
 * @route '/api/admin/overview'
 */
overview.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: overview.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::overview
 * @see app/Http/Controllers/Admin/AdminController.php:28
 * @route '/api/admin/overview'
 */
    const overviewForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: overview.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::overview
 * @see app/Http/Controllers/Admin/AdminController.php:28
 * @route '/api/admin/overview'
 */
        overviewForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: overview.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::overview
 * @see app/Http/Controllers/Admin/AdminController.php:28
 * @route '/api/admin/overview'
 */
        overviewForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: overview.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    overview.form = overviewForm
/**
* @see \App\Http\Controllers\Admin\AdminController::users
 * @see app/Http/Controllers/Admin/AdminController.php:33
 * @route '/api/admin/users'
 */
export const users = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: users.url(options),
    method: 'get',
})

users.definition = {
    methods: ["get","head"],
    url: '/api/admin/users',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::users
 * @see app/Http/Controllers/Admin/AdminController.php:33
 * @route '/api/admin/users'
 */
users.url = (options?: RouteQueryOptions) => {
    return users.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::users
 * @see app/Http/Controllers/Admin/AdminController.php:33
 * @route '/api/admin/users'
 */
users.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: users.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::users
 * @see app/Http/Controllers/Admin/AdminController.php:33
 * @route '/api/admin/users'
 */
users.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: users.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::users
 * @see app/Http/Controllers/Admin/AdminController.php:33
 * @route '/api/admin/users'
 */
    const usersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: users.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::users
 * @see app/Http/Controllers/Admin/AdminController.php:33
 * @route '/api/admin/users'
 */
        usersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: users.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::users
 * @see app/Http/Controllers/Admin/AdminController.php:33
 * @route '/api/admin/users'
 */
        usersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: users.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    users.form = usersForm
/**
* @see \App\Http\Controllers\Admin\AdminController::userProfile
 * @see app/Http/Controllers/Admin/AdminController.php:41
 * @route '/api/admin/users/{userId}'
 */
export const userProfile = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userProfile.url(args, options),
    method: 'get',
})

userProfile.definition = {
    methods: ["get","head"],
    url: '/api/admin/users/{userId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::userProfile
 * @see app/Http/Controllers/Admin/AdminController.php:41
 * @route '/api/admin/users/{userId}'
 */
userProfile.url = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { userId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    userId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        userId: args.userId,
                }

    return userProfile.definition.url
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::userProfile
 * @see app/Http/Controllers/Admin/AdminController.php:41
 * @route '/api/admin/users/{userId}'
 */
userProfile.get = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userProfile.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::userProfile
 * @see app/Http/Controllers/Admin/AdminController.php:41
 * @route '/api/admin/users/{userId}'
 */
userProfile.head = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: userProfile.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::userProfile
 * @see app/Http/Controllers/Admin/AdminController.php:41
 * @route '/api/admin/users/{userId}'
 */
    const userProfileForm = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: userProfile.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::userProfile
 * @see app/Http/Controllers/Admin/AdminController.php:41
 * @route '/api/admin/users/{userId}'
 */
        userProfileForm.get = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: userProfile.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::userProfile
 * @see app/Http/Controllers/Admin/AdminController.php:41
 * @route '/api/admin/users/{userId}'
 */
        userProfileForm.head = (args: { userId: string | number } | [userId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: userProfile.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    userProfile.form = userProfileForm
/**
* @see \App\Http\Controllers\Admin\AdminController::creditStats
 * @see app/Http/Controllers/Admin/AdminController.php:46
 * @route '/api/admin/credits/stats'
 */
export const creditStats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: creditStats.url(options),
    method: 'get',
})

creditStats.definition = {
    methods: ["get","head"],
    url: '/api/admin/credits/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::creditStats
 * @see app/Http/Controllers/Admin/AdminController.php:46
 * @route '/api/admin/credits/stats'
 */
creditStats.url = (options?: RouteQueryOptions) => {
    return creditStats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::creditStats
 * @see app/Http/Controllers/Admin/AdminController.php:46
 * @route '/api/admin/credits/stats'
 */
creditStats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: creditStats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::creditStats
 * @see app/Http/Controllers/Admin/AdminController.php:46
 * @route '/api/admin/credits/stats'
 */
creditStats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: creditStats.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::creditStats
 * @see app/Http/Controllers/Admin/AdminController.php:46
 * @route '/api/admin/credits/stats'
 */
    const creditStatsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: creditStats.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::creditStats
 * @see app/Http/Controllers/Admin/AdminController.php:46
 * @route '/api/admin/credits/stats'
 */
        creditStatsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: creditStats.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::creditStats
 * @see app/Http/Controllers/Admin/AdminController.php:46
 * @route '/api/admin/credits/stats'
 */
        creditStatsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: creditStats.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    creditStats.form = creditStatsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::creditTransactions
 * @see app/Http/Controllers/Admin/AdminController.php:51
 * @route '/api/admin/credits/transactions'
 */
export const creditTransactions = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: creditTransactions.url(options),
    method: 'get',
})

creditTransactions.definition = {
    methods: ["get","head"],
    url: '/api/admin/credits/transactions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::creditTransactions
 * @see app/Http/Controllers/Admin/AdminController.php:51
 * @route '/api/admin/credits/transactions'
 */
creditTransactions.url = (options?: RouteQueryOptions) => {
    return creditTransactions.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::creditTransactions
 * @see app/Http/Controllers/Admin/AdminController.php:51
 * @route '/api/admin/credits/transactions'
 */
creditTransactions.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: creditTransactions.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::creditTransactions
 * @see app/Http/Controllers/Admin/AdminController.php:51
 * @route '/api/admin/credits/transactions'
 */
creditTransactions.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: creditTransactions.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::creditTransactions
 * @see app/Http/Controllers/Admin/AdminController.php:51
 * @route '/api/admin/credits/transactions'
 */
    const creditTransactionsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: creditTransactions.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::creditTransactions
 * @see app/Http/Controllers/Admin/AdminController.php:51
 * @route '/api/admin/credits/transactions'
 */
        creditTransactionsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: creditTransactions.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::creditTransactions
 * @see app/Http/Controllers/Admin/AdminController.php:51
 * @route '/api/admin/credits/transactions'
 */
        creditTransactionsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: creditTransactions.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    creditTransactions.form = creditTransactionsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::addCredits
 * @see app/Http/Controllers/Admin/AdminController.php:59
 * @route '/api/admin/credits/add'
 */
export const addCredits = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addCredits.url(options),
    method: 'post',
})

addCredits.definition = {
    methods: ["post"],
    url: '/api/admin/credits/add',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::addCredits
 * @see app/Http/Controllers/Admin/AdminController.php:59
 * @route '/api/admin/credits/add'
 */
addCredits.url = (options?: RouteQueryOptions) => {
    return addCredits.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::addCredits
 * @see app/Http/Controllers/Admin/AdminController.php:59
 * @route '/api/admin/credits/add'
 */
addCredits.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addCredits.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::addCredits
 * @see app/Http/Controllers/Admin/AdminController.php:59
 * @route '/api/admin/credits/add'
 */
    const addCreditsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: addCredits.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::addCredits
 * @see app/Http/Controllers/Admin/AdminController.php:59
 * @route '/api/admin/credits/add'
 */
        addCreditsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: addCredits.url(options),
            method: 'post',
        })
    
    addCredits.form = addCreditsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::removeCredits
 * @see app/Http/Controllers/Admin/AdminController.php:76
 * @route '/api/admin/credits/remove'
 */
export const removeCredits = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: removeCredits.url(options),
    method: 'post',
})

removeCredits.definition = {
    methods: ["post"],
    url: '/api/admin/credits/remove',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::removeCredits
 * @see app/Http/Controllers/Admin/AdminController.php:76
 * @route '/api/admin/credits/remove'
 */
removeCredits.url = (options?: RouteQueryOptions) => {
    return removeCredits.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::removeCredits
 * @see app/Http/Controllers/Admin/AdminController.php:76
 * @route '/api/admin/credits/remove'
 */
removeCredits.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: removeCredits.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::removeCredits
 * @see app/Http/Controllers/Admin/AdminController.php:76
 * @route '/api/admin/credits/remove'
 */
    const removeCreditsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: removeCredits.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::removeCredits
 * @see app/Http/Controllers/Admin/AdminController.php:76
 * @route '/api/admin/credits/remove'
 */
        removeCreditsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: removeCredits.url(options),
            method: 'post',
        })
    
    removeCredits.form = removeCreditsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::paymentHistory
 * @see app/Http/Controllers/Admin/AdminController.php:93
 * @route '/api/admin/payments/history'
 */
export const paymentHistory = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: paymentHistory.url(options),
    method: 'get',
})

paymentHistory.definition = {
    methods: ["get","head"],
    url: '/api/admin/payments/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::paymentHistory
 * @see app/Http/Controllers/Admin/AdminController.php:93
 * @route '/api/admin/payments/history'
 */
paymentHistory.url = (options?: RouteQueryOptions) => {
    return paymentHistory.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::paymentHistory
 * @see app/Http/Controllers/Admin/AdminController.php:93
 * @route '/api/admin/payments/history'
 */
paymentHistory.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: paymentHistory.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::paymentHistory
 * @see app/Http/Controllers/Admin/AdminController.php:93
 * @route '/api/admin/payments/history'
 */
paymentHistory.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: paymentHistory.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::paymentHistory
 * @see app/Http/Controllers/Admin/AdminController.php:93
 * @route '/api/admin/payments/history'
 */
    const paymentHistoryForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: paymentHistory.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::paymentHistory
 * @see app/Http/Controllers/Admin/AdminController.php:93
 * @route '/api/admin/payments/history'
 */
        paymentHistoryForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: paymentHistory.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::paymentHistory
 * @see app/Http/Controllers/Admin/AdminController.php:93
 * @route '/api/admin/payments/history'
 */
        paymentHistoryForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: paymentHistory.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    paymentHistory.form = paymentHistoryForm
/**
* @see \App\Http\Controllers\Admin\AdminController::revenueStats
 * @see app/Http/Controllers/Admin/AdminController.php:101
 * @route '/api/admin/payments/revenue'
 */
export const revenueStats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: revenueStats.url(options),
    method: 'get',
})

revenueStats.definition = {
    methods: ["get","head"],
    url: '/api/admin/payments/revenue',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::revenueStats
 * @see app/Http/Controllers/Admin/AdminController.php:101
 * @route '/api/admin/payments/revenue'
 */
revenueStats.url = (options?: RouteQueryOptions) => {
    return revenueStats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::revenueStats
 * @see app/Http/Controllers/Admin/AdminController.php:101
 * @route '/api/admin/payments/revenue'
 */
revenueStats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: revenueStats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::revenueStats
 * @see app/Http/Controllers/Admin/AdminController.php:101
 * @route '/api/admin/payments/revenue'
 */
revenueStats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: revenueStats.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::revenueStats
 * @see app/Http/Controllers/Admin/AdminController.php:101
 * @route '/api/admin/payments/revenue'
 */
    const revenueStatsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: revenueStats.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::revenueStats
 * @see app/Http/Controllers/Admin/AdminController.php:101
 * @route '/api/admin/payments/revenue'
 */
        revenueStatsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: revenueStats.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::revenueStats
 * @see app/Http/Controllers/Admin/AdminController.php:101
 * @route '/api/admin/payments/revenue'
 */
        revenueStatsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: revenueStats.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    revenueStats.form = revenueStatsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::interviewStats
 * @see app/Http/Controllers/Admin/AdminController.php:106
 * @route '/api/admin/interviews/stats'
 */
export const interviewStats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: interviewStats.url(options),
    method: 'get',
})

interviewStats.definition = {
    methods: ["get","head"],
    url: '/api/admin/interviews/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::interviewStats
 * @see app/Http/Controllers/Admin/AdminController.php:106
 * @route '/api/admin/interviews/stats'
 */
interviewStats.url = (options?: RouteQueryOptions) => {
    return interviewStats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::interviewStats
 * @see app/Http/Controllers/Admin/AdminController.php:106
 * @route '/api/admin/interviews/stats'
 */
interviewStats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: interviewStats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::interviewStats
 * @see app/Http/Controllers/Admin/AdminController.php:106
 * @route '/api/admin/interviews/stats'
 */
interviewStats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: interviewStats.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::interviewStats
 * @see app/Http/Controllers/Admin/AdminController.php:106
 * @route '/api/admin/interviews/stats'
 */
    const interviewStatsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: interviewStats.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::interviewStats
 * @see app/Http/Controllers/Admin/AdminController.php:106
 * @route '/api/admin/interviews/stats'
 */
        interviewStatsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: interviewStats.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::interviewStats
 * @see app/Http/Controllers/Admin/AdminController.php:106
 * @route '/api/admin/interviews/stats'
 */
        interviewStatsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: interviewStats.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    interviewStats.form = interviewStatsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::userPerformance
 * @see app/Http/Controllers/Admin/AdminController.php:111
 * @route '/api/admin/interviews/performance'
 */
export const userPerformance = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userPerformance.url(options),
    method: 'get',
})

userPerformance.definition = {
    methods: ["get","head"],
    url: '/api/admin/interviews/performance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::userPerformance
 * @see app/Http/Controllers/Admin/AdminController.php:111
 * @route '/api/admin/interviews/performance'
 */
userPerformance.url = (options?: RouteQueryOptions) => {
    return userPerformance.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::userPerformance
 * @see app/Http/Controllers/Admin/AdminController.php:111
 * @route '/api/admin/interviews/performance'
 */
userPerformance.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userPerformance.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::userPerformance
 * @see app/Http/Controllers/Admin/AdminController.php:111
 * @route '/api/admin/interviews/performance'
 */
userPerformance.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: userPerformance.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::userPerformance
 * @see app/Http/Controllers/Admin/AdminController.php:111
 * @route '/api/admin/interviews/performance'
 */
    const userPerformanceForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: userPerformance.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::userPerformance
 * @see app/Http/Controllers/Admin/AdminController.php:111
 * @route '/api/admin/interviews/performance'
 */
        userPerformanceForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: userPerformance.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::userPerformance
 * @see app/Http/Controllers/Admin/AdminController.php:111
 * @route '/api/admin/interviews/performance'
 */
        userPerformanceForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: userPerformance.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    userPerformance.form = userPerformanceForm
/**
* @see \App\Http\Controllers\Admin\AdminController::aiUsageStats
 * @see app/Http/Controllers/Admin/AdminController.php:118
 * @route '/api/admin/ai-usage/stats'
 */
export const aiUsageStats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: aiUsageStats.url(options),
    method: 'get',
})

aiUsageStats.definition = {
    methods: ["get","head"],
    url: '/api/admin/ai-usage/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::aiUsageStats
 * @see app/Http/Controllers/Admin/AdminController.php:118
 * @route '/api/admin/ai-usage/stats'
 */
aiUsageStats.url = (options?: RouteQueryOptions) => {
    return aiUsageStats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::aiUsageStats
 * @see app/Http/Controllers/Admin/AdminController.php:118
 * @route '/api/admin/ai-usage/stats'
 */
aiUsageStats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: aiUsageStats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::aiUsageStats
 * @see app/Http/Controllers/Admin/AdminController.php:118
 * @route '/api/admin/ai-usage/stats'
 */
aiUsageStats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: aiUsageStats.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::aiUsageStats
 * @see app/Http/Controllers/Admin/AdminController.php:118
 * @route '/api/admin/ai-usage/stats'
 */
    const aiUsageStatsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: aiUsageStats.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::aiUsageStats
 * @see app/Http/Controllers/Admin/AdminController.php:118
 * @route '/api/admin/ai-usage/stats'
 */
        aiUsageStatsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: aiUsageStats.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::aiUsageStats
 * @see app/Http/Controllers/Admin/AdminController.php:118
 * @route '/api/admin/ai-usage/stats'
 */
        aiUsageStatsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: aiUsageStats.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    aiUsageStats.form = aiUsageStatsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::getCreditPackages
 * @see app/Http/Controllers/Admin/AdminController.php:123
 * @route '/api/admin/settings/credit-packages'
 */
export const getCreditPackages = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getCreditPackages.url(options),
    method: 'get',
})

getCreditPackages.definition = {
    methods: ["get","head"],
    url: '/api/admin/settings/credit-packages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::getCreditPackages
 * @see app/Http/Controllers/Admin/AdminController.php:123
 * @route '/api/admin/settings/credit-packages'
 */
getCreditPackages.url = (options?: RouteQueryOptions) => {
    return getCreditPackages.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::getCreditPackages
 * @see app/Http/Controllers/Admin/AdminController.php:123
 * @route '/api/admin/settings/credit-packages'
 */
getCreditPackages.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getCreditPackages.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::getCreditPackages
 * @see app/Http/Controllers/Admin/AdminController.php:123
 * @route '/api/admin/settings/credit-packages'
 */
getCreditPackages.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getCreditPackages.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::getCreditPackages
 * @see app/Http/Controllers/Admin/AdminController.php:123
 * @route '/api/admin/settings/credit-packages'
 */
    const getCreditPackagesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getCreditPackages.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::getCreditPackages
 * @see app/Http/Controllers/Admin/AdminController.php:123
 * @route '/api/admin/settings/credit-packages'
 */
        getCreditPackagesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getCreditPackages.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::getCreditPackages
 * @see app/Http/Controllers/Admin/AdminController.php:123
 * @route '/api/admin/settings/credit-packages'
 */
        getCreditPackagesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getCreditPackages.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getCreditPackages.form = getCreditPackagesForm
/**
* @see \App\Http\Controllers\Admin\AdminController::updateCreditPackages
 * @see app/Http/Controllers/Admin/AdminController.php:128
 * @route '/api/admin/settings/credit-packages'
 */
export const updateCreditPackages = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateCreditPackages.url(options),
    method: 'put',
})

updateCreditPackages.definition = {
    methods: ["put"],
    url: '/api/admin/settings/credit-packages',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::updateCreditPackages
 * @see app/Http/Controllers/Admin/AdminController.php:128
 * @route '/api/admin/settings/credit-packages'
 */
updateCreditPackages.url = (options?: RouteQueryOptions) => {
    return updateCreditPackages.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::updateCreditPackages
 * @see app/Http/Controllers/Admin/AdminController.php:128
 * @route '/api/admin/settings/credit-packages'
 */
updateCreditPackages.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateCreditPackages.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::updateCreditPackages
 * @see app/Http/Controllers/Admin/AdminController.php:128
 * @route '/api/admin/settings/credit-packages'
 */
    const updateCreditPackagesForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateCreditPackages.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::updateCreditPackages
 * @see app/Http/Controllers/Admin/AdminController.php:128
 * @route '/api/admin/settings/credit-packages'
 */
        updateCreditPackagesForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateCreditPackages.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateCreditPackages.form = updateCreditPackagesForm
/**
* @see \App\Http\Controllers\Admin\AdminController::getCreditCosts
 * @see app/Http/Controllers/Admin/AdminController.php:142
 * @route '/api/admin/settings/credit-costs'
 */
export const getCreditCosts = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getCreditCosts.url(options),
    method: 'get',
})

getCreditCosts.definition = {
    methods: ["get","head"],
    url: '/api/admin/settings/credit-costs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::getCreditCosts
 * @see app/Http/Controllers/Admin/AdminController.php:142
 * @route '/api/admin/settings/credit-costs'
 */
getCreditCosts.url = (options?: RouteQueryOptions) => {
    return getCreditCosts.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::getCreditCosts
 * @see app/Http/Controllers/Admin/AdminController.php:142
 * @route '/api/admin/settings/credit-costs'
 */
getCreditCosts.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getCreditCosts.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::getCreditCosts
 * @see app/Http/Controllers/Admin/AdminController.php:142
 * @route '/api/admin/settings/credit-costs'
 */
getCreditCosts.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getCreditCosts.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::getCreditCosts
 * @see app/Http/Controllers/Admin/AdminController.php:142
 * @route '/api/admin/settings/credit-costs'
 */
    const getCreditCostsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getCreditCosts.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::getCreditCosts
 * @see app/Http/Controllers/Admin/AdminController.php:142
 * @route '/api/admin/settings/credit-costs'
 */
        getCreditCostsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getCreditCosts.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::getCreditCosts
 * @see app/Http/Controllers/Admin/AdminController.php:142
 * @route '/api/admin/settings/credit-costs'
 */
        getCreditCostsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getCreditCosts.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getCreditCosts.form = getCreditCostsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::updateCreditCosts
 * @see app/Http/Controllers/Admin/AdminController.php:147
 * @route '/api/admin/settings/credit-costs'
 */
export const updateCreditCosts = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateCreditCosts.url(options),
    method: 'put',
})

updateCreditCosts.definition = {
    methods: ["put"],
    url: '/api/admin/settings/credit-costs',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::updateCreditCosts
 * @see app/Http/Controllers/Admin/AdminController.php:147
 * @route '/api/admin/settings/credit-costs'
 */
updateCreditCosts.url = (options?: RouteQueryOptions) => {
    return updateCreditCosts.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::updateCreditCosts
 * @see app/Http/Controllers/Admin/AdminController.php:147
 * @route '/api/admin/settings/credit-costs'
 */
updateCreditCosts.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateCreditCosts.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::updateCreditCosts
 * @see app/Http/Controllers/Admin/AdminController.php:147
 * @route '/api/admin/settings/credit-costs'
 */
    const updateCreditCostsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateCreditCosts.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::updateCreditCosts
 * @see app/Http/Controllers/Admin/AdminController.php:147
 * @route '/api/admin/settings/credit-costs'
 */
        updateCreditCostsForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateCreditCosts.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateCreditCosts.form = updateCreditCostsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::getFreeCredits
 * @see app/Http/Controllers/Admin/AdminController.php:161
 * @route '/api/admin/settings/free-credits'
 */
export const getFreeCredits = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getFreeCredits.url(options),
    method: 'get',
})

getFreeCredits.definition = {
    methods: ["get","head"],
    url: '/api/admin/settings/free-credits',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::getFreeCredits
 * @see app/Http/Controllers/Admin/AdminController.php:161
 * @route '/api/admin/settings/free-credits'
 */
getFreeCredits.url = (options?: RouteQueryOptions) => {
    return getFreeCredits.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::getFreeCredits
 * @see app/Http/Controllers/Admin/AdminController.php:161
 * @route '/api/admin/settings/free-credits'
 */
getFreeCredits.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getFreeCredits.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::getFreeCredits
 * @see app/Http/Controllers/Admin/AdminController.php:161
 * @route '/api/admin/settings/free-credits'
 */
getFreeCredits.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getFreeCredits.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::getFreeCredits
 * @see app/Http/Controllers/Admin/AdminController.php:161
 * @route '/api/admin/settings/free-credits'
 */
    const getFreeCreditsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getFreeCredits.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::getFreeCredits
 * @see app/Http/Controllers/Admin/AdminController.php:161
 * @route '/api/admin/settings/free-credits'
 */
        getFreeCreditsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getFreeCredits.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::getFreeCredits
 * @see app/Http/Controllers/Admin/AdminController.php:161
 * @route '/api/admin/settings/free-credits'
 */
        getFreeCreditsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getFreeCredits.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getFreeCredits.form = getFreeCreditsForm
/**
* @see \App\Http\Controllers\Admin\AdminController::updateFreeCredits
 * @see app/Http/Controllers/Admin/AdminController.php:166
 * @route '/api/admin/settings/free-credits'
 */
export const updateFreeCredits = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateFreeCredits.url(options),
    method: 'put',
})

updateFreeCredits.definition = {
    methods: ["put"],
    url: '/api/admin/settings/free-credits',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::updateFreeCredits
 * @see app/Http/Controllers/Admin/AdminController.php:166
 * @route '/api/admin/settings/free-credits'
 */
updateFreeCredits.url = (options?: RouteQueryOptions) => {
    return updateFreeCredits.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::updateFreeCredits
 * @see app/Http/Controllers/Admin/AdminController.php:166
 * @route '/api/admin/settings/free-credits'
 */
updateFreeCredits.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateFreeCredits.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::updateFreeCredits
 * @see app/Http/Controllers/Admin/AdminController.php:166
 * @route '/api/admin/settings/free-credits'
 */
    const updateFreeCreditsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateFreeCredits.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::updateFreeCredits
 * @see app/Http/Controllers/Admin/AdminController.php:166
 * @route '/api/admin/settings/free-credits'
 */
        updateFreeCreditsForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateFreeCredits.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateFreeCredits.form = updateFreeCreditsForm
const AdminController = { overview, users, userProfile, creditStats, creditTransactions, addCredits, removeCredits, paymentHistory, revenueStats, interviewStats, userPerformance, aiUsageStats, getCreditPackages, updateCreditPackages, getCreditCosts, updateCreditCosts, getFreeCredits, updateFreeCredits }

export default AdminController