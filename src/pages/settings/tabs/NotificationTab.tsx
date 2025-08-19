import { FC, useEffect, useState } from "react"
import Card from "../../../components/ui/Card"
import { Mail, Save } from "lucide-react"
import { ToggleSwitch } from "../../../components/ui/ToggleSwitch"
import { Smartphone } from "lucide-react"
import Button from "../../../components/ui/Button"
import { useUserContext } from "../../../hooks/useUser"
import { toast } from "react-toastify"
import { motion } from "framer-motion"

export const NotificationTab: FC = () => {

  const { user, updateUserPreferences } = useUserContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    email: user!.preferences?.notificationSettings?.email || true,
    push: user!.preferences?.notificationSettings?.push || true,
    achievements: user!.preferences?.notificationSettings?.achievements || true,
    reminders: user!.preferences?.notificationSettings?.reminders || true,
    updates: user!.preferences?.notificationSettings?.updates || false,
    weeklyReport: true,
    socialActivity: true,
    coachTips: true,
  });

  useEffect(() => {
    if(!user) return;
    setNotificationForm({
      email: user.preferences?.notificationSettings?.email || true,
      push: user.preferences?.notificationSettings?.push || true,
      achievements: user.preferences?.notificationSettings?.achievements || true,
      reminders: user.preferences?.notificationSettings?.reminders || true,
      updates: user.preferences?.notificationSettings?.updates || false,
      weeklyReport: user.preferences?.notificationSettings?.weeklyReport || true,
      socialActivity: user.preferences?.notificationSettings?.socialActivity || true,
      coachTips: user.preferences?.notificationSettings?.coachTips || true,
    });
  }, [user]);

  const handleNotificationUpdate = () => {
    setIsLoading(true);
    // @ts-ignore
    updateUserPreferences({
      ...user!.preferences,
      notificationSettings: notificationForm,
    });
    toast.success('Préférences de notifications mises à jour');
    setIsLoading(false);
  };


  return <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
    <Card title="Préférences de notifications" className="bg-card text-card-foreground border-border">
      <div className="space-y-6">
        {/* Email Notifications */}
        <div>
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Mail size={18} />
            Notifications par email
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Notifications générales</p>
                <p className="text-sm text-muted-foreground">Mises à jour importantes et alertes de sécurité</p>
              </div>
              <ToggleSwitch
                checked={notificationForm.email}
                onChange={(value) => setNotificationForm(prev => ({ ...prev, email: value }))}
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Rapport hebdomadaire</p>
                <p className="text-sm text-muted-foreground">Résumé de vos activités et progrès</p>
              </div>
              <ToggleSwitch
                checked={notificationForm.weeklyReport}
                onChange={(value) => setNotificationForm(prev => ({ ...prev, weeklyReport: value }))}
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Conseils du coach</p>
                <p className="text-sm text-muted-foreground">Recommandations personnalisées de l'IA</p>
              </div>
              <ToggleSwitch
                checked={notificationForm.coachTips}
                onChange={(value) => setNotificationForm(prev => ({ ...prev, coachTips: value }))}
              />
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="border-t border-border pt-6">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Smartphone size={18} />
            Notifications push
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Notifications push</p>
                <p className="text-sm text-muted-foreground">Alertes en temps réel sur votre appareil</p>
              </div>
              <ToggleSwitch
                checked={notificationForm.push}
                onChange={(value) => setNotificationForm(prev => ({ ...prev, push: value }))}
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Réalisations</p>
                <p className="text-sm text-muted-foreground">Nouveaux badges et accomplissements</p>
              </div>
              <ToggleSwitch
                checked={notificationForm.achievements}
                onChange={(value) => setNotificationForm(prev => ({ ...prev, achievements: value }))}
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Rappels d'entraînement</p>
                <p className="text-sm text-muted-foreground">Rappels pour vos courses programmées</p>
              </div>
              <ToggleSwitch
                checked={notificationForm.reminders}
                onChange={(value) => setNotificationForm(prev => ({ ...prev, reminders: value }))}
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Activité sociale</p>
                <p className="text-sm text-muted-foreground">Likes, commentaires et nouvelles connexions</p>
              </div>
              <ToggleSwitch
                checked={notificationForm.socialActivity}
                onChange={(value) => setNotificationForm(prev => ({ ...prev, socialActivity: value }))}
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleNotificationUpdate} isLoading={isLoading} className="w-full md:w-auto">
            <Save size={16} className="mr-2" />
            Sauvegarder les préférences
          </Button>
        </div>
      </div>
    </Card>
  </motion.div>
}
