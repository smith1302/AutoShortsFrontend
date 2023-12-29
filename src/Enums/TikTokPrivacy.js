const PrivacyOptions = {
    PUBLIC: "PUBLIC_TO_EVERYONE",
    PRIVATE: "SELF_ONLY",
    FRIENDS: "MUTUAL_FOLLOW_FRIENDS",
    FOLLOWERS: "FOLLOWER_OF_CREATOR"
}

const PrivacyOptionTitles = {
    [PrivacyOptions.PUBLIC]: "Public",
    [PrivacyOptions.PRIVATE]: "Private",
    [PrivacyOptions.FRIENDS]: "Friends",
    [PrivacyOptions.FOLLOWERS]: "Followers"
}

const defaultPrivacyLevel = (userPrivacyOptions) => {
    // Public, if available, otherwise private.
    if (userPrivacyOptions && userPrivacyOptions.includes(PrivacyOptions.PUBLIC)) {
        return PrivacyOptions.PUBLIC;
    }
    return PrivacyOptions.PRIVATE;
}

export {
    PrivacyOptions,
    PrivacyOptionTitles,
    defaultPrivacyLevel
}