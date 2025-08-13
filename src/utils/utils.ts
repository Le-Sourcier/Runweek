export const MESSAGE_MAPPINGS = {
  en: {
    // Success (2xx)
    SUCCESS: "Operation completed successfully",
    LOGIN_SUCCESS: "Welcome back, {name}! We are pleased to see you again.",
    LOGOUT_SUCCESS:
      "You have been successfully disconnected from your account.",
    USER_UPDATED: "User profile information has been successfully updated.",
    USER_DELETED:
      "The user account has been permanently deleted from our system.",
    PROFILE_UPDATED: "Your profile has been successfully updated and saved.",
    EMAIL_SENDING_SUCCESS:
      "The email has been successfully sent to the recipient.",
    SESSION_TERMINATED:
      "Your session has been successfully terminated for security purposes.",
    EMAIL_VERIFICATION_SENT:
      "A verification email has been sent to your address. Please check your inbox.",
    EMAIL_VERIFIED_SUCCESS:
      "Your email address has been successfully verified. Thank you for completing this step.",
    PASSWORD_RESET_REQUESTED:
      "Password reset instructions have been sent to your email address. Please follow the link to proceed.",
    PASSWORD_RESET_SUCCESS:
      "Your password has been successfully reset. You can now log in with your new credentials.",
    PASSWORD_RECOVERED_SUCCESS:
      "Your account access has been successfully restored with the new password.",
    ACCOUNT_REACTIVATED:
      "Your account has been successfully reactivated. Welcome back!",
    DATA_FETCH_SUCCESS:
      "The requested data has been successfully retrieved from our servers.",
    FILE_UPLOAD_SUCCESS:
      "Your file has been successfully uploaded to our secure servers.",
    FILE_DELETED: "The file has been permanently deleted from our system.",
    FILE_DOWNLOAD_SUCCESS:
      "Your download has started. Please check your downloads folder.",
    PASSWORD_CHANGED:
      "Your password has been successfully changed for enhanced security.",
    OTP_SENT:
      "A one-time verification code has been sent to your registered device.",
    OTP_VERIFIED:
      "The verification code has been successfully validated. You may proceed.",
    JOB_FETCHED: "The job details have been successfully retrieved.",
    JOB_UPDATED:
      "The job parameters have been successfully updated in our system.",
    JOB_DELETED: "The job has been permanently removed from our task queue.",
    ENRICH_CREATED:
      "The data enrichment process has been successfully initiated.",
    NEXT_STEP: "You may now proceed to the next step in the process.",
    PRODUCT_DELETED:
      "The product has been permanently removed from our catalog.",
    ACCOUNT_VALIDATED_SUCCESS:
      "Your account validation has been successfully completed.",
    MARKED_AS_READ:
      "The item has been marked as read in your notification center.",
    MARKED_AS_UNREAD:
      "The item has been marked as unread for future reference.",
    RESET_CODE_SENT:
      "A password reset code has been sent to your registered email address.",
    REFERRAL_CODE_GENERATED:
      "A unique referral code has been generated for your account.",
    REFERRAL_CODE_VALID: "The provided referral code is valid and can be used.",
    NO_CHANGE: "No modifications were detected in the submitted data.",
    PRODUCT_UPDATED:
      "The product information has been successfully updated in our database.",
    GET_ALL_PRODUCTS_SUCCESS:
      "All products have been successfully retrieved from our catalog.",
    SESSION_DETAILS_RETRIEVED:
      "The session details have been successfully retrieved for your review.",
    GET_PRODUCT_SUCCESS:
      "The product information has been successfully retrieved.",
    PRODUCT_RETRIEVED: "The product details have been successfully loaded.",
    PRODUCTS_RETRIEVED:
      "The requested products have been successfully retrieved.",
    PAYOUT_DETAILS_RETRIEVED:
      "Your payout details have been successfully retrieved.",
    SUBSCRIPTION_TRANSACTIONS_RETRIEVED:
      "Your subscription transaction history has been loaded.",
    PAYOUTS_RETRIEVED: "Your payout history has been successfully retrieved.",
    PAYOUT_CANCELLED:
      "The pending payout has been successfully cancelled as requested.",
    PAYOUT_UPDATED: "Your payout information has been successfully updated.",
    PAYOUT_TRANSACTIONS_RETRIEVED:
      "Your payout transaction history has been loaded.",
    BALANCE_RETRIEVED: "Your current account balance has been retrieved.",
    SUBSCRIPTIONS_RETRIEVED:
      "Your subscription details have been successfully retrieved.",
    SUBSCRIPTION_UPDATED:
      "Your subscription preferences have been successfully updated.",
    SUBSCRIPTION_CHECKOUT_CREATED:
      "A secure checkout session has been created for your subscription.",
    SUBSCRIPTION_CANCELLED_IMMEDIATELY:
      "Your subscription has been terminated immediately as requested.",
    SUBSCRIPTION_CANCELLED_AT_PERIOD_END:
      "Your subscription has been scheduled for cancellation at the end of the current billing period.",
    PRODUCT_PRICES_UPDATED:
      "The product pricing structure has been successfully updated.",

    // Created (201)
    ACCOUNT_CREATED:
      "Your account has been successfully created. Welcome to our platform!",
    USER_CREATED:
      "The new user account has been successfully registered in our system.",
    PROFILE_CREATED: "Your profile has been successfully created and saved.",
    SESSION_CREATED:
      "A new secure session has been successfully established for your account.",
    JOBS_CREATED:
      "The requested jobs have been successfully created in our queue.",
    JOB_CREATED:
      "The new job has been successfully created and queued for processing.",
    CREATE_PRODUCT_SUCCESS:
      "The new product has been successfully added to our catalog.",
    CHECKOUT_SESSION_CREATED:
      "A secure checkout session has been successfully created for your transaction.",
    PAYOUT_CREATED:
      "Your payout request has been successfully created and queued for processing.",
    INSTANT_PAYOUT_CREATED:
      "Your instant payout request has been successfully initiated.",

    // Client Errors (4xx)
    ACCOUNT_ALREADY_EXISTS:
      "An account with this email address already exists in our system. Please try logging in or use a different email address.",
    INVALID_CREDENTIALS:
      "The provided credentials are incorrect. Please verify your email and password and try again.",
    BAD_REQUEST:
      "The server could not process your request due to invalid parameters.",
    REQUIRED_FIELDS_MISSING:
      "Required fields are missing from your submission: {fields}. Please complete all required information and try again.",
    INVALID_EMAIL_FORMAT:
      "The email address provided is not in a valid format. Please enter a valid email address.",
    PASSWORDS_DO_NOT_MATCH:
      "The password confirmation does not match your new password. Please ensure both fields contain identical values.",
    OLD_PASSWORD_INVALID:
      "The current password you entered is incorrect. Please verify your current password and try again.",
    INVALID_PHONE_NUMBER:
      "The phone number provided is not valid. Please enter a valid phone number including country code.",
    PHONE_ALREADY_EXISTS:
      "This phone number is already associated with another account. Please use a different number or contact support.",
    FILE_TOO_LARGE:
      "The file you attempted to upload exceeds the maximum allowed size of {maxSize}. Please reduce the file size and try again.",
    UNSUPPORTED_FILE_TYPE:
      "The file type you attempted to upload is not supported. Accepted formats include: {types}.",
    FILE_UPLOAD_FAILED:
      "We encountered an error while processing your file upload. Please try again or contact support if the problem persists.",
    FILE_DOWNLOAD_FAILED:
      "We were unable to complete your file download request. Please check your connection and try again.",
    PASSWORD_CHANGE_FAILED:
      "We were unable to process your password change request. Please verify your current password and try again.",
    ENRICHMENT_FAILED:
      "The data enrichment process could not be completed due to an internal error.",
    JOB_ALREADY_RUNNING_OR_COMPLETED:
      "This job is either already in progress or has been completed. Please check the job status before resubmitting.",
    INVALID_QUERIES_ARRAY:
      "The search queries provided are not in a valid format. Please review your input and try again.",
    MISSING_EMAIL:
      "A valid email address is required to proceed. Please provide your email address.",
    PASSWORD_REQUIRED:
      "A password is required for account security. Please create a strong password.",
    FIRST_NAME_REQUIRED:
      "Your first name is required for account creation. Please provide this information.",
    PHONE_NUMBER_INVALID:
      "The phone number provided does not appear to be valid. Please check the number and try again.",
    LAST_NAME_REQUIRED:
      "Your last name is required for account creation. Please provide this information.",
    PHONE_REQUIRED:
      "A valid phone number is required for account verification. Please provide your phone number.",
    INVALID_REFERRAL_CODE:
      "The referral code you entered is not valid. Please check the code and try again.",
    ONE_FIELD_REQUIRED:
      "At least one field must be provided to update your profile. Please provide updated information.",
    MISSING_REQUIRED_FIELDS:
      "Your submission is missing required information: {fields}. Please complete all required fields and try again.",
    PRODUCT_ID_REQUIRED:
      "A product identifier is required to process this request. Please specify the product ID.",
    INVALID_INTERVAL:
      "The time interval specified is not valid for this operation. Please adjust your parameters.",
    STRIPE_INVALID_REQUEST:
      "The payment request could not be processed due to invalid parameters.",
    STRIPE_PRODUCT_NOT_ACTIVE:
      "The requested product is not currently available for purchase.",
    STRIPE_INVALID_LINE_ITEM:
      "The shopping cart contains invalid items. Please review your selections.",
    MISSING_SESSION_ID:
      "A session identifier is required to process this request. Please provide the session ID.",
    MISSING_PAYOUT_ID:
      "A payout identifier is required to process this request. Please provide the payout ID.",
    MISSING_SUBSCRIPTION_ID:
      "A subscription identifier is required to process this request. Please provide the subscription ID.",
    INVALID_AMOUNT:
      "The amount specified is not valid for this transaction. Please adjust the amount and try again.",
    MONTHLY_PRICE_REQUIRED:
      "A monthly price is required to create this subscription plan. Please specify the price.",
    MISSING_METADATA:
      "Additional metadata is required to process this request. Please provide the necessary information.",
    PASSWORD_MUST_INCLUDE_UPPERCASE_LOWERCASE_NUMBER_SPECIAL_CHAR:
      "For your security, passwords must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    MISSING_CUSTOMER_ID:
      "A customer identifier is required to process this request. Please provide the customer ID.",
    MISSING_PRICE_ID:
      "A price identifier is required to process this request. Please provide the price ID.",
    INVALID_DISCOUNT_VALUE:
      "The discount value provided is not valid for this transaction. Please adjust the value and try again.",

    // Unauthorized (401)
    UNAUTHORIZED_ACCESS:
      "You are not authorized to access this resource. Please authenticate and try again.",
    UNAUTHORIZED_ACTION:
      "You do not have sufficient permissions to perform this action.",
    TOKEN_EXPIRED:
      "Your authentication token has expired. Please log in again to continue.",
    INVALID_OR_EXPIRED_CODE:
      "The verification code provided is either invalid or has expired. Please request a new code.",
    INVALID_OR_EXPIRED_TOKEN:
      "The authentication token provided is either invalid or has expired. Please authenticate again.",
    TOKEN_INVALID:
      "The authentication token provided is not valid. Please verify your credentials and try again.",
    ACCOUNT_BLOCKED:
      "This account has been temporarily blocked due to multiple failed login attempts. Please try again later or contact support.",
    ENRICH_SOURCE_IS_EMPTY:
      "The data source for enrichment is empty. Please provide valid data and try again.",
    ACCOUNT_ALREADY_VERIFIED:
      "This account has already been verified. No further action is required.",
    INSUFFICIENT_CREDITS:
      "Your account has insufficient credits to complete this operation. Please purchase additional credits to continue.",
    STRIPE_AUTHENTICATION_FAILED:
      "We were unable to authenticate with our payment processor. Please try again later.",

    // Payment Required (402)
    STRIPE_CARD_DECLINED:
      "The payment was declined by your card issuer. Please use a different payment method or contact your bank.",
    INSUFFICIENT_FUNDS:
      "Your account has insufficient funds to complete this transaction. Please add funds to your account and try again.",

    // Forbidden (403)
    ACCESS_DENIED:
      "Access to this resource is strictly prohibited for your account type.",
    INSUFFICIENT_PERMISSIONS:
      "Your account does not have sufficient permissions to perform this action.",
    FORBIDDEN_RESOURCE:
      "You are not authorized to access this particular resource.",
    ACCOUNT_ARCHIVED:
      "This account has been archived and is no longer accessible.",
    ACCOUNT_UNVERIFIED:
      "This account has not been verified. Please complete the verification process to continue.",
    ACTION_NOT_ALLOWED:
      "This action is not permitted under your current subscription plan.",
    CANNOT_MODIFY_FREE_PLAN:
      "Modifications to the free subscription plan are not allowed.",
    CANNOT_DELETE_FREE_PLAN:
      "The free subscription plan cannot be removed from the system.",
    PRODUCT_HAS_ACTIVE_SUBSCRIPTIONS:
      "This product cannot be modified as it has active subscriptions associated with it.",
    PLAN_NOT_FOUND:
      "The requested subscription plan could not be found in our system.",
    NOT_ENOUGH_CREDIT:
      "Your account does not have enough credit to complete this operation.",
    NO_ACTIVE_SUBSCRIPTION:
      "There is no active subscription associated with your account.",
    PAYOUT_CANCEL_NOT_ALLOWED:
      "This payout cannot be cancelled as it has already been processed.",
    INSTANT_PAYOUT_DISABLED:
      "Instant payouts are currently disabled for your account.",
    BANK_ACCOUNT_NOT_ELIGIBLE:
      "The bank account provided is not eligible for payouts. Please verify your banking information.",

    // Not Found (404)
    RESOURCE_NOT_FOUND:
      "The requested resource could not be found in our system.",
    NO_JOBS_FOUND: "No jobs matching your criteria were found in our records.",
    NO_DATA_FOUND:
      "No data matching your request could be retrieved from our servers.",
    PROFILE_NOT_FOUND: "The user profile you requested could not be located.",
    ACCOUNT_NOT_FOUND: "No account exists with the provided credentials.",
    ACCOUNTS_NOT_FOUND: "No accounts matching your search criteria were found.",
    RECORDED_USERS_NOT_FOUND:
      "No user records matching your query were found in our database.",
    FILE_NOT_FOUND:
      "The requested file could not be located in our storage system.",
    NOTIF_NOT_FOUND:
      "The specified notification could not be found in your inbox.",
    NO_SESSIONS_FOUND: "No active sessions were found for this account.",
    REFERRAL_CODE_NOT_FOUND:
      "The referral code you entered does not exist in our system.",
    JOB_NOT_FOUND: "The specified job could not be found in our task queue.",
    PRODUCT_NOT_FOUND: "The requested product is not available in our catalog.",
    PRODUCTS_NOT_FOUND: "No products matching your search criteria were found.",
    STRIPE_ACCOUNT_NOT_FOUND:
      "The associated payment account could not be located.",

    // Locked (423)
    ACCOUNT_LOCKED:
      "This account has been temporarily locked due to suspicious activity. Please contact support for assistance.",

    // Too Many Requests (429)
    TOO_MANY_ATTEMPTS:
      "Too many requests have been made from your account. Please wait before trying again.",
    STRIPE_RATE_LIMIT:
      "Our payment processor is currently receiving too many requests. Please try your transaction again shortly.",

    // Server Errors (5xx)
    SERVER_ERROR:
      "We encountered an unexpected error while processing your request. Our team has been notified.",
    FAILED_TO_GET_JOB:
      "We were unable to retrieve the requested job details due to a system error.",
    EMAIL_SENDING_FAILED:
      "We encountered an error while attempting to send your email. Please try again later.",
    GET_ALL_JOBS_ERROR:
      "An error occurred while retrieving the job listings. Please refresh the page and try again.",
    FAILED_TO_START_JOB:
      "The system failed to initialize the requested job. Please try again or contact support.",
    FAILED_TO_DELETE_JOB:
      "We were unable to delete the specified job due to a system error.",
    CREATE_JOB_ERROR:
      "An error occurred while creating your new job. Please verify your parameters and try again.",
    INVITE_MEMBER_ERROR:
      "We encountered an error while processing your invitation. Please try again later.",
    REFERRAL_CODE_GENERATION_FAILED:
      "The system failed to generate a referral code for your account. Please try again.",
    CHECK_REFERRAL_CODE_ERROR:
      "We encountered an error while validating your referral code. Please try again later.",
    PRODUCT_UPDATE_FAILED:
      "An error occurred while updating the product information. Please verify your changes and try again.",
    GET_ALL_PRODUCTS_ERROR:
      "We encountered an error while retrieving the product catalog. Please try again later.",
    CREATE_PRODUCT_ERROR:
      "The system failed to create your new product. Please verify your information and try again.",
    GET_PRODUCT_ERROR:
      "An error occurred while retrieving the product details. Please refresh the page and try again.",
    DELETE_PRODUCT_ERROR:
      "We were unable to delete the specified product due to a system error.",
    STRIPE_UNKNOWN_ERROR:
      "An unexpected error occurred with our payment processor. Please try again later.",
    STRIPE_OPERATION_FAILED:
      "The payment operation could not be completed due to a system error.",
    SESSION_RETRIEVAL_FAILED:
      "We encountered an error while retrieving your session details. Please try again.",
    PRODUCTS_RETRIEVAL_FAILED:
      "An error occurred while loading the product information. Please refresh the page.",
    PAYOUT_RETRIEVAL_FAILED:
      "We were unable to retrieve your payout details due to a system error.",
    SUBSCRIPTION_TRANSACTIONS_FAILED:
      "An error occurred while loading your subscription history. Please try again later.",
    PAYOUTS_LISTING_FAILED:
      "We encountered an error while retrieving your payout history. Please refresh the page.",
    PAYOUT_CANCELLATION_FAILED:
      "The system failed to cancel your payout request. Please try again or contact support.",
    PAYOUT_UPDATE_FAILED:
      "We were unable to update your payout information due to a system error.",
    STRIPE_DELETION_FAILED:
      "The system failed to delete the payment resource. Please try again later.",
    PAYOUT_TRANSACTIONS_FAILED:
      "An error occurred while retrieving your transaction history. Please try again later.",
    BALANCE_RETRIEVAL_FAILED:
      "We encountered an error while checking your account balance. Please try again.",
    INSTANT_PAYOUT_FAILED:
      "Your instant payout request could not be processed due to a system error.",
    CHECKOUT_SESSION_FAILED:
      "We were unable to create a checkout session for your transaction. Please try again.",
    PAYOUT_CREATION_FAILED:
      "The system failed to create your payout request. Please verify your information and try again.",
    LIST_SUBSCRIPTIONS_ERROR:
      "An error occurred while retrieving your subscription details. Please try again later.",
    SUBSCRIPTION_UPDATE_ERROR:
      "We encountered an error while updating your subscription. Please try again or contact support.",
    SUBSCRIPTION_CREATION_ERROR:
      "The system failed to create your new subscription. Please verify your information and try again.",
    SUBSCRIPTION_CANCEL_ERROR:
      "We were unable to cancel your subscription due to a system error. Please try again or contact support.",

    // Default
    UNKNOWN_ERROR:
      "An unexpected error occurred. Our technical team has been notified and will investigate the issue.",
  },
  fr: {
    // Success (2xx)
    SUCCESS: "Opération réalisée avec succès",
    LOGIN_SUCCESS:
      "Content de vous revoir, {name} ! Nous sommes heureux de vous retrouver.",
    LOGOUT_SUCCESS: "Vous avez été déconnecté avec succès de votre compte.",
    USER_UPDATED:
      "Les informations de votre profil utilisateur ont été mises à jour avec succès.",
    USER_DELETED:
      "Le compte utilisateur a été supprimé définitivement de notre système.",
    PROFILE_UPDATED: "Votre profil a été mis à jour et enregistré avec succès.",
    EMAIL_SENDING_SUCCESS: "L'email a été envoyé avec succès au destinataire.",
    SESSION_TERMINATED:
      "Votre session a été fermée avec succès pour des raisons de sécurité.",
    EMAIL_VERIFICATION_SENT:
      "Un email de vérification a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception.",
    EMAIL_VERIFIED_SUCCESS:
      "Votre adresse email a été vérifiée avec succès. Merci d'avoir complété cette étape.",
    PASSWORD_RESET_REQUESTED:
      "Les instructions pour réinitialiser votre mot de passe ont été envoyées à votre adresse email. Veuillez suivre le lien pour continuer.",
    PASSWORD_RESET_SUCCESS:
      "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec vos nouvelles identifiants.",
    PASSWORD_RECOVERED_SUCCESS:
      "L'accès à votre compte a été rétabli avec succès avec le nouveau mot de passe.",
    ACCOUNT_REACTIVATED:
      "Votre compte a été réactivé avec succès. Heureux de vous revoir !",
    DATA_FETCH_SUCCESS:
      "Les données demandées ont été récupérées avec succès depuis nos serveurs.",
    FILE_UPLOAD_SUCCESS:
      "Votre fichier a été téléchargé avec succès sur nos serveurs sécurisés.",
    FILE_DELETED: "Le fichier a été supprimé définitivement de notre système.",
    FILE_DOWNLOAD_SUCCESS:
      "Votre téléchargement a commencé. Veuillez vérifier votre dossier de téléchargements.",
    PASSWORD_CHANGED:
      "Votre mot de passe a été modifié avec succès pour renforcer la sécurité.",
    OTP_SENT:
      "Un code de vérification unique a été envoyé à votre appareil enregistré.",
    OTP_VERIFIED:
      "Le code de vérification a été validé avec succès. Vous pouvez continuer.",
    JOB_FETCHED: "Les détails de la tâche ont été récupérés avec succès.",
    JOB_UPDATED:
      "Les paramètres de la tâche ont été mis à jour avec succès dans notre système.",
    JOB_DELETED:
      "La tâche a été supprimée définitivement de notre file d'attente.",
    ENRICH_CREATED:
      "Le processus d'enrichissement des données a été lancé avec succès.",
    NEXT_STEP: "Vous pouvez maintenant passer à l'étape suivante du processus.",
    PRODUCT_DELETED:
      "Le produit a été supprimé définitivement de notre catalogue.",
    ACCOUNT_VALIDATED_SUCCESS:
      "La validation de votre compte a été complétée avec succès.",
    MARKED_AS_READ:
      "L'élément a été marqué comme lu dans votre centre de notifications.",
    MARKED_AS_UNREAD:
      "L'élément a été marqué comme non lu pour référence future.",
    RESET_CODE_SENT:
      "Un code de réinitialisation de mot de passe a été envoyé à votre adresse email enregistrée.",
    REFERRAL_CODE_GENERATED:
      "Un code de parrainage unique a été généré pour votre compte.",
    REFERRAL_CODE_VALID:
      "Le code de parrainage fourni est valide et peut être utilisé.",
    NO_CHANGE:
      "Aucune modification n'a été détectée dans les données soumises.",
    PRODUCT_UPDATED:
      "Les informations sur le produit ont été mises à jour avec succès dans notre base de données.",
    GET_ALL_PRODUCTS_SUCCESS:
      "Tous les produits ont été récupérés avec succès depuis notre catalogue.",
    SESSION_DETAILS_RETRIEVED:
      "Les détails de la session ont été récupérés avec succès pour votre examen.",
    GET_PRODUCT_SUCCESS:
      "Les informations sur le produit ont été récupérées avec succès.",
    PRODUCT_RETRIEVED: "Les détails du produit ont été chargés avec succès.",
    PRODUCTS_RETRIEVED: "Les produits demandés ont été récupérés avec succès.",
    PAYOUT_DETAILS_RETRIEVED:
      "Les détails de votre paiement ont été récupérés avec succès.",
    SUBSCRIPTION_TRANSACTIONS_RETRIEVED:
      "Votre historique de transactions d'abonnement a été chargé.",
    PAYOUTS_RETRIEVED:
      "Votre historique de paiements a été récupéré avec succès.",
    PAYOUT_CANCELLED:
      "Le paiement en attente a été annulé avec succès comme demandé.",
    PAYOUT_UPDATED:
      "Vos informations de paiement ont été mises à jour avec succès.",
    PAYOUT_TRANSACTIONS_RETRIEVED:
      "Votre historique de transactions de paiement a été chargé.",
    BALANCE_RETRIEVED: "Le solde actuel de votre compte a été récupéré.",
    SUBSCRIPTIONS_RETRIEVED:
      "Les détails de votre abonnement ont été récupérés avec succès.",
    SUBSCRIPTION_UPDATED:
      "Vos préférences d'abonnement ont été mises à jour avec succès.",
    SUBSCRIPTION_CHECKOUT_CREATED:
      "Une session de paiement sécurisée a été créée pour votre abonnement.",
    SUBSCRIPTION_CANCELLED_IMMEDIATELY:
      "Votre abonnement a été résilié immédiatement comme demandé.",
    SUBSCRIPTION_CANCELLED_AT_PERIOD_END:
      "Votre abonnement a été programmé pour être résilié à la fin de la période de facturation en cours.",
    PRODUCT_PRICES_UPDATED:
      "La structure tarifaire des produits a été mise à jour avec succès.",

    // Created (201)
    ACCOUNT_CREATED:
      "Votre compte a été créé avec succès. Bienvenue sur notre plateforme !",
    USER_CREATED:
      "Le nouveau compte utilisateur a été enregistré avec succès dans notre système.",
    PROFILE_CREATED: "Votre profil a été créé et enregistré avec succès.",
    SESSION_CREATED:
      "Une nouvelle session sécurisée a été établie avec succès pour votre compte.",
    JOBS_CREATED:
      "Les tâches demandées ont été créées avec succès dans notre file d'attente.",
    JOB_CREATED:
      "La nouvelle tâche a été créée et mise en file d'attente pour traitement avec succès.",
    CREATE_PRODUCT_SUCCESS:
      "Le nouveau produit a été ajouté avec succès à notre catalogue.",
    CHECKOUT_SESSION_CREATED:
      "Une session de paiement sécurisée a été créée avec succès pour votre transaction.",
    PAYOUT_CREATED:
      "Votre demande de paiement a été créée et mise en file d'attente pour traitement avec succès.",
    INSTANT_PAYOUT_CREATED:
      "Votre demande de paiement instantané a été initiée avec succès.",

    // Client Errors (4xx)
    ACCOUNT_ALREADY_EXISTS:
      "Un compte avec cette adresse email existe déjà dans notre système. Veuillez essayer de vous connecter ou utiliser une adresse email différente.",
    INVALID_CREDENTIALS:
      "Les identifiants fournis sont incorrects. Veuillez vérifier votre email et mot de passe et réessayer.",
    BAD_REQUEST:
      "Le serveur n'a pas pu traiter votre requête en raison de paramètres invalides.",
    REQUIRED_FIELDS_MISSING:
      "Des champs obligatoires sont manquants dans votre soumission : {fields}. Veuillez compléter toutes les informations requises et réessayer.",
    INVALID_EMAIL_FORMAT:
      "L'adresse email fournie n'est pas dans un format valide. Veuillez entrer une adresse email valide.",
    PASSWORDS_DO_NOT_MATCH:
      "La confirmation du mot de passe ne correspond pas à votre nouveau mot de passe. Veuillez vous assurer que les deux champs contiennent des valeurs identiques.",
    OLD_PASSWORD_INVALID:
      "Le mot de passe actuel que vous avez entré est incorrect. Veuillez vérifier votre mot de passe actuel et réessayer.",
    INVALID_PHONE_NUMBER:
      "Le numéro de téléphone fourni n'est pas valide. Veuillez entrer un numéro de téléphone valide incluant l'indicatif du pays.",
    PHONE_ALREADY_EXISTS:
      "Ce numéro de téléphone est déjà associé à un autre compte. Veuillez utiliser un numéro différent ou contacter le support.",
    FILE_TOO_LARGE:
      "Le fichier que vous avez tenté de télécharger dépasse la taille maximale autorisée de {maxSize}. Veuillez réduire la taille du fichier et réessayer.",
    UNSUPPORTED_FILE_TYPE:
      "Le type de fichier que vous avez tenté de télécharger n'est pas supporté. Les formats acceptés incluent : {types}.",
    FILE_UPLOAD_FAILED:
      "Nous avons rencontré une erreur lors du traitement de votre téléchargement de fichier. Veuillez réessayer ou contacter le support si le problème persiste.",
    FILE_DOWNLOAD_FAILED:
      "Nous n'avons pas pu compléter votre demande de téléchargement de fichier. Veuillez vérifier votre connexion et réessayer.",
    PASSWORD_CHANGE_FAILED:
      "Nous n'avons pas pu traiter votre demande de changement de mot de passe. Veuillez vérifier votre mot de passe actuel et réessayer.",
    ENRICHMENT_FAILED:
      "Le processus d'enrichissement des données n'a pas pu être complété en raison d'une erreur interne.",
    JOB_ALREADY_RUNNING_OR_COMPLETED:
      "Cette tâche est déjà en cours d'exécution ou a été complétée. Veuillez vérifier le statut de la tâche avant de la soumettre à nouveau.",
    INVALID_QUERIES_ARRAY:
      "Les requêtes de recherche fournies ne sont pas dans un format valide. Veuillez revoir votre saisie et réessayer.",
    MISSING_EMAIL:
      "Une adresse email valide est requise pour continuer. Veuillez fournir votre adresse email.",
    PASSWORD_REQUIRED:
      "Un mot de passe est requis pour la sécurité du compte. Veuillez créer un mot de passe fort.",
    FIRST_NAME_REQUIRED:
      "Votre prénom est requis pour la création du compte. Veuillez fournir cette information.",
    PHONE_NUMBER_INVALID:
      "Le numéro de téléphone fourni ne semble pas valide. Veuillez vérifier le numéro et réessayer.",
    LAST_NAME_REQUIRED:
      "Votre nom de famille est requis pour la création du compte. Veuillez fournir cette information.",
    PHONE_REQUIRED:
      "Un numéro de téléphone valide est requis pour la vérification du compte. Veuillez fournir votre numéro de téléphone.",
    INVALID_REFERRAL_CODE:
      "Le code de parrainage que vous avez entré n'est pas valide. Veuillez vérifier le code et réessayer.",
    ONE_FIELD_REQUIRED:
      "Au moins un champ doit être fourni pour mettre à jour votre profil. Veuillez fournir des informations mises à jour.",
    MISSING_REQUIRED_FIELDS:
      "Votre soumission manque d'informations requises : {fields}. Veuillez compléter tous les champs obligatoires et réessayer.",
    PRODUCT_ID_REQUIRED:
      "Un identifiant de produit est requis pour traiter cette demande. Veuillez spécifier l'ID du produit.",
    INVALID_INTERVAL:
      "L'intervalle de temps spécifié n'est pas valide pour cette opération. Veuillez ajuster vos paramètres.",
    STRIPE_INVALID_REQUEST:
      "La demande de paiement n'a pas pu être traitée en raison de paramètres invalides.",
    STRIPE_PRODUCT_NOT_ACTIVE:
      "Le produit demandé n'est pas actuellement disponible à l'achat.",
    STRIPE_INVALID_LINE_ITEM:
      "Le panier contient des articles invalides. Veuillez revoir vos sélections.",
    MISSING_SESSION_ID:
      "Un identifiant de session est requis pour traiter cette demande. Veuillez fournir l'ID de session.",
    MISSING_PAYOUT_ID:
      "Un identifiant de paiement est requis pour traiter cette demande. Veuillez fournir l'ID de paiement.",
    MISSING_SUBSCRIPTION_ID:
      "Un identifiant d'abonnement est requis pour traiter cette demande. Veuillez fournir l'ID d'abonnement.",
    INVALID_AMOUNT:
      "Le montant spécifié n'est pas valide pour cette transaction. Veuillez ajuster le montant et réessayer.",
    MONTHLY_PRICE_REQUIRED:
      "Un prix mensuel est requis pour créer ce plan d'abonnement. Veuillez spécifier le prix.",
    MISSING_METADATA:
      "Des métadonnées supplémentaires sont requises pour traiter cette demande. Veuillez fournir les informations nécessaires.",
    PASSWORD_MUST_INCLUDE_UPPERCASE_LOWERCASE_NUMBER_SPECIAL_CHAR:
      "Pour votre sécurité, les mots de passe doivent contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.",
    MISSING_CUSTOMER_ID:
      "Un identifiant client est requis pour traiter cette demande. Veuillez fournir l'ID client.",
    MISSING_PRICE_ID:
      "Un identifiant de prix est requis pour traiter cette demande. Veuillez fournir l'ID de prix.",
    INVALID_DISCOUNT_VALUE:
      "La valeur de remise fournie n'est pas valide pour cette transaction. Veuillez ajuster la valeur et réessayer.",

    // Unauthorized (401)
    UNAUTHORIZED_ACCESS:
      "Vous n'êtes pas autorisé à accéder à cette ressource. Veuillez vous authentifier et réessayer.",
    UNAUTHORIZED_ACTION:
      "Vous n'avez pas les permissions suffisantes pour effectuer cette action.",
    TOKEN_EXPIRED:
      "Votre jeton d'authentification a expiré. Veuillez vous reconnecter pour continuer.",
    INVALID_OR_EXPIRED_CODE:
      "Le code de vérification fourni est invalide ou a expiré. Veuillez demander un nouveau code.",
    INVALID_OR_EXPIRED_TOKEN:
      "Le jeton d'authentification fourni est invalide ou a expiré. Veuillez vous authentifier à nouveau.",
    TOKEN_INVALID:
      "Le jeton d'authentification fourni n'est pas valide. Veuillez vérifier vos identifiants et réessayer.",
    ACCOUNT_BLOCKED:
      "Ce compte a été temporairement bloqué en raison de multiples tentatives de connexion infructueuses. Veuillez réessayer plus tard ou contacter le support.",
    ENRICH_SOURCE_IS_EMPTY:
      "La source de données pour l'enrichissement est vide. Veuillez fournir des données valides et réessayer.",
    ACCOUNT_ALREADY_VERIFIED:
      "Ce compte a déjà été vérifié. Aucune action supplémentaire n'est requise.",
    INSUFFICIENT_CREDITS:
      "Votre compte n'a pas suffisamment de crédits pour compléter cette opération. Veuillez acheter des crédits supplémentaires pour continuer.",
    STRIPE_AUTHENTICATION_FAILED:
      "Nous n'avons pas pu nous authentifier auprès de notre processeur de paiement. Veuillez réessayer plus tard.",

    // Payment Required (402)
    STRIPE_CARD_DECLINED:
      "Le paiement a été refusé par votre émetteur de carte. Veuillez utiliser une autre méthode de paiement ou contacter votre banque.",
    INSUFFICIENT_FUNDS:
      "Votre compte n'a pas suffisamment de fonds pour compléter cette transaction. Veuillez ajouter des fonds à votre compte et réessayer.",

    // Forbidden (403)
    ACCESS_DENIED:
      "L'accès à cette ressource est strictement interdit pour votre type de compte.",
    INSUFFICIENT_PERMISSIONS:
      "Votre compte ne dispose pas des permissions suffisantes pour effectuer cette action.",
    FORBIDDEN_RESOURCE:
      "Vous n'êtes pas autorisé à accéder à cette ressource particulière.",
    ACCOUNT_ARCHIVED: "Ce compte a été archivé et n'est plus accessible.",
    ACCOUNT_UNVERIFIED:
      "Ce compte n'a pas été vérifié. Veuillez compléter le processus de vérification pour continuer.",
    ACTION_NOT_ALLOWED:
      "Cette action n'est pas permise dans le cadre de votre plan d'abonnement actuel.",
    CANNOT_MODIFY_FREE_PLAN:
      "Les modifications du plan d'abonnement gratuit ne sont pas autorisées.",
    CANNOT_DELETE_FREE_PLAN:
      "Le plan d'abonnement gratuit ne peut pas être supprimé du système.",
    PRODUCT_HAS_ACTIVE_SUBSCRIPTIONS:
      "Ce produit ne peut pas être modifié car il a des abonnements actifs associés.",
    PLAN_NOT_FOUND:
      "Le plan d'abonnement demandé n'a pas pu être trouvé dans notre système.",
    NOT_ENOUGH_CREDIT:
      "Votre compte n'a pas assez de crédit pour compléter cette opération.",
    NO_ACTIVE_SUBSCRIPTION:
      "Il n'y a pas d'abonnement actif associé à votre compte.",
    PAYOUT_CANCEL_NOT_ALLOWED:
      "Ce paiement ne peut pas être annulé car il a déjà été traité.",
    INSTANT_PAYOUT_DISABLED:
      "Les paiements instantanés sont actuellement désactivés pour votre compte.",
    BANK_ACCOUNT_NOT_ELIGIBLE:
      "Le compte bancaire fourni n'est pas éligible pour les paiements. Veuillez vérifier vos informations bancaires.",

    // Not Found (404)
    RESOURCE_NOT_FOUND:
      "La ressource demandée n'a pas pu être trouvée dans notre système.",
    NO_JOBS_FOUND:
      "Aucune tâche correspondant à vos critères n'a été trouvée dans nos enregistrements.",
    NO_DATA_FOUND:
      "Aucune donnée correspondant à votre demande n'a pu être récupérée depuis nos serveurs.",
    PROFILE_NOT_FOUND:
      "Le profil utilisateur que vous avez demandé n'a pas pu être localisé.",
    ACCOUNT_NOT_FOUND: "Aucun compte n'existe avec les identifiants fournis.",
    ACCOUNTS_NOT_FOUND:
      "Aucun compte correspondant à vos critères de recherche n'a été trouvé.",
    RECORDED_USERS_NOT_FOUND:
      "Aucun enregistrement d'utilisateur correspondant à votre requête n'a été trouvé dans notre base de données.",
    FILE_NOT_FOUND:
      "Le fichier demandé n'a pas pu être localisé dans notre système de stockage.",
    NOTIF_NOT_FOUND:
      "La notification spécifiée n'a pas pu être trouvée dans votre boîte de réception.",
    NO_SESSIONS_FOUND: "Aucune session active n'a été trouvée pour ce compte.",
    REFERRAL_CODE_NOT_FOUND:
      "Le code de parrainage que vous avez entré n'existe pas dans notre système.",
    JOB_NOT_FOUND:
      "La tâche spécifiée n'a pas pu être trouvée dans notre file d'attente.",
    PRODUCT_NOT_FOUND:
      "Le produit demandé n'est pas disponible dans notre catalogue.",
    PRODUCTS_NOT_FOUND:
      "Aucun produit correspondant à vos critères de recherche n'a été trouvé.",
    STRIPE_ACCOUNT_NOT_FOUND:
      "Le compte de paiement associé n'a pas pu être localisé.",

    // Locked (423)
    ACCOUNT_LOCKED:
      "Ce compte a été temporairement verrouillé en raison d'une activité suspecte. Veuillez contacter le support pour assistance.",

    // Too Many Requests (429)
    TOO_MANY_ATTEMPTS:
      "Trop de requêtes ont été faites depuis votre compte. Veuillez patienter avant de réessayer.",
    STRIPE_RATE_LIMIT:
      "Notre processeur de paiement reçoit actuellement trop de demandes. Veuillez réessayer votre transaction sous peu.",

    // Server Errors (5xx)
    SERVER_ERROR:
      "Nous avons rencontré une erreur inattendue lors du traitement de votre demande. Notre équipe a été notifiée.",
    FAILED_TO_GET_JOB:
      "Nous n'avons pas pu récupérer les détails de la tâche demandée en raison d'une erreur système.",
    EMAIL_SENDING_FAILED:
      "Nous avons rencontré une erreur lors de l'envoi de votre email. Veuillez réessayer plus tard.",
    GET_ALL_JOBS_ERROR:
      "Une erreur est survenue lors de la récupération des listes de tâches. Veuillez rafraîchir la page et réessayer.",
    FAILED_TO_START_JOB:
      "Le système n'a pas pu initialiser la tâche demandée. Veuillez réessayer ou contacter le support.",
    FAILED_TO_DELETE_JOB:
      "Nous n'avons pas pu supprimer la tâche spécifiée en raison d'une erreur système.",
    CREATE_JOB_ERROR:
      "Une erreur est survenue lors de la création de votre nouvelle tâche. Veuillez vérifier vos paramètres et réessayer.",
    INVITE_MEMBER_ERROR:
      "Nous avons rencontré une erreur lors du traitement de votre invitation. Veuillez réessayer plus tard.",
    REFERRAL_CODE_GENERATION_FAILED:
      "Le système n'a pas pu générer un code de parrainage pour votre compte. Veuillez réessayer.",
    CHECK_REFERRAL_CODE_ERROR:
      "Nous avons rencontré une erreur lors de la validation de votre code de parrainage. Veuillez réessayer plus tard.",
    PRODUCT_UPDATE_FAILED:
      "Une erreur est survenue lors de la mise à jour des informations sur le produit. Veuillez vérifier vos modifications et réessayer.",
    GET_ALL_PRODUCTS_ERROR:
      "Nous avons rencontré une erreur lors de la récupération du catalogue de produits. Veuillez réessayer plus tard.",
    CREATE_PRODUCT_ERROR:
      "Le système n'a pas pu créer votre nouveau produit. Veuillez vérifier vos informations et réessayer.",
    GET_PRODUCT_ERROR:
      "Une erreur est survenue lors de la récupération des détails du produit. Veuillez rafraîchir la page et réessayer.",
    DELETE_PRODUCT_ERROR:
      "Nous n'avons pas pu supprimer le produit spécifié en raison d'une erreur système.",
    STRIPE_UNKNOWN_ERROR:
      "Une erreur inattendue est survenue avec notre processeur de paiement. Veuillez réessayer plus tard.",
    STRIPE_OPERATION_FAILED:
      "L'opération de paiement n'a pas pu être complétée en raison d'une erreur système.",
    SESSION_RETRIEVAL_FAILED:
      "Nous avons rencontré une erreur lors de la récupération des détails de votre session. Veuillez réessayer.",
    PRODUCTS_RETRIEVAL_FAILED:
      "Une erreur est survenue lors du chargement des informations sur le produit. Veuillez rafraîchir la page.",
    PAYOUT_RETRIEVAL_FAILED:
      "Nous n'avons pas pu récupérer les détails de votre paiement en raison d'une erreur système.",
    SUBSCRIPTION_TRANSACTIONS_FAILED:
      "Une erreur est survenue lors du chargement de votre historique d'abonnement. Veuillez réessayer plus tard.",
    PAYOUTS_LISTING_FAILED:
      "Nous avons rencontré une erreur lors de la récupération de votre historique de paiements. Veuillez rafraîchir la page.",
    PAYOUT_CANCELLATION_FAILED:
      "Le système n'a pas pu annuler votre demande de paiement. Veuillez réessayer ou contacter le support.",
    PAYOUT_UPDATE_FAILED:
      "Nous n'avons pas pu mettre à jour vos informations de paiement en raison d'une erreur système.",
    STRIPE_DELETION_FAILED:
      "Le système n'a pas pu supprimer la ressource de paiement. Veuillez réessayer plus tard.",
    PAYOUT_TRANSACTIONS_FAILED:
      "Une erreur est survenue lors de la récupération de votre historique de transactions. Veuillez réessayer plus tard.",
    BALANCE_RETRIEVAL_FAILED:
      "Nous avons rencontré une erreur lors de la vérification du solde de votre compte. Veuillez réessayer.",
    INSTANT_PAYOUT_FAILED:
      "Votre demande de paiement instantané n'a pas pu être traitée en raison d'une erreur système.",
    CHECKOUT_SESSION_FAILED:
      "Nous n'avons pas pu créer une session de paiement pour votre transaction. Veuillez réessayer.",
    PAYOUT_CREATION_FAILED:
      "Le système n'a pas pu créer votre demande de paiement. Veuillez vérifier vos informations et réessayer.",
    LIST_SUBSCRIPTIONS_ERROR:
      "Une erreur est survenue lors de la récupération des détails de votre abonnement. Veuillez réessayer plus tard.",
    SUBSCRIPTION_UPDATE_ERROR:
      "Nous avons rencontré une erreur lors de la mise à jour de votre abonnement. Veuillez réessayer ou contacter le support.",
    SUBSCRIPTION_CREATION_ERROR:
      "Le système n'a pas pu créer votre nouvel abonnement. Veuillez vérifier vos informations et réessayer.",
    SUBSCRIPTION_CANCEL_ERROR:
      "Nous n'avons pas pu résilier votre abonnement en raison d'une erreur système. Veuillez réessayer ou contacter le support.",

    // Default
    UNKNOWN_ERROR:
      "Une erreur inattendue s'est produite. Notre équipe technique a été notifiée et enquêtera sur le problème.",
  },
};
