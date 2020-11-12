import { SpawnIntent } from './spawn';

export type Intent = 
    SpawnIntent;

export type IntentPair<TKey extends string, TArguments extends object> = [
    TKey,
    TArguments
];

// export type IntentHandlers = 
//     (<T extends Intent>(...params: T) => Intent)

export type IntentHandlers = {
    [P in Intent]: Intent[P]
}








type LocalizationFunction = 
    (<T extends TranslationKey>(...params: T) => string);

type Translation<TKey extends string, TVariables extends object> = [
    TKey,
    TVariables
];

type TranslationObject = {
    [P in TranslationKey[0]]: string;
}

type TranslationDictionary = {
    [languageCode: string]: {
        translation: TranslationObject
    }
}

type TranslationKey = 
    ["Plus_Signup_Header_NoCommitmentCancelAnytime"] |
    ["Plus_Signup_Header_SubscriptionWillRenewAutomatically"] |
    ["Plus_Signup_Footer_ChangePlanNotice"] |
    ["Plus_Signup_Footer_CostsLessLastsLonger"] |
    ["Plus_Signup_Footer_CostsLessLastsLongerThan"] |
    ["Plus_Signup_Content_TryTrialDaysFree", {
        days: number
    }] |
    ["Plus_Signup_Content_OnlyAppliesToNewSignups"] |
    ["Plus_Signup_Content_YouAreAMember"] |
    ["Plus_Signup_Content_CreditsAssignedAfterTrial"] |
    ["Plus_Signup_Content_NoTrialPeriod"] |
    ["Plus_Signup_Content_CreditsGrantedInstantly"] |
    ["Plus_Signup_Content_ShortYear"] |
    ["Plus_Signup_Content_ShortMonth"] |
    ["Plus_Signup_Content_SignupNow"] |
    ["Confirmation_Success"] |
    ["Confirmation_Email_Changed"] |
    ["Confirmation_Email_Verified"] |
    ["Confirmation_Email_Update_Failed"] |
    ["Confirmation_Email_Update_Link"] |
    ["Confirmation_Password_Reset_Mail_Sent"] |
    ["Confirmation_Check_Inbox"] |
    ["Confirmation_Password_Update_Failed"] |
    ["Confirmation_Password_Update_Link"] |
    ["Confirmation_Unsubscribe_Product_Notifications_Title"] |
    ["Confirmation_Unsubscribe_Newsletter_Title"] |
    ["Account_Reset_Password_Title"] |
    ["Account_Reset_Password_Hint"] |
    ["Account_Reset_Password_NoPasswordSpecified"] |
    ["Account_Reset_Password_LinkExpired"] |
    ["Account_Reset_Password_PasswordMustBeAtLeastCharacters", { length: number }] |
    ["Account_Reset_Password_Update"];