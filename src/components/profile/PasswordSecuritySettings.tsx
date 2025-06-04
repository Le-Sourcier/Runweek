import React, { useState } from 'react';
import Card from '../ui/Card';
import { ArrowLeft, ShieldCheck, LockKeyhole, Loader2 } from 'lucide-react'; // Added Loader2
import { useUser } from '../../context/UserContext'; // Import useUser
import { toast } from 'react-toastify';

interface PasswordSecuritySettingsProps {
  onBack: () => void;
}

const PasswordSecuritySettings: React.FC<PasswordSecuritySettingsProps> = ({ onBack }) => {
  const { user, changePassword, updateUserPreferences } = useUser(); // Add user and updateUserPreferences
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  // const [passwordError, setPasswordError] = useState<string | null>(null); // Replaced by toast
  // const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null); // Replaced by toast
  const [isChangingPassword, setIsChangingPassword] = useState(false); // Loading state

  const isTwoFactorEnabled = user?.preferences?.isTwoFactorEnabled || false;

  const handleChangePassword = async (e: React.FormEvent) => { // Made async
    e.preventDefault();
    // setPasswordError(null); // Replaced by toast
    // setPasswordSuccess(null); // Replaced by toast
    setIsChangingPassword(true);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('All password fields are required.');
      setIsChangingPassword(false);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New password and confirmation do not match.');
      setIsChangingPassword(false);
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      setIsChangingPassword(false);
      return;
    }

    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.success) {
        toast.success(result.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggleTwoFactor = () => {
    if (user && updateUserPreferences) {
      const new2FAStatus = !isTwoFactorEnabled; // Calculate new status based on context value
      updateUserPreferences({
        ...(user.preferences || {}),
        isTwoFactorEnabled: new2FAStatus,
      });
      // Optionally, add a console.log or a success message for feedback,
      // though the UI will update based on the context change.
      console.log('2FA preference Toggled to:', new2FAStatus);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="btn btn-ghost mb-4 text-sm hover:bg-muted" /* transition-colors is part of .btn's transition-all */
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Account Settings
      </button>

      <Card title="Change Password" className="bg-card text-card-foreground border-border">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input bg-background text-foreground border-border focus:ring-primary focus:border-primary transition-colors"
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input bg-background text-foreground border-border focus:ring-primary focus:border-primary transition-colors"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-foreground mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="input bg-background text-foreground border-border focus:ring-primary focus:border-primary transition-colors"
              required
            />
          </div>

          {/* Error/Success messages are now handled by toasts */}

          <div className="pt-2">
            <button
              type="submit"
              className="btn btn-primary w-full sm:w-auto" /* Inherits hover/active scale from .btn */
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <LockKeyhole size={16} className="mr-2" />
              )}
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="Two-Factor Authentication (2FA)" className="bg-card text-card-foreground border-border">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-foreground">Status</h4>
            <p className={`text-sm ${isTwoFactorEnabled ? 'text-green-500 dark:text-green-400' : 'text-muted-foreground'}`}>
              {isTwoFactorEnabled ? 'Enabled' : 'Not Enabled'}
            </p>
          </div>
          <button
            onClick={handleToggleTwoFactor}
            className={`btn ${isTwoFactorEnabled ? 'btn-outline border-destructive text-destructive hover:bg-destructive/10' : 'btn-primary'}`} /* Inherits hover/active scale from .btn */
          >
            <ShieldCheck size={16} className="mr-2" />
            {isTwoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>
        {isTwoFactorEnabled && (
          <p className="mt-3 text-sm text-muted-foreground">
            Two-factor authentication is currently active on your account.
          </p>
        )}
         {!isTwoFactorEnabled && (
          <p className="mt-3 text-sm text-muted-foreground">
            Add an extra layer of security to your account by enabling two-factor authentication.
          </p>
        )}
      </Card>

      <Card title="Active Sessions" className="bg-card text-card-foreground border-border">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Management of active sessions is not available at the moment.
          </p>
          <p className="text-sm text-muted-foreground">
            For security, always make sure to log out from devices you no longer use.
          </p>
          {/* Optional: Add a button that links to a hypothetical help page or just a disabled button */}
          {/*
          <button className="btn btn-outline mt-2" disabled>
            Learn More
          </button>
          */}
        </div>
      </Card>
    </div>
  );
};

export default PasswordSecuritySettings;
