
export default {
    login: '/login',
    register: '/register',
    about: '/about',
    contact: '/contact',
    privacy: '/privacy',
    terms: '/terms',
    faq: '/faq',
    pricing: '/#pricing',
    account: '/dashboard/account',
    // dashboard: '/dashboard',
    dashboard: '/dashboard/series',
    createSeries: '/dashboard/series/create',
    viewAllSeries: '/dashboard/series',
    manageSeries: (id) => `/dashboard/series/${id}`,
    billing: '/dashboard/billing',
    billingSuccess: '/dashboard/purchase-success',
    account: '/dashboard/account',
    affiliate: '/dashboard/affiliate',
    partners: '/partners',
    forgotPassword: '/forgot-password',
    resetPassword: (code) => `/reset-password?token=${code}`,
    unauthorizedAccess: '/login', // Where to direct someone who is attempting to access logged in content'
    // social
    facebook: 'https://www.facebook.com/ecomwave.io',
    instagram: 'https://www.instagram.com/ecomwave.io',
    youtube: 'https://www.youtube.com/@EcomWaveio',
    renderedVideos: 'https://autoshorts.ai/storage/videos/renders'
}