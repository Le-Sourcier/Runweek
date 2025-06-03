import React, { useState } from 'react';
import Card from '../ui/Card'; // Assuming Card component can be used here
import { ArrowLeft, ShieldCheck, LockKeyhole } from 'lucide-react'; // Using new LockKeyhole

interface PasswordSecuritySettingsProps {
  onBack: () => void;
}

const PasswordSecuritySettings: React.FC<PasswordSecuritySettingsProps> = ({ onBack }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // 2FA state - simple placeholder
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    // Placeholder for actual password change logic
    console.log('Attempting to change password:', { currentPassword, newPassword });
    setPasswordSuccess('Password changed successfully! (Placeholder)');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    // In a real app, you would call an API here.
  };

  const handleToggleTwoFactor = () => {
    // Placeholder for 2FA logic
    setIsTwoFactorEnabled(!isTwoFactorEnabled);
    console.log('2FA Toggled:', !isTwoFactorEnabled);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="btn btn-ghost mb-4 text-sm hover:bg-muted"
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
              className="input bg-background text-foreground border-border focus:ring-primary focus:border-primary"
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
              className="input bg-background text-foreground border-border focus:ring-primary focus:border-primary"
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
              className="input bg-background text-foreground border-border focus:ring-primary focus:border-primary"
              required
            />
          </div>

          {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-green-500 dark:text-green-400">{passwordSuccess}</p>} {/* Consider a theme color for success */}


          <div className="pt-2">
            <button type="submit" className="btn btn-primary w-full sm:w-auto">
              <LockKeyhole size={16} className="mr-2" />
              Change Password
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
            className={`btn ${isTwoFactorEnabled ? 'btn-outline border-destructive text-destructive hover:bg-destructive/10' : 'btn-primary'}`}
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
    </div>
  );
};

export default PasswordSecuritySettings;
