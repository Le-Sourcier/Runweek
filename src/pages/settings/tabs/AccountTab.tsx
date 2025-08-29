import { Activity, AlertTriangle, Key, Lock, LogOut, Save, Shield, UserX } from "lucide-react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { ToggleSwitch } from "../../../components/ui/ToggleSwitch";
import { FC, useEffect, useState } from "react";
import { useUserContext } from "../../../hooks/useUser";
import Input from "../../../components/ui/Input";
import { useMessages } from "../../../hooks/useMessage";
import { MessageCode } from "../../../types/message";
import { extractErrorMessage } from "../../../utils/error-handler";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export const AccountTab: FC = () => {

  const { user, logout, updateUserProfile, updatePassword } = useUserContext();
  const { showMessage } = useMessages();
  const [_showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [accountForm, setAccountForm] = useState({
    firstName: user?.fname || '',
    lastName: user?.lname || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setAccountForm({
      firstName: user.fname || '',
      lastName: user.lname || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
    });
  }, [user]);

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      showMessage("PASSWORD_CHANGED");
    } catch (error) {
      console.log("error:", error);
      showMessage(extractErrorMessage(error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountUpdate = async () => {
    setIsLoading(true);
    try {
      await updateUserProfile({
        fname: accountForm.firstName,
        lname: accountForm.lastName,
        email: accountForm.email,
        phone: accountForm.phone,
        bio: accountForm.bio,
      });

      showMessage("USER_UPDATED");
    } catch (error) {
      console.log("error:", error);
      showMessage(extractErrorMessage(error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-5">
        {/* Personal Information */}
        <Card title="Informations personnelles" className="bg-card text-card-foreground border-border">
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              {(user!.image) ? (
                <img
                  src={user!.image}
                  alt={user!.fname + " " + user!.lname}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-sm bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-semibold">
                    {user!.fname?.charAt(0)?.toUpperCase() || ""}{user!.lname?.charAt(0)?.toUpperCase() || ""}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-foreground text-lg">{user?.fname} {user?.lname}</h3>
                <p className="text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-muted-foreground">Membre depuis {new Date(user?.createdAt || '').toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Prénom</label>
                <Input
                  value={accountForm.firstName}
                  onChange={(e) => setAccountForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nom</label>
                <Input
                  value={accountForm.lastName}
                  onChange={(e) => setAccountForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                value={accountForm.email}
                onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Téléphone</label>
              <Input
                type="tel"
                value={accountForm.phone}
                onChange={(e) => setAccountForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
              <textarea
                value={accountForm.bio}
                onChange={(e) => setAccountForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Parlez-nous de vous et de vos objectifs de course..."
                className="input w-full h-24 resize-none"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">{accountForm.bio.length}/200 caractères</p>
            </div>

            <Button onClick={handleAccountUpdate} isLoading={isLoading} className="w-full md:w-auto">
              {!isLoading && <Save size={16} className="mr-2" />}
              {isLoading ? "Sauvegarde en cours ..." : "Sauvegarder les modifications"}
            </Button>
          </div>
        </Card>

        {/* Security Settings */}
        <Card title="Sécurité" className="bg-card text-card-foreground border-border">
          <div className="space-y-6">
            {/* Password Change */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Key size={18} />
                Changer le mot de passe
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Mot de passe actuel</label>
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Votre mot de passe actuel"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nouveau mot de passe</label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Nouveau mot de passe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Confirmer le mot de passe</label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirmer le mot de passe"
                    />
                  </div>
                </div>
                <Button onClick={handlePasswordChange} isLoading={isLoading} variant="outline">
                  <Lock size={16} className="mr-2" />
                  Changer le mot de passe
                </Button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="border-t border-border pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Shield size={18} />
                    Authentification à deux facteurs
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ajoutez une couche de sécurité supplémentaire à votre compte
                  </p>
                </div>
                <ToggleSwitch
                  checked={user?.preferences?.isTwoFactorEnabled || false}
                  onChange={(value) =>
                    // @ts-ignore
                    updateUserPreferences({
                      ...user?.preferences,
                      isTwoFactorEnabled: value,
                    })
                  }
                />
              </div>
            </div>

            {/* Session Management */}
            <div className="border-t border-border pt-6">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity size={18} />
                Sessions actives
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-foreground">Session actuelle</p>
                      <p className="text-sm text-muted-foreground">Chrome sur Windows • Paris, France</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">Maintenant</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div>
                      <p className="font-medium text-foreground">iPhone App</p>
                      <p className="text-sm text-muted-foreground">iOS • Paris, France</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Il y a 2h</span>
                    <Button variant="outline" onClick={logout}>Déconnecter</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card title="Zone de danger" className="bg-card text-card-foreground border-destructive">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <AlertTriangle size={20} className="text-destructive mt-0.5" />
              <div>
                <h4 className="font-semibold text-destructive">Supprimer le compte</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2"
                >
                  <UserX size={16} />
                  Supprimer mon compte
                </Button>
              </div>
              <Button variant="outline" onClick={logout} className="flex items-center gap-2">
                <LogOut size={16} />
                Se déconnecter
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </motion.div >
  );
};