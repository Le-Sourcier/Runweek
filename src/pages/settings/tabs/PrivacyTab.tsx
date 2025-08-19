import { FC, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, AlertTriangle, Award, CheckCircle, Download, Eye, EyeOff, Info, Share2, Target, Trash2, Users, UserX, Utensils, XCircle } from "lucide-react";
import { ToggleSwitch } from "../../../components/ui/ToggleSwitch";
import Button from "../../../components/ui/Button";
import { useAppNavigation } from "../../../hooks/useAppNavigation";
import Card from "../../../components/ui/Card";
import { useUserContext } from "../../../hooks/useUser";

export const PrivacyTab: FC = () => {
  const { getCurrentLocation } = useAppNavigation();
  const { user, updateUserPreferences } = useUserContext();

  const initialSection = getCurrentLocation().queryParams.section as string;
  const [expandedSection, setExpandedSection] = useState<string | null>(initialSection || "");

  const [dataSharing, setDataSharing] = useState({
    enabled: user?.preferences?.dataSharing?.enabled || false,
    shareNutrition: user?.preferences?.dataSharing?.shareNutrition || false,
    shareActivities: user?.preferences?.dataSharing?.shareActivities || false,
    shareGoals: user?.preferences?.dataSharing?.shareGoals || false,
    shareAchievements: user?.preferences?.dataSharing?.shareAchievements || false,
    allowFriendRequests: user?.preferences?.dataSharing?.allowFriendRequests || false,
    showInSearch: user?.preferences?.dataSharing?.showInSearch || false,
  });

  useEffect(() => {
    if (initialSection) {
      setExpandedSection(initialSection);
    }
  }, [initialSection]);

  const handleShowInSearchChange = (showInSearch: boolean) => {
    const newDataSharing = { ...dataSharing, showInSearch };
    setDataSharing(newDataSharing);
    // @ts-ignore
    updateUserPreferences({
      ...user?.preferences,
      dataSharing: newDataSharing,
    });
  };

  const handleShareNutritionChange = (shareNutrition: boolean) => {
    const newDataSharing = { ...dataSharing, shareNutrition };
    setDataSharing(newDataSharing);
    // @ts-ignore
    updateUserPreferences({
      ...user?.preferences,
      dataSharing: newDataSharing,
    });
  };

  const handleShareGoalsChange = (shareGoals: boolean) => {
    const newDataSharing = { ...dataSharing, shareGoals };
    setDataSharing(newDataSharing);
    // @ts-ignore
    updateUserPreferences({
      ...user?.preferences,
      dataSharing: newDataSharing,
    });
  };

  const handleShareAchievementsChange = (shareAchievements: boolean) => {
    const newDataSharing = { ...dataSharing, shareAchievements };
    setDataSharing(newDataSharing);
    // @ts-ignore
    updateUserPreferences({
      ...user?.preferences,
      dataSharing: newDataSharing,
    });
  };

  const handleAllowFriendRequestsChange = (allowFriendRequests: boolean) => {
    const newDataSharing = { ...dataSharing, allowFriendRequests };
    setDataSharing(newDataSharing);
    // @ts-ignore
    updateUserPreferences({
      ...user?.preferences,
      dataSharing: newDataSharing,
    });
  };

  const handleShareActivitiesChange = (shareActivities: boolean) => {
    const newDataSharing = { ...dataSharing, shareActivities };
    setDataSharing(newDataSharing);
    //@ts-ignore
    updateUserPreferences({
      ...user?.preferences,
      dataSharing: newDataSharing,
    });
  }; 

  return <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
    {/* Data Sharing */}
    <Card title="Partage de données" className="bg-card text-card-foreground border-border">
      <div className="space-y-6">
        {/* Main data sharing toggle */}
        <div
          className={`p-4 rounded-lg border-2 transition-all ${expandedSection === 'dataSharing'
            ? 'border-primary bg-primary/5'
            : 'border-border'
            }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Share2 size={18} />
                Partage de données principal
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Activez cette option pour pouvoir partager vos données avec d'autres utilisateurs
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={dataSharing?.enabled || false}
                onChange={(e) => {
                  const newEnabled = e.target.checked;
                  const newDataSharing = {
                    ...dataSharing,
                    enabled: newEnabled,
                    // Si on désactive le partage principal, désactiver toutes les sous-options
                    ...(newEnabled ? {} : {
                      shareNutrition: false,
                      shareActivities: false,
                      shareGoals: false,
                      shareAchievements: false,
                      allowFriendRequests: false,
                      showInSearch: false,
                    })
                  };
                  setDataSharing(newDataSharing);

                  // Sauvegarder immédiatement
                  if (user && updateUserPreferences) {
                    // @ts-ignore
                    updateUserPreferences({
                      ...user.preferences,
                      dataSharing: newDataSharing
                    });
                  }
                }}
              />
              <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${dataSharing?.enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-200 ease-in-out ${dataSharing?.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
              </div>
            </label>
          </div>

          {!dataSharing.enabled && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Partage désactivé
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Vous ne pourrez pas partager de contenu, être trouvé par d'autres utilisateurs, ou accéder aux fonctionnalités sociales.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sub-options (only when main sharing is enabled) */}
        <AnimatePresence>
          {dataSharing.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 pl-4 border-l-2 border-primary/20"
            >
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div>
                  <h5 className="font-medium text-foreground flex items-center gap-2">
                    <Utensils size={16} />
                    Partage nutritionnel
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    Partagez vos repas et analyses nutritionnelles avec vos amis
                  </p>
                </div>
                <ToggleSwitch
                  checked={dataSharing.shareNutrition}
                  onChange={handleShareNutritionChange}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div>
                  <h5 className="font-medium text-foreground flex items-center gap-2">
                    <Activity size={16} />
                    Partage d'activités
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    Partagez vos courses et entraînements
                  </p>
                </div>
                <ToggleSwitch
                  checked={dataSharing.shareActivities}
                  onChange={handleShareActivitiesChange}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div>
                  <h5 className="font-medium text-foreground flex items-center gap-2">
                    <Target size={16} />
                    Partage d'objectifs
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    Partagez vos objectifs et progrès avec la communauté
                  </p>
                </div>
                <ToggleSwitch
                  checked={dataSharing.shareGoals}
                  onChange={handleShareGoalsChange}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div>
                  <h5 className="font-medium text-foreground flex items-center gap-2">
                    <Award size={16} />
                    Partage de réalisations
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    Partagez vos badges et accomplissements
                  </p>
                </div>
                <ToggleSwitch
                  checked={dataSharing.shareAchievements}
                  onChange={handleShareAchievementsChange}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div>
                  <h5 className="font-medium text-foreground flex items-center gap-2">
                    <Users size={16} />
                    Demandes d'amis
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    Autorisez les autres utilisateurs à vous envoyer des demandes d'amis
                  </p>
                </div>
                <ToggleSwitch
                  checked={dataSharing.allowFriendRequests}
                  onChange={handleAllowFriendRequestsChange}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div>
                  <h5 className="font-medium text-foreground flex items-center gap-2">
                    <Eye size={16} />
                    Visible dans la recherche
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    Permettez aux autres de vous trouver par recherche
                  </p>
                </div>
                <ToggleSwitch
                  checked={dataSharing.showInSearch}
                  onChange={handleShowInSearchChange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Privacy summary */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Info size={16} />
            Résumé de confidentialité
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              {dataSharing.enabled ? (
                <CheckCircle size={14} className="text-green-500" />
              ) : (
                <XCircle size={14} className="text-red-500" />
              )}
              <span className="text-muted-foreground">
                Partage {dataSharing.enabled ? 'activé' : 'désactivé'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {dataSharing.showInSearch ? (
                <Eye size={14} className="text-green-500" />
              ) : (
                <EyeOff size={14} className="text-gray-500" />
              )}
              <span className="text-muted-foreground">
                {dataSharing.showInSearch ? 'Trouvable' : 'Non trouvable'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {dataSharing.allowFriendRequests ? (
                <Users size={14} className="text-green-500" />
              ) : (
                <UserX size={14} className="text-gray-500" />
              )}
              <span className="text-muted-foreground">
                Demandes d'amis {dataSharing.allowFriendRequests ? 'autorisées' : 'bloquées'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {Object.values(dataSharing).filter(Boolean).length - 1}/6 types de contenu partagés
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>

    {/* Profile Visibility */}
    <Card title="Visibilité du profil" className="bg-card text-card-foreground border-border">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium text-foreground">Visibilité des activités</h4>
            <p className="text-sm text-muted-foreground">
              Qui peut voir vos activités de course
            </p>
          </div>
          <select
            value={user?.preferences?.activityVisibility || 'friends'}
            onChange={(e) =>
              //@ts-ignore
              updateUserPreferences({
                ...user?.preferences,
                activityVisibility: e.target.value as any,
              })
            }
            className="input w-32"
          >
            <option value="only_me">Moi seul</option>
            <option value="friends">Amis</option>
            <option value="public">Public</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium text-foreground">Visibilité du profil</h4>
            <p className="text-sm text-muted-foreground">
              Qui peut voir votre profil complet
            </p>
          </div>
          <select
            value={user?.preferences?.profileVisibility || 'friends'}
            onChange={(e) =>
              //@ts-ignore
              updateUserPreferences({
                ...user?.preferences,
                profileVisibility: e.target.value as any,
              })
            }
            className="input w-32"
          >
            <option value="only_me">Moi seul</option>
            <option value="friends">Amis</option>
            <option value="public">Public</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium text-foreground">Partage de localisation</h4>
            <p className="text-sm text-muted-foreground">
              Inclure la localisation dans vos activités partagées
            </p>
          </div>
          <ToggleSwitch
            checked={user?.preferences?.locationSharing || false}
            onChange={(value) =>
              //@ts-ignore
              updateUserPreferences({
                ...user?.preferences,
                locationSharing: value,
              })
            }
          />
        </div>
      </div>
    </Card>

    {/* Data Export & Deletion */}
    <Card title="Gestion des données" className="bg-card text-card-foreground border-border">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium text-foreground">Exporter mes données</h4>
            <p className="text-sm text-muted-foreground">
              Téléchargez une copie de toutes vos données
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            Exporter
          </Button>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium text-foreground">Supprimer mes données</h4>
            <p className="text-sm text-muted-foreground">
              Supprimez définitivement toutes vos données
            </p>
          </div>
          <Button variant="destructive" className="flex items-center gap-2">
            <Trash2 size={16} />
            Supprimer
          </Button>
        </div>
      </div>
    </Card>
  </motion.div>
};